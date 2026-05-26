"use client";

import { useEffect } from "react";
import { useRewardStore } from "@/stores/useRewardStore";
import {
  Gift,
  TrendingUp,
  TrendingDown,
  Coins,
  Calendar,
  Receipt,
  Sparkles,
  Award,
  Star,
} from "lucide-react";

export default function RewardHistory() {
  const { rewards, summary, loading, getRewardHistory } = useRewardStore();

  useEffect(() => {
    getRewardHistory();
  }, [getRewardHistory]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 rounded-3xl bg-gray-100" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 rounded-2xl bg-gray-100" />
          <div className="h-28 rounded-2xl bg-gray-100" />
          <div className="h-28 rounded-2xl bg-gray-100" />
        </div>
        <div className="h-96 rounded-2xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =====================================
          REWARD HERO CARD
      ===================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-green-dark via-[#264B0E] to-brand-green-light p-6 md:p-8 text-white shadow-2xl border border-white/10">
        {/* Background Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-bright/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gold-bright/10 rounded-full blur-3xl" />

        {/* Decorative Stars */}
        <div className="absolute top-8 right-8 opacity-20">
          <Star className="w-8 h-8 text-gold-bright fill-current" />
        </div>
        <div className="absolute bottom-12 left-8 opacity-10">
          <Star className="w-6 h-6 text-gold-bright fill-current" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-5">
              <span className="text-sm font-bold tracking-wider">
                PAANSHALA REWARDS
              </span>
            </div>

            <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-3">
              {summary.currentBalance}
              <span className="text-gold-bright ml-3">Points</span>
            </h2>

            <p className="text-white/90 text-lg font-medium mb-6">
              Available reward balance
            </p>

            <div className="inline-flex items-center gap-2.5 rounded-full bg-linear-to-r from-gold-bright to-[#d4a574] px-5 py-2.5 text-[#1a1a1a] font-bold shadow-xl">
              <Coins className="w-5 h-5" />
              <span>1 Point = ₹1 Savings</span>
            </div>
          </div>

          {/* Right Stats */}
          <div className="grid grid-cols-2 gap-4 min-w-75">
            <StatCard
              icon={TrendingUp}
              label="Total Earned"
              value={summary.totalEarned}
              positive
            />

            <StatCard
              icon={TrendingDown}
              label="Redeemed"
              value={summary.totalRedeemed}
            />
          </div>
        </div>
      </div>

      {/* =====================================
          QUICK STATS CARDS
      ===================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickStatCard
          icon={Award}
          label="Current Balance"
          value={`${summary.currentBalance} pts`}
          color="green"
        />
        <QuickStatCard
          icon={Gift}
          label="Lifetime Earned"
          value={`${summary.totalEarned} pts`}
          color="gold"
        />
        <QuickStatCard
          icon={Coins}
          label="Total Saved"
          value={`₹${summary.totalRedeemed}`}
          color="blue"
        />
      </div>

      {/* =====================================
          REWARD HISTORY
      ===================================== */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-100 p-6 bg-linear-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#264B0E] to-brand-green-light flex items-center justify-center">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Reward Activity
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Track all your earned and redeemed points
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#264B0E]/5 px-4 py-2 border border-[#264B0E]/20">
              <Gift className="w-4 h-4 text-[#264B0E]" />
              <span className="text-sm font-bold text-[#264B0E]">
                {rewards.length}{" "}
                {rewards.length === 1 ? "Activity" : "Activities"}
              </span>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {rewards.length === 0 ? (
          <div className="py-24 px-6 text-center">
            <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-[#264B0E]/10 to-brand-green-light/10 flex items-center justify-center mx-auto mb-6">
              <Gift className="w-12 h-12 text-[#264B0E]" />
            </div>

            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              No Rewards Yet
            </h4>

            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Start shopping with Paanshala to earn reward points on every
              successful order and redeem them for amazing savings!
            </p>

            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-linear-to-r from-[#264B0E] to-brand-green-light text-white font-semibold shadow-lg hover:opacity-90 transition-opacity">
              <Star className="w-4 h-4" />
              Start Earning Rewards
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rewards.map((reward, index) => {
              const isEarned = reward.type === "earned";

              return (
                <div
                  key={reward._id}
                  className="p-6 hover:bg-linear-to-r hover:from-gray-50 hover:to-white transition-all"
                >
                  <div className="flex items-start gap-5">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        isEarned
                          ? "bg-linear-to-br from-green-100 to-green-50 text-green-700"
                          : "bg-linear-to-br from-red-100 to-red-50 text-red-600"
                      }`}
                    >
                      {isEarned ? (
                        <TrendingUp className="w-7 h-7" />
                      ) : (
                        <TrendingDown className="w-7 h-7" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap mb-2">
                            <h4 className="font-bold text-gray-900 text-lg">
                              {isEarned
                                ? "Reward Points Earned"
                                : "Reward Points Redeemed"}
                            </h4>

                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full ${
                                isEarned
                                  ? "bg-green-100 text-green-700 border border-green-200"
                                  : "bg-red-100 text-red-600 border border-red-200"
                              }`}
                            >
                              {isEarned ? "EARNED" : "REDEEMED"}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            {reward.description}
                          </p>

                          {/* Meta */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            {reward.orderId?.orderNumber && (
                              <div className="inline-flex items-center gap-1.5">
                                <Receipt className="w-4 h-4 text-[#264B0E]" />
                                <span className="font-medium">
                                  Order #{reward.orderId.orderNumber}
                                </span>
                              </div>
                            )}

                            <div className="inline-flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-[#264B0E]" />
                              <span>{formatDate(reward.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Points */}
                        <div
                          className={`text-right shrink-0 ${
                            isEarned ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          <div className="text-3xl font-black">
                            {isEarned ? "+" : "-"}
                            {reward.points}
                          </div>
                          <div className="text-xs font-semibold text-gray-500 mt-1">
                            points
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================
   STAT CARD (Hero Card)
===================================== */
function StatCard({ icon: Icon, label, value, positive }) {
  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 hover:bg-white/15 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            positive
              ? "bg-green-500/30 text-green-200"
              : "bg-white/20 text-white/90"
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <p className="text-white/80 text-sm font-medium mb-1">{label}</p>

      <h3 className="text-3xl font-black tracking-tight text-white">{value}</h3>
    </div>
  );
}

/* =====================================
   QUICK STAT CARD
===================================== */
function QuickStatCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    green:
      "from-[#264B0E]/10 to-[#4a7c2c]/10 border-[#264B0E]/20 text-[#264B0E]",
    gold: "from-[#f4c430]/10 to-[#d4a574]/10 border-[#f4c430]/20 text-[#f4c430]",
    blue: "from-blue-50 to-blue-100/50 border-blue-200 text-blue-600",
  };

  return (
    <div
      className={`rounded-2xl border-2 bg-linear-to-br ${colorClasses[color]} p-5 hover:shadow-lg transition-all`}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
      <h4 className="text-2xl font-black text-gray-900">{value}</h4>
    </div>
  );
}

/* =====================================
   HELPERS
===================================== */
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
