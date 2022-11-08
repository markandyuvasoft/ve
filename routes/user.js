import express from "express";
import User from "../models/user.js"
// import _ from 'lodash';
import bcrypt from 'bcrypt'
import Jwt from 'jsonwebtoken'
import checkauth from "../middleware/auth.js";
import adminauth from "../middleware/admin.js";
import randomstring from 'randomstring'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()


const userrouter = express.Router()

//BCRYPT PASSWORD USE THIS METHOD START
const secure = async (password) => {

  try {
      const passwordhash = await bcrypt.hash(password, 10)
      return passwordhash

  } catch (error) {
      res.status(400).send({ error: "error" })
  }
}
//BCRYPT PASSWORD USE THIS METHOD END

const createtoken = async (id) => { 

  try {

      // const tokn = await Jwt.sign({_id:this._id,isAdmin:this.isAdmin}, config.secret)

       const tokn = await Jwt.sign({_id:this._id,isAdmin:this.isAdmin}, "privatekey")

      return tokn

  } catch (error) {

      res.send("error")
  }
}

//FORGET TIME MAIL SSENT PROCESS
const sendset = async (name, email, token) => {

  const transporter = nodemailer.createTransport({
      port: 465,                     // true for 465, false for other ports
      host: "smtp.gmail.com",
      auth: {
          user: process.env.USER_id,
          pass: process.env.USER_PASS      
      }, 
      secure: true,
  });

  const mailoptions = {

      from: process.env.USER_id,
      to: email,
      subject: 'reset password',
//        html: '<p> hii ' + name + ', plz copy the link and <a href="https://adsasas.herokuapp.com/reset?token=' + token + '"> reset your password</a>'
html: '<p> hii ' + name + ', plz copy the link and <a href="https://adminaman.herokuapp.com/reset?token=' + token + '"> reset your password</a>'
  };

  transporter.sendMail(mailoptions, function (err, info) {
      if (err)
          console.log(err)
      else
          res.status(200).send(mailoptions)
  });

}

//UPDATE USER PASSWORD.....................................................................................
userrouter.post("/changePassword", checkauth,async (req, res, next) => {

    const email = req.body.email
  const password = req.body.password

  const data = await User.findOne({ email: email })

  if (data) {

      const newpswd = await secure(password)

      const userdata = await User.findOneAndUpdate({ email: email }, {
          $set: {

              password: newpswd
          }
      })

      res.status(200).send({success:"successfully change your password"})
  } else {
      res.status(400).send({error:"user not found please try again"})
  }
})

// userrouter.get("/forget",async(req,res)=>{

// try {
  
//   const token= req.query.token

// } catch (error) {
//   res.send("error")
// }
// })



//FORGET PASSWORD API............................................................
userrouter.post("/forget", async (req, res) => {
  try {

      const email = req.body.email

      const userdata = await User.findOne({ email: email })

      if (userdata) {

          const randomString = await randomstring.generate()

          const data = await User.updateOne({ email: email }, { $set: { token: randomString } })

          sendset(userdata.name, userdata.email, randomString)

          res.status(200).send({message:"please check your mail and reset your password"})

      } else {
          res.status(400).send({error:"email not exist"})
      }
  } catch (error) {

      res.status(400).send({error:"error please try again"})
  }
})

//RESET PASSWORD API START.......................................................
userrouter.get("/reset", async (req, res) => {

  try {

      const token = req.query.token

      const tokendata = await User.findOne({ token: token })

      if (tokendata) {

          const password = req.body.password
          const newpass = await secure(password)

          const userdata = await User.findByIdAndUpdate({ _id: tokendata._id }, { $set: { password: newpass, token: '' } }, { new: true })

          res.status(200).send({success:"succesfully reset your password"})

      } else {

          res.status(401).send({error:"expire your link send again forget requiest"})
      }
  } catch (error) {

  }
})
export default userrouter

