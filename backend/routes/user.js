const middlewareController = require("../controllers/middlewareController");
const userController = require("../controllers/userController");

const router = require("express").Router();

//Get all user
router.get('/', middlewareController.verifyToken, userController.getAllUser);
//delete user
router.delete('/:id', middlewareController.verifyTokenAndAdminAuth, userController.deleteUser);


module.exports = router;