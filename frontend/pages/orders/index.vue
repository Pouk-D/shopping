<template>
  <div class="container page">
    <div class="page-header">
      <h1 class="section-title">My Orders</h1>
      <nuxt-link to="/" class="btn btn-outline btn-sm">Continue Shopping</nuxt-link>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-center">
      <div class="spinner"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="orders.length === 0" class="empty-state card">
      <div class="empty-icon">📦</div>
      <h3>No orders yet</h3>
      <p>When you place an order it will appear here.</p>
      <nuxt-link to="/" class="btn btn-primary" style="margin-top:16px">Start Shopping</nuxt-link>
    </div>

    <!-- Order list -->
    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order._id" class="order-card card">
        <!-- Order header -->
        <div class="order-header">
          <div class="order-meta">
            <span class="order-id">#{{ order._id.slice(-8).toUpperCase() }}</span>
            <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="order-header-right">
            <span :class="['status-badge', statusClass(order.status)]">
              {{ statusIcon(order.status) }} {{ order.status }}
            </span>
            <span class="order-total">${{ order.totalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Status timeline -->
        <div class="timeline">
          <div
            v-for="(step, i) in steps"
            :key="step.key"
            class="timeline-step"
            :class="{
              done: stepIndex(order.status) > i,
              active: stepIndex(order.status) === i,
              cancelled: order.status === 'cancelled'
            }"
          >
            <div class="step-dot">
              <svg v-if="stepIndex(order.status) > i && order.status !== 'cancelled'" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span v-else>{{ i + 1 }}</span>
            </div>
            <div class="step-line" v-if="i < steps.length - 1"></div>
            <div class="step-label">{{ step.label }}</div>
          </div>
        </div>

        <!-- Items -->
        <div class="order-items">
          <div
            v-for="item in order.items"
            :key="item.product && item.product._id"
            class="order-item"
          >
            <img
              :src="item.product && item.product.image || 'https://via.placeholder.com/60x60?text=?'"
              :alt="item.product && item.product.name"
              class="item-thumb"
            />
            <div class="item-info">
              <div class="item-name">{{ item.product ? item.product.name : 'Product' }}</div>
              <div class="item-meta">Qty: {{ item.quantity }} · ${{ item.price.toFixed(2) }} each</div>
            </div>
            <div class="item-subtotal">${{ (item.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="order-footer">
          <span class="items-count">{{ totalItems(order) }} item{{ totalItems(order) !== 1 ? 's' : '' }}</span>
          <div class="order-total-row">
            <span>Order Total</span>
            <strong>${{ order.totalAmount.toFixed(2) }}</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  middleware: 'auth',
  data() {
    return {
      orders: [],
      loading: true,
      steps: [
        { key: 'pending',    label: 'Placed' },
        { key: 'processing', label: 'Processing' },
        { key: 'shipped',    label: 'Shipped' },
        { key: 'delivered',  label: 'Delivered' }
      ]
    }
  },
  async fetch() {
    try {
      const { data } = await this.$axios.get('/orders/my')
      this.orders = data
    } finally {
      this.loading = false
    }
  },
  methods: {
    formatDate(d) {
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    },
    stepIndex(status) {
      const map = { pending: 0, processing: 1, shipped: 2, delivered: 3, cancelled: -1 }
      return map[status] ?? 0
    },
    statusClass(s) {
      return {
        pending:    'status-warning',
        processing: 'status-info',
        shipped:    'status-primary',
        delivered:  'status-success',
        cancelled:  'status-danger'
      }[s] || 'status-warning'
    },
    statusIcon(s) {
      return { pending: '⏳', processing: '⚙️', shipped: '🚚', delivered: '✅', cancelled: '❌' }[s] || '⏳'
    },
    totalItems(order) {
      return order.items.reduce((s, i) => s + i.quantity, 0)
    }
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.empty-state { text-align: center; padding: 64px 24px; }
.empty-icon { font-size: 52px; margin-bottom: 14px; }
.empty-state h3 { font-size: 22px; color: var(--text); margin-bottom: 6px; }
.empty-state p { color: var(--text-muted); }

.orders-list { display: flex; flex-direction: column; gap: 20px; }

.order-card { overflow: hidden; }

/* Order header */
.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
  gap: 12px;
}
.order-meta { display: flex; align-items: center; gap: 14px; }
.order-id { font-family: monospace; font-size: 15px; font-weight: 700; color: var(--text); }
.order-date { font-size: 13px; color: var(--text-muted); }
.order-header-right { display: flex; align-items: center; gap: 16px; }
.order-total { font-size: 18px; font-weight: 800; color: var(--text); }

/* Status badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  text-transform: capitalize;
}
.status-warning  { background: #fef3c7; color: #92400e; }
.status-info     { background: #dbeafe; color: #1e40af; }
.status-primary  { background: var(--primary-light); color: var(--primary-dark); }
.status-success  { background: #d1fae5; color: #065f46; }
.status-danger   { background: #fee2e2; color: #991b1b; }

/* Timeline */
.timeline {
  display: flex;
  align-items: flex-start;
  padding: 24px 28px 16px;
  gap: 0;
  overflow-x: auto;
}
.timeline-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  min-width: 72px;
}
.step-dot {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2.5px solid var(--border);
  background: var(--card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  z-index: 2;
  transition: all .2s;
}
.timeline-step.done .step-dot  { background: var(--success); border-color: var(--success); color: white; }
.timeline-step.active .step-dot { background: var(--primary); border-color: var(--primary); color: white; box-shadow: 0 0 0 4px var(--primary-light); }
.timeline-step.cancelled .step-dot { background: var(--danger); border-color: var(--danger); color: white; }

.step-line {
  position: absolute;
  top: 15px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--border);
  z-index: 1;
}
.timeline-step.done .step-line  { background: var(--success); }

.step-label {
  margin-top: 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: .04em;
}
.timeline-step.active .step-label { color: var(--primary); }
.timeline-step.done .step-label   { color: var(--success); }

/* Items */
.order-items {
  padding: 4px 24px 8px;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.order-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
}
.order-item:last-child { border-bottom: none; }
.item-thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 10px; flex-shrink: 0; background: var(--bg); }
.item-info { flex: 1; }
.item-name { font-size: 14px; font-weight: 600; color: var(--text); }
.item-meta { font-size: 12px; color: var(--text-muted); margin-top: 3px; }
.item-subtotal { font-size: 15px; font-weight: 700; }

/* Footer */
.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: var(--bg);
  border-top: 1px solid var(--border);
}
.items-count { font-size: 13px; color: var(--text-muted); }
.order-total-row { display: flex; gap: 12px; align-items: center; font-size: 15px; }
.order-total-row strong { font-size: 18px; color: var(--primary); }

/* ── Mobile ── */
@media (max-width: 540px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .order-header { padding: 14px 16px; }
  .order-id { font-size: 13px; }
  .order-date { display: none; }
  .order-total { font-size: 15px; }
  .status-badge { font-size: 11px; padding: 3px 10px; }
  .timeline { padding: 16px 16px 10px; }
  .timeline-step { min-width: 56px; }
  .step-dot { width: 24px; height: 24px; font-size: 10px; }
  .step-line { top: 12px; }
  .step-label { font-size: 10px; }
  .order-items { padding: 4px 16px 8px; }
  .item-thumb { width: 48px; height: 48px; }
  .item-name { font-size: 13px; }
  .order-footer { padding: 12px 16px; }
  .order-total-row { font-size: 13px; }
  .order-total-row strong { font-size: 15px; }
}
</style>
