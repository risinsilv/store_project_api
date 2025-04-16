const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


const setProduct = async (req, res) => {
    try{
        const { name,price,description,stock,image,category} = req.body;
        const [result] = await connection.promise().query(
            'insett into Products (name,price,description,stock,image,category) values (?,?,?,?,?,?)',
            [name,price,description,stock,image,category]
        );
        if (result.affectedRows > 0) {
            res.json({ message: 'Product updated successfully' });
        } else {
            res.status(404).send('Product not found');
        }
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error updating product');
    }
}
const updateProduct = async (req, res) => {
    try{
        const { ID,name,price,description,stock,image,category} = req.body;
        const [result] = await connection.promise().query(
            'UPDATE Products SET name=?,price=?,description=?,stock=?,image=?,category=? WHERE ID=?',
            [name,price,description,stock,image,category,ID]
        );
        if (result.affectedRows > 0) {
            res.json({ message: 'Product updated successfully' });
        } else {
            res.status(404).send('Product not found');
        }
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error updating product');
    }
}

const deleteProduct = async (req, res) => {
    try{
        const { ID } = req.body;
        const [result] = await connection.promise().query(
            'DELETE FROM Products WHERE ID=?',
            [ID]
        );
        if (result.affectedRows > 0) {
            res.json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).send('Product not found');
        }
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error deleting product');
    }
}

