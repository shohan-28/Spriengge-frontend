import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

/*
|--------------------------------------------------------------------------
| API URL
|--------------------------------------------------------------------------
*/

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

const toSafeNumber = (value, fallback = 0) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : fallback;
};

const toSafeInteger = (value, fallback = 0) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? Math.max(0, Math.floor(numberValue))
    : fallback;
};

const cleanString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

/*
|--------------------------------------------------------------------------
| Normalize Size
|--------------------------------------------------------------------------
*/

const normalizeSize = (size) => {
  if (!size || typeof size !== "object") {
    return null;
  }

  const sizeName = cleanString(size.size);

  if (!sizeName) {
    return null;
  }

  return {
    size: sizeName,
    stock: toSafeInteger(size.stock),
  };
};

/*
|--------------------------------------------------------------------------
| Normalize Variant
|--------------------------------------------------------------------------
| Backend canonical variant identity:
|
| variantId
|
| Do not use:
| - variant.id
| - variant.productId
| - variant._id
|--------------------------------------------------------------------------
*/

const normalizeVariant = (variant) => {
  if (!variant || typeof variant !== "object") {
    return null;
  }

  const variantId = cleanString(
    variant.variantId
  );

  /*
  |--------------------------------------------------------------------------
  | Invalid variant বাদ
  |--------------------------------------------------------------------------
  */

  if (!variantId) {
    return null;
  }

  const sizes = Array.isArray(variant.sizes)
    ? variant.sizes
        .map(normalizeSize)
        .filter(Boolean)
    : [];

  return {
    variantId,

    color: cleanString(variant.color),

    colorCode: cleanString(
      variant.colorCode
    ),

    price: Math.max(
      0,
      toSafeNumber(variant.price)
    ),

    oldPrice: Math.max(
      0,
      toSafeNumber(variant.oldPrice)
    ),

    stock: toSafeInteger(variant.stock),

    images: Array.isArray(variant.images)
      ? variant.images
          .filter(Boolean)
          .map(String)
      : [],

    sizes,
  };
};

/*
|--------------------------------------------------------------------------
| Normalize Details
|--------------------------------------------------------------------------
*/

const normalizeDetails = (details) => {
  if (!details || typeof details !== "object") {
    return {
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
    };
  }

  const specifications =
    details.specifications &&
    typeof details.specifications === "object"
      ? details.specifications
      : {};

  return {
    shortDescription: cleanString(
      details.shortDescription
    ),

    overview: cleanString(
      details.overview
    ),

    features: Array.isArray(details.features)
      ? details.features
          .filter(Boolean)
          .map(String)
      : [],

    specifications,

    howToUse: Array.isArray(details.howToUse)
      ? details.howToUse
          .filter(Boolean)
          .map(String)
      : [],

    careInstructions: Array.isArray(
      details.careInstructions
    )
      ? details.careInstructions
          .filter(Boolean)
          .map(String)
      : [],

    whatsIncluded: Array.isArray(
      details.whatsIncluded
    )
      ? details.whatsIncluded
          .filter(Boolean)
          .map(String)
      : [],

    /*
    |--------------------------------------------------------------------------
    | Backend schema:
    | deliveryInfo = String
    |--------------------------------------------------------------------------
    */

    deliveryInfo:
      typeof details.deliveryInfo === "string"
        ? details.deliveryInfo.trim()
        : "",

    returnPolicy: cleanString(
      details.returnPolicy
    ),

    warranty: cleanString(
      details.warranty
    ),
  };
};

/*
|--------------------------------------------------------------------------
| Normalize Product
|--------------------------------------------------------------------------
*/

const normalizeProduct = (product) => {
  if (!product || typeof product !== "object") {
    return null;
  }

  const rawProductId =
    product.productId ??
    product.id ??
    null;

  const numericProductId = Number(
    rawProductId
  );

  const validProductId =
    Number.isInteger(numericProductId) &&
    numericProductId > 0
      ? numericProductId
      : null;

  const variants = Array.isArray(
    product.variants
  )
    ? product.variants
        .map(normalizeVariant)
        .filter(Boolean)
    : [];

  return {
    /*
    |--------------------------------------------------------------------------
    | Original backend fields
    |--------------------------------------------------------------------------
    */

    ...product,

    /*
    |--------------------------------------------------------------------------
    | Canonical Product ID
    |--------------------------------------------------------------------------
    */

    productId: validProductId,

    /*
    |--------------------------------------------------------------------------
    | Backward compatibility for old UI
    |--------------------------------------------------------------------------
    */

    id: validProductId,

    /*
    |--------------------------------------------------------------------------
    | MongoDB ID
    |--------------------------------------------------------------------------
    */

    _id: product._id || null,

    /*
    |--------------------------------------------------------------------------
    | Basic Information
    |--------------------------------------------------------------------------
    */

    name: cleanString(product.name),

    brand: cleanString(product.brand),

    category: cleanString(product.category),

    price: Math.max(
      0,
      toSafeNumber(product.price)
    ),

    oldPrice: Math.max(
      0,
      toSafeNumber(product.oldPrice)
    ),

    discount: Math.min(
      100,
      Math.max(
        0,
        toSafeNumber(product.discount)
      )
    ),

    stock: toSafeInteger(product.stock),

    rating: Math.min(
      5,
      Math.max(
        0,
        toSafeNumber(product.rating)
      )
    ),

    reviews: toSafeInteger(
      product.reviews
    ),

    isNew: Boolean(product.isNew),

    isFeatured: Boolean(
      product.isFeatured
    ),

    image: cleanString(product.image),

    images: Array.isArray(product.images)
      ? product.images
          .filter(Boolean)
          .map(String)
      : [],

    description: cleanString(
      product.description
    ),

    tags: Array.isArray(product.tags)
      ? product.tags
          .filter(Boolean)
          .map(String)
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

    details: normalizeDetails(
      product.details
    ),

    /*
    |--------------------------------------------------------------------------
    | Admin Fields
    |--------------------------------------------------------------------------
    */

    sku: cleanString(product.sku),

    barcode: cleanString(
      product.barcode
    ),

    costPrice: Math.max(
      0,
      toSafeNumber(product.costPrice)
    ),

    supplier: cleanString(
      product.supplier
    ),

    tenantId: cleanString(
      product.tenantId
    ),
  };
};

/*
|--------------------------------------------------------------------------
| Generic API Request
|--------------------------------------------------------------------------
*/

const request = async (
  endpoint,
  options = {}
) => {
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
| Fetch All Products
|--------------------------------------------------------------------------
*/

export const fetchProduct = createAsyncThunk(
  "product/fetchProduct",

  async (_, { rejectWithValue }) => {
    try {
      const data = await request(
        "/products"
      );

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
| Initial State
|--------------------------------------------------------------------------
*/

const initialState = {
  product: [],
  loading: false,
  error: null,
};

/*
|--------------------------------------------------------------------------
| Product Slice
|--------------------------------------------------------------------------
*/

const ProductSlice = createSlice({
  name: "product",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(
        fetchProduct.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

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