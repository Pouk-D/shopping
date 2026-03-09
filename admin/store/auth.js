export const state = () => ({
  token: process.client ? localStorage.getItem('admin_token') || null : null,
  user:  process.client ? JSON.parse(localStorage.getItem('admin_user') || 'null') : null
})

export const getters = {
  isAuthenticated: s => !!s.token && (s.user?.role === 'admin' || s.user?.role === 'super_admin'),
  isSuperAdmin:    s => s.user?.role === 'super_admin',
  currentUser:     s => s.user
}

export const mutations = {
  SET_AUTH(state, { token, user }) {
    state.token = token
    state.user  = user
    if (process.client) {
      localStorage.setItem('admin_token', token)
      localStorage.setItem('admin_user', JSON.stringify(user))
    }
  },
  LOGOUT(state) {
    state.token = null
    state.user  = null
    if (process.client) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
    }
  }
}

export const actions = {
  async login({ commit }, credentials) {
    const { data } = await this.$axios.post('/auth/login', credentials)
    if (data.user.role !== 'admin' && data.user.role !== 'super_admin') throw new Error('Not an admin account')
    commit('SET_AUTH', { token: data.token, user: data.user })
  },
  logout({ commit }) { commit('LOGOUT') }
}
