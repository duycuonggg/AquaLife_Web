import { useEffect, useState } from 'react'
import { Button, Menu, MenuItem, Badge, Avatar, IconButton, Divider, ListItemIcon } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { Link as RouterLink } from 'react-router-dom'
import logo from '~/assets/logo.png'
import '~/styles/Home.css'
import { getProductsAPI } from '~/apis/index'
import { getBranchesAPI, getCustomerAPI } from '~/apis/index'
import { cartCount } from '~/utils/cart'
import { getUserFromToken } from '~/utils/auth'
import { useNavigate } from 'react-router-dom'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import AllInboxIcon from '@mui/icons-material/AllInbox'

export default function Header() {
  const [anchorEl, setAnchorEl] = useState(null)
  const [types, setTypes] = useState([])
  const [branches, setBranches] = useState([])
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
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load branches', err)
      }
    }
    loadBranches()
    return () => { mounted = false }
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
      // persist selection so other pages (and future loads) use it
      if (id) localStorage.setItem('selectedBranch', id)
      else localStorage.removeItem('selectedBranch')
    } catch (err) {
      // ignore storage errors
    }
    try {
      window.dispatchEvent(new CustomEvent('branchSelected', { detail: { id, name: b?.name || '' } }))
    } catch (err) {
      // ignore
    }
    // do not force navigation away; allow user to stay on current page
    handleCloseBranches()
  }

  useEffect(() => {
    let mounted = true
    try {
      const payload = getUserFromToken()
      if (!payload || payload.role !== 'customer') return
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
    <header className="home-nav">
      <div className="container">
        <div className="right">
          <div className="brand">
            <img src={logo} alt="AquaLife" />
            <span className="brand-title">AquaLife</span>
          </div>
        </div>

        <nav className="center" aria-label="main navigation">
          <Button component={RouterLink} to="/" className="nav-link">Trang chủ</Button>
          <Button
            component={RouterLink}
            to="/products"
            className="nav-link"
          >
            Sản phẩm
          </Button>
          <Button className="nav-link" aria-controls={branchAnchor ? 'branch-menu' : undefined} aria-haspopup="true" onClick={handleOpenBranches}>
            Chi nhánh
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

          <Button component={RouterLink} to="/about" className="nav-link">Giới thiệu</Button>
          <Button component={RouterLink} to="/contact" className="nav-link">Liên hệ</Button>
        </nav>

        <div className="left">
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
                    <PersonIcon fontSize='small' />
                  </ListItemIcon>
                  Hồ sơ
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleCloseUser(); navigate('/customer/orders') }}>
                  <ListItemIcon>
                    <AllInboxIcon fontSize='small' />
                  </ListItemIcon>
                  Đơn hàng
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleCloseUser(); localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user_image'); localStorage.removeItem('auth_user_name'); navigate('/', { replace: true }) }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize='small' />
                  </ListItemIcon>
                  Thoát
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button className="nav-link" component={RouterLink} to="/login" variant="text">Đăng nhập</Button>
          )}
        </div>
      </div>
    </header >
  )
}
