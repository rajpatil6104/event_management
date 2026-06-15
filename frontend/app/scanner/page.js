"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function ScannerPage() {
  const [status, setStatus] = useState("Ready to Scan");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    let isScanning = false;

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false,
    );

    scanner.render(
      async (decodedText) => {
        if (isScanning) return;

        isScanning = true;
        setLoading(true);
        setStatus("Verifying QR Code...");

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}api/guest/verify`,
            {
              guestId: decodedText,
            },
          );

          setStatus("Verified Successfully");
          setMessage(response.data.message);

          setTimeout(() => {
            isScanning = false;
            setLoading(false);
          }, 2000);
        } catch (error) {
          setStatus("Verification Failed");
          setMessage(error.response?.data?.message || "Invalid QR Code");

          setTimeout(() => {
            isScanning = false;
            setLoading(false);
          }, 2000);
        }
      },
      () => {},
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-black flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div
        className="
    w-full
    max-w-md
    sm:max-w-lg
    bg-white/10
    backdrop-blur-xl
    rounded-3xl
    shadow-2xl
    border
    border-white/20
    p-4
    sm:p-6
  "
      >
        {/* Header */}
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="
      bg-white/20
      hover:bg-white/30
      text-white
      px-4
      py-2
      rounded-xl
      flex
      items-center
      gap-2
      transition-all
      duration-300
      hover:scale-105
    "
          >
            ← Dashboard
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Event QR Scanner
            </h1>

            <p className="text-gray-300 mt-1 text-sm sm:text-base">
              Scan guest QR code for verification
            </p>
          </div>

          {/* Empty div keeps title centered */}
          <div className="w-[120px]"></div>
        </div>

        {/* Scanner Container */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 overflow-hidden">
          <div
            id="reader"
            className="
          w-full
          max-w-sm
          mx-auto
        "
          ></div>
        </div>

        {/* Status */}
        <div className="mt-5 sm:mt-6">
          <div
            className={`
          p-4
          rounded-xl
          text-center
          font-semibold
          text-sm
          sm:text-base
          transition-all
          duration-300
          ${
            status === "Verified Successfully"
              ? "bg-green-500 text-white"
              : status === "Verification Failed"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
          }
        `}
          >
            {loading ? (
              <div className="flex justify-center items-center gap-2">
                <div
                  className="
              w-5
              h-5
              border-2
              border-white
              border-t-transparent
              rounded-full
              animate-spin
            "
                ></div>
                Verifying...
              </div>
            ) : (
              status
            )}
          </div>

          {message && (
            <div
              className="
          mt-4
          bg-white/20
          text-white
          p-4
          rounded-xl
          text-sm
          sm:text-base
          break-words
        "
            >
              {message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="
      mt-6
      text-center
      text-xs
      sm:text-sm
      text-gray-300
    "
        >
          📷 Point your camera towards the QR Code
        </div>
      </div>
    </div>
  );
}
