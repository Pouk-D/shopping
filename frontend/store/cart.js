const STORAGE_KEY = 'cart'

function loadCart() {
  if (!process.client) return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveCart(items) {
  if (process.client) localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const state = () => ({
  items: loadCart()
})

export const getters = {
  cartItems: state => state.items,
  cartTotal: state => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  cartCount: state => state.items.reduce((sum, i) => sum + i.quantity, 0)
}

export const mutations = {
  ADD_TO_CART(state, product) {
    const existing = state.items.find(i => i._id === product._id)
    if (existing) {
      existing.quantity++
    } else {
      state.items.push({ ...product, quantity: 1 })
    }
    saveCart(state.items)
  },
  REMOVE_FROM_CART(state, productId) {
    state.items = state.items.filter(i => i._id !== productId)
    saveCart(state.items)
  },
  UPDATE_QUANTITY(state, { productId, quantity }) {
    const item = state.items.find(i => i._id === productId)
    if (item) {
      item.quantity = quantity
      if (item.quantity <= 0) {
        state.items = state.items.filter(i => i._id !== productId)
      }
    }
    saveCart(state.items)
  },
  CLEAR_CART(state) {
    state.items = []
    saveCart(state.items)
  }
}

export const actions = {
  addToCart({ commit }, product) {
    commit('ADD_TO_CART', product)
  },
  removeFromCart({ commit }, productId) {
    commit('REMOVE_FROM_CART', productId)
  },
  updateQuantity({ commit }, payload) {
    commit('UPDATE_QUANTITY', payload)
  },
  clearCart({ commit }) {
    commit('CLEAR_CART')
  }
}
