import { useEffect, useState } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { Box, Grid, Button, Typography, TextField, IconButton, Card, CardContent, Rating } from '@mui/material'
import { getProductAPI, getProductsAPI, getReviewsAPI } from '~/apis/index'
import { addToCart } from '~/utils/cart'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { toast } from 'react-toastify'

export default function ProductDetail() {
  // Lấy ID sản phẩm từ URL params
  const { id } = useParams()
  // Thông tin sản phẩm hiện tại
  const [product, setProduct] = useState(null)
  // Danh sách sản phẩm (dùng cho sản phẩm liên quan)
  const [products, setProducts] = useState([])
  // Số lượng muốn mua
  const [quantity, setQuantity] = useState(1)
  // Sản phẩm liên quan
  const [relatedProducts, setRelatedProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length)
    : 0

  // Gọi API lấy chi tiết sản phẩm theo ID
  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!id) return
      try {
        const data = await getProductAPI(id)
        if (mounted) setProduct(data || null)
      } catch (err) {
        // Fallback: nếu endpoint chi tiết không có, lấy toàn bộ danh sách rồi tìm sản phẩm
        try {
          const all = await getProductsAPI()
          if (!mounted) return
          setProducts(all || [])
          const found = (all || []).find(p => (p._id || p.id) === id)
          if (found) setProduct(found)
        } catch (err2) {
          toast.error('Không thể tải sản phẩm', err2)
        }
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  // Gọi API lấy danh sách sản phẩm (dùng cho sản phẩm liên quan)
  useEffect(() => {
    let mounted = true
    const loadAll = async () => {
      try {
        const all = await getProductsAPI()
        if (mounted) setProducts(all || [])
      } catch (e) {
        toast.error('Không thể tải sản phẩm liên quan', e)
      }
    }
    loadAll()
    return () => { mounted = false }
  }, [])

  // Lọc sản phẩm liên quan: lấy tất cả sản phẩm cùng danh mục
  useEffect(() => {
    if (!product) return

    const currentId = product._id || product.id
    const prodCategory = product.categoryId

    // Lấy tất cả sản phẩm cùng danh mục, loại trừ sản phẩm hiện tại, giới hạn 8 sản phẩm
    const relatedByCategory = (products || [])
      .filter(p =>
        (p._id || p.id) !== currentId &&
        prodCategory &&
        String(p.categoryId) === String(prodCategory)
      )
      .slice(0, 4)

    setRelatedProducts(relatedByCategory)
  }, [product, products])

  useEffect(() => {
    let mounted = true
    const loadReviews = async () => {
      if (!id) return
      setReviewsLoading(true)
      try {
        const data = await getReviewsAPI(id)
        if (!mounted) return
        setReviews(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!mounted) return
        setReviews([])
      } finally {
        if (mounted) setReviewsLoading(false)
      }
    }
    loadReviews()
    return () => { mounted = false }
  }, [id])

  // Thay đổi số lượng mua
  const changeQuantity = (delta) => {
    setQuantity(q => {
      const n = q + (Number(delta) || 0)
      return n < 1 ? 1 : n
    })
  }

  if (!product) {
    return (
      <Box>
        <Header />
        {/* Hiển thị khi sản phẩm chưa được tải hoặc không tồn tại */}
        <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3 }}>
          <Typography>Đang tải sản phẩm hoặc sản phẩm không tồn tại.</Typography>
        </Box>
        <Footer />
      </Box>
    )
  }

  return (
    <Box>
      <Header />
      <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3, mt: 10, mb: 10 }}>
        <Grid container spacing={4}>
          {/* Khu vực hình ảnh sản phẩm */}
          <Grid item xs={12} md={6}>
            <Box sx={{ borderRadius: '8px', overflow: 'hidden', background: '#f8fafc' }}>
              {/* Ảnh chính */}
              <Box sx={{ height: { xs: 360, md: 460 }, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${product.imageUrl || ''})` }} />
            </Box>
            {/* Hình ảnh thumbnail */}
            <Box display="flex" gap={2} mt={2}>
              {((product.thumbnails && product.thumbnails.length) ? product.thumbnails : [product.imageUrl]).map((t, i) => (
                <Box key={i} sx={{ width: { xs: 64, md: 80 }, height: { xs: 48, md: 60 }, borderRadius: '6px', backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', backgroundImage: `url(${t || ''})` }} />
              ))}
            </Box>
          </Grid>

          {/* Khu vực thông tin sản phẩm */}
          <Grid item xs={12} md={6}>
            {/* Tên sản phẩm */}
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{product.product_name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Rating value={averageRating} precision={0.1} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                {reviews.length > 0 ? `${averageRating.toFixed(1)} (${reviews.length})` : 'Chưa có đánh giá'}
              </Typography>
            </Box>
            {/* Mô tả */}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{product.description || ''}</Typography>

            {/* Giá sản phẩm */}
            <Typography variant="h4" sx={{ color: '#d32f2f', fontWeight: 700, mt: 3 }}>{(Number(product.price) || 0).toLocaleString('vi-VN')} đ</Typography>

            {/* Chọn số lượng và thêm vào giỏ */}
            <Box display="flex" alignItems="center" gap={2} mt={3}>
              {/* Input số lượng với nút +/- */}
              <Box display="flex" alignItems="center" sx={{ border: '1px solid #e6eef6', borderRadius: 1, px: 1 }}>
                <IconButton size="small" onClick={() => changeQuantity(-1)}>
                  <RemoveIcon />
                </IconButton>
                <TextField value={quantity} onChange={(e) => {
                  const v = Number(e.target.value)
                  setQuantity(Number.isNaN(v) ? 1 : (v < 1 ? 1 : Math.floor(v)))
                }} size="small" inputProps={{ style: { width: 48, textAlign: 'center' } }} />
                <IconButton size="small" onClick={() => changeQuantity(1)}>
                  <AddIcon />
                </IconButton>
              </Box>

              {/* Nút thêm vào giỏ hàng */}
              <Button variant="contained" color="primary" sx={{ px: 3 }} onClick={() => {
                addToCart(product, quantity)
                try {
                  window.dispatchEvent(new CustomEvent('cartUpdated'))
                } catch (e) {
                  toast.warn('Lỗi gửi sự kiện cartUpdated', e)
                }
                toast.success('Đã thêm ' + quantity + ' sản phẩm vào giỏ')
              }}>Thêm vào giỏ</Button>
            </Box>

            {/* Số lượng tồn kho */}
            <Box sx={{ display: 'flex', mt: 4, alignItems: 'center' }}>
              <Typography>Số lượng:</Typography>
              <Typography variant="contained" sx={{ backgroundColor: '#7f8c8d', p: 1, borderRadius: 5, ml: 2 }}>{product.quantity}</Typography>
            </Box>

            {/* Trạng thái sản phẩm */}
            <Box sx={{ display: 'flex', mt: 2, alignItems: 'center' }}>
              <Typography>Tình trạng:</Typography>
              <Typography variant="contained" sx={{ backgroundColor: '#2ecc71', p: 1, borderRadius: 5, ml: 2 }}> {[product.status]}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ height: '1px', bgcolor: '#ecf0f1' }}></Box>

      <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3, mt: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Đánh giá</Typography>
        {reviewsLoading ? (
          <Typography>Đang tải đánh giá...</Typography>
        ) : reviews.length === 0 ? (
          <Typography>Chưa có đánh giá nào cho sản phẩm này.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {reviews.map((r) => (
              <Box key={r._id || r.id} sx={{ p: 2, borderRadius: 2, border: '1px solid #e6eef6', background: '#fff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#0b8798',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}>
                      {(r.userName || 'U')[0]}
                    </Box>
                    <Typography sx={{ fontWeight: 600 }}>{r.userName || 'Khach hang'}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(r.createdAt || r.created_at || Date.now()).toLocaleString()}
                  </Typography>
                </Box>
                <Rating value={Number(r.rating) || 0} readOnly size="small" sx={{ mt: 1 }} />
                {r.comment ? (
                  <Typography sx={{ mt: 1 }}>{r.comment}</Typography>
                ) : (
                  <Typography sx={{ mt: 1 }} color="text.secondary">(Khong co nhan xet)</Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Sản phẩm liên quan */}
      {relatedProducts.length > 0 && (
        <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3, mt: 10, mb: 10 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>Sản phẩm liên quan</Typography>
          <Grid container spacing={3}>
            {relatedProducts.map((p) => (
              <Grid item xs={6} sm={4} md={3} key={p._id || p.id}>
                <Card sx={{ borderRadius: 1, background: '#fff', boxShadow: '0 6px 18px rgba(16,24,32,0.06)', transition: 'all 0.3s', '&:hover': { boxShadow: '0 12px 24px rgba(16,24,32,0.12)' } }}>
                  <RouterLink to={`/products/${p.categoryId}`} style={{ textDecoration: 'none' }}>
                    <Box sx={{ width: '100%', height: 140, backgroundImage: `url(${p.imageUrl || ''})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 1 }} />
                  </RouterLink>
                  <CardContent>
                    <Typography sx={{ mt: 1, fontWeight: 600, fontSize: 14 }}>{p.name}</Typography>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                      <Typography sx={{ color: '#d32f2f', fontWeight: 700 }}>{(Number(p.price) || 0).toLocaleString('vi-VN')} đ</Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          addToCart(p, 1)
                          try {
                            window.dispatchEvent(new CustomEvent('cartUpdated'))
                          } catch (e) {
                            toast.error('Lỗi cập nhật giỏ hàng', e)
                          }
                        }}
                      >
                        Thêm
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Footer />
    </Box>
  )
}
