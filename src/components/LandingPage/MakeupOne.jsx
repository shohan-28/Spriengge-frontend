import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FiCheck,
  FiMinus,
  FiPlus,
  FiShield,
  FiTruck,
  FiStar,
  FiArrowRight,
  FiX,
  FiMapPin,
  FiClock,
} from "react-icons/fi";

import { districtData } from "../DistrictData/DistrictData";

// ======================================================
// API CONFIG
// ======================================================

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  "https://ourbackend.spriengge.shop/api";

const API_URL = RAW_API_URL
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/products$/, "")
  .replace(/\/orders$/, "");

// ======================================================
// HELPERS
// ======================================================

const normalizeProductId = (value) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue > 0
    ? numberValue
    : null;
};

const cleanString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const getProductImage = (product) => {
  return (
    product?.image ||
    product?.images?.[0] ||
    product?.variants?.[0]?.images?.[0] ||
    ""
  );
};

const getProductPrice = (product) => {
  const price = Number(product?.price);

  return Number.isFinite(price) && price >= 0 ? price : 0;
};

const getProductOldPrice = (product, price) => {
  const oldPrice = Number(product?.oldPrice);

  if (Number.isFinite(oldPrice) && oldPrice > price) {
    return oldPrice;
  }

  return price + 300;
};

const getProductDiscount = (product, price, oldPrice) => {
  const productDiscount = Number(product?.discount);

  if (
    Number.isFinite(productDiscount) &&
    productDiscount > 0
  ) {
    return productDiscount;
  }

  return Math.max(oldPrice - price, 0);
};

// ======================================================
// COMPONENT
// ======================================================

