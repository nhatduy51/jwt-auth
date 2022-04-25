const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

let refreshTokens = [];

const authController = {

    //register
    registerUser: async (req, res) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            //create new user
            const newUser = await new User({
                username: req.body.username,
                email: req.body.email,
                password: hashed
            })

            const user = await newUser.save();
            res.status(200).json(user);

        } catch (error) {
            res.status(500).json(error);
        }
    },

    //genarate access token
    genarateAccessToken: (user) => {
        return jwt.sign({
            id: user.id,
            admin: user.admin,
        },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: "30s" }
        );
    },
    //genarate referesh token
    genarateRefereshToken: (user) => {
        return jwt.sign({
            id: user.id,
            admin: user.admin,
        },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: "365d" }
        );
    },

    //login
    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({ username: req.body.username });
            if (!user) {
                res.status(404).json("wrong username");
            }
            const validatePassword = await bcrypt.compare(
                req.body.password,
                user.password
            );

            if (!validatePassword) {
                res.status(404).json("wrong username");
            }

            if (user && validatePassword) {

                //create token
                const accesstoken = authController.genarateAccessToken(user);
                //create refresh token
                const refreshToken = authController.genarateRefereshToken(user);

                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: "/",
                    sameSite: "strict",
                })
                const {password, ...others} = user._doc;

                res.status(200).json({ ...others, accesstoken});

            }

        } catch (error) {
            res.status(500).json(error)
        }
    },
    requestRefreshToken: async(req, res) => {
        const refreshToken = req.cookies.refreshToken;

        if(!refreshToken) return res.status(401).json("you are not authenticated");

        if(!refreshTokens.includes(refreshToken)) {
            res.status(403).json("refresh token is not valid");
        }
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
            if(err) {
                console.log(err)
            }
            refreshTokens = refreshTokens.filter( token => token !== refreshToken);
            
            // create new accessToken, refereshToken
            const newAccessToken = authController.genarateAccessToken(user);
            const newRefreshToken = authController.genarateRefereshToken(user);

            refreshTokens.push(newRefreshToken);

            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict",
            })
            res.status(200).json({accesstoken: newAccessToken});
        })
    }
}

module.exports = authController;