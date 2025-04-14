import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-cyber-dark py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img src={"/logo.png"} alt="RecursivAI Logo" className="h-8 w-auto" />
          <div className="text-xl font-bold">
            <span className="text-white">Recursiv</span>
            <span className="text-cyber-neon">AI</span>
          </div>
        </Link>

        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-white hover:text-cyber-neon">
            Home
          </Link>
          <Link to="/curated" className="text-white hover:text-amber-400">
            Curated
          </Link>
          <Link to="/about" className="text-white hover:text-cyber-pink">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;