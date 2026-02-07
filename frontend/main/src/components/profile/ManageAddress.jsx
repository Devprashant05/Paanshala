"use client";

import { useEffect, useState } from "react";
import { useAddressStore } from "@/stores/useAddressStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AddressForm from "./AddressForm";

export default function ManageAddress() {
  const { addresses, fetchAddresses, deleteAddress, loading } =
    useAddressStore();

  const [openForm, setOpenForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Manage Addresses</h2>
          <p className="text-sm text-gray-500">
            Add or update your billing and shipping addresses
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingAddress(null);
            setOpenForm(true);
          }}
          className="bg-[#2d5016] hover:bg-[#3d6820]"
        >
          + Add Address
        </Button>
      </div>

      {/* Address List */}
      {addresses.length === 0 ? (
        <p className="text-gray-500 text-sm">No addresses added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="border rounded-xl p-4 bg-white space-y-2"
            >
              <div className="flex items-center gap-2">
                <p className="font-semibold">{addr.fullName}</p>
                {addr.isDefault && (
                  <Badge className="bg-green-600">Default</Badge>
                )}
                <Badge variant="outline">{addr.addressType}</Badge>
              </div>

              <p className="text-sm text-gray-600">
                {addr.streetAddress}, {addr.landmark && `${addr.landmark}, `}
                {addr.city}, {addr.state} – {addr.pincode}
              </p>

              <p className="text-sm text-gray-600">
                📞 {addr.phone} | ✉ {addr.email}
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  className="text-sm text-[#2d5016] font-medium"
                  onClick={() => {
                    setEditingAddress(addr);
                    setOpenForm(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-sm text-red-600 font-medium"
                  onClick={() => deleteAddress(addr._id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      {openForm && (
        <AddressForm
          onClose={() => setOpenForm(false)}
          initialData={editingAddress}
        />
      )}
    </div>
  );
}
