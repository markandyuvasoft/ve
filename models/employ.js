import mongoose from "mongoose";
var Schema= mongoose.Schema
const {ObjectId}= mongoose.Schema.Types


const employSchema=new mongoose.Schema({
    name:{
        type:String,
        unique:true,
        },
    age:{
        type:Number
    },
    city:{
        type:String
    },
    date:{
        type:String,
    },
    domain:{
        type:String,
    },
    image:{
    
        data:String,
        contentType: String,
        file_url: String
    },
    salary:{
        type:Number,
        },
        postedby:{
            type:ObjectId,
            ref:"user1"
            },

},{versionKey: false})

// employSchema.set('timestamps',true)

const Employ=mongoose.model('employ',employSchema)


// let dateOfBirth=new Date().toISOString()
//     .replace('T', ' ')
//     .replace('Z', '')


export default Employ