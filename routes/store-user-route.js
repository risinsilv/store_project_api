const express = require('express');
const router = express.Router();
const {authenticateToken} = require('../middleware/auth');

const  {
   placeOrder,
   getOrders,
   getAllProducts,
   getCategories,
   getProductNames,


} = require("../controllers/store-user-controller")

router.post('/placeOrder',authenticateToken,placeOrder);
router.post('/getOrders',authenticateToken,getOrders);
router.get('/getProducts' ,authenticateToken,getAllProducts);
router.get('/getCategories' ,authenticateToken,getCategories);
router.get('/getProductNames' ,authenticateToken,getProductNames);


module.exports = router;