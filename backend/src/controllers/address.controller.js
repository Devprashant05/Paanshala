import { Address } from "../models/address.model.js";

// =============================
// ADD ADDRESS
// =============================
export const addAddress = async (req, res) => {
    try {
        const data = req.body;

        // If setting default, unset others of same type
        if (data.isDefault) {
            await Address.updateMany(
                {
                    user: req.user._id,
                    addressType: data.addressType,
                },
                { isDefault: false }
            );
        }

        const address = await Address.create({
            ...data,
            user: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: "Address added successfully",
            address,
        });
    } catch (error) {
        console.error("addAddress", error);
        res.status(500).json({
            message: "Error while adding address",
        });
    }
};

// =============================
// GET ADDRESSES
// =============================
export const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({
            user: req.user._id,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: addresses.length,
            addresses,
        });
    } catch (error) {
        console.error("getAddresses", error);
        res.status(500).json({
            message: "Error while fetching addresses",
        });
    }
};

// =============================
// UPDATE ADDRESS
// =============================
export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const data = req.body;

        const address = await Address.findOne({
            _id: addressId,
            user: req.user._id,
        });

        if (!address) {
            return res.status(404).json({
                message: "Address not found",
            });
        }

        // Handle default switch
        if (data.isDefault) {
            await Address.updateMany(
                {
                    user: req.user._id,
                    addressType: address.addressType,
                },
                { isDefault: false }
            );
        }

        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            data,
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Address updated successfully",
            address: updatedAddress,
        });
    } catch (error) {
        console.error("updateAddress", error);
        res.status(500).json({
            message: "Error while updating address",
        });
    }
};

// =============================
// DELETE ADDRESS
// =============================
export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const address = await Address.findOneAndDelete({
            _id: addressId,
            user: req.user._id,
        });

        if (!address) {
            return res.status(404).json({
                message: "Address not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Address deleted successfully",
        });
    } catch (error) {
        console.error("deleteAddress", error);
        res.status(500).json({
            message: "Error while deleting address",
        });
    }
};

// =============================
// GET DEFAULT ADDRESS
// =============================
export const getDefaultAddress = async (req, res) => {
    try {
        const { addressType } = req.query;

        const address = await Address.findOne({
            user: req.user._id,
            addressType,
            isDefault: true,
        });

        res.status(200).json({
            success: true,
            address,
        });
    } catch (error) {
        console.error("getDefaultAddress", error);
        res.status(500).json({
            message: "Error while fetching default address",
        });
    }
};
