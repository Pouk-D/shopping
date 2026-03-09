<template>
  <div class="admin-shell">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-logo">
        <span class="logo-icon">🛍</span>
        <span class="logo-text">ShopZone</span>
        <span class="logo-tag">Admin</span>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">Main</div>
        <nuxt-link to="/" class="nav-item" exact>
          <span class="nav-icon">📊</span>
          <span class="nav-text">Dashboard</span>
        </nuxt-link>
        <nuxt-link to="/orders" class="nav-item">
          <span class="nav-icon">📋</span>
          <span class="nav-text">Orders</span>
          <span v-if="pendingOrders > 0" class="nav-badge">{{ pendingOrders }}</span>
        </nuxt-link>
        <nuxt-link to="/products" class="nav-item">
          <span class="nav-icon">📦</span>
          <span class="nav-text">Products</span>
        </nuxt-link>
        <nuxt-link to="/categories" class="nav-item">
          <span class="nav-icon">🏷</span>
          <span class="nav-text">Categories</span>
        </nuxt-link>
        <nuxt-link to="/customers" class="nav-item">
          <span class="nav-icon">🧑‍💼</span>
          <span class="nav-text">{{ $t('customers') }}</span>
        </nuxt-link>
        <nuxt-link v-if="isSuperAdmin" to="/users" class="nav-item">
          <span class="nav-icon">👥</span>
          <span class="nav-text">{{ $t('users') }}</span>
        </nuxt-link>
        <nuxt-link to="/chat" class="nav-item">
          <span class="nav-icon">💬</span>
          <span class="nav-text">{{ $t('chat') }}</span>
          <span v-if="openChats > 0" class="nav-badge">{{ openChats }}</span>
        </nuxt-link>
        <nuxt-link to="/reports" class="nav-item">
          <span class="nav-icon">📈</span>
          <span class="nav-text">{{ $t('reports') }}</span>
        </nuxt-link>
      </nav>

      <div class="sidebar-footer">
        <div class="admin-user">
          <div class="admin-avatar">{{ avatarLetter }}</div>
          <div class="admin-info">
            <div class="admin-name">{{ currentUser && currentUser.name }}</div>
            <div class="admin-role">Administrator</div>
          </div>
        </div>
        <button class="logout-btn" title="Logout" @click="logout">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="main-area">
      <!-- Top bar -->
      <header class="topbar">
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div class="topbar-title">{{ pageTitle }}</div>
        <div class="topbar-right">
          <!-- Language toggle -->
          <button class="icon-btn" :title="locale === 'en' ? 'Switch to Lao' : 'Switch to English'" @click="toggleLocale">
            <span class="lang-flag">{{ locale === 'en' ? '🇬🇧' : '🇱🇦' }}</span>
            <span class="lang-label">{{ locale === 'en' ? 'EN' : 'ລາວ' }}</span>
          </button>
          <!-- Theme toggle -->
          <button class="icon-btn" :title="dark ? 'Light mode' : 'Dark mode'" @click="toggleTheme">
            <span>{{ dark ? '☀️' : '🌙' }}</span>
          </button>
          <a href="http://localhost:3000" target="_blank" class="store-link btn btn-ghost btn-sm">
            {{ $t('view_store') }} ↗
          </a>
        </div>
      </header>

      <!-- Page content -->
      <main class="content">
        <nuxt />
      </main>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  data() {
    return { sidebarCollapsed: false, pendingOrders: 0, openChats: 0 }
  },
  computed: {
    ...mapGetters('auth', ['currentUser', 'isSuperAdmin']),
    ...mapState('theme', ['dark']),
    ...mapState('locale', ['locale']),
    avatarLetter() {
      return this.currentUser?.name?.charAt(0).toUpperCase() || 'A'
    },
    pageTitle() {
      const map = {
        '/': this.$t('dashboard'), '/orders': this.$t('orders'),
        '/products': this.$t('products'), '/categories': this.$t('categories'),
        '/users': this.$t('users'), '/customers': this.$t('customers'),
        '/chat': this.$t('chat'), '/reports': this.$t('reports')
      }
      return map[this.$route.path] || 'Admin'
    }
  },
  async mounted() {
    try {
      const [ordersRes, chatRes] = await Promise.all([
        this.$axios.get('/orders'),
        this.$axios.get('/chat/rooms')
      ])
      this.pendingOrders = ordersRes.data.filter(o => o.status === 'pending').length
      this.openChats = chatRes.data.filter(r => r.status === 'open').length
    } catch {}

    // Socket — notify admin of new rooms
    const token = this.$store.state.auth.token
    if (token) {
      const socket = this.$connectSocket(token)
      socket.on('new_room', () => { this.openChats++ })
      socket.on('room_updated', (room) => {
        if (room.status === 'closed') this.openChats = Math.max(0, this.openChats - 1)
      })
    }
  },
  methods: {
    logout() {
      this.$disconnectSocket()
      this.$store.dispatch('auth/logout')
      this.$router.push('/login')
    },
    toggleTheme() { this.$store.commit('theme/TOGGLE') },
    toggleLocale() {
      this.$store.commit('locale/SET', this.locale === 'en' ? 'lo' : 'en')
    }
  }
}
</script>

