import { Route, Router, Routes } from 'react-router-dom';
import HomePage from "./components/home";
import OrderChecker from "./components/orderchecker"
import OrderPage from "./components/order"
import Header from './components/header';
import './App.css';

function App() {
  return (
    <>
      <Header/>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ordersystem" element={<OrderChecker />} />
        <Route path="/order" element={<OrderPage />} />
      </Routes>
    </>
    
  );
}

export default App;