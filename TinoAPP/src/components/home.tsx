import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [isClicked, setIsClicked] = useState(false);
  const buttonBase = "bg-[#f97316]";
  const buttonActive = "bg-[#f59e0b]";
  const navigate = useNavigate();

  const handleIngresar = () => {
    setIsClicked(true);
    setTimeout(() => {
      navigate('/ordersystem');
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
    
      <div className="w-full flex justify-center mb-16">
        <img
          src="./src/assets/JPG/Logo_Color_800px_JPG.jpg"
          alt="Tomi's Food Truck Logo"
          className="w-[60%] max-w-[300px] h-auto object-contain"
        />
      </div>

      <button
        onClick={handleIngresar}
        className={`
          ${isClicked ? buttonActive : buttonBase} 
          text-white 
          text-2xl 
          font-black 
          py-5 
          px-16 
          rounded-xl 
          uppercase 
          tracking-[0.2em] 
          shadow-[0_20px_50px_rgba(0,0,0,0.3)]
          transition-all 
          duration-300 
          hover:brightness-110 
          active:scale-95
          w-full
          max-w-[350px]
        `}
      >
        Ingresar
      </button>

    </div>
  );
}

export default HomePage;