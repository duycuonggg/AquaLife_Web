import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from '~/pages/Register'
import Login from '~/pages/Login'
import Admin from '~/pages/Admin/Admin'
import Products from '~/pages/Products'
import Shop from '~/pages/Shop'
import ProductDetail from '~/pages/ProductDetail'
import Employees from '~/pages/Employees'
import Cart from '~/pages/Cart'
import Home from '~/pages/Home'
import Introduce from '~/pages/Introduce/Introduce'
import Contact from '~/pages/Contact/Contact'
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
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/introduce" element={<Introduce />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/employees" element={<Employees />} />
      </Routes>
    </BrowserRouter>
  )
}
