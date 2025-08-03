import React from "react";
import Link from "next/link";
import Image from "next/image";

const Header = () => {
  return (
    <header className="bg-cyber-dark py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.png" alt="RecursivAI Logo" width={32} height={32} className="h-8 w-auto" />
          <div className="text-xl font-bold">
            <span className="text-white">Recursiv</span>
            <span className="text-cyber-neon">AI</span>
          </div>
        </Link>

        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="text-white hover:text-cyber-neon">
            Home
          </Link>
          <Link href="/curated" className="text-white hover:text-amber-400">
            Curated
          </Link>
          <Link href="/about" className="text-white hover:text-cyber-pink">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;