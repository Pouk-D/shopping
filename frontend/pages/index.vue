<template>
  <div>
    <!-- Hero -->
    <section class="hero">
      <div class="container hero-inner">
        <h1 class="hero-title">Find What You Love</h1>
        <p class="hero-sub">Discover thousands of products at unbeatable prices.</p>
        <div class="hero-search">
          <svg class="search-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="search"
            class="hero-input"
            placeholder="Search products..."
            @input="onSearch"
          />
        </div>
      </div>
    </section>

    <div class="container page">
      <!-- Filters -->
      <div class="filter-bar">
        <div class="filter-label">Category:</div>
        <div class="filter-tabs">
          <button
            class="filter-tab"
            :class="{ active: selectedCategory === '' }"
            @click="setCategory('')"
          >All</button>
          <button
            v-for="cat in categories"
            :key="cat._id"
            class="filter-tab"
            :class="{ active: selectedCategory === cat._id }"
            @click="setCategory(cat._id)"
          >{{ cat.name }}</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-center">
        <div class="spinner"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="products.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try a different search or category.</p>
      </div>

      <!-- Grid -->
      <div v-else class="product-grid">
        <div
          v-for="product in products"
          :key="product._id"
          class="product-card"
        >
          <nuxt-link :to="`/product/${product._id}`" class="product-img-wrap">
            <img
              :src="product.image || 'https://via.placeholder.com/400x300?text=No+Image'"
              :alt="product.name"
              class="product-img"
            />
            <span v-if="product.stock === 0" class="out-of-stock-overlay">Out of Stock</span>
          </nuxt-link>
          <div class="product-body">
            <span class="product-category">{{ product.category && product.category.name }}</span>
            <nuxt-link :to="`/product/${product._id}`" class="product-name">{{ product.name }}</nuxt-link>
            <div class="product-footer">
              <span class="product-price">${{ product.price.toFixed(2) }}</span>
              <button
                class="btn btn-primary btn-sm"
                :disabled="product.stock === 0"
                @click="addToCart(product)"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pages > 1" class="pagination">
        <button class="btn btn-ghost btn-sm" :disabled="page <= 1" @click="changePage(page - 1)">
          ← Prev
        </button>
        <div class="page-numbers">
          <button
            v-for="p in pages"
            :key="p"
            class="page-num"
            :class="{ active: p === page }"
            @click="changePage(p)"
          >{{ p }}</button>
        </div>
        <button class="btn btn-ghost btn-sm" :disabled="page >= pages" @click="changePage(page + 1)">
          Next →
        </button>
      </div>
    </div>

    <!-- Added toast -->
    <transition name="toast">
      <div v-if="toast" class="toast">
        ✓ {{ toast }}
      </div>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return { search: '', selectedCategory: '', toast: '' }
  },
  computed: {
    ...mapState('products', ['products', 'categories', 'loading', 'page', 'pages'])
  },
  async fetch() {
    await Promise.all([
      this.$store.dispatch('products/fetchProducts'),
      this.$store.dispatch('products/fetchCategories')
    ])
  },
  methods: {
    setCategory(id) {
      this.selectedCategory = id
      this.fetchFiltered()
    },
    async fetchFiltered() {
      await this.$store.dispatch('products/fetchProducts', {
        search: this.search,
        category: this.selectedCategory,
        page: 1
      })
    },
    onSearch() {
      clearTimeout(this._searchTimer)
      this._searchTimer = setTimeout(this.fetchFiltered, 400)
    },
    async changePage(p) {
      await this.$store.dispatch('products/fetchProducts', {
        search: this.search,
        category: this.selectedCategory,
        page: p
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    addToCart(product) {
      this.$store.dispatch('cart/addToCart', product)
      this.toast = `${product.name} added to cart`
      clearTimeout(this._toastTimer)
      this._toastTimer = setTimeout(() => { this.toast = '' }, 2500)
    }
  }
}
</script>

<style scoped>
/* Hero */
.hero {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 64px 0;
  color: white;
  text-align: center;
}
.hero-title { font-size: 42px; font-weight: 800; margin-bottom: 10px; letter-spacing: -.5px; }
.hero-sub { font-size: 18px; opacity: .85; margin-bottom: 28px; }
.hero-search {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.hero-input {
  width: 100%;
  padding: 14px 16px 14px 44px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-family: inherit;
  outline: none;
  box-shadow: 0 4px 20px rgba(0,0,0,.2);
  background: var(--card);
  color: var(--text);
}

/* Filters */
.filter-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; }
.filter-label { font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; }
.filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-tab {
  padding: 6px 16px;
  border-radius: 999px;
  border: 1.5px solid var(--border);
  background: var(--card);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all .15s;
}
.filter-tab:hover { border-color: var(--primary); color: var(--primary); }
.filter-tab.active { background: var(--primary); color: white; border-color: var(--primary); }

/* Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

/* ── Mobile ── */
@media (max-width: 640px) {
  .hero { padding: 40px 0; }
  .hero-title { font-size: 26px; letter-spacing: -.2px; }
  .hero-sub { font-size: 15px; margin-bottom: 20px; }
  .hero-input { font-size: 15px; padding: 12px 14px 12px 40px; }
  .filter-label { display: none; }
  .filter-tabs { gap: 6px; }
  .filter-tab { padding: 5px 12px; font-size: 12px; }
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .product-body { padding: 10px 12px; }
  .product-name { font-size: 13px; margin-bottom: 8px; }
  .product-price { font-size: 15px; }
  .pagination { gap: 6px; margin-top: 24px; }
  .toast { left: 16px; right: 16px; bottom: 16px; text-align: center; }
}

.product-card {
  background: var(--card);
  border-radius: 14px;
  border: 1px solid var(--border);
  overflow: hidden;
  transition: transform .2s, box-shadow .2s;
}
.product-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }

.product-img-wrap { display: block; position: relative; overflow: hidden; aspect-ratio: 4/3; }
.product-img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.product-card:hover .product-img { transform: scale(1.04); }
.out-of-stock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,.45);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .04em;
}

.product-body { padding: 14px 16px; }
.product-category { font-size: 11px; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: .06em; }
.product-name {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin: 4px 0 12px;
  line-height: 1.4;
}
.product-name:hover { color: var(--primary); }
.product-footer { display: flex; align-items: center; justify-content: space-between; }
.product-price { font-size: 18px; font-weight: 700; color: var(--text); }

/* Pagination */
.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 40px; }
.page-numbers { display: flex; gap: 4px; }
.page-num {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: var(--card);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all .15s;
}
.page-num:hover { border-color: var(--primary); color: var(--primary); }
.page-num.active { background: var(--primary); color: white; border-color: var(--primary); }

/* Empty */
.empty-state { text-align: center; padding: 80px 0; color: var(--text-muted); }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state h3 { font-size: 20px; color: var(--text); margin-bottom: 6px; }

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1e293b;
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: var(--shadow-md);
  z-index: 999;
}
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter, .toast-leave-to { opacity: 0; transform: translateY(10px); }
</style>
