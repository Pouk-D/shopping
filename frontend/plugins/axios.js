export default function ({ $axios, store }) {
  $axios.onRequest(config => {
    const token = store.state.auth.token || (process.client && localStorage.getItem('token'))
    if (token) config.headers.Authorization = `Bearer ${token}`
  })

  $axios.onError(error => {
    if (error.response?.status === 401 && process.client) {
      store.commit('auth/LOGOUT')
      redirect('/login')
    }
    return Promise.reject(error)
  })
}
