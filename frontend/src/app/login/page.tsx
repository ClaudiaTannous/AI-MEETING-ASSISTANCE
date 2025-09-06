"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Cookies from "js-cookie";
import { ReactTyped } from "react-typed";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/register", { name, email, password });
      const data = res.data as { access_token: string };

      Cookies.set("token", data.access_token, { expires: 7 });
      router.push("/meetings");
    } catch (err: any) {
      setError("Signup failed. Email may already be in use.");
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
                "Join Transcripta Today",
                "Your AI meeting assistant",
                "Sign up and get started!",
              ]}
              typeSpeed={60}
              backSpeed={40}
              loop
            />
          </h2>
          <p className="text-center text-lg">
            Create your free account and start recording, transcribing, and
            summarizing meetings instantly. Stay organized and boost your
            productivity.
          </p>
        </div>

        <div className="w-1/2 p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>

          {error && (
            <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 
                           rounded-lg shadow-sm focus:outline-none 
                           focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Email */}
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
              Sign Up
            </button>
          </form>

          <p className="mt-4 text-sm text-center text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="text-[#720026] hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
