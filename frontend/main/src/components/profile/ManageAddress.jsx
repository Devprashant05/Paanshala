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
    <div className="space-y-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-[#2d5016] tracking-tight">
            Saved Addresses
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your delivery and billing addresses
          </p>
        </div>

        <Button
          onClick={handleAddNew}
          className="bg-[#2d5016] hover:bg-[#3d6820] h-10 px-5 gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Address
        </Button>
      </motion.div>

      {/* ── Empty state ── */}
      {!loading && addresses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#2d5016]/8 flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-[#2d5016]/50" />
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            No saved addresses
          </h3>
          <p className="text-sm text-gray-400 mb-5 max-w-xs">
            Add a delivery address to speed up your checkout experience
          </p>
          <Button
            onClick={handleAddNew}
            className="bg-[#2d5016] hover:bg-[#3d6820] gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </Button>
        </motion.div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && addresses.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-5 space-y-3 animate-pulse"
            >
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-3 w-3/4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* ── Address cards ── */}
      {addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        "group relative rounded-2xl border bg-white p-5 transition-all duration-300",
        "hover:shadow-md hover:border-[#2d5016]/30",
        addr.isDefault
          ? "border-[#2d5016]/40 shadow-sm ring-1 ring-[#2d5016]/10"
          : "border-gray-200",
      )}
    >
      {/* Default ribbon */}
      {addr.isDefault && (
        <div className="absolute top-0 right-0">
          <div className="flex items-center gap-1 bg-[#2d5016] text-white text-xs font-semibold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
            <CheckCircle2 className="w-3 h-3" />
            Default
          </div>
        </div>
      )}

      {/* Top row: name + type badge */}
      <div className="flex items-start gap-3 mb-3 pr-16">
        <div className="shrink-0 mt-0.5 w-9 h-9 rounded-xl bg-[#2d5016]/8 flex items-center justify-center">
          {addr.addressType === "Home" ? (
            <Home className="w-4 h-4 text-[#2d5016]" />
          ) : (
            <Building2 className="w-4 h-4 text-[#2d5016]" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-900 text-base leading-tight truncate">
              {addr.fullName}
            </p>
            {addr.addressType && (
              <Badge
                variant="outline"
                className="text-xs border-[#2d5016]/30 text-[#2d5016] bg-[#2d5016]/5 py-0"
              >
                {addr.addressType}
              </Badge>
            )}
          </div>
          {addr.companyName && (
            <p className="text-xs text-gray-400 mt-0.5">{addr.companyName}</p>
          )}
        </div>
      </div>

      {/* Address lines */}
      <div className="space-y-1.5 mb-4 pl-12">
        <p className="text-sm text-gray-600 leading-snug">
          {addr.streetAddress}
          {addr.landmark && (
            <span className="text-gray-400">, {addr.landmark}</span>
          )}
        </p>
        <p className="text-sm text-gray-600">
          {addr.city}, {addr.state} –{" "}
          <span className="font-semibold text-gray-700">{addr.pincode}</span>
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <Phone className="w-3 h-3 text-[#2d5016]/60" />
            {addr.phone}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <Mail className="w-3 h-3 text-[#2d5016]/60" />
            {addr.email}
          </span>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => onEdit(addr)}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#2d5016] hover:text-[#3d6820] transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit
        </button>
        <span className="text-gray-200 select-none">|</span>
        <button
          onClick={() => onDelete(addr)}
          className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove
        </button>
      </div>
    </div>
  );
}