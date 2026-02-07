"use client";

import { useState, useEffect } from "react";
import { useAddressStore } from "@/stores/useAddressStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddressForm({ onClose, initialData }) {
  const { addAddress, updateAddress, loading } = useAddressStore();

  const [form, setForm] = useState({
    addressType: "shipping",
    fullName: "",
    companyName: "",
    streetAddress: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    isDefault: false,
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = initialData
      ? await updateAddress(initialData._id, form)
      : await addAddress(form);

    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4">
        <h3 className="text-lg font-bold">
          {initialData ? "Edit Address" : "Add New Address"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <InputField
            label="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
          />
          <InputField
            label="Company Name"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
          />
          <InputField
            label="Street Address"
            name="streetAddress"
            value={form.streetAddress}
            onChange={handleChange}
          />
          <InputField
            label="Landmark"
            name="landmark"
            value={form.landmark}
            onChange={handleChange}
          />
          <InputField
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
          />
          <InputField
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
          />
          <InputField
            label="Pincode"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
          />
          <InputField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
          <InputField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isDefault"
              checked={form.isDefault}
              onChange={handleChange}
            />
            <span className="text-sm">Set as default</span>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#2d5016] hover:bg-[#3d6820]"
            >
              {loading ? "Saving..." : "Save Address"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input {...props} required />
    </div>
  );
}
