import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-cyber-dark py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-cyber-neon w-8 h-8 flex items-center justify-center">
            <span className="text-cyber-black font-bold">AI</span>
          </div>
          <div className="text-xl font-bold">
            <span className="text-white">Neural</span>
            <span className="text-cyber-neon">Pulse</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-white hover:text-cyber-neon">Home</Link>
          <Link to="/about" className="text-white hover:text-cyber-neon">About</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;