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
  FiClock,
  FiShoppingBag,
} from "react-icons/fi";

/* =========================================================
   API CONFIG
========================================================= */

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  "https://ourbackend.spriengge.shop/api";

const API_URL = RAW_API_URL
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/products$/, "")
  .replace(/\/orders$/, "");

/* =========================================================
   HELPERS
========================================================= */

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

/* =========================================================
   BACKEND IMAGE HELPERS

   IMPORTANT:
   কোনো hardcoded image URL নেই।

   Backend থেকে image নেওয়ার priority:
   1. product.image
   2. product.images[]
   3. product.details.images[]
   4. product.variants[].images[]
========================================================= */

const isValidImageUrl = (value) => {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
};

const getProductImages = (product) => {
  if (!product) {
    return [];
  }

  const images = [];

  /* -------------------------------------------------------
     1. TOP LEVEL product.image
  ------------------------------------------------------- */

  if (isValidImageUrl(product?.image)) {
    images.push(product.image.trim());
  }

  /* -------------------------------------------------------
     2. TOP LEVEL product.images
  ------------------------------------------------------- */

  if (Array.isArray(product?.images)) {
    product.images.forEach((image) => {
      if (isValidImageUrl(image)) {
        images.push(image.trim());
      }
    });
  }

  /* -------------------------------------------------------
     3. details.images
  ------------------------------------------------------- */

  if (Array.isArray(product?.details?.images)) {
    product.details.images.forEach((image) => {
      if (isValidImageUrl(image)) {
        images.push(image.trim());
      }
    });
  }

  /* -------------------------------------------------------
     4. VARIANT IMAGES
  ------------------------------------------------------- */

  if (Array.isArray(product?.variants)) {
    product.variants.forEach((variant) => {
      if (Array.isArray(variant?.images)) {
        variant.images.forEach((image) => {
          if (isValidImageUrl(image)) {
            images.push(image.trim());
          }
        });
      }

      if (isValidImageUrl(variant?.image)) {
        images.push(variant.image.trim());
      }
    });
  }

  /* -------------------------------------------------------
     REMOVE DUPLICATES
  ------------------------------------------------------- */

  return [...new Set(images)];
};

const getProductImage = (product) => {
  const images = getProductImages(product);

  return images[0] || "";
};

/* =========================================================
   PRICE HELPERS

   Backend price is the source of truth.
========================================================= */

const getProductPrice = (product) => {
  const price = Number(product?.price);

  return Number.isFinite(price) && price >= 0
    ? price
    : 0;
};

const getProductOldPrice = (product) => {
  const oldPrice = Number(product?.oldPrice);

  return Number.isFinite(oldPrice) && oldPrice > 0
    ? oldPrice
    : 0;
};

const getProductDiscount = (
  product,
  price,
  oldPrice
) => {
  const productDiscount = Number(product?.discount);

  if (
    Number.isFinite(productDiscount) &&
    productDiscount > 0
  ) {
    return productDiscount;
  }

  if (oldPrice > price) {
    return oldPrice - price;
  }

  return 0;
};

/* =========================================================
   PRODUCT LIST NORMALIZER
========================================================= */

const getProductsFromResponse = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.products)) {
    return data.products;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.products)) {
    return data.data.products;
  }

  if (Array.isArray(data?.result)) {
    return data.result;
  }

  return [];
};

/* =========================================================
   COMPONENT
========================================================= */

