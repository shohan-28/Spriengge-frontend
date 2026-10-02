import React from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Developer console only.
    // Customer-এর UI-তে technical error দেখানো হবে না।
    console.error("Spriengge React Error:", error);
    console.error("Error Info:", errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="relative overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.08)]">
            {/* Soft background decoration */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-100/60 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-yellow-100/50 blur-3xl" />

            <div className="relative px-6 py-10 text-center sm:px-10 sm:py-12">
              {/* Icon */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
                <AlertTriangle
                  size={30}
                  strokeWidth={1.8}
                  className="text-amber-600"
                />
              </div>

              {/* Small label */}
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500">
                <ShieldAlert size={13} />
                <span>Spriengge</span>
              </div>

              {/* Heading */}
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                Something went wrong
              </h1>

              {/* Description */}
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
                দুঃখিত, পেজটি লোড করতে সাময়িকভাবে সমস্যা হয়েছে।
                আবার চেষ্টা করুন অথবা হোম পেজে ফিরে যান।
              </p>

              {/* Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 text-sm font-medium text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg active:scale-[0.98]"
                >
                  <RefreshCw
                    size={16}
                    className="transition-transform duration-500 group-hover:rotate-180"
                  />
                  আবার চেষ্টা করুন
                </button>

                <button
                  type="button"
                  onClick={this.handleGoBack}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]"
                >
                  <ArrowLeft size={16} />
                  ফিরে যান
                </button>
              </div>

              {/* Home */}
              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 transition-colors hover:text-amber-700"
              >
                <Home size={15} />
                হোম পেজে যান
              </Link>

              {/* Support */}
              <div className="mt-8 border-t border-gray-100 pt-6">
                <p className="text-xs leading-5 text-gray-400">
                  সমস্যাটি বারবার হলে আমাদের সাথে যোগাযোগ করুন।
                  <br />
                  আমরা আপনাকে সাহায্য করতে প্রস্তুত।
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Spriengge
          </p>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;