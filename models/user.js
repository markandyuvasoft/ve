// import mongoose from "mongoose";
// var Schema= mongoose.Schema
// import jwt from 'jsonwebtoken'


// const userSchema=new mongoose.Schema({

//     name:{
//         type:String,
    
//         },
        
//     email:{
//         type:String,
//         },
    
//     password:{
//         type:String
//     },
//     cpassword:{
//         type:String
//     },
//     phone:{
//         type:Number
//     },
//     gender:{
//         type:String
//     },
//     address:{
//         type:String
//     },
//     age:Number,
    
//     // token:{
//     //     type:String,
//     //     default:''
//     // },
//     tokens:[{

//         token:{
//             type:String,
//             required:true
//         }
//     }],
//     isAdmin:
//     {
//       type:Boolean,
//       default:false
//     },
//     isVarified:{
//         type:Number,
//         default:0,
//     }
// },{versionKey: false})    

// userSchema.methods.generateTokens = async function (){

//     const token= jwt.sign({_id:this._id,isAdmin:this.isAdmin},'privatekey',{

//         expiresIn:"24h"
//     })

//     this.tokens = this.tokens.concat({ token:token })  //database me token ko add krwane ke ley

//     await this.save()
//     return token
// }

// const User=mongoose.model('user1',userSchema)

// export default User



import mongoose from "mongoose";
var Schema= mongoose.Schema
import jwt from 'jsonwebtoken'


const userSchema=new mongoose.Schema({

    name:{
        type:String,
    
        },
        
    email:{
        type:String,
        },
    
    password:{
        type:String
    },
    cpassword:{
        type:String
    },
    phone:{
        type:Number,
    },
    gender:{
        type:String
    },
    address:{
        type:String
    },
    age:Number,
    
    token:{
        type:String,
        // default:''
    },
    isAdmin:
    {
      type:Boolean,
      default:false
    },
    isVarified:{
        type:Number,
        default:0,
    }
},{versionKey: false})    

userSchema.methods.generateTokens = async function (){

    const token= jwt.sign({_id:this._id,isAdmin:this.isAdmin},'privatekey',{

        expiresIn:"24h"
    })
    return token
} 



const User=mongoose.model('user1',userSchema)

export default User