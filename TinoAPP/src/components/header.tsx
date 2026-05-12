import React from 'react';
import logo from '../assets/PNG/TinoAPP_Logo_PNG_800px_Gris.png';

function Header() {
  return (
    <nav className="w-full bg-[#1a1a1a] border-b border-gray-800 px-6 py-4 flex items-center justify-between shadow-md">
      
      <div className="flex items-center">
        <img 
          src={logo} 
          alt="Logo Navbar" 
          className="h-10 w-auto object-contain" 
        />
      </div>

      <div>
        <button 
          disabled
          className="bg-gray-700 text-gray-400 text-sm font-semibold py-2 px-4 rounded-md border border-gray-600 cursor-not-allowed uppercase tracking-wider"
        >
          ver ordenes
        </button>
      </div>

    </nav>
  );
}

export default Header;