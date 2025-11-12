import { useEffect, useState } from 'react'
import { Box, Grid, Card, CardContent, Button, Typography } from '@mui/material'
import { getProductsAPI } from '~/apis/index'
import { Link as RouterLink } from 'react-router-dom'
import '~/styles/Shop.css'

export default function Shop() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getProductsAPI()
        setProducts(data || [])
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load products', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <Box className="shop-page" sx={{ maxWidth: 1100, mx: 'auto', p: 3 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Featured Products</Typography>
        <Typography color="text.secondary">Explore our curated selection of premium aquarium supplies</Typography>
      </Box>

      <Grid container spacing={3}>
        {(products || []).map((p) => (
          <Grid item xs={12} sm={6} md={3} key={p._id || p.id}>
            <Card className="shop-card">
              <RouterLink to={`/products/${p._id || p.id}`} className="card-thumb-link">
                <div className="card-thumb" style={{ backgroundImage: `url(${p.imageUrl || ''})` }} />
              </RouterLink>
              <CardContent>
                <Typography className="card-name">{p.name}</Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                  <Typography className="card-price">{(Number(p.price) || 0).toLocaleString('vi-VN')} đ</Typography>
                  <Button variant="contained" size="small">Add</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
