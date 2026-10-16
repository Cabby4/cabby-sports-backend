
require("dotenv").config();

const transporter = require("./src/config/mailer")

async function testEmail() {
  try {
    await transporter.verify();
    console.log("Email server connection successful!");

    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Cabby Sports Email Test",
      text: "Your Cabby Sports email service is working correctly.",
    });

    console.log("Test email sent:", result.messageId);
  } catch (error) {
    console.error("Email test failed:", error.message);
  }
}

testEmail();
