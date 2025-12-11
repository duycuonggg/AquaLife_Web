import { useEffect, useState } from 'react'
import { Box, Typography, Grid, Card, CardContent, Button, TextField, Radio, RadioGroup, FormControlLabel, FormControl, Divider, List, ListItem, ListItemAvatar, ListItemText, Avatar, Autocomplete } from '@mui/material'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
import { getCart, clearCart, saveCart } from '~/utils/cart'
import { createOrderAPI, createOrderDetailAPI, validatePromoAPI, getPromosAPI } from '~/apis/index'
import { getUserFromToken } from '~/utils/auth'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function Cart() {
  const [items, setItems] = useState([])
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerNote, setCustomerNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [customerName, setCustomerName] = useState('')
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoInfo, setPromoInfo] = useState(null)
  const [promos, setPromos] = useState([])

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Vui lòng nhập mã khuyến mại')
      return
    }
    const totalWithShip = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0) + (shippingMethod === 'express' ? 50000 : 30000)
    try {
      const res = await validatePromoAPI(promoCode, totalWithShip)
      setDiscount(res.discount || 0)
      setPromoInfo(res)
      toast.success(res.desc || 'Áp dụng mã thành công!')
    } catch (err) {
      setDiscount(0)
      setPromoInfo(null)
      toast.error(err?.response?.data?.error || 'Mã khuyến mại không hợp lệ!')
    }
  }

  useEffect(() => {
    setItems(getCart())
    const onUpdate = () => setItems(getCart())
    window.addEventListener('cartUpdated', onUpdate)
    window.addEventListener('storage', onUpdate)
    return () => {
      window.removeEventListener('cartUpdated', onUpdate)
      window.removeEventListener('storage', onUpdate)
    }
  }, [])

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await getPromosAPI()
        if (Array.isArray(res)) setPromos(res)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load promos', err)
      }
    }
    fetchPromos()
  }, [])

  const total = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0)
  if (total < 50000 && items.length > 0) {
    toast.error('Đơn hàng tối thiểu 50.000đ để thanh toán.')
  }
  // Remove this toast on every render, only show on action
  // Update cart item quantity with minimum order check
  const updateItemQty = (id, delta) => {
    setItems((prev) => {
      const updated = prev.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, (it.qty || 1) + delta) } : it
      )
      const newTotal = updated.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0)
      // Only block and show error if decreasing and new total < 50k AND previous total >= 50000
      const prevTotal = prev.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0)
      if (delta < 0 && prevTotal >= 50000 && newTotal < 50000) {
        toast.error('Đơn hàng tối thiểu 50.000đ để thanh toán.')
        return prev
      }
      saveCart(updated)
      return updated
    })
  }

  // Remove item from cart with minimum order check
  const removeItem = (id) => {
    setItems((prev) => {
      const updated = prev.filter((it) => it.id !== id)
      const newTotal = updated.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0)
      if (updated.length > 0 && newTotal < 50000) {
        toast.error('Đơn hàng tối thiểu 50.000đ để thanh toán.')
        return prev
      }
      saveCart(updated)
      return updated
    })
  }
  const shippingFee = shippingMethod === 'express' ? 50000 : 30000

  const navigate = useNavigate()

  const onCheckout = async () => {
    if (items.length === 0) return alert('Giỏ hàng đang trống')
    if (!customerPhone || customerPhone.trim().length < 7) return alert('Vui lòng nhập số điện thoại hợp lệ')
    if (!paymentMethod) return alert('Vui lòng chọn phương thức thanh toán')
    // Persist order to backend
    try {
      const user = getUserFromToken()
      if (!user || user.role !== 'customer') {
        return alert('Vui lòng đăng nhập tài khoản khách hàng để đặt hàng')
      }

      const branchId = localStorage.getItem('selectedBranch') || ''
      if (!branchId) return alert('Vui lòng chọn chi nhánh trước khi đặt hàng')

      const orderPayload = {
        customersId: user.id,
        branchesId: branchId,
        totalPrice: total + shippingFee,
        shippingFee,
        shippingMethod,
        status: 'Đang chờ',
        orderDate: new Date().toISOString(),
        deliveryAddress: customerAddress || '',
        note: customerNote || ''
      }

      const created = await createOrderAPI(orderPayload)

      // determine created order id (server may return insertedId or created doc)
      const orderId = created?.insertedId || created?._id || created?.id || (created && created?.ops && created.ops[0]?._id)
      if (!orderId) {
        // eslint-disable-next-line no-console
        console.error('Unexpected createOrder response', created)
        throw new Error('Không lấy được id đơn hàng từ server')
      }

      // create order detail records
      await Promise.all(items.map((it) => {
        const detail = {
          ordersId: orderId,
          productsId: it.id,
          quantity: it.qty,
          priceAtOrder: it.price,
          subtotal: (it.price || 0) * (it.qty || 0)
        }
        return createOrderDetailAPI(detail)
      }))

      // success
      clearCart()
      setItems([])
      setCustomerPhone('')
      setCustomerAddress('')
      setCustomerNote('')
      setPaymentMethod('cash')
      setShippingMethod('standard')
      toast.success('Thanh toán thành công.')
      try { navigate('/customer/orders') } catch (e) { /* ignore */ }

    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Checkout failed', err)
      toast.error('Thanh toán thất bại: ' + (err?.message || 'Lỗi'))
    }
  }

  return (
    <Box sx={{ background: 'linear-gradient(180deg, #f7fbfb, #ffffff)', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Typography variant="h5" sx={{ mb: 5, mt: 10 }}>Hoàn tất đơn hàng</Typography>

        {items.length === 0 ? (
          <Card sx={{ p: 3 }}>
            <CardContent>
              <Typography>Giỏ hàng trống, bạn hãy ghé qua trang sản phẩm để thêm món hàng yêu thích vào giỏ.</Typography>
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
                      <TextField label="Họ và tên" fullWidth value={customerName} onChange={(e) => setCustomerName(e.target.value)} sx={{ mt: 1 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Số điện thoại" fullWidth value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} sx={{ mt: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Email" fullWidth value={(getUserFromToken()?.email) || ''} disabled sx={{ mt: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Địa chỉ" fullWidth value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} sx={{ mt: 1 }} placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố" />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Ghi chú" fullWidth value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} sx={{ mt: 1 }} placeholder="Ghi chú cho đơn hàng (nếu có)" />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card sx={{ p: 2, mb: 2 }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, mb: 2 }}>Phương thức vận chuyển</Typography>
                  <FormControl component="fieldset">
                    <RadioGroup value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)}>
                      <FormControlLabel value="standard" control={<Radio sx={{ color: 'primary.main' }} />} label={<Typography sx={{ color: 'text.primary' }}>Giao hàng tiêu chuẩn — 30.000đ</Typography>} />
                      <FormControlLabel value="express" control={<Radio sx={{ color: 'primary.main' }} />} label={<Typography sx={{ color: 'text.primary' }}>Giao hàng hỏa tốc — 50.000đ</Typography>} />
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>

              <Card sx={{ p: 2, mb: 2 }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, mb: 2 }}>Mã khuyến mãi</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mt: 1 }}>
                    <Autocomplete
                      freeSolo
                      fullWidth
                      value={promoCode}
                      onChange={(event, newValue) => {
                        setPromoCode(newValue || '')
                      }}
                      onInputChange={(event, newInputValue) => {
                        setPromoCode(newInputValue)
                      }}
                      options={promos.map((p) => p.code)}
                      renderOption={(props, option) => {
                        const promo = promos.find(p => p.code === option)
                        return (
                          <li {...props}>
                            <Box>
                              <Typography sx={{ fontWeight: 700 }}>{option}</Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {promo?.desc || 'Không có mô tả'}
                              </Typography>
                            </Box>
                          </li>
                        )
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Mã khuyến mãi"
                          placeholder="Nhập hoặc chọn mã khuyến mãi"
                        />
                      )}
                    />
                    <Button variant="outlined" onClick={handleApplyPromo} sx={{ mt: 0, height: 56 }}>Áp dụng</Button>
                  </Box>
                  {promoInfo && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.dark' }}>
                        ✓ Mã {promoInfo.code} đã áp dụng
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'success.dark' }}>
                        Giảm: {promoInfo.type === 'percent' ? `${promoInfo.value}%` : `${(promoInfo.value || 0).toLocaleString('vi-VN')} đ`} = -{discount.toLocaleString('vi-VN')} đ
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              <Card sx={{ p: 2, mb: 2 }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, mb: 2 }}>Phương thức thanh toán</Typography>
                  <FormControl component="fieldset">
                    <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <FormControlLabel value="cash" control={<Radio sx={{ color: 'primary.main' }} />} label={<Typography sx={{ color: 'text.primary' }}>Thanh toán khi nhận hàng (COD)</Typography>} />
                      <FormControlLabel value="wallet" control={<Radio sx={{ color: 'primary.main' }} />} label={<Typography sx={{ color: 'text.primary' }}>Ví điện tử</Typography>} />
                      <FormControlLabel value="card" control={<Radio sx={{ color: 'primary.main' }} />} label={<Typography sx={{ color: 'text.primary' }}>Thẻ tín dụng / Ghi nợ</Typography>} />
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>

              <Card sx={{ p: 2, mb: 10 }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, mb: 2 }}>Chi tiết đơn hàng</Typography>
                  <List>
                    {items.map((it) => (
                      <ListItem key={it.id} sx={{ py: 1 }}
                        secondaryAction={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button size="small" variant="outlined" onClick={() => {
                              if (items.length === 1 && total < 50000) {
                                toast.error('Đơn hàng tối thiểu 50.000đ để thanh toán.')
                                return
                              }
                              updateItemQty(it.id, -1)
                            }} disabled={it.qty <= 1}>-</Button>
                            <Typography>{it.qty}</Typography>
                            <Button size="small" variant="outlined" onClick={() => updateItemQty(it.id, 1)}>+</Button>
                            <Button size="small" color="error" variant="outlined" onClick={() => {
                              removeItem(it.id)
                            }}>Xóa</Button>
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography>Phí vận chuyển</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{shippingFee.toLocaleString('vi-VN')} đ</Typography>
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
                        <ListItemText primary={it.name} secondary={`${it.qty} x ${(Number(it.price) || 0).toLocaleString('vi-VN')} đ`} />
                        <Typography sx={{ fontWeight: 700 }}>{((it.price || 0) * (it.qty || 0)).toLocaleString('vi-VN')} đ</Typography>
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Phí vận chuyển</Typography>
                    <Typography>{shippingFee.toLocaleString('vi-VN')} đ</Typography>
                  </Box>
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
                  <Button variant="contained" color="primary" fullWidth onClick={onCheckout}>Thanh toán</Button>
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
