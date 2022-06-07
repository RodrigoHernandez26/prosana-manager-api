const router = require('express').Router();
import {
    getUserInfo,
    getAllUsers,
    createUser,
    updateUser,
    updateUserPermissions,
    deleteUser
} from "../controllers/user.controller";
import { verifyToken } from "../middlewares/auth.middleware";

router.get('/user', verifyToken, getUserInfo)
router.get('/all/user', verifyToken, getAllUsers)
router.post('/user', createUser)
router.put('/user', verifyToken, updateUser)
router.put('/user/permissions', verifyToken, updateUserPermissions)
router.delete('/user', verifyToken, deleteUser)

module.exports = router;