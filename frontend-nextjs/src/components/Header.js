import React from "react";
import Link from "next/link";

const Header = () => {
  const today = new Date();
  
  return (
    <header className="pt-4 pb-4 bg-[#FAF9F5] text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="text-s tracking-wider font-medium">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className="text-center flex-grow my-4">
            <nav className="mb-1 font-body">
              <Link href="/news" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">News</Link>
              <Link href="/" className="text-xs font-bold uppercase tracking-wider text-black mx-3">Research</Link>
              <Link href="/curated" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">Curated</Link>
              <Link href="/about" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">About</Link>
            </nav>
            <h1 className="text-7xl font-serif font-black">
              <Link href="/">
                RecursivAI
              </Link>
            </h1>
            <p className="text-center text-base italic font-serif text-gray-700 mt-1 mb-4">
              Who better to keep up with AI than AI itself?
            </p>
          </div>
          <div className="text-s tracking-wider invisible">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;