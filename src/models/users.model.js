const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        clientId: { 
            type: String, 
            require: true, 
            unique: true 
        },
        name: { 
            type: String, 
            required: true, 
            unique: true 
        },
        email: { 
            type: String, 
            required: true,
            unique : true
        },
        isAdmin : {
            type : Boolean,
            default : false
        },
        userName: { 
            type: String, 
            required: true ,
            unique : true
        },
        password: { 
            type: String, 
            required: true 
        },
        profilePic : {
            type : String,
            default : "https://t3.ftcdn.net/jpg/03/94/89/90/360_F_394899054_4TMgw6eiMYUfozaZU3Kgr5e0LdH4ZrsU.jpg"
        },
        phoneNo : {
            type : String,
            required : true,
            uniquie : true,
        },
        place : {
            type : String,
            required : true,
            uniquie : true,
        },
        role : {
            type : String,
            required : true,
            enum : ['user', 'admin']
        },
        products : {
            type : [String],
        }
    },
    {
        timestamps : true
    }
)

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const userModel = mongoose.model('User', userSchema)
module.exports = userModel