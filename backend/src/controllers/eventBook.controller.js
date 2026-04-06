export const submitEventBooking = async (req, res) => {
    try {
        const { fullName, phone, eventDate, eventLocation, gathering } =
            req.body;

        if (!fullName || !phone || !eventDate || !eventLocation || !gathering) {
            return res.status(400).json({
                message: "All event fields are required",
            });
        }

        const booking = await Contact.create({
            type: "event",
            fullName,
            phone,
            eventDate,
            eventLocation,
            gathering,
        });

        // 📩 Mail to Admin
        await sendMail(
            process.env.ADMIN_EMAIL,
            "New Event Booking – Paanshala",
            baseEmailTemplate({
                title: "New Event Booking",
                subtitle: "Paanshala Events",
                body: `
                    <p><b>Name:</b> ${fullName}</p>
                    <p><b>Phone:</b> ${phone}</p>
                    <p><b>Date:</b> ${eventDate}</p>
                    <p><b>Location:</b> ${eventLocation}</p>
                    <p><b>Gathering:</b> ${gathering}</p>
                `,
            })
        );

        return res.status(201).json({
            success: true,
            message: "Event booking request submitted successfully",
        });
    } catch (error) {
        console.error("submitEventBooking", error);
        res.status(500).json({
            message: "Error while submitting event booking",
        });
    }
};
