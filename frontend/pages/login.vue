<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-header">
        <nuxt-link to="/" class="back-logo">
          <span>🛍</span> ShopZone
        </nuxt-link>
        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-sub">Sign in to your account</p>
      </div>

      <form class="auth-form" @submit.prevent="submit">
        <div class="field">
          <label class="field-label">Email</label>
          <input v-model="form.email" class="input" type="email" placeholder="you@example.com" required />
        </div>
        <div class="field">
          <label class="field-label">Password</label>
          <input v-model="form.password" class="input" type="password" placeholder="••••••••" required />
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <button type="submit" class="btn btn-primary btn-lg btn-block" :disabled="loading">
          <span v-if="loading" class="btn-spinner"></span>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="auth-switch">
        Don't have an account?
        <nuxt-link to="/register" class="auth-link">Create one</nuxt-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { form: { email: '', password: '' }, error: '', loading: false }
  },
  methods: {
    async submit() {
      this.error = ''
      this.loading = true
      try {
        await this.$store.dispatch('auth/login', this.form)
        this.$router.push('/')
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%);
}
.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
}
.auth-header { text-align: center; margin-bottom: 28px; }
.back-logo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 20px;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 24px;
}
.auth-title { font-size: 26px; font-weight: 800; color: var(--text); margin-bottom: 6px; }
.auth-sub { color: var(--text-muted); font-size: 14px; }

.auth-form { display: flex; flex-direction: column; gap: 18px; }
.field { display: flex; flex-direction: column; }

.btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  margin-right: 4px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.auth-switch { text-align: center; margin-top: 24px; font-size: 14px; color: var(--text-muted); }
.auth-link { color: var(--primary); font-weight: 600; }
.auth-link:hover { text-decoration: underline; }

@media (max-width: 480px) {
  .auth-page { padding: 24px 16px; align-items: flex-start; padding-top: 40px; }
  .auth-card { padding: 28px 20px; border-radius: 16px; }
  .auth-title { font-size: 22px; }
}
</style>
