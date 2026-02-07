import { OTP } from "../models/otp.model.js";
import { User } from "../models/user.model.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendMail } from "../utils/sendMail.js";
import { baseEmailTemplate } from "../utils/emailTemplate.js";
import jwt from "jsonwebtoken";

// =============================
// REGISTER USER CONTROLLER
// =============================
export const registerUser = async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({
                message: "User is already registered with this email",
            });

        const user = await User.create({
            full_name,
            email,
            password,
            role: "user",
        });

        // Generate OTP
        const { otp, expiry } = generateOtp();
        await OTP.create({
            userId: user._id,
            otp: otp.toString(),
            purpose: "email_verification",
            expiresAt: expiry,
        });

        // Send mail
        await sendMail(
            email,
            "Verify Your Email – Paanshala",
            baseEmailTemplate({
                title: "Verify Your Email",
                subtitle: "Welcome to Paanshala",
                body: `
      <p style="font-size:15px;">Thank you for registering with <b>Paanshala</b>.</p>
      <p>Please use the OTP below to verify your email address.</p>
    `,
                highlight: otp,
                footerNote: `
      <p style="font-size:13px;color:#6b7280;">
        This OTP is valid for <b>5 minutes</b>. Do not share it with anyone.
      </p>
    `,
            })
        );

        return res.status(201).json({
            success: true,
            message: "User registered successfully. Please verify your email.",
        });
    } catch (error) {
        console.error("registerUser", error);
        return res
            .status(500)
            .json({ message: "Error while register" || error.message });
    }
};

// =============================
// VERIFY OTP CONTROLLER
// =============================
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const record = await OTP.findOne({
            userId: user._id,
            purpose: "email_verification",
        });

        if (!record) return res.status(400).json({ message: "No OTP found" });
        if (record.expiresAt < new Date())
            return res.status(400).json({ message: "OTP Expired" });

        const isMatch = await record.compareOtp(otp);
        if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

        user.isVerified = true;
        await user.save();

        await OTP.deleteMany({
            userId: user._id,
            purpose: "email_verification",
        });

        // Generate Token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Base response
        const response = {
            success: true,
            message: "Email verified successfully, logged in.",
            user: {
                id: user._id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
            },
        };

        res.status(201).json(response);
    } catch (error) {
        console.log("verifyOTP", error);
        res.status(500).json({
            message: "Error while verify OTP" || error.message,
        });
    }
};

// =============================
// LOGOUT USER CONTROLLER
// =============================
export const logoutUser = async (req, res) => {
    res.clearCookie("token");
    res.json({
        success: true,
        message: "Logged Out Successfully",
    });
};

// =============================
// LOGIN USER CONTROLLER
// =============================

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for missing fields
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and Password are required" });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check for user isVerified
        if (!user.isVerified) {
            return res.status(400).json({
                message: "Please Verify your email before logging in",
            });
        }

        // Check for password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        // Set token in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Build base response
        const response = {
            success: true,
            message: "Logged in successfully",
            user: {
                id: user._id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                profile_image: user.profile_image,
            },
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error while login", error);
        return res.status({
            message: "Error while logging in" || error.message,
        });
    }
};

// =============================
// GET USER PROFILE CONTROLLER
// =============================

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(201).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Error while gettingProfile", error);
        return res
            .status(500)
            .json({ message: "Error while fetching profile" || error.message });
    }
};

// =============================
// UPDATE USER PROFILE CONTROLLER
// =============================

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { full_name, phone } = req.body;

        let updatedData = {
            full_name,
            phone,
        };

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Handle profile image
        if (req.file) {
            if (user.profile_image) {
                await deleteFromCloudinary(user.profile_image);
            }

            // upload new image
            const uploadUrl = await uploadOnCloudinary(
                req.file.path,
                "profile"
            );

            if (uploadUrl) {
                updatedData.profile_image = uploadUrl;
            }
        }

        // update user in db

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
            new: true,
            runValidators: true,
        }).select("-password");

        return res.status(201).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({
            message: "Server error while updating profile" || error.message,
        });
    }
};

// =============================
// DELETE USER PROFILE CONTROLLER
// =============================

