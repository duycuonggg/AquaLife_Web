import { useEffect, useRef, useState } from 'react'
import { Box, Typography, Grid, Card, CardContent, Button, Divider, List, ListItem, ListItemAvatar, ListItemText, Avatar } from '@mui/material'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
import { getCart, saveCart, updateQty, removeFromCart } from '~/utils/cart'
import { getMyCartAPI, getProductAPI, updateCartItemAPI, removeCartItemAPI } from '~/apis/index'
import { getUserFromToken } from '~/utils/auth'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function Cart() {
  const MIN_ORDER_TOTAL = 100000
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isBackendMode, setIsBackendMode] = useState(false)
  const ignoreNextUpdateRef = useRef(false)

  useEffect(() => {
    let active = true

    const normalizeProduct = (product) => ({
      name: product?.name || product?.product_name || '',
      price: Number(product?.price) || 0,
      imageUrl: product?.imageUrl || product?.image_url || ''
    })

    const hydrateBackendItems = async (cartItems) => {
      const productIds = cartItems
        .map((item) => item?.productId?._id || item?.productId)
        .filter(Boolean)

      const products = await Promise.all(
        productIds.map((id) => getProductAPI(id).catch(() => null))
      )

      return cartItems.map((item, index) => {
        const product = products[index]
        const productId = item?.productId?._id || item?.productId
        const info = normalizeProduct(product)

        return {
          id: productId,
          itemId: item?._id,
          name: info.name || item?.productName || 'Sản phẩm',
          price: info.price,
          imageUrl: info.imageUrl,
          qty: item?.quantity || 1
        }
      }).filter((item) => Boolean(item.id))
    }

    const refreshCart = async () => {
      const payload = getUserFromToken()
      const isCustomer = Boolean(payload && !['admin', 'staff', 'manager'].includes(payload.role))

      if (!isCustomer) {
        setIsBackendMode(false)
        setItems(getCart())
        setLoading(false)
        return
      }

      setIsBackendMode(true)
      setLoading(true)

      try {
        const cart = await getMyCartAPI()
        const cartItems = cart?.items || []
        const hydrated = await hydrateBackendItems(cartItems)
        if (!active) return

        setItems(hydrated)
        ignoreNextUpdateRef.current = true
        saveCart(hydrated.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          qty: item.qty
        })))
      } catch (err) {
        if (!active) return
        setItems(getCart())
      } finally {
        if (active) setLoading(false)
      }
    }

    refreshCart()
    const onUpdate = () => {
      if (ignoreNextUpdateRef.current) {
        ignoreNextUpdateRef.current = false
        return
      }
      refreshCart()
    }
    window.addEventListener('cartUpdated', onUpdate)
    window.addEventListener('storage', onUpdate)
    return () => {
      active = false
      window.removeEventListener('cartUpdated', onUpdate)
      window.removeEventListener('storage', onUpdate)
    }
  }, [])

  const total = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0)
  useEffect(() => {
    if (total < MIN_ORDER_TOTAL && items.length > 0) {
      toast.error('Đơn hàng tối thiểu 100.000đ để thanh toán.')
    }
  }, [items.length, total])

  const navigate = useNavigate()
  const goToCheckout = () => navigate('/checkout')

  return (
    <Box sx={{ background: 'linear-gradient(180deg, #f7fbfb, #ffffff)', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, mb: 23.5 }}>
        <Typography variant="h5" sx={{ mb: 10, mt: 10, fontWeight: 700, textAlign: 'center' }}>Giỏ hàng</Typography>

        {loading ? (
          <Card sx={{ p: 3 }}>
            <CardContent>
              <Typography>Đang tải giỏ hàng...</Typography>
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card sx={{ p: 3 }}>
            <CardContent>
              <Typography>Giỏ hàng trống, bạn hãy ghé qua trang sản phẩm để thêm món hàng yêu thích vào giỏ.</Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <CartItemsInline
                items={items}
                setItems={setItems}
                total={total}
                isBackendMode={isBackendMode}
                ignoreNextUpdateRef={ignoreNextUpdateRef}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <CartCheckoutInline
                items={items}
                total={total}
                shippingFee={0}
                discount={0}
                promoInfo={null}
                onCheckout={goToCheckout}
                minOrderTotal={MIN_ORDER_TOTAL}
                actionLabel="Tiến hành thanh toán"
              />
            </Grid>
          </Grid>
        )}
      </Box>
      <Footer />
    </Box>
  )
}

