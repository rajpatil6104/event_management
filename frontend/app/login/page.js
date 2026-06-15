"use client";

import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const [showVerify, setShowVerify] = useState(false);

  const login = async () => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/guest/login`, {
      email,
      password,
    });

    localStorage.setItem("token", res.data.token);

    window.location.href = "/dashboard";
  };
  const register = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}api/guest/register-admin`,

        {
          email,
          password,
        },
      );

      alert(res.data.message);

      setShowVerify(true);
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };
  const verify = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/guest/verify-admin`,

        {
          email,
          code,
        },
      );

      alert("Verification Successful");

      setShowVerify(false);

      setIsLogin(true);
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };
  return (
    <div
      className="
min-h-screen
flex
items-center
justify-center
bg-gradient-to-br
from-indigo-900
to-black
"
    >
      <div
        className="
bg-white
p-8
rounded-3xl
shadow-2xl
w-[400px]
"
      >
        <h1
          className="
text-3xl
font-bold
mb-6
text-center
"
        >
          {isLogin ? "Admin Login" : "Admin Register"}
        </h1>

        <input
          className="
w-full
border
p-3
rounded-lg
mb-4
"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="
w-full
border
p-3
rounded-lg
mb-4
"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {showVerify && (
          <input
            className="
w-full
border
p-3
rounded-lg
mb-4
"
            placeholder="
Enter Verification Code
"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        )}

        {showVerify ? (
          <button
            onClick={verify}
            className="
w-full
bg-green-600
text-white
p-3
rounded-lg
"
          >
            Verify
          </button>
        ) : (
          <button
            onClick={isLogin ? login : register}
            className="
w-full
bg-indigo-600
text-white
p-3
rounded-lg
"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        )}

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="
mt-4
text-blue-600
w-full
"
        >
          {isLogin ? "Create Account" : "Already Have Account"}
        </button>
      </div>
    </div>
  );
}
