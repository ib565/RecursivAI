import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-cyber-dark py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          {/* <div className="bg-cyber-neon w-8 h-8 flex items-center justify-center">
            <span className="text-cyber-black font-bold">AI</span>
          </div> */}
          <div className="text-xl font-bold">
            <span className="text-white">Recursiv</span>
            <span className="text-cyber-neon">AI</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-white hover:text-cyber-neon">Home</Link>
          <Link to="/about" className="text-white hover:text-cyber-pink">About</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;