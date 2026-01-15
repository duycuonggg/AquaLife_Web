import { useEffect, useState } from 'react'
import { Box, AppBar, Toolbar, Typography, Button, Tabs, Tab } from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { useLocation } from 'react-router-dom'
import logo from '~/assets/logo.png'
import Products from '~/pages/Admin/Products/Products'
import Customers from '~/pages/Admin/Customers/Customers'
import AdminOrders from '~/pages/Admin/AdminOrders/AdminOrders.jsx'
import checkout from '~/assets/checkout.png'
import Dashboard from '~/pages/Admin/Dashboard/Dashboard'
import { useNavigate } from 'react-router-dom'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'

export default function Admin() {
  const [section, setSection] = useState('dashboard')
  const [tabIndex, setTabIndex] = useState(0)
  const navigate = useNavigate()

  const location = useLocation()

  // initialize section / tab based on current URL so deep links work
  useEffect(() => {
    const path = (location.pathname || '').toLowerCase()
    if (path.includes('/admin/products')) {
      setSection('products')
      setTabIndex(1)
    } else if (path.includes('/admin/orders')) {
      setSection('orders')
      setTabIndex(2)
    } else if (path.includes('/admin/customers')) {
      setSection('customers')
      setTabIndex(3)
    } else {
      setSection('dashboard')
      setTabIndex(0)
    }
  }, [location.pathname])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: 1300, background: 'linear-gradient(180deg, #dbe8e8, #ffffff)' }}>
        <Toolbar>
          <Box component="img" src={logo} alt="AquaLife Logo" sx={{ width: 44, height: 44 }} />
          <Typography sx={{ fontWeight: 700, color: '#0b8798', ml: 1 }}>AquaLife</Typography>
          <Box sx={{ flex: 1 }} />
          <Button
            startIcon={<img src={checkout} alt="Checkout" style={{ width: 24, height: 24 }} />}
            onClick={() => {
              try {
                localStorage.removeItem('auth_token')
              } catch (e) {
                /* ignore */
              }
              navigate('/login', { replace: true })
            }}
          >
            Đăng xuất
          </Button>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flex: 1, p: 3, mt: '64px', background: 'linear-gradient(180deg, #f7fbfb, #ffffff)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabIndex}
            onChange={(e, v) => {
              setTabIndex(v)
              const mapping = ['dashboard', 'products', 'orders', 'employees', 'customers']
              const paths = ['/admin', '/admin/products', '/admin/orders', '/admin/employees', '/admin/customers']
              const next = mapping[v] || 'dashboard'
              setSection(next)
              try {
                navigate(paths[v] || '/admin', { replace: true })
              } catch (err) {
                /* ignore navigation errors */
              }
            }}
            aria-label="Admin sections"
          >
            <Tab icon={<DashboardIcon />} label="Tổng quan" />
            <Tab icon={<InventoryIcon />} label="Sản phẩm" />
            <Tab icon={<ReceiptLongIcon />} label="Đơn hàng" />
            <Tab icon={<PersonIcon />} label="Khách hàng" />
          </Tabs>
        </Box>

        {section === 'dashboard' && (
          <Box>
            <Dashboard />
          </Box>
        )}

        {section === 'products' && (
          <Box>
            <Products />
          </Box>
        )}

        {section === 'orders' && (
          <Box>
            <AdminOrders />
          </Box>
        )}

        {section === 'customers' && (
          <Box>
            <Box>
              <Customers />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
