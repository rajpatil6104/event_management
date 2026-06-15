"use client";

import { useState } from "react";
import axios from "axios";
import api from "@/lib/api";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validatePhone = (phone) => {
    return /^[0-9]{10}$/.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePhone(formData.phone)) {
      setMessage("Please enter a valid 10-digit phone number.");
      setIsError(true);
      return;
    }

    try {
      setLoading(true);

      await api.post("/guest/register", formData);

      setMessage(
        "🎉 Registration Successful! Check your email for the QR Pass.",
      );
      setIsError(false);

      setFormData({
        name: "",
        email: "",
        phone: "",
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Registration Failed. Please try again.",
      );
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🎟️</div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Event Registration
            </h1>

            <p className="text-gray-300 mt-3">
              Register now and receive your QR entry pass instantly.
            </p>
          </div>

          {/* Event Card */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 mb-6">
            <h2 className="text-xl font-bold text-white text-center">
              🎉 Tech Fest 2026
            </h2>

            <div className="mt-3 text-center text-gray-300 text-sm space-y-2">
              <p>📍 Pune, Maharashtra</p>

              <p>📅 25 June 2026</p>

              <p>⏰ 10:00 AM</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="
                w-full
                p-4
                rounded-xl
                bg-white/10
                border
                border-white/20
                text-white
                placeholder-gray-400
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-400
              "
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="
                w-full
                p-4
                rounded-xl
                bg-white/10
                border
                border-white/20
                text-white
                placeholder-gray-400
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-400
              "
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Mobile Number
              </label>

              <input
                type="tel"
                name="phone"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
                className="
                w-full
                p-4
                rounded-xl
                bg-white/10
                border
                border-white/20
                text-white
                placeholder-gray-400
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-400
              "
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
              w-full
              bg-white
              text-indigo-700
              font-bold
              py-4
              rounded-xl
              mt-4
              hover:scale-105
              hover:shadow-2xl
              transition-all
              duration-300
              disabled:opacity-70
              disabled:cursor-not-allowed
            "
            >
              {loading ? (
                <div className="flex justify-center items-center gap-2">
                  <div
                    className="
                  w-5
                  h-5
                  border-2
                  border-indigo-700
                  border-t-transparent
                  rounded-full
                  animate-spin
                "
                  ></div>
                  Processing...
                </div>
              ) : (
                "Register Now"
              )}
            </button>
          </form>

          {/* Alert */}
          {message && (
            <div
              className="
              mt-5
              p-4
              rounded-xl
              text-center
              font-semibold
              bg-white/10
              border
              border-white/20
              text-white
            "
            >
              {message}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-5">
          Secure registration powered by QR verification
        </p>
      </div>
    </div>
  );
}
