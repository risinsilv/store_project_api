const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const placeOrder = async (req, res) => {
    const { userID, orderItems, status, totalAmount } = req.body;

    try {
        await connection.promise().beginTransaction(); // Use promise-based transaction
        // Insert order
        const [orderResult] = await connection.promise().query(
            'INSERT INTO Orders (userID, totalAmount, status) VALUES (?, ?, ?)',
            [userID, totalAmount, status]
        );
        const orderID = orderResult.insertId; // Get the ID of the newly inserted order

        // Insert each order item into the order_items table
        for (const item of orderItems) {
            await connection.promise().query(
                'INSERT INTO OrderItems (orderID, productID, quantity, price) VALUES (?, ?, ?, ?)', 
                [orderID, item.id, item.quantity, ((item.price * item.quantity).toFixed(2))]
            );

            await connection.promise().query(
                'UPDATE Products SET stock = stock - ? WHERE ID = ?',
                [item.quantity, item.id]
            );
        }
        await connection.promise().commit(); // Commit the transaction
        res.json({ message: 'Order placed successfully' });
    } catch (err) {
        await connection.promise().rollback(); // Rollback the transaction in case of error
        console.error(err);
        res.status(500).send('Error placing order');
    }
};

const getOrders = async (req, res) => {
    const userID = req.body.userID; // Get the user ID from the JWT token

    try {
        // Start a transaction
        await connection.promise().beginTransaction();

        // Fetch all orders for the user
        const [orders] = await connection.promise().query(
            'SELECT * FROM Orders WHERE userID = ?',
            [userID]
        );

        // If no orders are found, return an empty array
        if (orders.length === 0) {
            return res.json([]);
        }

        // For each order, fetch the associated products
        const ordersWithProducts = [];
        for (const order of orders) {
            const [productIDs] = await connection.promise().query(
                'SELECT productID,quantity FROM OrderItems WHERE orderID = ?',
                [order.ID]
            );

            const products = [];
            for (const productId of productIDs) {
                const [product] = await connection.promise().query(
                    'SELECT * FROM Products WHERE ID = ?',
                    [productId.productID]
                );
                products.push({
                    ...product[0],
                    Quantity: productId.quantity,
                });
            }

            // Add the order and its products to the result array
            ordersWithProducts.push({
                orderID: order.ID,
                totalAmount: order.totalAmount,
                status: order.status,
                createdAt: order.created_at,
                products: products,
            });
        }

        // Commit the transaction
        await connection.promise().commit();

        // Send the result
        res.json(ordersWithProducts);
    } catch (err) {
        // Rollback the transaction in case of error
        await connection.promise().rollback();
        console.error(err);
        res.status(500).send('Error retrieving orders');
    }
};
// const getAllProducts = async (req, res) => {
//     try {
//         const [products] = await connection.promise().query('SELECT * FROM Products');
//         res.json(products);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Error retrieving products');
//     }
// };
const getAllProducts = async (req, res) => {
    try {
        const [products] = await connection.promise().query('SELECT * FROM Products');

        const updatedProducts = products.map(product => {
            return {
                ...product,
                image: `${req.protocol}://${req.get('host')}${product.image}`
            };
        });

        res.json(updatedProducts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving products');
    }
};
const getCategories = async (req, res) => {
    try {
        // Fetch all categories from the Categories table
        const [categories] = await connection.promise().query('SELECT DISTINCT category FROM Products');

        // Send the categories as a JSON response
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving categories');
    }
};
const getProductNames = async (req, res) => {
    try {
        // Fetch all categories from the Categories table
        const [names] = await connection.promise().query('SELECT name FROM Products');

        // Send the categories as a JSON response
        res.json(names);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving product names');
    }
};



module.exports = {
    placeOrder,
    getOrders,
    getAllProducts,
    getCategories,
    getProductNames
}