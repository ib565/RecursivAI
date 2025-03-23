import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-cyber-dark border-t border-cyber-gray py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <div className="text-xl font-bold mb-4">
              <span className="text-white">Recursiv</span>
              <span className="text-cyber-neon">AI</span>
            </div>
            <p className="text-gray-400 max-w-md">
              An AI-powered blog exploring cutting-edge research developments in
              machine learning.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/" className="hover:text-cyber-neon">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/curated" className="hover:text-amber-400">
                  Curated
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-cyber-pink">
                  About
                </Link>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/ishaan-bhartiya/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyber-purple"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cyber-gray mt-8 pt-6 text-center text-gray-500">
          © {currentYear} RecursivAI. All content is AI-generated.
        </div>
      </div>
    </footer>
  );
};

export default Footer;