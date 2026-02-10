import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Line, LineChart } from 'recharts'
import { Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Box, Typography } from '@mui/material'
import { Inventory as InventoryIcon, Person as PersonIcon } from '@mui/icons-material'
import { getOrdersAPI, getProductsAPI, getCustomersAPI } from '~/apis/index'
import { useEffect, useState } from 'react'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'

export default function Dashboard() {
  const [ordersData, setOrdersData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totals, setTotals] = useState({ products: 0, orders: 0, revenue: 0, customers: 0 })
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())


  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [orders, products, customers] = await Promise.all([
          getOrdersAPI(),
          getProductsAPI(),
          getCustomersAPI()
        ])

        setOrdersData(Array.isArray(orders) ? orders : [])

        const totalProducts = Array.isArray(products) ? products.length : 0
        const totalOrders = Array.isArray(orders) ? orders.length : 0
        const totalRevenue = (orders || []).reduce((s, o) => s + (Number(o.totalPrice) || 0), 0)
        const totalCustomers = Array.isArray(customers)
          ? customers.filter((c) => c.role === 'customer').length
          : 0
        setTotals({ products: totalProducts, orders: totalOrders, revenue: totalRevenue, customers: totalCustomers })
      } catch (err) {
        /* eslint-disable-next-line no-console */
        console.error('Failed to load dashboard data', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // compute available years from orders
  const years = Array.from(new Set((ordersData || []).map(o => {
    try {
      const dateValue = o.createdAt || o.orderDate
      return new Date(dateValue).getFullYear()
    } catch (e) {
      return null
    }
  }).filter(Boolean))).sort((a, b) => b - a)

  // if selectedYear isn't in years, default to the latest year
  useEffect(() => {
    if (years.length && !years.includes(selectedYear)) {
      setSelectedYear(years[0])
    }
  }, [years, selectedYear])

  // monthly aggregation for the selected year
  const monthlyData = (() => {
    const months = Array.from({ length: 12 }, (_, i) => ({ month: `Tháng ${i + 1}`, revenue: 0, orders: 0 }))
      ; (ordersData || []).forEach(o => {
      const dateValue = o.createdAt || o.orderDate
      const date = dateValue ? new Date(dateValue) : null
      if (!date || Number.isNaN(date.getTime())) return
      const y = date.getFullYear()
      if (y !== selectedYear) return
      const m = date.getMonth() // 0-11
      const price = Number(o.totalPrice) || 0
      months[m].revenue += price
      months[m].orders += 1
    })
    return months
  })()
  return (
    <Box>
      <Box sx={{ mt: 10, mb: 10 }}>
        <Grid container spacing={42} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ borderRadius: 3, p: 2, minHeight: 110, minWidth: 300 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ background: '#eef7ff', borderRadius: 1, p: 1.5 }}>
                    <InventoryIcon color="primary" />
                  </Box>
                  <Typography variant="h5" fontWeight={800}>{totals.products ?? 0}</Typography>
                </Box>
                <Typography color="text.secondary" sx={{ mt: 3 }}>Tổng sản phẩm</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ borderRadius: 3, p: 2, minHeight: 110, minWidth: 300 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ background: '#eafaf1', borderRadius: 1, p: 1.5 }}>
                    <MonetizationOnIcon sx={{ color: '#1b9f55' }} />
                  </Box>
                  <Typography variant="h5" fontWeight={800}>{(totals.revenue || 0).toLocaleString('vi-VN')} đ</Typography>
                </Box>
                <Typography color="text.secondary" sx={{ mt: 3 }}>Tổng doanh thu</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ borderRadius: 3, p: 2, minHeight: 110, minWidth: 300 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ background: '#f7eefc', borderRadius: 1, p: 1.5 }}>
                    <ReceiptLongIcon sx={{ color: '#7b4fe6' }} />
                  </Box>
                  <Typography variant="h5" fontWeight={800}>{totals.orders ?? 0}</Typography>
                </Box>
                <Typography color="text.secondary" sx={{ mt: 3 }}>Tổng đơn hàng</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ borderRadius: 3, p: 2, minHeight: 110, minWidth: 300 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ background: '#eef7ff', borderRadius: 1, p: 1.5 }}>
                    <PersonIcon sx={{ color: '#0b8798' }} />
                  </Box>
                  <Typography variant="h5" fontWeight={800}>{totals.customers ?? 0}</Typography>
                </Box>
                <Typography color="text.secondary" sx={{ mt: 3 }}>Tổng khách hàng</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3} sx={{ mb: 20, mt: 10 }}>
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Biểu đồ theo năm</Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="select-year-label">Năm</InputLabel>
                  <Select
                    labelId="select-year-label"
                    value={selectedYear}
                    label="Năm"
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    {years.length
                      ? years.map((y) => (
                        <MenuItem key={y} value={y}>
                          {y}
                        </MenuItem>
                      ))
                      : (
                        <MenuItem value={new Date().getFullYear()}>{new Date().getFullYear()}</MenuItem>
                      )}
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Doanh thu</Typography>
              <ResponsiveContainer width="100%" height={420}>
                <BarChart data={monthlyData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis label={{ value: 'Doanh thu', angle: 90, position: 'insideLeft', dy: -40, dx: -10 }} />
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')} đ`} />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#0b8798" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Số đơn</Typography>
              <ResponsiveContainer width="100%" height={420}>
                <LineChart data={monthlyData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis label={{ value: 'Số đơn', angle: 90, position: 'insideLeft', dy: -10, dx: -10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" name="Số đơn" stroke="#ff7300" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}