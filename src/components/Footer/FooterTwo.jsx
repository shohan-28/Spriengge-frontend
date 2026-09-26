
import React from "react";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { FaFacebookF } from "react-icons/fa";

const FooterTwo = () => {
  return (
    <footer className="px-4 sm:px-6 lg:px-8 pb-6">
      <div className="max-w-7xl mx-auto">

        {/* Main Footer Card */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white px-6 py-10 sm:px-10 md:py-12 shadow-sm">

          {/* Background Glow */}
          <div className="absolute -top-20 -right-20 w-56 h-56 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />

          <div className="absolute -bottom-24 -left-20 w-52 h-52 bg-blue-50 rounded-full blur-3xl pointer-events-none" />

          {/* Content */}
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">

            {/* Message */}
            <div className="flex items-start gap-4 max-w-2xl">

              {/* Support Icon */}
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center animate-pulse">
                <ShieldAlert size={23} />
              </div>

              {/* Text */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Need Help With Your Order?
                </h3>

                <p className="mt-2 text-sm sm:text-base text-gray-500 leading-7">
                  যদি website-এ কোনো problem face করেন অথবা order করতে
                  সমস্যা হয়, তাহলে অবশ্যই আমাদের Facebook Page-এ জানাবেন।
                  আমরা আপনাকে সাহায্য করার চেষ্টা করব।
                </p>
              </div>

            </div>

            {/* Facebook Button */}
            <a
              href="https://www.facebook.com/spriengge.shop"
              target="_blank"
              rel="noopener noreferrer"
              className="group shrink-0 inline-flex items-center gap-3 px-5 py-3.5 rounded-xl bg-gray-900 text-white font-semibold text-sm sm:text-base shadow-lg shadow-gray-900/10 hover:bg-blue-600 hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300"
            >

              {/* Facebook Icon */}
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                <FaFacebookF size={15} />
              </span>

              <span>
                Contact on Facebook
              </span>

              {/* Arrow */}
              <ArrowRight
                size={17}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />

            </a>

          </div>

          {/* Bottom Line */}
          <div className="relative mt-8 pt-5 border-t border-gray-100 text-center">

            <p className="text-xs sm:text-sm text-gray-400">
              © {new Date().getFullYear()} Spriengge. All rights reserved.
            </p>

          </div>

        </div>

      </div>
    </footer>
  );
};

export default FooterTwo;
