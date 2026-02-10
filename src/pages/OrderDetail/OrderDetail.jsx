import { useEffect, useState } from 'react'
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
// Các API để lấy dữ liệu đơn hàng, chi tiết đơn hàng, và sản phẩm
import { getOrderAPI, getOrderDetailsAPI, getProductAPI } from '~/apis/index'
import { useParams } from 'react-router-dom'

export default function OrderDetail() {
  // Lấy ID đơn hàng từ URL
  const { id } = useParams()
  // State lưu thông tin đơn hàng
  const [order, setOrder] = useState(null)
  // State lưu danh sách chi tiết đơn hàng (tên sản phẩm, ảnh, giá, số lượng)
  const [items, setItems] = useState([])
  // State để hiển thị loading
  const [loading, setLoading] = useState(false)


  // Hook tải dữ liệu đơn hàng khi component mount hoặc khi ID thay đổi
  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        // Lấy thông tin đơn hàng từ API
        const o = await getOrderAPI(id)
        if (!mounted) return
        setOrder(o)

        // Lấy danh sách chi tiết đơn hàng
        const details = await getOrderDetailsAPI(id)
        // Debug: log để kiểm tra dữ liệu từ API
        // eslint-disable-next-line no-console
        console.log('Order details API response for', id, details)
        if (!mounted) return

        // Lấy tên sản phẩm và ảnh bằng cách gọi API product cho từng sản phẩm
        const withNames = await Promise.all((details || []).map(async (d) => {
          const prodId = (d.productsId && (d.productsId._id || d.productsId.toString)) ? (d.productsId._id || d.productsId.toString()) : String(d.productsId)
          // eslint-disable-next-line no-console
          console.log('Fetch product for order-detail', prodId)
          try {
            // Gọi API để lấy thông tin sản phẩm (tên, ảnh, v.v.)
            const response = await getProductAPI(prodId)
            const p = response?.product || response
            // eslint-disable-next-line no-console
            console.log('Product fetched', prodId, p)
            // Trả về đối tượng chi tiết đơn hàng kèm theo tên và ảnh sản phẩm
            return { ...d, productName: p?.name || p?.product_name, imageUrl: p?.imageUrl || p?.image_url || p?.image }
          } catch (err) {
            // Xử lý lỗi khi lấy thông tin sản phẩm
            // eslint-disable-next-line no-console
            console.error('Failed fetching product for', prodId, err?.response?.status || err?.message || err)
            return d
          }
        }))

        // Lưu danh sách chi tiết đơn hàng vào state
        setItems(withNames)
      } catch (err) {
        // Xử lý lỗi khi tải đơn hàng
        // eslint-disable-next-line no-console
        console.error('Failed to load order detail', err)
      } finally {
        setLoading(false)
      }
    }
    load()
    // Cleanup function để tránh memory leak
    return () => { mounted = false }
  }, [id])

  return (
    <Box>
      <Header />
      <Box sx={{ maxWidth: 1000, margin: '0 auto', p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 10, mt: 10, textAlign: 'center' }}>Chi tiết đơn hàng</Typography>

        <Box sx={{ background: '#fff', p: '18px', borderRadius: '8px', boxShadow: '0 6px 18px rgba(0,0,0,0.04)', marginBottom: '100px' }}>
          {loading && !order && <Typography>Đang tải...</Typography>}

          {order && (
            <>
              <Box sx={{ borderBottom: '1px solid #e0e0e0', mb: 2, pb: 2 }}>
                <Typography><strong>Mã đơn:</strong> {order._id || order.id}</Typography>
              </Box>

              <Box sx={{ borderBottom: '1px solid #e0e0e0', mb: 2, pb: 2 }}>
                <Typography><strong>Thời gian:</strong> {new Date(order.createdAt).toLocaleString()}</Typography>
              </Box>

              <Box sx={{ borderBottom: '1px solid #e0e0e0', mb: 2, pb: 2 }}>
                <Typography><strong>Trạng thái:</strong> {order.status}</Typography>
              </Box>

              <Box sx={{ borderBottom: '1px solid #e0e0e0', mb: 2, pb: 2 }}>
                <Typography><strong>Tổng:</strong> {(Number(order.totalPrice) || 0).toLocaleString('vi-VN')} đ</Typography>
              </Box>
              <Box sx={{ borderBottom: '1px solid #e0e0e0', mb: 2, pb: 2 }}>
                <Typography><strong>Ghi chú:</strong> {order.note}</Typography>
              </Box>
              <Box sx={{ borderBottom: '1px solid #e0e0e0', mb: 2, pb: 2 }}>
                <Typography><strong>Địa chỉ:</strong> {order.address}</Typography>
              </Box>

              <Box mt={2}>
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small" sx={{ '& th, & td': { padding: '8px 12px', borderBottom: '1px solid #eee' } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ textAlign: 'center', fontWeight: 700 }}>Tên sản phẩm</TableCell>
                        <TableCell sx={{ textAlign: 'center', fontWeight: 700 }}>Ảnh</TableCell>
                        <TableCell sx={{ textAlign: 'center', fontWeight: 700 }}>Số lượng</TableCell>
                        <TableCell sx={{ textAlign: 'center', fontWeight: 700 }}>Giá</TableCell>
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
                          <TableCell sx={{ textAlign: 'center' }}>{it.productName || it.name}</TableCell>

                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {it.imageUrl ? (
                                <Box sx={{ width: 64, height: 48, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${it.imageUrl})`, borderRadius: 1 }} />
                              ) : (
                                <Box sx={{ width: 64, height: 48, background: '#f0f0f0', borderRadius: 1 }} />
                              )}
                            </Box>
                          </TableCell>

                          <TableCell sx={{ textAlign: 'center' }}>{it.quantity}</TableCell>

                          <TableCell sx={{ color: '#d32f2f', fontWeight: 700, textAlign: 'center' }}>{(Number(it.price) || 0).toLocaleString('vi-VN')} đ</TableCell>
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
