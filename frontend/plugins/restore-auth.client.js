export default ({ store }) => {
  // Restore auth (SSR hydration clears store token)
  if (!store.state.auth.token) {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (token && user) store.commit('auth/SET_AUTH', { token, user })
  }

  // Restore locale
  const locale = localStorage.getItem('locale')
  if (locale) store.commit('locale/SET', locale)
}
