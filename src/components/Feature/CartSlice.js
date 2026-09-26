import { createSlice } from "@reduxjs/toolkit";

/* =========================================================
   HELPERS
========================================================= */

const cleanString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const normalizeProductId = (item) => {
  const value =
    item?.productId ??
    item?.id ??
    null;

  const numberValue = Number(value);

  return Number.isFinite(numberValue) &&
    numberValue > 0
    ? numberValue
    : null;
};

const normalizeVariantId = (item) => {
  const value =
    item?.variantId ??
    item?.selectedVariant?.variantId ??
    item?.variant?.variantId ??
    "";

  return cleanString(value);
};

const normalizeSize = (item) => {
  return cleanString(
    item?.selectedSize ??
      item?.size ??
      ""
  );
};

/* =========================================================
   CART KEY

   Same product + same variant + same size
   = same cart item

   Example:

   2 | black | M

   2 | white | M

   2 | black | L

   These will remain separate.
========================================================= */

const getCartKey = (item) => {
  const productId =
    normalizeProductId(item);

  const variantId =
    normalizeVariantId(item)
      .toLowerCase();

  const size =
    normalizeSize(item)
      .toLowerCase();

  return `${productId}|${variantId}|${size}`;
};

/* =========================================================
   NORMALIZE CART ITEM
========================================================= */

const normalizeCartItem = (
  item,
  quantity = 1
) => {
  const productId =
    normalizeProductId(item);

  if (!productId) {
    console.error(
      "Invalid productId:",
      item
    );

    return null;
  }

  const variantId =
    normalizeVariantId(item);

  const selectedColor =
    cleanString(
      item?.selectedColor ??
        item?.color ??
        item?.selectedVariant?.color ??
        item?.variant?.color ??
        ""
    );

  const selectedColorCode =
    cleanString(
      item?.selectedColorCode ??
        item?.colorCode ??
        item?.selectedVariant?.colorCode ??
        item?.variant?.colorCode ??
        ""
    );

  const selectedSize =
    normalizeSize(item);

  const price =
    Number(
      item?.price ??
        item?.unitPrice ??
        0
    );

  const safePrice =
    Number.isFinite(price) &&
    price >= 0
      ? price
      : 0;

  const safeQuantity =
    Math.max(
      1,
      Math.floor(
        Number(quantity) || 1
      )
    );

  const productImage =
    item?.productImage ||
    item?.image ||
    item?.selectedVariant?.images?.[0] ||
    item?.variant?.images?.[0] ||
    item?.images?.[0] ||
    "";

  const cartItem = {
    productId,

    productName:
      item?.productName ||
      item?.name ||
      item?.title ||
      "Product",

    productImage,

    variantId,

    selectedColor,

    selectedColorCode,

    selectedSize,

    price: safePrice,

    oldPrice:
      Number(item?.oldPrice) || 0,

    brand:
      item?.brand || "",

    category:
      item?.category || "",

    stock:
      Number(item?.stock) || 0,

    quantity: safeQuantity,
  };

  return {
    ...cartItem,

    subtotal:
      safePrice *
      safeQuantity,

    cartKey:
      getCartKey(cartItem),
  };
};

/* =========================================================
   FIND CART ITEM

   Important:

   Don't use only productId.

   productId + variantId + size
   must identify the cart item.
========================================================= */

