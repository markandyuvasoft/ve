import express from "express";
// import _ from 'lodash';
import User from "../models/user.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import checkauth from "../middleware/auth.js";
import adminauth from "../middleware/admin.js";
import nodemailer from 'nodemailer'
import moment from 'moment'
import dotenv from 'dotenv'

dotenv.config()
const authrouter = express.Router()

//BCRYPT PASSWORD USE THIS METHOD START
const secure = async (password) => {

  try {
    const passwordhash = await bcrypt.hash(password, 10)
    return passwordhash

  } catch (error) {
    res.status(400).send({ message: "error" })
  }
}
//BCRYPT PASSWORD USE THIS METHOD END
const createtoken = async (id, res) => {

  try {

    // const tokn = await Jwt.sign({ _id: id }, config.secret)

    const tokn = await jwt.sign({ _id: id }, "privatekey", {

      expiresIn: "24h"
    })

    return tokn

  } catch (error) {

    res.send("error")
  }
}
//verify mail register time start
const sentverifymail = async (name, email, user_id) => {

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
      to: process.env.USER_id,
      subject: 'for email varifiaction',
      html: '<p> hii ' + name + ', please click to verify <a href="  https://adminaman.herokuapp.com/verify?id=' + user_id + '">verify</a>your mail</p>'
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

// verify time mail sent
const verify = async(email)=>{

  // console.log(data);

      const transporter = nodemailer.createTransport({
          port: 465,                     // true for 465, false for other ports
          host: "smtp.gmail.com",
          auth: {
              user: process.env.USER_id,
            pass: process.env.USER_PASS,
          },
          secure: true,
      });
      const mailoptions={

          from:process.env.USER_id,
          to:email,
          subject:'for varifiaction message',
          html: '<p> your account was varified by admin </p>'
      }
      transporter.sendMail(mailoptions, function (err, info) {
          if (err)
              console.log(err)
          else
              res.status(200).send(mailoptions)
      });

}


// authrouter.get("/profile", checkauth, async (req, res) => {  
//     const profile = await User.findById(req.user._id).select('-password')// chye to employ wali details find krwao
//     res.status(200).send(profile)
// })


var userr=""        // varify time mail sent ke ley blank varible

// varify route start
authrouter.get("/verify", async (req, res) => {

  try {

    const update = await User.updateOne({ _id: req.query.id }, { $set: { isVarified: 1 } })

    res.status(200).send({ success: "welcome user mail varify" })


    verify(userr);

  } catch (error) {
    res.status(400).send("err")
  }
})


//register route start
authrouter.post("/register", async (req, res) => {

  const { name, email, password, cpassword, phone, gender, address, age } = req.body
  var emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

  if (!name || !email || !password || !cpassword || !phone || !gender || !address || !age) {

    return res.status(422).send({ error: "please fill the field properly" })
  }
  var valid = emailRegex.test(email);

  if (!valid) {
    return res.status(422).send({ error: "you have enter a valid email address." })
  }
  if (phone.toString().length != 10) {

    return res.status(422).send({ error: "mobile number must be 10 digit" })
  }

  else if(age<=18 || age>=60){

    return res.status(400).send({error:"your age should be in between 18 to 60 then only you can apply"})
}
  else {

    const spassword = await secure(req.body.password)

    const user = new User({
      name, email, phone, gender, address,age,
      password: spassword,
      cpassword: spassword,
    })

    const userdata = await User.findOne({ email: req.body.email })

    if (userdata) {

      res.status(400).send({ error: "user already exist" })

    } else if (password != cpassword) {

      return res.status(422).send({ error: "password are not match" })
    }
    else {

      const userdata1 = await user.save()

      userr=userdata1.email    // varify time mail sent ke ley

      res.status(200).send({ message: "please wait your mail varify by admin" })

      sentverifymail(req.body.name, req.body.email, userdata1._id);  // mail bnaya hai vafication ke ley
    }
  }
});

//post method user register HIDE PASSWORD and BCRYPT PASSWORD START......................................
authrouter.post("/login", async (req, res, next) => {

  const { email, password } = req.body;

  if (!email || !password) {

    res.status(400).send({ error: "please fill the proper field " })
  }
  else {

    let user = await User.findOne({ email: req.body.email })

    if (!user) {

      return res.status(404).send({ error: "invalid email" })

    } else if (user.isVarified === 0) {

      res.status(400).send({ error: "not allow by admin" })

    } else {
      const checkpassword = await bcrypt.compare(req.body.password, user.password);

      if (!checkpassword) {

        return res.status(404).send({ error: "invalid password" })
      }
      const token = await createtoken(user._id)

      const date = moment().format('L')

      let Id = user._id
      res.status(200).send({ success: "😉welcome user..!!", token, Id, date })

    }
  }
})
//post method user register HIDE PASSWORD and BCRYPT PASSWORD end......................................


//REGISTER USER DETAILS FIND HELP OF TOKEN
authrouter.get('/userProfile', checkauth, async (req, res) => {

  try {
    
    const details = await User.find({ _id: req.user._id })

    if (details) {

const data={
      "_id":req.user._id,
      "name": req.user.name,
      "email":req.user.email,
      "password":req.user.password, 
      "cpassword":req.user.cpassword,
      "phone": req.user.phone,
      "gender": req.user.gender,
      "address":req.user.address,
      "age": req.user.age,
}
      res.status(200).send({ success: "user details..", data })
    }
    else {
      res.status(400).send({ error: "not found user detail" })
    }
  }
  catch (err) {

    res.status(400).send({ error: "token is invalid user not found" })
  }
});



authrouter.put("/updateUser/:id",checkauth,async(req,res)=>{

  try {

    const _id = req.params.id

    const getid = await User.findByIdAndUpdate(_id, req.body, {

      new: true
    })
    getid.isAdmin=undefined, getid.token=undefined,  getid.isVarified=undefined
   
    res.status(200).send(getid)
    
  } catch (error) {
    res.status(400).send({ error: "token is invalid user not found" })
  }
})


export default authrouter

