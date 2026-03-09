export default function ({ store, redirect }) {
  if (process.server) return

  // Restore auth from localStorage if store was cleared by SSR hydration
  if (!store.state.auth.token) {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (token && user) store.commit('auth/SET_AUTH', { token, user })
  }

  if (!store.getters['auth/isAuthenticated']) {
    return redirect('/login')
  }
}
