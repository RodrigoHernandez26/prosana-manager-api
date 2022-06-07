const router = require('express').Router();
import {
    getClient,
    getAllClients,
    createClient,
    updateClient,
    deleteClient
} from "../controllers/client.controller";
import { verifyToken } from "../middlewares/auth.middleware";

router.get('/client/:id', verifyToken, getClient)
router.get('/all/client', verifyToken, getAllClients)
router.post('/client', verifyToken, createClient)
router.put('/client', verifyToken, updateClient)
router.delete('/client', verifyToken, deleteClient)

module.exports = router;