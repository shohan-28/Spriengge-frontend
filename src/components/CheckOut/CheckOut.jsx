import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiFileText,
  FiMinus,
  FiPlus,
  FiTrash2,
  FiLock,
  FiCheck,
  FiShoppingBag,
} from "react-icons/fi";

import { clearCart } from "../Feature/CartSlice";
import districtData from "../DistrictData/DistrictData";

const API_URL = "https://ourbackend.spriengge.shop/api";

/* =========================================================
   NORMALIZE CART ITEM
========================================================= */

const normalizeItem = (item, forcedQuantity = null) => {
  if (!item) return null;

  const productId =
    item?.productId ??
    item?.id ??
    item?._id ??
    null;

  const variantId =
    item?.variantId ??
    item?.selectedVariant?.variantId ??
    item?.selectedVariant?.id ??
    item?.selectedVariant?._id ??
    null;

  const quantity =
    forcedQuantity !== null
      ? Math.max(1, Number(forcedQuantity) || 1)
      : Math.max(
          1,
          Number(item?.quantity ?? item?.qty ?? 1) || 1
        );

  return {
    productId,

    productName:
      item?.productName ||
      item?.name ||
      item?.title ||
      "Product",

    productImage:
      item?.productImage ||
      item?.image ||
      item?.images?.[0] ||
      "",

    variantId,

    selectedColor:
      item?.selectedColor ||
      item?.color ||
      null,

    selectedColorCode:
      item?.selectedColorCode ||
      item?.colorCode ||
      null,

    selectedSize:
      item?.selectedSize ||
      item?.size ||
      null,

    price: Number(
  item?.price ??
  item?.unitPrice ??
  0
),

quantity,

subtotal:
  Number(
    item?.price ??
    item?.unitPrice ??
    0
  ) * quantity,
  };
};

  

/* =========================================================
   CHECKOUT
========================================================= */

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const state = location.state || {};

  /* =========================================================
     BUY NOW / CART
  ========================================================= */

  const isBuyNow = Boolean(state.product);

  const product = state.product || null;

  const checkoutProductId =
  state?.productId ??
  product?.productId ??
  product?.id ??
  product?._id ??
  null;

  const buyNowQuantity = Math.max(
    1,
    Number(state.quantity) || 1
  );

  const cartItems = Array.isArray(state.cartItems)
    ? state.cartItems
    : [];

  /* =========================================================
     FORM DATA
  ========================================================= */

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    district: "",
    thana: "",
    address: "",
    note: "",
  });

  /* =========================================================
     LOADING
  ========================================================= */

  const [loading, setLoading] = useState(false);

  /* =========================================================
     ORDER ITEMS
  ========================================================= */

