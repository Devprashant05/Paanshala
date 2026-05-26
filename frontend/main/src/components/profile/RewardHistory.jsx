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
      <div className="space-y-4 md:space-y-6 animate-pulse">
        <div className="h-64 md:h-40 rounded-2xl md:rounded-3xl bg-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="h-24 md:h-28 rounded-xl md:rounded-2xl bg-gray-200" />
          <div className="h-24 md:h-28 rounded-xl md:rounded-2xl bg-gray-200" />
          <div className="h-24 md:h-28 rounded-xl md:rounded-2xl bg-gray-200" />
        </div>
        <div className="h-96 rounded-xl md:rounded-2xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* =====================================
          REWARD HERO CARD
      ===================================== */}
      <div 
        className="relative overflow-hidden rounded-2xl md:rounded-3xl p-5 md:p-6 lg:p-8 text-white shadow-xl border border-white/10"
        style={{ background: 'linear-gradient(135deg, #2d5016, #264B0E, #3d6820)' }}
      >
        {/* Background Glow Effects */}
        <div className="absolute top-0 right-0 w-64 md:w-80 h-64 md:h-80 rounded-full blur-3xl" style={{ background: 'rgba(212, 175, 55, 0.1)' }} />
        <div className="absolute -bottom-10 -left-10 w-56 md:w-72 h-56 md:h-72 rounded-full blur-3xl" style={{ background: 'rgba(212, 175, 55, 0.1)' }} />

        {/* Decorative Stars */}
        <div className="absolute top-4 md:top-8 right-4 md:right-8 opacity-20">
          <Star className="w-6 md:w-8 h-6 md:h-8 text-[#d4af37] fill-current" />
        </div>
        <div className="absolute bottom-8 md:bottom-12 left-4 md:left-8 opacity-10">
          <Star className="w-4 md:w-6 h-4 md:h-6 text-[#d4af37] fill-current" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 md:gap-8">
          {/* Top Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-4 md:mb-5">
              <span className="text-xs md:text-sm font-bold tracking-wider">
                PAANSHALA REWARDS
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-2 md:mb-3">
              {summary.currentBalance}
              <span className="text-[#d4af37] ml-2 md:ml-3">Points</span>
            </h2>

            <p className="text-white/90 text-base md:text-lg font-medium mb-4 md:mb-6">
              Available reward balance
            </p>

            <div 
              className="inline-flex items-center gap-2 md:gap-2.5 rounded-full px-4 md:px-5 py-2 md:py-2.5 text-[#1a1a1a] font-bold shadow-xl text-sm md:text-base"
              style={{ background: 'linear-gradient(to right, #d4af37, #d4a574)' }}
            >
              <Coins className="w-4 md:w-5 h-4 md:h-5" />
              <span>1 Point = ₹1 Savings</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
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
      <div className="bg-white rounded-2xl md:rounded-3xl border-2 border-gray-100 shadow-lg overflow-hidden">
        {/* Header */}
        <div 
          className="border-b border-gray-100 p-4 md:p-6"
          style={{ background: 'linear-gradient(to right, #fafaf6, white)' }}
        >
          <div className="flex items-start md:items-center justify-between gap-3 md:gap-4 flex-col md:flex-row">
            <div className="flex items-center gap-2 md:gap-3">
              <div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2d5016, #3d6820)' }}
              >
                <Receipt className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900">
                  Reward Activity
                </h3>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                  Track all your earned and redeemed points
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#2d5016]/5 px-3 md:px-4 py-1.5 md:py-2 border border-[#2d5016]/20">
              <Gift className="w-3.5 md:w-4 h-3.5 md:h-4 text-[#2d5016]" />
              <span className="text-xs md:text-sm font-bold text-[#2d5016]">
                {rewards.length}{" "}
                {rewards.length === 1 ? "Activity" : "Activities"}
              </span>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {rewards.length === 0 ? (
          <div className="py-16 md:py-24 px-4 md:px-6 text-center">
            <div 
              className="w-20 h-20 md:w-24 md:h-24 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6"
              style={{ background: 'linear-gradient(135deg, rgba(45, 80, 22, 0.1), rgba(61, 104, 32, 0.1))' }}
            >
              <Gift className="w-10 h-10 md:w-12 md:h-12 text-[#2d5016]" />
            </div>

            <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              No Rewards Yet
            </h4>

            <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto mb-4 md:mb-6">
              Start shopping with Paanshala to earn reward points on every
              successful order and redeem them for amazing savings!
            </p>

            <button 
              className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-full text-white font-semibold shadow-lg hover:opacity-90 transition-opacity text-sm md:text-base"
              style={{ background: 'linear-gradient(to right, #2d5016, #3d6820)' }}
            >
              <Star className="w-4 h-4" />
              Start Earning Rewards
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rewards.map((reward) => {
              const isEarned = reward.type === "earned";

              return (
                <div
                  key={reward._id}
                  className="p-4 md:p-6 hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-start gap-3 md:gap-5">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}
                      style={isEarned 
                        ? { background: 'linear-gradient(135deg, #d1fae5, #ecfdf5)' }
                        : { background: 'linear-gradient(135deg, #fee2e2, #fef2f2)' }
                      }
                    >
                      {isEarned ? (
                        <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-green-700" />
                      ) : (
                        <TrendingDown className="w-6 h-6 md:w-7 md:h-7 text-red-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2 md:gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <h4 className="font-bold text-gray-900 text-sm md:text-lg">
                                  {isEarned
                                    ? "Reward Points Earned"
                                    : "Reward Points Redeemed"}
                                </h4>

                                <span
                                  className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full ${
                                    isEarned
                                      ? "bg-green-100 text-green-700 border border-green-200"
                                      : "bg-red-100 text-red-600 border border-red-200"
                                  }`}
                                >
                                  {isEarned ? "EARNED" : "REDEEMED"}
                                </span>
                              </div>

                              <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-2 md:mb-3">
                                {reward.description}
                              </p>

                              {/* Meta */}
                              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
                                {reward.orderId?.orderNumber && (
                                  <div className="inline-flex items-center gap-1 md:gap-1.5">
                                    <Receipt className="w-3.5 md:w-4 h-3.5 md:h-4 text-[#2d5016]" />
                                    <span className="font-medium">
                                      Order #{reward.orderId.orderNumber}
                                    </span>
                                  </div>
                                )}

                                <div className="inline-flex items-center gap-1 md:gap-1.5">
                                  <Calendar className="w-3.5 md:w-4 h-3.5 md:h-4 text-[#2d5016]" />
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
                              <div className="text-xl md:text-3xl font-black">
                                {isEarned ? "+" : "-"}
                                {reward.points}
                              </div>
                              <div className="text-[10px] md:text-xs font-semibold text-gray-500 mt-0.5 md:mt-1">
                                points
                              </div>
                            </div>
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
    <div className="rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-5 hover:bg-white/15 transition-all">
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div
          className={`w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center ${
            positive
              ? "bg-green-500/30 text-green-200"
              : "bg-white/20 text-white/90"
          }`}
        >
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      </div>

      <p className="text-white/80 text-xs md:text-sm font-medium mb-1">{label}</p>

      <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">{value}</h3>
    </div>
  );
}

/* =====================================
   QUICK STAT CARD
===================================== */
function QuickStatCard({ icon: Icon, label, value, color }) {
  const colorStyles = {
    green: { background: 'linear-gradient(135deg, rgba(45, 80, 22, 0.1), rgba(74, 124, 44, 0.1))', border: 'rgba(45, 80, 22, 0.2)', text: '#2d5016' },
    gold: { background: 'linear-gradient(135deg, rgba(244, 196, 48, 0.1), rgba(212, 165, 116, 0.1))', border: 'rgba(244, 196, 48, 0.2)', text: '#d4af37' },
    blue: { background: 'linear-gradient(135deg, rgba(239, 246, 255, 1), rgba(219, 234, 254, 0.5))', border: 'rgba(191, 219, 254, 1)', text: '#2563eb' },
  };

  const style = colorStyles[color];

  return (
    <div
      className="rounded-xl md:rounded-2xl border-2 p-4 md:p-5 hover:shadow-lg transition-all"
      style={{ background: style.background, borderColor: style.border }}
    >
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: style.text }} />
      </div>
      <p className="text-xs md:text-sm font-semibold text-gray-600 mb-1">{label}</p>
      <h4 className="text-xl md:text-2xl font-black text-gray-900">{value}</h4>
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