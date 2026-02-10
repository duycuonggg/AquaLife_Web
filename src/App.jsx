import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GlobalStyles from '@mui/material/GlobalStyles'
import RegisterAndLogin from '~/pages/RegisterAndLogin/RegisterAndLogin'
import Admin from '~/pages/Admin/Admin'
import Shop from '~/pages/Shop/Shop'
import ProductDetail from '~/pages/ProductDetail/ProductDetail'
import Cart from '~/pages/Cart/Cart'
import Checkout from '~/pages/Checkout/Checkout'
import Home from '~/pages/Home/Home'
import Introduce from '~/pages/Introduce/Introduce'
import Contact from '~/pages/Contact/Contact'
import Profile from '~/pages/Profile/Profile'
import Orders from '~/pages/Orders/Orders'
import OrderDetail from '~/pages/OrderDetail/OrderDetail'

export default function App() {
  return (
    <BrowserRouter>
      <GlobalStyles styles={{ '*': { margin: 0, padding: 0, boxSizing: 'border-box' } }} />
      <Routes>
        {/* Định tuyến chính cho khách hàng */}
        <Route path="/" element={<Home />} />
        <Route path="/RegisterAndLogin" element={<RegisterAndLogin />} />
        <Route path="/products" element={<Shop />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/introduce" element={<Introduce />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/customer/profile" element={<Profile />} />
        <Route path="/customer/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        {/* Khu vực quản trị */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/products" element={<Admin />} />
        <Route path="/admin/orders" element={<Admin />} />
        <Route path="/admin/customers" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
