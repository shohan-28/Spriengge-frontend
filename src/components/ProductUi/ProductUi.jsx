
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProduct } from "../Feature/ProductSlice";
import { Link } from "react-router-dom";
import { addToCart } from "../Feature/CartSlice";

const ProductUi = () => {
  const ProductData = useSelector((state) => state.product.product);
  const dispatch = useDispatch();

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(fetchProduct());
  }, [dispatch]);

  const handleOrderNow = (productId) => {
    console.log("Order Now Product ID:", productId);
  };

  return (
    <div className="w-[90%] mx-auto py-10 md:py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.isArray(ProductData) &&
          ProductData.map((product) => {
            // Support current backend productId
            // and old id structure as fallback
            const currentProductId =
              product?.productId ?? product?.id ?? product?._id;

            return (
              <div
                key={currentProductId}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative"
              >
                {/* Product Image */}
                <div className="relative overflow-hidden bg-gray-100">
                  <Link to={`/ProductDetails/${currentProductId}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </Link>

                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 pointer-events-none"></div>

                  {/* New Badge */}
                  {product.isNew && (
                    <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                      New
                    </span>
                  )}

                  {/* Discount Badge */}
                  {product.discount && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                      -{product.discount}%
                    </span>
                  )}

                  {/* Wishlist Button */}
                  <button className="absolute bottom-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer shadow-md">
                    ♡
                  </button>
                </div>

                {/* Product Content */}
                <div className="p-5">
                  {/* Category */}
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-2">
                    {product.category}
                  </p>

                  {/* Product Name */}
                  <Link to={`/ProductDetails/${currentProductId}`}>
                    <h2 className="font-bold text-gray-800 text-lg line-clamp-1 group-hover:text-amber-600 transition-colors duration-300">
                      {product.name}
                    </h2>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-2">
                    <div className="flex text-amber-400 text-sm">
                      ★★★★★
                    </div>

                    <span className="text-xs text-gray-400">
                      ({product.rating || 4.8})
                    </span>
                  </div>

                  {/* Price + Order */}
                  <div className="flex justify-between items-center mt-5">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        ${product.price}
                      </p>

                      {product.oldPrice && (
                        <p className="text-sm text-gray-400 line-through">
                          ${product.oldPrice}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        dispatch(
                          addToCart({
                            ...product,

                            // Keep both IDs available
                            productId: currentProductId,
                            id: currentProductId,

                            quantity,
                          })
                        )
                      }
                      disabled={!product.stock}
                      className="bg-black hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm cursor-pointer transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ProductUi;
