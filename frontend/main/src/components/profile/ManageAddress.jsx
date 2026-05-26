"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Star,
  Building2,
  Home,
  Loader2,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import { useAddressStore } from "@/stores/useAddressStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import AddressForm from "./AddressForm";

export default function ManageAddress() {
  const { addresses, fetchAddresses, deleteAddress, loading } =
    useAddressStore();

  const [openForm, setOpenForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleEdit = (addr) => {
    setEditingAddress(addr);
    setOpenForm(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setOpenForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await deleteAddress(deleteTarget._id);
    setDeleteLoading(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* ── Header with Stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {addresses.length}{" "}
              {addresses.length === 1 ? "address" : "addresses"} saved
            </p>
          </div>

          <Button
            onClick={handleAddNew}
            className="bg-linear-to-r text-white from-[#264B0E] to-brand-green-light hover:opacity-90 h-11 px-6 gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add New Address
          </Button>
        </div>

        {/* Info Banner */}
        <div className="bg-linear-to-br from-[#264B0E]/5 to-brand-green-light/5 rounded-xl p-4 border-2 border-[#264B0E]/10">
          <div className="flex gap-3">
            <div className="shrink-0">
              <div className="w-8 h-8 rounded-full bg-[#264B0E]/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[#264B0E]" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                Manage your delivery addresses for faster checkout. Set a
                default address for quick ordering.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Empty state ── */}
      {!loading && addresses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-linear-to-br from-gray-50 to-white text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-[#264B0E]/10 to-brand-green-light/10 flex items-center justify-center mb-5">
            <MapPin className="w-10 h-10 text-[#264B0E]/60" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No Saved Addresses
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Add a delivery address to speed up your checkout experience and
            ensure accurate deliveries
          </p>
          <Button
            onClick={handleAddNew}
            className="bg-linear-to-r text-white from-[#264B0E] to-brand-green-light hover:opacity-90 gap-2 h-11 px-6 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Your First Address
          </Button>
        </motion.div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && addresses.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-gray-100 bg-gray-50 p-6 space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded" />
                <div className="h-3 w-4/5 bg-gray-200 rounded" />
                <div className="h-3 w-3/5 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Address cards ── */}
      {addresses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AnimatePresence>
            {addresses.map((addr, index) => (
              <motion.div
                key={addr._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
              >
                <AddressCard
                  addr={addr}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── AddressForm slide-over / modal ── */}
      <AnimatePresence>
        {openForm && (
          <AddressForm
            onClose={() => setOpenForm(false)}
            initialData={editingAddress}
          />
        )}
      </AnimatePresence>

      {/* ── Delete confirmation dialog ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-red-100 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl">
                Remove Address?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600 pt-1">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-gray-800">
                {deleteTarget?.fullName}
              </span>
              's address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={deleteLoading}
              className="h-10"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 h-10"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing…
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Address
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ===========================
   ADDRESS CARD
=========================== */
function AddressCard({ addr, onEdit, onDelete }) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl border-2 bg-white p-6 transition-all duration-300",
        "hover:shadow-lg hover:border-[#264B0E]/30",
        addr.isDefault
          ? "border-[#264B0E]/40 shadow-md ring-2 ring-[#264B0E]/10 bg-linear-to-br from-[#264B0E]/2 to-transparent"
          : "border-gray-200",
      )}
    >
      {/* Default Badge - Top Right */}
      {addr.isDefault && (
        <div className="absolute top-0 right-0">
          <div className="flex items-center gap-1.5 bg-linear-to-r from-gold-bright to-[#d4a574] text-[#1a1a1a] text-xs font-bold px-3 py-1.5 rounded-bl-xl rounded-tr-2xl shadow-md">
            <Star className="w-3 h-3 fill-current" />
            Default
          </div>
        </div>
      )}

      {/* Top section: Icon + Name + Type */}
      <div className="flex items-start gap-3 mb-4 pr-20">
        <div className="shrink-0 mt-0.5 w-11 h-11 rounded-xl bg-linear-to-br from-[#264B0E] to-brand-green-light flex items-center justify-center shadow-sm">
          {addr.addressType === "Home" ? (
            <Home className="w-5 h-5 text-white" />
          ) : (
            <Building2 className="w-5 h-5 text-white" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-gray-900 text-lg leading-tight">
              {addr.fullName}
            </h3>
            {addr.addressType && (
              <Badge
                variant="outline"
                className="text-xs border-[#264B0E]/30 text-[#264B0E] bg-[#264B0E]/5 py-0.5 px-2"
              >
                {addr.addressType}
              </Badge>
            )}
          </div>
          {addr.companyName && (
            <p className="text-xs text-gray-500 font-medium">
              {addr.companyName}
            </p>
          )}
        </div>
      </div>

      {/* Address Details */}
      <div className="space-y-2 mb-5">
        <div className="flex items-start gap-2">
          <Navigation className="w-4 h-4 text-[#264B0E]/60 shrink-0 mt-0.5" />
          <div className="text-sm text-gray-600 leading-relaxed">
            <p>{addr.streetAddress}</p>
            {addr.landmark && (
              <p className="text-gray-500">Near {addr.landmark}</p>
            )}
            <p className="mt-1">
              {addr.city}, {addr.state} –{" "}
              <span className="font-semibold text-gray-900">
                {addr.pincode}
              </span>
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-6 h-6 rounded-lg bg-[#264B0E]/5 flex items-center justify-center shrink-0">
              <Phone className="w-3 h-3 text-[#264B0E]" />
            </div>
            <span className="truncate">{addr.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-6 h-6 rounded-lg bg-[#264B0E]/5 flex items-center justify-center shrink-0">
              <Mail className="w-3 h-3 text-[#264B0E]" />
            </div>
            <span className="truncate">{addr.email}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <button
          onClick={() => onEdit(addr)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[#264B0E] bg-[#264B0E]/5 hover:bg-[#264B0E]/10 transition-all"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => onDelete(addr)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Remove
        </button>
      </div>
    </div>
  );
}