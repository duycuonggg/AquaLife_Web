import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from '~/pages/Register/Register'
import Login from '~/pages/Login/Login'
import Admin from '~/pages/Admin/Admin'
import Products from '~/pages/Admin/Products/Products'
import Shop from '~/pages/Shop/Shop'
import ProductDetail from '~/pages/ProductDetail/ProductDetail'
import Employees from '~/pages/Admin/Employees/Employees'
import Cart from '~/pages/Cart/Cart'
import Home from '~/pages/Home/Home'
import Introduce from '~/pages/Introduce/Introduce'
import Contact from '~/pages/Contact/Contact'
import Profile from '~/pages/Profile/Profile'
import CustomerOrders from '~/pages/CustomerOrders/CustomerOrders'
import './App.css'

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
        <Route path="/customer/profile" element={<Profile />} />
        <Route path="/customer/orders" element={<CustomerOrders />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/employees" element={<Employees />} />
      </Routes>
    </BrowserRouter>
  )
}
