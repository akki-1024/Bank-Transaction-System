const nodemailer = require("nodemailer");

// smtp severs
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.GOOGLE_EMAIL_ID,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Error connecting to email server: ", error);
    } else {
        console.log("Email server is ready to send messages");
    }
})

const sendEmail = async (to, subject, text, html) => {

    try {
        const info = await transporter.sendMail({
            from: `"Company Name" <${process.env.GOOGLE_EMAIL_ID}>`,
            to,
            subject,
            text,
            html
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.log("Error sending email: ", error);
    }

}

async function sendRegistrationEmail(userEmail, name) {
    const subject = "Welcome to Backend Ledger!";

    const text = `Hello ${name},

        Welcome to Backend Ledger! We're thrilled to have you on board.

        Your account has been created successfully. You can now start tracking and managing your transactions with ease.

        If you didn't create this account, please ignore this email.

        Best regards,
        The Backend Ledger Team`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #333;">
            <h2 style="color: #2c3e50;">Welcome to Backend Ledger, ${name}! 🎉</h2>
            <p>We're thrilled to have you on board.</p>
            <p>Your account has been created successfully. You can now start tracking and managing your transactions with ease.</p>
            <p style="font-size: 13px; color: #888;">If you didn't create this account, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p>Best regards,<br/><strong>The Backend Ledger Team</strong></p>
        </div>`;

    await sendEmail(userEmail, subject, text, html);
}


module.exports = { sendRegistrationEmail };