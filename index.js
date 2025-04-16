const express = require('express');
const userLoginRoute = require("./routes/store-user-login-route")
const userRoute = require("./routes/store-user-route")
const app = express()
const port = 3000


app.use(express.json())
app.use("/store/user/login",userLoginRoute)
app.use ("/store/user",userRoute)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
