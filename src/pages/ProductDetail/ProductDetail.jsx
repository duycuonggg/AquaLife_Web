import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Grid, Card, CardContent, Button, Typography, TextField, IconButton, Rating, Avatar, Stack, Divider } from '@mui/material'
import { getProductAPI, getProductsAPI, getReviewsAPI, createReviewAPI } from '~/apis/index'
import { addToCart } from '~/utils/cart'
import { Link as RouterLink } from 'react-router-dom'
// styles migrated from ProductDetail.css into MUI `sx` props
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { toast } from 'react-toastify'
import { getUserFromToken } from '~/utils/auth'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [related, setRelated] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState([])
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!id) return
      try {
        const data = await getProductAPI(id)
        if (mounted) setProduct(data || null)
      } catch (err) {
        // fallback to loading all products if single endpoint missing
        try {
          const all = await getProductsAPI()
          if (!mounted) return
          setProducts(all || [])
          const found = (all || []).find(p => (p._id || p.id) === id)
          if (found) setProduct(found)
        } catch (err2) {
          // eslint-disable-next-line no-console
          console.error('Failed loading product', err2)
        }
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  // ensure related products list is populated so "Sản phẩm liên quan" shows
  useEffect(() => {
    let mounted = true
    const loadAll = async () => {
      try {
        const all = await getProductsAPI()
        if (mounted) setProducts(all || [])
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load related products', e)
      }
    }
    loadAll()
    return () => { mounted = false }
  }, [])

  // compute related products whenever product or products change
  useEffect(() => {
    if (!product || !(products && products.length)) {
      setRelated([])
      return
    }

    const currentId = product._id || product.id
    const prodType = product.product_type || null
    const prodCategory = product.category_id || null
    const prodTags = Array.isArray(product.tags) ? product.tags.map(String) : []

    const scored = (products || []).filter(p => (p._id || p.id) !== currentId).map(p => {
      let score = 0
      if (prodType && p.product_type && String(p.product_type) === String(prodType)) score += 3
      if (prodCategory && p.category_id && String(p.category_id) === String(prodCategory)) score += 2
      if (prodTags.length && Array.isArray(p.tags)) {
        const common = p.tags.map(String).filter(t => prodTags.includes(t)).length
        score += common
      }
      return { item: p, score }
    })

    // sort by score desc, then by name
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      const an = (a.item.product_name || '').toLowerCase()
      const bn = (b.item.product_name || '').toLowerCase()
      return an < bn ? -1 : an > bn ? 1 : 0
    })

    let picks = scored.filter(s => s.score > 0).map(s => s.item)
    if (!picks.length) {
      // fallback: take any other products
      picks = (products || []).filter(p => (p._id || p.id) !== currentId)
    }

    setRelated((picks || []).slice(0, 4))
  }, [product, products])

  // load reviews for this product
  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!product) return
      try {
        const items = await getReviewsAPI(product._id || product.id)
        if (mounted) setReviews(items || [])
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load reviews', e)
      }
    }
    load()
    return () => { mounted = false }
  }, [product])

  const changeQuantity = (next) => {
    // treat `next` as a delta (e.g. 1 or -1) when called from +/- buttons
    setQuantity(q => {
      const n = q + (Number(next) || 0)
      return n < 1 ? 1 : n
    })
  }

  if (!product) {
    return (
      <Box>
        <Header />
        <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3 }}>
          <Typography>Đang tải sản phẩm hoặc sản phẩm không tồn tại.</Typography>
        </Box>
        <Footer />
      </Box>
    )
  }

  const statusMap = {
    available: 'Còn hàng',
    out_of_stock: 'Hết hàng',
    discontinued: 'Ngừng kinh doanh'
  }

  return (
    <Box>
      <Header />
      <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3, mt: 10, mb: 10 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ borderRadius: '8px', overflow: 'hidden', background: '#f8fafc' }}>
              <Box sx={{ height: { xs: 360, md: 460 }, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${product.image_url || ''})` }} />
            </Box>
            <Box display="flex" gap={2} mt={2}>
              {((product.thumbnails && product.thumbnails.length) ? product.thumbnails : [product.image_url]).map((t, i) => (
                <Box key={i} sx={{ width: { xs: 64, md: 80 }, height: { xs: 48, md: 60 }, borderRadius: '6px', backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', backgroundImage: `url(${t || ''})` }} />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{product.product_name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{product.description || ''}</Typography>

            <Typography variant="h4" sx={{ color: '#d32f2f', fontWeight: 700, mt: 3 }}>{(Number(product.price) || 0).toLocaleString('vi-VN')} đ</Typography>

            <Box display="flex" alignItems="center" gap={2} mt={3}>
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

              <Button variant="contained" color="primary" sx={{ px: 3 }} onClick={() => {
                addToCart(product, quantity)
                // notify header via dispatched event (saveCart already dispatches), but ensure immediate update
                try {
                  window.dispatchEvent(new CustomEvent('cartUpdated'))
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.warn('Failed to dispatch cartUpdated event', e)
                }
                toast.success('Đã thêm ' + quantity + ' sản phẩm vào giỏ')
              }}>Thêm vào giỏ</Button>
            </Box>
            <Box sx={{ display: 'flex', mt: 4, alignItems: 'center' }}>
              <Typography>Số lượng:</Typography>
              <Typography variant="contained" sx={{ backgroundColor: '#7f8c8d', p: 1, borderRadius: 5, ml: 2 }}>{product.stock_quantity}</Typography>
            </Box>
            <Box sx={{ display: 'flex', mt: 2, alignItems: 'center' }}>
              <Typography>Tình trạng:</Typography>
              <Typography variant="contained" sx={{ backgroundColor: '#2ecc71', p: 1, borderRadius: 5, ml: 2 }}> {statusMap[product.status]}</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 20, mb: 10 }}>
          {/* Reviews */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Đánh giá sản phẩm</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 28 }}>{reviews && reviews.length ? (reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1) : '0.0'}</Typography>
                <Rating value={reviews && reviews.length ? Number((reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)) : 0} readOnly precision={0.1} />
                <Typography variant="caption" color="text.secondary">{reviews?.length || 0} đánh giá</Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
              <Box sx={{ flex: 1 }}>
                {(reviews || []).length === 0 && <Typography color="text.secondary">Chưa có đánh giá nào, bạn có thể là người đầu tiên.</Typography>}
              </Box>
            </Box>

            <Stack spacing={2}>
              {(reviews || []).map(r => (
                <Card key={r._id || r.id} sx={{ p: 2, boxShadow: '0 6px 18px rgba(16,24,32,0.04)' }}>
                  <Box display="flex" gap={2}>
                    <Avatar src={r.customer_image || ''} sx={{ bgcolor: '#00897b' }}>{r.customer_name ? r.customer_name[0] : 'K'}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{r.customer_name || (r.customer_id ? `Khách (${String(r.customer_id).slice(-6)})` : 'Khách')}</Typography>
                          <Typography variant="caption" color="text.secondary">{new Date(r.created_at).toLocaleString()}</Typography>
                        </Box>
                        <Rating value={Number(r.rating) || 0} readOnly />
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Typography>{r.comment || ''}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Stack>

            <Box sx={{ mt: 10, pt: 2, mb: 20 }}>
              {getUserFromToken() ? (
                <Card sx={{ p: 2, boxShadow: '0 6px 18px rgba(16,24,32,0.04)' }}>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>Viết đánh giá</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Rating value={newRating} onChange={(e, v) => setNewRating(v || 5)} />
                  </Box>
                  <TextField multiline minRows={3} placeholder="Viết cảm nhận của bạn" value={newComment} onChange={(e) => setNewComment(e.target.value)} fullWidth sx={{ mb: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" onClick={async () => {
                      try {
                        await createReviewAPI({ product_id: product._id || product.id, rating: newRating, comment: newComment })
                        toast.success('Cảm ơn bạn đã đánh giá')
                        const items = await getReviewsAPI(product._id || product.id)
                        setReviews(items || [])
                        setNewComment('')
                        setNewRating(5)
                      } catch (err) {
                        // eslint-disable-next-line no-console
                        console.error('Failed to submit review', err)
                        toast.error('Không thể gửi đánh giá. Vui lòng đăng nhập hoặc thử lại sau.')
                      }
                    }}>Gửi đánh giá</Button>
                  </Box>
                </Card>
              ) : (
                <Typography color="text.secondary">Vui lòng <RouterLink to="/login">đăng nhập</RouterLink> để viết đánh giá.</Typography>
              )}
            </Box>
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Sản phẩm liên quan</Typography>
          <Grid container spacing={2}>
            {(related || []).map((r) => (
              <Grid item xs={12} sm={6} md={3} key={r._id || r.id}>
                <Card>
                  <RouterLink to={`/products/${r._id || r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Box sx={{ height: 120, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${r.image_url || ''})` }} />
                    <CardContent>
                      <Typography sx={{ fontWeight: 700 }}>{r.product_name}</Typography>
                      <Typography sx={{ color: '#d32f2f', fontWeight: 700 }}>{(Number(r.price) || 0).toLocaleString('vi-VN')} đ</Typography>
                    </CardContent>
                  </RouterLink>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
      <Box sx={{ height: '1px', bgcolor: '#ecf0f1' }}></Box>
      <Footer />
    </Box>
  )
}
