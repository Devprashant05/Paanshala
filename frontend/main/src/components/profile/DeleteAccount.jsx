"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  X,
  HelpCircle,
} from "lucide-react";
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
  "Wishlist and saved items",
  "All account preferences",
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
        className="space-y-6 max-w-3xl"
      >
        {/* Danger Warning Banner */}
        <div className="rounded-2xl border-2 border-red-200 bg-linear-to-br from-red-50 to-red-50/30 p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 mb-2">
                Danger Zone - Account Deletion
              </h3>
              <p className="text-sm text-red-700 leading-relaxed">
                Once deleted, your account cannot be recovered. This is a
                permanent and irreversible action that will erase all your data
                from our systems.
              </p>
            </div>
          </div>
        </div>

        {/* What Will Be Deleted */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              What Will Be Permanently Deleted
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CONSEQUENCES.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-red-50/50 border border-red-100"
              >
                <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-snug">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Alternative Options */}
        <div className="bg-linear-to-br from-[#264B0E]/5 to-brand-green-light/5 rounded-2xl border-2 border-[#264B0E]/10 p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#264B0E]/10 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-[#264B0E]" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Consider These Alternatives
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#264B0E] font-bold">•</span>
                  <span>
                    <strong>Privacy concerns?</strong> Update your privacy
                    settings or contact support
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#264B0E] font-bold">•</span>
                  <span>
                    <strong>Too many emails?</strong> Adjust your notification
                    preferences
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#264B0E] font-bold">•</span>
                  <span>
                    <strong>Account issues?</strong> Our support team is here to
                    help
                  </span>
                </li>
              </ul>
              <div className="mt-4">
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#264B0E] hover:text-brand-green-light transition-colors"
                >
                  Contact Support Instead
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t-2 border-gray-100">
          <div className="flex-1">
            <p className="text-sm text-gray-700 font-medium mb-1">
              Still want to proceed?
            </p>
            <p className="text-xs text-gray-500">
              This action cannot be undone. Please be certain before continuing.
            </p>
          </div>
          <Button
            onClick={() => setShowDialog(true)}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white gap-2 h-11 px-6 shadow-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete My Account
          </Button>
        </div>
      </motion.div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-w-md bg-white">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-100 rounded-xl shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl text-accent-foreground">
                Are you absolutely sure?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-2">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700 leading-relaxed">
                    ⚠️ This action{" "}
                    <span className="font-bold">cannot be undone</span>. Your
                    account and all associated data will be{" "}
                    <span className="font-bold">permanently deleted</span> from
                    our systems.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Type{" "}
                      <span className="font-mono bg-red-100 text-red-700 px-2 py-1 rounded text-xs border border-red-200">
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
                      className={`h-12 font-mono tracking-widest text-accent-foreground text-center text-lg ${
                        confirmText && !isConfirmed
                          ? "border-red-300 focus-visible:ring-red-400"
                          : isConfirmed
                            ? "border-green-500 focus-visible:ring-green-400 bg-green-50"
                            : "border-gray-200"
                      }`}
                    />
                  </div>

                  {confirmText && !isConfirmed && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">
                        Please type <strong>DELETE</strong> exactly as shown
                        above
                      </p>
                    </div>
                  )}

                  {isConfirmed && (
                    <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <p className="text-xs text-green-700 font-medium">
                        Confirmation verified. You may now proceed.
                      </p>
                    </div>
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
              className="h-11 px-6 border-gray-200"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!isConfirmed || loading}
              className="bg-red-600 hover:bg-red-700 h-11 px-6 disabled:opacity-40 gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting Account…
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