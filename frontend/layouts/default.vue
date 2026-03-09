<template>
  <div class="app">
    <header class="header">
      <div class="container header-inner">
        <!-- Logo -->
        <nuxt-link to="/" class="logo" @click.native="closeMenu">
          <span class="logo-icon">🛍</span>
          ShopZone
        </nuxt-link>

        <!-- Desktop nav -->
        <nav class="nav desktop-nav">
          <nuxt-link to="/" class="nav-link" exact>{{ $t('home') }}</nuxt-link>
          <nuxt-link to="/products" class="nav-link">{{ $t('products') }}</nuxt-link>
          <nuxt-link v-if="isAdmin" to="/admin" class="nav-link">Dashboard</nuxt-link>
        </nav>

        <!-- Right actions -->
        <div class="header-actions">
          <!-- Cart (always visible) -->
          <nuxt-link to="/cart" class="cart-btn" @click.native="closeMenu">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <span class="cart-label">Cart</span>
            <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
          </nuxt-link>

          <!-- Theme + Lang -->
          <button class="icon-toggle" :title="dark ? 'Light mode' : 'Dark mode'" @click="$store.commit('theme/TOGGLE')">
            {{ dark ? '☀️' : '🌙' }}
          </button>
          <button class="icon-toggle" @click="$store.commit('locale/SET', locale === 'en' ? 'lo' : 'en')">
            {{ locale === 'en' ? '🇱🇦' : '🇬🇧' }}
          </button>

          <!-- Desktop auth -->
          <div class="desktop-auth">
            <template v-if="isAuthenticated">
              <nuxt-link to="/orders" class="nav-link" style="font-size:13px">{{ $t('orders') }}</nuxt-link>
              <div class="user-menu">
                <span class="user-name">{{ currentUser.name }}</span>
                <button class="btn btn-ghost btn-sm" @click="logout">{{ $t('logout') }}</button>
              </div>
            </template>
            <template v-else>
              <nuxt-link to="/login"    class="btn btn-ghost btn-sm">{{ $t('login') }}</nuxt-link>
              <nuxt-link to="/register" class="btn btn-primary btn-sm">{{ $t('sign_up') }}</nuxt-link>
            </template>
          </div>

          <!-- Hamburger -->
          <button class="hamburger" :class="{ open: menuOpen }" @click="menuOpen = !menuOpen" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <transition name="mobile-menu">
        <div v-if="menuOpen" class="mobile-menu">
          <nuxt-link to="/" class="mobile-link" exact @click.native="closeMenu">🏠 Home</nuxt-link>
          <nuxt-link v-if="isAdmin" to="/admin" class="mobile-link" @click.native="closeMenu">📊 Dashboard</nuxt-link>
          <div class="mobile-divider"></div>
          <template v-if="isAuthenticated">
            <nuxt-link to="/orders" class="mobile-link" @click.native="closeMenu">📋 My Orders</nuxt-link>
            <div class="mobile-user-info">
              <div class="mobile-avatar">{{ currentUser.name.charAt(0).toUpperCase() }}</div>
              <span class="mobile-user-name">{{ currentUser.name }}</span>
            </div>
            <button class="mobile-link mobile-logout" @click="logoutMobile">🚪 Logout</button>
          </template>
          <template v-else>
            <nuxt-link to="/login"    class="mobile-link" @click.native="closeMenu">🔑 Login</nuxt-link>
            <nuxt-link to="/register" class="mobile-link mobile-register" @click.native="closeMenu">✨ Sign Up</nuxt-link>
          </template>
        </div>
      </transition>
    </header>

    <!-- Overlay -->
    <div v-if="menuOpen" class="menu-overlay" @click="closeMenu"></div>

    <main class="main-content">
      <nuxt />
    </main>

    <!-- Chat widget -->
    <ChatWidget />

    <footer class="footer">
      <div class="container">
        <p>&copy; {{ year }} ShopZone. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  data() {
    return { menuOpen: false }
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'isAdmin', 'currentUser']),
    ...mapGetters('cart', ['cartCount']),
    ...mapState('theme', ['dark']),
    ...mapState('locale', ['locale']),
    year() { return new Date().getFullYear() }
  },
  watch: {
    $route() { this.closeMenu() }
  },
  methods: {
    closeMenu() { this.menuOpen = false },
    logout() {
      this.$store.dispatch('auth/logout')
      this.$router.push('/')
    },
    logoutMobile() {
      this.closeMenu()
      this.$store.dispatch('auth/logout')
      this.$router.push('/')
    }
  }
}
</script>

