"use client";

import { useUserStore } from "@/stores/useUserStore";
import { Button } from "@/components/ui/button";

export default function DeleteAccount() {
  const { deleteAccount, loading } = useUserStore();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-red-600">Delete Account</h2>

      <p className="text-sm text-gray-600">
        This action is irreversible. All your data will be permanently removed.
      </p>

      <Button variant="destructive" onClick={deleteAccount} disabled={loading}>
        Delete My Account
      </Button>
    </div>
  );
}
