<template>
  <div class="page-wrap">
    <div class="page-header">
      <h1 class="page-title">Reports</h1>
      <div class="date-range">
        <label class="field-label" style="margin:0;white-space:nowrap">From</label>
        <input v-model="dateFrom" type="date" class="input" style="width:150px" />
        <label class="field-label" style="margin:0;white-space:nowrap">To</label>
        <input v-model="dateTo" type="date" class="input" style="width:150px" />
        <button class="btn btn-ghost btn-sm" @click="resetDates">Reset</button>
      </div>
    </div>

    <!-- KPI row -->
    <div class="kpi-row">
      <div class="kpi-card card">
        <div class="kpi-label">Total Revenue</div>
        <div class="kpi-value">${{ totalRevenue }}</div>
      </div>
      <div class="kpi-card card">
        <div class="kpi-label">Orders</div>
        <div class="kpi-value">{{ filteredOrders.length }}</div>
      </div>
      <div class="kpi-card card">
        <div class="kpi-label">Avg Order Value</div>
        <div class="kpi-value">${{ avgOrder }}</div>
      </div>
      <div class="kpi-card card">
        <div class="kpi-label">Items Sold</div>
        <div class="kpi-value">{{ totalItems }}</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="report-tabs">
      <button v-for="t in tabs" :key="t.key" class="report-tab" :class="{ active: tab === t.key }" @click="tab = t.key">
        {{ t.label }}
      </button>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner"></div></div>

    <!-- ── BY CUSTOMER ── -->
    <div v-else-if="tab === 'customer'">
      <div class="card">
        <div class="table-toolbar">
          <input v-model="searchCustomer" class="input" placeholder="Search customer…" style="width:220px" />
          <span class="result-count">{{ byCustomer.length }} customers</span>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th @click="sortBy('customer','name')" class="sortable">
                Customer <span class="sort-icon">{{ sortIcon('customer','name') }}</span>
              </th>
              <th>Email</th>
              <th @click="sortBy('customer','orders')" class="sortable">
                Orders <span class="sort-icon">{{ sortIcon('customer','orders') }}</span>
              </th>
              <th @click="sortBy('customer','revenue')" class="sortable">
                Total Spent <span class="sort-icon">{{ sortIcon('customer','revenue') }}</span>
              </th>
              <th @click="sortBy('customer','avg')" class="sortable">
                Avg Order <span class="sort-icon">{{ sortIcon('customer','avg') }}</span>
              </th>
              <th>Last Order</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="sortedCustomers.length === 0">
              <td colspan="6" class="empty-row">No data</td>
            </tr>
            <tr v-for="(row, i) in sortedCustomers" :key="row.email">
              <td>
                <div class="customer-cell">
                  <div class="cust-av" :style="{ background: avatarColor(row.name) }">{{ row.name.charAt(0).toUpperCase() }}</div>
                  <div>
                    <div class="cust-name">{{ row.name }}</div>
                    <div v-if="i === 0" class="top-badge">Top Buyer</div>
                  </div>
                </div>
              </td>
              <td class="text-muted">{{ row.email }}</td>
              <td><strong>{{ row.orders }}</strong></td>
              <td><strong class="revenue">${{ row.revenue.toFixed(2) }}</strong></td>
              <td class="text-muted">${{ row.avg.toFixed(2) }}</td>
              <td class="text-muted">{{ formatDate(row.lastOrder) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── BY DATE ── -->
    <div v-else-if="tab === 'date'">
      <div class="card">
        <div class="table-toolbar">
          <div class="seg-control">
            <button v-for="g in groups" :key="g.key" :class="{ active: groupBy === g.key }" @click="groupBy = g.key">{{ g.label }}</button>
          </div>
          <span class="result-count">{{ byDate.length }} periods</span>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th @click="sortBy('date','period')" class="sortable">Period <span class="sort-icon">{{ sortIcon('date','period') }}</span></th>
              <th @click="sortBy('date','orders')" class="sortable">Orders <span class="sort-icon">{{ sortIcon('date','orders') }}</span></th>
              <th @click="sortBy('date','revenue')" class="sortable">Revenue <span class="sort-icon">{{ sortIcon('date','revenue') }}</span></th>
              <th @click="sortBy('date','items')" class="sortable">Items Sold <span class="sort-icon">{{ sortIcon('date','items') }}</span></th>
              <th @click="sortBy('date','avg')" class="sortable">Avg Order <span class="sort-icon">{{ sortIcon('date','avg') }}</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="sortedDate.length === 0">
              <td colspan="5" class="empty-row">No data</td>
            </tr>
            <tr v-for="row in sortedDate" :key="row.period">
              <td><strong>{{ row.period }}</strong></td>
              <td>{{ row.orders }}</td>
              <td><strong class="revenue">${{ row.revenue.toFixed(2) }}</strong></td>
              <td>{{ row.items }}</td>
              <td class="text-muted">${{ row.avg.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── BY PRODUCT / CATEGORY ── -->
    <div v-else-if="tab === 'product'">
      <div class="card">
        <div class="table-toolbar">
          <div class="seg-control">
            <button :class="{ active: productView === 'product' }" @click="productView = 'product'">By Product</button>
            <button :class="{ active: productView === 'category' }" @click="productView = 'category'">By Category</button>
          </div>
          <input v-model="searchProduct" class="input" placeholder="Search…" style="width:200px" />
        </div>

        <!-- Products table -->
        <table v-if="productView === 'product'" class="table">
          <thead>
            <tr>
              <th @click="sortBy('product','name')" class="sortable">Product <span class="sort-icon">{{ sortIcon('product','name') }}</span></th>
              <th>Category</th>
              <th @click="sortBy('product','orders')" class="sortable">Orders <span class="sort-icon">{{ sortIcon('product','orders') }}</span></th>
              <th @click="sortBy('product','qty')" class="sortable">Qty Sold <span class="sort-icon">{{ sortIcon('product','qty') }}</span></th>
              <th @click="sortBy('product','revenue')" class="sortable">Revenue <span class="sort-icon">{{ sortIcon('product','revenue') }}</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="sortedProducts.length === 0">
              <td colspan="5" class="empty-row">No data</td>
            </tr>
            <tr v-for="row in sortedProducts" :key="row.name">
              <td>
                <div class="product-cell">
                  <img :src="row.image || 'https://via.placeholder.com/36?text=?'" class="prod-thumb" />
                  <span class="prod-name">{{ row.name }}</span>
                </div>
              </td>
              <td><span class="badge badge-primary">{{ row.category }}</span></td>
              <td>{{ row.orders }}</td>
              <td><strong>{{ row.qty }}</strong></td>
              <td><strong class="revenue">${{ row.revenue.toFixed(2) }}</strong></td>
            </tr>
          </tbody>
        </table>

        <!-- Categories table -->
        <table v-else class="table">
          <thead>
            <tr>
              <th @click="sortBy('category','name')" class="sortable">Category <span class="sort-icon">{{ sortIcon('category','name') }}</span></th>
              <th @click="sortBy('category','orders')" class="sortable">Orders <span class="sort-icon">{{ sortIcon('category','orders') }}</span></th>
              <th @click="sortBy('category','qty')" class="sortable">Qty Sold <span class="sort-icon">{{ sortIcon('category','qty') }}</span></th>
              <th @click="sortBy('category','revenue')" class="sortable">Revenue <span class="sort-icon">{{ sortIcon('category','revenue') }}</span></th>
              <th @click="sortBy('category','share')" class="sortable">Revenue Share <span class="sort-icon">{{ sortIcon('category','share') }}</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="sortedCategories.length === 0">
              <td colspan="5" class="empty-row">No data</td>
            </tr>
            <tr v-for="row in sortedCategories" :key="row.name">
              <td><strong>{{ row.name }}</strong></td>
              <td>{{ row.orders }}</td>
              <td><strong>{{ row.qty }}</strong></td>
              <td><strong class="revenue">${{ row.revenue.toFixed(2) }}</strong></td>
              <td>
                <div class="share-bar-wrap">
                  <div class="share-bar" :style="{ width: row.share + '%' }"></div>
                  <span class="share-label">{{ row.share.toFixed(1) }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    const today = new Date().toISOString().slice(0, 10)
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
    return {
      orders: [],
      loading: true,
      tab: 'customer',
      tabs: [
        { key: 'customer', label: '👤 By Customer' },
        { key: 'date',     label: '📅 By Date' },
        { key: 'product',  label: '📦 By Product / Category' }
      ],
      dateFrom: monthAgo,
      dateTo: today,
      searchCustomer: '',
      searchProduct: '',
      groupBy: 'day',
      groups: [
        { key: 'day',   label: 'Daily' },
        { key: 'week',  label: 'Weekly' },
        { key: 'month', label: 'Monthly' }
      ],
      productView: 'product',
      sorts: { customer: { field: 'revenue', dir: -1 }, date: { field: 'period', dir: -1 }, product: { field: 'revenue', dir: -1 }, category: { field: 'revenue', dir: -1 } }
    }
  },
  computed: {
    filteredOrders() {
      return this.orders.filter(o => {
        if (o.status === 'cancelled') return false
        const d = o.createdAt.slice(0, 10)
        return d >= this.dateFrom && d <= this.dateTo
      })
    },
    totalRevenue() {
      return this.filteredOrders.reduce((s, o) => s + o.totalAmount, 0).toFixed(2)
    },
    avgOrder() {
      const n = this.filteredOrders.length
      return n ? (this.filteredOrders.reduce((s, o) => s + o.totalAmount, 0) / n).toFixed(2) : '0.00'
    },
    totalItems() {
      return this.filteredOrders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0)
    },

    // ── By Customer ──
    byCustomer() {
      const map = {}
      for (const o of this.filteredOrders) {
        const key = o.user?.email || 'unknown'
        if (!map[key]) map[key] = { name: o.user?.name || 'Unknown', email: key, orders: 0, revenue: 0, lastOrder: o.createdAt }
        map[key].orders++
        map[key].revenue += o.totalAmount
        if (o.createdAt > map[key].lastOrder) map[key].lastOrder = o.createdAt
      }
      const q = this.searchCustomer.toLowerCase()
      return Object.values(map)
        .filter(r => !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
        .map(r => ({ ...r, avg: r.revenue / r.orders }))
    },
    sortedCustomers() {
      return this.sorted('customer', this.byCustomer)
    },

    // ── By Date ──
    byDate() {
      const map = {}
      for (const o of this.filteredOrders) {
        const key = this.periodKey(o.createdAt)
        if (!map[key]) map[key] = { period: key, orders: 0, revenue: 0, items: 0 }
        map[key].orders++
        map[key].revenue += o.totalAmount
        map[key].items += o.items.reduce((s, i) => s + i.quantity, 0)
      }
      return Object.values(map).map(r => ({ ...r, avg: r.revenue / r.orders }))
    },
    sortedDate() {
      return this.sorted('date', this.byDate)
    },

    // ── By Product ──
    byProduct() {
      const map = {}
      for (const o of this.filteredOrders) {
        for (const item of o.items) {
          const name = item.product?.name || 'Unknown'
          if (!map[name]) map[name] = { name, category: item.product?.category?.name || '—', image: item.product?.image || '', orders: 0, qty: 0, revenue: 0 }
          map[name].orders++
          map[name].qty += item.quantity
          map[name].revenue += item.price * item.quantity
        }
      }
      const q = this.searchProduct.toLowerCase()
      return Object.values(map).filter(r => !q || r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))
    },
    sortedProducts() {
      return this.sorted('product', this.byProduct)
    },

    // ── By Category ──
    byCategory() {
      const map = {}
      for (const o of this.filteredOrders) {
        for (const item of o.items) {
          const cat = item.product?.category?.name || 'Uncategorized'
          if (!map[cat]) map[cat] = { name: cat, orders: 0, qty: 0, revenue: 0 }
          map[cat].orders++
          map[cat].qty += item.quantity
          map[cat].revenue += item.price * item.quantity
        }
      }
      const total = Object.values(map).reduce((s, r) => s + r.revenue, 0) || 1
      const q = this.searchProduct.toLowerCase()
      return Object.values(map)
        .filter(r => !q || r.name.toLowerCase().includes(q))
        .map(r => ({ ...r, share: (r.revenue / total) * 100 }))
    },
    sortedCategories() {
      return this.sorted('category', this.byCategory)
    }
  },
  async fetch() {
    try {
      const { data } = await this.$axios.get('/orders')
      this.orders = data
    } catch {} finally { this.loading = false }
  },
  methods: {
    periodKey(dateStr) {
      const d = new Date(dateStr)
      if (this.groupBy === 'month') {
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      }
      if (this.groupBy === 'week') {
        const start = new Date(d)
        start.setDate(d.getDate() - d.getDay())
        return 'Week of ' + start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    resetDates() {
      this.dateTo   = new Date().toISOString().slice(0, 10)
      this.dateFrom = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
    },
    sortBy(section, field) {
      const s = this.sorts[section]
      s.dir = s.field === field ? -s.dir : -1
      s.field = field
    },
    sortIcon(section, field) {
      const s = this.sorts[section]
      if (s.field !== field) return '↕'
      return s.dir === -1 ? '↓' : '↑'
    },
    sorted(section, arr) {
      const { field, dir } = this.sorts[section]
      return [...arr].sort((a, b) => {
        const av = a[field], bv = b[field]
        if (typeof av === 'string') return dir * av.localeCompare(bv)
        return dir * (av - bv)
      })
    },
    formatDate(d) {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    avatarColor(name) {
      const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444']
      return colors[name.charCodeAt(0) % colors.length]
    }
  }
}
</script>

<style scoped>
.date-range { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
@media (max-width: 860px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }
.kpi-card { padding: 20px 24px; }
.kpi-label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px; }
.kpi-value { font-size: 28px; font-weight: 800; color: var(--text); }

.report-tabs { display: flex; gap: 4px; border-bottom: 2px solid var(--border); margin-bottom: 20px; }
.report-tab {
  padding: 10px 20px; border: none; background: none; font-size: 14px; font-weight: 600;
  color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all .15s;
}
.report-tab:hover { color: var(--primary); }
.report-tab.active { color: var(--primary); border-bottom-color: var(--primary); }

.table-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1px solid var(--border); gap: 12px; flex-wrap: wrap;
}
.result-count { font-size: 13px; color: var(--text-muted); margin-left: auto; }

.sortable { cursor: pointer; user-select: none; white-space: nowrap; }
.sortable:hover { color: var(--primary); }
.sort-icon { font-size: 11px; color: var(--text-muted); margin-left: 2px; }

.empty-row { text-align: center; padding: 48px; color: var(--text-muted); }
.text-muted { font-size: 13px; color: var(--text-muted); }
.revenue { color: var(--primary); }

/* Customer tab */
.customer-cell { display: flex; align-items: center; gap: 10px; }
.cust-av { width: 34px; height: 34px; border-radius: 50%; color: white; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cust-name { font-size: 14px; font-weight: 600; }
.top-badge { font-size: 10px; font-weight: 700; background: #fef3c7; color: #92400e; border-radius: 4px; padding: 1px 6px; display: inline-block; margin-top: 2px; }

/* Segmented control */
.seg-control { display: flex; background: var(--bg); border-radius: 8px; padding: 3px; gap: 2px; }
.seg-control button { padding: 5px 14px; border: none; background: none; border-radius: 6px; font-size: 13px; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: all .15s; }
.seg-control button.active { background: white; color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,.1); font-weight: 600; }

/* Product tab */
.product-cell { display: flex; align-items: center; gap: 10px; }
.prod-thumb { width: 36px; height: 36px; object-fit: cover; border-radius: 6px; background: var(--bg); flex-shrink: 0; }
.prod-name { font-size: 14px; font-weight: 600; }

/* Share bar */
.share-bar-wrap { display: flex; align-items: center; gap: 8px; min-width: 120px; }
.share-bar { height: 6px; background: var(--primary); border-radius: 99px; transition: width .3s; }
.share-label { font-size: 12px; font-weight: 600; color: var(--text-muted); white-space: nowrap; }
</style>
