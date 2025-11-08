import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from '~/pages/Register'
import Login from '~/pages/Login'
import '~/styles/App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}
