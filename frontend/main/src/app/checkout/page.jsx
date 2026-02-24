"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  CreditCard,
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Lock,
  Package,
} from "lucide-react";

import { useUserStore } from "@/stores/useUserStore";
import { useCartStore } from "@/stores/useCartStore";
import { useOrderStore } from "@/stores/useOrderStore";
import { useAddressStore } from "@/stores/useAddressStore";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();

  const { isAuthenticated, user } = useUserStore();
  const { cart, fetchCart } = useCartStore();
  const { createPaymentOrder, verifyPaymentAndCreateOrder, loading } =
    useOrderStore();
  const {
    addresses,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
  } = useAddressStore();

  const [selectedBilling, setSelectedBilling] = useState(null);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [agree, setAgree] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressType, setAddressType] = useState("billing");
  const { resetCart } = useCartStore.getState();

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);

      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchCart();
    fetchAddresses();
  }, [isAuthenticated]);

  useEffect(() => {
    // Auto-select default addresses
    const defaultBilling = addresses.find(
      (addr) => addr.addressType === "billing" && addr.isDefault,
    );
    const defaultShipping = addresses.find(
      (addr) => addr.addressType === "shipping" && addr.isDefault,
    );

    if (defaultBilling && !selectedBilling)
      setSelectedBilling(defaultBilling._id);
    if (defaultShipping && !selectedShipping)
      setSelectedShipping(defaultShipping._id);
  }, [addresses]);

  useEffect(() => {
    if (sameAsShipping && selectedShipping) {
      setSelectedBilling(selectedShipping);
    }
  }, [sameAsShipping, selectedShipping]);

  if (!cart?.items?.length) {
    router.push("/cart");
    return null;
  }

  const billingAddresses = addresses.filter(
    (addr) => addr.addressType === "billing",
  );
  const shippingAddresses = addresses.filter(
    (addr) => addr.addressType === "shipping",
  );

  /* Handle Payment */
  const handlePayNow = async () => {
    if (!selectedBilling || !selectedShipping) {
      toast.error("Please select both billing and shipping address");
      return;
    }

    if (!agree) {
      toast.error("Please agree to Terms & Conditions");
      return;
    }

    const razorpayLoaded = await loadRazorpay();
    if (!razorpayLoaded) {
      toast.error("Razorpay SDK failed to load. Check your internet.");
      return;
    }

    const razorpayOrder = await createPaymentOrder();
    if (!razorpayOrder) return;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: razorpayOrder.amount,
      currency: "INR",
      name: "Paanshala",
      description: "Order Payment",
      order_id: razorpayOrder.id,

      prefill: {
        name: user.full_name,
        email: user.email,
        contact: user.phone || "",
      },

      handler: async (response) => {
        await verifyPaymentAndCreateOrder({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          billingAddressId: selectedBilling,
          shippingAddressId: selectedShipping,
        });

        resetCart();

        router.push("/orders");
      },

      modal: {
        ondismiss: () => {
          toast.error("Payment cancelled");
        },
      },

      theme: {
        color: "#2d5016",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  /* Open Add Address Modal */
  const handleAddAddress = (type) => {
    setAddressType(type);
    setEditingAddress(null);
    setShowAddressModal(true);
  };

  /* Open Edit Address Modal */
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressType(address.addressType);
    setShowAddressModal(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-[#fafaf6] to-white py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <Step icon={ShoppingBag} label="Cart" completed />
            <StepLine completed />
            <Step icon={MapPin} label="Address" active />
            <StepLine />
            <Step icon={CreditCard} label="Payment" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT - ADDRESS SELECTION */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card className="border-2 border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#2d5016]" />
                    Shipping Address
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddAddress("shipping")}
                    className="border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016] hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add New
                  </Button>
                </div>

                <RadioGroup
                  value={selectedShipping}
                  onValueChange={setSelectedShipping}
                >
                  <div className="space-y-3">
                    {shippingAddresses.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No shipping address found</p>
                        <Button
                          variant="link"
                          onClick={() => handleAddAddress("shipping")}
                          className="text-[#2d5016] mt-2"
                        >
                          Add your first address
                        </Button>
                      </div>
                    ) : (
                      shippingAddresses.map((address) => (
                        <AddressCard
                          key={address._id}
                          address={address}
                          selected={selectedShipping === address._id}
                          onSelect={() => setSelectedShipping(address._id)}
                          onEdit={() => handleEditAddress(address)}
                          onDelete={() => deleteAddress(address._id)}
                        />
                      ))
                    )}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card className="border-2 border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#2d5016]" />
                    Billing Address
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddAddress("billing")}
                    className="border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016] hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add New
                  </Button>
                </div>

                {/* Same as Shipping Checkbox */}
                <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <Checkbox
                    id="same-as-shipping"
                    checked={sameAsShipping}
                    onCheckedChange={setSameAsShipping}
                  />
                  <label
                    htmlFor="same-as-shipping"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Same as shipping address
                  </label>
                </div>

                {!sameAsShipping && (
                  <RadioGroup
                    value={selectedBilling}
                    onValueChange={setSelectedBilling}
                  >
                    <div className="space-y-3">
                      {billingAddresses.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No billing address found</p>
                          <Button
                            variant="link"
                            onClick={() => handleAddAddress("billing")}
                            className="text-[#2d5016] mt-2"
                          >
                            Add your first address
                          </Button>
                        </div>
                      ) : (
                        billingAddresses.map((address) => (
                          <AddressCard
                            key={address._id}
                            address={address}
                            selected={selectedBilling === address._id}
                            onSelect={() => setSelectedBilling(address._id)}
                            onEdit={() => handleEditAddress(address)}
                            onDelete={() => deleteAddress(address._id)}
                          />
                        ))
                      )}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT - ORDER SUMMARY */}
          <div className="lg:sticky lg:top-24 h-fit">
            <OrderSummary
              cart={cart}
              agree={agree}
              setAgree={setAgree}
              onPayNow={handlePayNow}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Add/Edit Address Modal */}
      <AddressModal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        addressType={addressType}
        editingAddress={editingAddress}
        onSave={async (data) => {
          if (editingAddress) {
            await updateAddress(editingAddress._id, data);
          } else {
            await addAddress(data);
          }
          setShowAddressModal(false);
        }}
      />
    </div>
  );
}

