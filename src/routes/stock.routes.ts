const router = require('express').Router();
import {
    getStock,
    getAllStock,
    createStock,
    updateStock,
    deleteStock
} from "../controllers/stock.controller";
import { verifyToken } from "../middlewares/auth.middleware";

router.get('/stock/:id', verifyToken, getStock)
router.get('/all/stock', verifyToken, getAllStock)
router.post('/stock', verifyToken, createStock)
router.put('/stock', verifyToken, updateStock)
router.delete('/stock', verifyToken, deleteStock)

module.exports = router;