import React from 'react';
import { LuShoppingCart } from 'react-icons/lu';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const SideCart = () => {

   
  
  const cartItems = useSelector(
    (state) => state.cart?.items || []
);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

    return (

            <div className=''>
                <Link to="/CartPage">
                   <button
                            
                            className="relative flex flex-col items-center justify-center bg-amber-200 rounded-l-2xl text-xl md:text-2xl lg:text-4xl p-2 cursor-pointer">
                              <LuShoppingCart />
                
                              {/* Cart Quantity */}
                              <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex justify-center items-center text-[15px] font-bold">
                                {cartCount}
                              </span>
                              <p className="text-[6px] lg:text-[10px] mt-1 font-bold">View Your Cart</p>
                </button>
                </Link>

            </div>

    );
};

export default SideCart;

