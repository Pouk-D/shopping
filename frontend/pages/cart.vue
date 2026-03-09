<template>
  <div class="container page">
    <h1 class="section-title">Shopping Cart
      <span v-if="cartItems.length" class="count-badge">{{ cartItems.length }}</span>
    </h1>

    <!-- Empty -->
    <div v-if="cartItems.length === 0" class="empty-cart card">
      <div class="empty-icon">🛒</div>
      <h3>Your cart is empty</h3>
      <p>Looks like you haven't added anything yet.</p>
      <nuxt-link to="/" class="btn btn-primary" style="margin-top:16px">Start Shopping</nuxt-link>
    </div>

    <!-- Cart content -->
    <div v-else class="cart-layout">
      <!-- Items -->
      <div class="cart-items card">
        <div v-for="item in cartItems" :key="item._id" class="cart-row">
          <img
            :src="item.image || 'https://via.placeholder.com/80x80?text=?'"
            :alt="item.name"
            class="cart-thumb"
          />
          <div class="cart-item-info">
            <nuxt-link :to="`/product/${item._id}`" class="cart-item-name">{{ item.name }}</nuxt-link>
            <div class="cart-item-price">${{ item.price.toFixed(2) }} each</div>
          </div>
          <div class="qty-control">
            <button class="qty-btn" @click="decrease(item)">−</button>
            <span class="qty-value">{{ item.quantity }}</span>
            <button class="qty-btn" @click="increase(item)">+</button>
          </div>
          <div class="cart-subtotal">${{ (item.price * item.quantity).toFixed(2) }}</div>
          <button class="remove-btn" title="Remove" @click="remove(item._id)">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Summary -->
      <div class="cart-summary card">
        <h2 class="summary-title">Order Summary</h2>
        <div class="summary-rows">
          <div class="summary-row" v-for="item in cartItems" :key="item._id">
            <span>{{ item.name }} ×{{ item.quantity }}</span>
            <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-total">
          <span>Total</span>
          <span>${{ cartTotal.toFixed(2) }}</span>
        </div>
        <nuxt-link to="/checkout" class="btn btn-primary btn-lg btn-block">
          Proceed to Checkout →
        </nuxt-link>
        <nuxt-link to="/" class="btn btn-ghost btn-block" style="margin-top:10px">
          Continue Shopping
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('cart', ['cartItems', 'cartTotal'])
  },
  methods: {
    increase(item) {
      this.$store.dispatch('cart/updateQuantity', { productId: item._id, quantity: item.quantity + 1 })
    },
    decrease(item) {
      this.$store.dispatch('cart/updateQuantity', { productId: item._id, quantity: item.quantity - 1 })
    },
    remove(productId) {
      this.$store.dispatch('cart/removeFromCart', productId)
    }
  }
}
</script>

<style scoped>
.section-title { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
.count-badge {
  background: var(--primary-light);
  color: var(--primary-dark);
  font-size: 14px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}

.empty-cart {
  text-align: center;
  padding: 64px 24px;
  color: var(--text-muted);
}
.empty-icon { font-size: 52px; margin-bottom: 16px; }
.empty-cart h3 { font-size: 22px; color: var(--text); margin-bottom: 8px; }

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;
}
@media (max-width: 860px) { .cart-layout { grid-template-columns: 1fr; } }

.cart-items { overflow: hidden; }
.cart-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}
.cart-row:last-child { border-bottom: none; }

.cart-thumb { width: 72px; height: 72px; object-fit: cover; border-radius: 10px; flex-shrink: 0; }
.cart-item-info { flex: 1; min-width: 0; }
.cart-item-name { font-size: 15px; font-weight: 600; color: var(--text); display: block; }
.cart-item-name:hover { color: var(--primary); }
.cart-item-price { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

.qty-control { display: flex; align-items: center; gap: 8px; }
.qty-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: var(--card);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .15s;
  line-height: 1;
}
.qty-btn:hover { border-color: var(--primary); color: var(--primary); }
.qty-value { font-size: 15px; font-weight: 600; width: 24px; text-align: center; }

.cart-subtotal { font-size: 15px; font-weight: 700; color: var(--text); width: 80px; text-align: right; }
.remove-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all .15s;
}
.remove-btn:hover { background: #fee2e2; color: var(--danger); }

.cart-summary { padding: 24px; }
.summary-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
.summary-rows { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.summary-row { display: flex; justify-content: space-between; font-size: 14px; color: var(--text-muted); }
.summary-divider { border: none; border-top: 2px solid var(--border); margin: 16px 0; }
.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 20px;
}

/* ── Mobile ── */
@media (max-width: 540px) {
  .section-title { font-size: 18px; }
  .cart-row { padding: 14px 16px; gap: 12px; flex-wrap: wrap; }
  .cart-thumb { width: 58px; height: 58px; }
  .cart-item-info { flex: 1; min-width: 0; order: 1; }
  .qty-control { order: 3; }
  .cart-subtotal { order: 4; font-size: 14px; width: auto; }
  .remove-btn { order: 2; margin-left: auto; }
  .cart-summary { padding: 18px 16px; }
}
</style>
