
import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
} from "lucide-react";

const Contact = () => {
  return (
    <section className="min-h-screen py-16 md:py-24 bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#ffffff_45%,_#fffbeb)]">
      <div className="w-[92%] max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold">
            Get In Touch
          </span>

          <h1 className="mt-5 text-4xl md:text-5xl font-bold text-gray-900">
            Let's Talk About Your Project
          </h1>

          <p className="mt-5 text-gray-600 text-lg leading-8">
            Have an idea or a project in mind? Send us a message and our team
            will get back to you as soon as possible.
          </p>
        </div>

        {/* Contact Content */}
        <div className="mt-16 grid lg:grid-cols-5 gap-8">

          {/* Contact Info */}
          <div className="lg:col-span-2 bg-gray-900 rounded-3xl p-8 md:p-10 text-white">

            <h2 className="text-2xl font-bold">
              Contact Information
            </h2>

            <p className="mt-4 text-gray-400 leading-7">
              We are always ready to hear from you. Feel free to reach out
              through any of the following channels.
            </p>

            <div className="mt-10 space-y-7">

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
                  <Mail size={22} />
                </div>

                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="mt-1 font-medium">
                    spriengge@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
                  <Phone size={22} />
                </div>

                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="mt-1 font-medium">
                    01341783631
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
                  <MapPin size={22} />
                </div>

                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="mt-1 font-medium">
                    Dhaka, Bangladesh
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
                  <Clock size={22} />
                </div>

                <div>
                  <p className="text-sm text-gray-400">Working Hours</p>
                  <p className="mt-1 font-medium">
                    24/7, 8AM - 11PM
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3 border border-gray-100 rounded-3xl p-8 md:p-10 shadow-xl shadow-gray-100/50">

            <h2 className="text-2xl font-bold text-gray-900">
              Send Us a Message
            </h2>

            <p className="mt-3 text-gray-500">
              Fill out the form below and we will contact you shortly.
            </p>

            <form className="mt-8 space-y-6">

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>

                <input
                  type="text"
                  placeholder="What is this about?"
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>

                <textarea
                  rows="6"
                  placeholder="Write your message..."
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition duration-300"
              >
                Send Message
                <Send size={18} />
              </button>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;