<style>
.app { display: flex; flex-direction: column; min-height: 100vh; }

.icon-toggle {
  background: none; border: 1px solid var(--border); border-radius: 8px;
  padding: 6px 8px; cursor: pointer; font-size: 16px; transition: background .15s;
  flex-shrink: 0;
}
.icon-toggle:hover { background: var(--bg); }

/* ── Header ── */
.header {
  background: var(--card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 200;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}
.header-inner {
  display: flex;
  align-items: center;
  gap: 20px;
  height: 60px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  flex-shrink: 0;
}
.logo-icon { font-size: 20px; }

/* Desktop nav */
.desktop-nav { display: flex; align-items: center; gap: 4px; flex: 1; }
.nav-link {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  transition: all .15s;
}
.nav-link:hover, .nav-link.nuxt-link-active { background: var(--primary-light); color: var(--primary-dark); }

/* Header actions */
.header-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }

/* Cart button */
.cart-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  background: var(--bg);
  border: 1px solid var(--border);
  position: relative;
  transition: all .15s;
  flex-shrink: 0;
}
.cart-btn:hover { border-color: var(--primary); color: var(--primary); }
.cart-badge {
  position: absolute;
  top: -6px; right: -6px;
  background: var(--primary);
  color: white;
  font-size: 10px;
  font-weight: 700;
  width: 18px; height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Desktop auth */
.desktop-auth { display: flex; align-items: center; gap: 10px; }
.user-menu { display: flex; align-items: center; gap: 8px; }
.user-name { font-size: 14px; font-weight: 600; color: var(--text); white-space: nowrap; max-width: 120px; overflow: hidden; text-overflow: ellipsis; }

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  flex-shrink: 0;
}
.hamburger:hover { background: var(--bg); }
.hamburger span {
  display: block;
  width: 100%;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
  transition: all .25s ease;
  transform-origin: center;
}
.hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* Mobile menu */
.mobile-menu {
  background: var(--card);
  border-top: 1px solid var(--border);
  padding: 8px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: 0 8px 24px rgba(0,0,0,.1);
}
.mobile-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text);
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  transition: background .15s;
  font-family: inherit;
}
.mobile-link:hover, .mobile-link.nuxt-link-active { background: var(--primary-light); color: var(--primary-dark); }
.mobile-divider { height: 1px; background: var(--border); margin: 6px 0; }
.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
}
.mobile-avatar {
  width: 34px; height: 34px;
  background: var(--primary-light);
  color: var(--primary-dark);
  border-radius: 50%;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mobile-user-name { font-size: 14px; font-weight: 600; }
.mobile-logout { color: var(--danger); }
.mobile-logout:hover { background: #fee2e2; }
.mobile-register { color: var(--primary); font-weight: 700; }

/* Mobile menu transition */
.mobile-menu-enter-active, .mobile-menu-leave-active { transition: all .2s ease; }
.mobile-menu-enter, .mobile-menu-leave-to { opacity: 0; transform: translateY(-8px); }

/* Overlay */
.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 150;
  background: transparent;
}

.main-content { flex: 1; }

.footer {
  background: var(--card);
  border-top: 1px solid var(--border);
  padding: 20px 0;
  margin-top: 60px;
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
}

/* ── Mobile breakpoints ── */
@media (max-width: 768px) {
  .header-inner { height: 56px; gap: 12px; }
  .desktop-nav  { display: none; }
  .desktop-auth { display: none; }
  .hamburger    { display: flex; }
  .cart-label   { display: none; }
  .cart-btn     { padding: 8px 10px; }
  .logo         { font-size: 16px; }
  .footer       { margin-top: 40px; }
}
</style>
