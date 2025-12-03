import { useEffect, useState } from 'react'
import { Box, Typography, Grid, Card, CardContent, Button, TextField, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
import { getCart, removeFromCart, updateQty, clearCart } from '~/utils/cart'
import { createOrderAPI, createOrderDetailAPI } from '~/apis/index'
import { getUserFromToken } from '~/utils/auth'
import { useNavigate } from 'react-router-dom'

export default function Cart() {
  const [items, setItems] = useState([])
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerNote, setCustomerNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')

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

  const onRemove = (id) => {
    removeFromCart(id)
    setItems(getCart())
  }

  const onQty = (id, v) => {
    const n = Number(v) || 1
    updateQty(id, n < 1 ? 1 : Math.floor(n))
    setItems(getCart())
  }

  const total = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0)

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
        totalPrice: total,
        status: 'Đang chờ',
        orderDate: new Date().toISOString(),
        deliveryAddress: customerAddress || '',
        note: ''
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
      alert('Thanh toán thành công. Cảm ơn bạn đã mua hàng!')
      try { navigate('/customer/orders') } catch (e) { /* ignore */ }

    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Checkout failed', err)
      alert('Thanh toán thất bại: ' + (err?.message || 'Lỗi'))
    }
  }

  return (
    <Box sx={{ background: 'linear-gradient(180deg, #f7fbfb, #ffffff)' }}>
      <Header />
      <Box sx={{ maxWidth: 1100, p: 3, marginLeft: '500px' }}>
        <Typography variant="h5" sx={{ mb: 10, mt: 10 }}>Giỏ hàng</Typography>
        {items.length === 0 ? (
          <Typography sx={{ mb: 10 }}>Giỏ hàng trống, bạn hãy ghé qua trang sản phẩm để thêm món hàng yêu thích vào giỏ.</Typography>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              {items.map((it) => (
                <Card key={it.id} sx={{ mb: 2 }}>
                  <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ width: 96, height: 72, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${it.imageUrl || ''})` }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>{it.name}</Typography>
                      <Typography sx={{ fontWeight: 700, color: '#d32f2f' }}>{(Number(it.price) || 0).toLocaleString('vi-VN')} đ</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField size="small" value={it.qty} onChange={(e) => onQty(it.id, e.target.value)} inputProps={{ style: { width: 56, textAlign: 'center' } }} />
                      <Button color="error" onClick={() => onRemove(it.id)}>Xóa</Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              <Box sx={{ mt: 5, mb: 5 }}>
                <Typography sx={{ fontWeight: 700 }}>Tổng tiền: <span style={{color: '#d32f2f' }}>{total.toLocaleString('vi-VN')} đ</span></Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={8} mt={5} mb={20}>
              <Card>
                <CardContent>
                  <TextField label="Số điện thoại" fullWidth value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} sx={{ mt: 1 }} />
                  <TextField label="Địa chỉ" fullWidth value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} sx={{ mt: 1 }} />
                  <TextField label="Ghi chú" fullWidth value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} sx={{ mt: 1 }} />

                  <FormControl sx={{ mt: 5 }} component="fieldset">
                    <FormLabel component="legend">Phương thức thanh toán</FormLabel>
                    <RadioGroup row value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <FormControlLabel value="cash" control={<Radio />} label="Tiền mặt" />
                      <FormControlLabel value="card" control={<Radio />} label="Thẻ" />
                      <FormControlLabel value="online" control={<Radio />} label="Ví/Chuyển khoản" />
                    </RadioGroup>
                  </FormControl>

                </CardContent>
                <Button variant="contained" sx={{ mt: 5, mb: 5, ml: 2 }} onClick={onCheckout}>Thanh toán</Button>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
      <Footer />
    </Box>
  )
}
