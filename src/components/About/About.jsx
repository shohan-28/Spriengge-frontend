
import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Target,
  Award,
  Sparkles,
  ShoppingBag,
  Heart,
  ShieldCheck,
} from "lucide-react";

import { FaFacebookF } from "react-icons/fa";

const About = () => {
  return (
    <section className="min-h-screen py-16 md:py-24 bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#ffffff_45%,_#fffbeb)]">
      <div className="w-[92%] max-w-7xl mx-auto">

        {/* ================= HERO SECTION ================= */}
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* LEFT CONTENT */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-600 text-sm font-semibold mb-6 border border-amber-100">
              <Sparkles size={16} />
              Welcome to Spriengge
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Shopping Made
              <span className="text-amber-500"> Simple, </span>
              Stylish & Trusted.
            </h1>

            <p className="mt-6 text-gray-600 text-base md:text-lg leading-8 max-w-xl">
              Spriengge is a modern eCommerce platform created to make online
              shopping easier, more enjoyable, and convenient. We bring
              quality products and a smooth digital shopping experience
              together in one place.
            </p>

            {/* BUTTONS */}
            <div className="mt-8 flex flex-wrap gap-4">

              {/* Explore Button */}
              <button
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  })
                }
                className="group flex items-center gap-2 bg-gray-900 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-amber-500 transition duration-300 shadow-lg"
              >
                Explore Spriengge

                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>

              {/* Facebook Button */}
              <a
                href="https://www.facebook.com/spriengge.shop"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-800 font-semibold hover:border-blue-500 hover:text-blue-600 hover:shadow-lg transition duration-300"
              >
                <FaFacebookF size={18} />
                Follow Us
              </a>
            </div>

            {/* TRUST STATS */}
            <div className="mt-10 flex flex-wrap gap-8">

              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  100%
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Customer Focused
                </p>
              </div>

              <div className="w-px bg-gray-200 hidden sm:block"></div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  24/7
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Online Shopping
                </p>
              </div>

              <div className="w-px bg-gray-200 hidden sm:block"></div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Easy
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Shopping Experience
                </p>
              </div>

            </div>
          </div>

          {/* ================= RIGHT IMAGE ================= */}
          <div className="relative">

            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-200 rounded-full blur-3xl opacity-60"></div>

            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-60"></div>

            {/* Image */}
            <div className="relative rounded-[2rem] overflow-hidden border border-white shadow-2xl bg-white p-2">

              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d"
                alt="Spriengge Online Shopping"
                className="w-full h-[450px] object-cover rounded-[1.5rem]"
              />

              {/* Image Overlay */}
              <div className="absolute inset-2 rounded-[1.5rem] bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

              {/* Image Text */}
              <div className="absolute bottom-7 left-7 text-white">
                <p className="text-sm font-medium opacity-90">
                  Discover • Shop • Enjoy
                </p>

                <h3 className="text-2xl font-bold mt-1">
                  Your Everyday Shopping Partner
                </h3>
              </div>
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-8 -left-5 md:left-8 bg-white/95 backdrop-blur-xl shadow-xl border border-gray-100 rounded-2xl p-5 flex items-center gap-4">

              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <ShoppingBag size={24} />
              </div>

              <div>
                <h3 className="font-bold text-gray-900">
                  Spriengge
                </h3>

                <p className="text-sm text-gray-500">
                  Your Online Shopping Destination
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* ================= WHY SPRIENGGE ================= */}
        <div className="mt-32">

          <div className="text-center max-w-2xl mx-auto">

            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-600 text-sm font-semibold border border-amber-100">
              <Heart size={15} />
              Why Spriengge?
            </span>

            <h2 className="mt-5 text-3xl md:text-4xl font-bold text-gray-900">
              More Than Just an
              <span className="text-amber-500">
                {" "}Online Store.
              </span>
            </h2>

            <p className="mt-4 text-gray-600 leading-7">
              We focus on creating a shopping experience where convenience,
              quality, and customer satisfaction come first.
            </p>

          </div>

          {/* FEATURE CARDS */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">

            {/* CARD 1 */}
            <div className="group p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-amber-200 hover:shadow-xl transition duration-300">

              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <ShoppingBag size={28} />
              </div>

              <h3 className="mt-6 text-xl font-bold text-gray-900">
                Easy Shopping
              </h3>

              <p className="mt-3 text-gray-600 leading-7">
                Browse products, explore details, and place your order through
                a simple and smooth shopping experience.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="group p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-blue-200 hover:shadow-xl transition duration-300">

              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <ShieldCheck size={28} />
              </div>

              <h3 className="mt-6 text-xl font-bold text-gray-900">
                Customer First
              </h3>

              <p className="mt-3 text-gray-600 leading-7">
                We believe a great eCommerce experience starts with trust,
                transparency, and putting our customers first.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="group p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-green-200 hover:shadow-xl transition duration-300">

              <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <CheckCircle2 size={28} />
              </div>

              <h3 className="mt-6 text-xl font-bold text-gray-900">
                Quality & Convenience
              </h3>

              <p className="mt-3 text-gray-600 leading-7">
                Our goal is to make finding and ordering the products you need
                convenient, reliable, and enjoyable.
              </p>
            </div>

          </div>
        </div>

        {/* ================= MISSION / VISION / COMMUNITY ================= */}
        <div className="mt-24 grid md:grid-cols-3 gap-6">

          {/* MISSION */}
          <div className="p-8 rounded-3xl border border-gray-100 bg-white hover:shadow-xl transition duration-300">

            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Target size={28} />
            </div>

            <h3 className="mt-6 text-xl font-bold text-gray-900">
              Our Mission
            </h3>

            <p className="mt-3 text-gray-600 leading-7">
              To make online shopping simple, accessible, and enjoyable while
              delivering value to every customer.
            </p>
          </div>

          {/* VISION */}
          <div className="p-8 rounded-3xl border border-gray-100 bg-white hover:shadow-xl transition duration-300">

            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award size={28} />
            </div>

            <h3 className="mt-6 text-xl font-bold text-gray-900">
              Our Vision
            </h3>

            <p className="mt-3 text-gray-600 leading-7">
              To build a trusted eCommerce brand that customers can rely on
              for quality products and a better digital shopping experience.
            </p>
          </div>

          {/* COMMUNITY */}
          <div className="p-8 rounded-3xl border border-gray-100 bg-white hover:shadow-xl transition duration-300">

            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={28} />
            </div>

            <h3 className="mt-6 text-xl font-bold text-gray-900">
              Our Community
            </h3>

            <p className="mt-3 text-gray-600 leading-7">
              Stay connected with Spriengge on Facebook for product updates,
              offers, announcements, and everything new from our store.
            </p>
          </div>

        </div>

        {/* ================= FACEBOOK CTA ================= */}
        <div className="mt-24 relative overflow-hidden rounded-[2rem] bg-gray-900 p-8 md:p-12 text-white">

          {/* Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>

          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl"></div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">

            {/* Text */}
            <div className="text-center md:text-left">

              <div className="inline-flex items-center gap-2 text-blue-400 font-semibold text-sm">
                <FaFacebookF size={17} />
                Stay Connected With Spriengge
              </div>

              <h2 className="mt-3 text-2xl md:text-4xl font-bold">
                Join Our Facebook Community
              </h2>

              <p className="mt-3 text-gray-400 max-w-xl leading-7">
                Follow our Facebook page to stay updated with new products,
                special offers, announcements, and the latest from Spriengge.
              </p>

            </div>

            {/* Facebook CTA */}
            <a
              href="https://www.facebook.com/spriengge.shop"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-3 bg-white text-gray-900 px-7 py-4 rounded-xl font-bold hover:bg-blue-500 hover:text-white transition duration-300 shadow-xl"
            >
              <FaFacebookF size={20} />

              Visit Facebook Page

              <ArrowRight size={18} />
            </a>

          </div>
        </div>

      </div>
    </section>
  );
};

export default About;
