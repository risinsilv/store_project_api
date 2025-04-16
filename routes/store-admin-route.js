const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const  {
    setProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/store-admin-controller")

router.post('/setProduct',authMiddleware ,setProduct);
router.put('/updateProduct',authMiddleware ,updateProduct);
router.delete('/deleteProduct',authMiddleware ,deleteProduct);


module.exports = router;