import { createSlice } from "@reduxjs/toolkit";

/*
|--------------------------------------------------------------------------
| Cart Item Identity
|--------------------------------------------------------------------------
| Same product + different variant + different size
| must be treated as different cart items.
|
| Example:
| productId 1 + black + M
| productId 1 + white + M
| productId 1 + black + L
|
| এগুলো ৩টা আলাদা cart item.
|--------------------------------------------------------------------------
*/

const getProductId = (item) => {
  return item?.productId ?? item?.id ?? "";
};

const getVariantId = (item) => {
  return item?.variantId ?? "";
};

const getSelectedSize = (item) => {
  return item?.selectedSize ?? item?.size ?? "";
};

const getCartKey = (item) => {
  const productId = String(getProductId(item));
  const variantId = String(getVariantId(item));
  const size = String(getSelectedSize(item));

  return `${productId}__${variantId}__${size}`;
};

const normalizeCartItem = (item) => {
  const productId = getProductId(item);

  return {
    ...item,

    // Canonical product identity
    productId:
      productId !== "" && productId !== null
        ? Number(productId)
        : productId,

    // Keep id only for backward UI compatibility
    id:
      productId !== "" && productId !== null
        ? Number(productId)
        : item?.id,

    // Canonical variant identity
    variantId: getVariantId(item) || "",

    // Canonical size
    selectedSize: getSelectedSize(item) || "",

    // Canonical color
    selectedColor:
      item?.selectedColor ??
      item?.color ??
      "",

    selectedColorCode:
      item?.selectedColorCode ??
      item?.colorCode ??
      "",

    quantity: Math.max(1, Number(item?.quantity || 1)),
  };
};

const CartSlice = createSlice({
  name: "cart",

  initialState: {
    cart: [],
  },

  reducers: {
    /*
    |--------------------------------------------------------------------------
    | ADD TO CART
    |--------------------------------------------------------------------------
    */

    addToCart: (state, action) => {
      const incomingProduct = normalizeCartItem(action.payload);

      const incomingKey = getCartKey(incomingProduct);

      const existingProduct = state.cart.find(
        (item) => getCartKey(item) === incomingKey
      );

      if (existingProduct) {
        existingProduct.quantity =
          Number(existingProduct.quantity || 1) + 1;
      } else {
        state.cart.push({
          ...incomingProduct,
          quantity: 1,
        });
      }
    },

    /*
    |--------------------------------------------------------------------------
    | INCREASE QUANTITY
    |--------------------------------------------------------------------------
    */

    increaseQuantity: (state, action) => {
      const payload = action.payload;

      const targetKey =
        typeof payload === "object"
          ? getCartKey(payload)
          : String(payload);

      const product = state.cart.find((item) => {
        if (typeof payload === "object") {
          return getCartKey(item) === targetKey;
        }

        return (
          String(item.productId ?? item.id) ===
          String(targetKey)
        );
      });

      if (product) {
        product.quantity = Number(product.quantity || 1) + 1;
      }
    },

    /*
    |--------------------------------------------------------------------------
    | DECREASE QUANTITY
    |--------------------------------------------------------------------------
    */

    decreaseQuantity: (state, action) => {
      const payload = action.payload;

      const targetKey =
        typeof payload === "object"
          ? getCartKey(payload)
          : String(payload);

      const product = state.cart.find((item) => {
        if (typeof payload === "object") {
          return getCartKey(item) === targetKey;
        }

        return (
          String(item.productId ?? item.id) ===
          String(targetKey)
        );
      });

      if (product && Number(product.quantity) > 1) {
        product.quantity = Number(product.quantity) - 1;
      }
    },

    /*
    |--------------------------------------------------------------------------
    | REMOVE CART ITEM
    |--------------------------------------------------------------------------
    */

    removeCart: (state, action) => {
      const payload = action.payload;

      if (typeof payload === "object") {
        const targetKey = getCartKey(payload);

        state.cart = state.cart.filter(
          (item) => getCartKey(item) !== targetKey
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Backward compatibility
      |--------------------------------------------------------------------------
      | If old UI sends only productId,
      | remove all matching variants of that product.
      |--------------------------------------------------------------------------
      */

      state.cart = state.cart.filter(
        (item) =>
          String(item.productId ?? item.id) !==
          String(payload)
      );
    },

    /*
    |--------------------------------------------------------------------------
    | CLEAR CART
    |--------------------------------------------------------------------------
    */

    clearCart: (state) => {
      state.cart = [];
    },
  },
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeCart,
  clearCart,
} = CartSlice.actions;

export default CartSlice.reducer;