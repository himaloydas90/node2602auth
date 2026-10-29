const nodemailer = require("nodemailer");
const smtpPort = Number(process.env.SMTP_PORT || 587)

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});


const getAppBaseUrl = () => {
    return (process.env.CLIENT_URL || `http://localhost:${process.env.PORT || 8000}`).replace(/\/$/, "");
};

const sendEmail =async({to,subject,html})=>{
    await transporter.sendMail({
        from: `"ERP SYSTEM",<${process.env.APP_NAME}>`,
        to,
        subject,
        html,
    });
};

const sendVerificationEmail = async (email,username, plainToken) => {
    const verifyUrl = `${getAppBaseUrl()}/api/v1/auth/verify-email/${plainToken}`;
    
    await sendEmail({
        to: email,
        subject: "Verify your email",
        html: `
            <p>Thanks for registering. Click the link below to verify your email (valid for 24 hours):</p>
            <p><a href="${verifyUrl}">${verifyUrl}</a></p>
            <p>'${username}'</p>
            <p>If you did not create an account, ignore this email.</p>
        `
    });
};
module.exports = {sendVerificationEmail}