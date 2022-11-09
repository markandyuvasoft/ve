import  express  from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv'
import cors from "cors";
import router from "./routes/employ.js"
import userrouter from "./routes/user.js"
import authrouter from "./routes/auth.js"
import adminrouter from "./routes/admin.js"
import *as path from 'path'

dotenv.config()
const app=express();


// midleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cors())

// routes
app.use("/",router)
app.use("/",userrouter)
app.use("/",authrouter)
app.use("/",adminrouter)


app.get('/', (req, res) => res.send('Home Page Route'));

const PORT=process.env.PORT||3000
// connect mongo db atlas
mongoose.connect(process.env.MONGO_URL,{usenewurlparser:true,}).then(()=>{
    console.log("connected to mongodb atlas")
}).catch(error=>{
console.log("something wrong")
})

// server port
app.listen(PORT,()=>{
    console.log("server started at port http://localhost:3000");
})