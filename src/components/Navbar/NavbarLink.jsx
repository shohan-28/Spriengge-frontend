import React from "react";
import { NavLink } from "react-router-dom";

const NavbarLink = () => {
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/Products" },
    { name: "About", path: "/About" },
    { name: "Services", path: "/Services" },
    { name: "Contact", path: "/Contact" },
  ];

  return (
    <div className="w-[94%] sm:w-[90%] lg:w-[95%] max-w- mx-auto py-2">
      <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-4 lg:gap-8 bg-gray-200/70 shadow-md p-1.5 rounded-full font-bold w-full">

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-2.5 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-full
              text-[11px] sm:text-sm md:text-base
              font-semibold whitespace-nowrap
              transition-all duration-300
              ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}

      </div>
    </div>
  );
};

export default NavbarLink;