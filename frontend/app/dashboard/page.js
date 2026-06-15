"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaUserCheck,
  FaClock,
  FaQrcode,
  FaFileExcel,
  FaDownload,
  FaPowerOff,
} from "react-icons/fa";

export default function Dashboard() {
  const [guests, setGuests] = useState([]);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuests();
  }, []);

  useEffect(() => {
    const filtered = guests.filter(
      (guest) =>
        guest.name.toLowerCase().includes(search.toLowerCase()) ||
        guest.email.toLowerCase().includes(search.toLowerCase()) ||
        guest.phone.includes(search),
    );

    setFilteredGuests(filtered);
  }, [search, guests]);

  const fetchGuests = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      console.log("TOKEN:", token);

      const res = await axios.get("http://localhost:5000/api/guest/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("DATA:", res.data);

      setGuests(res.data);
      setFilteredGuests(res.data);
    } catch (err) {
      console.log("ERROR:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const downloadAttendance = async () => {
    const token = localStorage.getItem("token");

    const response = await axios.get("http://localhost:5000/api/guest/export", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));

    const link = document.createElement("a");

    link.href = url;

    link.setAttribute("download", "attendance.xlsx");

    document.body.appendChild(link);

    link.click();
  };

  const closeEvent = async () => {
    const download = window.confirm("Download reports before deleting?");

    if (download) {
      downloadAttendance();
    }

    const finalConfirm = window.confirm(
      "This will permanently delete all registrations and attendance data. Continue?",
    );

    if (!finalConfirm) return;

    const token = localStorage.getItem("token");

    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/guest/clear-event`,

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    alert("Event Data Cleared");

    fetchGuests();
  };

  const uploadExcel = async () => {
    const file = document.getElementById("excelFile").files[0];

    if (!file) {
      alert("Select Excel File");

      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    const token = localStorage.getItem("token");

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/guest/bulk-upload`,

      formData,

      {
        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type": "multipart/form-data",
        },
      },
    );

    alert(`${res.data.uploaded} Guests Uploaded`);

    fetchGuests();
  };

  const totalGuests = guests.length;
  const attendedGuests = guests.filter((g) => g.attended).length;
  const pendingGuests = totalGuests - attendedGuests;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 md:p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            {/* Title Section */}
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-4xl font-bold text-white">
                Event Dashboard
              </h1>

              <p className="text-gray-300 mt-1 text-sm md:text-base">
                Real-time attendee management system
              </p>
            </div>

            {/* Buttons Section */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={fetchGuests}
                className="
          bg-white
          text-indigo-700
          px-5
          py-2
          rounded-xl
          font-semibold
          hover:scale-105
          hover:shadow-xl
          transition-all
          duration-300
          w-full
          sm:w-auto
        "
              >
                Refresh
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
                className="
          bg-red-500
          text-white
          px-5
          py-2
          rounded-xl
          font-semibold
          hover:scale-105
          hover:shadow-xl
          transition-all
          duration-300
          w-full
          sm:w-auto
        "
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20 mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => (window.location.href = "/scanner")}
              className="bg-green-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:scale-105
hover:shadow-xl
transition-all
duration-300"
            >
              <FaQrcode />
              Scanner
            </button>

            <label className="bg-slate-200 px-5 py-3 rounded-xl cursor-pointer font-medium">
              Select Excel
              <input
                type="file"
                id="excelFile"
                accept=".xlsx,.xls"
                className="hidden"
              />
            </label>

            <button
              onClick={uploadExcel}
              className="bg-purple-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:scale-105
hover:shadow-xl
transition-all
duration-300"
            >
              <FaFileExcel />
              Upload
            </button>

            <button
              onClick={downloadAttendance}
              className="bg-yellow-500 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:scale-105
hover:shadow-xl
transition-all
duration-300"
            >
              <FaDownload />
              Export
            </button>

            <button
              onClick={closeEvent}
              className="bg-red-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:scale-105
hover:shadow-xl
transition-all
duration-300"
            >
              <FaPowerOff />
              Close Event
            </button>
          </div>
        </div>
        {/* Stats Cards */}

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-100">Total Guests</p>
                <h2 className="text-5xl font-bold text-white mt-2">
                  {totalGuests}
                </h2>
              </div>

              <FaUsers size={50} className="text-white/50" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-3xl shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-100">Attended</p>
                <h2 className="text-5xl font-bold text-white mt-2">
                  {attendedGuests}
                </h2>
              </div>

              <FaUserCheck size={50} className="text-white/50" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-3xl shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-red-100">Pending</p>
                <h2 className="text-5xl font-bold text-white mt-2">
                  {pendingGuests}
                </h2>
              </div>

              <FaClock size={50} className="text-white/50" />
            </div>
          </div>
        </div>
        {/* Analytics cards */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
          <div className="flex justify-between mb-3">
            <h3 className="font-bold text-lg">Attendance Progress</h3>

            <span className="font-semibold">
              {totalGuests > 0
                ? Math.round((attendedGuests / totalGuests) * 100)
                : 0}
              %
            </span>
          </div>

          <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
              style={{
                width: `${
                  totalGuests > 0 ? (attendedGuests / totalGuests) * 100 : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Search */}

        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Search guests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className=" w-full bg-white p-4 pl-12 rounded-2xl shadow-xl outline-none focus:ring-4 focus:ring-indigo-300 "
          />

          <span className="absolute left-4 top-4 text-gray-400 text-xl">
            🔍
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>

              <p className="mt-4 text-gray-600">Loading Guests...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">Email</th>
                    <th className="p-4 text-left">Phone</th>
                    <th className="p-4 text-left">Actions</th>
                    <th className="p-4 text-left">Status</th>
                  </tr>
                </thead>

                <tbody className=" border-b hover:bg-gray-300 hover:scale-[1.001] transition-all duration-200 ">
                  {filteredGuests.length > 0 ? (
                    filteredGuests.map((guest) => (
                      <tr
                        key={guest._id}
                        className="border-b hover:bg-gray-100 transition"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className=" w-11 h-11 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold ">
                              {guest.name.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-gray-800">
                                {guest.name}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-gray-600">{guest.email}</td>

                        <td className="p-4 text-gray-600">{guest.phone}</td>
                        <td>
                          <button
                            className="bg-blue-500 text-black px-3 py-1 rounded hover:scale-105 hover:shadow-xl transition-all duration-300"
                            onClick={async () => {
                              const token = localStorage.getItem("token");

                              await axios.post(
                                `http://localhost:5000/api/guest/resend/${guest._id}`,

                                {},

                                {
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                  },
                                },
                              );

                              alert("QR Sent");
                            }}
                          >
                            Resend QR
                          </button>
                        </td>

                        <td className="p-4">
                          {guest.attended ? (
                            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                              ✓ Checked In
                            </span>
                          ) : (
                            <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center p-8 text-gray-500">
                        No Guests Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