/* =========================
   PROGRESS STEP
========================= */
function Step({ icon: Icon, label, active, completed }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center transition-all",
          completed
            ? "bg-green-500 text-white"
            : active
              ? "bg-linear-to-br from-[#2d5016] to-[#3d6820] text-white"
              : "bg-gray-200 text-gray-500",
        )}
      >
        {completed ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <Icon className="w-6 h-6" />
        )}
      </div>
      <span
        className={cn(
          "text-xs md:text-sm font-medium",
          active || completed ? "text-gray-900" : "text-gray-500",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function StepLine({ completed }) {
  return (
    <div
      className={cn(
        "h-0.5 w-12 md:w-24",
        completed ? "bg-green-500" : "bg-gray-200",
      )}
    />
  );
}

/* =========================
   ADDRESS CARD
========================= */
function AddressCard({ address, selected, onSelect, onEdit, onDelete }) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative border-2 rounded-xl p-4 cursor-pointer transition-all",
        selected
          ? "border-[#2d5016] bg-[#2d5016]/5"
          : "border-gray-200 hover:border-gray-300",
      )}
    >
      <div className="flex items-start gap-3">
        <RadioGroupItem value={address._id} className="mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-bold text-gray-900">{address.fullName}</p>
            {address.isDefault && (
              <span className="text-xs bg-[#d4af37] text-black px-2 py-0.5 rounded-full font-semibold">
                Default
              </span>
            )}
          </div>

          {address.companyName && (
            <p className="text-sm text-gray-600 mb-1">{address.companyName}</p>
          )}

          <p className="text-sm text-gray-700 mb-1">
            {address.streetAddress}
            {address.landmark && `, ${address.landmark}`}
          </p>

          <p className="text-sm text-gray-700 mb-2">
            {address.city}, {address.state} - {address.pincode}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>📞 {address.phone}</span>
            <span>📧 {address.email}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Are you sure you want to delete this address?")) {
                onDelete();
              }
            }}
            className="p-2 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   ORDER SUMMARY
