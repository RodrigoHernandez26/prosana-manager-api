const router = require('express').Router();
import { authUser, login, logout } from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/auth.middleware";

router.post('/login', login)
router.post('/auth', verifyToken, authUser)
router.post('/logout', logout)

module.exports = router;