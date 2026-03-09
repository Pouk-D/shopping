<template>
  <div class="container page">
    <div v-if="loading" class="loading-center">
      <div class="spinner"></div>
    </div>

    <template v-else-if="product">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <nuxt-link to="/">Home</nuxt-link>
        <span class="sep">›</span>
        <span v-if="product.category">{{ product.category.name }}</span>
        <span class="sep">›</span>
        <span class="current">{{ product.name }}</span>
      </nav>

      <div class="product-layout">
        <!-- IMAGE CAROUSEL -->
        <div class="carousel-wrap">
          <!-- Main image -->
          <div
            class="carousel-main"
            @touchstart.passive="onTouchStart"
            @touchmove.passive="onTouchMove"
            @touchend="onTouchEnd"
          >
            <transition :name="slideDirection">
              <img
                :key="activeIndex"
                :src="galleryImages[activeIndex]"
                :alt="product.name"
                class="carousel-img"
              />
            </transition>

            <!-- Arrows -->
            <button
              v-if="galleryImages.length > 1"
              class="arrow arrow-left"
              @click="prev"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button
              v-if="galleryImages.length > 1"
              class="arrow arrow-right"
              @click="next"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <!-- Dots -->
            <div v-if="galleryImages.length > 1" class="dots">
              <button
                v-for="(img, i) in galleryImages"
                :key="i"
                class="dot"
                :class="{ active: i === activeIndex }"
                @click="goTo(i)"
              />
            </div>
          </div>

          <!-- Thumbnails -->
          <div v-if="galleryImages.length > 1" class="thumbnails">
            <button
              v-for="(img, i) in galleryImages"
              :key="i"
              class="thumb-btn"
              :class="{ active: i === activeIndex }"
              @click="goTo(i)"
            >
              <img :src="img" :alt="`View ${i + 1}`" class="thumb-img" />
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="product-info">
          <span class="category-tag">{{ product.category && product.category.name }}</span>
          <h1 class="product-title">{{ product.name }}</h1>
          <div class="product-price">${{ product.price.toFixed(2) }}</div>

          <p class="product-desc">{{ product.description }}</p>

          <div class="stock-info" :class="product.stock > 0 ? 'in-stock' : 'no-stock'">
            <span class="stock-dot"></span>
            {{ product.stock > 0 ? `${product.stock} in stock` : 'Out of stock' }}
          </div>

          <!-- Quantity selector -->
          <div v-if="product.stock > 0" class="qty-row">
            <label class="field-label">Quantity</label>
            <div class="qty-control">
              <button class="qty-btn" :disabled="qty <= 1" @click="qty--">−</button>
              <span class="qty-value">{{ qty }}</span>
              <button class="qty-btn" :disabled="qty >= product.stock" @click="qty++">+</button>
            </div>
          </div>

          <div class="action-row">
            <button
              class="btn btn-primary btn-lg"
              :disabled="product.stock === 0 || added"
              @click="addToCart"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {{ added ? 'Added to Cart ✓' : 'Add to Cart' }}
            </button>
            <nuxt-link to="/cart" class="btn btn-outline btn-lg">View Cart</nuxt-link>
          </div>

          <!-- Image counter -->
          <div v-if="galleryImages.length > 1" class="img-counter">
            Photo {{ activeIndex + 1 }} of {{ galleryImages.length }}
          </div>
        </div>
      </div>
    </template>

    <div v-else class="empty-state">
      <div class="empty-icon">😕</div>
      <h3>Product not found</h3>
      <nuxt-link to="/" class="btn btn-primary" style="margin-top:16px">Back to Shop</nuxt-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return { activeIndex: 0, slideDirection: 'slide-left', added: false, qty: 1, touchStartX: 0, touchDeltaX: 0 }
  },
  computed: {
    ...mapState('products', ['product', 'loading']),
    galleryImages() {
      if (!this.product) return []
      if (this.product.images && this.product.images.length > 0) return this.product.images
      if (this.product.image) return [this.product.image]
      return ['https://via.placeholder.com/600x600?text=No+Image']
    }
  },
  async fetch() {
    await this.$store.dispatch('products/fetchProduct', this.$route.params.id)
  },
  methods: {
    goTo(i) {
      this.slideDirection = i > this.activeIndex ? 'slide-left' : 'slide-right'
      this.activeIndex = i
    },
    next() {
      this.slideDirection = 'slide-left'
      this.activeIndex = (this.activeIndex + 1) % this.galleryImages.length
    },
    prev() {
      this.slideDirection = 'slide-right'
      this.activeIndex = (this.activeIndex - 1 + this.galleryImages.length) % this.galleryImages.length
    },
    addToCart() {
      for (let i = 0; i < this.qty; i++) {
        this.$store.dispatch('cart/addToCart', this.product)
      }
      this.added = true
      setTimeout(() => { this.added = false }, 2000)
    },
    onTouchStart(e) {
      this.touchStartX = e.touches[0].clientX
      this.touchDeltaX = 0
    },
    onTouchMove(e) {
      this.touchDeltaX = e.touches[0].clientX - this.touchStartX
    },
    onTouchEnd() {
      if (Math.abs(this.touchDeltaX) > 50) {
        this.touchDeltaX < 0 ? this.next() : this.prev()
      }
      this.touchDeltaX = 0
    }
  }
}
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 28px;
}
.breadcrumb a:hover { color: var(--primary); }
.sep { color: var(--border); }
.current { color: var(--text); font-weight: 500; }

