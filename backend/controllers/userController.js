const User = require("../models/user");


const userController = {

    //get all user
    getAllUser: async (req, res) => {
        try {
            const users = await User.find();

            return res.status(200).json(users);
        } catch (error) {
            res.status(500).json(error)
        }
    },

    //delete user
    deleteUser: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            res.status(200).json("delete User successfully");
            
        } catch (error) {
            res.status(500).json(error);
        }
    }
}
module.exports = userController;