const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const placeOrder = async (req, res) => {
    const { userID, orderItems, status } = req.body;

    try {
        await connection.beginTransaction();
        // Insert order
        const [orderResult] = await connection.promise().query(
            'INSERT INTO Orders (userID, totalAmount, status) VALUES (?, ?, ?)',
            [userID, calculateTotal(orderItems), status]
        );
        const orderID = orderResult.insertId; // Get the ID of the newly inserted order

        // Insert each order item into the order_items table
        for (const item of orderItems) {
            await connection.promise().query(
                'INSERT INTO OrderItems (orderID, productID, quantity, price) VALUES (?, ?, ?, ?)', 
                [orderID, item.productID, item.quantity, item.price]
                    
            );

            await connection.promise().query(
                'UPDATE Products SET stock = stock - ? WHERE ID = ?',
                [item.quantity, item.productID]
            );
    }
        await connection.commit(); // Commit the transaction
        res.json({ message: 'Order placed successfully' });
    } catch (err) {
        await connection.rollback(); // Rollback the transaction in case of error
        console.error(err);
        res.status(500).send('Error placing order');
    } finally {
        await connection.end(); // Close the connection
     
    }
};


const calculateTotal = (orderItems) => {
    return orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
}

const getOrders = async (req, res) => {
    const userID = req.body.userID; // Get the user ID from the JWT token

    try {
        
        await connection.beginTransaction();

        // Fetch all orders for the user
        const [orders] = await connection.promise().query(
            'SELECT * FROM Orders WHERE userID = ? ',
            [userID]
        );

        // If no orders are found, return an empty array
        if (orders.length === 0) {
            return res.json([]);
        }

        // For each order, fetch the associated products
        const ordersWithProducts = [];
        const products =   []
        for (const order of orders) {
            const [productIDs] = await connection.promise().query(
                `SELECT productID FROM OrderItems WHERE  orderID = ?`,
                [order.ID]
            );
            for (const productId of productIDs) {
                const [product] = await connection.promise().query(
                    `SELECT * FROM Products WHERE  ID = ?`,
                    [productId.productID]
                );
    
                 // Add the order and its products to the result array
                products.push(product)
            }

             // Add the order and its products to the result array
            ordersWithProducts.push({
                orderID: order.ID,
                totalAmount: order.totalAmount,
                status: order.status,
                createdAt: order.createdAt,
                products: products
            });
        }
        await connection.commit(); // Commit the transaction
        // Send the result
        res.json(ordersWithProducts);
    } catch (err) {
        await connection.rollback(); // Rollback the transaction in case of error
        console.error(err);
        res.status(500).send('Error retrieving orders');
    }finally {
        await connection.end(); // Close the connection
    }
};

const getAllProducts = async (req, res) => {
    try {
        const [products] = await connection.promise().query('SELECT * FROM Products');
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving products');
    }
};


module.exports = {
    placeOrder,
    getOrders,
    getAllProducts
}