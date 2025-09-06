"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-white/30 backdrop-blur-md shadow-md border-b border-white/40 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img src="/logo1.svg" alt="Logo" className="w-30 h-10" />
        <span className="text-xl font-bold text-[#ce4257] hover:text-[#b23a49] transition-colors duration-300">
          Transcripta
        </span>
      </div>

      <div className="flex gap-6">
        <Link href="/meetings" className="text-[#ce4257] hover:text-[#ce4257]">
          Meetings
        </Link>
        <Link href="/about" className="text-[#ce4257] hover:text-[#ce4257]">
          About
        </Link>
        <Link href="/profile" className="text-[#ce4257] hover:text-[#ce4257]">
          Profile
        </Link>
      </div>
    </nav>
  );
}
