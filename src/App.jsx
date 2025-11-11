import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from '~/pages/Register'
import Login from '~/pages/Login'
import Admin from '~/pages/Admin'
import Products from '~/pages/Products'
import Employees from '~/pages/Employees'
import '~/styles/App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/products" element={<Products />} />
        <Route path="/employees" element={<Employees />} />
      </Routes>
    </BrowserRouter>
  )
}
