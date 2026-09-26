import {
    FaFacebookF,
    FaInstagram,
    FaTwitter,
    FaLinkedinIn,
    FaCcVisa,
    FaCcMastercard,
    FaCcPaypal,
    FaCcAmex,
} from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-white border-t-2 border-gray-200 mt-20 rounded-t-2xl">
            <div className="max-w-[92%] mx-auto px-6 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

                    {/* Logo */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Sprien<span className="text-amber-400">gge</span>
                        </h2>

                        <p className="mt-4 text-gray-500 leading-7">
                            Discover premium products with the best prices and fast delivery.
                            Shop confidently with secure payments and trusted service.
                        </p>

                        <div className="flex gap-3 mt-6">
                            <a
                                href="https://www.facebook.com/spriengge.shop"
                                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-violet-600 hover:text-white hover:border-violet-600 duration-300"
                            >
                                <FaFacebookF />
                            </a>

                            <a
                                href="#"
                                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-sky-500 hover:text-white hover:border-sky-500 duration-300"
                            >
                                <FaTwitter />
                            </a>

                            <a
                                href="#"
                                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-pink-500 hover:text-white hover:border-pink-500 duration-300"
                            >
                                <FaInstagram />
                            </a>

                            <a
                                href="#"
                                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-blue-700 hover:text-white hover:border-blue-700 duration-300"
                            >
                                <FaLinkedinIn />
                            </a>
                        </div>
                    </div>

                    {/* Shop */}
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-5">Shop</h3>

                        <ul className="space-y-3 text-gray-500">
                            <li><a href="#" className="hover:text-violet-600">Men</a></li>
                            <li><a href="#" className="hover:text-violet-600">Women</a></li>
                            <li><a href="#" className="hover:text-violet-600">Kids</a></li>
                            <li><a href="#" className="hover:text-violet-600">Accessories</a></li>
                            <li><a href="#" className="hover:text-violet-600">New Arrival</a></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-5">
                            Company
                        </h3>

                        <ul className="space-y-3 text-gray-500">
                            <li><a href="#" className="hover:text-violet-600">About Us</a></li>
                            <li><a href="#" className="hover:text-violet-600">Blog</a></li>
                            <li><a href="#" className="hover:text-violet-600">Careers</a></li>
                            <li><a href="#" className="hover:text-violet-600">Contact</a></li>
                            <li><a href="#" className="hover:text-violet-600">Support</a></li>
                        </ul>
                    </div>

                    {/* Help */}
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-5">Help</h3>

                        <ul className="space-y-3 text-gray-500">
                            <li><a href="#" className="hover:text-violet-600">FAQs</a></li>
                            <li><a href="#" className="hover:text-violet-600">Shipping</a></li>
                            <li><a href="#" className="hover:text-violet-600">Returns</a></li>
                            <li><a href="#" className="hover:text-violet-600">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-violet-600">Terms & Conditions</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-5">
                            Newsletter
                        </h3>

                        <p className="text-gray-500 mb-5">
                            Subscribe to receive updates, offers and new arrivals.
                        </p>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full h-12 rounded-xl border border-gray-300 px-4 outline-none focus:border-violet-600"
                        />

                        <button className="w-full h-12 mt-3 rounded-xl bg-amber-300 hover:bg-amber-400 cursor-pointer text-white font-medium transition">
                            Subscribe
                        </button>
                    </div>

                </div>

                {/* Bottom */}
                <div className="border-t border-gray-200 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-5">

                    <p className="text-sm text-gray-500 text-center">
                        © {new Date().getFullYear()} ShopMart. All Rights Reserved.
                    </p>

                    <div className="flex items-center gap-4 text-4xl text-gray-600">
                        <FaCcVisa />
                        <FaCcMastercard />
                        <FaCcPaypal />
                        <FaCcAmex />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;