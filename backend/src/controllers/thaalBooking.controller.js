import { Contact } from "../models/contact.model.js";
import { sendMail } from "../utils/sendMail.js";
import { baseEmailTemplate } from "../utils/emailTemplate.js";

// =============================
// SUBMIT PAAN THAAL CUSTOMIZATION REQUEST
// =============================
export const submitThaalBooking = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            thaalQuantity,
            preferredDate,
            preferredTime,
        } = req.body;

        if (
            !fullName ||
            !email ||
            !phone ||
            !thaalQuantity ||
            !preferredDate ||
            !preferredTime
        ) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        if (req.body.captchaToken) {
            const verifyRes = await fetch(
                `https://www.recaptcha.net/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${req.body.captchaToken}`,
                { method: "POST" }
            );
            const data = await verifyRes.json();
            if (!data.success || data.score < 0.5) {
                return res
                    .status(400)
                    .json({ message: "Captcha verification failed" });
            }
        }

        // 1️⃣ Save to DB
        const thaalBooking = await Contact.create({
            type: "paanThaal",
            fullName,
            email,
            phone,
            thaalQuantity,
            preferredDate,
            preferredTime,
        });

        // 2️⃣ Mail to Admin
        await sendMail(
            process.env.USER_EMAIL,
            "New Paan Thaal Customization Request – Paanshala",
            baseEmailTemplate({
                title: "New Paan Thaal Request",
                subtitle: "Paanshala Website",
                body: `
                    <p><b>Name:</b> ${fullName}</p>
                    <p><b>Email:</b> ${email}</p>
                    <p><b>Phone:</b> ${phone}</p>
                    <p><b>Thaal Quantity:</b> ${thaalQuantity}</p>
                    <p><b>Preferred Date:</b> ${new Date(
                        preferredDate
                    ).toDateString()}</p>
                    <p><b>Preferred Time:</b> ${preferredTime}</p>
                `,
            })
        );

        // 3️⃣ Confirmation Mail to User
        await sendMail(
            email,
            "We’ve Received Your Paan Thaal Request – Paanshala",
            baseEmailTemplate({
                title: "Thank You for Your Request",
                subtitle: "Paanshala Paan Thaal",
                body: `
                    <p>Dear ${fullName},</p>
                    <p>
                        Thank you for reaching out to <b>Paanshala</b> for your
                        customized Paan Thaal. We've received your request for
                        <b>${thaalQuantity}</b> pieces of paan thaal(s) on
                        <b>${new Date(preferredDate).toDateString()}</b> at
                        <b>${preferredTime}</b>. Our team will get in touch
                        with you shortly to confirm the details.
                    </p>
                `,
                footerNote: `
                    <p style="font-size:13px;color:#6b7280;">
                        This is an automated confirmation. Please do not reply.
                    </p>
                `,
            })
        );

        return res.status(201).json({
            success: true,
            message: "Your Paan Thaal request has been sent successfully",
        });
    } catch (error) {
        console.error("submitThaalBooking", error);

        return res.status(500).json({
            message: "Error while submitting Paan Thaal request",
        });
    }
};
