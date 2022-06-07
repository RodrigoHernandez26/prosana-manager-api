const router = require('express').Router();
import { login } from "../controllers/auth.controller";

router.post('/login', login)

module.exports = router;