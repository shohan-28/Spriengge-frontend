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

import Products from "./components/Products/Products";
import CarouselOne from "./Carousel/CarouselOne";
import FooterTwo from "./components/Footer/FooterTwo";
import NotFound from "./components/ErrorBoundary/NotFound";
import LandingPage from "./components/LandingPage/LandingPage";

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
        path: "/LandingPage/:id",
        element: <LandingPage />,
      },

      {
        path: "/CarouselOne",
        element: <CarouselOne />,
      },
      {
        path: "/FooterTwo",
        element: <FooterTwo />,
      },
      {
  path: "*",
  element: <NotFound />,
}
    ],
  },
]);

export default router;