import { useEffect, useState } from 'react'
import { Button, Menu, MenuItem, Badge } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { Link as RouterLink } from 'react-router-dom'
import logo from '~/assets/logo.png'
import '~/styles/Home.css'
import { getProductsAPI } from '~/apis/index'
import { cartCount, getCart } from '~/utils/cart'

export default function Header() {
  const [anchorEl, setAnchorEl] = useState(null)
  const [types, setTypes] = useState([])
  const [count, setCount] = useState(0)

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
    // initialize cart count
    try { setCount(cartCount()) } catch (e) { setCount(0) }
    const onUpdate = (e) => {
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
            aria-controls={anchorEl ? 'prod-menu' : undefined}
            aria-haspopup="true"
            onMouseEnter={handleOpen}
            onMouseLeave={handleClose}
          >
            Sản phẩm
          </Button>
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
          <Button className="nav-link" component={RouterLink} to="/login" variant="text">Đăng nhập</Button>
        </div>
      </div>
    </header>
  )
}
