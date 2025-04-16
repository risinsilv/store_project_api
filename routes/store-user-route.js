const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const  {
   placeOrder,
   getOrders,
   getAllProducts


} = require("../controllers/store-user-controller")

router.post('/placeOrder',authMiddleware ,placeOrder);
router.get('/getOrders',authMiddleware ,getOrders);
router.get('/getProducts',authMiddleware ,getAllProducts);


module.exports = router;