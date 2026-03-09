export const state = () => ({
  dark: process.client ? localStorage.getItem('admin_theme') === 'dark' : false
})

export const mutations = {
  TOGGLE(state) {
    state.dark = !state.dark
    if (process.client) {
      localStorage.setItem('admin_theme', state.dark ? 'dark' : 'light')
      document.documentElement.setAttribute('data-theme', state.dark ? 'dark' : 'light')
    }
  },
  RESTORE(state, dark) {
    state.dark = dark
  }
}

export const actions = {
  init({ commit }) {
    if (!process.client) return
    const dark = localStorage.getItem('admin_theme') === 'dark'
    commit('RESTORE', dark)
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }
}
