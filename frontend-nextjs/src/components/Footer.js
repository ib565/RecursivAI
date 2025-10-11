import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-8 pt-6 border-t-2 border-double border-black text-sm text-gray-500 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="text-center mb-4">
          <div className="text-2xl mb-2">🦕</div>
          <p className="font-serif">Rex approves this message</p>
        </div>
        <p className="text-center">© {currentYear} RecursivAI. All Rights Reserved. Rex ™ is a registered mascot.</p>
      </div>
    </footer>
  );
};

export default Footer;