export const deleteUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User Not Found" });

        // Delete profile image
        if (user.profile_image) {
            await deleteFromCloudinary(user.profile_image);
        }

        //Delete the user itself
        await User.findByIdAndDelete(userId);

        // clear cookie
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(201).json({
            success: true,
            message: "Account Deleted Successfully",
        });
    } catch (error) {
        console.error("Delete account error:", error);
        return res.status(500).json({
            message: "Server error while deleting account." || error.message,
        });
    }
};

// =============================
// RESEND OTP CONTROLLER
// =============================
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.isVerified)
            return res
                .status(400)
                .json({ message: "User is already verified" });

        // Delete old OTPs
        await OTP.deleteMany({
            userId: user._id,
            purpose: "email_verification",
        });

        // Generate new OTP
        const { otp, expiry } = generateOtp();
        await OTP.create({
            userId: user._id,
            otp: otp.toString(),
            purpose: "email_verification",
            expiresAt: expiry,
        });

        // Send Email
        await sendMail(
            email,
            "Your New OTP – Paanshala",
            baseEmailTemplate({
                title: "New OTP Generated",
                subtitle: "Email Verification",
                body: `
      <p>You requested a new OTP to verify your email.</p>
      <p>Please use the code below:</p>
    `,
                highlight: otp,
                footerNote: `
      <p style="font-size:13px;color:#6b7280;">
        If you didn’t request this, you can safely ignore this email.
      </p>
    `,
            })
        );

        return res.status(200).json({
            success: true,
            message: "OTP resent successfully. Please check your email.",
        });
    } catch (error) {
        console.error("resendOtp", error);
        return res.status(500).json({
            message: "Error while resending OTP" || error.message,
        });
    }
};

// =============================
// FORGOT PASSWORD CONTROLLER
// =============================
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email });
        if (!user)
            return res
                .status(404)
                .json({ message: "User not found with this email" });

        // Delete old OTPs for password reset
        await OTP.deleteMany({ userId: user._id, purpose: "password_reset" });

        // Generate new OTP
        const { otp, expiry } = generateOtp();
        await OTP.create({
            userId: user._id,
            otp: otp.toString(),
            purpose: "password_reset",
            expiresAt: expiry,
        });

        // Send reset OTP email
        await sendMail(
            email,
            "Reset Your Password – Paanshala",
            baseEmailTemplate({
                title: "Reset Your Password",
                subtitle: "Password Recovery",
                body: `
      <p>We received a request to reset your password.</p>
      <p>Use the OTP below to proceed:</p>
    `,
                highlight: otp,
                footerNote: `
      <p style="font-size:13px;color:#6b7280;">
        This OTP will expire in <b>5 minutes</b>.
      </p>
    `,
            })
        );

        return res.status(200).json({
            success: true,
            message: "Password reset OTP sent successfully to your email.",
        });
    } catch (error) {
        console.error("forgotPassword", error);
        return res.status(500).json({
            message: "Error while sending reset OTP" || error.message,
        });
    }
};

// =============================
// RESET PASSWORD CONTROLLER (using OTP)
// =============================
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res
                .status(400)
                .json({ message: "Email, OTP and New Password are required" });
        }

        const user = await User.findOne({ email });
        if (!user)
            return res
                .status(404)
                .json({ message: "User not found with this email" });

        const record = await OTP.findOne({
            userId: user._id,
            purpose: "password_reset",
        });

        if (!record) return res.status(400).json({ message: "No OTP found" });
        if (record.expiresAt < new Date())
            return res.status(400).json({ message: "OTP expired" });

        const isMatch = await record.compareOtp(otp);
        if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

        // Hash and update password
        user.password = newPassword;
        await user.save();

        // Delete all password_reset OTPs
        await OTP.deleteMany({
            userId: user._id,
            purpose: "password_reset",
        });

        // Send confirmation mail
        await sendMail(
            user.email,
            "Password Changed Successfully – Paanshala",
            baseEmailTemplate({
                title: "Password Updated",
                subtitle: "Security Confirmation",
                body: `
      <p>Your password has been updated successfully.</p>
      <p>If this was not you, please contact support immediately.</p>
    `,
                footerNote: `
      <div style="margin-top:16px;padding:12px;background:#ecfeff;border-radius:8px;font-size:13px;">
        Stay safe. Never share your password with anyone.
      </div>
    `,
            })
        );

        return res.status(200).json({
            success: true,
            message: "Password reset successfully.",
        });
    } catch (error) {
        console.error("resetPassword", error);
        return res.status(500).json({
            message: "Error while resetting password" || error.message,
        });
    }
};

