"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, AlertTriangle, ShieldAlert, Loader2, X } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const CONFIRM_PHRASE = "DELETE";

const CONSEQUENCES = [
  "Your profile and personal information",
  "All saved addresses",
  "Complete order history",
  "Loyalty points and rewards",
];

export default function DeleteAccount() {
  const { deleteAccount, loading } = useUserStore();

  const [showDialog, setShowDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const isConfirmed = confirmText === CONFIRM_PHRASE;

  const handleDelete = async () => {
    if (!isConfirmed) return;
    await deleteAccount();
    setShowDialog(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Delete Account</h2>
            <p className="text-sm text-gray-500 leading-tight mt-0.5">
              Permanent and irreversible action
            </p>
          </div>
        </div>

        {/* Warning card */}
        <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium leading-relaxed">
              Once deleted, your account cannot be recovered. All associated
              data will be permanently erased from our systems.
            </p>
          </div>

          {/* Consequences list */}
          <div className="space-y-2 pl-8">
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              This will permanently delete:
            </p>
            {CONSEQUENCES.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <p className="text-sm text-red-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-gray-100" />

        {/* CTA */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-gray-500 max-w-sm">
            If you have concerns, consider contacting support before deleting
            your account.
          </p>
          <Button
            variant="outline"
            onClick={() => setShowDialog(true)}
            disabled={loading}
            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700 gap-2 h-10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete My Account
          </Button>
        </div>
      </motion.div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-red-100 rounded-full shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl">
                Are you absolutely sure?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-1">
                <p className="text-gray-600 text-sm leading-relaxed">
                  This action{" "}
                  <span className="font-semibold text-gray-800">
                    cannot be undone
                  </span>
                  . Your account and all associated data will be permanently
                  deleted.
                </p>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">
                    Type{" "}
                    <span className="font-mono bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-xs">
                      DELETE
                    </span>{" "}
                    to confirm
                  </p>
                  <Input
                    value={confirmText}
                    onChange={(e) =>
                      setConfirmText(e.target.value.toUpperCase())
                    }
                    placeholder="Type DELETE to confirm"
                    className={`h-11 font-mono tracking-widest ${
                      confirmText && !isConfirmed
                        ? "border-red-300 focus-visible:ring-red-400"
                        : isConfirmed
                          ? "border-green-400 focus-visible:ring-green-300"
                          : ""
                    }`}
                  />
                  {confirmText && !isConfirmed && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Please type DELETE exactly to confirm
                    </p>
                  )}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 mt-2">
            <AlertDialogCancel
              onClick={() => {
                setShowDialog(false);
                setConfirmText("");
              }}
              disabled={loading}
              className="h-10"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!isConfirmed || loading}
              className="bg-red-600 hover:bg-red-700 h-10 disabled:opacity-40 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Permanently
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}