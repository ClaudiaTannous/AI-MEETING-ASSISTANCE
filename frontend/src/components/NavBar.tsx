"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/lib/api";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");

      Cookies.remove("token");
      localStorage.removeItem("token");

      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="w-full bg-white/30 backdrop-blur-md shadow-md border-b border-white/40 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img src="/logo1.svg" alt="Logo" className="w-30 h-10" />
        <span className="text-xl font-bold text-[#ce4257] hover:text-[#b23a49] transition-colors duration-300">
          Transcripta
        </span>
      </div>

      <div className="flex gap-6">
        <button
          onClick={handleLogout}
          className="text-[#ce4257] hover:text-[#b23a49] transition-colors duration-300"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
