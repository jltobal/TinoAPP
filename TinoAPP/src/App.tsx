import { Route, Routes } from 'react-router-dom';
import HomePage from "./components/home";
import OrderChecker from "./components/orderchecker";
import OrderPage from "./components/order";
import Header from './components/header';
import ListOrders from "./components/listorders";

import './App.css';

function App() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#121212]">
      <Header />
      
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ordersystem" element={<OrderChecker />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/list" element={<ListOrders />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;