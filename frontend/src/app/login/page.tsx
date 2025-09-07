"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Cookies from "js-cookie";
import { ReactTyped } from "react-typed";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res.data as { access_token: string; token_type: string };

      console.log("Login response:", data);

      Cookies.set("token", data.access_token, { expires: 7 });
      console.log("Saved token:", Cookies.get("token"));

      router.push("/meetings");
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background1.png')" }}
    >
      <div className="bg-white/30 backdrop-blur-md shadow-lg w-full max-w-5xl rounded-xl flex overflow-hidden">
        <div className="w-1/2 bg-[#720026] text-white flex flex-col justify-center items-center p-8">
          <h2 className="text-3xl font-extrabold mb-4">
            <ReactTyped
              strings={[
                "Welcome to Transcripta",
                "Your AI meeting assistant",
                "Record. Transcribe. Summarize.",
              ]}
              typeSpeed={60}
              backSpeed={40}
              loop
            />
          </h2>
          <p className="text-center text-lg">
            Your AI-powered assistant for recording, transcribing, and
            summarizing meetings. Stay productive, save time, and never miss a
            detail again.
          </p>
        </div>

        <div className="w-1/2 p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

          {error && (
            <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 
                         rounded-lg shadow-sm focus:outline-none 
                         focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 
                         rounded-lg shadow-sm focus:outline-none 
                         focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#720026] text-white py-2 rounded-lg 
                      hover:bg-[#a00036] transition-colors"
            >
              Login
            </button>
          </form>

          <p className="mt-4 text-sm text-center text-gray-500">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-[#720026] hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
