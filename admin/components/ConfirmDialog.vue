<template>
  <div class="confirm-overlay" @click.self="$emit('cancel')">
    <div class="confirm-card">
      <div class="confirm-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"></path>
          <path d="M10 11v6M14 11v6"></path>
          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"></path>
        </svg>
      </div>
      <h3 class="confirm-title">{{ title }}</h3>
      <p class="confirm-msg">{{ message }}</p>
      <div class="confirm-actions">
        <button class="btn btn-ghost" @click="$emit('cancel')">{{ cancelText }}</button>
        <button class="btn btn-danger" @click="$emit('confirm')">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title:       { type: String, default: 'Are you sure?' },
    message:     { type: String, default: 'This action cannot be undone.' },
    confirmText: { type: String, default: 'Delete' },
    cancelText:  { type: String, default: 'Cancel' }
  }
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: fade-in 0.15s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.confirm-card {
  background: var(--card);
  border-radius: 16px;
  padding: 32px 28px 24px;
  width: 100%;
  max-width: 360px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
  animation: slide-up 0.18s ease;
}

@keyframes slide-up {
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.confirm-icon {
  width: 56px;
  height: 56px;
  background: #fee2e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #ef4444;
}

.confirm-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}

.confirm-msg {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 24px;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.confirm-actions .btn {
  flex: 1;
  max-width: 140px;
}
</style>
