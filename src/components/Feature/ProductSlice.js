import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_URL = "https://ourbackend.spriengge.shop/api";

export const fetchProduct = createAsyncThunk(
  "product/fetchProduct",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to fetch products (${response.status})`
        );
      }

      const products = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
        ? data.products
        : [];

      if (!Array.isArray(products)) {
        throw new Error("Invalid product data received from server.");
      }

      return products;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to load products."
      );
    }
  }
);

const ProductSlice = createSlice({
  name: "product",

  initialState: {
    product: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.product = Array.isArray(action.payload)
          ? action.payload
          : [];
      })

      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.product = [];
        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to load products.";
      });
  },
});

export default ProductSlice.reducer;