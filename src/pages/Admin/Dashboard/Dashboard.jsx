import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, Line, ComposedChart } from 'recharts'
import { Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Box, Typography } from '@mui/material'
import { Inventory as InventoryIcon, People as PeopleIcon, Person as PersonIcon } from '@mui/icons-material'
import { getOrdersAPI, getProductsAPI, getCustomersAPI } from '~/apis/index'
import { useEffect, useState } from 'react'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'

export default function Dashboard() {
  const [branches, setBranches] = useState([])
  const [ordersData, setOrdersData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totals, setTotals] = useState({ products: 0, orders: 0, revenue: 0, employees: 0, customers: 0 })
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())


  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [data, orders, employees, products, customers] = await Promise.all([getOrdersAPI(), getProductsAPI(), getCustomersAPI()])
        // compute per-branch aggregates from orders
        const ordersByBranch = {}
          ; (orders || []).forEach(o => {
          const bId = o.branchesId || o.branchId || ''
          const bid = bId && (bId._id || bId.id) ? (bId._id || bId.id) : String(bId)
          if (!ordersByBranch[bid]) ordersByBranch[bid] = { revenue: 0, orders: 0, customers: new Set() }
          const price = Number(o.totalPrice) || 0
          ordersByBranch[bid].revenue += price
          ordersByBranch[bid].orders += 1
          const custId = o.customersId && (o.customersId._id || o.customersId) ? (o.customersId._id || o.customersId) : String(o.customersId || o.customerId || o.customer)
          if (custId) ordersByBranch[bid].customers.add(String(custId))
        })

        // merge aggregates into branch objects
        const enriched = (data || []).map(b => {
          const id = b._id || b.id || ''
          const ag = ordersByBranch[String(id)] || { revenue: 0, orders: 0, customers: new Set() }
          const revenue = ag.revenue || 0
          const ordersCount = ag.orders || 0
          const customersCount = ag.customers ? ag.customers.size : 0
          const avgOrder = ordersCount ? Math.round((revenue / ordersCount) * 100) / 100 : 0
          // compute employees per branch (employees may reference branch by branchesId or branchId)
          let empCount = 0
          try {
            empCount = (employees || []).reduce((acc, emp) => {
              const bid = emp.branchesId && (emp.branchesId._id || emp.branchesId) ? (emp.branchesId._id || emp.branchesId) : (emp.branchId || emp.branch)
              if (String(bid) === String(id)) return acc + 1
              return acc
            }, 0)
          } catch (e) {
            empCount = 0
          }

          return { ...b, revenue, orders: ordersCount, customers: customersCount, avgOrder, employees: empCount }
        })

        // store orders for later aggregations (monthly)
        setOrdersData(Array.isArray(orders) ? orders : [])

        // compute totals for the top summary cards
        const totalProducts = Array.isArray(products) ? products.length : 0
        const totalOrders = Array.isArray(orders) ? orders.length : 0
        const totalRevenue = (orders || []).reduce((s, o) => s + (Number(o.totalPrice) || 0), 0)
        const totalEmployees = Array.isArray(employees) ? employees.length : 0
        const totalCustomers = Array.isArray(customers) ? customers.length : 0
        setTotals({ products: totalProducts, orders: totalOrders, revenue: totalRevenue, employees: totalEmployees, customers: totalCustomers })

        const maxRevenue = Math.max(0, ...enriched.map(x => Number(x.revenue) || 0))
        const withProgress = enriched.map(x => ({ ...x, progress: maxRevenue ? Math.round((Number(x.revenue) / maxRevenue) * 100) : 0 }))
        setBranches(withProgress)
      } catch (err) {
        /* eslint-disable-next-line no-console */
        console.error('Failed to load branches', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // compute available years from orders
  const years = Array.from(new Set((ordersData || []).map(o => {
    try {
      return new Date(o.orderDate).getFullYear()
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
      const date = o.orderDate ? new Date(o.orderDate) : null
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
                  <Box sx={{ background: '#fff4e6', borderRadius: 1, p: 1.5 }}>
                    <PeopleIcon sx={{ color: '#e67a00' }} />
                  </Box>
                  <Typography variant="h5" fontWeight={800}>{totals.employees ?? 0}</Typography>
                </Box>
                <Typography color="text.secondary" sx={{ mt: 3 }}>Tổng nhân viên</Typography>
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

      {/* Charts row */}
      {branches && branches.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 20, mt: 10 }}>
          {/* Monthly sales chart (select year) */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, p: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Doanh thu</Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="select-year-label">Năm</InputLabel>
                    <Select
                      labelId="select-year-label"
                      value={selectedYear}
                      label="Năm"
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                      {years.length ? years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>) : <MenuItem value={new Date().getFullYear()}>{new Date().getFullYear()}</MenuItem>}
                    </Select>
                  </FormControl>
                </Box>
                <ResponsiveContainer width="100%" height={500}>
                  <ComposedChart data={monthlyData} margin={{ top: 50, right: 50, left: 50, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" domain={['auto', 'auto']} label={{ value: 'Doanh thu', angle: 90, position: 'insideLeft', dy: -40, dx: -30 }} />
                    <YAxis yAxisId="right" domain={['auto', 'auto']} orientation="right" label={{ value: 'Số đơn', angle: 90, position: 'insideRight', dy: 0 }} />
                    <Tooltip formatter={(value, name) => {
                      if (!name) return [value]
                      if (String(name).toLowerCase().includes('doanh')) return [`${Number(value).toLocaleString('vi-VN')} đ`, name]
                      return [value, name]
                    }} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ height: 1 }} />
                    <Bar dataKey="revenue" name="Doanh thu" yAxisId="left" barSize={20} fill="#0b8798" />
                    <Line type="monotone" dataKey="orders" name="Số đơn" yAxisId="right" stroke="#ff7300" strokeWidth={3} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Branches performance */}
      <Box sx={{ mt: 20, mb: 10 }}>
        <Box mt={3}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 5, mt: 10 }}>Hiệu suất bán hàng chi nhánh</Typography>
          <Grid container spacing={3}>
            {loading ? (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography>Đang tải...</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (branches.length > 0 ? branches.map((b) => (
              <Grid item xs={12} key={b._id || b.id}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 10px 30px rgba(15,50,60,0.06)', background: '#fff' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h6">{b.name}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ background: '#fff', borderRadius: 2, p: 2, mt: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ background: '#e8fbfb', p: 2.25, borderRadius: 1, minHeight: 70 }}>
                            <Typography variant="caption">Doanh thu</Typography>
                            <Typography sx={{ fontWeight: 700 }}>{(Number(b.revenue) || 0).toLocaleString('vi-VN')} đ</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ background: '#e8fbfb', p: 2.25, borderRadius: 1, minHeight: 70 }}>
                            <Typography variant="caption">Đơn hàng</Typography>
                            <Typography fontWeight={700}>{b.orders ?? '-'}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ background: '#e8fbfb', p: 2.25, borderRadius: 1, minHeight: 70 }}>
                            <Typography variant="caption">Khách hàng</Typography>
                            <Typography fontWeight={700}>{b.customers ?? '-'}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ background: '#e8fbfb', p: 2.25, borderRadius: 1, minHeight: 70 }}>
                            <Typography variant="caption">Nhân viên</Typography>
                            <Typography fontWeight={700}>{b.employees ?? '-'}</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )) : null)}
          </Grid>
        </Box>
      </Box>

      {/* Charts row */}
      {branches && branches.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 10, mt: 10 }}>
          {/* Sales by branch pie chart */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, p: 2, minHeight: 280 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 10 }}>Doanh thu theo chi nhánh</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={(branches || []).map(b => ({ name: b.name, revenue: Number(b.revenue) || 0 }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')} đ`} />
                    <Bar dataKey="revenue" fill="#0b8798" name="Doanh thu" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Pie chart for orders by branch */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, p: 2, minHeight: 280 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 10 }}>Tỷ lệ đơn hàng theo chi nhánh</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={(branches || []).map(b => ({ name: b.name, value: Number(b.orders) || 0 }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                      {(branches || []).map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={['#82ca9d', '#8884d8', '#ffc658', '#ff7f50', '#8dd1e1'][idx % 5]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}