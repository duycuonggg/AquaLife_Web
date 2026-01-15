import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GlobalStyles from '@mui/material/GlobalStyles'
import Register from '~/pages/Register/Register'
import Login from '~/pages/Login/Login'
import Admin from '~/pages/Admin/Admin'
import Shop from '~/pages/Shop/Shop'
import ProductDetail from '~/pages/ProductDetail/ProductDetail'
import Cart from '~/pages/Cart/Cart'
import Home from '~/pages/Home/Home'
import Introduce from '~/pages/Introduce/Introduce'
import Contact from '~/pages/Contact/Contact'
import Profile from '~/pages/Profile/Profile'
import CustomerOrders from '~/pages/CustomerOrders/CustomerOrders'
import OrderDetail from '~/pages/OrderDetail/OrderDetail'

export default function App() {
  return (
    <BrowserRouter>
      <GlobalStyles styles={{ '*': { margin: 0, padding: 0, boxSizing: 'border-box' } }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<Shop />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/introduce" element={<Introduce />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/customer/profile" element={<Profile />} />
        <Route path="/customer/orders" element={<CustomerOrders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/products" element={<Admin />} />
        <Route path="/admin/orders" element={<Admin />} />
        <Route path="/admin/customers" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
