import axios from 'axios'
import { API_ROOT } from '~/utils/constants'

export const registerAPI = async (data) => {
  const response = await axios.post(`${API_ROOT}/v1/auth/register`, data)
  return response.data
}

export const loginAPI = async (data) => {
  const response = await axios.post(`${API_ROOT}/v1/auth/login`, data)
  return response.data
}