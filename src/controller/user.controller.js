const userModel = require('../models/users.model')

const createUsers = async (req, res) => {
    try {
        const { clientId, name, email, userName, password, role, phoneNo, place } = req.body
        let isAdmin

        if (!clientId || !name || !email || !userName || !password || !role || !phoneNo || !place) {
            return res.status(400).json({ error: "every field is important" })
        }

        if (role === "user") {
            isAdmin = false
        }
        else (
            isAdmin = true
        )

        const newUser = new userModel({ clientId, name, email, userName, password, role, isAdmin: isAdmin, phoneNo, place })
        await newUser.save()
        res.status(201).json(newUser)
    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getUsers = async (req, res) => {
    try {
        const users = await userModel.find()
        res.json(users)
    }
    catch (error) {
        res.status(500).json({ error: error })
    }
}

const getUsersById = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id)
        res.status(201).json(user)
    }
    catch (error) {
        res.status(500).json({ error: error })
    }
}

// update email

const updateEmail = async (req, res) => {
    try {
        const { id } = req.params; // This is the ObjectId from the URL
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            id, // ✅ Use the ObjectId directly
            { $set: { email: email } },
            { new: true }
        );

        console.log("Updated User:", updatedUser);
        console.log("Email received:", email);

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Update email error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getUsers, createUsers, getUsersById, updateEmail }