import { getUserFromToken } from './auth'
import { createCartAPI, getMyCartAPI, addItemToCartAPI, updateCartItemAPI, removeCartItemAPI, clearCartAPI } from '../apis/index'

const CART_KEY = 'aqualife_cart_v1'

export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to read cart', err)
    return []
  }
}

export function saveCart(items) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items || []))
    // Thông báo cho các phần khác cập nhật giỏ hàng
    try { window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: (items || []).reduce((s, i) => s + (i.qty || 0), 0) } })) } catch (e) {
      // Bỏ qua lỗi dispatch
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to save cart', err)
  }
}

export function addToCart(product, qty) {
  if (!product) return
  const id = product._id || product.id
  if (!id) return
  const items = getCart()
  const existing = items.find(i => (i.id === id))
  if (existing) {
    existing.qty = (existing.qty || 0) + (qty || 1)
  } else {
    items.push({
      id,
      name: product.name || product.product_name || '',
      price: Number(product.price) || 0,
      imageUrl: product.imageUrl || product.image_url || '',
      qty: qty || 1
    })
  }
  saveCart(items)
  
  // Đồng bộ với backend
  syncAddToCart(id, qty || 1)
}

export function clearCart() { 
  saveCart([])
  syncClear()
}

export function removeFromCart(id) {
  const items = getCart().filter(i => i.id !== id)
  saveCart(items)
  syncRemove(id)
}

export function updateQty(id, qty) {
  const items = getCart()
  const item = items.find(i => i.id === id)
  if (!item) return
  item.qty = qty < 1 ? 1 : qty
  saveCart(items)
  syncUpdateQty(id, item.qty)
}

export function cartCount() {
  return getCart().reduce((s, i) => s + (i.qty || 0), 0)
}

// ===== ĐỒNG BỘ BACKEND =====
let cachedCartId = null

async function getOrCreateCart() {
  try {
    const user = getUserFromToken()
    if (!user || !user.id) {
      console.log('Chưa đăng nhập, không sync cart')
      return null
    }

    if (cachedCartId) return cachedCartId

    try {
      const cartResponse = await getMyCartAPI()
      if (cartResponse && cartResponse._id) {
        cachedCartId = cartResponse._id
        return cachedCartId
      }
    } catch (error) {
      // Nếu chưa có cart, tạo mới
      console.log('Chưa có cart, tạo mới...')
    }

    try {
      const newCartResponse = await createCartAPI()
      if (newCartResponse && newCartResponse._id) {
        cachedCartId = newCartResponse._id
        return cachedCartId
      }
    } catch (error) {
      console.error('Lỗi tạo cart:', error)
    }

    return null
  } catch (error) {
    console.error('Lỗi lấy/tạo cart:', error)
    return null
  }
}

async function syncAddToCart(productId, quantity) {
  try {
    const user = getUserFromToken()
    if (!user || !user.id) {
      console.log('Chưa đăng nhập, chỉ lưu localStorage')
      return
    }

    const cartId = await getOrCreateCart()
    if (!cartId) {
      console.log('Không thể lấy cartId')
      return
    }

    await addItemToCartAPI(cartId, { productId, quantity })
    console.log('✓ Đã đồng bộ thêm sản phẩm vào backend')
  } catch (error) {
    console.error('Lỗi đồng bộ thêm vào cart:', error)
  }
}

async function syncUpdateQty(productId, newQuantity) {
  try {
    const user = getUserFromToken()
    if (!user || !user.id) return

    const cartId = await getOrCreateCart()
    if (!cartId) return

    try {
      const cartResponse = await getMyCartAPI()
      const items = cartResponse?.items || []
      const item = items.find(i => i.productId === productId || i.productId._id === productId)
      
      if (item && item._id) {
        await updateCartItemAPI(item._id, { quantity: newQuantity })
        console.log('✓ Đã đồng bộ cập nhật số lượng')
      }
    } catch (error) {
      console.error('Lỗi lấy items để update:', error)
    }
  } catch (error) {
    console.error('Lỗi đồng bộ cập nhật số lượng:', error)
  }
}

async function syncRemove(productId) {
  try {
    const user = getUserFromToken()
    if (!user || !user.id) return

    const cartId = await getOrCreateCart()
    if (!cartId) return

    try {
      const cartResponse = await getMyCartAPI()
      const items = cartResponse?.items || []
      const item = items.find(i => i.productId === productId || i.productId._id === productId)
      
      if (item && item._id) {
        await removeCartItemAPI(item._id)
        console.log('✓ Đã đồng bộ xóa sản phẩm')
      }
    } catch (error) {
      console.error('Lỗi lấy items để xóa:', error)
    }
  } catch (error) {
    console.error('Lỗi đồng bộ xóa:', error)
  }
}

async function syncClear() {
  try {
    const user = getUserFromToken()
    if (!user || !user.id) return

    const cartId = await getOrCreateCart()
    if (!cartId) return

    await clearCartAPI(cartId)
    cachedCartId = null
    console.log('✓ Đã đồng bộ xóa toàn bộ giỏ hàng')
  } catch (error) {
    console.error('Lỗi đồng bộ xóa giỏ hàng:', error)
  }
}

export default { getCart, saveCart, addToCart, removeFromCart, updateQty, clearCart, cartCount }
