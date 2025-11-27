import { useEffect, useState } from 'react'
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
import './OrderDetail.css'
import { getOrderAPI, getOrderDetailsAPI, getProductAPI } from '~/apis/index'
import { useParams, useNavigate } from 'react-router-dom'

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const o = await getOrderAPI(id)
        if (!mounted) return
        setOrder(o)

        const details = await getOrderDetailsAPI(id)
        // debug: log raw details returned from API
        // eslint-disable-next-line no-console
        console.log('Order details API response for', id, details)
        if (!mounted) return

        // fetch product names + images in parallel with debug logs
        const withNames = await Promise.all((details || []).map(async (d) => {
          const prodId = (d.productsId && (d.productsId._id || d.productsId.toString)) ? (d.productsId._id || d.productsId.toString()) : String(d.productsId)
          // eslint-disable-next-line no-console
          console.log('Fetch product for order-detail', prodId)
          try {
            const p = await getProductAPI(prodId)
            // eslint-disable-next-line no-console
            console.log('Product fetched', prodId, p)
            return { ...d, productName: p?.name, productImage: p?.imageUrl || p?.image }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed fetching product for', prodId, err?.response?.status || err?.message || err)
            return d
          }
        }))

        setItems(withNames)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load order detail', err)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  return (
    <Box>
      <Header />
      <Box className="order-detail-root">
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 10, mt: 10 }}>Chi tiết đơn hàng</Typography>
        <Box className="order-card">
          {loading && !order && <Typography>Đang tải...</Typography>}
          {order && (
            <>
              <Box className="order-meta">
                <Typography className='order-title'><strong>Mã đơn:</strong> {order._id || order.id}</Typography>
                <Typography className='order-title'><strong>Thời gian:</strong> {new Date(order.orderDate).toLocaleString()}</Typography>
                <Typography className='order-title'><strong>Trạng thái:</strong> {order.status}</Typography>
                <Typography className='order-title'><strong>Tổng:</strong> {(Number(order.totalPrice) || 0).toLocaleString('vi-VN')} đ</Typography>
                <Typography className='order-title'><strong>Địa chỉ:</strong> {order.deliveryAddress}</Typography>
              </Box>

              <Box mt={2}>
                <TableContainer component={Paper} elevation={0}>
                  <Table className="items-table" size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tên sản phẩm</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>Ảnh</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>Số lượng</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>Giá</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4}><em>Đơn hàng chưa có sản phẩm</em></TableCell>
                        </TableRow>
                      )}
                      {items.map((it) => (
                        <TableRow key={it._id || it.id}>
                          <TableCell>{it.productName}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {it.productImage ? (
                                <Box sx={{ width: 64, height: 48, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${it.productImage})`, borderRadius: 1 }} />
                              ) : (
                                <Box sx={{ width: 64, height: 48, background: '#f0f0f0', borderRadius: 1 }} />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>{it.quantity}</TableCell>
                          <TableCell sx={{ color: '#d32f2f', fontWeight: 700, textAlign: 'center' }}>{(Number(it.priceAtOrder) || 0).toLocaleString('vi-VN')} đ</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}

          {!loading && !order && (
            <Typography>Không tìm thấy đơn hàng.</Typography>
          )}
        </Box>
      </Box>
      <Footer />
    </Box>
  )
}
