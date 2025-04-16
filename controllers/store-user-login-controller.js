const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const saltRounds = 10;

require('dotenv').config();
const jwt = require('jsonwebtoken');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


  const register = (req,res)=>{
    // Hash the password
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
       if (err) {
           console.error(err);
           return res.status(500).send('Error encrypting password');
       }

       // Insert the user into the database
       connection.query(
           'INSERT INTO users (name,email,password) VALUES (?,?,?)',
           [req.body.name,req.body.email, hash],
           (err, result) => {
               if (err) {
                   console.error(err);
                   return res.status(500).send('Error registering user');
               }
               res.send('User registered successfully');
           }
       );
   });
}

const login = (req, res) => {
    connection.query('SELECT * FROM users WHERE email = ?', [req.body.email], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database query error');
        }
        if (result.length === 0) {
            return res.status(401).send('Invalid email or password');
        }
        const user = result[0];
        bcrypt.compare(req.body.password, user.password).then((isMatch) => {
            if (isMatch) {
                // Generate a JWT
                const token = jwt.sign(
                    { id: user.id, email: user.email }, // Payload
                    process.env.JWT_SECRET,            // Secret key
                    { expiresIn: '1h' }                // Token expiration
                );
                res.json({ message: 'Login successful', token,userID: user.ID });
            } else {
                res.status(401).send('Invalid email or password');
            }
        }).catch((err) => {
            console.error(err);
            res.status(500).send('Error comparing passwords');
        });
    });
};

module.exports = {
    login,
    register
    
}
