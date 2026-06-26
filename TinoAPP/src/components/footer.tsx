import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#121212] border-t border-gray-900/60 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex justify-center items-center">
        <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">
          © {new Date().getFullYear()}  Joaquin Tobal - TinoApp v.1.2.3 *
        </p>
      </div>
    </footer>
  );
};

export default Footer;