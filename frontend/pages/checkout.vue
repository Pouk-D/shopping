<template>
  <div class="container page">
    <h1 class="section-title">Checkout</h1>

    <div v-if="cartItems.length === 0 && !success" class="empty-cart card">
      <div class="empty-icon">🛒</div>
      <h3>Your cart is empty</h3>
      <nuxt-link to="/" class="btn btn-primary" style="margin-top:16px">Shop Now</nuxt-link>
    </div>

    <!-- Success state -->
    <div v-else-if="success" class="success-card card">
      <div class="success-icon">✅</div>
      <h2>Order Placed Successfully!</h2>
      <p>Thank you for your purchase. Your order is being processed.</p>
      <p class="order-id">Order ID: <strong>#{{ orderId.slice(-8).toUpperCase() }}</strong></p>
      <nuxt-link to="/" class="btn btn-primary" style="margin-top:24px">Continue Shopping</nuxt-link>
    </div>

    <!-- Checkout layout -->
    <div v-else class="checkout-layout">
      <!-- Order summary -->
      <div class="summary-card card">
        <h2 class="card-title">Order Summary</h2>
        <div class="order-items">
          <div v-for="item in cartItems" :key="item._id" class="order-item">
            <img
              :src="item.image || 'https://via.placeholder.com/56x56?text=?'"
              :alt="item.name"
              class="order-thumb"
            />
            <div class="order-item-info">
              <div class="order-item-name">{{ item.name }}</div>
              <div class="order-item-meta">Qty: {{ item.quantity }} · ${{ item.price.toFixed(2) }} each</div>
            </div>
            <div class="order-item-total">${{ (item.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>
        <div class="order-divider"></div>
        <div class="order-total">
          <span>Total</span>
          <span class="total-amount">${{ cartTotal.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Place order -->
      <div class="place-order-card card">
        <h2 class="card-title">Payment</h2>
        <div class="payment-note">
          <span class="payment-icon">🔒</span>
          <span>This is a demo checkout. No real payment is processed.</span>
        </div>

        <div v-if="error" class="alert alert-error" style="margin-top:16px">{{ error }}</div>

        <button
          class="btn btn-primary btn-lg btn-block"
          style="margin-top:24px"
          :disabled="loading"
          @click="placeOrder"
        >
          <span v-if="loading" class="btn-spinner"></span>
          {{ loading ? 'Placing order...' : `Place Order — $${cartTotal.toFixed(2)}` }}
        </button>

        <nuxt-link to="/cart" class="btn btn-ghost btn-block" style="margin-top:10px">
          ← Back to Cart
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  middleware: 'auth',
  data() {
    return { loading: false, error: '', success: false, orderId: '' }
  },
  computed: {
    ...mapGetters('cart', ['cartItems', 'cartTotal']),
    ...mapGetters('auth', ['isAuthenticated'])
  },
  methods: {
    async placeOrder() {
      this.loading = true
      this.error = ''
      try {
        const items = this.cartItems.map(i => ({ productId: i._id, quantity: i.quantity }))
        const { data } = await this.$axios.post('/orders', { items })
        this.orderId = data._id
        this.success = true
        this.$store.dispatch('cart/clearCart')
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to place order'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.empty-cart, .success-card {
  text-align: center;
  padding: 64px 24px;
  color: var(--text-muted);
}
.empty-icon, .success-icon { font-size: 52px; margin-bottom: 16px; }
.empty-cart h3, .success-card h2 { font-size: 22px; color: var(--text); margin-bottom: 8px; }
.order-id { margin-top: 8px; font-size: 15px; color: var(--text-muted); }

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: start;
}
@media (max-width: 860px) { .checkout-layout { grid-template-columns: 1fr; } }

@media (max-width: 540px) {
  .summary-card, .place-order-card { padding: 18px 16px; }
  .card-title { font-size: 16px; margin-bottom: 14px; }
  .empty-cart, .success-card { padding: 48px 16px; }
}

.card-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
.summary-card, .place-order-card { padding: 24px; }

.order-items { display: flex; flex-direction: column; gap: 16px; }
.order-item { display: flex; align-items: center; gap: 14px; }
.order-thumb { width: 56px; height: 56px; object-fit: cover; border-radius: 10px; flex-shrink: 0; }
.order-item-info { flex: 1; }
.order-item-name { font-size: 14px; font-weight: 600; color: var(--text); }
.order-item-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.order-item-total { font-size: 14px; font-weight: 700; }

.order-divider { border: none; border-top: 2px solid var(--border); margin: 20px 0; }
.order-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; }
.total-amount { font-size: 22px; color: var(--primary); }

.payment-note {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 13px;
  color: var(--text-muted);
}
.payment-icon { font-size: 20px; }

.btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  margin-right: 4px;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
