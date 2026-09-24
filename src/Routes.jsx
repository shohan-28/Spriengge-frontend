import { createBrowserRouter } from "react-router-dom";

import Root from "./Root";
import App from "./App";
import ProductDetails from "./components/ProductDetails/ProductDetails";
import About from "./components/About/About";
import Contact from "./components/Contact/Contact";
import Services from "./components/Services/Services";
import CartPage from "./components/CartPage/CartPage";
import Checkout from "./components/CheckOut/CheckOut";
import SideCart from "./components/SideCart/SideCart";
import MakeupOne from "./components/LandingPage/MakeupOne";
import Products from "./components/Products/Products";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,

    children: [
      {
        index: true,
        element: <App />,
      },

      {
        path: "/ProductDetails/:productId",
        element: <ProductDetails />,
      },

      {
        path: "/About",
        element: <About />,
      },

      {
        path: "/Products",
        element: <Products />,
      },

      {
        path: "/Contact",
        element: <Contact />,
      },

      {
        path: "/Services",
        element: <Services />,
      },

      {
        path: "/CartPage",
        element: <CartPage />,
      },

      {
        path: "/Checkout",
        element: <Checkout />,
      },

      {
        path: "/SideCart",
        element: <SideCart />,
      },

      {
        path: "/MakeupOne/:id",
        element: <MakeupOne />,
      },
    ],
  },
]);

export default router;