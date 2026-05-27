import { Contact } from "../models/contact.model.js";
import { baseEmailTemplate } from "../utils/emailTemplate.js";
import { sendMail } from "../utils/sendMail.js";

// =============================
// SUBMIT HORECA FORM
// =============================
export const submitHorecaInquiry = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            businessName,
            businessType,
            city,
            requirement,
        } = req.body;

        if (
            !fullName ||
            !email ||
            !phone ||
            !businessName ||
            !businessType ||
            !city ||
            !requirement
        ) {
            return res.status(400).json({
                message: "All Horeca fields are required",
            });
        }

        // Save to DB
        const inquiry = await Contact.create({
            type: "horeca",
            fullName,
            email,
            phone,
            businessName,
            businessType,
            city,
            requirement,
        });

        // 📩 Mail to Admin
        await sendMail(
            process.env.USER_EMAIL,
            "New HoReCa Inquiry – Paanshala",
            baseEmailTemplate({
                title: "New HoReCa Business Inquiry",
                subtitle: "Paanshala HoReCa",
                body: `
          <p><b>Name:</b> ${fullName}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Business:</b> ${businessName}</p>
          <p><b>Business Type:</b> ${businessType}</p>
          <p><b>City:</b> ${city}</p>
          <p><b>Requirement:</b></p>
          <p>${requirement}</p>
        `,
            })
        );

        // 📩 Confirmation Mail
        await sendMail(
            email,
            "We’ve Received Your HoReCa Inquiry – Paanshala",
            baseEmailTemplate({
                title: "Thank You for Connecting with Paanshala",
                subtitle: "Paanshala HoReCa Team",
                body: `
          <p>Dear ${fullName},</p>

          <p>
            Thank you for showing interest in partnering with 
            <b>Paanshala</b>.
          </p>

          <p>
            Our HoReCa team has received your inquiry and will
            connect with you shortly to discuss the opportunity.
          </p>
        `,
                footerNote: `
          <p style="font-size:13px;color:#6b7280;">
            This is an automated confirmation email.
          </p>
        `,
            })
        );

        return res.status(201).json({
            success: true,
            message: "HoReCa inquiry submitted successfully",
            inquiry,
        });
    } catch (error) {
        console.error("submitHorecaInquiry", error);

        return res.status(500).json({
            message: "Error while submitting HoReCa inquiry",
        });
    }
};
