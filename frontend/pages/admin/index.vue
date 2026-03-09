<template>
  <div class="container page">
    <div class="dashboard-header">
      <h1 class="section-title">Admin Dashboard</h1>
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ products.length }}</div>
          <div class="stat-label">Products</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ categories.length }}</div>
          <div class="stat-label">Categories</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ orders.length }}</div>
          <div class="stat-label">Orders</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${{ totalRevenue }}</div>
          <div class="stat-label">Revenue</div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >{{ tab.label }}</button>
    </div>

    <!-- PRODUCTS TAB -->
    <div v-if="activeTab === 'products'">
      <div class="tab-actions">
        <button class="btn btn-primary" @click="openProductModal()">
          + Add Product
        </button>
      </div>

      <div class="card table-card">
        <table class="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="products.length === 0">
              <td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">No products yet</td>
            </tr>
            <tr v-for="p in products" :key="p._id">
              <td>
                <div class="product-cell">
                  <img :src="p.image || 'https://via.placeholder.com/40x40?text=?'" class="table-thumb" />
                  <span class="product-cell-name">{{ p.name }}</span>
                </div>
              </td>
              <td><span class="badge badge-primary">{{ p.category && p.category.name }}</span></td>
              <td class="fw-bold">${{ p.price }}</td>
              <td>
                <span :class="['badge', p.stock > 0 ? 'badge-success' : 'badge-danger']">
                  {{ p.stock > 0 ? p.stock + ' left' : 'Out of stock' }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="btn btn-ghost btn-sm" @click="openProductModal(p)">Edit</button>
                  <button class="btn btn-danger btn-sm" @click="deleteProduct(p._id)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- CATEGORIES TAB -->
    <div v-if="activeTab === 'categories'">
      <div class="tab-actions">
        <form class="inline-form" @submit.prevent="createCategory">
          <input v-model="newCategory" class="input" placeholder="New category name" required style="width:240px" />
          <button type="submit" class="btn btn-primary">Add Category</button>
        </form>
      </div>
      <div class="card table-card">
        <table class="table">
          <thead>
            <tr><th>Name</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr v-if="categories.length === 0">
              <td colspan="2" style="text-align:center;padding:40px;color:var(--text-muted)">No categories yet</td>
            </tr>
            <tr v-for="cat in categories" :key="cat._id">
              <td><strong>{{ cat.name }}</strong></td>
              <td>
                <button class="btn btn-danger btn-sm" @click="deleteCategory(cat._id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ORDERS TAB -->
    <div v-if="activeTab === 'orders'">
      <div class="card table-card">
        <table class="table">
          <thead>
            <tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            <tr v-if="orders.length === 0">
              <td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">No orders yet</td>
            </tr>
            <tr v-for="order in orders" :key="order._id">
              <td><span class="order-id-cell">#{{ order._id.slice(-8).toUpperCase() }}</span></td>
              <td>{{ order.user && order.user.email }}</td>
              <td class="fw-bold">${{ order.totalAmount.toFixed(2) }}</td>
              <td>
                <select
                  class="status-select"
                  :value="order.status"
                  @change="updateStatus(order._id, $event.target.value)"
                >
                  <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                </select>
              </td>
              <td class="text-muted">{{ order.createdAt | date }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Confirm delete dialog -->
    <ConfirmDialog
      v-if="confirmDialog.show"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      @confirm="confirmDialog.action(); confirmDialog.show = false"
      @cancel="confirmDialog.show = false"
    />

    <!-- Product Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal card">
        <div class="modal-header">
          <h2>{{ editingProduct ? 'Edit Product' : 'New Product' }}</h2>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <form class="modal-form" @submit.prevent="saveProduct">
          <div class="form-grid">
            <div class="field">
              <label class="field-label">Name</label>
              <input v-model="productForm.name" class="input" placeholder="Product name" required />
            </div>
            <div class="field">
              <label class="field-label">Category</label>
              <select v-model="productForm.category" class="input" required>
                <option value="">Select category</option>
                <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="field">
              <label class="field-label">Price ($)</label>
              <input v-model.number="productForm.price" class="input" type="number" step="0.01" min="0" required />
            </div>
            <div class="field">
              <label class="field-label">Stock</label>
              <input v-model.number="productForm.stock" class="input" type="number" min="0" required />
            </div>
          </div>
          <div class="field" style="grid-column:1/-1">
            <label class="field-label">Images (one URL per line — first image is the main thumbnail)</label>
            <textarea
              class="input"
              rows="4"
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
              :value="productForm.images.join('\n')"
              @input="productForm.images = $event.target.value.split('\n').map(s => s.trim()).filter(Boolean)"
            ></textarea>
          </div>
          <div class="field">
            <label class="field-label">Description</label>
            <textarea v-model="productForm.description" class="input" rows="3" placeholder="Product description" required></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary">
              {{ editingProduct ? 'Update Product' : 'Create Product' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  middleware: 'admin',
  filters: {
    date(val) {
      return val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
    }
  },
  data() {
    return {
      activeTab: 'products',
      tabs: [
        { key: 'products', label: '📦 Products' },
        { key: 'categories', label: '🏷 Categories' },
        { key: 'orders', label: '📋 Orders' }
      ],
      showModal: false,
      editingProduct: null,
      productForm: { name: '', description: '', price: 0, stock: 0, images: [], category: '' },
      newCategory: '',
      orders: [],
      statuses: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      confirmDialog: { show: false, title: '', message: '', action: () => {} }
    }
  },
  computed: {
    products() { return this.$store.state.products.products },
    categories() { return this.$store.state.products.categories },
    totalRevenue() {
      return this.orders
        .filter(o => o.status !== 'cancelled')
        .reduce((s, o) => s + o.totalAmount, 0)
        .toFixed(2)
    }
  },
  async fetch() {
    await Promise.all([
      this.$store.dispatch('products/fetchProducts', { limit: 100 }),
      this.$store.dispatch('products/fetchCategories'),
      this.fetchOrders()
    ])
  },
  methods: {
    async fetchOrders() {
      const { data } = await this.$axios.get('/orders')
      this.orders = data
    },
    openProductModal(product = null) {
      this.editingProduct = product
      this.productForm = product
        ? { name: product.name, description: product.description, price: product.price, stock: product.stock, images: product.images || (product.image ? [product.image] : []), category: product.category?._id || '' }
        : { name: '', description: '', price: 0, stock: 0, images: [], category: '' }
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.editingProduct = null
    },
    async saveProduct() {
      const payload = { ...this.productForm, image: this.productForm.images[0] || '' }
      if (this.editingProduct) {
        await this.$store.dispatch('products/updateProduct', { id: this.editingProduct._id, productData: payload })
      } else {
        await this.$store.dispatch('products/createProduct', payload)
      }
      this.closeModal()
      this.$store.dispatch('products/fetchProducts', { limit: 100 })
    },
    deleteProduct(id) {
      this.confirmDialog = {
        show: true,
        title: 'Delete Product',
        message: 'This product will be permanently deleted. This action cannot be undone.',
        action: async () => {
          await this.$store.dispatch('products/deleteProduct', id)
          this.$store.dispatch('products/fetchProducts', { limit: 100 })
        }
      }
    },
    async createCategory() {
      await this.$axios.post('/categories', { name: this.newCategory })
      this.newCategory = ''
      this.$store.dispatch('products/fetchCategories')
    },
    deleteCategory(id) {
      this.confirmDialog = {
        show: true,
        title: 'Delete Category',
        message: 'This category will be permanently deleted. This action cannot be undone.',
        action: async () => {
          await this.$axios.delete(`/categories/${id}`)
          this.$store.dispatch('products/fetchCategories')
        }
      }
    },
    async updateStatus(orderId, status) {
      await this.$axios.put(`/orders/${orderId}/status`, { status })
      this.fetchOrders()
    }
  }
}
</script>

<style scoped>
.dashboard-header { margin-bottom: 28px; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 20px; }
@media (max-width: 640px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }

.stat-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px 24px;
  text-align: center;
}
.stat-value { font-size: 28px; font-weight: 800; color: var(--primary); }
.stat-label { font-size: 13px; color: var(--text-muted); margin-top: 4px; font-weight: 500; }

.tabs { display: flex; gap: 4px; border-bottom: 2px solid var(--border); margin-bottom: 20px; }
.tab-btn {
  padding: 10px 20px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all .15s;
}
.tab-btn:hover { color: var(--primary); }
.tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }

.tab-actions { margin-bottom: 16px; }
.inline-form { display: flex; gap: 10px; }
.table-card { overflow: hidden; }

.product-cell { display: flex; align-items: center; gap: 12px; }
.table-thumb { width: 40px; height: 40px; object-fit: cover; border-radius: 8px; }
.product-cell-name { font-weight: 600; font-size: 14px; }
.action-btns { display: flex; gap: 8px; }
.fw-bold { font-weight: 700; }
.text-muted { color: var(--text-muted); font-size: 13px; }
.order-id-cell { font-family: monospace; font-size: 13px; font-weight: 600; }

.status-select {
  padding: 5px 10px;
  border: 1.5px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  background: white;
  cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
}
.modal {
  width: 100%;
  max-width: 560px;
  padding: 28px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.modal-header h2 { font-size: 20px; font-weight: 700; }
.modal-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px 8px;
  border-radius: 6px;
}
.modal-close:hover { background: var(--bg); }

.modal-form { display: flex; flex-direction: column; gap: 16px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 480px) { .form-grid { grid-template-columns: 1fr; } }
.field { display: flex; flex-direction: column; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
</style>