function CartItemsInline({ items, setItems, total, isBackendMode, ignoreNextUpdateRef }) {
  const updateItemQty = async (id, delta) => {
    const updated = items.map((it) =>
      it.id === id ? { ...it, qty: Math.max(1, (it.qty || 1) + delta) } : it
    )
    const target = updated.find((it) => it.id === id)
    if (!target) return

    try {
      if (isBackendMode && target.itemId) {
        await updateCartItemAPI(target.itemId, { quantity: target.qty })
        ignoreNextUpdateRef.current = true
        saveCart(updated.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          qty: item.qty
        })))
      } else {
        updateQty(id, target.qty)
      }
      setItems(updated)
    } catch (err) {
      toast.error('Cập nhật số lượng thất bại.')
    }
  }

  const removeItem = async (id) => {
    const updated = items.filter((it) => it.id !== id)

    const target = items.find((it) => it.id === id)

    try {
      if (isBackendMode && target?.itemId) {
        await removeCartItemAPI(target.itemId)
        ignoreNextUpdateRef.current = true
        saveCart(updated.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          qty: item.qty
        })))
      } else {
        removeFromCart(id)
      }
      setItems(updated)
    } catch (err) {
      toast.error('Xóa sản phẩm thất bại.')
    }
  }

  return (
    <Card sx={{ p: 2, mb: 10 }}>
      <CardContent>
        <Typography sx={{ fontWeight: 700, mb: 2 }}>Chi tiết đơn hàng</Typography>
        <List>
          {items.map((it) => (
            <ListItem key={it.id} sx={{ py: 1 }}
              secondaryAction={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => updateItemQty(it.id, -1)} disabled={it.qty <= 1}>-</Button>
                  <Typography>{it.qty}</Typography>
                  <Button size="small" variant="outlined" onClick={() => updateItemQty(it.id, 1)}>+</Button>
                  <Button size="small" color="error" variant="outlined" onClick={() => removeItem(it.id)}>Xóa</Button>
                  <Typography sx={{ fontWeight: 700, minWidth: 80, textAlign: 'right' }}>{((it.price || 0) * (it.qty || 0)).toLocaleString('vi-VN')} đ</Typography>
                </Box>
              }
            >
              <ListItemAvatar>
                <Avatar src={it.imageUrl} variant="rounded" />
              </ListItemAvatar>
              <ListItemText primary={it.name} secondary={`${it.qty} x ${(Number(it.price) || 0).toLocaleString('vi-VN')} đ`} />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography>Tạm tính</Typography>
          <Typography sx={{ fontWeight: 700 }}>{total.toLocaleString('vi-VN')} đ</Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

function CartCheckoutInline({ items, total, shippingFee, discount, promoInfo, onCheckout, minOrderTotal, actionLabel = 'Thanh toán' }) {
  return (
    <Card sx={{ position: 'sticky', top: 24, p: 2 }}>
      <CardContent>
        <Typography sx={{ fontWeight: 700, mb: 2 }}>Tóm tắt đơn hàng</Typography>
        <List disablePadding>
          {items.map((it) => (
            <ListItem key={it.id} sx={{ py: 1 }}>
              <ListItemText primary={it.name} secondary={`${it.qty} x ${(Number(it.price) || 0).toLocaleString('vi-VN')} đ`} />
              <Typography sx={{ fontWeight: 700 }}>{((it.price || 0) * (it.qty || 0)).toLocaleString('vi-VN')} đ</Typography>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        {discount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ color: 'green', fontWeight: 700 }}>Khuyến mãi ({promoInfo?.code || ''})</Typography>
            <Typography sx={{ color: 'green', fontWeight: 700 }}>- {discount.toLocaleString('vi-VN')} đ</Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography sx={{ fontWeight: 700 }}>Tổng cộng</Typography>
          <Typography sx={{ color: 'primary.main', fontWeight: 700 }}>{(total + shippingFee - discount).toLocaleString('vi-VN')} đ</Typography>
        </Box>
        {total >= minOrderTotal && (
          <Button variant="contained" color="primary" fullWidth onClick={onCheckout}>{actionLabel}</Button>
        )}
      </CardContent>
    </Card>
  )
}
