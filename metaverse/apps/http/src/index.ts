import express from "express";
import { router } from "./routes/v1";
import { adminRouter } from "./routes/v1/admin";
import { spaceRouter } from "./routes/v1/space";
import { userRouter } from "./routes/v1/user";

const  app = express()

app.use("/api/v1" , router)
app.use('/api/v1/user', userRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/space', spaceRouter)

app.listen(3000 , ()=>{
    console.log("Server is up")
})