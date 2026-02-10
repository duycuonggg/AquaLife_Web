import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl
} from '@mui/material'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
import { getCart, saveCart, clearCart, updateQty, removeFromCart } from '~/utils/cart'
import {
  createOrderAPI,
  createOrderDetailAPI,
  getMyCartAPI,
  getProductAPI,
  updateCartItemAPI,
  removeCartItemAPI,
  createPaymentAPI
} from '~/apis/index'
import { getUserFromToken } from '~/utils/auth'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function Checkout() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isBackendMode, setIsBackendMode] = useState(false)
  const ignoreNextUpdateRef = useRef(false)

  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerNote, setCustomerNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [customerName, setCustomerName] = useState('')
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()

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

      return cartItems
        .map((item, index) => {
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
        })
        .filter((item) => Boolean(item.id))
    }

    const refreshCart = async () => {
      const payload = getUserFromToken()
      const isCustomer = Boolean(
        payload && !['admin', 'staff', 'manager'].includes(payload.role)
      )

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

        saveCart(
          hydrated.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            qty: item.qty
          }))
        )
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

  const shippingFee = 50000

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

        saveCart(
          updated.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            qty: item.qty
          }))
        )
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

        saveCart(
          updated.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            qty: item.qty
          }))
        )
      } else {
        removeFromCart(id)
      }

      setItems(updated)
    } catch (err) {
      toast.error('Xóa sản phẩm thất bại.')
    }
  }

  const onCheckout = async () => {
    if (isSubmitting) return
    if (items.length === 0) {
      toast.error('Giỏ hàng đang trống')
      return
    }

    if (!customerPhone || customerPhone.trim().length < 7) {
      toast.error('Vui lòng nhập số điện thoại hợp lệ')
      return
    }

    if (!customerAddress || customerAddress.trim().length < 10) {
      toast.error('Vui lòng nhập địa chỉ hợp lệ (tối thiểu 10 ký tự)')
      return
    }

    if (!paymentMethod) {
      toast.error('Vui lòng chọn phương thức thanh toán')
      return
    }

    try {
      setIsSubmitting(true)
      const user = getUserFromToken()

      if (!user || user.role !== 'customer') {
        toast.error('Vui lòng đăng nhập tài khoản khách hàng để đặt hàng')
        return
      }

      const resetCheckoutState = () => {
        ignoreNextUpdateRef.current = true
        clearCart()
        setItems([])
        setCustomerPhone('')
        setCustomerAddress('')
        setCustomerNote('')
        setPaymentMethod('cash')
        setShippingMethod('standard')
      }

      const orderPayload = {
        userId: user.id,
        address: customerAddress.trim(),
        totalPrice: total + shippingFee,
        status: 'Đang đợi',
        note: customerNote?.trim() || undefined
      }

      const created = await createOrderAPI(orderPayload)

      const orderId =
        created?.insertedId ||
        created?._id ||
        created?.id ||
        (created?.ops && created.ops[0]?._id)

      if (!orderId) {
        // eslint-disable-next-line no-console
        console.error('Unexpected createOrder response', created)
        throw new Error('Không lấy được id đơn hàng từ server')
      }

      await Promise.all(
        items.map((it) => {
          const detail = {
            ordersId: orderId,
            productsId: it.id,
            quantity: it.qty,
            price: it.price
          }
          return createOrderDetailAPI(detail)
        })
      )

      await createPaymentAPI({
        orderId,
        method: 'cod',
        status: 'Đã thanh toán',
        paidAt: new Date().toISOString()
      })

      resetCheckoutState()
      toast.success('Thanh toán thành công.')

      try {
        navigate('/products')
      } catch (e) {
        // ignore
      }
    } catch (err) {
      toast.error('Thanh toán thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box sx={{ background: 'linear-gradient(180deg, #f7fbfb, #ffffff)', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Typography variant="h5" sx={{ mb: 10, mt: 10, textAlign: 'center', fontWeight: 700 }}>
          Thanh toán
        </Typography>

        {loading ? (
          <Card sx={{ p: 3 }}>
            <CardContent>
              <Typography>Đang tải giỏ hàng...</Typography>
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card sx={{ p: 3 }}>
            <CardContent>
              <Typography>
                Giỏ hàng trống, bạn hãy ghé qua trang sản phẩm để thêm món hàng yêu thích vào giỏ.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 2, mb: 2 }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, mb: 2 }}>Thông tin khách hàng</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Họ và tên"
                        fullWidth
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Số điện thoại"
                        fullWidth
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Email"
                        fullWidth
                        value={getUserFromToken()?.email || ''}
                        disabled
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Địa chỉ"
                        fullWidth
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        sx={{ mt: 1 }}
                        placeholder="Số nhà, tên đường, phường/xã, tỉnh/thành phố"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Ghi chú"
                        fullWidth
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
                        sx={{ mt: 1 }}
                        placeholder="Ghi chú cho đơn hàng (nếu có)"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card sx={{ p: 2, mb: 2 }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, mb: 2 }}>Phương thức vận chuyển</Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={shippingMethod}
                      onChange={(e) => setShippingMethod(e.target.value)}
                    >
                      <FormControlLabel
                        value="standard"
                        control={<Radio sx={{ color: 'primary.main' }} />}
                        label={<Typography sx={{ color: 'text.primary' }}>Giao hàng tiêu chuẩn — 50.000đ</Typography>}
                      />
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>

              <Card sx={{ p: 2, mb: 2 }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, mb: 2 }}>Phương thức thanh toán</Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <FormControlLabel
                        value="cash"
                        control={<Radio sx={{ color: 'primary.main' }} />}
                        label={<Typography sx={{ color: 'text.primary' }}>Thanh toán khi nhận hàng (COD)</Typography>}
                      />
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>

              <Card sx={{ p: 2, mb: 10 }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, mb: 2 }}>Chi tiết đơn hàng</Typography>
                  <List>
                    {items.map((it) => (
                      <ListItem
                        key={it.id}
                        sx={{ py: 1 }}
                        secondaryAction={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                if (items.length === 1 && total < 50000) {
                                  toast.error('Đơn hàng tối thiểu 50.000đ để thanh toán.')
                                  return
                                }
                                updateItemQty(it.id, -1)
                              }}
                              disabled={it.qty <= 1}
                            >
                              -
                            </Button>
                            <Typography>{it.qty}</Typography>
                            <Button size="small" variant="outlined" onClick={() => updateItemQty(it.id, 1)}>
                              +
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() => {
                                removeItem(it.id)
                              }}
                            >
                              Xóa
                            </Button>
                            <Typography sx={{ fontWeight: 700, minWidth: 80, textAlign: 'right' }}>
                              {((it.price || 0) * (it.qty || 0)).toLocaleString('vi-VN')} đ
                            </Typography>
                          </Box>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar src={it.imageUrl} variant="rounded" />
                        </ListItemAvatar>
                        <ListItemText
                          primary={it.name}
                          secondary={`${it.qty} x ${(Number(it.price) || 0).toLocaleString('vi-VN')} đ`}
                        />
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
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ position: 'sticky', top: 24, p: 2 }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, mb: 2 }}>Tóm tắt đơn hàng</Typography>
                  <List disablePadding>
                    {items.map((it) => (
                      <ListItem key={it.id} sx={{ py: 1 }}>
                        <ListItemText
                          primary={it.name}
                          secondary={`${it.qty} x ${(Number(it.price) || 0).toLocaleString('vi-VN')} đ`}
                        />
                        <Typography sx={{ fontWeight: 700 }}>
                          {((it.price || 0) * (it.qty || 0)).toLocaleString('vi-VN')} đ
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>Tổng cộng</Typography>
                    <Typography sx={{ color: 'primary.main', fontWeight: 700 }}>
                      {(total + shippingFee).toLocaleString('vi-VN')} đ
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={onCheckout}
                    disabled={isSubmitting}
                  >
                    Thanh toán
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      <Footer />
    </Box>
  )
}

