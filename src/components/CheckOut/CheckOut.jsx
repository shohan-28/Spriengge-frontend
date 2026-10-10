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
  FiX,
  FiAlertCircle,
  FiArrowRight,
  FiTruck,
} from "react-icons/fi";
import { clearCart } from "../Feature/CartSlice";

/* =========================================================
   API URL
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://ourbackend.spriengge.shop/api";

const BASE_API_URL = API_URL
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/products$/, "")
  .replace(/\/orders$/, "");

/* =========================================================
   SUPPORT
========================================================= */

const SUPPORT = {
  facebook: "https://www.facebook.com/spriengge.shop1",
  mobile: "01341783631",
  whatsapp: "01341783631",
};

/* =========================================================
   META PIXEL EVENT HELPER
========================================================= */

const trackMetaEvent = (
  eventName,
  params = {},
  options = {}
) => {
  if (
    typeof window === "undefined" ||
    typeof window.fbq !== "function"
  ) {
    return;
  }

  try {
    window.fbq(
      "track",
      eventName,
      params,
      options
    );
  } catch (error) {
    console.error(
      `Meta Pixel ${eventName} tracking failed:`,
      error
    );
  }
};

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

  if (
    !Number.isFinite(numberValue) ||
    numberValue < 1
  ) {
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

  if (
    !Number.isFinite(quantity) ||
    quantity < 1
  ) {
    return 1;
  }

  return Math.floor(quantity);
};

/* =========================================================
   FIND VARIANT
========================================================= */

