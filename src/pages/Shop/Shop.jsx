import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Box, Grid, Card, CardContent, Button, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Pagination, Stack, InputAdornment, IconButton } from '@mui/material'
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material'
import { getProductsAPI, getCategoriesAPI } from '~/apis/index'
import { addToCart } from '~/utils/cart'
import { Link as RouterLink } from 'react-router-dom'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
import { toast } from 'react-toastify'

/**
 * Component trang Cửa hàng - Hiển thị danh sách sản phẩm với các chức năng lọc
 */
export default function Shop() {
  // === STATE MANAGEMENT ===
  const pageSize = 12 // Số sản phẩm trên mỗi trang
  const [products, setProducts] = useState([]) // Danh sách tất cả sản phẩm
  const [categories, setCategories] = useState([]) // Danh sách danh mục
  const [currentPage, setCurrentPage] = useState(1) // Trang hiện tại
  const [searchTerm, setSearchTerm] = useState('') // Từ khóa tìm kiếm
  const [categoryFilter, setCategoryFilter] = useState('') // Danh mục được chọn
  const [minPrice, setMinPrice] = useState('') // Giá tối thiểu
  const [maxPrice, setMaxPrice] = useState('') // Giá tối đa

  const location = useLocation()

  // === LOAD DỮ LIỆU BAN ĐẦU ===
  // Load danh sách sản phẩm và danh mục khi component mount
  useEffect(() => {
    const load = async () => {
      try {
        // Gọi cả 2 API song song để tối ưu tốc độ
        const [productsData, categoriesData] = await Promise.all([
          getProductsAPI(),
          getCategoriesAPI()
        ])
        setProducts(productsData || [])
        setCategories(categoriesData || [])
      } catch (err) {
        toast.error('Lỗi tải dữ liệu sản phẩm hoặc danh mục')
      }
    }
    load()
  }, [])

  // Khởi tạo bộ lọc danh mục từ URL query parameter (nếu có)
  useEffect(() => {
    const paramsQ = new URLSearchParams(location.search)
    const catId = paramsQ.get('category') || ''
    if (catId) setCategoryFilter(catId)
  }, [location.search])

  // Reset về trang đầu tiên mỗi khi thay đổi bộ lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, minPrice, maxPrice])

  // === LỌC VÀ PHÂN TRANG SẢN PHẨM ===
  // Lọc sản phẩm theo các điều kiện: tìm kiếm, danh mục, khoảng giá
  const filteredProducts = (products || []).filter((p) => {
    // Lọc theo từ khóa tìm kiếm (tìm trong tên sản phẩm)
    const q = searchTerm.trim().toLowerCase()
    if (q) {
      const inName = (p.name || '').toLowerCase().includes(q)
      if (!inName) return false
    }
    // Lọc theo danh mục
    if (categoryFilter) {
      const productCategoryId = typeof p.categoryId === 'object' ? p.categoryId.toString() : p.categoryId
      if (productCategoryId !== categoryFilter) return false
    }
    // Lọc theo khoảng giá
    const price = Number(p.price) || 0
    if (minPrice !== '') {
      const min = Number(minPrice)
      if (!Number.isNaN(min) && price < min) return false
    }
    if (maxPrice !== '') {
      const max = Number(maxPrice)
      if (!Number.isNaN(max) && price > max) return false
    }
    return true
  })

  // Tính toán phân trang
  const total = filteredProducts.length // Tổng số sản phẩm sau khi lọc
  const totalPages = Math.max(1, Math.ceil(total / pageSize)) // Tổng số trang
  const safePage = Math.min(Math.max(1, currentPage), totalPages) // Đảm bảo số trang hợp lệ
  const startIndex = (safePage - 1) * pageSize // Vị trí bắt đầu
  const pageItems = filteredProducts.slice(startIndex, startIndex + pageSize) // Sản phẩm của trang hiện tại


  // === RENDER GIAO DIỆN ===
  return (
    <Box sx={{ background: 'linear-gradient(180deg, #f7fbfb, #ffffff)' }}>
      <Header />

      <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3, mt: 5 }}>
        {/* === BỘ LỌC VÀ TÌM KIẾM === */}
        <Box className="shop-filters" display="flex" gap={2} alignItems="center" mb={10}>
          {/* Ô tìm kiếm sản phẩm */}
          <TextField
            size="small"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 240 }}
          />

          {/* Dropdown lọc theo danh mục */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Danh mục</InputLabel>
            <Select
              label="Danh mục"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {(categories || []).map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Ô nhập giá tối thiểu với nút tăng/giảm */}
          <TextField
            size="small"
            placeholder="Giá từ"
            value={minPrice ? `${Number(minPrice).toLocaleString('vi-VN')}đ` : ''}
            onChange={(e) => {
              // Chỉ cho phép nhập số
              const value = e.target.value.replace(/\D/g, '')
              setMinPrice(value)
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ display: 'flex', flexDirection: 'column', mr: -1 }}>
                    {/* Nút tăng giá 10,000đ */}
                    <IconButton
                      size="small"
                      onClick={() => setMinPrice((prev) => String(Number(prev || 0) + 10000))}
                      sx={{ p: 0, height: 16 }}
                    >
                      <ArrowDropUp fontSize="small" />
                    </IconButton>
                    {/* Nút giảm giá 10,000đ */}
                    <IconButton
                      size="small"
                      onClick={() => {
                        const newValue = Math.max(0, Number(minPrice || 0) - 10000)
                        setMinPrice(String(newValue))
                      }}
                      sx={{ p: 0, height: 16 }}
                    >
                      <ArrowDropDown fontSize="small" />
                    </IconButton>
                  </Box>
                </InputAdornment>
              )
            }}
            inputProps={{
              style: { textAlign: 'left' }
            }}
            sx={{ width: 150 }}
          />

          {/* Ô nhập giá tối đa với nút tăng/giảm */}
          <TextField
            size="small"
            placeholder="Giá đến"
            value={maxPrice ? `${Number(maxPrice).toLocaleString('vi-VN')}đ` : ''}
            onChange={(e) => {
              // Chỉ cho phép nhập số
              const value = e.target.value.replace(/\D/g, '')
              setMaxPrice(value)
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ display: 'flex', flexDirection: 'column', mr: -1 }}>
                    {/* Nút tăng giá 10,000đ */}
                    <IconButton
                      size="small"
                      onClick={() => setMaxPrice((prev) => String(Number(prev || 0) + 10000))}
                      sx={{ p: 0, height: 16 }}
                    >
                      <ArrowDropUp fontSize="small" />
                    </IconButton>
                    {/* Nút giảm giá 10,000đ */}
                    <IconButton
                      size="small"
                      onClick={() => {
                        const newValue = Math.max(0, Number(maxPrice || 0) - 10000)
                        setMaxPrice(String(newValue))
                      }}
                      sx={{ p: 0, height: 16 }}
                    >
                      <ArrowDropDown fontSize="small" />
                    </IconButton>
                  </Box>
                </InputAdornment>
              )
            }}
            inputProps={{
              style: { textAlign: 'left' }
            }}
            sx={{ width: 150 }}
          />

          <Box sx={{ flex: 1 }} />
        </Box>

        {/* === DANH SÁCH SẢN PHẨM === */}
        <Grid container spacing={3}>
          {pageItems.map((p) => (
            <Grid item xs={12} sm={6} md={3} key={p._id || p.id}>
              <Card sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 12px 30px rgba(16,24,32,0.08)',
                height: '100%'
              }}>
                {/* Hình ảnh sản phẩm - Click để xem chi tiết */}
                <RouterLink to={`/products/${p._id || p.id}`}>
                  <Box sx={{
                    width: '100%',
                    height: { xs: 180, md: 220 },
                    backgroundImage: `url(${p.imageUrl || ''})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'block'
                  }} />
                </RouterLink>

                {/* Thông tin sản phẩm */}
                <CardContent>
                  <Typography sx={{ mt: 1, fontWeight: 600 }}>{p.name}</Typography>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                    {/* Giá sản phẩm */}
                    <Typography sx={{ color: '#d32f2f', fontWeight: 700 }}>
                      {(Number(p.price) || 0).toLocaleString('vi-VN')} đ
                    </Typography>
                    {/* Nút thêm vào giỏ hàng */}
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        addToCart(p, 1)
                        toast.success('Đã thêm sản phẩm vào giỏ hàng')
                        try {
                          // Dispatch event để cập nhật số lượng giỏ hàng trên header
                          window.dispatchEvent(new CustomEvent('cartUpdated'))
                        } catch (e) {
                          toast.error('Lỗi cập nhật giỏ hàng')
                        }
                      }}
                    >
                      Thêm vào giỏ
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* === PHÂN TRANG === */}
      <Stack spacing={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 10, mb: 10 }}>
        <Pagination
          count={totalPages}
          page={safePage}
          onChange={(e, v) => setCurrentPage(v)}
          variant="outlined"
          color="primary"
        />
      </Stack>

      <Footer />
    </Box>
  )
}
