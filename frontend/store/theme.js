export const state = () => ({
  dark: process.client ? localStorage.getItem('theme') === 'dark' : false
})

export const mutations = {
  TOGGLE(state) {
    state.dark = !state.dark
    if (process.client) {
      localStorage.setItem('theme', state.dark ? 'dark' : 'light')
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
    const dark = localStorage.getItem('theme') === 'dark'
    commit('RESTORE', dark)
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }
}
