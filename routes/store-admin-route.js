const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');



// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Initialize Multer
const upload = multer({ storage: storage }); 

const  {
    setProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/store-admin-controller")

router.post('/setProduct', authenticateToken, authorizeAdmin, upload.single('image'), setProduct);
router.put('/updateProduct', authenticateToken,upload.single('image'), updateProduct);
router.delete('/deleteProduct', authenticateToken, authorizeAdmin, deleteProduct);


module.exports = router;