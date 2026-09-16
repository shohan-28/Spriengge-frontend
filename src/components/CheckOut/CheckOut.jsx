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

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://ourbackend.spriengge.shop/api";

/* =========================================================
   API URL NORMALIZE
========================================================= */

const BASE_API_URL = API_URL
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/products$/, "")
  .replace(/\/orders$/, "");

/* =========================================================
   HELPERS
========================================================= */

const cleanString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const normalizeProductId = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return numberValue;
};

const normalizeVariantId = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  return String(value).trim();
};

const normalizeQuantity = (value) => {
  const quantity = Number(value);

  if (!Number.isFinite(quantity) || quantity < 1) {
    return 1;
  }

  return Math.floor(quantity);
};

/* =========================================================
   FIND VARIANT FROM ITEM
========================================================= */

const findItemVariant = (item) => {
  if (!item) {
    return null;
  }

  const variantId = normalizeVariantId(
    item?.variantId
  );

  const selectedColor = cleanString(
    item?.selectedColor ??
      item?.color
  ).toLowerCase();

  const variants = Array.isArray(item?.variants)
    ? item.variants
    : [];

  if (!variants.length) {
    return null;
  }

  /* First priority: canonical variantId */

  if (variantId) {
    const byId = variants.find(
      (variant) =>
        normalizeVariantId(
          variant?.variantId
        ) === variantId
    );

    if (byId) {
      return byId;
    }
  }

  /* Second priority: selected color */

  if (selectedColor) {
    const byColor = variants.find(
      (variant) =>
        cleanString(
          variant?.color
        ).toLowerCase() === selectedColor
    );

    if (byColor) {
      return byColor;
    }
  }

  return null;
};

/* =========================================================
   NORMALIZE CHECKOUT ITEM
========================================================= */

