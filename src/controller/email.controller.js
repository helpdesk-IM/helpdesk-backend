const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "rithish.manohar006@gmail.com", // Your email
      pass: "ecar brva wjib qyke", // Use the generated App Password
    },
});

const sendEmail = async (to, subject, text) => {
    try {
      const mailOptions = {
        from: "your-email@gmail.com",
        to,
        subject,
        text,
      };
  
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
    }
};

module.exports = sendEmail