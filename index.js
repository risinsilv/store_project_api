const express = require('express');
const userLoginRoute = require("./routes/store-user-login-route")
const userRoute = require("./routes/store-user-route")
const adminRoute = require("./routes/store-admin-route")
const app = express()
const cors = require('cors')
const port = 3000
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors())    
app.use(express.json())
app.use("/store/user/login",userLoginRoute)
app.use ("/store/user",userRoute)
app.use("/store/user/admin",adminRoute)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