// =============================
// UPDATE PASSWORD (Authenticated User)
// =============================
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword)
            return res.status(400).json({
                message: "Both current and new passwords are required",
            });

        const user = await User.findById(req.user._id).select("+password");
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch)
            return res
                .status(400)
                .json({ message: "Current password is incorrect" });

        user.password = newPassword;
        await user.save();

        await sendMail(
            user.email,
            "Password Changed Successfully – Paanshala",
            baseEmailTemplate({
                title: "Password Updated",
                subtitle: "Security Confirmation",
                body: `
      <p>Your password has been updated successfully.</p>
      <p>If this was not you, please contact support immediately.</p>
    `,
                footerNote: `
      <div style="margin-top:16px;padding:12px;background:#ecfeff;border-radius:8px;font-size:13px;">
        Stay safe. Never share your password with anyone.
      </div>
    `,
            })
        );

        return res.status(200).json({
            success: true,
            message: "Password updated successfully.",
        });
    } catch (error) {
        console.error("updatePassword", error);
        return res.status(500).json({
            message: "Error while updating password" || error.message,
        });
    }
};

// =============================
// (Admin) LIST ALL USER
// =============================

export const listUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found." });
        }

        return res.status(201).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        console.error("list user", error);
        return res
            .status(500)
            .json({ message: "Error while fetching users" || error.message });
    }
};

// =============================
// (Admin) Delete USER
// =============================

export const deleteUserByAdmin = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user._id.toString() === req.user?._id.toString()) {
            return res
                .status(400)
                .json({ message: "You cannot delete your own account" });
        }

        // delete user profile image
        if (user.profile_image) {
            await deleteFromCloudinary(user.profile_image);
        }

        // delete user itself
        await User.findByIdAndDelete(userId);

        return res.status(201).json({
            success: true,
            message: "User and all related information deleted successfully",
        });
    } catch (error) {
        console.error("delete user by admin", error);
        return res.status(500).json({
            message: "Error while deleting the user" || error.message,
        });
    }
};

// =============================
// (Admin) CREATE ADMIN
// =============================
export const createAdminByAdmin = async (req, res) => {
    try {
        const { full_name, email } = req.body;

        if (!full_name || !email) {
            return res.status(400).json({
                message: "Full name and email are required",
            });
        }

        // Ensure requester is admin
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only admins can create another admin",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists with this email",
            });
        }

        // Generate random password (8 chars)
        const password = Math.random().toString(36).slice(-8);

        // Create admin
        const admin = await User.create({
            full_name,
            email,
            password,
            role: "admin",
            isVerified: true, // internal admin → auto verified
        });

        // Send credentials via email
        await sendMail(
            email,
            "Admin Access Granted – Paanshala",
            baseEmailTemplate({
                title: "Admin Account Created",
                subtitle: "Paanshala Admin Panel",
                body: `
          <p>You have been granted <b>Admin access</b> to Paanshala.</p>
          <p>Please use the credentials below to log in:</p>
        `,
                highlight: `
          Email: ${email}<br/>
          Password: ${password}
        `,
                footerNote: `
          <p style="font-size:13px;color:#6b7280;">
            For security reasons, please change your password after first login.
          </p>
        `,
            })
        );

        return res.status(201).json({
            success: true,
            message: "Admin created successfully and credentials emailed",
            admin: {
                id: admin._id,
                full_name: admin.full_name,
                email: admin.email,
            },
        });
    } catch (error) {
        console.error("createAdminByAdmin", error);
        return res.status(500).json({
            message: "Error while creating admin" || error.message,
        });
    }
};
