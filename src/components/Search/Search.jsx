import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

const Search = () => {
  const [searchValue, setSearchValue] = useState("");

  const ProductData = useSelector(
    (state) => state.product.product
  );

  const filteredProducts =
    searchValue.trim() === ""
      ? []
      : ProductData.filter((product) =>
          product.name
            .toLowerCase()
            .includes(searchValue.toLowerCase())
        );

  return (
    <div className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="flex items-center bg-white border border-gray-200 rounded-full px-2  py-2 shadow-sm">
        <FiSearch className="text-gray-500 text-xl lg:text-3xl" />

        <input
          type="text"
          placeholder="Search products..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full px-2 lg:px-15 outline-none bg-transparent text-gray-700"
        />
      </div>

      {/* Search Suggestions */}
      {searchValue.trim() !== "" && (
        <div className="absolute top-14 left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-120">
          {filteredProducts.length > 0 ? (
            filteredProducts.slice(0, 5).map((product) => (
              <Link
                key={product.id}
                to={`/ProductDetails/${product.id}`}
                onClick={() => setSearchValue("")}
                className="flex items-center gap-3 p-3 hover:bg-yellow-50 transition"
              >
                {/* Product Image */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 object-contain rounded-lg bg-gray-50"
                />

                {/* Product Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    {product.name}
                  </h3>

                  <p className="text-sm font-medium text-yellow-600">
                    ${product.price}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="p-4 text-center text-gray-500">
              No products found
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;