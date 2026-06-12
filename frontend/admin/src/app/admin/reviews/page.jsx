"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Search,
  Filter,
  X,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
  MessageSquare,
  User,
  Package,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Image from "next/image";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "w-3.5 h-3.5",
            s <= rating ? "fill-[#d4af37] text-[#d4af37]" : "text-gray-200",
          )}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null); // reviewId being toggled
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reviews/admin/all");
      setReviews(res.data.reviews || []);
    } catch {
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggle = async (review) => {
    setToggling(review._id);
    try {
      await api.patch(`/reviews/admin/toggle/${review._id}`, {
        isApproved: !review.isApproved,
      });
      setReviews((prev) =>
        prev.map((r) =>
          r._id === review._id ? { ...r, isApproved: !r.isApproved } : r,
        ),
      );
      toast.success(review.isApproved ? "Review hidden" : "Review approved");
    } catch {
      toast.error("Failed to update review");
    } finally {
      setToggling(null);
    }
  };

  const filtered = useMemo(() => {
    let data = reviews;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.user?.full_name?.toLowerCase().includes(q) ||
          r.user?.email?.toLowerCase().includes(q) ||
          r.product?.name?.toLowerCase().includes(q) ||
          r.review?.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      data = data.filter((r) =>
        statusFilter === "approved" ? r.isApproved : !r.isApproved,
      );
    }
    return data;
  }, [reviews, search, statusFilter]);

  const stats = {
    total: reviews.length,
    approved: reviews.filter((r) => r.isApproved).length,
    hidden: reviews.filter((r) => !r.isApproved).length,
    avgRating: reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0",
  };

  return (
    <div className="space-y-8 max-w-450">
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-4xl lg:text-5xl font-bold text-[#12351a] mb-2">
          Reviews
        </h1>
        <p className="text-base text-gray-600">
          Moderate and manage customer product reviews
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total",
            value: stats.total,
            icon: MessageSquare,
            color: "blue",
          },
          {
            label: "Approved",
            value: stats.approved,
            icon: CheckCircle,
            color: "emerald",
          },
          { label: "Hidden", value: stats.hidden, icon: XCircle, color: "red" },
          {
            label: "Avg Rating",
            value: stats.avgRating,
            icon: Star,
            color: "amber",
          },
        ].map(({ label, value, icon: Icon, color }, i) => {
          const colors = {
            blue: {
              bg: "bg-blue-100",
              icon: "text-blue-600",
              border: "border-blue-200",
            },
            emerald: {
              bg: "bg-emerald-100",
              icon: "text-emerald-600",
              border: "border-emerald-200",
            },
            red: {
              bg: "bg-red-100",
              icon: "text-red-600",
              border: "border-red-200",
            },
            amber: {
              bg: "bg-amber-100",
              icon: "text-amber-600",
              border: "border-amber-200",
            },
          }[color];
          return (
            <motion.div
              key={label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card
                className={cn(
                  "border shadow-md hover:shadow-lg transition-all",
                  colors.border,
                )}
              >
                <CardContent className="pt-6">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                      colors.bg,
                    )}
                  >
                    <Icon className={cn("w-6 h-6", colors.icon)} />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {label}
                  </p>
                  <p className="text-4xl font-bold text-gray-900">{value}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border-gray-200 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by customer, product, or review text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 h-11">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
            {(search || statusFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="h-11"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card className="border-gray-200 shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#12351a]" />
            All Reviews ({filtered.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#12351a]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No reviews found
              </h3>
              <p className="text-sm text-gray-500">
                {search || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Reviews will appear here once customers submit them"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filtered.map((review, index) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card
                      className={cn(
                        "border shadow-sm hover:shadow-md transition-all",
                        review.isApproved
                          ? "border-gray-200"
                          : "border-gray-100 bg-gray-50/50",
                      )}
                    >
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          {/* Product image */}
                          {review.product?.images?.[0] && (
                            <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                              <Image
                                src={review.product.images[0]}
                                alt={review.product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Product + status */}
                            <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="text-sm font-semibold text-gray-900">
                                  {review.product?.name || "Unknown Product"}
                                </span>
                                {review.isApproved ? (
                                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Visible
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    Hidden
                                  </Badge>
                                )}
                              </div>

                              {/* Toggle button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggle(review)}
                                disabled={toggling === review._id}
                                className={cn(
                                  "h-8 px-3 text-xs shrink-0",
                                  review.isApproved
                                    ? "bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100"
                                    : "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100",
                                )}
                              >
                                {toggling === review._id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : review.isApproved ? (
                                  <>
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3 h-3 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                            </div>

                            {/* Rating + date */}
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <StarDisplay rating={review.rating} />
                              <span className="text-xs font-bold text-gray-700">
                                {review.rating}.0
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(review.createdAt)}
                              </span>
                            </div>

                            {/* Review text */}
                            {review.review ? (
                              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                "{review.review}"
                              </p>
                            ) : (
                              <p className="text-xs text-gray-400 italic mb-3">
                                No written review — rating only
                              </p>
                            )}

                            {/* Customer */}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <User className="w-3.5 h-3.5" />
                              <span className="font-medium text-gray-700">
                                {review.user?.full_name || "Unknown"}
                              </span>
                              <span>·</span>
                              <span>{review.user?.email || "—"}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
