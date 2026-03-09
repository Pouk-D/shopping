export const state = () => ({
  token: process.client ? localStorage.getItem('token') || null : null,
  user: process.client ? JSON.parse(localStorage.getItem('user') || 'null') : null
})

export const getters = {
  isAuthenticated: state => !!state.token,
  isAdmin: state => state.user && state.user.role === 'admin',
  currentUser: state => state.user
}

export const mutations = {
  SET_AUTH(state, { token, user }) {
    state.token = token
    state.user = user
    if (process.client) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    }
  },
  LOGOUT(state) {
    state.token = null
    state.user = null
    if (process.client) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
}

export const actions = {
  async register({ commit }, credentials) {
    const { data } = await this.$axios.post('/auth/register', credentials)
    commit('SET_AUTH', { token: data.token, user: data.user })
  },
  async login({ commit }, credentials) {
    const { data } = await this.$axios.post('/auth/login', credentials)
    commit('SET_AUTH', { token: data.token, user: data.user })
  },
  logout({ commit }) {
    commit('LOGOUT')
  }
}
