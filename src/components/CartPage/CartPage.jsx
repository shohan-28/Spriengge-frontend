import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} from "../Feature/CartSlice";
import { useNavigate } from "react-router-dom";

import {
  FiMinus,
  FiPlus,
  FiTrash2,
  FiShoppingBag,
  FiArrowRight,
  FiShield,
  FiTruck,
  FiPackage,
} from "react-icons/fi";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* =========================================================
     CART STATE
  ========================================================= */

  const cartItems = useSelector(
    (state) => state.cart?.items || []
  );

  /* =========================================================
     TOTAL ITEMS
  ========================================================= */

  const totalItems = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const quantity = Math.max(
        1,
        Number(item?.quantity) || 1
      );

      return total + quantity;
    }, 0);
  }, [cartItems]);

  /* =========================================================
     SUBTOTAL
  ========================================================= */

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(item?.price) || 0;

      const quantity = Math.max(
        1,
        Number(item?.quantity) || 1
      );

      return total + price * quantity;
    }, 0);
  }, [cartItems]);

  /* =========================================================
     CHECKOUT
  ========================================================= */

  const handleCheckout = () => {
    if (!cartItems.length) return;

    navigate("/Checkout", {
      state: {
        cartItems,
      },
    });
  };

  /* =========================================================
     CONTINUE SHOPPING
  ========================================================= */

  const handleContinueShopping = () => {
    navigate("/");
  };

  /* =========================================================
     EMPTY CART
  ========================================================= */

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[75vh] bg-[#fafafa] flex items-center justify-center px-5">
        <div className="w-full max-w-md text-center">

          {/* ICON */}

          <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-[28px] border border-gray-200 bg-white shadow-sm">
            <FiShoppingBag
              size={28}
              className="text-gray-400"
            />
          </div>

          {/* TITLE */}

          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Your cart is empty
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
            You haven't added any products to
            your shopping bag yet.
          </p>

          {/* BUTTON */}

          <button
            type="button"
            onClick={handleContinueShopping}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-black active:scale-[0.98]"
          >
            Continue Shopping

            <FiArrowRight size={16} />
          </button>

        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">

      <div className="mx-auto w-[92%] max-w-7xl py-8 sm:py-12">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="mb-8 sm:mb-10">

          <div className="flex items-end justify-between gap-5">

            {/* TITLE */}

            <div>

              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-400">
                Shopping Bag
              </p>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                My Cart
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Review your selected products before
                checkout.
              </p>

            </div>

            {/* COUNT */}

            <div className="hidden items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 sm:flex">

              <FiShoppingBag size={14} />

              {totalItems}{" "}
              {totalItems === 1
                ? "item"
                : "items"}

            </div>

          </div>

        </div>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_390px]">

          {/* =================================================
              CART ITEMS
          ================================================= */}

          <div className="space-y-4">

            {cartItems.map((item, index) => {

              const quantity = Math.max(
                1,
                Number(item?.quantity) || 1
              );

              const price =
                Number(item?.price) || 0;

              const itemSubtotal =
                price * quantity;

              /* ---------------------------------------------
                 PRODUCT DATA
              --------------------------------------------- */

              const productId =
                item?.productId ??
                item?.id ??
                "";

              const productName =
                item?.productName ||
                item?.name ||
                item?.title ||
                "Product";

              const productImage =
                item?.productImage ||
                item?.image ||
                "";

              /* ---------------------------------------------
                 CART KEY
                 Important for variant + size
              --------------------------------------------- */

              const cartKey =
                item?.cartKey ||
                `${productId}|${item?.variantId || ""}|${
                  item?.selectedSize || ""
                }`;

              return (
                <div
                  key={`${cartKey}-${index}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-gray-300 sm:p-5"
                >

                  <div className="flex gap-4 sm:gap-5">

                    {/* =====================================
                        IMAGE
                    ===================================== */}

                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[#f6f6f6] sm:h-32 sm:w-32">

                      {productImage ? (

                        <img
                          src={productImage}
                          alt={productName}
                          className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                        />

                      ) : (

                        <div className="flex h-full w-full items-center justify-center">

                          <FiShoppingBag
                            size={24}
                            className="text-gray-300"
                          />

                        </div>

                      )}

                    </div>

                    {/* =====================================
                        INFORMATION
                    ===================================== */}

                    <div className="min-w-0 flex-1">

                      {/* NAME + REMOVE */}

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h2 className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900 sm:text-base">
                            {productName}
                          </h2>

                          {item?.brand && (
                            <p className="mt-1 text-xs text-gray-400">
                              {item.brand}
                            </p>
                          )}

                          {item?.category && (
                            <p className="mt-0.5 text-xs text-gray-400">
                              {item.category}
                            </p>
                          )}

                        </div>

                        {/* REMOVE */}

                        <button
                          type="button"
                          onClick={() =>
                            dispatch(
                              removeFromCart(item)
                            )
                          }
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                          aria-label={`Remove ${productName}`}
                        >
                          <FiTrash2 size={16} />
                        </button>

                      </div>

                      {/* =====================================
                          VARIANT INFORMATION
                      ===================================== */}

                      {(item?.selectedColor ||
                        item?.selectedSize ||
                        item?.variantId) && (

                        <div className="mt-3 flex flex-wrap gap-2">

                          {/* COLOR */}

                          {item?.selectedColor && (

                            <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5">

                              {item?.selectedColorCode && (

                                <span
                                  className="h-3.5 w-3.5 rounded-full border border-gray-300"
                                  style={{
                                    backgroundColor:
                                      item.selectedColorCode,
                                  }}
                                />

                              )}

                              <span className="text-[11px] font-medium text-gray-600">
                                {item.selectedColor}
                              </span>

                            </div>

                          )}

                          {/* SIZE */}

                          {item?.selectedSize && (

                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5">

                              <span className="text-[11px] font-medium text-gray-600">
                                Size:{" "}
                                {item.selectedSize}
                              </span>

                            </div>

                          )}

                        </div>
                      )}

                      {/* =====================================
                          PRICE
                      ===================================== */}

                      <div className="mt-3 flex items-center gap-3">

                        <span className="text-base font-bold text-gray-900">
                          ৳
                          {price.toLocaleString()}
                        </span>

                        {item?.oldPrice &&
                          Number(item.oldPrice) >
                            price && (

                            <span className="text-xs text-gray-400 line-through">
                              ৳
                              {Number(
                                item.oldPrice
                              ).toLocaleString()}
                            </span>

                          )}

                      </div>

                      {/* =====================================
                          BOTTOM
                      ===================================== */}

                      <div className="mt-4 flex items-center justify-between">

                        {/* QUANTITY */}

                        <div className="flex items-center rounded-xl border border-gray-200 bg-white">

                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                decreaseQuantity(item)
                              )
                            }
                            disabled={quantity <= 1}
                            className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label="Decrease quantity"
                          >
                            <FiMinus size={14} />
                          </button>

                          <span className="min-w-[30px] text-center text-sm font-semibold">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                increaseQuantity(item)
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                            aria-label="Increase quantity"
                          >
                            <FiPlus size={14} />
                          </button>

                        </div>

                        {/* SUBTOTAL */}

                        <div className="text-right">

                          <p className="text-[9px] font-medium uppercase tracking-wider text-gray-400">
                            Subtotal
                          </p>

                          <p className="mt-0.5 text-sm font-bold text-gray-900">
                            ৳
                            {itemSubtotal.toLocaleString()}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

            {/* =================================================
                CONTINUE SHOPPING
            ================================================= */}

            <button
              type="button"
              onClick={handleContinueShopping}
              className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
            >
              <span className="text-lg">
                ←
              </span>

              Continue Shopping
            </button>

          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div>

            <div className="sticky top-6 overflow-hidden rounded-3xl bg-[#171717] text-white shadow-xl">

              {/* =============================================
                  SUMMARY HEADER
              ============================================= */}

              <div className="border-b border-white/10 px-6 py-6">

                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/35">
                  Summary
                </p>

                <div className="mt-1 flex items-end justify-between">

                  <h2 className="text-xl font-semibold">
                    Order Summary
                  </h2>

                  <span className="text-xs text-white/40">
                    {totalItems}{" "}
                    {totalItems === 1
                      ? "item"
                      : "items"}
                  </span>

                </div>

              </div>

              {/* =============================================
                  PRICE
              ============================================= */}

              <div className="px-6 py-6">

                <div className="space-y-4">

                  {/* SUBTOTAL */}

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-white/50">
                      Subtotal
                    </span>

                    <span className="text-sm font-medium">
                      ৳
                      {subtotal.toLocaleString()}
                    </span>

                  </div>

                  {/* DELIVERY */}

                  <div className="flex items-center justify-between gap-5">

                    <span className="text-sm text-white/50">
                      Delivery
                    </span>

                    <span className="text-right text-xs text-white/35">
                      Calculated at checkout
                    </span>

                  </div>

                </div>

                {/* TOTAL */}

                <div className="mt-6 border-t border-white/10 pt-5">

                  <div className="flex items-end justify-between">

                    <div>

                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                        Estimated Total
                      </p>

                      <p className="mt-1 text-3xl font-bold tracking-tight">
                        ৳
                        {subtotal.toLocaleString()}
                      </p>

                    </div>

                    <span className="mb-1 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-white/60">
                      COD
                    </span>

                  </div>

                </div>

                {/* CHECKOUT BUTTON */}

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 text-sm font-bold text-gray-900 transition-all duration-200 hover:bg-gray-100 active:scale-[0.98]"
                >
                  Go to Checkout

                  <FiArrowRight size={17} />
                </button>

                {/* SECURE */}

                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-white/30">

                  <FiShield size={13} />

                  Secure checkout

                </div>

              </div>

              {/* =============================================
                  BENEFITS
              ============================================= */}

              <div className="border-t border-white/10 bg-white/[0.03] px-6 py-5">

                <div className="space-y-4">

                  {/* DELIVERY */}

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                      <FiTruck size={15} />
                    </div>

                    <div>

                      <p className="text-xs font-medium">
                        Reliable Delivery
                      </p>

                      <p className="mt-0.5 text-[10px] text-white/35">
                        Delivered to your doorstep
                      </p>

                    </div>

                  </div>

                  {/* PACKAGE */}

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                      <FiPackage size={15} />
                    </div>

                    <div>

                      <p className="text-xs font-medium">
                        Carefully Packed
                      </p>

                      <p className="mt-0.5 text-[10px] text-white/35">
                        Your order is handled with care
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default CartPage;