========================= */
function OrderSummary({ cart, agree, setAgree, onPayNow, loading }) {
  return (
    <Card className="border-2 border-gray-100 shadow-xl">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

        {/* Items */}
        <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
          {cart.items.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={item.product?.images?.[0] || "/placeholder-product.png"}
                  alt={item.product?.name || "Product"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                  {item.product?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {item.variantSetSize && `${item.variantSetSize} pieces • `}
                  Qty: {item.quantity}
                </p>
              </div>
              <div className="text-sm font-bold text-gray-900">
                ₹{item.totalPrice}
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
          <PriceRow label="Subtotal" value={`₹${cart.subtotal}`} />
          {cart.discount > 0 && (
            <PriceRow
              label="Discount"
              value={`-₹${cart.discount}`}
              highlight="green"
            />
          )}
          <PriceRow label="Shipping" value="FREE" highlight="green" />
          <div className="border-t border-gray-200 pt-3">
            <PriceRow
              label="Total Amount"
              value={`₹${cart.totalAmount}`}
              bold
            />
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="flex items-start gap-2 mb-6 p-3 bg-gray-50 rounded-lg">
          <Checkbox
            id="agree-terms"
            checked={agree}
            onCheckedChange={setAgree}
            className="mt-0.5"
          />
          <label
            htmlFor="agree-terms"
            className="text-sm text-gray-700 cursor-pointer"
          >
            I agree to the{" "}
            <a href="/terms" className="text-[#2d5016] underline font-medium">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-[#2d5016] underline font-medium">
              Privacy Policy
            </a>
          </label>
        </div>

        {/* Pay Button */}
        <Button
          onClick={onPayNow}
          disabled={loading || !agree}
          className="w-full h-14 bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white font-bold text-lg shadow-lg"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Pay ₹{cart.totalAmount}
            </span>
          )}
        </Button>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
          <CheckCircle className="w-4 h-4 text-green-600" />
          Secure payment powered by Razorpay
        </div>
      </CardContent>
    </Card>
  );
}

function PriceRow({ label, value, bold, highlight }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        bold && "text-lg font-bold text-gray-900",
        !bold && "text-sm text-gray-700",
        highlight === "green" && "text-green-600 font-semibold",
      )}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* =========================
   ADDRESS MODAL
========================= */
function AddressModal({ open, onClose, addressType, editingAddress, onSave }) {
  const [formData, setFormData] = useState({
    addressType: addressType,
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
    if (editingAddress) {
      setFormData(editingAddress);
    } else {
      setFormData({
        addressType: addressType,
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
    }
  }, [editingAddress, addressType, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {editingAddress ? "Edit" : "Add"}{" "}
            {addressType === "billing" ? "Billing" : "Shipping"} Address
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="companyName">Company Name (Optional)</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="streetAddress">Street Address *</Label>
            <Input
              id="streetAddress"
              value={formData.streetAddress}
              onChange={(e) =>
                setFormData({ ...formData, streetAddress: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="landmark">Landmark (Optional)</Label>
            <Input
              id="landmark"
              value={formData.landmark}
              onChange={(e) =>
                setFormData({ ...formData, landmark: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) =>
                  setFormData({ ...formData, pincode: e.target.value })
                }
                pattern="\d{6}"
                maxLength={6}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                pattern="\d{10}"
                maxLength={10}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isDefault: checked })
              }
            />
            <label
              htmlFor="isDefault"
              className="text-sm font-medium cursor-pointer"
            >
              Set as default {addressType} address
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-linear-to-r from-[#2d5016] to-[#3d6820]"
            >
              {editingAddress ? "Update" : "Add"} Address
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
