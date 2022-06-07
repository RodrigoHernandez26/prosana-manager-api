const router = require('express').Router();
import {
    getOrder,
    getAllOrders,
    createOrder,
    updateOrder,
    deleteOrder
} from "../controllers/order.controller";
import { verifyToken } from "../middlewares/auth.middleware";

router.get('/order/:id', verifyToken, getOrder)
router.get('/all/order', verifyToken, getAllOrders)
router.post('/order', verifyToken, createOrder)
router.put('/order', verifyToken, updateOrder)
router.delete('/order', verifyToken, deleteOrder)

module.exports = router;