<style>
body { overflow-x: hidden; }

.admin-shell { display: flex; min-height: 100vh; }

/* ── Sidebar ── */
.sidebar {
  width: var(--sidebar-w);
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
  transition: width .25s ease;
  overflow: hidden;
}
.sidebar.collapsed { width: 64px; }

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 18px;
  border-bottom: 1px solid rgba(255,255,255,.07);
  flex-shrink: 0;
}
.logo-icon { font-size: 22px; flex-shrink: 0; }
.logo-text { font-size: 17px; font-weight: 800; color: white; white-space: nowrap; }
.logo-tag {
  background: var(--primary);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: .05em;
  white-space: nowrap;
}
.collapsed .logo-text,
.collapsed .logo-tag { display: none; }

.sidebar-nav { flex: 1; padding: 16px 10px; overflow-y: auto; }
.nav-section-label {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,.25);
  text-transform: uppercase;
  letter-spacing: .1em;
  padding: 0 8px;
  margin-bottom: 6px;
}
.collapsed .nav-section-label { visibility: hidden; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 8px;
  color: var(--sidebar-text);
  font-size: 14px;
  font-weight: 500;
  transition: all .15s;
  margin-bottom: 2px;
  position: relative;
}
.nav-item:hover { background: rgba(255,255,255,.07); color: white; }
.nav-item.nuxt-link-active { background: rgba(99,102,241,.25); color: #a5b4fc; }
.nav-icon { font-size: 18px; flex-shrink: 0; width: 24px; text-align: center; }
.nav-text { white-space: nowrap; }
.collapsed .nav-text { display: none; }
.nav-badge {
  background: var(--danger);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  margin-left: auto;
}
.collapsed .nav-badge { position: absolute; top: 6px; right: 6px; }

.sidebar-footer {
  border-top: 1px solid rgba(255,255,255,.07);
  padding: 14px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.admin-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.admin-info { min-width: 0; }
.collapsed .admin-info { display: none; }
.admin-name { font-size: 13px; font-weight: 600; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.admin-role { font-size: 11px; color: rgba(255,255,255,.35); }
.logout-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: rgba(255,255,255,.35);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all .15s;
  flex-shrink: 0;
}
.logout-btn:hover { color: white; background: rgba(255,255,255,.1); }
.collapsed .logout-btn { margin-left: 0; }

/* ── Main ── */
.main-area {
  flex: 1;
  margin-left: var(--sidebar-w);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left .25s ease;
}
.sidebar.collapsed ~ .main-area { margin-left: 64px; }

.topbar {
  height: var(--header-h);
  background: var(--card);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 50;
}
.collapse-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 6px;
  border-radius: 6px;
}
.collapse-btn:hover { background: var(--bg); }
.topbar-title { font-size: 16px; font-weight: 700; color: var(--text); }
.topbar-right { margin-left: auto; display: flex; align-items: center; gap: 6px; }
.store-link { font-size: 12px; }
.icon-btn {
  display: flex; align-items: center; gap: 4px;
  background: none; border: 1px solid var(--border); border-radius: 8px;
  padding: 6px 10px; cursor: pointer; font-size: 13px; font-weight: 600;
  color: var(--text-muted); transition: all .15s;
}
.icon-btn:hover { background: var(--bg); color: var(--text); }
.lang-label { font-size: 11px; font-weight: 700; }

.content { flex: 1; }
</style>
