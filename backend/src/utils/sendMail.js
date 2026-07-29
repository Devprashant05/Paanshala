import nodemailer from "nodemailer";

export const sendMail = async (to, subject, message, attachments = []) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.zoho.com",
        port: 465,
        secure: true, // SSL
        auth: {
            user: process.env.USER_EMAIL, // hello@paanshala.com
            pass: process.env.USER_PASS, // Zoho app password
        },
    });

    await transporter.sendMail({
        from: `"Paanshala" <${process.env.USER_EMAIL}>`,
        to,
        subject,
        html: message,
        attachments,
    });
};
