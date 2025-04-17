const bcrypt = require('bcryptjs');
const userModel = require('../models/users.model.js')
const jwt = require('jsonwebtoken')

// const loginUser = async (req, res) => {
//   try{
//     const { email, password } = req.body;
//     const existingUser = await userModel.findOne({ email });
  
//     if (!existingUser) {
//       return res.status(400).json({ error: "User not found" });
//     }
  
//     // Compare input password with the stored hashed password
//     const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    
//     if (!isPasswordValid) {
//       return res.status(400).json({ error: "Invalid password" });
//     }

//     // return res.status(500).json({message : "login success"})

//     const token = jwt.sign(
//       {
//         id : existingUser._id, clientId : existingUser.clientId, isAdmin : existingUser.isAdmin, role : existingUser.role,
//       },
//       process.env.AUTH
//     )

//     res.status(200).json({
//       status: 200,
//       message: "Login successful from res",
//       token,
//       user: existingUser,
//     });

//     res.cookie("access_token", token, { httpOnly: true, secure : false,  maxAge: 12*60*60*1000 })
//     .status(200)
//     .json(
//       {
//         status : 200,
//         message : "login success",
//         data : existingUser
//       }
//     )
//   }
//   catch(error){
//     return res.status(500).json({error : error.message})
//   }
// };


// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const existingUser = await userModel.findOne({ email });

//     if (!existingUser) {
//       return res.status(400).json({ error: "User not found" });
//     }

//     // Compare input password with the stored hashed password
//     const isPasswordValid = await bcrypt.compare(password, existingUser.password);

//     if (!isPasswordValid) {
//       return res.status(400).json({ error: "Invalid password" });
//     }

//     const token = jwt.sign(
//       {
//         id: existingUser._id,
//         clientId: existingUser.clientId,
//         isAdmin: existingUser.isAdmin,
//         role: existingUser.role,
//       },
//       process.env.AUTH,
//       { expiresIn: "12h" } 
//     );

//     res.cookie("access_token", token, { 
//       httpOnly: true, 
//       secure: false, 
//       sameSite: "Lax",  
//       maxAge: 12 * 60 * 60 * 1000 
//     });

//     res.status(200).json({
//       status: 200,
//       message: "Login successful",
//       token,  // Sending token in response
//       user: existingUser, // Sending user data
//     });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };


// const loginUser = async (req, res) => {
//   try {
//     const { id, password } = req.body; // id can be either email or userId
    
//     if (!id) {
//       return res.status(400).json({ error: "ID/Email is required" });
//     }

//     // Check if id matches either email or userId
//     const existingUser = await userModel.findOne({
//       $or: [
//         { email: id },
//         { _id: id }
//       ]
//     });

//     if (!existingUser) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }

//     const isPasswordValid = await bcrypt.compare(password, existingUser.password);

//     if (!isPasswordValid) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       {
//         id: existingUser._id,
//         clientId: existingUser.clientId,
//         isAdmin: existingUser.isAdmin,
//         role: existingUser.role,
//       },
//       process.env.AUTH,
//       { expiresIn: "12h" } 
//     );

//     res.cookie("access_token", token, { 
//       httpOnly: true, 
//       secure: false, 
//       sameSite: "Lax",  
//       maxAge: 12 * 60 * 60 * 1000 
//     });

//     res.status(200).json({
//       status: 200,
//       message: "Login successful",
//       token,
//       user: existingUser,
//     });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };


const loginUser = async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({ error: "ID/Email and password are required" });
    }

    // Query both email and userName fields
    const existingUser = await userModel.findOne({
      $or: [
        { email: id },
        { userName: id }
      ]
    });

    if (!existingUser) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: existingUser._id,
        clientId: existingUser.clientId,
        isAdmin: existingUser.isAdmin,
        role: existingUser.role,
      },
      process.env.AUTH,
      { expiresIn: "12h" }
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 12 * 60 * 60 * 1000
    });

    res.status(200).json({
      status: 200,
      message: "Login successful",
      token,
      user: existingUser,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
module.exports = loginUser