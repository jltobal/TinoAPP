import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/PNG/TinoAPP_Logo_PNG_800px_Gris.png';

const Header = () => {
  return (
    <header className="bg-[#1a1a1a] border-b border-gray-800 p-4 flex justify-between items-center">
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        <img 
          src={logo} 
          alt="Tomi's Food Truck Logo" 
          className="h-10 w-auto"
        />
        <span className="ml-3 text-white font-black tracking-tighter uppercase hidden md:block">
          Tomi's <span className="text-orange-600">Food Truck</span>
        </span>
      </Link>

      <nav className="flex gap-4">
        <Link 
          to="/ordersystem" 
          className="px-4 py-2 bg-orange-700 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors"
        >
          Crear Orden
        </Link>

        <Link 
          to="/list" 
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors border border-gray-700"
        >
          Ver Órdenes
        </Link>
      </nav>
    </header>
  );
};

export default Header;