const findCartItemIndex = (
  state,
  payload
) => {
  if (!Array.isArray(state.items)) {
    state.items = [];
  }

  if (!payload) {
    return -1;
  }

  /* ---------------------------------------------
     OBJECT PAYLOAD
  --------------------------------------------- */

  if (
    typeof payload === "object"
  ) {
    const key =
      getCartKey(payload);

    const exactIndex =
      state.items.findIndex(
        (item) =>
          item.cartKey === key
      );

    if (exactIndex !== -1) {
      return exactIndex;
    }

    /* -------------------------------------------
       FALLBACK MATCH
    ------------------------------------------- */

    const productId =
      normalizeProductId(payload);

    const variantId =
      normalizeVariantId(payload)
        .toLowerCase();

    const size =
      normalizeSize(payload)
        .toLowerCase();

    return state.items.findIndex(
      (item) => {
        return (
          normalizeProductId(item) ===
            productId &&
          normalizeVariantId(item)
            .toLowerCase() ===
            variantId &&
          normalizeSize(item)
            .toLowerCase() ===
            size
        );
      }
    );
  }

  /* ---------------------------------------------
     OLD PRODUCT ID PAYLOAD SUPPORT
  --------------------------------------------- */

  const productId =
    Number(payload);

  if (
    !Number.isFinite(productId)
  ) {
    return -1;
  }

  return state.items.findIndex(
    (item) =>
      normalizeProductId(item) ===
      productId
  );
};

/* =========================================================
   RECALCULATE CART
========================================================= */

const recalculateCart = (
  state
) => {
  if (!Array.isArray(state.items)) {
    state.items = [];
  }
  state.totalQuantity =
    state.items.reduce(
      (sum, item) =>
        sum +
        Number(
          item.quantity || 0
        ),
      0
    );

  state.totalPrice =
    state.items.reduce(
      (sum, item) =>
        sum +
        Number(
          item.price || 0
        ) *
          Number(
            item.quantity || 0
          ),
      0
    );

  state.items.forEach(
    (item) => {
      item.subtotal =
        Number(
          item.price || 0
        ) *
        Number(
          item.quantity || 0
        );

      if (!item.cartKey) {
        item.cartKey =
          getCartKey(item);
      }
    }
  );
};

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
};

/* =========================================================
   CART SLICE
========================================================= */

const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {

    /* =============================================
       ADD TO CART
    ============================================= */

    addToCart: (
      state,
      action
    ) => {
      const incoming =
        action.payload;

      const normalized =
        normalizeCartItem(
          incoming,
          1
        );

      if (!normalized) {
        return;
      }

      const index =
        findCartItemIndex(
          state,
          normalized
        );

      /* -------------------------------------------
         EXISTING ITEM
      ------------------------------------------- */

      if (index !== -1) {
        state.items[index]
          .quantity += 1;

        state.items[index]
          .subtotal =
          Number(
            state.items[index]
              .price || 0
          ) *
          Number(
            state.items[index]
              .quantity || 0
          );
      }

      /* -------------------------------------------
         NEW ITEM
      ------------------------------------------- */

      else {
        state.items.push(
          normalized
        );
      }

      recalculateCart(state);
    },

    /* =============================================
       INCREASE QUANTITY
    ============================================= */

    increaseQuantity: (
      state,
      action
    ) => {
      const index =
        findCartItemIndex(
          state,
          action.payload
        );

      if (index === -1) {
        return;
      }

      state.items[index]
        .quantity += 1;

      recalculateCart(state);
    },

    /* =============================================
       DECREASE QUANTITY
    ============================================= */

    decreaseQuantity: (
      state,
      action
    ) => {
      const index =
        findCartItemIndex(
          state,
          action.payload
        );

      if (index === -1) {
        return;
      }

      if (
        state.items[index]
          .quantity > 1
      ) {
        state.items[index]
          .quantity -= 1;
      } else {
        state.items.splice(
          index,
          1
        );
      }

      recalculateCart(state);
    },

    /* =============================================
       REMOVE FROM CART

       This is the export your CartPage needs.
    ============================================= */

    removeFromCart: (
      state,
      action
    ) => {
      const index =
        findCartItemIndex(
          state,
          action.payload
        );

      if (index === -1) {
        return;
      }

      state.items.splice(
        index,
        1
      );

      recalculateCart(state);
    },

    /* =============================================
       CLEAR CART
    ============================================= */

    clearCart: (
      state
    ) => {
      state.items = [];

      state.totalQuantity = 0;

      state.totalPrice = 0;
    },
  },
});

/* =========================================================
   EXPORT ACTIONS
========================================================= */

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

/* =========================================================
   EXPORT REDUCER
========================================================= */

export default cartSlice.reducer;