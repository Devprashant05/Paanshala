import { Contact } from "../models/contact.model.js";
import { sendMail } from "../utils/sendMail.js";
import { baseEmailTemplate } from "../utils/emailTemplate.js";

// =============================
// SUBMIT CONTACT FORM
// =============================
export const submitContactForm = async (req, res) => {
    try {
        const { fullName, email, phone, message } = req.body;

        if (!fullName || !email || !phone || !message) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        // 1️⃣ Save to DB
        const contact = await Contact.create({
            fullName,
            email,
            phone,
            message,
        });

        // 2️⃣ Mail to Admin
        await sendMail(
            process.env.ADMIN_EMAIL,
            "New Contact Form Submission – Paanshala",
            baseEmailTemplate({
                title: "New Contact Inquiry",
                subtitle: "Paanshala Website",
                body: `
                    <p><b>Name:</b> ${fullName}</p>
                    <p><b>Email:</b> ${email}</p>
                    <p><b>Phone:</b> ${phone}</p>
                    <p><b>Message:</b></p>
                    <p>${message}</p>
                `,
            })
        );

        // 3️⃣ Confirmation Mail to User
        await sendMail(
            email,
            "We’ve Received Your Message – Paanshala",
            baseEmailTemplate({
                title: "Thank You for Contacting Us",
                subtitle: "Paanshala Support",
                body: `
                    <p>Dear ${fullName},</p>
                    <p>
                        Thank you for reaching out to <b>Paanshala</b>.
                        We’ve received your message and our team will
                        get back to you shortly.
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
            message: "Your message has been sent successfully",
        });
    } catch (error) {
        console.error("submitContactForm", error);

        return res.status(500).json({
            message: "Error while submitting contact form",
        });
    }
};

// =============================
// (Admin) GET ALL CONTACTS
// =============================
export const getAllContactsAdmin = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: contacts.length,
            contacts,
        });
    } catch (error) {
        console.error("getAllContactsAdmin", error);
        res.status(500).json({
            message: "Error while fetching contacts",
        });
    }
};

// =============================
// (Admin) MARK CONTACT AS READ
// =============================
export const markContactAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Contact marked as read",
            contact,
        });
    } catch (error) {
        console.error("markContactAsRead", error);
        res.status(500).json({
            message: "Error while updating contact status",
        });
    }
};
