<template>
  <div class="page-wrap">
    <div class="page-header">
      <h1 class="page-title">{{ $t('customer_list') }}</h1>
      <input v-model="search" class="input" :placeholder="$t('search') + ' …'" style="width:240px" />
    </div>

    <div class="summary-cards">
      <div class="summary-card card">
        <div class="s-value">{{ customers.length }}</div>
        <div class="s-label">{{ $t('total_customers') }}</div>
      </div>
      <div class="summary-card card">
        <div class="s-value">{{ withOrders }}</div>
        <div class="s-label">{{ $t('orders_count') }} > 0</div>
      </div>
      <div class="summary-card card">
        <div class="s-value">${{ totalRevenue }}</div>
        <div class="s-label">{{ $t('total_revenue') }}</div>
      </div>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner"></div></div>

    <div v-else class="card">
      <table class="table">
        <thead>
          <tr>
            <th>{{ $t('name') }}</th>
            <th>{{ $t('email') }}</th>
            <th>{{ $t('orders_count') }}</th>
            <th>{{ $t('total_spent') }}</th>
            <th>{{ $t('last_order') }}</th>
            <th>{{ $t('joined') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="6" style="text-align:center;padding:48px;color:var(--text-muted)">{{ $t('no_data') }}</td>
          </tr>
          <tr v-for="c in filtered" :key="c._id">
            <td>
              <div class="cust-cell">
                <div class="cust-av" :style="{ background: avatarColor(c.name) }">{{ c.name.charAt(0).toUpperCase() }}</div>
                <span class="cust-name">{{ c.name }}</span>
              </div>
            </td>
            <td class="text-muted">{{ c.email }}</td>
            <td><strong>{{ orderCount(c._id) }}</strong></td>
            <td><strong class="revenue">${{ spent(c._id) }}</strong></td>
            <td class="text-muted">{{ lastOrder(c._id) }}</td>
            <td class="text-muted">{{ formatDate(c.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { customers: [], orders: [], loading: true, search: '' }
  },
  computed: {
    filtered() {
      const q = this.search.toLowerCase()
      return this.customers.filter(c => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
    },
    withOrders() { return this.customers.filter(c => this.orderCount(c._id) > 0).length },
    totalRevenue() {
      return this.orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0).toFixed(2)
    }
  },
  async fetch() {
    try {
      const [usersRes, ordersRes] = await Promise.all([
        this.$axios.get('/users', { params: { role: 'user' } }),
        this.$axios.get('/orders')
      ])
      this.customers = usersRes.data
      this.orders = ordersRes.data
    } catch {} finally { this.loading = false }
  },
  methods: {
    orderCount(id) { return this.orders.filter(o => o.user?._id === id || o.user === id).length },
    spent(id) {
      return this.orders
        .filter(o => (o.user?._id === id || o.user === id) && o.status !== 'cancelled')
        .reduce((s, o) => s + o.totalAmount, 0).toFixed(2)
    },
    lastOrder(id) {
      const orders = this.orders.filter(o => o.user?._id === id || o.user === id)
      if (!orders.length) return '—'
      const latest = orders.reduce((a, b) => a.createdAt > b.createdAt ? a : b)
      return this.formatDate(latest.createdAt)
    },
    formatDate(d) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
    avatarColor(name) {
      const c = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444']
      return c[name.charCodeAt(0) % c.length]
    }
  }
}
</script>

<style scoped>
.summary-cards { display: grid; grid-template-columns: repeat(3,1fr); gap:16px; margin-bottom:24px; }
.summary-card { padding:20px 24px; text-align:center; }
.s-value { font-size:32px; font-weight:800; color:var(--primary); }
.s-label { font-size:13px; color:var(--text-muted); font-weight:500; margin-top:4px; }
.cust-cell { display:flex; align-items:center; gap:10px; }
.cust-av { width:34px; height:34px; border-radius:50%; color:white; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.cust-name { font-size:14px; font-weight:600; }
.text-muted { font-size:13px; color:var(--text-muted); }
.revenue { color:var(--primary); }
</style>
