export default ({ store }, inject) => {
  inject('t', key => store.getters['locale/t'](key))
}
