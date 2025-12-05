import axios from 'axios'
import { API_ROOT } from '~/utils/constants'

const client = axios.create({ baseURL: API_ROOT })

// attach token from localStorage for authenticated requests
client.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('auth_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch (err) {
    // ignored - localStorage may not be available in some test contexts
  }
  return config
})

export const registerAPI = async (data) => {
  const response = await client.post('/v1/auth/register', data)
  return response.data
}

export const loginAPI = async (data) => {
  const response = await client.post('/v1/auth/login', data)
  return response.data
}

export const getBranchesAPI = async () => {
  const response = await client.get('/v1/branches')
  return response.data
}

export const createProductAPI = async (data) => {
  const response = await client.post('/v1/products', data)
  return response.data
}

export const getProductsAPI = async () => {
  const response = await client.get('/v1/products')
  return response.data
}

export const getProductAPI = async (id) => {
  const response = await client.get(`/v1/products/${id}`)
  return response.data
}

export const getEmployeesAPI = async () => {
  const response = await client.get('/v1/employees')
  return response.data
}

export const getCustomersAPI = async () => {
  const response = await client.get('/v1/customers')
  return response.data
}

export const getCustomerAPI = async (id) => {
  const response = await client.get(`/v1/customers/${id}`)
  return response.data
}

export const getHeadquaterAPI = async () => {
  const response = await client.get('/v1/headquater')
  return response.data
}

export const updateCustomerAPI = async (id, data) => {
  const response = await client.put(`/v1/customers/${id}`, data)
  return response.data
}

export const deleteCustomerAPI = async (id) => {
  const response = await client.delete(`/v1/customers/${id}`)
  return response.data
}

export const deleteAllCustomersAPI = async () => {
  const response = await client.delete('/v1/customers')
  return response.data
}

export const createEmployeeAPI = async (data) => {
  const response = await client.post('/v1/employees', data)
  return response.data
}

export const updateEmployeeAPI = async (id, data) => {
  const response = await client.put(`/v1/employees/${id}`, data)
  return response.data
}

export const deleteEmployeeAPI = async (id) => {
  const response = await client.delete(`/v1/employees/${id}`)
  return response.data
}

export const deleteAllEmployeesAPI = async () => {
  const response = await client.delete('/v1/employees')
  return response.data
}

export const updateProductAPI = async (id, data) => {
  const response = await client.put(`/v1/products/${id}`, data)
  return response.data
}

export const deleteProductAPI = async (id) => {
  const response = await client.delete(`/v1/products/${id}`)
  return response.data
}

export const deleteAllProductsAPI = async () => {
  const response = await client.delete('/v1/products')
  return response.data
}

export const createOrderAPI = async (data) => {
  const response = await client.post('/v1/orders', data)
  return response.data
}

export const getCustomerOrdersAPI = async () => {
  const response = await client.get('/v1/orders')
  return response.data
}

export const getOrdersAPI = async () => {
  const response = await client.get('/v1/orders')
  return response.data
}

export const updateOrderAPI = async (id, data) => {
  const response = await client.put(`/v1/orders/${id}`, data)
  return response.data
}

export const getOrderAPI = async (id) => {
  const response = await client.get(`/v1/orders/${id}`)
  return response.data
}

export const createOrderDetailAPI = async (data) => {
  const response = await client.post('/v1/order-details', data)
  return response.data
}

export const getOrderDetailsAPI = async (orderId) => {
  const response = await client.get('/v1/order-details', { params: { orderId } })
  return response.data
}

export const getReviewsAPI = async (productId) => {
  const response = await client.get('/v1/reviews', { params: { product_id: productId } })
  return response.data
}

export const createReviewAPI = async (data) => {
  const response = await client.post('/v1/reviews', data)
  return response.data
}