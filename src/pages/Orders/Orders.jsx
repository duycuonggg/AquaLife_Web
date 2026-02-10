import { useEffect, useState } from 'react'
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Rating, CircularProgress } from '@mui/material'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
// styles migrated from CustomerOrders.css into MUI `sx` props
import { createReviewAPI, getCustomerOrdersAPI, getOrderDetailsAPI, getProductAPI, getReviewsAPI } from '~/apis/index'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getUserFromToken } from '~/utils/auth'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewOrderId, setReviewOrderId] = useState('')
  const [reviewItems, setReviewItems] = useState([])
  const [reviewLoading, setReviewLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const data = await getCustomerOrdersAPI()
        if (!mounted) return
        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load orders', err)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let active = true
    const loadReviewItems = async () => {
      if (!reviewOpen || !reviewOrderId) return
      setReviewLoading(true)
      try {
        const details = await getOrderDetailsAPI(reviewOrderId)
        const productIds = (details || [])
          .map((d) => d?.productsId?._id || d?.productsId)
          .filter(Boolean)

        const products = await Promise.all(
          productIds.map((id) => getProductAPI(id).catch(() => null))
        )

        const reviewsByProduct = await Promise.all(
          productIds.map((id) => getReviewsAPI(id).catch(() => []))
        )

        const currentUserId = getUserFromToken()?.id

        const items = (details || []).map((d, index) => {
          const response = products[index]
          const product = response?.product || response
          const productId = d?.productsId?._id || d?.productsId
          const productReviews = Array.isArray(reviewsByProduct[index]) ? reviewsByProduct[index] : []
          const hasReviewed = Boolean(currentUserId && productReviews.some((r) => String(r.userId) === String(currentUserId)))
          return {
            productId,
            quantity: d?.quantity || 1,
            price: d?.price || 0,
            name: product?.name || product?.product_name || 'Sản phẩm',
            imageUrl: product?.imageUrl || product?.image_url || '',
            hasReviewed
          }
        }).filter((item) => Boolean(item.productId))

        if (!active) return
        setReviewItems(items)
        setSelectedItem(items[0] || null)
      } catch (err) {
        if (!active) return
        toast.error('Không thể tải sản phẩm để đánh giá')
        setReviewItems([])
        setSelectedItem(null)
      } finally {
        if (active) setReviewLoading(false)
      }
    }

    loadReviewItems()
    return () => { active = false }
  }, [reviewOpen, reviewOrderId])

  const openReviewDialog = (orderId) => {
    setReviewOrderId(orderId)
    setReviewOpen(true)
    setReviewItems([])
    setSelectedItem(null)
    setRating(5)
    setComment('')
  }

  const closeReviewDialog = () => {
    if (submitting) return
    setReviewOpen(false)
  }

  const submitReview = async () => {
    if (!selectedItem?.productId) {
      toast.error('Vui lòng chọn sản phẩm để đánh giá')
      return
    }
    if (selectedItem.hasReviewed) {
      toast.error('Bạn đã đánh giá sản phẩm này')
      return
    }
    if (!rating || rating < 1) {
      toast.error('Vui lòng chọn số sao')
      return
    }
    try {
      setSubmitting(true)
      await createReviewAPI({
        productId: selectedItem.productId,
        rating,
        comment: comment.trim()
      })
      toast.success('Đánh giá thành công')
      setReviewItems((prev) => prev.map((item) => (
        item.productId === selectedItem.productId ? { ...item, hasReviewed: true } : item
      )))
      setReviewOpen(false)
    } catch (err) {
      toast.error('Đánh giá thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const isDelivered = (status) => {
    const normalized = String(status || '').trim().toLowerCase()
    return normalized === 'đã giao' || normalized === 'da giao' || normalized === 'completed'
  }

  return (
    <>
      {loading ? (
        <Box>Loading...</Box>
      ) : (
        <Box sx={{ background: 'linear-gradient(180deg, #f7fbfb, #ffffff)' }}>
          <Header />
          <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3, mb: 12 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 10, mb: 10, textAlign: 'center' }}>Đơn hàng của tôi</Typography>
            <Box sx={{ background: '#fff', borderRadius: 2, p: '18px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', marginBottom: '100px' }}>
              {orders.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 3, color: '#666' }}>Bạn chưa có đơn hàng nào.</Box>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small" sx={{ width: '100%', borderCollapse: 'collapse', '& th, & td': { padding: '12px 8px', borderBottom: '1px solid #eee', textAlign: 'center' } }}>
                    <TableHead sx={{ backgroundColor: '#0b8798' }}>
                      <TableRow>
                        <TableCell>Mã đơn</TableCell>
                        <TableCell>Thời gian</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Tổng tiền</TableCell>
                        <TableCell sx={{ width: 300 }}>Địa chỉ giao</TableCell>
                        <TableCell align="center">Hành động</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((o) => (
                        <TableRow key={o._id || o.id}>
                          <TableCell>{o._id || o.id}</TableCell>
                          <TableCell>{new Date(o.created_at || o.orderDate || o.createdAt || Date.now()).toLocaleString()}</TableCell>
                          <TableCell>{o.status}</TableCell>
                          <TableCell sx={{ color: '#d32f2f', fontWeight: 700 }}>{(Number(o.total_price || o.totalPrice) || 0).toLocaleString('vi-VN')} đ</TableCell>
                          <TableCell>{o.address}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Button size="small" variant="outlined" onClick={() => navigate(`/orders/${o._id || o.id}`)}>Chi tiết</Button>
                              {isDelivered(o.status) && (
                                <Button size="small" variant="contained" onClick={() => openReviewDialog(o._id || o.id)}>Đánh giá</Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Box>
          <Footer />
        </Box>
      )}
      <Dialog open={reviewOpen} onClose={closeReviewDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Đánh giá sản phẩm</DialogTitle>
        <DialogContent dividers>
          {reviewLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <>
              {reviewItems.length === 0 ? (
                <Typography>Không có sản phẩm để đánh giá.</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                  {reviewItems.map((item) => (
                    <Box
                      key={item.productId}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: selectedItem?.productId === item.productId ? 'primary.main' : '#e6eef6',
                        cursor: item.hasReviewed ? 'not-allowed' : 'pointer',
                        opacity: item.hasReviewed ? 0.7 : 1
                      }}
                      onClick={() => {
                        if (!item.hasReviewed) setSelectedItem(item)
                      }}
                    >
                      <Box
                        sx={{
                          width: 56,
                          height: 40,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: 1,
                          backgroundImage: `url(${item.imageUrl || ''})`,
                          backgroundColor: '#f3f5f7'
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 600 }}>{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">Số lượng: {item.quantity}</Typography>
                        {item.hasReviewed && (
                          <Typography variant="caption" color="success.main">Đã đánh giá</Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography sx={{ mb: 1, fontWeight: 600 }}>Số sao</Typography>
                  <Rating value={rating} onChange={(e, value) => setRating(value || 1)} />
                </Box>
                <TextField
                  label="Nhận xét"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  multiline
                  minRows={3}
                  placeholder="Chia sẻ cảm nhận của bạn"
                  fullWidth
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReviewDialog} disabled={submitting}>Hủy</Button>
          <Button variant="contained" onClick={submitReview} disabled={reviewLoading || submitting}>Gửi đánh giá</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
