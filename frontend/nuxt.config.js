export default {
  ssr: false,

  head: {
    title: 'ShopZone',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    link: [
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
      }
    ]
  },

  css: ['~/assets/global.css'],

  components: true,

  plugins: [
    '~/plugins/axios.js',
    '~/plugins/i18n.js',
    { src: '~/plugins/restore-auth.client.js', mode: 'client' },
    { src: '~/plugins/theme.js', mode: 'client' },
    { src: '~/plugins/socket.js', mode: 'client' }
  ],

  modules: ['@nuxtjs/axios'],

  axios: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:5000/api/v1'
  },

  env: {
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000/api/v1'
  },

  build: {}
}
