import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import {
  FiHeart,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTruck,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
  FiInfo,
  FiList,
  FiTool,
  FiRotateCcw,
  FiShield,
  FiCheck,
  FiHome,
  FiTag,
  FiBox,
} from "react-icons/fi";

import { IoStar, IoStarOutline } from "react-icons/io5";

import { fetchProduct } from "../Feature/ProductSlice";
import { addToCart } from "../Feature/CartSlice";

const ProductDetails = () => {
  const { productId } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const productState = useSelector((state) => state.product);

  const products = productState?.product || [];
  const loading = productState?.loading || false;
  const error = productState?.error || null;

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);

  const [openSection, setOpenSection] = useState(null);

  /*
  ============================================================
  FETCH PRODUCTS
  ============================================================
  */

  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProduct());
    }
  }, [dispatch, products]);

  /*
  ============================================================
  FIND CURRENT PRODUCT
  ============================================================
  */

 

const product = Array.isArray(products)
  ? products.find((item) => {
      const currentProductId =
        item?.productId ??
        item?.id ??
        item?._id;

      return String(currentProductId) === String(productId);
    })
  : null;

  /*
  ============================================================
  PRODUCT VARIANTS
  ============================================================
  */

const variants = useMemo(() => {
  if (!product) return [];

  if (
    Array.isArray(product.variants) &&
    product.variants.length > 0
  ) {
    return product.variants.map((variant, index) => {
      const fallbackVariantId = `${
        product.productId ??
        product.id ??
        product._id
      }-variant-${index}`;

      return {
        ...variant,

        variantId:
          variant?.variantId ??
          variant?.id ??
          variant?.productId ??
          fallbackVariantId,

        id:
          variant?.id ??
          variant?.variantId ??
          variant?.productId ??
          fallbackVariantId,

        color: variant?.color || "Default",

        colorCode:
          variant?.colorCode || "#e5e7eb",

        price: Number(
          variant?.price ??
            product?.price ??
            0
        ),

        oldPrice: Number(
          variant?.oldPrice ??
            product?.oldPrice ??
            0
        ),

        stock: Number(
          variant?.stock ??
            product?.stock ??
            0
        ),

        images:
          Array.isArray(variant?.images)
            ? variant.images
            : [],

        sizes:
          Array.isArray(variant?.sizes)
            ? variant.sizes
            : [],
      };
    });
  }

  const defaultVariantId = `${
    product.productId ??
    product.id ??
    product._id
  }-default`;

  return [
    {
      ...product,

      variantId: defaultVariantId,

      id: defaultVariantId,

      color:
        product.color || "Default",

      colorCode:
        product.colorCode || "#e5e7eb",

      price: Number(
        product.price || 0
      ),

      oldPrice: Number(
        product.oldPrice || 0
      ),

      stock: Number(
        product.stock || 0
      ),

      images:
        Array.isArray(product.images) &&
        product.images.length > 0
          ? product.images
          : product.image
          ? [product.image]
          : [],

      sizes: [],
    },
  ];
}, [product]);

  /*
  ============================================================
  INITIALIZE PRODUCT VARIANT
  ============================================================
  */

  useEffect(() => {
    if (!product || variants.length === 0) {
      setSelectedVariant(null);
      setSelectedColor("");
      setSelectedSize("");
      setSelectedImage("");
      setQuantity(1);
      return;
    }

    const firstAvailableVariant =
      variants.find((variant) => {
        if (
          Array.isArray(variant?.sizes) &&
          variant.sizes.length > 0
        ) {
          return variant.sizes.some(
            (size) => Number(size?.stock || 0) > 0
          );
        }

        return Number(variant?.stock || 0) > 0;
      }) || variants[0];

    setSelectedVariant(firstAvailableVariant);

    setSelectedColor(
      firstAvailableVariant?.color || ""
    );

    const variantImages =
      Array.isArray(firstAvailableVariant?.images) &&
      firstAvailableVariant.images.length > 0
        ? firstAvailableVariant.images
        : Array.isArray(product.images) &&
          product.images.length > 0
        ? product.images
        : [product.image];

    setSelectedImage(variantImages?.[0] || "");

    const firstAvailableSize =
      Array.isArray(firstAvailableVariant?.sizes)
        ? firstAvailableVariant.sizes.find(
            (size) => Number(size?.stock || 0) > 0
          )
        : null;

    setSelectedSize(
      firstAvailableSize?.size || ""
    );

    setQuantity(1);
  }, [product, variants]);

  /*
  ============================================================
  CURRENT STOCK
  ============================================================
  */

  const currentStock = useMemo(() => {
    if (!selectedVariant) return 0;

    if (
      Array.isArray(selectedVariant.sizes) &&
      selectedVariant.sizes.length > 0
    ) {
      const currentSize =
        selectedVariant.sizes.find(
          (size) =>
            String(size?.size) ===
            String(selectedSize)
        );

      return Number(currentSize?.stock || 0);
    }

    return Number(selectedVariant.stock || 0);
  }, [selectedVariant, selectedSize]);

  /*
  ============================================================
  CURRENT PRICE
  ============================================================
  */

  const currentPrice = Number(
    selectedVariant?.price ??
      product?.price ??
      0
  );

  const currentOldPrice = Number(
    selectedVariant?.oldPrice ??
      product?.oldPrice ??
      0
  );

  /*
  ============================================================
  DISCOUNT
  ============================================================
  */

  const discountPercentage =
    currentOldPrice > currentPrice
      ? Math.round(
          ((currentOldPrice - currentPrice) /
            currentOldPrice) *
            100
        )
      : Number(product?.discount || 0);

  /*
  ============================================================
  PRODUCT IMAGES
  ============================================================
  */

  const productImages = useMemo(() => {
    if (!product) return [];

    const variantImages =
      Array.isArray(selectedVariant?.images)
        ? selectedVariant.images
        : [];

    const mainImages =
      Array.isArray(product.images) &&
      product.images.length > 0
        ? product.images
        : [product.image];

    const images =
      variantImages.length > 0
        ? variantImages
        : mainImages;

    return [
      ...new Set(
        images.filter(
          (image) =>
            typeof image === "string" &&
            image.trim() !== ""
        )
      ),
    ];
  }, [product, selectedVariant]);

  /*
  ============================================================
  COLOR CHANGE
  ============================================================
  */

  const handleColorChange = (variant) => {
    if (!variant) return;

    setSelectedVariant(variant);

    setSelectedColor(
      variant.color || ""
    );

    const images =
      Array.isArray(variant.images) &&
      variant.images.length > 0
        ? variant.images
        : Array.isArray(product?.images) &&
          product.images.length > 0
        ? product.images
        : [product?.image];

    setSelectedImage(images?.[0] || "");

    const firstAvailableSize =
      Array.isArray(variant.sizes)
        ? variant.sizes.find(
            (size) =>
              Number(size?.stock || 0) > 0
          )
        : null;

    setSelectedSize(
      firstAvailableSize?.size || ""
    );

    setQuantity(1);
  };

  /*
  ============================================================
  SIZE CHANGE
  ============================================================
  */

  const handleSizeChange = (size) => {
    if (!size) return;

    if (Number(size.stock || 0) <= 0) {
      return;
    }

    setSelectedSize(size.size);
    setQuantity(1);
  };

  /*
  ============================================================
  QUANTITY
  ============================================================
  */

  const increaseQuantity = () => {
    if (currentStock > 0 && quantity < currentStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  /*
  ============================================================
  CHECKOUT PRODUCT
  ============================================================
  */

  const checkoutProduct = useMemo(() => {
  if (!product) return null;

  const numericProductId =
    product?.productId ??
    product?.id ??
    null;

  const currentVariantId =
    selectedVariant?.variantId ??
    selectedVariant?.id ??
    selectedVariant?.productId ??
    null;

  const currentImage =
    selectedVariant?.images?.[0] ||
    selectedImage ||
    product?.image ||
    "";

  return {
    ...product,

    productId: numericProductId,

    id: numericProductId,

    variantId: currentVariantId,

    selectedColor:
      selectedVariant?.color ||
      product?.color ||
      null,

    selectedColorCode:
      selectedVariant?.colorCode ||
      null,

    selectedSize:
      selectedSize || null,

    price: currentPrice,

    oldPrice: currentOldPrice,

    image: currentImage,

    images:
      Array.isArray(
        selectedVariant?.images
      ) &&
      selectedVariant.images.length > 0
        ? selectedVariant.images
        : product?.images || [],

    stock: currentStock,

    quantity,
  };
}, [
  product,
  selectedVariant,
  selectedSize,
  currentPrice,
  currentOldPrice,
  selectedImage,
  currentStock,
  quantity,
]);

  /*
  ============================================================
  VALIDATE PRODUCT SELECTION
  ============================================================
  */

  const validateSelection = () => {
    if (!product) {
      return false;
    }

    if (!selectedVariant) {
      alert("দয়া করে একটি color select করুন।");
      return false;
    }

    if (currentStock <= 0) {
      alert("এই product বর্তমানে stock out.");
      return false;
    }

    if (
      Array.isArray(selectedVariant?.sizes) &&
      selectedVariant.sizes.length > 0 &&
      !selectedSize
    ) {
      alert("দয়া করে একটি size select করুন।");
      return false;
    }

    return true;
  };

  /*
  ============================================================
  ADD TO CART
  ============================================================
  */

  const handleAddToCart = () => {
    if (!validateSelection()) return;

    dispatch(addToCart(checkoutProduct));
  };

  /*
  ============================================================
  BUY NOW
  ============================================================
  */

  const handleBuyNow = () => {
    if (!validateSelection()) return;

    navigate("/Checkout", {
      state: {
        product: checkoutProduct,
        quantity,
        productId: checkoutProduct?.productId ?? null,
        variantId: checkoutProduct?.variantId ?? null,
      },
    });
  };

  /*
  ============================================================
  ACCORDION
  ============================================================
  */

  const toggleSection = (section) => {
    setOpenSection((prev) =>
      prev === section ? null : section
    );
  };

  /*
  ============================================================
  SEO
  ============================================================
  */

  const seoTitle = product
    ? `${product.name}${
        product.brand
          ? ` | ${product.brand}`
          : ""
      } | Spriengge`
    : "Product Details | Spriengge";

  const seoDescription =
    product?.details?.shortDescription ||
    product?.description ||
    `Buy ${
      product?.name || "quality products"
    } online from Spriengge. Check product price, features, specifications, colors, sizes and delivery information.`;

  const seoKeywords = [
    product?.name,
    product?.brand,
    product?.category,
    ...(Array.isArray(product?.tags)
      ? product.tags
      : []),
    "online shopping Bangladesh",
    "buy online Bangladesh",
    "Spriengge",
  ]
    .filter(Boolean)
    .join(", ");

  /*
  ============================================================
  CANONICAL URL
  ============================================================
  */

  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/ProductDetails/${productId}`
      : "";

  /*
  ============================================================
  SEO IMAGE
  ============================================================
  */

  const seoImage =
    selectedVariant?.images?.[0] ||
    product?.image ||
    "";

  /*
  ============================================================
  PRODUCT SCHEMA
  ============================================================
  */

  const productSchema = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",

        name: product.name,

        description: seoDescription,

        image: productImages,

        sku: String(
  product?.productId ??
    product?.id ??
    product?._id ??
    ""
),

        category: product.category || undefined,

        brand: {
          "@type": "Brand",
          name:
            product.brand || "Spriengge",
        },

        ...(product.rating &&
        Number(product.reviews || 0) > 0
          ? {
              aggregateRating: {
                "@type":
                  "AggregateRating",
                ratingValue: Number(
                  product.rating
                ),
                reviewCount: Number(
                  product.reviews
                ),
              },
            }
          : {}),

        offers: {
          "@type": "Offer",

          url: canonicalUrl,

          priceCurrency: "BDT",

          price: currentPrice,

          availability:
            currentStock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",

          itemCondition:
            "https://schema.org/NewCondition",
        },
      }
    : null;

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading && !product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">

          <div className="w-11 h-11 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-5" />

          <h2 className="text-lg font-semibold text-gray-900">
            Product loading...
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Please wait a moment.
          </p>

        </div>
      </main>
    );
  }

  /*
  ============================================================
  ERROR
  ============================================================
  */

  if (error && !product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">

          <FiBox className="text-5xl text-gray-300 mx-auto mb-5" />

          <h1 className="text-2xl font-bold text-gray-900">
            Unable to Load Product
          </h1>

          <p className="text-gray-500 mt-3 mb-6">
            Product data load করতে সমস্যা হয়েছে।
          </p>

          <button
            type="button"
            onClick={() =>
              dispatch(fetchProduct())
            }
            className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
          >
            Try Again
          </button>

        </div>
      </main>
    );
  }

  /*
  ============================================================
  PRODUCT NOT FOUND
  ============================================================
  */

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

        <div className="text-center max-w-md">

          <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-6">
            <FiBox className="text-4xl text-gray-300" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Product Not Found
          </h1>

          <p className="text-gray-500 mb-2">
            এই product টি খুঁজে পাওয়া যায়নি।
          </p>

          <p className="text-xs text-gray-400 mb-6">
            Product ID: {productId}
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
          >
            <FiHome />
            Back to Home
          </Link>

        </div>

      </main>
    );
  }

  /*
  ============================================================
  RATING
  ============================================================
  */

  const rating = Number(product.rating || 0);

  return (
    <>
      {/* ======================================================
          SEO
      ====================================================== */}

      <Helmet>

        <title>{seoTitle}</title>

        <meta
          name="description"
          content={seoDescription.slice(
            0,
            160
          )}
        />

        <meta
          name="keywords"
          content={seoKeywords}
        />

        <meta
          name="robots"
          content="index, follow, max-image-preview:large"
        />

        <link
          rel="canonical"
          href={canonicalUrl}
        />

        {/* Open Graph */}

        <meta
          property="og:type"
          content="product"
        />

        <meta
          property="og:title"
          content={seoTitle}
        />

        <meta
          property="og:description"
          content={seoDescription.slice(
            0,
            200
          )}
        />

        <meta
          property="og:url"
          content={canonicalUrl}
        />

        <meta
          property="og:site_name"
          content="Spriengge"
        />

        {seoImage && (
          <meta
            property="og:image"
            content={seoImage}
          />
        )}

        {/* Twitter */}

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content={seoTitle}
        />

        <meta
          name="twitter:description"
          content={seoDescription.slice(
            0,
            200
          )}
        />

        {seoImage && (
          <meta
            name="twitter:image"
            content={seoImage}
          />
        )}

        {/* Product JSON-LD */}

        {productSchema && (
          <script type="application/ld+json">
            {JSON.stringify(productSchema)}
          </script>
        )}

      </Helmet>

      {/* ======================================================
          PAGE
      ====================================================== */}

      <main className="min-h-screen bg-transparent text-gray-900">

        {/* ====================================================
            BREADCRUMB
        ==================================================== */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-gray-500"
          >

            <Link
              to="/"
              className="hover:text-black transition"
            >
              Home
            </Link>

            <span>/</span>

            {product.category && (
              <>
                <span className="hover:text-black">
                  {product.category}
                </span>

                <span>/</span>
              </>
            )}

            <span className="text-gray-900 font-medium truncate max-w-[250px]">
              {product.name}
            </span>

          </nav>

        </div>

        {/* ====================================================
            PRODUCT HERO
        ==================================================== */}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

            {/* =================================================
                IMAGE GALLERY
            ================================================= */}

            <div>

              <div className="relative bg-gray-50 rounded-3xl overflow-hidden aspect-square">

                {discountPercentage > 0 && (
                  <div className="absolute top-5 left-5 z-10 bg-black text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full">
                    -{discountPercentage}% OFF
                  </div>
                )}

                {product.isNew && (
                  <div className="absolute top-5 right-5 z-10 bg-white border border-gray-200 text-gray-900 text-xs font-bold px-4 py-2 rounded-full shadow-sm">
                    NEW
                  </div>
                )}

                <img
                  src={
                    selectedImage ||
                    product.image
                  }
                  alt={`${product.name}${
                    selectedVariant?.color
                      ? ` - ${selectedVariant.color}`
                      : ""
                  }`}
                  title={product.name}
                  loading="eager"
                  className="w-full h-full object-contain p-6 sm:p-10"
                />

              </div>

              {productImages.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">

                  {productImages.map(
                    (image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() =>
                          setSelectedImage(
                            image
                          )
                        }
                        aria-label={`View ${product.name} image ${
                          index + 1
                        }`}
                        className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 overflow-hidden bg-gray-50 transition cursor-pointer ${
                          selectedImage === image
                            ? "border-black shadow-md"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >

                        <img
                          src={image}
                          alt={`${product.name} image ${
                            index + 1
                          }`}
                          loading="lazy"
                          className="w-full h-full object-contain p-2"
                        />

                      </button>
                    )
                  )}

                </div>
              )}

            </div>

            {/* =================================================
                PRODUCT INFORMATION
            ================================================= */}

            <div className="flex flex-col">

              {/* Brand */}

              {product.brand && (
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 mb-3">
                  {product.brand}
                </p>
              )}

              {/* H1 */}

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-950 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}

              <div className="flex flex-wrap items-center gap-3 mt-4">

                <div
                  className="flex items-center gap-1"
                  aria-label={`Rating ${rating} out of 5`}
                >

                  {[1, 2, 3, 4, 5].map(
                    (star) =>
                      star <=
                      Math.round(rating) ? (
                        <IoStar
                          key={star}
                          className="text-yellow-500 text-lg"
                        />
                      ) : (
                        <IoStarOutline
                          key={star}
                          className="text-gray-300 text-lg"
                        />
                      )
                  )}

                </div>

                {rating > 0 && (
                  <span className="text-sm font-semibold text-gray-700">
                    {rating.toFixed(1)}
                  </span>
                )}

                {Number(product.reviews || 0) >
                  0 && (
                  <span className="text-sm text-gray-500">
                    ({product.reviews} reviews)
                  </span>
                )}

              </div>

              {/* Price */}

              <div className="flex items-center gap-3 mt-6">

                <span className="text-3xl font-bold text-gray-950">
                  ৳
                  {currentPrice.toLocaleString(
                    "en-BD"
                  )}
                </span>

                {currentOldPrice >
                  currentPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    ৳
                    {currentOldPrice.toLocaleString(
                      "en-BD"
                    )}
                  </span>
                )}

              </div>

              {/* Description */}

              <p className="text-gray-600 leading-7 mt-5">
                {product.details
                  ?.shortDescription ||
                  product.description ||
                  "No description available."}
              </p>

              {/* =================================================
                  SELECT COLOR
              ================================================= */}

              {variants.length > 0 && (
                <div className="mt-8">

                  <div className="flex items-center justify-between mb-4">

                    <div>

                      <h2 className="text-base font-bold text-gray-950">
                        Select Color
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        Selected:{" "}
                        <span className="font-semibold text-gray-900">
                          {selectedColor ||
                            "Choose a color"}
                        </span>
                      </p>

                    </div>

                    <FiTag className="text-gray-400 text-lg" />

                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

                    {variants.map(
                      (variant) => {

                        const hasSizes =
                          Array.isArray(
                            variant?.sizes
                          ) &&
                          variant.sizes.length >
                            0;

                        const variantStock =
                          hasSizes
                            ? variant.sizes.reduce(
                                (
                                  total,
                                  size
                                ) =>
                                  total +
                                  Number(
                                    size?.stock ||
                                      0
                                  ),
                                0
                              )
                            : Number(
                                variant?.stock ||
                                  0
                              );

                        const isOutOfStock =
                          variantStock <= 0;

                        const selectedVariantId =
  selectedVariant?.variantId ??
  selectedVariant?.id ??
  "";

const currentVariantId =
  variant?.variantId ??
  variant?.id ??
  "";

const isSelected =
  String(selectedVariantId) ===
  String(currentVariantId);

                        return (
                          <button
                            key={variant.id}
                            type="button"
                            disabled={
                              isOutOfStock
                            }
                            onClick={() =>
                              handleColorChange(
                                variant
                              )
                            }
                            aria-label={`Select ${variant.color} color`}
                            aria-pressed={
                              isSelected
                            }
                            className={`
                              relative rounded-2xl
                              border-2 p-3
                              text-left
                              transition-all
                              duration-200
                              ${
                                isSelected
                                  ? "border-black bg-gray-50 shadow-md"
                                  : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm"
                              }
                              ${
                                isOutOfStock
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer"
                              }
                            `}
                          >

                            {isSelected && (
                              <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center z-10">
                                <FiCheck className="text-sm" />
                              </span>
                            )}

                            <div className="flex items-center gap-3">

                              <span
                                className={`
                                  w-11 h-11
                                  rounded-full
                                  flex-shrink-0
                                  border-2
                                  border-white
                                  shadow-md
                                  ring-1
                                  ring-gray-200
                                  ${
                                    isSelected
                                      ? "ring-2 ring-black ring-offset-2"
                                      : ""
                                  }
                                `}
                                style={{
                                  backgroundColor:
                                    variant.colorCode ||
                                    "#e5e7eb",
                                }}
                              />

                              <div className="min-w-0 pr-5">

                                <p
                                  className={`font-semibold text-sm truncate ${
                                    isSelected
                                      ? "text-black"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {
                                    variant.color
                                  }
                                </p>

                                <p
                                  className={`text-xs mt-1 ${
                                    isOutOfStock
                                      ? "text-red-500"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {isOutOfStock
                                    ? "Out of stock"
                                    : "Available"}
                                </p>

                              </div>

                            </div>

                          </button>
                        );
                      }
                    )}

                  </div>

                </div>
              )}

              {/* =================================================
                  SIZE
              ================================================= */}

              {Array.isArray(
                selectedVariant?.sizes
              ) &&
                selectedVariant.sizes.length >
                  0 && (
                  <div className="mt-8">

                    <div className="flex items-center justify-between mb-4">

                      <h2 className="text-base font-bold">
                        Select Size
                      </h2>

                      {selectedSize && (
                        <span className="text-sm text-gray-500">
                          Selected:{" "}
                          <span className="font-semibold text-black">
                            {selectedSize}
                          </span>
                        </span>
                      )}

                    </div>

                    <div className="flex flex-wrap gap-3">

                      {selectedVariant.sizes.map(
                        (size) => {

                          const isSelected =
                            String(
                              selectedSize
                            ) ===
                            String(size.size);

                          const outOfStock =
                            Number(
                              size.stock || 0
                            ) <= 0;

                          return (
                            <button
                              key={size.size}
                              type="button"
                              disabled={
                                outOfStock
                              }
                              onClick={() =>
                                handleSizeChange(
                                  size
                                )
                              }
                              className={`
                                min-w-[60px]
                                px-4 py-3
                                rounded-xl
                                border-2
                                text-sm
                                font-semibold
                                transition-all
                                ${
                                  isSelected
                                    ? "bg-black text-white border-black shadow-md"
                                    : "bg-white text-gray-800 border-gray-200 hover:border-black"
                                }
                                ${
                                  outOfStock
                                    ? "opacity-40 cursor-not-allowed line-through"
                                    : ""
                                }
                              `}
                            >
                              {size.size}
                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>
                )}

              {/* =================================================
                  STOCK
              ================================================= */}

              <div className="mt-6">

                {currentStock > 0 ? (
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 px-4 py-2 rounded-full">

                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />

                    {currentStock <= 5
                      ? `Only ${currentStock} left in stock`
                      : "In Stock"}

                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-red-700 bg-red-50 px-4 py-2 rounded-full">

                    <span className="w-2 h-2 bg-red-500 rounded-full" />

                    Out of Stock

                  </div>
                )}

              </div>

              {/* =================================================
                  QUANTITY
              ================================================= */}

              <div className="flex items-center gap-4 mt-7">

                <span className="font-semibold text-sm">
                  Quantity
                </span>

                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">

                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <= 1
                    }
                    aria-label="Decrease quantity"
                    className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <FiMinus />
                  </button>

                  <span className="w-12 text-center font-semibold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      currentStock <= 0 ||
                      quantity >=
                        currentStock
                    }
                    aria-label="Increase quantity"
                    className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <FiPlus />
                  </button>

                </div>

              </div>

              {/* =================================================
                  ACTION BUTTONS
              ================================================= */}

              <div className="grid grid-cols-[1fr_auto] gap-3 mt-7">

                <button
                  type="button"
                  onClick={
                    handleAddToCart
                  }
                  disabled={
                    currentStock <= 0
                  }
                  className="cursor-pointer h-14 bg-black text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <FiShoppingBag className="text-lg" />
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setWishlist(
                      (prev) => !prev
                    )
                  }
                  aria-label="Add product to wishlist"
                  aria-pressed={wishlist}
                  className={`w-14 h-14 rounded-xl border flex items-center justify-center transition ${
                    wishlist
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "border-gray-300 text-gray-700 hover:border-black"
                  }`}
                >
                  <FiHeart
                    className={`text-xl ${
                      wishlist
                        ? "fill-current"
                        : ""
                    }`}
                  />
                </button>

              </div>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={
                  currentStock <= 0
                }
                className="cursor-pointer h-14 mt-3 w-full rounded-xl border-2 border-black bg-white text-black font-semibold hover:bg-black hover:text-white transition disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>

              {/* =================================================
                  DELIVERY CARDS
              ================================================= */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7">

                <div className="border border-gray-200 rounded-xl p-4">
                  <FiTruck className="text-xl mb-2" />

                  <p className="font-semibold text-sm">
                    Fast Delivery
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Quick doorstep delivery
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <FiPackage className="text-xl mb-2" />

                  <p className="font-semibold text-sm">
                    Secure Packaging
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Carefully packed
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <FiShield className="text-xl mb-2" />

                  <p className="font-semibold text-sm">
                    Quality Assured
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Quality checked
                  </p>
                </div>

              </div>

            </div>
          </div>

        </section>

        {/* ======================================================
            PRODUCT DETAILS
        ====================================================== */}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

          <div className="border-t border-gray-200 pt-10">

            {/* ==================================================
                PRODUCT OVERVIEW
                ALWAYS VISIBLE
            ================================================== */}

            <section className="mb-12">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <FiInfo />
                </div>

                <h2 className="text-2xl font-bold">
                  Product Overview
                </h2>

              </div>

              <div className="bg-gray-50 rounded-2xl p-5 sm:p-7">

                <p className="text-gray-700 leading-8 whitespace-pre-line">
                  {product.details
                    ?.overview ||
                    product.description ||
                    "Product overview information is not available."}
                </p>

              </div>

            </section>

            {/* ==================================================
                FEATURES
                ALWAYS VISIBLE
            ================================================== */}

            {Array.isArray(
              product.details?.features
            ) &&
              product.details.features
                .length > 0 && (
                <section className="mb-12">

                  <div className="flex items-center gap-3 mb-5">

                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <FiCheck />
                    </div>

                    <h2 className="text-2xl font-bold">
                      প্রধান বৈশিষ্ট্য
                    </h2>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    {product.details.features.map(
                      (
                        feature,
                        index
                      ) => (
                        <div
                          key={index}
                          className="group border border-gray-200 rounded-2xl p-5 hover:border-gray-400 hover:shadow-sm transition"
                        >

                          <div className="flex items-start gap-3">

                            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-black text-white flex items-center justify-center">
                              <FiCheck className="text-sm" />
                            </div>

                            <p className="text-gray-700 leading-6">
                              {feature}
                            </p>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                </section>
              )}

            {/* ==================================================
                SPECIFICATIONS
                ALWAYS VISIBLE
            ================================================== */}

            {product.details
              ?.specifications &&
              Object.keys(
                product.details
                  .specifications
              ).length > 0 && (
                <section className="mb-12">

                  <div className="flex items-center gap-3 mb-5">

                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <FiList />
                    </div>

                    <h2 className="text-2xl font-bold">
                      Specifications
                    </h2>

                  </div>

                  <div className="border border-gray-200 rounded-2xl overflow-hidden">

                    <div className="overflow-x-auto">

                      <table className="w-full text-sm">

                        <tbody>

                          {Object.entries(
                            product.details
                              .specifications
                          ).map(
                            (
                              [
                                key,
                                value,
                              ],
                              index
                            ) => (
                              <tr
                                key={key}
                                className={
                                  index %
                                    2 ===
                                  0
                                    ? "bg-gray-50"
                                    : "bg-white"
                                }
                              >

                                <td className="px-5 py-4 font-semibold text-gray-800 w-1/3 border-r border-gray-200">
                                  {key}
                                </td>

                                <td className="px-5 py-4 text-gray-600">
                                  {String(
                                    value
                                  )}
                                </td>

                              </tr>
                            )
                          )}

                        </tbody>

                      </table>

                    </div>

                  </div>

                </section>
              )}

            {/* ==================================================
                HOW TO USE
            ================================================== */}

            {product.details?.howToUse && (
              <div className="border-t border-gray-200">

                <button
                  type="button"
                  onClick={() =>
                    toggleSection(
                      "howToUse"
                    )
                  }
                  className="w-full py-5 flex items-center justify-between text-left"
                >

                  <div className="flex items-center gap-3">

                    <FiTool className="text-xl" />

                    <h2 className="text-lg font-bold">
                      How To Use
                    </h2>

                  </div>

                  {openSection ===
                  "howToUse" ? (
                    <FiChevronUp />
                  ) : (
                    <FiChevronDown />
                  )}

                </button>

                {openSection ===
                  "howToUse" && (
                  <div className="pb-6 text-gray-600 leading-7 whitespace-pre-line">
                    {
                      product.details
                        .howToUse
                    }
                  </div>
                )}

              </div>
            )}

            {/* ==================================================
                CARE INSTRUCTIONS
            ================================================== */}

            {product.details
              ?.careInstructions && (
              <div className="border-t border-gray-200">

                <button
                  type="button"
                  onClick={() =>
                    toggleSection(
                      "care"
                    )
                  }
                  className="w-full py-5 flex items-center justify-between text-left"
                >

                  <div className="flex items-center gap-3">

                    <FiTool className="text-xl" />

                    <h2 className="text-lg font-bold">
                      Care Instructions
                    </h2>

                  </div>

                  {openSection ===
                  "care" ? (
                    <FiChevronUp />
                  ) : (
                    <FiChevronDown />
                  )}

                </button>

                {openSection ===
                  "care" && (
                  <div className="pb-6 text-gray-600 leading-7 whitespace-pre-line">
                    {
                      product.details
                        .careInstructions
                    }
                  </div>
                )}

              </div>
            )}

            {/* ==================================================
                WHAT'S INCLUDED
            ================================================== */}

            {product.details
              ?.whatsIncluded && (
              <div className="border-t border-gray-200">

                <button
                  type="button"
                  onClick={() =>
                    toggleSection(
                      "included"
                    )
                  }
                  className="w-full py-5 flex items-center justify-between text-left"
                >

                  <div className="flex items-center gap-3">

                    <FiPackage className="text-xl" />

                    <h2 className="text-lg font-bold">
                      What's Included
                    </h2>

                  </div>

                  {openSection ===
                  "included" ? (
                    <FiChevronUp />
                  ) : (
                    <FiChevronDown />
                  )}

                </button>

                {openSection ===
                  "included" && (
                  <div className="pb-6">

                    {Array.isArray(
                      product.details
                        .whatsIncluded
                    ) ? (
                      <ul className="space-y-3">

                        {product.details.whatsIncluded.map(
                          (
                            item,
                            index
                          ) => (
                            <li
                              key={
                                index
                              }
                              className="flex items-center gap-3 text-gray-600"
                            >
                              <FiCheck className="text-green-600" />

                              {item}
                            </li>
                          )
                        )}

                      </ul>
                    ) : (
                      <p className="text-gray-600">
                        {
                          product
                            .details
                            .whatsIncluded
                        }
                      </p>
                    )}

                  </div>
                )}

              </div>
            )}

            {/* ==================================================
                DELIVERY
            ================================================== */}

            {product.details
              ?.deliveryInfo && (
              <div className="border-t border-gray-200">

                <button
                  type="button"
                  onClick={() =>
                    toggleSection(
                      "delivery"
                    )
                  }
                  className="w-full py-5 flex items-center justify-between text-left"
                >

                  <div className="flex items-center gap-3">

                    <FiTruck className="text-xl" />

                    <h2 className="text-lg font-bold">
                      Delivery Information
                    </h2>

                  </div>

                  {openSection ===
                  "delivery" ? (
                    <FiChevronUp />
                  ) : (
                    <FiChevronDown />
                  )}

                </button>

                {openSection ===
                  "delivery" && (
                  <div className="pb-6">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {product.details
                        .deliveryInfo
                        .insideDhaka && (
                        <div className="bg-gray-50 rounded-xl p-5">

                          <p className="font-semibold mb-2">
                            Inside Dhaka
                          </p>

                          <p className="text-gray-600">
                            {
                              product
                                .details
                                .deliveryInfo
                                .insideDhaka
                            }
                          </p>

                        </div>
                      )}

                      {product.details
                        .deliveryInfo
                        .outsideDhaka && (
                        <div className="bg-gray-50 rounded-xl p-5">

                          <p className="font-semibold mb-2">
                            Outside Dhaka
                          </p>

                          <p className="text-gray-600">
                            {
                              product
                                .details
                                .deliveryInfo
                                .outsideDhaka
                            }
                          </p>

                        </div>
                      )}

                    </div>

                    {product.details
                      .deliveryInfo
                      .deliveryCharge && (
                      <div className="mt-4 text-gray-600">

                        <strong>
                          Delivery Charge:
                        </strong>{" "}

                        {
                          product
                            .details
                            .deliveryInfo
                            .deliveryCharge
                        }

                      </div>
                    )}

                    {product.details
                      .deliveryInfo
                      .note && (
                      <p className="mt-3 text-sm text-gray-500">
                        {
                          product
                            .details
                            .deliveryInfo
                            .note
                        }
                      </p>
                    )}

                  </div>
                )}

              </div>
            )}

            {/* ==================================================
                RETURN POLICY
            ================================================== */}

            {product.details
              ?.returnPolicy && (
              <div className="border-t border-gray-200">

                <button
                  type="button"
                  onClick={() =>
                    toggleSection(
                      "return"
                    )
                  }
                  className="w-full py-5 flex items-center justify-between text-left"
                >

                  <div className="flex items-center gap-3">

                    <FiRotateCcw className="text-xl" />

                    <h2 className="text-lg font-bold">
                      Return Policy
                    </h2>

                  </div>

                  {openSection ===
                  "return" ? (
                    <FiChevronUp />
                  ) : (
                    <FiChevronDown />
                  )}

                </button>

                {openSection ===
                  "return" && (
                  <div className="pb-6 text-gray-600 leading-7 whitespace-pre-line">
                    {
                      product.details
                        .returnPolicy
                    }
                  </div>
                )}

              </div>
            )}

            {/* ==================================================
                WARRANTY
            ================================================== */}

            {product.details?.warranty && (
              <div className="border-t border-gray-200">

                <button
                  type="button"
                  onClick={() =>
                    toggleSection(
                      "warranty"
                    )
                  }
                  className="w-full py-5 flex items-center justify-between text-left"
                >

                  <div className="flex items-center gap-3">

                    <FiShield className="text-xl" />

                    <h2 className="text-lg font-bold">
                      Warranty
                    </h2>

                  </div>

                  {openSection ===
                  "warranty" ? (
                    <FiChevronUp />
                  ) : (
                    <FiChevronDown />
                  )}

                </button>

                {openSection ===
                  "warranty" && (
                  <div className="pb-6 text-gray-600 leading-7 whitespace-pre-line">
                    {
                      product.details
                        .warranty
                    }
                  </div>
                )}

              </div>
            )}

            {/* ==================================================
                TAGS
            ================================================== */}

            {Array.isArray(
              product.tags
            ) &&
              product.tags.length > 0 && (
                <div className="border-t border-gray-200 pt-6">

                  <div className="flex items-center gap-2 flex-wrap">

                    <span className="font-semibold text-sm">
                      Tags:
                    </span>

                    {product.tags.map(
                      (tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-600"
                        >
                          #{tag}
                        </span>
                      )
                    )}

                  </div>

                </div>
              )}

          </div>

        </section>

      </main>
    </>
  );
};

export default ProductDetails;