const MakeupOne = () => {
  const { id } = useParams();

  /* =======================================================
     PRODUCT
  ======================================================= */

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productError, setProductError] = useState("");

  /* =======================================================
     QUANTITY
  ======================================================= */

  const [quantity, setQuantity] = useState(1);

  /* =======================================================
     FORM
  ======================================================= */

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
    deliveryArea: "",
  });

  /* =======================================================
     ORDER
  ======================================================= */

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  /* =======================================================
     IMAGE SLIDER
  ======================================================= */

  const [activeImage, setActiveImage] = useState(0);

  /* =======================================================
     COUNTDOWN
  ======================================================= */

  const [timeLeft, setTimeLeft] = useState({
    hours: 1,
    minutes: 59,
    seconds: 59,
  });

  /* =======================================================
     LOAD PRODUCT
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setProductError("");
        setProduct(null);
        setActiveImage(0);

        const productId = normalizeProductId(id);

        if (!productId) {
          throw new Error("Invalid product ID.");
        }

        const response = await fetch(
          `${API_URL}/products`
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

        const products = getProductsFromResponse(data);

        if (!products.length) {
          throw new Error("No products found.");
        }

        /* ---------------------------------------------------
           FIND PRODUCT
        --------------------------------------------------- */

        const loadedProduct = products.find((item) => {
          const itemProductId = normalizeProductId(
            item?.productId ?? item?.id
          );

          return itemProductId === productId;
        });

        if (!loadedProduct) {
          throw new Error(
            `Product with ID ${productId} was not found.`
          );
        }

        /* ---------------------------------------------------
           BACKEND DEBUG
        --------------------------------------------------- */

        console.log(
          "================================="
        );

        console.log(
          "LANDING PRODUCT FROM BACKEND:",
          loadedProduct
        );

        console.log(
          "LANDING BACKEND PRODUCT IMAGE:",
          loadedProduct?.image
        );

        console.log(
          "LANDING BACKEND PRODUCT IMAGES:",
          loadedProduct?.images
        );

        console.log(
          "LANDING BACKEND VARIANT IMAGES:",
          loadedProduct?.variants
        );

        console.log(
          "LANDING BACKEND PRICE:",
          loadedProduct?.price
        );

        console.log(
          "LANDING BACKEND OLD PRICE:",
          loadedProduct?.oldPrice
        );

        console.log(
          "================================="
        );

        const loadedProductId = normalizeProductId(
          loadedProduct?.productId ??
            loadedProduct?.id
        );

        if (!loadedProductId) {
          throw new Error(
            "Product response does not contain a valid productId."
          );
        }

        /* ---------------------------------------------------
           GET BACKEND IMAGES
        --------------------------------------------------- */

        const backendImages =
          getProductImages(loadedProduct);

        console.log(
          "LANDING BACKEND IMAGES USED:",
          backendImages
        );

        /* ---------------------------------------------------
           NORMALIZE PRODUCT

           IMPORTANT:
           কোনো external/hardcoded image এখানে যোগ করা হচ্ছে না।
        --------------------------------------------------- */

        const normalizedProduct = {
          ...loadedProduct,

          productId: loadedProductId,

          image:
            backendImages[0] || "",

          images: backendImages,

          price:
            Number(loadedProduct?.price) || 0,

          oldPrice:
            Number(loadedProduct?.oldPrice) || 0,

          discount:
            Number(loadedProduct?.discount) || 0,
        };

        console.log(
          "FINAL LANDING PRODUCT:",
          normalizedProduct
        );

        console.log(
          "FINAL LANDING IMAGES:",
          normalizedProduct.images
        );

        console.log(
          "FINAL LANDING PRICE:",
          normalizedProduct.price
        );

        if (!cancelled) {
          setProduct(normalizedProduct);
          setActiveImage(0);
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

  /* =======================================================
     PRODUCT IMAGES

     Backend image list
  ======================================================= */

  const productImages = useMemo(() => {
    const images = getProductImages(product);

    return images;
  }, [product]);

  /* =======================================================
     KEEP ACTIVE IMAGE VALID
  ======================================================= */

  useEffect(() => {
    if (!productImages.length) {
      setActiveImage(0);
      return;
    }

    if (activeImage >= productImages.length) {
      setActiveImage(0);
    }
  }, [productImages, activeImage]);

  /* =======================================================
     AUTO IMAGE SLIDER

     Backend-এ একাধিক image থাকলেই slider চলবে।
  ======================================================= */

  useEffect(() => {
    if (productImages.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setActiveImage((prev) =>
        prev === productImages.length - 1
          ? 0
          : prev + 1
      );
    }, 4500);

    return () => clearInterval(timer);
  }, [productImages.length]);

  /* =======================================================
     COUNTDOWN
  ======================================================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let {
          hours,
          minutes,
          seconds,
        } = prev;

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

  /* =======================================================
     PRODUCT INFORMATION
  ======================================================= */

  const price = useMemo(() => {
    return getProductPrice(product);
  }, [product]);

  const oldPrice = useMemo(() => {
    return getProductOldPrice(product);
  }, [product]);

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

  /* =======================================================
     DELIVERY
  ======================================================= */

  const deliveryCharge =
    formData.deliveryArea === "inside-dhaka"
      ? 60
      : formData.deliveryArea === "outside-dhaka"
      ? 100
      : 0;

  /* =======================================================
     TOTAL
  ======================================================= */

  const safeQuantity = Math.max(
    1,
    Math.floor(Number(quantity) || 1)
  );

  const subtotal = price * safeQuantity;
  const total = subtotal + deliveryCharge;

  /* =======================================================
     INPUT
  ======================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =======================================================
     PHONE
  ======================================================= */

  const handlePhoneChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 11);

    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));
  };

  /* =======================================================
     DELIVERY AREA
  ======================================================= */

  const handleDeliveryAreaChange = (area) => {
    if (
      area !== "inside-dhaka" &&
      area !== "outside-dhaka"
    ) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      deliveryArea: area,
    }));
  };

  /* =======================================================
     QUANTITY
  ======================================================= */

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

  /* =======================================================
     SUBMIT ORDER
  ======================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    /* PRODUCT */

    if (!product) {
      alert("Product not found.");
      return;
    }

    const productId = normalizeProductId(
      product?.productId ?? product?.id
    );

    if (!productId) {
      alert("Invalid product ID.");
      return;
    }

    /* NAME */

    const customerName = cleanString(
      formData.name
    );

    if (!customerName) {
      alert("দয়া করে আপনার নাম লিখুন।");
      return;
    }

    /* PHONE */

    const customerPhone = cleanString(
      formData.phone
    );

    if (!/^01\d{9}$/.test(customerPhone)) {
      alert(
        "দয়া করে সঠিক ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর দিন।"
      );
      return;
    }

    /* ADDRESS */

    const customerAddress = cleanString(
      formData.address
    );

    if (!customerAddress) {
      alert(
        "দয়া করে আপনার সম্পূর্ণ ঠিকানা লিখুন।"
      );
      return;
    }

    /* DELIVERY AREA */

    const customerDeliveryArea = cleanString(
      formData.deliveryArea
    );

    if (
      customerDeliveryArea !== "inside-dhaka" &&
      customerDeliveryArea !== "outside-dhaka"
    ) {
      alert(
        "দয়া করে ডেলিভারি এলাকা নির্বাচন করুন।"
      );
      return;
    }

    /* QUANTITY */

    const finalQuantity = Math.max(
      1,
      Math.floor(Number(quantity) || 1)
    );

    /* STOCK */

    if (
      productStock !== null &&
      productStock <= 0
    ) {
      alert(
        "দুঃখিত, এই পণ্যটি বর্তমানে স্টকে নেই।"
      );
      return;
    }

    if (
      productStock !== null &&
      finalQuantity > productStock
    ) {
      alert(
        `স্টকে মাত্র ${productStock}টি পণ্য আছে।`
      );

      setQuantity(productStock);

      return;
    }

    /* PRICE */

    const finalPrice = Number(
      product?.price
    );

    if (
      !Number.isFinite(finalPrice) ||
      finalPrice < 0
    ) {
      alert("Invalid product price.");
      return;
    }

    /* DELIVERY CHARGE */

    let finalDeliveryCharge = 0;

    if (
      customerDeliveryArea === "inside-dhaka"
    ) {
      finalDeliveryCharge = 60;
    } else if (
      customerDeliveryArea === "outside-dhaka"
    ) {
      finalDeliveryCharge = 100;
    } else {
      alert(
        "দয়া করে সঠিক ডেলিভারি এলাকা নির্বাচন করুন।"
      );

      return;
    }

    /* TOTAL */

    const finalSubtotal =
      finalPrice * finalQuantity;

    const finalTotal =
      finalSubtotal + finalDeliveryCharge;

    /* ORDER ITEM */

    const orderItem = {
      productId,

      productName:
        cleanString(product?.name) ||
        "Product",

      /* BACKEND PRODUCT IMAGE */
      productImage:
        productImage || "",

      variantId: "",
      selectedColor: "",
      selectedColorCode: "",
      selectedSize: "",

      /* BACKEND PRODUCT PRICE */
      price: finalPrice,

      quantity: finalQuantity,

      subtotal: finalSubtotal,
    };

    /* ORDER PAYLOAD */

    const orderData = {
      name: customerName,

      phone: customerPhone,

      address: customerAddress,

      note: cleanString(formData.note),

      deliveryArea:
        customerDeliveryArea,

      productId,

      productName:
        cleanString(product?.name) ||
        "Product",

      /* BACKEND PRODUCT IMAGE */
      productImage:
        productImage || "",

      /* BACKEND PRODUCT PRICE */
      price: finalPrice,

      quantity: finalQuantity,

      subtotal: finalSubtotal,

      deliveryCharge:
        finalDeliveryCharge,

      total: finalTotal,

      items: [orderItem],

      orderSource: "landing-page",

      landingPageId: cleanString(id),

      paymentMethod: "cod",

      status: "pending",
    };

    console.log(
      "================================="
    );

    console.log(
      "FINAL LANDING ORDER:",
      orderData
    );

    console.log(
      "BACKEND PRODUCT IMAGE:",
      productImage
    );

    console.log(
      "BACKEND PRODUCT PRICE:",
      product?.price
    );

    console.log(
      "FINAL ORDER PRICE:",
      finalPrice
    );

    console.log(
      "DELIVERY AREA SENT:",
      orderData.deliveryArea
    );

    console.log(
      "FINAL ORDER TOTAL:",
      finalTotal
    );

    console.log(
      "================================="
    );

    /* SEND ORDER */

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
            "অর্ডার সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।"
        );
      }

      /* SUCCESS */

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
        address: "",
        note: "",
        deliveryArea: "",
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

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center px-5">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 rounded-full border border-black/10" />

            <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-black animate-spin" />

            <div className="absolute inset-3 rounded-full bg-black flex items-center justify-center">
              <span className="text-white text-[9px] font-black">
                S
              </span>
            </div>
          </div>

          <p className="mt-5 text-[10px] uppercase tracking-[.2em] font-bold text-gray-400">
            Preparing your experience
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     PRODUCT NOT FOUND
  ======================================================= */

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center px-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-black/5 shadow-sm flex items-center justify-center text-red-500">
          <FiX size={25} />
        </div>

        <h1 className="mt-6 text-3xl sm:text-4xl font-black tracking-tight">
          Product Not Found
        </h1>

        <p className="mt-3 max-w-md text-sm text-gray-500 leading-6">
          {productError ||
            "Sorry, this product is currently unavailable."}
        </p>

        <a
          href="/"
          className="mt-7 inline-flex items-center gap-2 px-6 h-12 rounded-xl bg-[#171717] text-white text-sm font-bold hover:bg-black transition"
        >
          Back to Home

          <FiArrowRight size={14} />
        </a>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#171717] overflow-hidden">
      <style>{`
        @keyframes floatProduct {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes softPulse {
          0%, 100% {
            transform: scale(.95);
            opacity: .4;
          }

          50% {
            transform: scale(1.06);
            opacity: .7;
          }
        }

        @keyframes revealUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .float-product {
          animation:
            floatProduct
            5s
            ease-in-out
            infinite;
        }

        .soft-pulse {
          animation:
            softPulse
            5s
            ease-in-out
            infinite;
        }

        .reveal-up {
          animation:
            revealUp
            .8s
            ease-out
            both;
        }

        .reveal-delay {
          animation-delay: .12s;
        }

        .reveal-delay-2 {
          animation-delay: .22s;
        }

        .image-hover {
          transition:
            transform
            .7s
            cubic-bezier(.2,.8,.2,1);
        }

        .image-card:hover .image-hover {
          transform: scale(1.035);
        }
      `}</style>

      {/* =====================================================
          HEADER
      ===================================================== */}

      

      <main>
        {/* ===================================================
            HERO
        =================================================== */}

        <section className="relative min-h-screen flex items-center pt-24 pb-12 sm:pt-28 lg:pt-24">
          <div className="pointer-events-none absolute top-10 left-[-180px] w-[420px] h-[420px] rounded-full bg-[#dce9df]/60 blur-[90px] soft-pulse" />

          <div
            className="pointer-events-none absolute right-[-180px] bottom-10 w-[430px] h-[430px] rounded-full bg-[#eadbc7]/60 blur-[100px] soft-pulse"
            style={{
              animationDelay: "1.5s",
            }}
          />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid lg:grid-cols-[1.02fr_.98fr] gap-10 lg:gap-16 items-center">

              {/* LEFT */}

              <div className="reveal-up">
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#171717] text-white px-3.5 py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[.12em]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Limited Time Offer
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-black/[.06] px-3.5 py-2 text-[9px] sm:text-[10px] font-bold text-gray-500 backdrop-blur-xl">
                    <FiClock size={12} />

                    {String(timeLeft.hours).padStart(
                      1,
                      "0"
                    )}
                    :
                    {String(timeLeft.minutes).padStart(
                      2,
                      "0"
                    )}
                    :
                    {String(timeLeft.seconds).padStart(
                      2,
                      "0"
                    )}
                  </span>
                </div>

                <p className="text-[9px] sm:text-[10px] uppercase tracking-[.3em] text-gray-400 font-black">
                  Spriengge Essential
                </p>

                <h1 className="mt-4 text-[43px] sm:text-5xl lg:text-[62px] xl:text-[70px] leading-[.94] tracking-[-.06em] font-black max-w-2xl">
                  {product.name}
                </h1>

                <p className="mt-6 max-w-xl text-sm sm:text-base text-gray-500 leading-7">
                  {product?.details
                    ?.shortDescription ||
                    product.description ||
                    "Premium quality product designed for comfort, style and everyday use."}
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <FiStar
                          key={star}
                          size={14}
                          className="text-[#c99b5e] fill-current"
                        />
                      )
                    )}
                  </div>

                  <span className="text-xs font-black">
                    {Number(product.rating) || "4.9"}
                  </span>

                  <span className="text-xs text-gray-400">
                    •{" "}
                    {Number(product.reviews) ||
                      "500+"}{" "}
                    happy customers
                  </span>
                </div>

                {/* PRICE */}

                <div className="mt-7 flex items-end flex-wrap gap-3">
                  <span className="text-4xl sm:text-5xl font-black tracking-[-.05em]">
                    ৳{price}
                  </span>

                  {oldPrice > price && (
                    <span className="mb-1 text-lg text-red-400 line-through">
                      ৳{oldPrice}
                    </span>
                  )}

                  {discount > 0 && (
                    <span className="mb-1 px-3 py-1.5 rounded-full bg-[#e7f2e9] text-[#3e7651] text-[10px] font-black">
                      SAVE ৳{discount}
                    </span>
                  )}
                </div>

                <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-x-5 gap-y-3">
                  <Benefit text="Premium Quality" />
                  <Benefit text="Cash on Delivery" />
                  <Benefit text="Fast Delivery" />
                  <Benefit text="Easy Support" />
                </div>

                <div className="hidden lg:flex items-center gap-4 mt-9">
                  <a
                    href="#order"
                    className="group inline-flex items-center justify-center gap-3 h-13 px-6 rounded-2xl bg-[#171717] text-white text-sm font-bold hover:bg-[#292929] transition-all duration-300"
                  >
                    Order Now

                    <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <FiArrowRight size={14} />
                    </span>
                  </a>

                  <span className="text-[9px] uppercase tracking-[.15em] font-black text-gray-400">
                    Cash on Delivery Available
                  </span>
                </div>
              </div>

              {/* RIGHT PRODUCT */}

              <div className="relative reveal-up reveal-delay">
                <div className="absolute inset-[12%] rounded-full bg-[#d9e6db] blur-[80px] opacity-70 soft-pulse" />

                <div className="relative">
                  {discount > 0 && (
                    <div className="absolute -top-4 -right-2 sm:-top-6 sm:-right-5 z-30">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#171717] text-white flex flex-col items-center justify-center rotate-6 shadow-xl">
                        <span className="text-[8px] uppercase tracking-widest text-white/50">
                          Save
                        </span>

                        <span className="text-sm sm:text-base font-black">
                          ৳{discount}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="image-card relative overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] bg-white border border-black/[.05] shadow-[0_30px_80px_rgba(35,30,20,.09)]">
                    <div className="relative aspect-[4/4.25] sm:aspect-[4/4.5] overflow-hidden">

                      {/* =================================================
                          BACKEND PRODUCT IMAGES
                      ================================================= */}

                      {productImages.length > 0 ? (
                        productImages.map(
                          (image, index) => (
                            <img
                              key={`${image}-${index}`}
                              src={image}
                              alt={`${product.name} ${
                                index + 1
                              }`}
                              loading={
                                index === 0
                                  ? "eager"
                                  : "lazy"
                              }
                              className={`
                                image-hover
                                absolute
                                inset-0
                                w-full
                                h-full
                                object-cover
                                transition-all
                                duration-[1000ms]
                                ease-out
                                ${
                                  activeImage ===
                                  index
                                    ? "opacity-100 scale-100"
                                    : "opacity-0 scale-[1.05]"
                                }
                              `}
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          )
                        )
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#f3f1ec]">
                          <div className="text-center px-6">
                            <FiShoppingBag
                              size={35}
                              className="mx-auto text-gray-300"
                            />

                            <p className="mt-3 text-xs font-bold text-gray-400">
                              Product image unavailable
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                      <div className="absolute left-5 bottom-5 sm:left-7 sm:bottom-7">
                        <div className="float-product bg-white/90 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-xl border border-white">
                          <p className="text-[8px] uppercase tracking-[.17em] text-gray-400 font-black">
                            Designed for
                          </p>

                          <p className="mt-1 text-xs sm:text-sm font-black">
                            Clean. Calm. Beautiful.
                          </p>
                        </div>
                      </div>

                      {/* IMAGE INDICATORS */}

                      {productImages.length > 1 && (
                        <div className="absolute right-5 bottom-6 flex flex-col gap-2">
                          {productImages.map(
                            (_, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() =>
                                  setActiveImage(
                                    index
                                  )
                                }
                                aria-label={`Show image ${
                                  index + 1
                                }`}
                                className={`
                                  rounded-full
                                  transition-all
                                  duration-300
                                  ${
                                    activeImage ===
                                    index
                                      ? "w-2 h-7 bg-[#171717]"
                                      : "w-2 h-2 bg-black/25 hover:bg-black/50"
                                  }
                                `}
                              />
                            )
                          )}
                        </div>
                      )}
                    </div>

                    <div className="px-5 sm:px-7 py-5 flex items-center justify-between border-t border-black/[.05]">
                      <div>
                        <p className="text-[8px] uppercase tracking-[.2em] text-gray-400 font-black">
                          Spriengge Collection
                        </p>

                        <p className="mt-1 text-xs sm:text-sm font-black">
                          Premium Everyday Essential
                        </p>
                      </div>

                      <div className="hidden sm:flex items-center gap-2 text-[9px] text-gray-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />

                        {productStock !== null
                          ? productStock > 0
                            ? "In Stock"
                            : "Out of Stock"
                          : "Available"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            TRUST STRIP
        =================================================== */}

        <section className="border-y border-black/[.05] bg-white/60">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-7">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              <TrustItem
                icon={<FiShield />}
                title="Secure Order"
                text="Your information is protected"
              />

              <TrustItem
                icon={<FiTruck />}
                title="Fast Delivery"
                text="Reliable delivery service"
              />

              <TrustItem
                icon={<FiCheck />}
                title="Cash on Delivery"
                text="Pay when you receive"
              />

              <TrustItem
                icon={<FiStar />}
                title="Premium Quality"
                text="Carefully selected products"
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            ORDER SECTION
        =================================================== */}

        <section
          id="order"
          className="relative py-16 sm:py-20 lg:py-28"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[.78fr_1.22fr] gap-8 lg:gap-12 items-start">

              {/* ORDER INFO */}

              <div className="lg:sticky lg:top-10 reveal-up">
                <p className="text-[9px] uppercase tracking-[.28em] font-black text-gray-400">
                  Quick & Easy
                </p>

                <h2 className="mt-3 text-4xl sm:text-5xl font-black tracking-[-.06em] leading-[.92]">
                  Get yours
                  <br />
                  today.
                </h2>

                <p className="mt-5 text-sm text-gray-500 leading-7 max-w-md">
                  শুধু আপনার তথ্যগুলো পূরণ করুন।
                  অর্ডার পাওয়ার পর আমাদের টিম
                  আপনার সাথে যোগাযোগ করে
                  অর্ডারটি কনফার্ম করবে।
                </p>

                <div className="mt-8 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border border-black/[.05] shadow-sm">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#f3f1ec]">
                        <FiShoppingBag
                          size={20}
                          className="text-gray-300"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">
                      Your Selection
                    </p>

                    <h3 className="mt-1 text-sm font-black">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-sm font-black">
                      ৳{price}
                    </p>
                  </div>
                </div>

                <div className="mt-7 rounded-2xl bg-[#ebe8df] p-4">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-white flex items-center justify-center">
                      <FiTruck size={15} />
                    </div>

                    <div>
                      <p className="text-xs font-black">
                        Delivery Information
                      </p>

                      <p className="mt-1 text-[10px] text-gray-500 leading-5">
                        ঢাকা শহরের ভিতরে: ৳60 ·
                        ঢাকার বাইরে: ৳100
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FORM */}

              <div className="reveal-up reveal-delay-2">
                <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-black/[.05] shadow-[0_25px_70px_rgba(35,30,20,.07)] p-5 sm:p-7 lg:p-9">
                  <div className="mb-7">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] uppercase tracking-[.22em] font-black text-gray-400">
                          Order Form
                        </p>

                        <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-[-.04em]">
                          Place your order
                        </h2>
                      </div>

                      <div className="hidden sm:flex w-10 h-10 rounded-full bg-[#f3f2ee] items-center justify-center">
                        <FiShoppingBag size={16} />
                      </div>
                    </div>

                    <p className="mt-2 text-xs sm:text-sm text-gray-400">
                      আপনার তথ্য দিয়ে অর্ডারটি সম্পন্ন করুন।
                    </p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {/* NAME + PHONE */}

                    <div className="grid sm:grid-cols-2 gap-3">
                      <PremiumInput
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="আপনার নাম"
                        required
                      />

                      <PremiumInput
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        placeholder="01XXXXXXXXX"
                        inputMode="numeric"
                        maxLength={11}
                        required
                      />
                    </div>

                    {/* FULL ADDRESS */}

                    <div className="mt-3">
                      <label className="block text-[9px] uppercase tracking-wider font-black text-gray-500 mb-2">
                        সম্পূর্ণ ঠিকানা

                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="বাড়ি, রোড, গ্রাম, এলাকা, বাজার..."
                        required
                        rows={3}
                        className="w-full px-4 py-3.5 rounded-xl bg-[#f7f6f3] border border-transparent text-sm outline-none focus:bg-white focus:border-black/10 transition resize-none"
                      />
                    </div>

                    {/* NOTE */}

                    <div className="mt-3">
                      <label className="block text-[9px] uppercase tracking-wider font-black text-gray-500 mb-2">
                        আপনার মতামত থাকলে লিখুন

                        <span className="ml-1 normal-case tracking-normal font-normal text-gray-400">
                          (optional)
                        </span>
                      </label>

                      <input
                        type="text"
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        placeholder="কোনো বিশেষ নির্দেশনা?"
                        className="w-full h-12 px-4 rounded-xl bg-[#f7f6f3] border border-transparent text-sm outline-none focus:bg-white focus:border-black/10 transition"
                      />
                    </div>

                    {/* PRODUCT + QUANTITY */}

                    <div className="mt-5 rounded-2xl bg-[#f7f6f3] p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiShoppingBag
                                size={18}
                                className="text-gray-300"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-black truncate">
                            {product.name}
                          </h3>

                          <p className="mt-1 text-xs text-gray-400">
                            ৳{price} × {safeQuantity}
                          </p>
                        </div>

                        <div className="flex items-center bg-white rounded-xl border border-black/[.06] overflow-hidden">
                          <button
                            type="button"
                            onClick={
                              decreaseQuantity
                            }
                            disabled={
                              safeQuantity <= 1
                            }
                            className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition"
                          >
                            <FiMinus size={13} />
                          </button>

                          <span className="w-7 text-center text-sm font-black">
                            {safeQuantity}
                          </span>

                          <button
                            type="button"
                            onClick={
                              increaseQuantity
                            }
                            disabled={
                              productStock !==
                                null &&
                              productStock > 0 &&
                              safeQuantity >=
                                productStock
                            }
                            className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition"
                          >
                            <FiPlus size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* DELIVERY AREA */}

                    <div className="mt-5">
                      <label className="block text-[9px] uppercase tracking-wider font-black text-gray-500 mb-2">
                        ডেলিভারি এলাকা

                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {/* DHAKA */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeliveryAreaChange(
                              "inside-dhaka"
                            )
                          }
                          className={`
                            text-left
                            rounded-2xl
                            p-4
                            border
                            transition-all
                            duration-300
                            ${
                              formData.deliveryArea ===
                              "inside-dhaka"
                                ? "border-black bg-[#f5f4ef] shadow-sm"
                                : "border-black/[.06] bg-white hover:border-black/20"
                            }
                          `}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[8px] uppercase tracking-wider text-gray-400 font-black">
                                Delivery Area
                              </p>

                              <p className="mt-1 text-sm font-black">
                                ঢাকা শহরের ভিতরে
                              </p>
                            </div>

                            <span
                              className={`
                                w-5 h-5
                                rounded-full
                                border
                                flex
                                items-center
                                justify-center
                                shrink-0
                                ${
                                  formData.deliveryArea ===
                                  "inside-dhaka"
                                    ? "bg-[#171717] border-[#171717] text-white"
                                    : "border-black/15"
                                }
                              `}
                            >
                              {formData.deliveryArea ===
                                "inside-dhaka" && (
                                <FiCheck size={11} />
                              )}
                            </span>
                          </div>

                          <p className="mt-3 text-xl font-black">
                            ৳60
                          </p>
                        </button>

                        {/* OUTSIDE DHAKA */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeliveryAreaChange(
                              "outside-dhaka"
                            )
                          }
                          className={`
                            text-left
                            rounded-2xl
                            p-4
                            border
                            transition-all
                            duration-300
                            ${
                              formData.deliveryArea ===
                              "outside-dhaka"
                                ? "border-black bg-[#f5f4ef] shadow-sm"
                                : "border-black/[.06] bg-white hover:border-black/20"
                            }
                          `}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[8px] uppercase tracking-wider text-gray-400 font-black">
                                Delivery Area
                              </p>

                              <p className="mt-1 text-sm font-black">
                                ঢাকা শহরের বাইরে
                              </p>
                            </div>

                            <span
                              className={`
                                w-5 h-5
                                rounded-full
                                border
                                flex
                                items-center
                                justify-center
                                shrink-0
                                ${
                                  formData.deliveryArea ===
                                  "outside-dhaka"
                                    ? "bg-[#171717] border-[#171717] text-white"
                                    : "border-black/15"
                                }
                              `}
                            >
                              {formData.deliveryArea ===
                                "outside-dhaka" && (
                                <FiCheck size={11} />
                              )}
                            </span>
                          </div>

                          <p className="mt-3 text-xl font-black">
                            ৳100
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* SUMMARY */}

                    <div className="mt-5 border-t border-black/[.06] pt-5 space-y-3">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          Product ({safeQuantity} × ৳
                          {price})
                        </span>

                        <span className="font-semibold text-gray-800">
                          ৳{subtotal}
                        </span>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          Delivery
                        </span>

                        <span className="font-semibold text-gray-800">
                          {deliveryCharge
                            ? `৳${deliveryCharge}`
                            : "এলাকা নির্বাচন করুন"}
                        </span>
                      </div>

                      <div className="flex items-end justify-between pt-3 border-t border-black/[.06]">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-gray-400 font-black">
                            Total Amount
                          </p>

                          <p className="mt-1 text-3xl font-black tracking-[-.05em]">
                            ৳{total}
                          </p>
                        </div>

                        <span className="mb-1 text-[8px] uppercase tracking-wider font-black text-gray-400">
                          Cash on Delivery
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
                      className="
                        group
                        mt-5
                        w-full
                        h-14
                        rounded-2xl
                        bg-[#171717]
                        hover:bg-[#292929]
                        disabled:bg-gray-300
                        text-white
                        font-black
                        text-sm
                        flex
                        items-center
                        justify-center
                        gap-3
                        transition-all
                        duration-300
                        active:scale-[.99]
                      "
                    >
                      {submitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                          Processing...
                        </>
                      ) : productStock !== null &&
                        productStock <= 0 ? (
                        "Out of Stock"
                      ) : (
                        <>
                          Confirm Order — ৳
                          {total}

                          <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                            <FiArrowRight
                              size={14}
                            />
                          </span>
                        </>
                      )}
                    </button>

                    {/* TRUST */}

                    <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[8px] uppercase tracking-wider text-gray-400 font-black">
                      <span className="flex items-center gap-1.5">
                        <FiShield size={11} />
                        Secure
                      </span>

                      <span className="flex items-center gap-1.5">
                        <FiTruck size={11} />
                        Fast Delivery
                      </span>

                      <span className="flex items-center gap-1.5">
                        <FiCheck size={11} />
                        COD
                      </span>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="border-t border-black/[.06] bg-[#eeece6]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm font-black">
                  Spriengge
                </p>

                <p className="mt-1 text-[9px] text-gray-400">
                  Premium essentials for everyday life.
                </p>
              </div>

              <p className="text-[8px] uppercase tracking-[.18em] text-gray-400 font-black">
                © {new Date().getFullYear()} Spriengge
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* =====================================================
          SUCCESS MODAL
      ===================================================== */}

      {success && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center px-4">
          <div className="relative w-full max-w-sm rounded-[2rem] bg-white p-7 sm:p-8 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setSuccessOrder(null);
              }}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
            >
              <FiX size={15} />
            </button>

            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FiCheck size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black">
              অর্ডার সফল হয়েছে!
            </h2>

            <p className="mt-3 text-sm text-gray-500 leading-6">
              আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।
              আমাদের টিম খুব শীঘ্রই আপনার সাথে যোগাযোগ করবে।
            </p>

            {successOrder?.orderId && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-emerald-50">
                <p className="text-[9px] uppercase tracking-wider text-gray-400">
                  Order ID
                </p>

                <p className="mt-1 text-xs font-bold break-all">
                  {successOrder.orderId}
                </p>
              </div>
            )}

            <div className="mt-4 p-4 rounded-2xl bg-gray-50">
              <p className="text-[10px] text-gray-400">
                Total Amount
              </p>

              <p className="mt-1 text-3xl font-black">
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
              className="mt-5 w-full h-12 rounded-xl bg-[#171717] text-white font-bold hover:bg-[#292929] transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   BENEFIT
========================================================= */

const Benefit = ({ text }) => {
  return (
    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-gray-600">
      <span className="w-5 h-5 rounded-full bg-[#e7f2e9] text-[#3e7651] flex items-center justify-center shrink-0">
        <FiCheck size={10} />
      </span>

      {text}
    </div>
  );
};

/* =========================================================
   TRUST ITEM
========================================================= */

const TrustItem = ({
  icon,
  title,
  text,
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-black/[.05] flex items-center justify-center text-gray-700">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-black truncate">
          {title}
        </p>

        <p className="mt-1 text-[9px] sm:text-[10px] text-gray-400 truncate">
          {text}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   PREMIUM INPUT
========================================================= */

const PremiumInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  inputMode,
  maxLength,
}) => {
  return (
    <div>
      <label className="block text-[9px] uppercase tracking-wider font-black text-gray-500 mb-2">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        inputMode={inputMode}
        maxLength={maxLength}
        className="
          w-full
          h-12
          px-4
          rounded-xl
          bg-[#f7f6f3]
          border
          border-transparent
          text-sm
          outline-none
          placeholder:text-gray-300
          focus:bg-white
          focus:border-black/10
          transition-all
          duration-300
        "
      />
    </div>
  );
};

export default MakeupOne;