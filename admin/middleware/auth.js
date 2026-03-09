export default function ({ store, redirect, route }) {
  if (process.server) return
  if (route.path === '/login') return

  // Restore auth from localStorage if store was cleared by SSR hydration
  if (!store.state.auth.token) {
    const token = localStorage.getItem('admin_token')
    const user = JSON.parse(localStorage.getItem('admin_user') || 'null')
    if (token && user) store.commit('auth/SET_AUTH', { token, user })
  }

  const role = store.state.auth.user?.role
  if (!store.state.auth.token || (role !== 'admin' && role !== 'super_admin')) {
    return redirect('/login')
  }
}
