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
    // notify other parts of app
    try { window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: (items || []).reduce((s, i) => s + (i.qty || 0), 0) } })) } catch (e) {}
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
    items.push({ id, name: product.name || '', price: Number(product.price) || 0, imageUrl: product.imageUrl || '', qty: qty || 1 })
  }
  saveCart(items)
}

export function clearCart() { saveCart([]) }

export function removeFromCart(id) {
  const items = getCart().filter(i => i.id !== id)
  saveCart(items)
}

export function updateQty(id, qty) {
  const items = getCart()
  const it = items.find(i => i.id === id)
  if (!it) return
  it.qty = qty < 1 ? 1 : qty
  saveCart(items)
}

export function cartCount() {
  return getCart().reduce((s, i) => s + (i.qty || 0), 0)
}

export default { getCart, saveCart, addToCart, removeFromCart, updateQty, clearCart, cartCount }
