import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProduct } from "../Feature/ProductSlice";
import { Link } from "react-router-dom";
import { addToCart } from "../Feature/CartSlice";

const ProductUi = () => {
  const ProductData = useSelector(
    (state) => state.product?.product || []
  );

  const loading = useSelector(
    (state) => state.product?.loading
  );

  const dispatch = useDispatch();

  /* =========================================================
     FETCH PRODUCTS
  ========================================================= */

  useEffect(() => {
    dispatch(fetchProduct());
  }, [dispatch]);

  /* =========================================================
     ADD TO CART
  ========================================================= */

  const handleAddToCart = (product) => {
    if (!product) return;

    const productId = Number(
      product?.productId ?? product?.id
    );

    if (!Number.isFinite(productId) || productId <= 0) {
      console.error(
        "Invalid Product ID:",
        product
      );
      return;
    }

    /*
      IMPORTANT:

      If product has variants, user should normally
      select color/size from ProductDetails page.

      Therefore ProductUi sends the product itself
      only when there is no variant selection.

      ProductDetails will handle:
        productId
        variantId
        selectedColor
        selectedSize
    */

    const hasVariants =
      Array.isArray(product?.variants) &&
      product.variants.length > 0;

    if (hasVariants) {
      console.warn(
        "This product has variants. Please select a variant from Product Details."
      );

      return;
    }

    /* =======================================================
       NO VARIANT PRODUCT
    ======================================================= */

    dispatch(
      addToCart({
        productId,

        productName:
          product?.name || "Product",

        productImage:
          product?.image ||
          product?.images?.[0] ||
          "",

        selectedColor: "",
        selectedColorCode: "",
        selectedSize: "",

        variantId: "",

        price: Number(product?.price) || 0,

        oldPrice:
          Number(product?.oldPrice) || 0,

        quantity: 1,

        brand:
          product?.brand || "",

        category:
          product?.category || "",

        stock:
          Number(product?.stock) || 0,
      })
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="w-[90%] mx-auto py-20">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">

          {Array.from({ length: 10 }).map(
            (_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
              >
                <div className="h-56 animate-pulse bg-gray-200" />

                <div className="space-y-3 p-5">

                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />

                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />

                  <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />

                  <div className="flex items-center justify-between pt-3">

                    <div className="h-7 w-20 animate-pulse rounded bg-gray-200" />

                    <div className="h-10 w-24 animate-pulse rounded-xl bg-gray-200" />

                  </div>

                </div>
              </div>
            )
          )}

        </div>

      </div>
    );
  }

  /* =========================================================
     EMPTY
  ========================================================= */

  if (
    !Array.isArray(ProductData) ||
    ProductData.length === 0
  ) {
    return (
      <div className="w-[90%] mx-auto py-20 text-center">

        <div className="rounded-2xl border border-gray-200 bg-white p-10">

          <h2 className="text-xl font-semibold text-gray-800">
            No products found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            There are currently no products available.
          </p>

        </div>

      </div>
    );
  }

  /* =========================================================
     PRODUCT GRID
  ========================================================= */

  return (
    <div className="w-[90%] mx-auto py-10 md:py-16">

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">

        {ProductData.map((product) => {

          /* =================================================
             PRODUCT ID
          ================================================= */

          const currentProductId = Number(
            product?.productId ?? product?.id
          );

          /* =================================================
             PRICE
          ================================================= */

          const price =
            Number(product?.price) || 0;

          const oldPrice =
            Number(product?.oldPrice) || 0;

          /* =================================================
             STOCK
          ================================================= */

          const stock =
            Number(product?.stock) || 0;

          /* =================================================
             VARIANT CHECK
          ================================================= */

          const hasVariants =
            Array.isArray(product?.variants) &&
            product.variants.length > 0;

          /* =================================================
             DISCOUNT
          ================================================= */

          const discount =
            Number(product?.discount) || 0;

          /* =================================================
             IMAGE
          ================================================= */

          const productImage =
            product?.image ||
            product?.images?.[0] ||
            "";

          return (
            <div
              key={
                Number.isFinite(currentProductId)
                  ? currentProductId
                  : product?._id
              }
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative"
            >

              {/* =================================================
                  PRODUCT IMAGE
              ================================================= */}

              <div className="relative overflow-hidden bg-gray-100">

                <Link
                  to={`/ProductDetails/${currentProductId}`}
                >

                  {productImage ? (
                    <img
                      src={productImage}
                      alt={product?.name || "Product"}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-56 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                </Link>

                {/* IMAGE OVERLAY */}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 pointer-events-none" />

                {/* =================================================
                    NEW BADGE
                ================================================= */}

                {product?.isNew && (
                  <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                    New
                  </span>
                )}

                {/* =================================================
                    DISCOUNT BADGE
                ================================================= */}

                {discount > 0 && (
                  <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                    -{discount}%
                  </span>
                )}

                {/* =================================================
                    WISHLIST
                ================================================= */}

                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  className="absolute bottom-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer shadow-md"
                  aria-label="Add to wishlist"
                >
                  ♡
                </button>

              </div>

              {/* =================================================
                  PRODUCT CONTENT
              ================================================= */}

              <div className="p-5">

                {/* CATEGORY */}

                <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-2">
                  {product?.category || "Product"}
                </p>

                {/* PRODUCT NAME */}

                <Link
                  to={`/ProductDetails/${currentProductId}`}
                >

                  <h2 className="font-bold text-gray-800 text-lg line-clamp-1 group-hover:text-amber-600 transition-colors duration-300">
                    {product?.name || "Product"}
                  </h2>

                </Link>

                {/* =================================================
                    SHORT DESCRIPTION
                ================================================= */}

                {(product?.details?.shortDescription ||
                  product?.description) && (

                  <p className="mt-2 text-xs leading-5 text-gray-400 line-clamp-2">
                    {product?.details?.shortDescription ||
                      product?.description}
                  </p>

                )}

                {/* =================================================
                    RATING
                ================================================= */}

                <div className="flex items-center gap-1 mt-3">

                  <div className="flex text-amber-400 text-sm">
                    ★★★★★
                  </div>

                  <span className="text-xs text-gray-400">
                    (
                    {Number(
                      product?.rating
                    ) || 0}
                    )
                  </span>

                  {Number(product?.reviews) > 0 && (
                    <span className="text-xs text-gray-300">
                      {product.reviews} reviews
                    </span>
                  )}

                </div>

                {/* =================================================
                    PRICE + CART
                ================================================= */}

                <div className="flex justify-between items-end gap-3 mt-5">

                  {/* PRICE */}

                  <div className="min-w-0">

                    <p className="text-2xl font-bold text-gray-900">
                      ৳{price.toLocaleString()}
                    </p>

                    {oldPrice > price && (
                      <p className="text-sm text-gray-400 line-through">
                        ৳{oldPrice.toLocaleString()}
                      </p>
                    )}

                  </div>

                  {/* =================================================
                      ADD TO CART / SELECT VARIANT
                  ================================================= */}

                  {hasVariants ? (

                    <Link
                      to={`/ProductDetails/${currentProductId}`}
                      className="shrink-0 bg-black hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-lg"
                    >
                      Select
                    </Link>

                  ) : (

                    <button
                      type="button"
                      onClick={() =>
                        handleAddToCart(product)
                      }
                      disabled={stock <= 0}
                      className="shrink-0 bg-black hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm cursor-pointer transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {stock > 0
                        ? "Add To Cart"
                        : "Out of Stock"}
                    </button>

                  )}

                </div>

                {/* =================================================
                    VARIANT INFO
                ================================================= */}

                {hasVariants && (
                  <p className="mt-3 text-[11px] text-gray-400">
                    Multiple colors/sizes available
                  </p>
                )}

                {/* =================================================
                    STOCK INFO
                ================================================= */}

                {!hasVariants && stock > 0 && (
                  <p className="mt-3 text-[11px] text-gray-400">
                    {stock} available
                  </p>
                )}

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
};

export default ProductUi;