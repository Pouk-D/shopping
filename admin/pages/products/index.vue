<template>
  <div class="page-wrap">
    <div class="page-header">
      <h1 class="page-title">{{ $t('products') }}</h1>
      <div class="header-right">
        <input v-model="search" class="input" :placeholder="$t('search') + '...'" style="width:220px" />
        <button class="btn btn-primary" @click="openModal()">{{ $t('add_product') }}</button>
      </div>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner"></div></div>

    <div v-else class="card">
      <table class="table">
        <thead>
          <tr>
            <th>{{ $t('product') }}</th>
            <th>{{ $t('category') }}</th>
            <th>{{ $t('price') }}</th>
            <th>{{ $t('stock') }}</th>
            <th>{{ $t('actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="5" style="text-align:center;padding:48px;color:var(--text-muted)">{{ $t('no_products_found') }}</td>
          </tr>
          <tr v-for="p in filtered" :key="p._id">
            <td>
              <div class="product-cell">
                <img :src="p.image || 'https://via.placeholder.com/44?text=?'" class="product-thumb" />
                <div>
                  <div class="product-name">{{ p.name }}</div>
                  <div class="product-desc-short">{{ p.description.slice(0, 50) }}…</div>
                </div>
              </div>
            </td>
            <td><span class="badge badge-primary">{{ p.category && p.category.name }}</span></td>
            <td><strong>${{ p.price.toFixed(2) }}</strong></td>
            <td>
              <span :class="['badge', p.stock === 0 ? 'badge-danger' : p.stock <= 5 ? 'badge-warning' : 'badge-success']">
                {{ p.stock === 0 ? $t('out_of_stock') : p.stock + ' ' + $t('in_stock') }}
              </span>
            </td>
            <td>
              <div style="display:flex;gap:8px">
                <button class="btn btn-ghost btn-sm" @click="openModal(p)">{{ $t('edit') }}</button>
                <button class="btn btn-danger btn-sm" @click="deleteProduct(p._id)">{{ $t('delete') }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Confirm delete dialog -->
    <ConfirmDialog
      v-if="confirmId"
      :title="$t('delete_product')"
      :message="$t('delete_product_msg')"
      @confirm="doDelete"
      @cancel="confirmId = null"
    />

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal card">
        <div class="modal-header">
          <h2>{{ editing ? $t('edit_product') : $t('new_product') }}</h2>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <form class="modal-form" @submit.prevent="save">
          <div class="form-grid">
            <div class="form-field" style="grid-column:1/-1">
              <label class="field-label">{{ $t('name') }}</label>
              <input v-model="form.name" class="input" :placeholder="$t('product') + ' ' + $t('name').toLowerCase()" required />
            </div>
            <div class="form-field">
              <label class="field-label">{{ $t('price') }} ($)</label>
              <input v-model.number="form.price" class="input" type="number" step="0.01" min="0" required />
            </div>
            <div class="form-field">
              <label class="field-label">{{ $t('stock') }}</label>
              <input v-model.number="form.stock" class="input" type="number" min="0" required />
            </div>
            <div class="form-field" style="grid-column:1/-1">
              <label class="field-label">{{ $t('category') }}</label>
              <select v-model="form.category" class="input" required>
                <option value="">{{ $t('select_category') }}</option>
                <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-field" style="grid-column:1/-1">
              <label class="field-label">{{ $t('description') }}</label>
              <textarea v-model="form.description" class="input" rows="3" required></textarea>
            </div>
            <div class="form-field" style="grid-column:1/-1">
              <label class="field-label">{{ $t('images') }}</label>
              <textarea
                class="input"
                rows="4"
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                :value="form.images.join('\n')"
                @input="form.images = $event.target.value.split('\n').map(s => s.trim()).filter(Boolean)"
              ></textarea>
            </div>
          </div>
          <!-- Image preview -->
          <div v-if="form.images.length" class="img-preview">
            <img v-for="(url, i) in form.images.slice(0,4)" :key="i" :src="url" class="preview-thumb" />
          </div>
          <!-- Audit info (edit only) -->
          <div v-if="editing" class="audit-info">
            <span v-if="editing.created_by">Created by <strong>{{ editing.created_by.name }}</strong></span>
            <span v-if="editing.updated_by"> · Last updated by <strong>{{ editing.updated_by.name }}</strong></span>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="closeModal">{{ $t('cancel') }}</button>
            <button type="submit" class="btn btn-primary">{{ editing ? $t('update') : $t('create') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      products: [],
      categories: [],
      loading: true,
      search: '',
      showModal: false,
      editing: null,
      form: { name: '', description: '', price: 0, stock: 0, images: [], category: '' },
      confirmId: null
    }
  },
  computed: {
    filtered() {
      const q = this.search.toLowerCase()
      return this.products.filter(p =>
        !q || p.name.toLowerCase().includes(q) || (p.category?.name || '').toLowerCase().includes(q)
      )
    }
  },
  async fetch() {
    try {
      const [products, cats] = await Promise.all([
        this.$axios.get('/products', { params: { limit: 200 } }),
        this.$axios.get('/categories')
      ])
      this.products = products.data.products || []
      this.categories = cats.data
    } finally { this.loading = false }
  },
  methods: {
    openModal(product = null) {
      this.editing = product
      this.form = product
        ? { name: product.name, description: product.description, price: product.price, stock: product.stock, images: product.images || (product.image ? [product.image] : []), category: product.category?._id || '' }
        : { name: '', description: '', price: 0, stock: 0, images: [], category: '' }
      this.showModal = true
    },
    closeModal() { this.showModal = false; this.editing = null },
    async save() {
      const payload = { ...this.form, image: this.form.images[0] || '' }
      if (this.editing) {
        await this.$axios.put(`/products/${this.editing._id}`, payload)
      } else {
        await this.$axios.post('/products', payload)
      }
      this.closeModal()
      this.$fetch()
    },
    deleteProduct(id) {
      this.confirmId = id
    },
    async doDelete() {
      await this.$axios.delete(`/products/${this.confirmId}`)
      this.confirmId = null
      this.$fetch()
    }
  }
}
</script>

<style scoped>
.header-right { display: flex; gap: 10px; align-items: center; }
.product-cell { display: flex; align-items: center; gap: 12px; }
.product-thumb { width: 44px; height: 44px; object-fit: cover; border-radius: 8px; background: var(--bg); flex-shrink: 0; }
.product-name { font-size: 14px; font-weight: 600; }
.product-desc-short { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.img-preview { display: flex; gap: 8px; flex-wrap: wrap; margin-top: -8px; }
.preview-thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); }
.audit-info { font-size: 12px; color: var(--text-muted); padding: 8px 0 0; }
</style>
