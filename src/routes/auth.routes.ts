const router = require('express').Router();
import { login, logout } from "../controllers/auth.controller";

router.post('/login', login)
router.post('/logout', logout)

module.exports = router;