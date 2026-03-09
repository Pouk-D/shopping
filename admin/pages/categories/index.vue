<template>
  <div class="page-wrap">
    <div class="page-header">
      <h1 class="page-title">{{ $t('categories') }}</h1>
      <button class="btn btn-primary" @click="showModal = true">{{ $t('add_category') }}</button>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner"></div></div>

    <div v-else class="categories-grid">
      <div v-if="categories.length === 0" class="card empty-card">
        <div class="empty-icon">🏷</div>
        <p>{{ $t('no_categories') }}</p>
      </div>
      <div v-for="cat in categories" :key="cat._id" class="cat-card card">
        <div class="cat-icon">🏷</div>
        <div class="cat-info">
          <div class="cat-name">{{ cat.name }}</div>
          <div class="cat-count">{{ productCount(cat._id) }} {{ $t('products_label') }}</div>
          <div class="cat-audit">
            <span v-if="cat.created_by">{{ $t('by_label') }} {{ cat.created_by.name }}</span>
            <span v-if="cat.updated_by"> · {{ $t('edited_by') }} {{ cat.updated_by.name }}</span>
          </div>
        </div>
        <div class="cat-actions">
          <button class="btn btn-ghost btn-sm" @click="openEdit(cat)">{{ $t('edit') }}</button>
          <button class="btn btn-danger btn-sm" @click="deleteCategory(cat._id)">{{ $t('delete') }}</button>
        </div>
      </div>
    </div>

    <!-- Confirm delete dialog -->
    <ConfirmDialog
      v-if="confirmId"
      :title="$t('delete_category')"
      :message="$t('delete_category_msg')"
      @confirm="doDelete"
      @cancel="confirmId = null"
    />

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal card" style="max-width:400px">
        <div class="modal-header">
          <h2>{{ editing ? $t('edit_category') : $t('new_category') }}</h2>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <form @submit.prevent="save" class="modal-form">
          <div class="form-field">
            <label class="field-label">{{ $t('category_name') }}</label>
            <input v-model="form.name" class="input" placeholder="e.g. Electronics" required />
          </div>
          <div v-if="error" class="alert alert-error">{{ error }}</div>
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
      categories: [],
      products: [],
      loading: true,
      showModal: false,
      editing: null,
      form: { name: '' },
      error: '',
      confirmId: null
    }
  },
  async fetch() {
    try {
      const [cats, prods] = await Promise.all([
        this.$axios.get('/categories'),
        this.$axios.get('/products', { params: { limit: 200 } })
      ])
      this.categories = cats.data
      this.products = prods.data.products || []
    } finally { this.loading = false }
  },
  methods: {
    productCount(catId) {
      return this.products.filter(p => p.category?._id === catId || p.category === catId).length
    },
    openEdit(cat) {
      this.editing = cat
      this.form.name = cat.name
      this.showModal = true
    },
    closeModal() { this.showModal = false; this.editing = null; this.form.name = ''; this.error = '' },
    async save() {
      this.error = ''
      try {
        if (this.editing) {
          await this.$axios.put(`/categories/${this.editing._id}`, this.form)
        } else {
          await this.$axios.post('/categories', this.form)
        }
        this.closeModal()
        this.$fetch()
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to save'
      }
    },
    deleteCategory(id) {
      this.confirmId = id
    },
    async doDelete() {
      await this.$axios.delete(`/categories/${this.confirmId}`)
      this.confirmId = null
      this.$fetch()
    }
  }
}
</script>

<style scoped>
.categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.empty-card { text-align: center; padding: 48px; color: var(--text-muted); }
.empty-icon { font-size: 40px; margin-bottom: 12px; }

.cat-card { display: flex; align-items: center; gap: 14px; padding: 18px 20px; transition: box-shadow .2s; }
.cat-card:hover { box-shadow: var(--shadow-md); }
.cat-icon { font-size: 28px; flex-shrink: 0; }
.cat-info { flex: 1; }
.cat-name { font-size: 16px; font-weight: 700; }
.cat-count { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.cat-audit { font-size: 11px; color: var(--text-muted); margin-top: 3px; opacity: .7; }
.cat-actions { display: flex; gap: 8px; flex-shrink: 0; }
</style>
