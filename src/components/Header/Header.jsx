import { useEffect, useState } from 'react'
import { Menu, MenuItem, Button, Badge, IconButton, Avatar, Divider, ListItemIcon, Box } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import logo from '~/assets/logo.png'
import { cartCount } from '~/utils/cart'
import { getUserFromToken } from '~/utils/auth'
import user from '~/assets/user.png'
import order from '~/assets/order.png'
import checkout from '~/assets/checkout.png'

export default function Header() {
  // Trạng thái giỏ hàng và thông tin người dùng
  const [count, setCount] = useState(0)
  const [userAnchor, setUserAnchor] = useState(null)
  const [customerAvatar, setCustomerAvatar] = useState('')
  const [currentUserName, setCurrentUserName] = useState('')
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Đồng bộ trạng thái đăng nhập khi token thay đổi
    const refreshAuthState = () => {
      try {
        const payload = getUserFromToken()
        const isCustomer = Boolean(payload && !['admin', 'staff', 'manager'].includes(payload.role))
        if (!isCustomer) {
          setIsCustomerLoggedIn(false)
          setCustomerAvatar('')
          setCurrentUserName('')
          setCount(0)
          return
        }

        setIsCustomerLoggedIn(true)
        // Lấy avatar/tên đã lưu từ localStorage khi đăng nhập
        try {
          const storedImage = localStorage.getItem('auth_user_image')
          const storedName = localStorage.getItem('auth_user_name')
          setCustomerAvatar(storedImage || '')
          setCurrentUserName(storedName || '')
        } catch (err) {
          // Bỏ qua lỗi localStorage
        }
      } catch (err) {
        setIsCustomerLoggedIn(false)
        setCustomerAvatar('')
        setCurrentUserName('')
        setCount(0)
      }
    }

    refreshAuthState()
    window.addEventListener('storage', refreshAuthState)
    return () => window.removeEventListener('storage', refreshAuthState)
  }, [])

  // Mở/đóng menu tài khoản
  const handleOpenUser = (e) => setUserAnchor(e.currentTarget)
  const handleCloseUser = () => setUserAnchor(null)

  useEffect(() => {
    // Cập nhật số lượng giỏ hàng khi có thay đổi
    const updateCount = () => {
      if (!isCustomerLoggedIn) {
        setCount(0)
        return
      }
      try { setCount(cartCount()) } catch (err) { setCount(0) }
    }

    updateCount()
    window.addEventListener('cartUpdated', updateCount)
    window.addEventListener('storage', updateCount)
    return () => {
      window.removeEventListener('cartUpdated', updateCount)
      window.removeEventListener('storage', updateCount)
    }
  }, [isCustomerLoggedIn])

  const handleLogout = () => {
    // Xóa thông tin đăng nhập và quay về trang chủ
    handleCloseUser()
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user_image')
    localStorage.removeItem('auth_user_name')
    setIsCustomerLoggedIn(false)
    setCustomerAvatar('')
    setCurrentUserName('')
    setCount(0)
    navigate('/', { replace: true })
  }

  return (
    <Box sx={{
      padding: '12px 0',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      position: 'sticky',
      top: 0,
      background: 'linear-gradient(180deg, #dbe8e8, #ffffff)',
      zIndex: 1300
    }}>
      <Box sx={{
        maxWidth: 1100,
        margin: '0 auto',
        px: 1.5, display:
          'flex', alignItems:
          'center', justifyContent:
          'space-between'
      }}>
        {/* Tiêu đề, logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component={RouterLink} to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none'
            }}>
            <Box component="img" src={logo} alt="AquaLife" sx={{ width: 44, height: 44 }} />
            <Box sx={{ color: '#0b8798', fontWeight: 700 }}>AquaLife</Box>
          </Box>
        </Box>

        {/* Thanh điều hướng */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2
        }}>
          <Button
            component={RouterLink} to="/"
            sx={{
              color: '#000',
              textTransform: 'none',
              fontWeight: 500, '&:hover': { color: '#0b8798' }
            }}>
            Trang chủ
          </Button>
          <Button
            component={RouterLink} to="/products"
            sx={{
              color: '#000',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': { color: '#0b8798' }
            }}>
            Sản phẩm
          </Button>

          <Button
            component={RouterLink} to="/introduce"
            sx={{
              color: '#000',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': { color: '#0b8798' }
            }}>
            Giới thiệu
          </Button>
          <Button
            component={RouterLink} to="/contact"
            sx={{
              color: '#000',
              textTransform: 'none',
              fontWeight: 500, '&:hover': { color: '#0b8798' }
            }}>
            Liên hệ
          </Button>
        </Box>

        {/* Giỏ hàng và tài khoản */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isCustomerLoggedIn && (
            <Button component={RouterLink} to="/cart" variant="text" aria-label="cart">
              <Badge badgeContent={count} color="warning">
                <ShoppingCartIcon sx={{ color: count > 0 ? '#f1c40f' : '#e67e22' }} />
              </Badge>
            </Button>
          )}
          {/* Đã đăng nhập: hiện avatar + menu; chưa đăng nhập: hiện đăng ký */}
          {isCustomerLoggedIn ? (
            <>
              <IconButton onClick={handleOpenUser} size="small" sx={{ ml: 1 }} aria-label="account">
                <Avatar src={customerAvatar} alt={currentUserName || 'Khách hàng'}>{(!customerAvatar && currentUserName) ? currentUserName[0] : ''}</Avatar>
              </IconButton>
              <Menu
                id="user-menu"
                anchorEl={userAnchor}
                open={Boolean(userAnchor)}
                onClose={handleCloseUser}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              >
                <MenuItem onClick={() => { handleCloseUser(); navigate('/customer/profile') }}>
                  <ListItemIcon>
                    <img src={user} alt="User" style={{ width: 20, height: 20 }} />
                  </ListItemIcon>
                  Hồ sơ
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleCloseUser(); navigate('/customer/orders') }}>
                  <ListItemIcon>
                    <img src={order} alt="Orders" style={{ width: 20, height: 20 }} />
                  </ListItemIcon>
                  Đơn hàng
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <img src={checkout} alt="Logout" style={{ width: 20, height: 20 }} />
                  </ListItemIcon>
                  Đăng xuất
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              component={RouterLink}
              to="/RegisterAndLogin"
              variant="text"
              sx={{
                color: '#0b8798',
                textTransform: 'none',
                fontWeight: 700
              }}>
              Đăng ký ngay <span style={{ color: 'red', marginLeft: 4 }}>&#9829;</span>
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  )
}
