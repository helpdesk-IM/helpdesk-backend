const userModel = require('../../src/models/users.model')
const bcrypt = require('bcrypt');

const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        // Hash the password with bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update the user with hashed password
        const uploadedUser = await userModel.findByIdAndUpdate(
            id,
            { $set: { password: hashedPassword } },
            { new: true }
        );

        if (!uploadedUser) {
            return res.status(400).json({ error: "There is no user" });
        }

        res.status(201).json({ message: "Password updated successfully." });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {resetPassword}