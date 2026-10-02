import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  SearchX,
} from "lucide-react";

const NotFound = () => {
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="relative overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.08)]">
          {/* Decoration */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-100/60 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-yellow-100/50 blur-3xl" />

          <div className="relative px-6 py-10 text-center sm:px-10 sm:py-12">
            {/* 404 */}
            <div className="mb-5 text-[72px] font-bold leading-none tracking-[-0.06em] text-gray-900 sm:text-[88px]">
              404
            </div>

            {/* Icon */}
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
              <SearchX
                size={26}
                strokeWidth={1.7}
                className="text-gray-500"
              />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              পেজটি পাওয়া যায়নি
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
              আপনি যে পেজটি খুঁজছেন সেটি হয়তো সরানো হয়েছে,
              পরিবর্তন করা হয়েছে অথবা আর available নেই।
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 text-sm font-medium text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg active:scale-[0.98]"
              >
                <Home size={16} />
                হোম পেজ
              </Link>

              <button
                type="button"
                onClick={handleBack}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]"
              >
                <ArrowLeft size={16} />
                ফিরে যান
              </button>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Spriengge
        </p>
      </div>
    </div>
  );
};

export default NotFound;