const [orderItems, setOrderItems] = useState(() => {
  if (isBuyNow && product) {
    const normalizedProduct = normalizeItem(
      {
        ...product,
        productId:
          checkoutProductId ??
          product?.productId ??
          product?.id ??
          product?._id ??
          null,
      },
      buyNowQuantity
    );

    return normalizedProduct
      ? [normalizedProduct]
      : [];
  }

  return cartItems
    .map((item) => normalizeItem(item))
    .filter(Boolean);
});

  /* =========================================================
     INCREASE QUANTITY
  ========================================================= */

  const increaseQuantity = (index) => {
    if (loading) return;

    setOrderItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) {
          return item;
        }

        const newQuantity =
          Number(item.quantity) + 1;

        return {
          ...item,

          quantity: newQuantity,

          subtotal:
            Number(item.price) *
            newQuantity,
        };
      })
    );
  };

  /* =========================================================
     DECREASE QUANTITY
  ========================================================= */

  const decreaseQuantity = (index) => {
    if (loading) return;

    setOrderItems((prev) =>
      prev.map((item, i) => {
        if (
          i !== index ||
          Number(item.quantity) <= 1
        ) {
          return item;
        }

        const newQuantity =
          Number(item.quantity) - 1;

        return {
          ...item,

          quantity: newQuantity,

          subtotal:
            Number(item.price) *
            newQuantity,
        };
      })
    );
  };

  /* =========================================================
     REMOVE ITEM
  ========================================================= */

  const removeItem = (index) => {
    if (loading) return;

    setOrderItems((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /* =========================================================
     DISTRICT LIST
  ========================================================= */

  const districtList = useMemo(() => {
    if (Array.isArray(districtData)) {
      return districtData;
    }

    if (
      Array.isArray(
        districtData?.districts
      )
    ) {
      return districtData.districts;
    }

    if (
      Array.isArray(
        districtData?.default
      )
    ) {
      return districtData.default;
    }

    if (
      districtData &&
      typeof districtData === "object"
    ) {
      return Object.entries(
        districtData
      ).map(([name, thanas]) => ({
        district: name,

        thanas: Array.isArray(thanas)
          ? thanas
          : [],
      }));
    }

    return [];
  }, []);

  /* =========================================================
     SELECTED DISTRICT
  ========================================================= */

  const selectedDistrict =
    districtList.find((item) => {
      const districtName =
        item?.district ??
        item?.name ??
        "";

      return (
        String(districtName).trim() ===
        String(formData.district).trim()
      );
    });

  /* =========================================================
     THANA LIST
  ========================================================= */

  const thanaList =
    selectedDistrict?.thanas ||
    selectedDistrict?.thana ||
    [];

  /* =========================================================
     SUBTOTAL
  ========================================================= */

  const subtotal = useMemo(() => {
    return orderItems.reduce(
      (total, item) =>
        total +
        Number(item?.price || 0) *
          Number(item?.quantity || 0),

      0
    );
  }, [orderItems]);

  /* =========================================================
     DELIVERY CHARGE

     DHAKA = 60
     OUTSIDE DHAKA = 100
  ========================================================= */

  const deliveryCharge = useMemo(() => {
    if (!formData.district) {
      return 0;
    }

    const district =
      formData.district
        .trim()
        .toLowerCase();

    if (district === "dhaka") {
      return 60;
    }

    return 100;
  }, [formData.district]);

  /* =========================================================
     TOTAL
  ========================================================= */

  const total =
    subtotal + deliveryCharge;

  /* =========================================================
     INPUT CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    /* DISTRICT */

    if (name === "district") {
      setFormData((prev) => ({
        ...prev,

        district: value,

        thana: "",
      }));

      return;
    }

    /* PHONE */

    if (name === "phone") {
      const phone = value
        .replace(/\D/g, "")
        .slice(0, 11);

      setFormData((prev) => ({
        ...prev,

        phone,
      }));

      return;
    }

    /* OTHER INPUTS */

    setFormData((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  /* =========================================================
     VALIDATE ITEMS
  ========================================================= */

  const validateItems = () => {
    if (!orderItems.length) {
      return "Your cart is empty.";
    }

    for (const item of orderItems) {
      if (!item.productId) {
        return "Product ID is missing.";
      }

      if (!item.productName) {
        return "Product name is missing.";
      }

      if (
        !Number.isFinite(
          Number(item.price)
        ) ||
        Number(item.price) < 0
      ) {
        return `Invalid price for ${item.productName}.`;
      }

      if (
        !Number.isFinite(
          Number(item.quantity)
        ) ||
        Number(item.quantity) < 1
      ) {
        return `Invalid quantity for ${item.productName}.`;
      }
    }

    return null;
  };

  /* =========================================================
     PLACE ORDER
  ========================================================= */

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (loading) return;

  // Validation...
  const name = formData.name.trim();
  const phone = formData.phone.trim();
  const district = formData.district.trim();
  const thana = formData.thana.trim();
  const address = formData.address.trim();
  const note = formData.note.trim();

  if (!name || name.length < 2) return alert("Please enter a valid full name.");
  if (!phone || !/^01\d{9}$/.test(phone)) return alert("Please enter a valid Bangladesh phone number.");
  if (!district) return alert("Please select your district.");
  if (!thana) return alert("Please select your thana.");
  if (!address || address.length < 5) return alert("Please enter a complete delivery address.");

  const itemError = validateItems();
  if (itemError) return alert(itemError);

  const finalItems = orderItems.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    productImage: item.productImage,
    variantId: item.variantId,
    selectedColor: item.selectedColor,
    selectedColorCode: item.selectedColorCode,
    selectedSize: item.selectedSize,
    price: Number(item.price),
    quantity: Number(item.quantity),
    subtotal: Number(item.price) * Number(item.quantity),
  }));

  const firstItem = finalItems[0];

  // 🛠️ FIX: Schema Compatibility Payload
  const orderData = {
    name,
    phone,
    district,
    thana,
    address,
    note,
    orderType: isBuyNow ? "buy_now" : "cart",
    
    // রুট লেভেলে সর্বদা প্রথম প্রোডাক্টের তথ্য পাঠানো (যদি ব্যাকএন্ড সিঙ্গেল প্রোডাক্ট সাপোর্ট করে)
    productId: firstItem.productId,
    productName: firstItem.productName,
    productImage: firstItem.productImage,
    variantId: firstItem.variantId,
    selectedColor: firstItem.selectedColor,
    selectedColorCode: firstItem.selectedColorCode,
    selectedSize: firstItem.selectedSize,
    price: Number(firstItem.price),
    quantity: Number(firstItem.quantity),

    // অ্যারে হিসেবে সব আইটেম পাঠানো
    items: finalItems,
    
    subtotal: Number(subtotal),
    deliveryCharge: Number(deliveryCharge),
    total: Number(total),
    paymentMethod: "cash_on_delivery",
    paymentStatus: "pending",
    source: "website",
    orderSource: "website",
  };

  // 🔍 Check your console before submitting
  console.log("Submitting Payload:", orderData);

  setLoading(true);

  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Order placement failed.");
    }

    alert("Order placed successfully! 🎉");
    if (!isBuyNow) dispatch(clearCart());
    navigate("/");
  } catch (error) {
    console.error("ORDER ERROR:", error);
    alert(`Order failed!\n\n${error?.message || "Please try again."}`);
  } finally {
    setLoading(false);
  }
};

  /* =========================================================
     EMPTY CART
  ========================================================= */

  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center px-4">

        <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center shadow-sm">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-5">

            <FiShoppingBag
              size={26}
              className="text-gray-500"
            />

          </div>

          <h2 className="text-2xl font-bold mb-3">
            Your cart is empty
          </h2>

          <p className="text-gray-400 text-sm mb-6">
            Add some products before checking out.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="px-6 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition"
          >
            Continue Shopping
          </button>

        </div>

      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-gray-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-gray-200 bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="h-20 flex items-center justify-between">

            {/* BRAND */}

            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="group"
            >

              <div className="text-2xl font-black tracking-tight">
                Spriengge
              </div>

              <div className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mt-0.5">
                Premium Shopping
              </div>

            </button>

            {/* SECURE */}

            <div className="flex items-center gap-2 text-sm text-gray-500">

              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">

                <FiLock size={14} />

              </div>

              <span className="hidden sm:block">
                Secure Checkout
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* PAGE TITLE */}

        <div className="mb-8">

          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">

            <span className="text-gray-900">
              Cart
            </span>

            <span>/</span>

            <span className="text-gray-900">
              Checkout
            </span>

            <span>/</span>

            <span>
              Complete Order
            </span>

          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Complete your order
          </h1>

          <p className="text-gray-500 mt-2">
            Enter your delivery details to place your order.
          </p>

        </div>

        {/* =====================================================
            STEPS
        ===================================================== */}

        <div className="hidden md:flex items-center mb-10">

          {/* STEP 1 */}

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">

              <FiCheck size={16} />

            </div>

            <div>

              <p className="text-xs text-gray-400">
                STEP 01
              </p>

              <p className="text-sm font-semibold">
                Shopping Cart
              </p>

            </div>

          </div>

          <div className="flex-1 h-px bg-black mx-5" />

          {/* STEP 2 */}

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
              2
            </div>

            <div>

              <p className="text-xs text-gray-400">
                STEP 02
              </p>

              <p className="text-sm font-semibold">
                Checkout
              </p>

            </div>

          </div>

          <div className="flex-1 h-px bg-gray-200 mx-5" />

          {/* STEP 3 */}

          <div className="flex items-center gap-3 opacity-40">

            <div className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-sm font-semibold">
              3
            </div>

            <div>

              <p className="text-xs text-gray-400">
                STEP 03
              </p>

              <p className="text-sm font-semibold">
                Confirmation
              </p>

            </div>

          </div>

        </div>

        {/* =====================================================
            FORM
        ===================================================== */}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-[1fr_430px] gap-6 lg:gap-8"
        >

          {/* ===================================================
              LEFT
          =================================================== */}

          <div className="space-y-6">

            {/* =================================================
                CONTACT
            ================================================= */}

            <section className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">

              <div className="flex items-start justify-between mb-7">

                <div className="flex items-center gap-4">

                  <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center">

                    <FiUser
                      size={20}
                      className="text-gray-700"
                    />

                  </div>

                  <div>

                    <h2 className="text-lg font-bold">
                      Contact information
                    </h2>

                    <p className="text-sm text-gray-400 mt-0.5">
                      We’ll use this to contact you about your order.
                    </p>

                  </div>

                </div>

                <span className="hidden sm:block text-xs font-medium text-gray-400">
                  Required fields
                </span>

              </div>

              {/* NAME + PHONE */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* NAME */}

                <div>

                  <label className="block text-sm font-semibold mb-2">

                    Full Name

                    <span className="text-red-500 ml-1">
                      *
                    </span>

                  </label>

                  <div className="relative">

                    <FiUser
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      autoComplete="name"
                      disabled={loading}
                      className="w-full h-13 border border-gray-200 rounded-2xl bg-gray-50/60 pl-11 pr-4 text-sm outline-none transition-all duration-200 focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 disabled:opacity-60"
                    />

                  </div>

                </div>

                {/* PHONE */}

                <div>

                  <label className="block text-sm font-semibold mb-2">

                    Phone Number

                    <span className="text-red-500 ml-1">
                      *
                    </span>

                  </label>

                  <div className="relative">

                    <FiPhone
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="01712345678"
                      maxLength={11}
                      autoComplete="tel"
                      inputMode="numeric"
                      disabled={loading}
                      className="w-full h-13 border border-gray-200 rounded-2xl bg-gray-50/60 pl-11 pr-4 text-sm outline-none transition-all duration-200 focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 disabled:opacity-60"
                    />

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                DELIVERY ADDRESS
            ================================================= */}

            <section className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">

              <div className="flex items-center gap-4 mb-7">

                <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center">

                  <FiMapPin
                    size={20}
                    className="text-gray-700"
                  />

                </div>

                <div>

                  <h2 className="text-lg font-bold">
                    Delivery address
                  </h2>

                  <p className="text-sm text-gray-400 mt-0.5">
                    Where should we deliver your order?
                  </p>

                </div>

              </div>

              {/* DISTRICT + THANA */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* DISTRICT */}

                <div>

                  <label className="block text-sm font-semibold mb-2">

                    District

                    <span className="text-red-500 ml-1">
                      *
                    </span>

                  </label>

                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full h-13 border border-gray-200 rounded-2xl bg-gray-50/60 px-4 text-sm outline-none cursor-pointer transition-all focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    <option value="">
                      Select your district
                    </option>

                    {districtList.map(
                      (item, index) => {

                        const districtName =
                          item?.district ??
                          item?.name ??
                          "";

                        return (
                          <option
                            key={`${districtName}-${index}`}
                            value={districtName}
                          >
                            {districtName}
                          </option>
                        );
                      }
                    )}

                  </select>

                </div>

                {/* THANA */}

                <div>

                  <label className="block text-sm font-semibold mb-2">

                    Thana

                    <span className="text-red-500 ml-1">
                      *
                    </span>

                  </label>

                  <select
                    name="thana"
                    value={formData.thana}
                    onChange={handleChange}
                    disabled={
                      !formData.district ||
                      loading
                    }
                    className="w-full h-13 border border-gray-200 rounded-2xl bg-gray-50/60 px-4 text-sm outline-none cursor-pointer transition-all focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    <option value="">

                      {formData.district
                        ? thanaList.length
                          ? "Select your thana"
                          : "No thana available"
                        : "Select district first"}

                    </option>

                    {thanaList.map(
                      (thana, index) => {

                        const thanaName =
                          typeof thana ===
                          "string"
                            ? thana
                            : thana?.name ??
                              "";

                        return (
                          <option
                            key={`${thanaName}-${index}`}
                            value={thanaName}
                          >
                            {thanaName}
                          </option>
                        );
                      }
                    )}

                  </select>

                </div>

              </div>

              {/* ADDRESS */}

              <div className="mt-5">

                <label className="block text-sm font-semibold mb-2">

                  Full Address

                  <span className="text-red-500 ml-1">
                    *
                  </span>

                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={4}
                  placeholder="House / Flat, Road, Area, Landmark..."
                  autoComplete="street-address"
                  disabled={loading}
                  className="w-full border border-gray-200 rounded-2xl bg-gray-50/60 px-4 py-3.5 text-sm outline-none resize-none transition-all focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 disabled:opacity-60"
                />

              </div>

              {/* NOTE */}

              <div className="mt-5">

                <label className="block text-sm font-semibold mb-2">

                  Order Note

                  <span className="text-xs font-normal text-gray-400 ml-2">
                    Optional
                  </span>

                </label>

                <div className="relative">

                  <FiFileText
                    size={17}
                    className="absolute left-4 top-4 text-gray-400"
                  />

                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any special delivery instructions?"
                    disabled={loading}
                    className="w-full border border-gray-200 rounded-2xl bg-gray-50/60 pl-11 pr-4 py-3.5 text-sm outline-none resize-none transition-all focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 disabled:opacity-60"
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                PAYMENT + DELIVERY
            ================================================= */}

            <section className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">

              <div className="flex items-center gap-4 mb-6">

                <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center">

                  <span className="text-lg">
                    💳
                  </span>

                </div>

                <div>

                  <h2 className="text-lg font-bold">
                    Payment & Delivery
                  </h2>

                  <p className="text-sm text-gray-400 mt-0.5">
                    Your payment and delivery charge.
                  </p>

                </div>

              </div>

              {/* COD */}

              <div className="relative border-2 border-gray-900 bg-gray-50 rounded-2xl p-5">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-4">

                    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      💵
                    </div>

                    <div>

                      <p className="font-semibold text-sm">
                        Cash on Delivery
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Pay when your order arrives.
                      </p>

                    </div>

                  </div>

                  <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">

                    <div className="w-2 h-2 rounded-full bg-white" />

                  </div>

                </div>

              </div>

              {/* DELIVERY CHARGE */}

              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-4">

                    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                      🚚
                    </div>

                    <div>

                      <p className="font-semibold text-sm text-gray-900">
                        Delivery Charge
                      </p>

                      <p className="text-xs text-gray-400 mt-1">

                        {formData.district
                          ? formData.district
                              .trim()
                              .toLowerCase() ===
                            "dhaka"
                            ? "Dhaka delivery"
                            : "Outside Dhaka delivery"
                          : "Select your district first"}

                      </p>

                    </div>

                  </div>

                  <div className="text-right">

                    {formData.district ? (
                      <>
                        <p className="text-lg font-bold text-gray-900">
                          ৳
                          {deliveryCharge.toLocaleString()}
                        </p>

                        <div className="mt-1 flex items-center justify-end gap-1">

                          <div className="w-2 h-2 rounded-full bg-green-500" />

                          <span className="text-[11px] font-medium text-green-600">
                            Selected
                          </span>

                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">
                        —
                      </span>
                    )}

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                TRUST CARDS
            ================================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">

                <div className="text-lg">
                  🔒
                </div>

                <div>

                  <p className="text-xs font-semibold">
                    Secure
                  </p>

                  <p className="text-[11px] text-gray-400">
                    Safe checkout
                  </p>

                </div>

              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">

                <div className="text-lg">
                  🚚
                </div>

                <div>

                  <p className="text-xs font-semibold">
                    Fast Delivery
                  </p>

                  <p className="text-[11px] text-gray-400">
                    Reliable shipping
                  </p>

                </div>

              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">

                <div className="text-lg">
                  ✓
                </div>

                <div>

                  <p className="text-xs font-semibold">
                    Quality
                  </p>

                  <p className="text-[11px] text-gray-400">
                    Trusted products
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* ===================================================
              RIGHT SIDE
          =================================================== */}

          <div className="lg:col-span-1">

            <div className="sticky top-6 overflow-hidden rounded-3xl bg-[#171717] text-white shadow-2xl">

              {/* SUMMARY HEADER */}

              <div className="border-b border-white/10 px-6 py-5">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">
                      Your order
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-white">
                      Order Summary
                    </h2>

                  </div>

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">

                    {orderItems.length}{" "}

                    {orderItems.length === 1
                      ? "Item"
                      : "Items"}

                  </span>

                </div>

              </div>

              {/* PRODUCTS */}

              <div className="custom-scrollbar max-h-[360px] space-y-4 overflow-y-auto px-6 py-5">

                {orderItems.map(
                  (item, index) => (

                    <div
                      key={`${item.productId || item.productName}-${item.variantId || "default"}-${index}`}
                      className="rounded-2xl border border-white/10 bg-white/[0.05] p-3"
                    >

                      <div className="flex gap-4">

                        {/* IMAGE */}

                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">

                          {item.productImage ? (

                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />

                          ) : (

                            <div className="flex h-full items-center justify-center text-xs text-gray-400">
                              No Image
                            </div>

                          )}

                        </div>

                        {/* PRODUCT */}

                        <div className="min-w-0 flex-1">

                          <h3 className="line-clamp-2 text-sm font-semibold text-white">
                            {item.productName}
                          </h3>

                          {/* VARIANT */}

                          {(item.selectedColor ||
                            item.selectedSize) && (

                            <div className="mt-2 flex flex-wrap gap-1.5">

                              {item.selectedColor && (

                                <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] text-white/60">

                                  Color:{" "}
                                  {item.selectedColor}

                                </span>

                              )}

                              {item.selectedSize && (

                                <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] text-white/60">

                                  Size:{" "}
                                  {item.selectedSize}

                                </span>

                              )}

                            </div>

                          )}

                          <p className="mt-2 text-xs text-white/45">

                            ৳
                            {Number(
                              item.price
                            ).toLocaleString()}{" "}

                            ×{" "}

                            {item.quantity}

                          </p>

                          <p className="mt-1 text-sm font-bold text-white">

                            ৳
                            {Number(
                              item.subtotal
                            ).toLocaleString()}

                          </p>

                        </div>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(index)
                          }
                          disabled={loading}
                          className="self-start rounded-lg p-2 text-white/30 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
                          aria-label="Remove item"
                        >
                          <FiTrash2 size={15} />
                        </button>

                      </div>

                      {/* QUANTITY */}

                      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">

                        <span className="text-xs text-white/40">
                          Quantity
                        </span>

                        <div className="flex items-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                index
                              )
                            }
                            disabled={
                              loading ||
                              item.quantity <=
                                1
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <FiMinus
                              size={13}
                            />
                          </button>

                          <span className="min-w-[24px] text-center text-sm font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                index
                              )
                            }
                            disabled={loading}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30"
                          >
                            <FiPlus
                              size={13}
                            />
                          </button>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

              {/* PRICE */}

              <div className="border-t border-white/10 px-6 py-5">

                <div className="space-y-3">

                  {/* SUBTOTAL */}

                  <div className="flex items-center justify-between text-sm">

                    <span className="text-white/55">
                      Subtotal
                    </span>

                    <span className="font-medium text-white">

                      ৳
                      {subtotal.toLocaleString()}

                    </span>

                  </div>

                  {/* DELIVERY */}

                  <div className="flex items-center justify-between text-sm">

                    <span className="text-white/55">
                      Delivery Charge
                    </span>

                    <span className="font-semibold text-white">

                      {formData.district ? (
                        <>
                          ৳
                          {deliveryCharge.toLocaleString()}
                        </>
                      ) : (
                        <span className="text-xs font-normal text-white/35">
                          Select district
                        </span>
                      )}

                    </span>

                  </div>

                </div>

                {/* TOTAL */}

                <div className="mt-5 border-t border-white/10 pt-5">

                  <div className="flex items-end justify-between">

                    <div>

                      <p className="text-xs uppercase tracking-wider text-white/40">
                        Total
                      </p>

                      <p className="mt-1 text-3xl font-black tracking-tight text-white">

                        ৳
                        {total.toLocaleString()}

                      </p>

                    </div>

                    <span className="mb-1 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      COD
                    </span>

                  </div>

                </div>

              </div>

              {/* PAYMENT INFO */}

              <div className="mx-6 mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    💵
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-white">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/45">
                      Pay securely when your order arrives at your doorstep.
                    </p>

                  </div>

                </div>

              </div>

              {/* CONFIRM ORDER BUTTON */}

              <div className="px-6 pb-6">

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !orderItems.length
                  }
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-bold text-black shadow-lg transition-all duration-200 hover:bg-gray-100 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>

                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black" />

                      <span>
                        Placing Order...
                      </span>

                    </>
                  ) : (
                    <>

                      <FiCheck
                        size={18}
                        className="transition-transform group-hover:scale-110"
                      />

                      <span>
                        Confirm Order
                      </span>

                    </>
                  )}

                </button>

                {/* SECURE TEXT */}

                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-white/30">

                  <FiLock size={12} />

                  <span>
                    Secure & encrypted checkout
                  </span>

                </div>

              </div>

            </div>

          </div>

        </form>

      </div>

      {/* =====================================================
          CUSTOM SCROLLBAR
      ===================================================== */}

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 999px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.25);
          }
        `}
      </style>

    </div>
  );
};

export default Checkout;