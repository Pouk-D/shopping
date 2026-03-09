export const state = () => ({
  products: [],
  product: null,
  categories: [],
  total: 0,
  page: 1,
  pages: 1,
  loading: false
})

export const mutations = {
  SET_PRODUCTS(state, { products, total, page, pages }) {
    state.products = products
    state.total = total
    state.page = page
    state.pages = pages
  },
  SET_PRODUCT(state, product) {
    state.product = product
  },
  SET_CATEGORIES(state, categories) {
    state.categories = categories
  },
  SET_LOADING(state, val) {
    state.loading = val
  }
}

export const actions = {
  async fetchProducts({ commit }, params = {}) {
    commit('SET_LOADING', true)
    try {
      const { data } = await this.$axios.get('/products', { params })
      commit('SET_PRODUCTS', data)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async fetchProduct({ commit }, id) {
    commit('SET_LOADING', true)
    try {
      const { data } = await this.$axios.get(`/products/${id}`)
      commit('SET_PRODUCT', data)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async fetchCategories({ commit }) {
    const { data } = await this.$axios.get('/categories')
    commit('SET_CATEGORIES', data)
  },
  async createProduct(_, productData) {
    const { data } = await this.$axios.post('/products', productData)
    return data
  },
  async updateProduct(_, { id, productData }) {
    const { data } = await this.$axios.put(`/products/${id}`, productData)
    return data
  },
  async deleteProduct(_, id) {
    await this.$axios.delete(`/products/${id}`)
  }
}
