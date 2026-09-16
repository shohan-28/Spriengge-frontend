import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  "https://ourbackend.spriengge.shop/api";

const API_URL = RAW_API_URL
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/products$/, "")
  .replace(/\/orders$/, "");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const normalizeSize = (size) => {
  if (!size) return null;

  return {
    size: String(size.size ?? "").trim(),
    stock: Math.max(0, Number(size.stock || 0)),
  };
};

const normalizeVariant = (variant) => {
  if (!variant) return null;

  return {
    /*
    |--------------------------------------------------------------------------
    | IMPORTANT
    |--------------------------------------------------------------------------
    | Backend canonical variant ID = variantId
    |
    | Do NOT convert variantId into id/productId.
    |--------------------------------------------------------------------------
    */

    variantId: String(variant.variantId ?? "").trim(),

    color: variant.color ?? "",

    colorCode: variant.colorCode ?? "",

    price: Number(variant.price ?? 0),

    oldPrice: Number(variant.oldPrice ?? 0),

    stock: Math.max(0, Number(variant.stock || 0)),

    images: Array.isArray(variant.images)
      ? variant.images.filter(Boolean)
      : [],

    sizes: Array.isArray(variant.sizes)
      ? variant.sizes
          .map(normalizeSize)
          .filter((size) => size?.size)
      : [],
  };
};

const normalizeProduct = (product) => {
  if (!product) return null;

  const numericProductId =
    product.productId ??
    product.id ??
    null;

  const variants = Array.isArray(product.variants)
    ? product.variants
        .map(normalizeVariant)
        .filter((variant) => variant?.variantId)
    : [];

  return {
    ...product,

    /*
    |--------------------------------------------------------------------------
    | Canonical Product ID
    |--------------------------------------------------------------------------
    */

    productId:
      numericProductId !== null &&
      numericProductId !== undefined &&
      numericProductId !== ""
        ? Number(numericProductId)
        : null,

    /*
    |--------------------------------------------------------------------------
    | Backward UI compatibility
    |--------------------------------------------------------------------------
    */

    id:
      numericProductId !== null &&
      numericProductId !== undefined &&
      numericProductId !== ""
        ? Number(numericProductId)
        : product.id,

    /*
    |--------------------------------------------------------------------------
    | MongoDB ID
    |--------------------------------------------------------------------------
    */

    _id: product._id || null,

    /*
    |--------------------------------------------------------------------------
    | Basic product fields
    |--------------------------------------------------------------------------
    */

    name: product.name ?? "",

    brand: product.brand ?? "",

    category: product.category ?? "",

    price: Number(product.price ?? 0),

    oldPrice: Number(product.oldPrice ?? 0),

    discount: Number(product.discount ?? 0),

    stock: Math.max(0, Number(product.stock || 0)),

    rating: Number(product.rating ?? 0),

    reviews: Number(product.reviews ?? 0),

    isNew: Boolean(product.isNew),

    isFeatured: Boolean(product.isFeatured),

    image: product.image ?? "",

    images: Array.isArray(product.images)
      ? product.images.filter(Boolean)
      : [],

    description: product.description ?? "",

    tags: Array.isArray(product.tags)
      ? product.tags
      : [],

    /*
    |--------------------------------------------------------------------------
    | Variants
    |--------------------------------------------------------------------------
    */

    variants,

    /*
    |--------------------------------------------------------------------------
    | Details
    |--------------------------------------------------------------------------
    */

    details:
      product.details &&
      typeof product.details === "object"
        ? {
            shortDescription:
              product.details.shortDescription ?? "",

            overview:
              product.details.overview ?? "",

            features: Array.isArray(
              product.details.features
            )
              ? product.details.features
              : [],

            specifications:
              product.details.specifications &&
              typeof product.details.specifications ===
                "object"
                ? product.details.specifications
                : {},

            howToUse: Array.isArray(
              product.details.howToUse
            )
              ? product.details.howToUse
              : [],

            careInstructions: Array.isArray(
              product.details.careInstructions
            )
              ? product.details.careInstructions
              : [],

            whatsIncluded: Array.isArray(
              product.details.whatsIncluded
            )
              ? product.details.whatsIncluded
              : [],

            /*
            |--------------------------------------------------------------------------
            | Backend schema অনুযায়ী deliveryInfo = STRING
            |--------------------------------------------------------------------------
            */

            deliveryInfo:
              typeof product.details.deliveryInfo ===
              "string"
                ? product.details.deliveryInfo
                : "",

            returnPolicy:
              product.details.returnPolicy ?? "",

            warranty:
              product.details.warranty ?? "",
          }
        : {
            shortDescription: "",
            overview: "",
            features: [],
            specifications: {},
            howToUse: [],
            careInstructions: [],
            whatsIncluded: [],
            deliveryInfo: "",
            returnPolicy: "",
            warranty: "",
          },

    /*
    |--------------------------------------------------------------------------
    | Admin fields
    |--------------------------------------------------------------------------
    */

    sku: product.sku ?? "",

    barcode: product.barcode ?? "",

    costPrice: Number(product.costPrice ?? 0),

    supplier: product.supplier ?? "",

    tenantId: product.tenantId ?? "",
  };
};

/*
|--------------------------------------------------------------------------
| Generic API request
|--------------------------------------------------------------------------
*/

const request = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const url = `${API_URL}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,

    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

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
        `API request failed with status ${response.status}`
    );
  }

  return data;
};

/*
|--------------------------------------------------------------------------
| FETCH PRODUCTS
|--------------------------------------------------------------------------
*/

export const fetchProduct = createAsyncThunk(
  "product/fetchProduct",

  async (_, { rejectWithValue }) => {
    try {
      const data = await request("/products");

      const products = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
        ? data.products
        : Array.isArray(data?.data)
        ? data.data
        : [];

      if (!Array.isArray(products)) {
        throw new Error(
          "Invalid product data received from server."
        );
      }

      return products
        .map(normalizeProduct)
        .filter(Boolean);
    } catch (error) {
      return rejectWithValue(
        error?.message ||
          "Failed to load products."
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| INITIAL STATE
|--------------------------------------------------------------------------
*/

const initialState = {
  product: [],
  loading: false,
  error: null,
};

/*
|--------------------------------------------------------------------------
| PRODUCT SLICE
|--------------------------------------------------------------------------
*/

const ProductSlice = createSlice({
  name: "product",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      /*
      |--------------------------------------------------------------------------
      | Pending
      |--------------------------------------------------------------------------
      */

      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      /*
      |--------------------------------------------------------------------------
      | Success
      |--------------------------------------------------------------------------
      */

      .addCase(
        fetchProduct.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.product = Array.isArray(
            action.payload
          )
            ? action.payload
            : [];
        }
      )

      /*
      |--------------------------------------------------------------------------
      | Failed
      |--------------------------------------------------------------------------
      */

      .addCase(
        fetchProduct.rejected,
        (state, action) => {
          state.loading = false;

          state.product = [];

          state.error =
            action.payload ||
            action.error?.message ||
            "Failed to load products.";
        }
      );
  },
});

export default ProductSlice.reducer;