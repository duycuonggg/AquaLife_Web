import { useEffect, useState } from 'react'
import { Menu, MenuItem, Button, Badge, IconButton, Avatar, Divider, ListItemIcon, Box } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { Link as RouterLink } from 'react-router-dom'
import logo from '~/assets/logo.png'
import { getBranchesAPI, getCustomerAPI, getProductsAPI } from '~/apis/index'
import { cartCount } from '~/utils/cart'
import { getUserFromToken } from '~/utils/auth'
import { useNavigate } from 'react-router-dom'
import user from '~/assets/user.png'
import order from '~/assets/order.png'
import checkout from '~/assets/checkout.png'

export default function Header() {
  const [anchorEl, setAnchorEl] = useState(null)
  const [types, setTypes] = useState([])
  const [branches, setBranches] = useState([])
  const [selectedBranchName, setSelectedBranchName] = useState('')
  const [branchAnchor, setBranchAnchor] = useState(null)
  const [count, setCount] = useState(0)
  const [userAnchor, setUserAnchor] = useState(null)
  const [customerAvatar, setCustomerAvatar] = useState('')
  const [currentUserName, setCurrentUserName] = useState('')
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    const loadTypes = async () => {
      try {
        const prods = await getProductsAPI()
        if (!mounted) return
        const uniq = [...new Set((prods || []).map(p => p.type).filter(Boolean))]
        setTypes(uniq)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load product types', err)
      }
    }
    loadTypes()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    const loadBranches = async () => {
      try {
        const b = await getBranchesAPI()
        if (!mounted) return
        setBranches(Array.isArray(b) ? b : [])
        try {
          const storedName = localStorage.getItem('selectedBranchName')
          const storedId = localStorage.getItem('selectedBranch')
          if (storedName) {
            setSelectedBranchName(storedName)
          } else if (storedId) {
            const found = (Array.isArray(b) ? b : []).find(x => String(x._id || x.id) === String(storedId))
            if (found) setSelectedBranchName(found.name || '')
          }
        } catch (e) {
          /* ignore storage errors */
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load branches', err)
      }
    }
    loadBranches()
    // listen to branchSelected events from other parts of the app
    const onBranchSelected = (ev) => {
      try {
        const name = ev?.detail?.name || ''
        if (name) {
          setSelectedBranchName(name)
          try { localStorage.setItem('selectedBranchName', name) } catch (e) { /* ignore */ }
        }
      } catch (err) { /* ignore */ }
    }
    window.addEventListener('branchSelected', onBranchSelected)
    return () => { mounted = false; window.removeEventListener('branchSelected', onBranchSelected) }
  }, [])

  useEffect(() => {
    // initialize cart count
    try { setCount(cartCount()) } catch (e) { setCount(0) }
    const onUpdate = () => {
      try { setCount(cartCount()) } catch (err) { setCount(0) }
    }
    window.addEventListener('cartUpdated', onUpdate)
    window.addEventListener('storage', onUpdate)
    return () => {
      window.removeEventListener('cartUpdated', onUpdate)
      window.removeEventListener('storage', onUpdate)
    }
  }, [])

  const handleOpen = (e) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const handleOpenUser = (e) => setUserAnchor(e.currentTarget)
  const handleCloseUser = () => setUserAnchor(null)
  const handleOpenBranches = (e) => setBranchAnchor(e.currentTarget)
  const handleCloseBranches = () => setBranchAnchor(null)

  const onSelectBranch = (b) => {
    const id = b?._id || b?.id || ''
    try {
      if (id) localStorage.setItem('selectedBranch', id)
      else localStorage.removeItem('selectedBranch')
      try {
        if (b && b.name) localStorage.setItem('selectedBranchName', b.name)
        setSelectedBranchName(b?.name || '')
      } catch (e) { /* ignore */ }
    } catch (err) {
      // ignore storage errors
    }
    try {
      window.dispatchEvent(new CustomEvent('branchSelected', { detail: { id, name: b?.name || '' } }))
    } catch (err) {
      // ignore
    }
    handleCloseBranches()
  }


  useEffect(() => {
    let mounted = true
    try {
      const payload = getUserFromToken()
      if (!payload || payload.role === 'admin' || payload.role === 'staff' || payload.role === 'manager') return
      setIsCustomerLoggedIn(true)
      const uid = payload.id
      // Prefer stored image/name from login flow to avoid fetching full customers list
      try {
        const storedImage = localStorage.getItem('auth_user_image')
        const storedName = localStorage.getItem('auth_user_name')
        if (storedImage || storedName) {
          if (storedImage) setCustomerAvatar(storedImage)
          if (storedName) setCurrentUserName(storedName)
          return
        }
      } catch (err) {
        // ignore storage errors
      }

      // fallback: fetch single customer by id
      (async () => {
        try {
          const me = await getCustomerAPI(uid)
          if (!mounted) return
          if (me) {
            setCustomerAvatar(me.image || '')
            setCurrentUserName(me.name || '')
          }
        } catch (err) {
          // ignore
        }
      })()
    } catch (err) {
      // ignore
    }
    return () => { mounted = false }
  }, [])

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
        {/* title, logo */}
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

        {/* navigation links */}
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
          <Button sx={{
            color: '#000',
            textTransform: 'none',
            fontWeight: 500, '&:hover': { color: '#0b8798' }
          }}
          aria-controls={branchAnchor ? 'branch-menu' : undefined}
          aria-haspopup="true"
          onClick={handleOpenBranches}>
            {selectedBranchName || 'Chi nhánh'}
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
          <Menu
            id="branch-menu"
            anchorEl={branchAnchor}
            open={Boolean(branchAnchor)}
            onClose={handleCloseBranches}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            {branches.map((b) => (
              <MenuItem key={b._id || b.id} onClick={() => onSelectBranch(b)}>{b.name || (`Chi nhánh ${b._id || b.id}`)}</MenuItem>
            ))}
          </Menu>
          <Menu
            id="prod-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            MenuListProps={{ onMouseEnter: handleOpen, onMouseLeave: handleClose }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            {types.length === 0 ? (
              <MenuItem component={RouterLink} to="/products">Tất cả</MenuItem>
            ) : (
              types.map((t) => (
                <MenuItem key={t} component={RouterLink} to={`/products?type=${encodeURIComponent(t)}`} onClick={handleClose}>{t}</MenuItem>
              ))
            )}
          </Menu>

          <Button
            component={RouterLink} to="/Introduce"
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

        {/* cart and user */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button component={RouterLink} to="/cart" variant="text" aria-label="cart">
            <Badge badgeContent={count} color="warning">
              <ShoppingCartIcon sx={{ color: count > 0 ? '#f1c40f' : '#e67e22' }} />
            </Badge>
          </Button>
          {/* If customer logged in show avatar with menu, otherwise show login link */}
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
                <MenuItem onClick={() => { handleCloseUser(); localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user_image'); localStorage.removeItem('auth_user_name'); navigate('/', { replace: true }) }}>
                  <ListItemIcon>
                    <img src={checkout} alt="Logout" style={{ width: 20, height: 20 }} />
                  </ListItemIcon>
                  Thoát
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              variant="text"
              sx={{
                color: '#000',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': { color: '#0b8798' }
              }}>
              Đăng nhập
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  )
}
