import {createTransport} from 'nodemailer';

const sendMail = async (email, subject, data) => {
    const transporter = createTransport({
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const text = `Hello ${data.name}, ${data.otp}`;

    await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to: email,
        subject,
        text
    })
};

export default sendMail;