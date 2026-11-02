const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    }
});

// verify the connection configuration
transporter.verify((error, success)=>{
    if(error){
        console.error("Error connecting to email server: ", error);
    } else {
        console.log("Email server is ready to send messages")
    }
});


// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try{

        const info = await transporter.sendMail({
            from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });

        console.log("Message send: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    }catch(error){
        console.error("Error sending email:", error);
    }
}
 
const sendRegistrationEmail = async (userEmail, name) => {
    const subject = 'Welcome to Backend Ledger!';
    const text = `Hello ${name}, \n\nThank you for registering at Backend Ledger.`;
    const html = `<p>Hello ${name},</p>`;

    await sendEmail(userEmail, subject, text, html);
}

const sendTransactionEmail = async (
    userEmail,
    name,
    amount,
    toAccount
) => {

    const subject = "Transaction Successful - Backend Ledger";

    const text = `
Hello ${name},

Your transaction has been completed successfully.

Transaction Details:
Amount: ₹${amount}
To Account: ${toAccount}

Thank you for using Backend Ledger.
    `;

    const html = `
        <h2>Transaction Successful!</h2>

        <p>Hello ${name},</p>

        <p>Your transaction has been completed successfully.</p>

        <table border="1" cellpadding="10" cellspacing="0">
            <tr>
                <td><strong>Amount</strong></td>
                <td>₹${amount}</td>
            </tr>
            <tr>
                <td><strong>To Account</strong></td>
                <td>${toAccount}</td>
            </tr>
            <tr>
                <td><strong>Status</strong></td>
                <td>COMPLETED</td>
            </tr>
        </table>

        <p>Thank you for using Backend Ledger.</p>
    `;

    await sendEmail(userEmail, subject, text, html);
};


module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail
};