const MakeupOne = () => {
  const { id } = useParams();

  // ======================================================
  // PRODUCT STATE
  // ======================================================

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productError, setProductError] = useState("");

  // ======================================================
  // QUANTITY
  // ======================================================

  const [quantity, setQuantity] = useState(1);

  // ======================================================
  // FORM
  // ======================================================

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    district: "",
    thana: "",
    address: "",
    note: "",
  });

  // ======================================================
  // ORDER STATE
  // ======================================================

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  // ======================================================
  // COUNTDOWN
  // ======================================================

  const [timeLeft, setTimeLeft] = useState({
    hours: 1,
    minutes: 59,
    seconds: 59,
  });

  // ======================================================
  // LOAD PRODUCT
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setProductError("");
        setProduct(null);

        const productId = normalizeProductId(id);

        if (!productId) {
          throw new Error("Invalid product ID.");
        }

        const response = await fetch(
          `${API_URL}/products/${encodeURIComponent(productId)}`
        );

        let data = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Product request failed with status ${response.status}`
          );
        }

        const loadedProduct =
          data?.product ||
          data?.data ||
          data;

        if (!loadedProduct) {
          throw new Error("Product not found.");
        }

        const loadedProductId = normalizeProductId(
          loadedProduct?.productId ??
            loadedProduct?.id
        );

        if (!loadedProductId) {
          throw new Error(
            "Product response does not contain a valid productId."
          );
        }

        const normalizedProduct = {
          ...loadedProduct,
          productId: loadedProductId,
          image: getProductImage(loadedProduct),
        };

        if (!cancelled) {
          setProduct(normalizedProduct);
        }
      } catch (error) {
        console.error(
          "Landing product loading error:",
          error
        );

        if (!cancelled) {
          setProductError(
            error?.message ||
              "Unable to load this product."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ======================================================
  // COUNTDOWN
  // ======================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds -= 1;
        } else {
          seconds = 59;

          if (minutes > 0) {
            minutes -= 1;
          } else {
            minutes = 59;

            if (hours > 0) {
              hours -= 1;
            } else {
              hours = 1;
              minutes = 59;
              seconds = 59;
            }
          }
        }

        return {
          hours,
          minutes,
          seconds,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ======================================================
  // PRODUCT INFORMATION
  // ======================================================

  const price = useMemo(() => {
    return getProductPrice(product);
  }, [product]);

  const oldPrice = useMemo(() => {
    return getProductOldPrice(product, price);
  }, [product, price]);

  const discount = useMemo(() => {
    return getProductDiscount(
      product,
      price,
      oldPrice
    );
  }, [product, price, oldPrice]);

  const productImage = useMemo(() => {
    return getProductImage(product);
  }, [product]);

  const productStock = useMemo(() => {
    const stock = Number(product?.stock);

    if (Number.isFinite(stock) && stock >= 0) {
      return stock;
    }

    return null;
  }, [product]);

  // ======================================================
  // DELIVERY
  // ======================================================

  const isDhaka =
    cleanString(formData.district).toLowerCase() ===
    "dhaka";

  const deliveryCharge = formData.district
    ? isDhaka
      ? 60
      : 100
    : 0;

  // ======================================================
  // TOTAL
  // ======================================================

  const safeQuantity = Math.max(
    1,
    Math.floor(Number(quantity) || 1)
  );

  const subtotal = price * safeQuantity;

  const total = subtotal + deliveryCharge;

  // ======================================================
  // INPUT CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // PHONE CHANGE
  // ======================================================

  const handlePhoneChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 11);

    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));
  };

  // ======================================================
  // DISTRICT CHANGE
  // ======================================================

  const handleDistrictChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      district: e.target.value,
      thana: "",
    }));
  };

  // ======================================================
  // QUANTITY
  // ======================================================

  const increaseQuantity = () => {
    setQuantity((prev) => {
      const current = Math.max(
        1,
        Math.floor(Number(prev) || 1)
      );

      if (
        productStock !== null &&
        productStock > 0 &&
        current >= productStock
      ) {
        return current;
      }

      return current + 1;
    });
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => {
      const current = Math.max(
        1,
        Math.floor(Number(prev) || 1)
      );

      return current > 1 ? current - 1 : 1;
    });
  };

  // ======================================================
  // SUBMIT ORDER
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    // ----------------------------------------------------
    // PRODUCT SAFETY
    // ----------------------------------------------------

    if (!product) {
      alert("Product not found.");
      return;
    }

    const productId = normalizeProductId(
      product?.productId ??
        product?.id
    );

    if (!productId) {
      alert("Invalid product ID.");
      return;
    }

    // ----------------------------------------------------
    // NAME
    // ----------------------------------------------------

    const customerName =
      cleanString(formData.name);

    if (!customerName) {
      alert("Please enter your name.");
      return;
    }

    // ----------------------------------------------------
    // PHONE
    // ----------------------------------------------------

    const customerPhone =
      cleanString(formData.phone);

    if (!/^01\d{9}$/.test(customerPhone)) {
      alert(
        "Please enter a valid 11 digit Bangladeshi phone number."
      );
      return;
    }

    // ----------------------------------------------------
    // DISTRICT
    // ----------------------------------------------------

    const customerDistrict =
      cleanString(formData.district);

    if (!customerDistrict) {
      alert("Please select your district.");
      return;
    }

    // ----------------------------------------------------
    // THANA
    // ----------------------------------------------------

    const customerThana =
      cleanString(formData.thana);

    if (!customerThana) {
      alert("Please select your thana.");
      return;
    }

    // ----------------------------------------------------
    // ADDRESS
    // ----------------------------------------------------

    const customerAddress =
      cleanString(formData.address);

    if (!customerAddress) {
      alert("Please enter your delivery address.");
      return;
    }

    // ----------------------------------------------------
    // QUANTITY
    // ----------------------------------------------------

    const finalQuantity = Math.max(
      1,
      Math.floor(Number(quantity) || 1)
    );

    // ----------------------------------------------------
    // STOCK CHECK
    // ----------------------------------------------------

    if (
      productStock !== null &&
      productStock <= 0
    ) {
      alert("Sorry, this product is currently out of stock.");
      return;
    }

    if (
      productStock !== null &&
      finalQuantity > productStock
    ) {
      alert(
        `Only ${productStock} item${
          productStock > 1 ? "s" : ""
        } available in stock.`
      );

      setQuantity(productStock);
      return;
    }

    // ----------------------------------------------------
    // PRICE
    // ----------------------------------------------------

    const finalPrice = getProductPrice(product);

    if (
      !Number.isFinite(finalPrice) ||
      finalPrice < 0
    ) {
      alert("Invalid product price.");
      return;
    }

    // ----------------------------------------------------
    // DELIVERY
    // ----------------------------------------------------

    const finalDeliveryCharge =
      customerDistrict.toLowerCase() ===
      "dhaka"
        ? 60
        : 100;

    // ----------------------------------------------------
    // TOTAL
    // ----------------------------------------------------

    const finalSubtotal =
      finalPrice * finalQuantity;

    const finalTotal =
      finalSubtotal + finalDeliveryCharge;

    // ====================================================
    // CANONICAL ORDER ITEM
    // ====================================================

    const orderItem = {
      productId,

      productName:
        cleanString(product?.name) ||
        "Product",

      productImage:
        productImage || "",

      // Landing page product has no selected variant.
      // Keep canonical variantId empty.
      variantId: "",

      selectedColor: "",
      selectedColorCode: "",
      selectedSize: "",

      price: finalPrice,

      quantity: finalQuantity,

      subtotal: finalSubtotal,
    };

    // ====================================================
    // FINAL ORDER PAYLOAD
    // ====================================================

    const orderData = {
      // --------------------------------------------------
      // CUSTOMER
      // --------------------------------------------------

      name: customerName,

      phone: customerPhone,

      district: customerDistrict,

      thana: customerThana,

      address: customerAddress,

      note: cleanString(formData.note),

      // --------------------------------------------------
      // PRODUCT
      // --------------------------------------------------

      productId,

      productName:
        cleanString(product?.name) ||
        "Product",

      productImage:
        productImage || "",

      // --------------------------------------------------
      // QUANTITY
      // --------------------------------------------------

      quantity: finalQuantity,

      // --------------------------------------------------
      // PRICE
      // --------------------------------------------------

      price: finalPrice,

      subtotal: finalSubtotal,

      // --------------------------------------------------
      // DELIVERY
      // --------------------------------------------------

      deliveryCharge: finalDeliveryCharge,

      // --------------------------------------------------
      // TOTAL
      // --------------------------------------------------

      total: finalTotal,

      // --------------------------------------------------
      // ITEMS
      // --------------------------------------------------

      items: [orderItem],

      // --------------------------------------------------
      // ORDER SOURCE
      // --------------------------------------------------

      orderSource: "landing-page",

      landingPageId: cleanString(id),

      paymentMethod: "cod",

      status: "pending",
    };

    console.log(
      "FINAL LANDING ORDER:",
      orderData
    );

    // ====================================================
    // SEND ORDER
    // ====================================================

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_URL}/orders`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(orderData),
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      console.log(
        "LANDING ORDER RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Order failed. Please try again."
        );
      }

      // ==================================================
      // SUCCESS
      // ==================================================

      setSuccessOrder({
        ...orderData,
        orderId:
          data?.order?._id ||
          data?.data?._id ||
          data?._id ||
          "",
      });

      setSuccess(true);

      setFormData({
        name: "",
        phone: "",
        district: "",
        thana: "",
        address: "",
        note: "",
      });

      setQuantity(1);
    } catch (error) {
      console.error(
        "Landing order submit error:",
        error
      );

      alert(
        error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f5]">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-[3px] border-gray-200 border-t-black rounded-full animate-spin" />

          <p className="mt-4 text-xs text-gray-400 font-medium">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // PRODUCT NOT FOUND
  // ======================================================

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f7f5] px-5 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
          <FiX size={28} />
        </div>

        <h1 className="mt-5 text-3xl font-black">
          Product Not Found
        </h1>

        <p className="mt-3 text-gray-500 max-w-md">
          {productError ||
            "Sorry, this product is currently unavailable."}
        </p>

        <a
          href="/"
          className="mt-6 px-6 py-3 rounded-full bg-black text-white font-semibold"
        >
          Back to Home
        </a>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-gray-900">

      {/* =====================================
          HEADER
      ====================================== */}

      <header className="absolute top-0 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5">

          <div className="flex items-center justify-between">

            <a
              href="/"
              className="text-xl sm:text-2xl font-black tracking-tight"
            >
              Spriengge
            </a>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500">
              <FiShield />
              Secure Checkout
            </div>

          </div>

        </div>
      </header>

      {/* =====================================
          MAIN
      ====================================== */}

      <main className="min-h-screen flex items-center">

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-10">

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-7 lg:gap-12 items-center">

            {/* =================================
                PRODUCT
            ================================= */}

            <section>

              {/* OFFER */}

              <div className="flex flex-wrap items-center gap-2">

                <div className="inline-flex items-center gap-2 bg-black text-white rounded-full px-4 py-2 text-[10px] sm:text-xs font-bold">

                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />

                  LIMITED TIME OFFER

                </div>

                <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 rounded-full px-3 py-2 text-[10px] font-bold">

                  <FiClock />

                  {String(
                    timeLeft.hours
                  ).padStart(2, "0")}
                  :
                  {String(
                    timeLeft.minutes
                  ).padStart(2, "0")}
                  :
                  {String(
                    timeLeft.seconds
                  ).padStart(2, "0")}

                </div>

              </div>

              {/* IMAGE */}

              <div className="mt-4 relative">

                <div className="absolute inset-10 bg-blue-100/50 blur-3xl rounded-full" />

                <div className="relative bg-white rounded-[2rem] shadow-sm border border-gray-100 p-5 sm:p-7">

                  <div className="absolute top-4 left-4 z-10 bg-red-500 text-white rounded-full px-3 py-1.5 text-[10px] font-black">
                    SAVE ৳{discount}
                  </div>

                  {productImage ? (
                    <img
                      src={productImage}
                      alt={product.name}
                      className="w-full h-[250px] sm:h-[310px] lg:h-[350px] object-contain"
                    />
                  ) : (
                    <div className="w-full h-[250px] sm:h-[310px] lg:h-[350px] flex items-center justify-center text-gray-300">
                      No Image
                    </div>
                  )}

                </div>

              </div>

              {/* PRODUCT INFO */}

              <div className="mt-5">

                <div className="flex items-center gap-2">

                  <div className="flex gap-0.5 text-yellow-500">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <FiStar
                          key={star}
                          size={13}
                          className="fill-current"
                        />
                      )
                    )}

                  </div>

                  <span className="text-xs font-bold">
                    {Number(product.rating) ||
                      "4.9"}
                  </span>

                  <span className="text-xs text-gray-400">
                    •{" "}
                    {Number(product.reviews) ||
                      "500+"}{" "}
                    happy customers
                  </span>

                </div>

                <h1 className="mt-2 text-3xl sm:text-4xl lg:text-[40px] leading-[1.05] font-black tracking-tight">
                  {product.name}
                </h1>

                <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed max-w-xl">
                  {product?.details
                    ?.shortDescription ||
                    product.description ||
                    "Premium quality product designed for comfort, style and everyday use."}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">

                  <span className="text-3xl sm:text-4xl font-black">
                    ৳{price}
                  </span>

                  {oldPrice > price && (
                    <span className="text-base text-gray-400 line-through">
                      ৳{oldPrice}
                    </span>
                  )}

                  <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-bold">
                    SAVE ৳{discount}
                  </span>

                </div>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">

                  <Benefit text="Premium Quality" />
                  <Benefit text="Cash on Delivery" />
                  <Benefit text="Fast Delivery" />
                  <Benefit text="Easy Support" />

                </div>

                {productStock !== null && (
                  <div className="mt-4 text-xs font-semibold">
                    {productStock > 0 ? (
                      <span className="text-green-600">
                        {productStock} items available
                      </span>
                    ) : (
                      <span className="text-red-500">
                        Out of stock
                      </span>
                    )}
                  </div>
                )}

              </div>

            </section>

            {/* =================================
                ORDER FORM
            ================================= */}

            <section>

              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 p-5 sm:p-7">

                <div className="mb-5">

                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                    Quick Order
                  </p>

                  <h2 className="mt-1 text-2xl sm:text-3xl font-black">
                    Place your order
                  </h2>

                  <p className="mt-2 text-xs sm:text-sm text-gray-400">
                    Fill in your details and we'll contact you for confirmation.
                  </p>

                </div>

                <form onSubmit={handleSubmit}>

                  {/* NAME + PHONE */}

                  <div className="grid sm:grid-cols-2 gap-3">

                    <div>

                      <label className="block text-[11px] font-bold text-gray-600 mb-1.5">
                        Full Name *
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                        className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:bg-white focus:border-black transition"
                      />

                    </div>

                    <div>

                      <label className="block text-[11px] font-bold text-gray-600 mb-1.5">
                        Phone Number *
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        placeholder="01XXXXXXXXX"
                        inputMode="numeric"
                        maxLength={11}
                        required
                        className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:bg-white focus:border-black transition"
                      />

                    </div>

                  </div>

                  {/* DISTRICT + THANA */}

                  <div className="grid sm:grid-cols-2 gap-3 mt-3">

                    <div>

                      <label className="block text-[11px] font-bold text-gray-600 mb-1.5">
                        District *
                      </label>

                      <div className="relative">

                        <FiMapPin
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <select
                          name="district"
                          value={formData.district}
                          onChange={handleDistrictChange}
                          required
                          className="w-full h-11 pl-9 pr-3 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:bg-white focus:border-black transition appearance-none"
                        >

                          <option value="">
                            Select District
                          </option>

                          {Object.keys(
                            districtData
                          ).map((district) => (
                            <option
                              key={district}
                              value={district}
                            >
                              {district}
                            </option>
                          ))}

                        </select>

                      </div>

                    </div>

                    <div>

                      <label className="block text-[11px] font-bold text-gray-600 mb-1.5">
                        Thana / Upazila *
                      </label>

                      <select
                        name="thana"
                        value={formData.thana}
                        onChange={handleChange}
                        required
                        disabled={!formData.district}
                        className="w-full h-11 px-3 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:bg-white focus:border-black transition disabled:opacity-50"
                      >

                        <option value="">
                          Select Thana
                        </option>

                        {districtData[
                          formData.district
                        ]?.map((thana) => (
                          <option
                            key={thana}
                            value={thana}
                          >
                            {thana}
                          </option>
                        ))}

                      </select>

                    </div>

                  </div>

                  {/* ADDRESS */}

                  <div className="mt-3">

                    <label className="block text-[11px] font-bold text-gray-600 mb-1.5">
                      Full Delivery Address *
                    </label>

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House, road, village, area..."
                      required
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:bg-white focus:border-black transition resize-none"
                    />

                  </div>

                  {/* NOTE */}

                  <div className="mt-3">

                    <label className="block text-[11px] font-bold text-gray-600 mb-1.5">
                      Order Note
                      <span className="text-gray-400 font-normal">
                        {" "}
                        (Optional)
                      </span>
                    </label>

                    <input
                      type="text"
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      placeholder="Any special instruction?"
                      className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:bg-white focus:border-black transition"
                    />

                  </div>

                  {/* PRODUCT + QUANTITY */}

                  <div className="mt-4 p-4 bg-gray-50 rounded-2xl">

                    <div className="flex items-center gap-3">

                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.name}
                          className="w-14 h-14 rounded-xl bg-white object-contain border border-gray-100"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 text-xs">
                          N/A
                        </div>
                      )}

                      <div className="flex-1 min-w-0">

                        <h3 className="font-bold text-sm truncate">
                          {product.name}
                        </h3>

                        <p className="text-xs text-gray-400 mt-1">
                          ৳{price} × {safeQuantity}
                        </p>

                      </div>

                      {/* QUANTITY */}

                      <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">

                        <button
                          type="button"
                          onClick={decreaseQuantity}
                          disabled={safeQuantity <= 1}
                          className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                        >
                          <FiMinus size={13} />
                        </button>

                        <span className="w-8 text-center text-sm font-black">
                          {safeQuantity}
                        </span>

                        <button
                          type="button"
                          onClick={increaseQuantity}
                          disabled={
                            productStock !== null &&
                            productStock > 0 &&
                            safeQuantity >=
                              productStock
                          }
                          className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                        >
                          <FiPlus size={13} />
                        </button>

                      </div>

                    </div>

                  </div>

                  {/* DELIVERY */}

                  <div className="mt-3 p-4 border border-gray-100 rounded-2xl">

                    <div className="flex justify-between items-center">

                      <div className="flex items-center gap-2">

                        <FiTruck className="text-blue-600" />

                        <span className="text-sm font-bold">
                          Delivery Charge
                        </span>

                      </div>

                      <span className="text-sm font-black">

                        {deliveryCharge
                          ? `৳${deliveryCharge}`
                          : "Select district"}

                      </span>

                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">

                      <div
                        className={`rounded-xl border p-2 text-center ${
                          isDhaka
                            ? "border-black bg-gray-50"
                            : "border-gray-100"
                        }`}
                      >

                        <p className="text-[10px] text-gray-400">
                          Inside Dhaka
                        </p>

                        <p className="text-sm font-black">
                          ৳60
                        </p>

                      </div>

                      <div
                        className={`rounded-xl border p-2 text-center ${
                          formData.district &&
                          !isDhaka
                            ? "border-black bg-gray-50"
                            : "border-gray-100"
                        }`}
                      >

                        <p className="text-[10px] text-gray-400">
                          Outside Dhaka
                        </p>

                        <p className="text-sm font-black">
                          ৳100
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* ORDER SUMMARY */}

                  <div className="mt-3 p-4 bg-gray-50 rounded-2xl space-y-2">

                    <div className="flex justify-between text-xs text-gray-500">

                      <span>
                        Product ({safeQuantity} × ৳
                        {price})
                      </span>

                      <span>
                        ৳{subtotal}
                      </span>

                    </div>

                    <div className="flex justify-between text-xs text-gray-500">

                      <span>
                        Delivery
                      </span>

                      <span>
                        {deliveryCharge
                          ? `৳${deliveryCharge}`
                          : "—"}
                      </span>

                    </div>

                    <div className="pt-2 border-t border-gray-200 flex justify-between items-center">

                      <span className="font-bold">
                        Total
                      </span>

                      <span className="text-2xl font-black">
                        ৳{total}
                      </span>

                    </div>

                  </div>

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      (productStock !== null &&
                        productStock <= 0)
                    }
                    className="mt-4 w-full py-3.5 rounded-2xl bg-black hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold flex items-center justify-center gap-2 transition-all duration-300"
                  >

                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                        Processing...
                      </>
                    ) : productStock !== null &&
                      productStock <= 0 ? (
                      <>
                        Out of Stock
                      </>
                    ) : (
                      <>
                        Confirm Order — ৳{total}

                        <FiArrowRight />
                      </>
                    )}

                  </button>

                  {/* TRUST */}

                  <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-gray-400">

                    <span className="flex items-center gap-1">
                      <FiShield />
                      Secure
                    </span>

                    <span className="flex items-center gap-1">
                      <FiTruck />
                      Fast Delivery
                    </span>

                    <span className="flex items-center gap-1">
                      <FiCheck />
                      Cash on Delivery
                    </span>

                  </div>

                </form>

              </div>

            </section>

          </div>

        </div>

      </main>

      {/* =====================================
          SUCCESS MODAL
      ====================================== */}

      {success && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">

          <div className="relative bg-white rounded-[2rem] p-7 sm:p-8 max-w-sm w-full text-center shadow-2xl">

            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setSuccessOrder(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <FiX size={15} />
            </button>

            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <FiCheck size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Order Confirmed!
            </h2>

            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।
              আমাদের টিম খুব শীঘ্রই আপনার সাথে যোগাযোগ করবে।
            </p>

            {successOrder?.orderId && (
              <div className="mt-4 px-4 py-2 rounded-xl bg-green-50">
                <p className="text-[10px] text-gray-400">
                  Order ID
                </p>

                <p className="text-xs font-bold break-all">
                  {successOrder.orderId}
                </p>
              </div>
            )}

            <div className="mt-5 p-4 rounded-2xl bg-gray-50">

              <p className="text-xs text-gray-400">
                Quantity
              </p>

              <p className="text-xl font-black">
                {successOrder?.quantity ||
                  safeQuantity}{" "}
                × {product.name}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                Total Amount
              </p>

              <p className="text-2xl font-black">
                ৳
                {successOrder?.total ||
                  total}
              </p>

            </div>

            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setSuccessOrder(null);
              }}
              className="mt-5 w-full h-12 rounded-xl bg-black text-white font-bold hover:bg-blue-600 transition"
            >
              Done
            </button>

          </div>

        </div>
      )}

    </div>
  );
};

// ======================================================
// BENEFIT
// ======================================================

const Benefit = ({ text }) => {
  return (
    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-600">

      <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
        <FiCheck size={11} />
      </span>

      {text}

    </div>
  );
};

export default MakeupOne;