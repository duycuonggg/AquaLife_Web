import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from '~/pages/Register'
import Login from '~/pages/Login'
import Admin from '~/pages/Admin'
import Products from '~/pages/Products'
import Shop from '~/pages/Shop'
import Employees from '~/pages/Employees'
import Home from '~/pages/Home'
import '~/styles/App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
  <Route path="/products" element={<Shop />} />
  <Route path="/admin/products" element={<Products />} />
        <Route path="/employees" element={<Employees />} />
      </Routes>
    </BrowserRouter>
  )
}
