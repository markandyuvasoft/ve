import express from "express";
import User from "../models/user.js"
import bcrypt from 'bcrypt'
import Jwt from 'jsonwebtoken'
import checkauth from "../middleware/auth.js";
import adminauth from "../middleware/admin.js";
import randomstring from 'randomstring'
import nodemailer from 'nodemailer'
import moment from 'moment'
import Employ from "../models/employ.js";


const adminrouter = express.Router()

//BCRYPT PASSWORD USE THIS METHOD START
const secure2 = async (password) => {

  try {
    const passwordhash = await bcrypt.hash(password, 10)
    return passwordhash

  } catch (error) {
    res.status(400).send({ message: "error" })
  }
}
//BCRYPT PASSWORD USE THIS METHOD END



//FOR BLOCKING USER MAIL START......
const sentverifymail = async (email) => {
  try {
    const transporter = nodemailer.createTransport({
      port: 465,                     // true for 465, false for other ports
      host: "smtp.gmail.com",
      auth: {
        user: process.env.USER_id,
        pass: process.env.USER_PASS,
      },
      secure: true,
    });
    const mailoptions = {

      from: process.env.USER_id,
      to: email,
      subject: 'Blocking user',
      html: '<p> your account was blocked by admin</p>'
    }
    transporter.sendMail(mailoptions, function (err, info) {
      if (err)
        console.log(err)
      else
        res.status(200).send(mailoptions)
    });
  } catch (error) {

    res.status(400).send("error")
  }
}
//FOR BLOCKING USER MAIL END......

//ALL REGISTER USER DETAILS FIND AUTH AND ONLY ADMIN......................................
adminrouter.get("/allUser",[checkauth,adminauth],async(req,res)=>{

  try {
    
      const get = await User.find({})

      
      res.status(200).send(get)

  } catch (error) {
    
    res.status(400).send("error")
  }
})

//ADMIN LOGIN.....................................................................................
adminrouter.post("/admin/login", async (req, res) => {

  const email = req.body.email
  const password = req.body.password

  const userdata = await User.findOne({ email: email })


  if (userdata) {
    const passwordmatch = await bcrypt.compare(password, userdata.password)

    if (passwordmatch) {
      if (userdata.isAdmin === false) {

        res.status(400).send({ error: "you are not admin" })
      } else if (userdata.isVarified === 0) {

        res.status(400).send({ error: "you block by super admin" })

      }
      else {
        const checkpassword = await bcrypt.compare(req.body.password, userdata.password);

        const token = await userdata.generateTokens()

        // console.log(token);

        const date = moment().format('L')

        let Id = userdata._id

        res.status(200).send({ success: "????welcome admin..!!", token, Id, date })
      }

    } else {
      res.status(400).send({ error: "please try again" })
    }

  } else {
    res.status(400).send({ error: "please try again" })
    // res.status(400).send({ error: "please try again" })
  }
})

//BLOCK THE USER START.............
adminrouter.put("/block/:id", [checkauth, adminauth], async (req, res) => {

  const { email } = req.body;
  if (!email) {

    res.status(400).send({ error: "please fill the email field " })
  } else {
    let user = await User.findOne({ email: req.body.email })

    if (!user) {
      return res.status(404).send({ error: "invalid email" })

    } else {
      const _id = req.params.id
      const isVarified = req.body.isVarified

      const getid = await User.findByIdAndUpdate(_id, req.body.isVarified, {
        new: true
      })
      const data = {
        isVarified: 1
      }
      if (getid.isVarified == 1) {

        const data = {
          isVarified: 0
        }
        const get = await User.findByIdAndUpdate(getid._id, data)
        res.status(200).send({ success: "block the user" })
        sentverifymail(req.body.email);

      } else {
        res.status(400).send({ message: "user already blocked" })
      }
    }
  }
})