const findItemVariant = (item) => {
  if (!item) {
    return null;
  }

  const variants = Array.isArray(item?.variants)
    ? item.variants
    : [];

  if (!variants.length) {
    return null;
  }

  const variantId = normalizeVariantId(
    item?.variantId
  );

  const selectedColor = cleanString(
    item?.selectedColor ?? item?.color
  ).toLowerCase();

  /* -------------------------------------------------------
     1. VARIANT ID
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     2. COLOR FALLBACK
  ------------------------------------------------------- */

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

  /* PRODUCT ID */

  const productId = normalizeProductId(
    item?.productId ??
      item?.id ??
      null
  );

  if (!productId) {
    return null;
  }

  /* NESTED VARIANT */

  const nestedVariant =
    item?.selectedVariant ||
    item?.variant ||
    null;

  /* VARIANT ID */

  let variantId = normalizeVariantId(
    item?.variantId ??
      nestedVariant?.variantId ??
      ""
  );

  /* COLOR */

  let selectedColor = cleanString(
    item?.selectedColor ??
      item?.color ??
      nestedVariant?.color ??
      ""
  );

  /* COLOR CODE */

  let selectedColorCode = cleanString(
    item?.selectedColorCode ??
      item?.colorCode ??
      nestedVariant?.colorCode ??
      ""
  );

  /* SIZE */

  let selectedSize = cleanString(
    item?.selectedSize ??
      item?.size ??
      ""
  );

  /* FIND REAL VARIANT */

  const foundVariant = findItemVariant({
    ...item,
    variantId,
    selectedColor,
  });

  if (foundVariant) {
    variantId = normalizeVariantId(
      foundVariant?.variantId
    );

    selectedColor =
      selectedColor ||
      cleanString(foundVariant?.color);

    selectedColorCode =
      selectedColorCode ||
      cleanString(foundVariant?.colorCode);

    const availableSizes =
      Array.isArray(foundVariant?.sizes)
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

  /* QUANTITY */

  const quantity =
    forcedQuantity !== null
      ? normalizeQuantity(forcedQuantity)
      : normalizeQuantity(
          item?.quantity ??
            item?.qty ??
            1
        );

  /* PRICE */

  const rawPrice =
    foundVariant?.price ??
    nestedVariant?.price ??
    item?.price ??
    item?.unitPrice ??
    0;

  const price = Number(rawPrice);

  const safePrice =
    Number.isFinite(price) && price >= 0
      ? price
      : 0;

  /* IMAGE */

  const productImage =
    item?.productImage ||
    foundVariant?.images?.[0] ||
    foundVariant?.image ||
    nestedVariant?.images?.[0] ||
    nestedVariant?.image ||
    item?.image ||
    item?.images?.[0] ||
    "";

  /* NAME */

  const productName =
    cleanString(
      item?.productName ??
        item?.name ??
        item?.title ??
        "Product"
    ) || "Product";

  return {
    productId,
    productName,
    productImage,
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

  /* =======================================================
     BUY NOW / CART
  ======================================================= */

  const isBuyNow = Boolean(
    state?.product
  );

  const product =
    state?.product || null;

  const buyNowQuantity =
    normalizeQuantity(
      state?.quantity ?? 1
    );

  const cartItems = Array.isArray(
    state?.cartItems
  )
    ? state.cartItems
    : [];

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [formData, setFormData] =
    useState({
      name: "",
      phone: "",
      address: "",
      note: "",
      deliveryArea: "",
    });

  /* =======================================================
     LOADING
  ======================================================= */

  const [loading, setLoading] =
    useState(false);

  /* =======================================================
     POPUP
  ======================================================= */

  const [popup, setPopup] = useState({
    open: false,
    type: "",
    title: "",
    message: "",
    orderId: "",
    total: 0,
    quantity: 0,
    support: null,
  });

  /* =======================================================
     ORDER ITEMS
  ======================================================= */

  const [orderItems, setOrderItems] =
    useState(() => {
      /* BUY NOW */

      if (isBuyNow && product) {
        const normalizedProduct =
          normalizeItem(
            {
              ...product,

              productId:
                product?.productId ??
                product?.id ??
                null,

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

      /* CART CHECKOUT */

      return cartItems
        .map((item) =>
          normalizeItem(item)
        )
        .filter(Boolean);
    });

  /* =======================================================
     INCREASE QUANTITY
  ======================================================= */

  const increaseQuantity = (index) => {
    if (loading) {
      return;
    }

    setOrderItems((previous) =>
      previous.map(
        (item, itemIndex) => {
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
        }
      )
    );
  };

  /* =======================================================
     DECREASE QUANTITY
  ======================================================= */

  const decreaseQuantity = (index) => {
    if (loading) {
      return;
    }

    setOrderItems((previous) =>
      previous.map(
        (item, itemIndex) => {
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
        }
      )
    );
  };

  /* =======================================================
     REMOVE ITEM
  ======================================================= */

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

  /* =======================================================
     SUBTOTAL
  ======================================================= */

  const subtotal = useMemo(() => {
    return orderItems.reduce(
      (total, item) =>
        total +
        Number(item?.price || 0) *
          Number(item?.quantity || 0),
      0
    );
  }, [orderItems]);

  /* =======================================================
     DELIVERY CHARGE

     inside-dhaka  = 60
     outside-dhaka = 100
  ======================================================= */

  const deliveryCharge = useMemo(() => {
    if (
      formData.deliveryArea ===
      "inside-dhaka"
    ) {
      return 60;
    }

    if (
      formData.deliveryArea ===
      "outside-dhaka"
    ) {
      return 100;
    }

    return 0;
  }, [formData.deliveryArea]);

  /* =======================================================
     TOTAL
  ======================================================= */

  const total =
    subtotal + deliveryCharge;

  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

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

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     DELIVERY AREA
  ======================================================= */

  const handleDeliveryAreaChange = (
    area
  ) => {
    if (loading) {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      deliveryArea: area,
    }));
  };

  /* =======================================================
     VALIDATE ITEMS
  ======================================================= */

  const validateItems = () => {
    if (!orderItems.length) {
      return "আপনার কার্ট খালি।";
    }

    for (const item of orderItems) {
      if (
        !Number.isFinite(
          Number(item?.productId)
        ) ||
        Number(item.productId) < 1
      ) {
        return `"${
          item?.productName ||
          "Product"
        }"-এর Product ID পাওয়া যায়নি।`;
      }

      if (!item?.productName) {
        return "Product name পাওয়া যায়নি।";
      }

      if (
        !Number.isFinite(
          Number(item?.quantity)
        ) ||
        Number(item.quantity) < 1
      ) {
        return `"${
          item.productName
        }"-এর quantity সঠিক নয়।`;
      }

      if (
        !Number.isFinite(
          Number(item?.price)
        ) ||
        Number(item.price) < 0
      ) {
        return `"${
          item.productName
        }"-এর price সঠিক নয়।`;
      }

      if (
        item?.variantId &&
        typeof item.variantId !==
          "string"
      ) {
        return `"${
          item.productName
        }"-এর variant সঠিক নয়।`;
      }
    }

    return null;
  };

  /* =======================================================
     CLOSE POPUP
  ======================================================= */

  const closePopup = () => {
    setPopup({
      open: false,
      type: "",
      title: "",
      message: "",
      orderId: "",
      total: 0,
      quantity: 0,
      support: null,
    });
  };

  /* =======================================================
     CONTINUE SHOPPING
  ======================================================= */

  const handleContinueShopping =
    () => {
      closePopup();
      navigate("/");
    };

  /* =======================================================
     COPY SUPPORT NUMBER
  ======================================================= */

  const copySupportNumber = async (
    number
  ) => {
    try {
      await navigator.clipboard.writeText(
        number
      );
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }
  };

  /* =======================================================
     PLACE ORDER
  ======================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    /* -----------------------------------------------------
       FORM VALUES
    ----------------------------------------------------- */

    const name = cleanString(
      formData.name
    );

    const phone = cleanString(
      formData.phone
    );

    const address = cleanString(
      formData.address
    );

    const note = cleanString(
      formData.note
    );

    const deliveryArea =
      cleanString(
        formData.deliveryArea
      );

    /* -----------------------------------------------------
       NAME
    ----------------------------------------------------- */

    if (!name || name.length < 2) {
      setPopup({
        open: true,
        type: "error",
        title: "নাম প্রয়োজন",
        message:
          "দয়া করে আপনার নাম লিখুন।",
        orderId: "",
        total: 0,
        quantity: 0,
        support: null,
      });

      return;
    }

    /* -----------------------------------------------------
       PHONE
    ----------------------------------------------------- */

    if (
      !phone ||
      !/^01\d{9}$/.test(phone)
    ) {
      setPopup({
        open: true,
        type: "error",
        title: "ফোন নম্বর সঠিক নয়",
        message:
          "দয়া করে সঠিক ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর দিন।",
        orderId: "",
        total: 0,
        quantity: 0,
        support: null,
      });

      return;
    }

    /* -----------------------------------------------------
       ADDRESS
    ----------------------------------------------------- */

    if (
      !address ||
      address.length < 5
    ) {
      setPopup({
        open: true,
        type: "error",
        title: "ঠিকানা প্রয়োজন",
        message:
          "দয়া করে আপনার সম্পূর্ণ ঠিকানা লিখুন।",
        orderId: "",
        total: 0,
        quantity: 0,
        support: null,
      });

      return;
    }

    /* -----------------------------------------------------
       DELIVERY AREA
    ----------------------------------------------------- */

    if (
      deliveryArea !==
        "inside-dhaka" &&
      deliveryArea !==
        "outside-dhaka"
    ) {
      setPopup({
        open: true,
        type: "error",
        title: "ডেলিভারি এলাকা নির্বাচন করুন",
        message:
          "দয়া করে ঢাকা শহরের ভিতরে অথবা ঢাকা শহরের বাইরে—যে এলাকায় ডেলিভারি হবে সেটি নির্বাচন করুন।",
        orderId: "",
        total: 0,
        quantity: 0,
        support: null,
      });

      return;
    }

    /* -----------------------------------------------------
       ITEM VALIDATION
    ----------------------------------------------------- */

    const itemError =
      validateItems();

    if (itemError) {
      setPopup({
        open: true,
        type: "error",
        title: "অর্ডার করা যাচ্ছে না",
        message: itemError,
        orderId: "",
        total: 0,
        quantity: 0,
        support: null,
      });

      return;
    }

    /* -----------------------------------------------------
       FINAL ITEMS

       Backend-এর জন্য শুধু প্রয়োজনীয়
       product/variant information পাঠানো হচ্ছে।
    ----------------------------------------------------- */

    const finalItems =
      orderItems.map((item) => ({
        productId:
          Number(item.productId),

        variantId:
          item.variantId || "",

        selectedColor:
          item.selectedColor || "",

        selectedColorCode:
          item.selectedColorCode || "",

        selectedSize:
          item.selectedSize || "",

        quantity:
          Number(item.quantity),
      }));

    const firstItem =
      finalItems[0];

    /* -----------------------------------------------------
       FINAL DELIVERY CHARGE

       Backend-এর একই rule:
       inside-dhaka  = 60
       outside-dhaka = 100
    ----------------------------------------------------- */

    const finalDeliveryCharge =
      deliveryArea ===
      "inside-dhaka"
        ? 60
        : 100;

    const finalTotal =
      Number(subtotal) +
      finalDeliveryCharge;

    /* -----------------------------------------------------
       ORDER PAYLOAD

       IMPORTANT:
       district / thana এখানে নেই।
    ----------------------------------------------------- */

    const orderData = {
      name,

      phone,

      address,

      note,

      deliveryArea,

      orderType: isBuyNow
        ? "buy_now"
        : "cart",

      productId:
        firstItem.productId,

      variantId:
        firstItem.variantId,

      selectedColor:
        firstItem.selectedColor,

      selectedColorCode:
        firstItem.selectedColorCode,

      selectedSize:
        firstItem.selectedSize,

      quantity:
        firstItem.quantity,

      items: finalItems,

      subtotal:
        Number(subtotal),

      deliveryCharge:
        finalDeliveryCharge,

      total:
        finalTotal,

      paymentMethod:
        "cash_on_delivery",

      paymentStatus:
        "pending",

      source:
        "website",

      orderSource:
        "website",
    };

    /* -----------------------------------------------------
       DEBUG
    ----------------------------------------------------- */

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

    /* -----------------------------------------------------
       LOADING
    ----------------------------------------------------- */

    setLoading(true);

    try {
      /* ---------------------------------------------------
         API REQUEST
      --------------------------------------------------- */

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

      /* ---------------------------------------------------
         RESPONSE
      --------------------------------------------------- */

      let data = null;

      try {
        data =
          await response.json();
      } catch {
        data = null;
      }

      /* ---------------------------------------------------
         API ERROR
      --------------------------------------------------- */

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

      /* ---------------------------------------------------
         ORDER ID
      --------------------------------------------------- */

      const orderId =
        data?.order?._id ||
        data?.order?.orderId ||
        data?.orderId ||
        data?.data?._id ||
        data?._id ||
        "";

      /* ===================================================
         META PIXEL — PURCHASE
         
         IMPORTANT:
         এখানে backend order success হওয়ার পরেই
         Purchase event fire হচ্ছে।

         Validation error হলে এখানে আসবে না।
         Backend error হলে এখানে আসবে না।
         Buy Now click করলেই এখানে আসবে না।
      =================================================== */

      const purchaseEventId =
        orderId
          ? String(orderId)
          : `order_${Date.now()}_${Math.random()
              .toString(36)
              .slice(2, 10)}`;

      /* ---------------------------------------------------
         ALL PURCHASED PRODUCT IDS
         
         Cart হলে একাধিক product থাকতে পারে।
         Buy Now হলে সাধারণত একটি product থাকবে।
      --------------------------------------------------- */

      const purchaseContentIds = [
        ...new Set(
          orderItems
            .map((item) =>
              normalizeProductId(
                item?.productId
              )
            )
            .filter(Boolean)
            .map((id) =>
              String(id)
            )
        ),
      ];

      /* ---------------------------------------------------
         PURCHASE EVENT
      --------------------------------------------------- */

      trackMetaEvent(
        "Purchase",
        {
          content_ids:
            purchaseContentIds,

          content_type:
            "product",

          value:
            Number(finalTotal),

          currency:
            "BDT",

          num_items:
            orderItems.reduce(
              (sum, item) =>
                sum +
                Number(
                  item?.quantity || 0
                ),
              0
            ),
        },
        {
          eventID:
            purchaseEventId,
        }
      );

      console.log(
        "META PURCHASE EVENT SENT:",
        {
          eventID:
            purchaseEventId,

          content_ids:
            purchaseContentIds,

          value:
            Number(finalTotal),

          currency:
            "BDT",

          num_items:
            orderItems.reduce(
              (sum, item) =>
                sum +
                Number(
                  item?.quantity || 0
                ),
              0
            ),
        }
      );

      /* ---------------------------------------------------
         ORDERED QUANTITY
      --------------------------------------------------- */

      const orderedQuantity =
        orderItems.reduce(
          (sum, item) =>
            sum +
            Number(
              item?.quantity || 0
            ),
          0
        );

      /* ---------------------------------------------------
         ORDER TOTAL
      --------------------------------------------------- */

      const orderedTotal =
        Number(finalTotal);

      /* ---------------------------------------------------
         CLEAR CART

         Buy Now হলে cart clear হবে না।
      --------------------------------------------------- */

      if (!isBuyNow) {
        dispatch(clearCart());
      }

      /* ---------------------------------------------------
         SUCCESS POPUP
      --------------------------------------------------- */

      setPopup({
        open: true,
        type: "success",
        title: "অর্ডার সফল হয়েছে!",
        message:
          "ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। আমাদের টিম খুব শীঘ্রই আপনার সাথে যোগাযোগ করবে।",
        orderId,
        total:
          orderedTotal,
        quantity:
          orderedQuantity,
        support: null,
      });
    } catch (error) {
      console.error(
        "ORDER ERROR:",
        error
      );

      /* ---------------------------------------------------
         IMPORTANT:
         এখানে Purchase event fire করা হবে না।
         
         কারণ backend order সফল হয়নি।
      --------------------------------------------------- */

      /* ---------------------------------------------------
         ERROR POPUP
      --------------------------------------------------- */

      setPopup({
        open: true,
        type: "error",
        title: "অর্ডার করা যায়নি",
        message:
          error?.message ||
          "অর্ডার করার সময় একটি সমস্যা হয়েছে।",
        orderId: "",
        total: 0,
        quantity: 0,
        support: SUPPORT,
      });
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     EMPTY CART
  ======================================================= */

  if (
    !orderItems.length &&
    !popup.open
  ) {
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

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-gray-900">
      {/* ===================================================
          HEADER
      =================================================== */}

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

      {/* ===================================================
          MAIN
      =================================================== */}

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

        {/* =================================================
            STEPS
        ================================================= */}

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

        {/* =================================================
            FORM
        ================================================= */}

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
                      placeholder="017xxxxxxxx"
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
                    Where should we deliver
                    your order?
                  </p>
                </div>
              </div>

              {/* FULL ADDRESS */}

              <div>
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
                  rows={3}
                  placeholder="House / Flat, Road, Area, Landmark..."
                  autoComplete="street-address"
                  disabled={loading}
                  className="w-full border border-gray-200 rounded-2xl bg-gray-50/60 px-4 py-1.5 text-sm outline-none resize-none transition-all focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 disabled:opacity-60"
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
                    rows={2}
                    placeholder="আপনার মতামত থাকলে লিখুন"
                    disabled={loading}
                    className="w-full border border-gray-200 rounded-2xl bg-gray-50/60 pl-11 pr-4 py-3.5 text-sm outline-none resize-none transition-all focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 disabled:opacity-60"
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                DELIVERY AREA + PAYMENT
            ================================================= */}

            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-7">
              {/* HEADER */}

              <div className="mb-6 flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                  <FiTruck
                    size={18}
                    className="text-gray-700"
                  />
                </div>

                <div>
                  <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                    Payment & Delivery
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-400 sm:text-sm">
                    Choose your delivery area and payment method.
                  </p>
                </div>
              </div>

              {/* DELIVERY AREA */}

              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-900">
                  Delivery Area
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {/* INSIDE DHAKA */}

                  <button
                    type="button"
                    onClick={() =>
                      handleDeliveryAreaChange(
                        "inside-dhaka"
                      )
                    }
                    disabled={loading}
                    aria-pressed={
                      formData.deliveryArea ===
                      "inside-dhaka"
                    }
                    className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${
                      formData.deliveryArea ===
                      "inside-dhaka"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 bg-white hover:border-gray-400"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                          formData.deliveryArea ===
                          "inside-dhaka"
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {formData.deliveryArea ===
                          "inside-dhaka" && (
                          <FiCheck
                            size={11}
                            strokeWidth={3}
                          />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          ঢাকা শহরের ভিতরে
                        </p>

                        <p className="mt-0.5 text-[11px] text-gray-400">
                          Dhaka City
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-bold text-gray-900">
                      ৳60
                    </span>
                  </button>

                  {/* OUTSIDE DHAKA */}

                  <button
                    type="button"
                    onClick={() =>
                      handleDeliveryAreaChange(
                        "outside-dhaka"
                      )
                    }
                    disabled={loading}
                    aria-pressed={
                      formData.deliveryArea ===
                      "outside-dhaka"
                    }
                    className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${
                      formData.deliveryArea ===
                      "outside-dhaka"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 bg-white hover:border-gray-400"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                          formData.deliveryArea ===
                          "outside-dhaka"
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {formData.deliveryArea ===
                          "outside-dhaka" && (
                          <FiCheck
                            size={11}
                            strokeWidth={3}
                          />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          ঢাকা শহরের বাইরে
                        </p>

                        <p className="mt-0.5 text-[11px] text-gray-400">
                          Outside Dhaka
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-bold text-gray-900">
                      ৳100
                    </span>
                  </button>
                </div>
              </div>

              {/* COD */}

              <div className="mt-5 rounded-xl border border-gray-900 bg-gray-50 px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                      💵
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Cash on Delivery
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-400">
                        Pay when your order arrives.
                      </p>
                    </div>
                  </div>

                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white">
                    <FiCheck
                      size={11}
                      strokeWidth={3}
                    />
                  </div>
                </div>
              </div>

              {/* DELIVERY CHARGE */}

              <div className="mt-3.5 rounded-xl border border-gray-200 px-4 py-3.5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      🚚
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Delivery Charge
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-400">
                        {formData.deliveryArea ===
                        "inside-dhaka"
                          ? "Dhaka city delivery"
                          : formData.deliveryArea ===
                            "outside-dhaka"
                          ? "Outside Dhaka delivery"
                          : "Select your delivery area"}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {formData.deliveryArea ? (
                      <>
                        <p className="text-base font-bold text-gray-900">
                          ৳
                          {deliveryCharge.toLocaleString()}
                        </p>

                        <div className="mt-0.5 flex items-center justify-end gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                          <span className="text-[10px] font-medium text-green-600">
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
                TRUST
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

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="lg:col-span-1">
            <div className="sticky top-6 overflow-hidden rounded-3xl bg-[#171717] text-white shadow-2xl">
              {/* HEADER */}

              <div className="border-b border-white/10 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/70">
                      Your order
                    </p>

                    <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
                      Order Summary
                    </h2>
                  </div>

                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white">
                    {orderItems.length}{" "}
                    {orderItems.length ===
                    1
                      ? "Item"
                      : "Items"}
                  </span>
                </div>
              </div>

              {/* PRODUCTS */}

              <div className="space-y-3 px-5 py-4">
                {orderItems.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={`${item.productId}-${
                        item.variantId ||
                        "default"
                      }-${
                        item.selectedSize ||
                        "default"
                      }-${index}`}
                      className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                    >
                      <div className="flex gap-3">
                        {/* IMAGE */}

                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
                          {item.productImage ? (
                            <img
                              src={
                                item.productImage
                              }
                              alt={
                                item.productName
                              }
                              className="h-full w-full object-cover"
                              onError={(
                                event
                              ) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-gray-500">
                              No Image
                            </div>
                          )}
                        </div>

                        {/* PRODUCT INFO */}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="line-clamp-2 text-[13px] font-semibold leading-5 text-white">
                              {
                                item.productName
                              }
                            </h3>

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
                              className="shrink-0 rounded-md p-1.5 text-white/70 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
                              aria-label="Remove item"
                            >
                              <FiTrash2
                                size={
                                  13
                                }
                              />
                            </button>
                          </div>

                          {/* VARIANTS */}

                          {(item.selectedColor ||
                            item.selectedSize) && (
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {item.selectedColor && (
                                <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] text-white">
                                  Color:{" "}
                                  {
                                    item.selectedColor
                                  }
                                </span>
                              )}

                              {item.selectedSize && (
                                <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] text-white">
                                  Size:{" "}
                                  {
                                    item.selectedSize
                                  }
                                </span>
                              )}
                            </div>
                          )}

                          {/* PRICE */}

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10px] text-white/70">
                              ৳
                              {Number(
                                item.price
                              ).toLocaleString()}{" "}
                              ×{" "}
                              {
                                item.quantity
                              }
                            </span>

                            <span className="text-xs font-semibold text-white">
                              ৳
                              {Number(
                                item.subtotal
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* QUANTITY */}

                      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                        <span className="text-[10px] text-white/70">
                          Quantity
                        </span>

                        <div className="flex items-center gap-1.5">
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
                              size={12}
                            />
                          </button>

                          <span className="min-w-[24px] text-center text-xs font-semibold text-white">
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
                              size={12}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* PRICE */}

              <div className="border-t border-white/10 px-5 py-4">
                <div className="space-y-2.5">
                  {/* SUBTOTAL */}

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">
                      Subtotal
                    </span>

                    <span className="font-medium text-white">
                      ৳
                      {subtotal.toLocaleString()}
                    </span>
                  </div>

                  {/* DELIVERY */}

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">
                      Delivery Charge
                    </span>

                    <span className="font-medium text-white">
                      {formData.deliveryArea ? (
                        <>
                          ৳
                          {deliveryCharge.toLocaleString()}
                        </>
                      ) : (
                        <span className="text-[10px] text-white/70">
                          Select delivery area
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* TOTAL */}

                <div className="mt-4 border-t border-white/10 pt-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-white/70">
                        Total
                      </p>

                      <p className="mt-1 text-2xl font-bold tracking-tight text-white">
                        ৳
                        {total.toLocaleString()}
                      </p>
                    </div>

                    <span className="mb-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[15px] font-semibold text-green-400">
                      COD
                    </span>
                  </div>
                </div>
              </div>

              {/* PAYMENT INFO */}

              <div className="mx-5 mb-4 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    💵
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-white">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-[10px] text-white/70">
                      Pay securely when your order arrives
                    </p>
                  </div>
                </div>
              </div>

              {/* CONFIRM */}

              <div className="px-5 pb-5">
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !orderItems.length
                  }
                  className="cursor-pointer group flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-3.5 text-xs font-bold text-black shadow-lg transition-all duration-200 hover:bg-gray-100 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black" />

                      <span>
                        Placing Order...
                      </span>
                    </>
                  ) : (
                    <>
                      <FiCheck
                        size={16}
                        className="transition-transform group-hover:scale-110"
                      />

                      <span>
                        Confirm Order
                      </span>
                    </>
                  )}
                </button>

                <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[9px] text-white/70">
                  <FiLock size={10} />

                  <span>
                    Secure & encrypted checkout
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ===================================================
          CUSTOM SCROLLBAR
      =================================================== */}

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

          @keyframes popupIn {
            from {
              opacity: 0;
              transform: translateY(12px) scale(0.97);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>

      {/* ===================================================
          POPUP
      =================================================== */}

      {popup.open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closePopup();
            }
          }}
        >
          <div
            className="relative w-full max-w-[390px] overflow-hidden rounded-[28px] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.25)] animate-[popupIn_.22s_ease-out]"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            {/* CLOSE */}

            <button
              type="button"
              onClick={closePopup}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
              aria-label="Close popup"
            >
              <FiX size={16} />
            </button>

            {/* CONTENT */}

            <div className="px-7 pb-7 pt-8 text-center">
              {/* ICON */}

              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
                  popup.type ===
                  "success"
                    ? "bg-emerald-50"
                    : "bg-red-50"
                }`}
              >
                {popup.type ===
                "success" ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                    <FiCheck
                      size={21}
                      strokeWidth={3}
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-sm">
                    <FiAlertCircle
                      size={21}
                      strokeWidth={2.5}
                    />
                  </div>
                )}
              </div>

              {/* TITLE */}

              <h3 className="mt-5 text-xl font-bold tracking-tight text-gray-900">
                {popup.title}
              </h3>

              {/* MESSAGE */}

              <p className="mx-auto mt-2 max-w-[310px] text-sm leading-6 text-gray-500">
                {popup.message}
              </p>

              {/* SUCCESS INFO */}

              {popup.type ===
                "success" && (
                <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                  {/* ORDER ID */}

                  {popup.orderId && (
                    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                      <span className="text-xs text-gray-400">
                        Order ID
                      </span>

                      <span className="max-w-[180px] truncate text-xs font-semibold text-gray-800">
                        {
                          popup.orderId
                        }
                      </span>
                    </div>
                  )}

                  {/* QUANTITY */}

                  <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <span className="text-xs text-gray-400">
                      Items
                    </span>

                    <span className="text-sm font-semibold text-gray-800">
                      {
                        popup.quantity
                      }
                    </span>
                  </div>

                  {/* TOTAL */}

                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-gray-400">
                      Total
                    </span>

                    <span className="text-base font-bold text-gray-900">
                      ৳
                      {Number(
                        popup.total
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* =================================================
                  ERROR SUPPORT
              ================================================= */}

              {popup.type ===
                "error" &&
                popup.support && (
                  <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left">
                    <p className="text-sm font-semibold text-gray-700">
                      অর্ডার করতে কি কোনো
                      সমস্যা হচ্ছে?
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      সমস্যাটি সমাধান না
                      হলে আমাদের Facebook
                      পেজে যোগাযোগ করুন
                      অথবা WhatsApp-এর
                      মাধ্যমে সরাসরি অর্ডার
                      করুন।
                    </p>

                    {/* FACEBOOK */}

                    <a
                      href={
                        popup.support
                          .facebook
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center justify-center rounded-xl bg-[#1877F2] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      Facebook-এ যোগাযোগ করুন
                    </a>

                    {/* MOBILE */}

                    <div className="mt-3 flex items-center justify-between rounded-xl bg-white px-3 py-2.5 border border-gray-100">
                      <div>
                        <p className="text-[11px] text-gray-400">
                          Mobile
                        </p>

                        <p className="text-sm font-semibold text-gray-800">
                          {
                            popup
                              .support
                              .mobile
                          }
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          copySupportNumber(
                            popup
                              .support
                              .mobile
                          )
                        }
                        className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200"
                      >
                        Copy
                      </button>
                    </div>

                    {/* WHATSAPP */}

                    <a
                      href={`https://wa.me/88${popup.support.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center justify-between rounded-xl bg-[#25D366] px-3 py-2.5 text-white"
                    >
                      <div>
                        <p className="text-[11px] text-white/70">
                          WhatsApp
                        </p>

                        <p className="text-sm font-semibold">
                          {
                            popup
                              .support
                              .whatsapp
                          }
                        </p>
                      </div>

                      <span className="rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold">
                        সরাসরি অর্ডার
                      </span>
                    </a>

                    {/* COPY WHATSAPP */}

                    <div className="mt-2 flex items-center justify-between rounded-xl bg-white px-3 py-2.5 border border-gray-100">
                      <div>
                        <p className="text-[11px] text-gray-400">
                          WhatsApp Number
                        </p>

                        <p className="text-sm font-semibold text-gray-800">
                          {
                            popup
                              .support
                              .whatsapp
                          }
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          copySupportNumber(
                            popup
                              .support
                              .whatsapp
                          )
                        }
                        className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

              {/* ACTION */}

              {popup.type ===
              "success" ? (
                <button
                  type="button"
                  onClick={
                    handleContinueShopping
                  }
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
                >
                  <span>
                    Continue Shopping
                  </span>

                  <FiArrowRight
                    size={16}
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={closePopup}
                  className="mt-6 w-full rounded-2xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
                >
                  ঠিক আছে
                </button>
              )}
            </div>

            {/* SUCCESS FOOTER */}

            {popup.type ===
              "success" && (
              <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 text-center">
                <p className="text-[11px] text-gray-400">
                  Thank you for shopping
                  with Spriengge.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;