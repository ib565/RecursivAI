import React from "react";
import Link from "next/link";

const Header = () => {
  const today = new Date();
  
  return (
    <header className="pt-4 pb-4 bg-[#FAF9F5] text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-7xl font-display font-black">
            <Link href="/">
              RecursivAI
            </Link>
          </h1>
          <p className="text-center text-base italic font-serif text-gray-700 mt-1">
            Who better to keep up with AI than AI itself?
          </p>
          <div className="text-s tracking-wider font-medium mt-2">
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