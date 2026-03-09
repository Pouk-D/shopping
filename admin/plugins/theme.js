export default ({ store }) => {
  if (process.client) store.dispatch('theme/init')
}