const normalizeItem = (
  item,
  forcedQuantity = null
) => {
  if (!item) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | PRODUCT ID
  |--------------------------------------------------------------------------
  | Current backend identity:
  | productId = Number
  |
  | IMPORTANT:
  | Mongo _id is NOT used as productId.
  |--------------------------------------------------------------------------
  */

  const productId = normalizeProductId(
    item?.productId ??
      item?.id ??
      null
  );

  if (!productId) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | VARIANT
  |--------------------------------------------------------------------------
  */

  const nestedVariant =
    item?.selectedVariant ||
    item?.variant ||
    null;

  let variantId = normalizeVariantId(
    item?.variantId ??
      nestedVariant?.variantId ??
      ""
  );

  let selectedColor = cleanString(
    item?.selectedColor ??
      item?.color ??
      nestedVariant?.color ??
      ""
  );

  let selectedColorCode = cleanString(
    item?.selectedColorCode ??
      item?.colorCode ??
      nestedVariant?.colorCode ??
      ""
  );

  let selectedSize = cleanString(
    item?.selectedSize ??
      item?.size ??
      ""
  );

  /*
  |--------------------------------------------------------------------------
  | FIND CANONICAL VARIANT
  |--------------------------------------------------------------------------
  */

  const foundVariant = findItemVariant({
    ...item,
    variantId,
    selectedColor,
  });

  if (foundVariant) {
    /*
    |--------------------------------------------------------------------------
    | Always trust canonical variantId
    |--------------------------------------------------------------------------
    */

    variantId = normalizeVariantId(
      foundVariant?.variantId
    );

    selectedColor =
      selectedColor ||
      cleanString(foundVariant?.color);

    selectedColorCode =
      selectedColorCode ||
      cleanString(foundVariant?.colorCode);

    /*
    |--------------------------------------------------------------------------
    | If exactly one size has stock,
    | automatically select it.
    |--------------------------------------------------------------------------
    */

    const availableSizes = Array.isArray(
      foundVariant?.sizes
    )
      ? foundVariant.sizes.filter(
          (size) =>
            Number(size?.stock || 0) > 0
        )
      : [];

    if (
      !selectedSize &&
      availableSizes.length === 1
    ) {
      selectedSize = cleanString(
        availableSizes[0]?.size
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Quantity
  |--------------------------------------------------------------------------
  */

  const quantity =
    forcedQuantity !== null
      ? normalizeQuantity(forcedQuantity)
      : normalizeQuantity(
          item?.quantity ??
            item?.qty ??
            1
        );

  /*
  |--------------------------------------------------------------------------
  | PRICE
  |--------------------------------------------------------------------------
  | Frontend price is display/compatibility data.
  | Backend will validate the real DB price.
  |--------------------------------------------------------------------------
  */

  const rawPrice =
    item?.price ??
    item?.unitPrice ??
    foundVariant?.price ??
    nestedVariant?.price ??
    0;

  const price = Number(rawPrice);

  const safePrice =
    Number.isFinite(price) && price >= 0
      ? price
      : 0;

  /*
  |--------------------------------------------------------------------------
  | IMAGE
  |--------------------------------------------------------------------------
  */

  const productImage =
    item?.productImage ||
    foundVariant?.images?.[0] ||
    nestedVariant?.images?.[0] ||
    item?.image ||
    item?.images?.[0] ||
    "";

  /*
  |--------------------------------------------------------------------------
  | RETURN NORMALIZED ITEM
  |--------------------------------------------------------------------------
  */

  return {
    productId,

    productName:
      item?.productName ||
      item?.name ||
      item?.title ||
      "Product",

    productImage,

    /*
    |--------------------------------------------------------------------------
    | Canonical variant identity
    |--------------------------------------------------------------------------
    */

    variantId,

    selectedColor,

    selectedColorCode,

    selectedSize,

    price: safePrice,

    quantity,

    subtotal:
      safePrice * quantity,
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

  const isBuyNow = Boolean(
    state?.product
  );

  const product =
    state?.product || null;

  const buyNowQuantity = normalizeQuantity(
    state?.quantity ?? 1
  );

  const cartItems = Array.isArray(
    state?.cartItems
  )
    ? state.cartItems
    : [];

  /* =========================================================
     FORM
  ========================================================= */

  const [formData, setFormData] =
    useState({
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

  const [loading, setLoading] =
    useState(false);

  /* =========================================================
     ORDER ITEMS
  ========================================================= */

  const [orderItems, setOrderItems] =
    useState(() => {
      /*
      |--------------------------------------------------------------------------
      | BUY NOW
      |--------------------------------------------------------------------------
      */

      if (isBuyNow && product) {
        const normalizedProduct =
          normalizeItem(
            {
              ...product,

              /*
              |--------------------------------------------------------------------------
              | IMPORTANT
              |--------------------------------------------------------------------------
              | product.productId is canonical.
              |--------------------------------------------------------------------------
              */

              productId:
                product?.productId ??
                null,

              /*
              |--------------------------------------------------------------------------
              | IMPORTANT
              |--------------------------------------------------------------------------
              | Only canonical variantId.
              |--------------------------------------------------------------------------
              */

              variantId:
                state?.variantId ??
                product?.variantId ??
                product?.selectedVariant
                  ?.variantId ??
                "",

              selectedColor:
                product?.selectedColor ??
                product?.color ??
                product?.selectedVariant
                  ?.color ??
                "",

              selectedColorCode:
                product?.selectedColorCode ??
                product?.colorCode ??
                product?.selectedVariant
                  ?.colorCode ??
                "",

              selectedSize:
                product?.selectedSize ??
                product?.size ??
                "",
            },
            buyNowQuantity
          );

        return normalizedProduct
          ? [normalizedProduct]
          : [];
      }

      /*
      |--------------------------------------------------------------------------
      | CART CHECKOUT
      |--------------------------------------------------------------------------
      */

      return cartItems
        .map((item) =>
          normalizeItem(item)
        )
        .filter(Boolean);
    });

  /* =========================================================
     INCREASE QUANTITY
  ========================================================= */

  const increaseQuantity = (index) => {
    if (loading) {
      return;
    }

    setOrderItems((previous) =>
      previous.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        const newQuantity =
          normalizeQuantity(
            item.quantity
          ) + 1;

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
    if (loading) {
      return;
    }

    setOrderItems((previous) =>
      previous.map((item, itemIndex) => {
        if (
          itemIndex !== index ||
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
    if (loading) {
      return;
    }

    setOrderItems((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  /* =========================================================
     DISTRICTS
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
      typeof districtData ===
        "object"
    ) {
      return Object.entries(
        districtData
      ).map(
        ([name, thanas]) => ({
          district: name,

          thanas:
            Array.isArray(thanas)
              ? thanas
              : [],
        })
      );
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
        cleanString(
          districtName
        ).toLowerCase() ===
        cleanString(
          formData.district
        ).toLowerCase()
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
  ========================================================= */

  const deliveryCharge = useMemo(() => {
    if (!formData.district) {
      return 0;
    }

    const district =
      cleanString(
        formData.district
      ).toLowerCase();

    return district === "dhaka"
      ? 60
      : 100;
  }, [formData.district]);

  /* =========================================================
     TOTAL
  ========================================================= */

  const total =
    subtotal + deliveryCharge;

  /* =========================================================
     INPUT CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    /* DISTRICT */

    if (name === "district") {
      setFormData((previous) => ({
        ...previous,

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

      setFormData((previous) => ({
        ...previous,

        phone,
      }));

      return;
    }

    /* OTHER */

    setFormData((previous) => ({
      ...previous,

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
      /*
      |--------------------------------------------------------------------------
      | Product ID
      |--------------------------------------------------------------------------
      */

      if (
        !Number.isFinite(
          Number(item?.productId)
        ) ||
        Number(item.productId) < 1
      ) {
        return `Product ID is missing for "${item?.productName || "product"}".`;
      }

      /*
      |--------------------------------------------------------------------------
      | Product name
      |--------------------------------------------------------------------------
      */

      if (!item?.productName) {
        return "Product name is missing.";
      }

      /*
      |--------------------------------------------------------------------------
      | Quantity
      |--------------------------------------------------------------------------
      */

      if (
        !Number.isFinite(
          Number(item?.quantity)
        ) ||
        Number(item.quantity) < 1
      ) {
        return `Invalid quantity for "${item.productName}".`;
      }

      /*
      |--------------------------------------------------------------------------
      | Price
      |--------------------------------------------------------------------------
      */

      if (
        !Number.isFinite(
          Number(item?.price)
        ) ||
        Number(item.price) < 0
      ) {
        return `Invalid price for "${item.productName}".`;
      }

      /*
      |--------------------------------------------------------------------------
      | Variant
      |--------------------------------------------------------------------------
      |--------------------------------------------------------------------------
      */

      if (
        item?.variantId &&
        typeof item.variantId !==
          "string"
      ) {
        return `Invalid variant for "${item.productName}".`;
      }
    }

    return null;
  };

  /* =========================================================
     PLACE ORDER
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    /* =======================================================
       FORM VALIDATION
    ======================================================= */

    const name =
      cleanString(formData.name);

    const phone =
      cleanString(formData.phone);

    const district =
      cleanString(
        formData.district
      );

    const thana =
      cleanString(formData.thana);

    const address =
      cleanString(
        formData.address
      );

    const note =
      cleanString(formData.note);

    if (
      !name ||
      name.length < 2
    ) {
      alert(
        "Please enter a valid full name."
      );
      return;
    }

    if (
      !phone ||
      !/^01\d{9}$/.test(phone)
    ) {
      alert(
        "Please enter a valid Bangladesh phone number."
      );
      return;
    }

    if (!district) {
      alert(
        "Please select your district."
      );
      return;
    }

    if (!thana) {
      alert(
        "Please select your thana."
      );
      return;
    }

    if (
      !address ||
      address.length < 5
    ) {
      alert(
        "Please enter a complete delivery address."
      );
      return;
    }

    /* =======================================================
       ITEM VALIDATION
    ======================================================= */

    const itemError =
      validateItems();

    if (itemError) {
      alert(itemError);
      return;
    }

    /* =======================================================
       FINAL ITEMS
       Backend will verify product/variant/size/price.
    ======================================================= */

    const finalItems =
      orderItems.map((item) => ({
        /*
        |--------------------------------------------------------------------------
        | CANONICAL PRODUCT ID
        |--------------------------------------------------------------------------
        */

        productId:
          Number(item.productId),

        /*
        |--------------------------------------------------------------------------
        | Display data
        |--------------------------------------------------------------------------
        */

        productName:
          item.productName || "",

        productImage:
          item.productImage || "",

        /*
        |--------------------------------------------------------------------------
        | CANONICAL VARIANT ID
        |--------------------------------------------------------------------------
        */

        variantId:
          item.variantId || "",

        /*
        |--------------------------------------------------------------------------
        | Variant selections
        |--------------------------------------------------------------------------
        */

        selectedColor:
          item.selectedColor || "",

        selectedColorCode:
          item.selectedColorCode ||
          "",

        selectedSize:
          item.selectedSize || "",

        /*
        |--------------------------------------------------------------------------
        | Price
        |--------------------------------------------------------------------------
        | Backend will calculate/verify the real price.
        |--------------------------------------------------------------------------
        */

        price:
          Number(item.price),

        quantity:
          Number(item.quantity),

        subtotal:
          Number(item.price) *
          Number(item.quantity),
      }));

    const firstItem =
      finalItems[0];

    /* =======================================================
       ORDER PAYLOAD
    ======================================================= */

    const orderData = {
      /*
      |--------------------------------------------------------------------------
      | CUSTOMER
      |--------------------------------------------------------------------------
      */

      name,
      phone,
      district,
      thana,
      address,
      note,

      /*
      |--------------------------------------------------------------------------
      | ORDER TYPE
      |--------------------------------------------------------------------------
      */

      orderType: isBuyNow
        ? "buy_now"
        : "cart",

      /*
      |--------------------------------------------------------------------------
      | BACKWARD COMPATIBILITY
      |--------------------------------------------------------------------------
      | orderRoutes.js supports these first-item fields.
      |--------------------------------------------------------------------------
      */

      productId:
        firstItem.productId,

      productName:
        firstItem.productName,

      productImage:
        firstItem.productImage,

      variantId:
        firstItem.variantId,

      selectedColor:
        firstItem.selectedColor,

      selectedColorCode:
        firstItem.selectedColorCode,

      selectedSize:
        firstItem.selectedSize,

      price:
        Number(firstItem.price),

      quantity:
        Number(firstItem.quantity),

      /*
      |--------------------------------------------------------------------------
      | ALL ORDER ITEMS
      |--------------------------------------------------------------------------
      */

      items: finalItems,

      /*
      |--------------------------------------------------------------------------
      | FINANCIAL
      |--------------------------------------------------------------------------
      */

      subtotal:
        Number(subtotal),

      deliveryCharge:
        Number(deliveryCharge),

      total:
        Number(total),

      /*
      |--------------------------------------------------------------------------
      | PAYMENT
      |--------------------------------------------------------------------------
      */

      paymentMethod:
        "cash_on_delivery",

      paymentStatus:
        "pending",

      /*
      |--------------------------------------------------------------------------
      | SOURCE
      |--------------------------------------------------------------------------
      */

      source: "website",

      orderSource:
        "website",
    };

    /*
    |--------------------------------------------------------------------------
    | DEBUG
    |--------------------------------------------------------------------------
    */

    console.log(
      "========== ORDER PAYLOAD =========="
    );

    console.log(
      JSON.stringify(
        orderData,
        null,
        2
      )
    );

    console.log(
      "==================================="
    );

    /* =======================================================
       SEND ORDER
    ======================================================= */

    setLoading(true);

    try {
      const response =
        await fetch(
          `${BASE_API_URL}/orders`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body:
              JSON.stringify(
                orderData
              ),
          }
        );

      let data = null;

      try {
        data =
          await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Order placement failed (${response.status}).`
        );
      }

      console.log(
        "ORDER SUCCESS:",
        data
      );

      alert(
        "Order placed successfully! 🎉"
      );

      /*
      |--------------------------------------------------------------------------
      | Clear Redux cart only for normal cart checkout.
      |--------------------------------------------------------------------------
      */

      if (!isBuyNow) {
        dispatch(clearCart());
      }

      /*
      |--------------------------------------------------------------------------
      | Go home
      |--------------------------------------------------------------------------
      */

      navigate("/");
    } catch (error) {
      console.error(
        "ORDER ERROR:",
        error
      );

      alert(
        `Order failed!\n\n${
          error?.message ||
          "Please try again."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     EMPTY CART
  ========================================================= */

  if (!orderItems.length) {
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
            Add some products before
            checking out.
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
            Enter your delivery details
            to place your order.
          </p>
        </div>

        {/* ===================================================
            STEPS
        =================================================== */}

        <div className="hidden md:flex items-center mb-10">

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

        {/* ===================================================
            FORM
        =================================================== */}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-[1fr_430px] gap-6 lg:gap-8"
        >

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-6">

            {/* CONTACT */}

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
                      We’ll use this to contact
                      you about your order.
                    </p>
                  </div>

                </div>

                <span className="hidden sm:block text-xs font-medium text-gray-400">
                  Required fields
                </span>
              </div>

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
                      value={
                        formData.name
                      }
                      onChange={
                        handleChange
                      }
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
                      value={
                        formData.phone
                      }
                      onChange={
                        handleChange
                      }
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

            {/* DELIVERY ADDRESS */}

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
                    Where should we deliver
                    your order?
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
                    value={
                      formData.district
                    }
                    onChange={
                      handleChange
                    }
                    disabled={loading}
                    className="w-full h-13 border border-gray-200 rounded-2xl bg-gray-50/60 px-4 text-sm outline-none cursor-pointer transition-all focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      Select your district
                    </option>

                    {districtList.map(
                      (
                        item,
                        index
                      ) => {
                        const districtName =
                          item?.district ??
                          item?.name ??
                          "";

                        return (
                          <option
                            key={`${districtName}-${index}`}
                            value={
                              districtName
                            }
                          >
                            {
                              districtName
                            }
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
                    value={
                      formData.thana
                    }
                    onChange={
                      handleChange
                    }
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
                      (
                        thana,
                        index
                      ) => {
                        const thanaName =
                          typeof thana ===
                          "string"
                            ? thana
                            : thana?.name ??
                              "";

                        return (
                          <option
                            key={`${thanaName}-${index}`}
                            value={
                              thanaName
                            }
                          >
                            {
                              thanaName
                            }
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
                  value={
                    formData.address
                  }
                  onChange={
                    handleChange
                  }
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
                    value={
                      formData.note
                    }
                    onChange={
                      handleChange
                    }
                    rows={3}
                    placeholder="Any special delivery instructions?"
                    disabled={loading}
                    className="w-full border border-gray-200 rounded-2xl bg-gray-50/60 pl-11 pr-4 py-3.5 text-sm outline-none resize-none transition-all focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 disabled:opacity-60"
                  />
                </div>
              </div>

            </section>

            {/* PAYMENT + DELIVERY */}

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
                    Your payment and delivery
                    charge.
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
                        Pay when your order
                        arrives.
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
                          ? cleanString(
                              formData.district
                            ).toLowerCase() ===
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

            {/* TRUST */}

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

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

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
                      key={`${item.productId}-${item.variantId || "default"}-${item.selectedSize || "default"}-${index}`}
                      className="rounded-2xl border border-white/10 bg-white/[0.05] p-3"
                    >

                      <div className="flex gap-4">

                        {/* IMAGE */}

                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">

                          {item.productImage ? (
                            <img
                              src={
                                item.productImage
                              }
                              alt={
                                item.productName
                              }
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
                            {
                              item.productName
                            }
                          </h3>

                          {(item.selectedColor ||
                            item.selectedSize) && (
                            <div className="mt-2 flex flex-wrap gap-1.5">

                              {item.selectedColor && (
                                <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] text-white/60">
                                  Color:{" "}
                                  {
                                    item.selectedColor
                                  }
                                </span>
                              )}

                              {item.selectedSize && (
                                <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] text-white/60">
                                  Size:{" "}
                                  {
                                    item.selectedSize
                                  }
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
                            {
                              item.quantity
                            }
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
                            removeItem(
                              index
                            )
                          }
                          disabled={
                            loading
                          }
                          className="self-start rounded-lg p-2 text-white/30 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
                          aria-label="Remove item"
                        >
                          <FiTrash2
                            size={15}
                          />
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
                            {
                              item.quantity
                            }
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                index
                              )
                            }
                            disabled={
                              loading
                            }
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

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/55">
                      Subtotal
                    </span>

                    <span className="font-medium text-white">
                      ৳
                      {subtotal.toLocaleString()}
                    </span>
                  </div>

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
                      Pay securely when your
                      order arrives at your
                      doorstep.
                    </p>
                  </div>

                </div>

              </div>

              {/* CONFIRM */}

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

                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-white/30">
                  <FiLock size={12} />

                  <span>
                    Secure & encrypted
                    checkout
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