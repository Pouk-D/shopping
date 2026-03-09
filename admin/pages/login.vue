<template>
  <div class="login-card">
    <div class="login-brand">
      <span class="brand-icon">🛍</span>
      <div>
        <div class="brand-name">ShopZone</div>
        <div class="brand-tag">Admin Panel</div>
      </div>
    </div>

    <h1 class="login-title">{{ $t('sign_in_continue') }}</h1>

    <form class="login-form" @submit.prevent="submit">
      <div class="form-field">
        <label class="field-label" style="color: #94a3b8">{{ $t('email') }}</label>
        <input
          v-model="form.email"
          class="login-input"
          type="email"
          placeholder="admin@example.com"
          required
        />
      </div>
      <div class="form-field">
        <label class="field-label" style="color: #94a3b8">{{ $t('password') }}</label>
        <input
          v-model="form.password"
          class="login-input"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <button
        type="submit"
        class="btn btn-primary btn-lg btn-block"
        :disabled="loading"
      >
        <span v-if="loading" class="btn-spinner"></span>
        {{ loading ? $t('signing_in') : $t('sign_in') }}
      </button>
    </form>

    <p class="login-note">{{ $t('admin_access_only') }}</p>
  </div>
</template>

<script>
export default {
  layout: "login",
  middleware: [],
  data() {
    return { form: { email: "", password: "" }, error: "", loading: false };
  },
  methods: {
    async submit() {
      this.error = "";
      this.loading = true;
      try {
        await this.$store.dispatch('auth/login', this.form)
        this.$router.replace("/");
      } catch (err) {
        this.error =
          err.response?.data?.message || err.message || "Login failed";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.login-card {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
}
.login-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}
.brand-icon {
  font-size: 32px;
}
.brand-name {
  font-size: 20px;
  font-weight: 800;
  color: white;
}
.brand-tag {
  font-size: 11px;
  font-weight: 600;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.login-title {
  font-size: 22px;
  font-weight: 700;
  color: white;
  margin-bottom: 24px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-field {
  display: flex;
  flex-direction: column;
}
.login-input {
  padding: 11px 14px;
  background: rgba(255, 255, 255, 0.07);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}
.login-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}
.login-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 4px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-note {
  margin-top: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.25);
  text-align: center;
}
</style>