.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 52px;
  align-items: start;
}
@media (max-width: 720px) {
  .product-layout { grid-template-columns: 1fr; gap: 28px; }
}

/* ── Carousel ── */
.carousel-wrap { display: flex; flex-direction: column; gap: 12px; }

.carousel-main {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #f1f5f9;
  aspect-ratio: 1;
}

.carousel-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Slide transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.35s cubic-bezier(.4,0,.2,1), opacity 0.35s ease;
  position: absolute;
  width: 100%;
  height: 100%;
}
.slide-left-enter  { transform: translateX(100%); opacity: 0; }
.slide-left-leave-to { transform: translateX(-100%); opacity: 0; }
.slide-right-enter { transform: translateX(-100%); opacity: 0; }
.slide-right-leave-to { transform: translateX(100%); opacity: 0; }

/* Arrow buttons */
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(255,255,255,.92);
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text);
  transition: all .15s;
  box-shadow: 0 2px 8px rgba(0,0,0,.12);
}
.arrow:hover { background: var(--card); box-shadow: 0 4px 12px rgba(0,0,0,.18); }
.arrow-left  { left: 12px; }
.arrow-right { right: 12px; }

/* Dots */
.dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 10;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,.6);
  cursor: pointer;
  transition: all .2s;
  padding: 0;
}
.dot.active {
  background: white;
  width: 22px;
  border-radius: 4px;
}

/* Thumbnails */
.thumbnails {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
}
.thumb-btn {
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  border-radius: 10px;
  overflow: hidden;
  border: 2.5px solid transparent;
  padding: 0;
  cursor: pointer;
  background: #f1f5f9;
  transition: border-color .15s;
  opacity: 0.7;
}
.thumb-btn:hover { opacity: 1; }
.thumb-btn.active { border-color: var(--primary); opacity: 1; }
.thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* ── Product Info ── */
.product-info { display: flex; flex-direction: column; gap: 16px; }
.category-tag { font-size: 12px; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: .06em; }
.product-title { font-size: 30px; font-weight: 800; line-height: 1.2; color: var(--text); }
.product-price { font-size: 34px; font-weight: 800; color: var(--primary); }
.product-desc { font-size: 15px; color: var(--text-muted); line-height: 1.7; }

.stock-info { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; }
.in-stock  { color: var(--success); }
.no-stock  { color: var(--danger); }
.stock-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }

.qty-row { display: flex; flex-direction: column; gap: 8px; }
.qty-control { display: flex; align-items: center; gap: 10px; }
.qty-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: var(--card);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .15s;
  line-height: 1;
}
.qty-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.qty-btn:disabled { opacity: .35; cursor: not-allowed; }
.qty-value { font-size: 16px; font-weight: 700; width: 28px; text-align: center; }

.action-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 4px; }

.img-counter { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

.empty-state { text-align: center; padding: 80px 0; color: var(--text-muted); }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state h3 { font-size: 20px; color: var(--text); }

/* ── Mobile ── */
@media (max-width: 640px) {
  .breadcrumb { font-size: 12px; margin-bottom: 16px; }
  .product-title { font-size: 22px; }
  .product-price { font-size: 26px; }
  .product-desc { font-size: 14px; }
  .thumb-btn { width: 56px; height: 56px; }
  .action-row { flex-direction: column; }
  .action-row .btn { width: 100%; justify-content: center; }
  .arrow { width: 34px; height: 34px; }
}
</style>
