import { useEffect, useState } from 'react'
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Typography, TextField } from '@mui/material'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import RefreshIcon from '@mui/icons-material/Refresh'
// ProductList was previously used for card/grid view. The product table is the primary list now.
import ProductForm from '~/pages/Admin/Products/ProductForm/ProductForm.jsx'
import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'
import { getProductsAPI, deleteProductAPI, deleteAllProductsAPI, getBranchesAPI } from '~/apis/index'
import { toast } from 'react-toastify'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const fetch = async () => {
    try {
      setLoading(true)
      const data = await getProductsAPI()
      setProducts(data || [])
    } catch (err) {
      // show user friendly error
      // eslint-disable-next-line no-console
      console.error('Failed to fetch products', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchBranches = async () => {
    try {
      const b = await getBranchesAPI()
      setBranches(b || [])
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to fetch branches', err)
    }
  }

  useEffect(() => {
    fetch()
    fetchBranches()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  const handleEdit = (product) => {
    // debug helper: ensure id exists
    if (!product || !(product._id || product.id)) {
      // eslint-disable-next-line no-console
      console.warn('Cannot edit product: missing id', product)
      return
    }
    setEditing(product)
    setOpen(true)
  }

  const handleDelete = async (product) => {
    if (!product || !(product._id || product.id)) {
      // eslint-disable-next-line no-console
      console.warn('Cannot delete product: missing id', product)
      return
    }
    const ok = window.confirm(`Xác nhận xóa sản phẩm "${product.name}"?`)
    if (!ok) return
    try {
      await deleteProductAPI(product._id || product.id)
      // refresh list
      fetch()
      toast.success('Xóa sản phẩm thành công')
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Xóa thất bại')
    }
  }

  const handleDeleteAll = async () => {
    const ok = window.confirm('Xác nhận xóa toàn bộ sản phẩm? (không thể hoàn tác)')
    if (!ok) return
    try {
      await deleteAllProductsAPI()
      fetch()
      toast.success('Đã xóa tất cả sản phẩm')
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Xóa tất cả thất bại')
    }
  }

  const onSuccess = () => {
    // close modal and refresh
    setOpen(false)
    setEditing(null)
    fetch()
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={2} gap={2} >
        <h2>Quản lý sản phẩm</h2>
        <TextField size="small" placeholder="Tìm kiếm sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 260 }} />
        <Box sx={{ flex: 1 }} />
        <IconButton onClick={fetch} title="Làm mới">
          <RefreshIcon />
        </IconButton>
        <Button variant="contained" onClick={handleCreate}>Tạo sản phẩm</Button>
        <Button variant="outlined" color="error" onClick={handleDeleteAll}>Xóa tất cả</Button>
      </Box>

      {/* Product table - primary product listing */}
      <Box mt={2}>
        {loading && <Box mb={2}><Typography>Đang tải sản phẩm...</Typography></Box>}
        <TableContainer component={Paper} sx={{ border: '1px solid #0b8798' }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#0693a6' }}>
              <TableRow>
                <TableCell>Chi nhánh</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(() => {
                const filtered = (products || []).filter((p) => {
                  if (!searchTerm) return true
                  const q = searchTerm.toLowerCase()
                  return (p.name || '').toLowerCase().includes(q) || (p.type || '').toLowerCase().includes(q)
                })
                const total = filtered.length
                const totalPages = Math.max(1, Math.ceil(total / pageSize))
                const safePage = Math.min(Math.max(1, currentPage), totalPages)
                const start = (safePage - 1) * pageSize
                const pageItems = filtered.slice(start, start + pageSize)
                return pageItems.map((p) => (
                  <TableRow key={p._id || p.id}>
                    <TableCell>{branches.find(b => b._id === p.branchesId)?.name || '-'}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.type}</TableCell>
                    <TableCell>{p.price}</TableCell>
                    <TableCell>{p.quantity}</TableCell>
                    <TableCell align="center">
                      <Button size="small" onClick={() => handleEdit(p)}>Sửa</Button>
                      <Button size="small" color="error" onClick={() => handleDelete(p)}>Xóa</Button>
                    </TableCell>
                  </TableRow>
                ))
              })()}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10, mb: 10 }}>
          <Stack spacing={2}>
            <Pagination count={Math.max(1, Math.ceil(((products || []).filter((p) => {
              if (!searchTerm) return true
              const q = searchTerm.toLowerCase()
              return (p.name || '').toLowerCase().includes(q) || (p.type || '').toLowerCase().includes(q)
            })).length / pageSize))} page={currentPage} onChange={(e, v) => setCurrentPage(v)} color="primary" />
          </Stack>
        </Box>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Sửa sản phẩm' : 'Tạo sản phẩm'}</DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <ProductForm initialData={editing} onSuccess={onSuccess} onCancel={() => { setOpen(false); setEditing(null) }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); setEditing(null) }}>Đóng</Button>
        </DialogActions>
      </Dialog>

    </Box>

  )
}
