// import Jwt from 'jsonwebtoken'

// const checkauth=(req,res,next)=>{
    
//     try{
// const token= req.headers.authorization.split(" ")[1]
// //  console.log(token)
// const verify = Jwt.verify(token,'privatekey')


// next()

//     }
//     catch(error)
//     {
//         return res.status(401).json({
//             msg: 'only access authorised person'
//         })
//     }
// } 
// export default checkauth;




import Jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import User from '../models/user.js'


const checkauth=(req,res,next)=>{
    
    const {authorization} = req.headers

    if(!authorization){
       return res.status(401).json({error:"only auth"})
    }
    const token = authorization.replace("Bearer ","")
    Jwt.verify(token,"privatekey",(err,payload)=>{
        if(err){
         return   res.status(401).json({error:"only auth user"})
        }else{

            
            const {_id} = payload
            User.findById(_id).then(userdata=>{
                req.user = userdata
                next()
            })
        }
        
        
    })


} 

export default checkauth
