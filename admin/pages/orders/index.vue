<template>
  <div class="page-wrap">
    <div class="page-header">
      <h1 class="page-title">{{ $t('orders') }}</h1>
      <div class="filter-row">
        <select v-model="filterStatus" class="input" style="width:160px">
          <option value="">{{ $t('all_statuses') }}</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
        <input v-model="search" class="input" :placeholder="$t('search') + ' ID / email...'" style="width:240px" />
      </div>
    </div>

    <!-- Status tabs -->
    <div class="status-tabs">
      <button
        v-for="tab in statusTabs"
        :key="tab.key"
        class="status-tab"
        :class="{ active: filterStatus === tab.key }"
        @click="filterStatus = tab.key"
      >
        {{ tab.label }}
        <span class="tab-count">{{ countByStatus(tab.key) }}</span>
      </button>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner"></div></div>

    <div v-else class="card">
      <table class="table">
        <thead>
          <tr>
            <th>{{ $t('order_id') }}</th>
            <th>{{ $t('customer') }}</th>
            <th>{{ $t('items') }}</th>
            <th>{{ $t('total') }}</th>
            <th>{{ $t('status') }}</th>
            <th>{{ $t('date') }}</th>
            <th>{{ $t('actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredOrders.length === 0">
            <td colspan="7" style="text-align:center;padding:48px;color:var(--text-muted)">{{ $t('no_orders_found') }}</td>
          </tr>
          <tr v-for="order in filteredOrders" :key="order._id">
            <td><span class="order-id-cell">#{{ order._id.slice(-8).toUpperCase() }}</span></td>
            <td>
              <div class="customer-cell">
                <div class="customer-avatar">{{ order.user && order.user.name && order.user.name.charAt(0).toUpperCase() }}</div>
                <div>
                  <div class="customer-name">{{ order.user && order.user.name }}</div>
                  <div class="customer-email">{{ order.user && order.user.email }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="items-preview">
                <img
                  v-for="(item, i) in order.items.slice(0, 3)"
                  :key="i"
                  :src="item.product && item.product.image || 'https://via.placeholder.com/32?text=?'"
                  class="item-preview-img"
                  :title="item.product && item.product.name"
                />
                <span v-if="order.items.length > 3" class="items-more">+{{ order.items.length - 3 }}</span>
              </div>
            </td>
            <td><strong>${{ order.totalAmount.toFixed(2) }}</strong></td>
            <td>
              <select
                :value="order.status"
                :class="['status-select', statusSelectClass(order.status)]"
                @change="updateStatus(order._id, $event.target.value)"
              >
                <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
              </select>
            </td>
            <td class="text-muted">{{ formatDate(order.createdAt) }}</td>
            <td>
              <button class="btn btn-ghost btn-sm" @click="openDetail(order)">{{ $t('view') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Order detail modal -->
    <div v-if="detailOrder" class="modal-overlay" @click.self="detailOrder = null">
      <div class="modal card">
        <div class="modal-header">
          <h2>Order #{{ detailOrder._id.slice(-8).toUpperCase() }}</h2>
          <button class="modal-close" @click="detailOrder = null">✕</button>
        </div>

        <div class="detail-meta">
          <div class="detail-row"><span class="detail-lbl">{{ $t('customer') }}</span><span>{{ detailOrder.user && detailOrder.user.name }}</span></div>
          <div class="detail-row"><span class="detail-lbl">{{ $t('email') }}</span><span>{{ detailOrder.user && detailOrder.user.email }}</span></div>
          <div class="detail-row"><span class="detail-lbl">{{ $t('date') }}</span><span>{{ formatDate(detailOrder.createdAt) }}</span></div>
          <div class="detail-row">
            <span class="detail-lbl">{{ $t('status') }}</span>
            <select :value="detailOrder.status" class="input" style="width:160px" @change="updateStatus(detailOrder._id, $event.target.value); detailOrder.status = $event.target.value">
              <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div v-if="detailOrder.updated_by" class="detail-row">
            <span class="detail-lbl">{{ $t('last_updated_by') }}</span>
            <span class="audit-by">{{ detailOrder.updated_by.name }}</span>
          </div>
        </div>

        <h3 style="font-size:14px;font-weight:700;margin:16px 0 10px">{{ $t('items') }}</h3>
        <div class="detail-items">
          <div v-for="item in detailOrder.items" :key="item.product && item.product._id" class="detail-item">
            <img :src="item.product && item.product.image || 'https://via.placeholder.com/48?text=?'" class="detail-item-img" />
            <div class="detail-item-info">
              <div class="detail-item-name">{{ item.product && item.product.name }}</div>
              <div class="detail-item-meta">Qty: {{ item.quantity }} · ${{ item.price.toFixed(2) }} each</div>
            </div>
            <div class="detail-item-total">${{ (item.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>

        <div class="detail-total">
          <span>{{ $t('order_total') }}</span>
          <strong>${{ detailOrder.totalAmount.toFixed(2) }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      orders: [],
      loading: true,
      filterStatus: '',
      search: '',
      detailOrder: null,
      statuses: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    }
  },
  computed: {
    statusTabs() {
      return [
        { key: '', label: this.$t('tab_all') },
        { key: 'pending', label: this.$t('tab_pending') },
        { key: 'processing', label: this.$t('tab_processing') },
        { key: 'shipped', label: this.$t('tab_shipped') },
        { key: 'delivered', label: this.$t('tab_delivered') },
        { key: 'cancelled', label: this.$t('tab_cancelled') }
      ]
    },
    filteredOrders() {
      return this.orders.filter(o => {
        const matchStatus = !this.filterStatus || o.status === this.filterStatus
        const q = this.search.toLowerCase()
        const matchSearch = !q ||
          o._id.toLowerCase().includes(q) ||
          (o.user?.email || '').toLowerCase().includes(q) ||
          (o.user?.name || '').toLowerCase().includes(q)
        return matchStatus && matchSearch
      })
    }
  },
  async fetch() {
    try {
      const { data } = await this.$axios.get('/orders')
      this.orders = data
    } catch {} finally { this.loading = false }
  },
  methods: {
    countByStatus(key) {
      if (!key) return this.orders.length
      return this.orders.filter(o => o.status === key).length
    },
    async updateStatus(orderId, status) {
      const { data } = await this.$axios.put(`/orders/${orderId}/status`, { status })
      const o = this.orders.find(x => x._id === orderId)
      if (o) { o.status = data.status; o.updated_by = data.updated_by }
      if (this.detailOrder?._id === orderId) this.detailOrder.updated_by = data.updated_by
    },
    openDetail(order) { this.detailOrder = order },
    formatDate(d) {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    statusSelectClass(s) {
      return { pending: 'sel-warning', processing: 'sel-info', shipped: 'sel-primary', delivered: 'sel-success', cancelled: 'sel-danger' }[s] || ''
    }
  }
}
</script>

<style scoped>
.filter-row { display: flex; gap: 10px; flex-wrap: wrap; }

.status-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
.status-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 999px; border: 1.5px solid var(--border);
  background: var(--card); font-size: 13px; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: all .15s;
}
.status-tab:hover { border-color: var(--primary); color: var(--primary); }
.status-tab.active { background: var(--primary); color: white; border-color: var(--primary); }
.tab-count { background: rgba(0,0,0,.12); border-radius: 999px; font-size: 11px; padding: 1px 7px; font-weight: 700; }
.status-tab.active .tab-count { background: rgba(255,255,255,.25); }

.order-id-cell { font-family: monospace; font-size: 13px; font-weight: 700; }
.text-muted { font-size: 13px; color: var(--text-muted); }

.customer-cell { display: flex; align-items: center; gap: 10px; }
.customer-avatar {
  width: 32px; height: 32px; border-radius: 50%; background: var(--primary-light);
  color: var(--primary-dark); font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.customer-name  { font-size: 13px; font-weight: 600; }
.customer-email { font-size: 11px; color: var(--text-muted); }

.items-preview { display: flex; align-items: center; gap: 4px; }
.item-preview-img { width: 32px; height: 32px; object-fit: cover; border-radius: 6px; border: 1.5px solid white; box-shadow: var(--shadow); }
.items-more { font-size: 11px; font-weight: 700; color: var(--text-muted); }

.status-select {
  padding: 5px 10px; border-radius: 6px; border: 1.5px solid var(--border);
  font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer; background: var(--card); text-transform: capitalize;
}
.sel-warning { background: #fef3c7; border-color: #f59e0b; color: #92400e; }
.sel-info    { background: #dbeafe; border-color: #3b82f6; color: #1e40af; }
.sel-primary { background: var(--primary-light); border-color: var(--primary); color: var(--primary-dark); }
.sel-success { background: #d1fae5; border-color: #10b981; color: #065f46; }
.sel-danger  { background: #fee2e2; border-color: #ef4444; color: #991b1b; }

/* Detail modal */
.detail-meta { display: flex; flex-direction: column; gap: 12px; background: var(--bg); border-radius: 10px; padding: 16px; }
.detail-row { display: flex; align-items: center; justify-content: space-between; font-size: 14px; }
.detail-lbl { font-weight: 600; color: var(--text-muted); }
.detail-items { display: flex; flex-direction: column; gap: 12px; }
.detail-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--bg); border-radius: 10px; }
.detail-item-img { width: 48px; height: 48px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
.detail-item-info { flex: 1; }
.detail-item-name { font-size: 14px; font-weight: 600; }
.detail-item-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.detail-item-total { font-size: 14px; font-weight: 700; }
.detail-total {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 0 0; margin-top: 16px; border-top: 2px solid var(--border); font-size: 16px;
}
.detail-total strong { font-size: 22px; color: var(--primary); }
.audit-by { font-size: 13px; font-weight: 600; color: var(--primary); }

/* Dark mode fixes */
[data-theme="dark"] .status-tab { background: var(--card); }
[data-theme="dark"] .status-select { background: var(--card); color: var(--text); border-color: var(--border); }
[data-theme="dark"] .sel-warning { background: rgba(245,158,11,.15); border-color: #f59e0b; color: #fcd34d; }
[data-theme="dark"] .sel-info    { background: rgba(59,130,246,.15); border-color: #3b82f6; color: #93c5fd; }
[data-theme="dark"] .sel-primary { background: rgba(99,102,241,.15); border-color: var(--primary); color: #a5b4fc; }
[data-theme="dark"] .sel-success { background: rgba(16,185,129,.15); border-color: #10b981; color: #6ee7b7; }
[data-theme="dark"] .sel-danger  { background: rgba(239,68,68,.15); border-color: #ef4444; color: #fca5a5; }
</style>