//UNBLOCK THE USER START.............
adminrouter.put("/unblock/:id", [checkauth, adminauth], async (req, res) => {

  const _id = req.params.id
  const isVarified = req.body.isVarified

  const getid = await User.findByIdAndUpdate(_id, req.body.isVarified, {
    new: true
  })
  const data = {
    isVarified: 0
  }
  if (getid.isVarified == 0) {

    const da1ta = {
      isVarified: 1
    }
    const getid1 = await User.findByIdAndUpdate(getid._id, da1ta)

    res.status(200).send({ success: "unblock the user" })
  }
  else {
    res.status(400).send({ message: "user already unblock" })
  }
})


//REGISTER ADMIN DETAILS FIND HELP OF TOKEN
adminrouter.get('/adminProfile', [checkauth,adminauth], async (req, res) => {

  try {
    const details = await User.find({ _id: req.user._id })
    if (details) {

const data={
      "_id":req.user._id,
      "name": req.user.name,"address":req.user.address,
      "email":req.user.email,"phone": req.user.phone,
      "gender": req.user.gender,"age": req.user.age,
}
      res.status(200).send({ success: "Admin Details....", data })
    }
    else {
      res.status(400).send({ error: "not found admin detail" })
    }
  }
  catch (err) {
    res.status(400).send({ error: "user not found please try again" })
  }
});


//UPDATE ADMIN DETAILS................................
adminrouter.put("/updateAdmin/:id",[checkauth,adminauth],async(req,res)=>{

  try {
    const _id = req.params.id

    const detail = await User.findByIdAndUpdate(_id, req.body, {


      new: true
    })
   detail.password=undefined, detail.cpassword=undefined
   
    res.status(200).send({ success: "Updated Admin Detail....", detail })
    // res.status(200).send({ success: "Updated Admin Detail....", getid })
    
  } catch (error) {
    res.status(400).send({ error: "user not found please try again" })
  }
})


//ADMIN MADE THE USER TO ADMIN............................................
adminrouter.put("/admin/made/:id", [checkauth, adminauth], async (req, res) => {

  const _id = req.params.id

  const isAdmin = req.body.isAdmin

  const getid = await User.findByIdAndUpdate(_id, req.body.isAdmin, {
    new: true
  })
  const data = {
    isAdmin: false
  }

  if (getid.isAdmin == false) {

    const da1ta = {
      isAdmin: true
    }
    const getid1 = await User.findByIdAndUpdate(getid._id, da1ta)

    res.status(200).send({ success: "you have made this user an Admin" })
  }
  else {

    res.status(400).send({ message: "you have already made this user an Admin" })

  }
})


//ADMIN MADE THE ADMIN TO user..............................................
adminrouter.put("/admin/user/:id",[checkauth,adminauth],async(req,res)=>{

  const _id= req.params.id

  const isAdmin= req.body.isAdmin

  const getid= await User.findByIdAndUpdate(_id,req.body.isAdmin,{
    new:true
  })
  const data= {
    isAdmin:true
  }

if(getid.isAdmin==true){

    const da1ta= {
      isAdmin:false
    }
    const getid1= await User.findByIdAndUpdate(getid._id,da1ta)

    res.status(200).send({success:"you have successfully made this admin a user"})
  }
  else{

res.status(400).send({message:"you have already made this admin a user"})

}
})

//SEARCH USER START.................
adminrouter.get("/search",checkauth, async (req, res, next) => {

  try {

    const { page = 1, limit = 150, sort, search = "" } = req.query;

    const user = await User.find({ _id: req.user._id })

    const data = await Employ.find({ name: { $regex: search, $options: "i" } }).populate("postedby", "name")

      .sort({ [sort]: 1 })        // sorting name, id ,etc

      .limit(limit * 1)       // apply limit to show data

      .skip((page - 1) * limit)     // pagination formula

    res.send({ page: page, limit: limit, data: data })

    const total = await Employ.countDocuments({

      name: { $regex: search, $options: "i" }   // search name according

    });
  } catch (error) {

    console.log(error)
  }
})



export default adminrouter

