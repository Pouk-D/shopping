<template>
  <div class="page-wrap">
    <!-- Stat cards -->
    <div class="stats-grid">
      <div class="stat-card card" v-for="s in statCards" :key="s.label">
        <div class="stat-top">
          <div class="stat-icon" :style="{ background: s.bg }">{{ s.icon }}</div>
          <div class="stat-info">
            <div class="stat-value">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Recent orders -->
      <div class="card panel">
        <div class="panel-header">
          <h2 class="panel-title">{{ $t('recent_orders') }}</h2>
          <nuxt-link to="/orders" class="btn btn-ghost btn-sm">{{ $t('view_all') }}</nuxt-link>
        </div>
        <div v-if="loadingOrders" class="loading-center"><div class="spinner"></div></div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>{{ $t('order_id') }}</th>
              <th>{{ $t('customer') }}</th>
              <th>{{ $t('total') }}</th>
              <th>{{ $t('status') }}</th>
              <th>{{ $t('date') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="recentOrders.length === 0">
              <td colspan="5" style="text-align:center;padding:32px;color:var(--text-muted)">{{ $t('no_orders_yet') }}</td>
            </tr>
            <tr v-for="o in recentOrders" :key="o._id">
              <td><span class="mono">#{{ o._id.slice(-6).toUpperCase() }}</span></td>
              <td>{{ o.user && o.user.name }}</td>
              <td><strong>${{ o.totalAmount.toFixed(2) }}</strong></td>
              <td><span :class="['badge', statusBadge(o.status)]">{{ o.status }}</span></td>
              <td class="text-muted">{{ formatDate(o.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Top products + recent users -->
      <div class="side-panels">
        <!-- Low stock alert -->
        <div class="card panel">
          <div class="panel-header">
            <h2 class="panel-title">⚠ {{ $t('low_stock') }}</h2>
            <nuxt-link to="/products" class="btn btn-ghost btn-sm">{{ $t('manage') }}</nuxt-link>
          </div>
          <div v-if="loadingProducts" class="loading-center" style="padding:20px 0"><div class="spinner" style="width:24px;height:24px"></div></div>
          <div v-else-if="lowStockProducts.length === 0" class="empty-panel">{{ $t('all_stocked') }}</div>
          <div v-else>
            <div v-for="p in lowStockProducts" :key="p._id" class="low-stock-row">
              <img :src="p.image || 'https://via.placeholder.com/40?text=?'" class="low-stock-img" />
              <div class="low-stock-info">
                <div class="low-stock-name">{{ p.name }}</div>
                <div class="low-stock-cat">{{ p.category && p.category.name }}</div>
              </div>
              <span :class="['badge', p.stock === 0 ? 'badge-danger' : 'badge-warning']">
                {{ p.stock === 0 ? $t('out_of_stock') : `${p.stock} left` }}
              </span>
            </div>
          </div>
        </div>

        <!-- Recent users -->
        <div class="card panel">
          <div class="panel-header">
            <h2 class="panel-title">{{ $t('recent_users') }}</h2>
            <nuxt-link to="/users" class="btn btn-ghost btn-sm">{{ $t('view_all') }}</nuxt-link>
          </div>
          <div v-if="loadingUsers" class="loading-center" style="padding:20px 0"><div class="spinner" style="width:24px;height:24px"></div></div>
          <div v-else>
            <div v-for="u in recentUsers" :key="u._id" class="user-row">
              <div class="user-avatar">{{ u.name.charAt(0).toUpperCase() }}</div>
              <div class="user-info">
                <div class="user-name">{{ u.name }}</div>
                <div class="user-email">{{ u.email }}</div>
              </div>
              <span :class="['badge', u.role === 'admin' ? 'badge-primary' : 'badge-gray']">{{ u.role }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      stats: { totalUsers: 0, totalOrders: 0, totalRevenue: 0 },
      recentOrders: [],
      allProducts: [],
      recentUsers: [],
      loadingOrders: true,
      loadingProducts: true,
      loadingUsers: true
    }
  },
  computed: {
    statCards() {
      return [
        { icon: '💰', label: this.$t('total_revenue'), value: '$' + Number(this.stats.totalRevenue).toFixed(2), bg: '#d1fae5' },
        { icon: '📋', label: this.$t('total_orders'), value: this.stats.totalOrders, bg: '#dbeafe' },
        { icon: '📦', label: this.$t('products'), value: this.allProducts.length, bg: '#ede9fe' },
        { icon: '👥', label: this.$t('total_users'), value: this.stats.totalUsers, bg: '#fef3c7' }
      ]
    },
    lowStockProducts() {
      return this.allProducts.filter(p => p.stock <= 5).slice(0, 6)
    }
  },
  async fetch() {
    await Promise.all([this.loadStats(), this.loadOrders(), this.loadProducts(), this.loadUsers()])
  },
  methods: {
    async loadStats() {
      try {
        const { data } = await this.$axios.get('/users/stats')
        this.stats = data
      } catch {}
    },
    async loadOrders() {
      try {
        const { data } = await this.$axios.get('/orders')
        this.recentOrders = data.slice(0, 8)
      } catch {} finally { this.loadingOrders = false }
    },
    async loadProducts() {
      try {
        const { data } = await this.$axios.get('/products', { params: { limit: 100 } })
        this.allProducts = data.products || []
      } catch {} finally { this.loadingProducts = false }
    },
    async loadUsers() {
      try {
        const { data } = await this.$axios.get('/users')
        this.recentUsers = data.slice(0, 5)
      } catch {} finally { this.loadingUsers = false }
    },
    formatDate(d) {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    statusBadge(s) {
      return { pending: 'badge-warning', processing: 'badge-info', shipped: 'badge-primary', delivered: 'badge-success', cancelled: 'badge-danger' }[s] || 'badge-gray'
    }
  }
}
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
@media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

.stat-card { padding: 20px 22px; }
.stat-top { display: flex; align-items: center; gap: 16px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; font-size: 22px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-value { font-size: 26px; font-weight: 800; color: var(--text); line-height: 1; }
.stat-label { font-size: 13px; color: var(--text-muted); margin-top: 4px; font-weight: 500; }

.dashboard-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; align-items: start; }
@media (max-width: 1000px) { .dashboard-grid { grid-template-columns: 1fr; } }

.panel { overflow: hidden; }
.panel-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px 14px; border-bottom: 1px solid var(--border); }
.panel-title { font-size: 15px; font-weight: 700; }

.side-panels { display: flex; flex-direction: column; gap: 20px; }

.mono { font-family: monospace; font-size: 13px; font-weight: 700; }
.text-muted { color: var(--text-muted); font-size: 13px; }

.empty-panel { padding: 24px 20px; font-size: 14px; color: var(--text-muted); text-align: center; }

/* Low stock */
.low-stock-row { display: flex; align-items: center; gap: 12px; padding: 12px 20px; border-bottom: 1px solid var(--border); }
.low-stock-row:last-child { border-bottom: none; }
.low-stock-img { width: 40px; height: 40px; object-fit: cover; border-radius: 8px; background: var(--bg); flex-shrink: 0; }
.low-stock-info { flex: 1; min-width: 0; }
.low-stock-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.low-stock-cat  { font-size: 11px; color: var(--text-muted); }

/* Users */
.user-row { display: flex; align-items: center; gap: 12px; padding: 12px 20px; border-bottom: 1px solid var(--border); }
.user-row:last-child { border-bottom: none; }
.user-avatar {
  width: 36px; height: 36px; border-radius: 50%; background: var(--primary-light);
  color: var(--primary-dark); font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.user-info { flex: 1; min-width: 0; }
.user-name  { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-email { font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
