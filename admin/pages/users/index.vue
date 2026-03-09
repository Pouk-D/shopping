<template>
  <div class="page-wrap">
    <div class="page-header">
      <h1 class="page-title">Users</h1>
      <div style="display:flex;gap:10px;align-items:center">
        <input v-model="search" class="input" placeholder="Search name or email..." style="width:240px" />
        <button v-if="isSuperAdmin" class="btn btn-primary" @click="showCreateModal = true">+ Create Admin</button>
      </div>
    </div>

    <!-- Summary cards -->
    <div class="summary-cards">
      <div class="summary-card card">
        <div class="s-value">{{ users.length }}</div>
        <div class="s-label">Total Users</div>
      </div>
      <div class="summary-card card">
        <div class="s-value">{{ superAdminCount }}</div>
        <div class="s-label">Super Admins</div>
      </div>
      <div class="summary-card card">
        <div class="s-value">{{ adminCount }}</div>
        <div class="s-label">Admins</div>
      </div>
      <div class="summary-card card">
        <div class="s-value">{{ regularCount }}</div>
        <div class="s-label">Regular Users</div>
      </div>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner"></div></div>

    <div v-else class="card">
      <table class="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th v-if="isSuperAdmin">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td :colspan="isSuperAdmin ? 5 : 4" style="text-align:center;padding:48px;color:var(--text-muted)">No users found</td>
          </tr>
          <tr v-for="user in filtered" :key="user._id">
            <td>
              <div class="user-cell">
                <div class="user-av" :style="{ background: avatarColor(user.name) }">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
                <div class="user-name">{{ user.name }}</div>
              </div>
            </td>
            <td class="text-muted">{{ user.email }}</td>
            <td>
              <span :class="['badge', roleBadgeClass(user.role)]">{{ roleLabel(user.role) }}</span>
            </td>
            <td class="text-muted">{{ formatDate(user.createdAt) }}</td>
            <td v-if="isSuperAdmin">
              <div style="display:flex;gap:6px;flex-wrap:wrap" v-if="user.role !== 'super_admin'">
                <button
                  v-if="user.role === 'user'"
                  class="btn btn-ghost btn-sm"
                  :disabled="saving === user._id"
                  @click="setRole(user, 'admin')"
                >{{ $t('make_admin') }}</button>
                <button
                  v-if="user.role === 'admin'"
                  class="btn btn-ghost btn-sm"
                  :disabled="saving === user._id"
                  @click="setRole(user, 'user')"
                >{{ $t('revoke_admin') }}</button>
                <button
                  v-if="user.role === 'admin'"
                  class="btn btn-ghost btn-sm"
                  @click="resetTarget = user; resetPwd = ''; resetError = ''"
                >🔑 {{ $t('reset_password') }}</button>
              </div>
              <span v-else class="text-muted" style="font-size:12px">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Reset Password Modal -->
    <div v-if="resetTarget" class="modal-overlay" @click.self="resetTarget = null">
      <div class="modal card" style="max-width:380px">
        <div class="modal-header">
          <h2>{{ $t('reset_password') }} — {{ resetTarget.name }}</h2>
          <button class="modal-close" @click="resetTarget = null">✕</button>
        </div>
        <form class="modal-form" @submit.prevent="doReset">
          <div class="form-field">
            <label class="field-label">{{ $t('new_password') }}</label>
            <input v-model="resetPwd" class="input" type="password" placeholder="Min. 6 characters" minlength="6" required />
          </div>
          <div v-if="resetError" class="alert alert-error">{{ resetError }}</div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="resetTarget = null">{{ $t('cancel') }}</button>
            <button type="submit" class="btn btn-primary" :disabled="resetting">
              {{ resetting ? '…' : $t('confirm') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create Admin Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreate">
      <div class="modal card" style="max-width:420px">
        <div class="modal-header">
          <h2>Create Admin Account</h2>
          <button class="modal-close" @click="closeCreate">✕</button>
        </div>
        <form class="modal-form" @submit.prevent="createAdmin">
          <div class="form-field">
            <label class="field-label">Full Name</label>
            <input v-model="createForm.name" class="input" placeholder="John Doe" required />
          </div>
          <div class="form-field">
            <label class="field-label">Email</label>
            <input v-model="createForm.email" class="input" type="email" placeholder="admin@example.com" required />
          </div>
          <div class="form-field">
            <label class="field-label">Password</label>
            <input v-model="createForm.password" class="input" type="password" placeholder="Min. 6 characters" minlength="6" required />
          </div>
          <div class="form-field">
            <label class="field-label">Role</label>
            <select v-model="createForm.role" class="input">
              <option value="user">👤 Regular User</option>
              <option value="admin">👑 Admin</option>
            </select>
          </div>
          <div v-if="createError" class="alert alert-error">{{ createError }}</div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="closeCreate">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="creating">
              <span v-if="creating" class="btn-spinner"></span>
              {{ creating ? 'Creating…' : 'Create Admin' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      users: [],
      loading: true,
      search: '',
      saving: null,
      showCreateModal: false,
      createForm: { name: '', email: '', password: '', role: 'admin' },
      createError: '',
      creating: false,
      toast: '',
      resetTarget: null, resetPwd: '', resetError: '', resetting: false
    }
  },
  computed: {
    isSuperAdmin() { return this.$store.getters['auth/isSuperAdmin'] },
    filtered() {
      const q = this.search.toLowerCase()
      return this.users.filter(u =>
        !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      )
    },
    superAdminCount() { return this.users.filter(u => u.role === 'super_admin').length },
    adminCount()      { return this.users.filter(u => u.role === 'admin').length },
    regularCount()    { return this.users.filter(u => u.role === 'user').length }
  },
  async fetch() {
    try {
      const { data } = await this.$axios.get('/users')
      this.users = data
    } catch {} finally { this.loading = false }
  },
  methods: {
    async setRole(user, role) {
      this.saving = user._id
      try {
        const { data } = await this.$axios.put(`/users/${user._id}/role`, { role })
        const i = this.users.findIndex(u => u._id === user._id)
        if (i !== -1) this.users.splice(i, 1, data)
        this.showToast(`${user.name} is now ${role === 'admin' ? 'an Admin' : 'a regular User'}`)
      } catch (err) {
        this.showToast(err.response?.data?.message || 'Failed to update role')
      } finally {
        this.saving = null
      }
    },
    async createAdmin() {
      this.createError = ''
      this.creating = true
      try {
        const { data } = await this.$axios.post('/users/create-admin', this.createForm)
        this.users.unshift(data)
        this.closeCreate()
        this.showToast(`Admin account for ${data.name} created`)
      } catch (err) {
        this.createError = err.response?.data?.message || 'Failed to create admin'
      } finally {
        this.creating = false
      }
    },
    closeCreate() {
      this.showCreateModal = false
      this.createForm = { name: '', email: '', password: '', role: 'admin' }
      this.createError = ''
    },
    async doReset() {
      this.resetError = ''; this.resetting = true
      try {
        await this.$axios.put(`/users/${this.resetTarget._id}/reset-password`, { password: this.resetPwd })
        this.resetTarget = null
        this.showToast('Password reset successfully')
      } catch (err) {
        this.resetError = err.response?.data?.message || 'Failed'
      } finally { this.resetting = false }
    },
    showToast(msg) {
      this.toast = msg
      setTimeout(() => { this.toast = '' }, 3000)
    },
    roleBadgeClass(role) {
      return { super_admin: 'badge-danger', admin: 'badge-primary', user: 'badge-gray' }[role] || 'badge-gray'
    },
    roleLabel(role) {
      return { super_admin: '⭐ Super Admin', admin: '👑 Admin', user: '👤 User' }[role] || role
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
.summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.summary-card { padding: 20px 24px; text-align: center; }
.s-value { font-size: 32px; font-weight: 800; color: var(--primary); }
.s-label { font-size: 13px; color: var(--text-muted); font-weight: 500; margin-top: 4px; }

.user-cell { display: flex; align-items: center; gap: 10px; }
.user-av {
  width: 36px; height: 36px; border-radius: 50%; font-size: 14px; font-weight: 700; color: white;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.user-name { font-size: 14px; font-weight: 600; }
.text-muted { font-size: 13px; color: var(--text-muted); }

.btn-spinner {
  display: inline-block; width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.4); border-top-color: white;
  border-radius: 50%; animation: spin .7s linear infinite; margin-right: 4px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  background: #1e293b; color: white; padding: 12px 24px; border-radius: 10px;
  font-size: 14px; font-weight: 500; box-shadow: 0 8px 24px rgba(0,0,0,.2);
  z-index: 9999; animation: fade-up .2s ease;
}
@keyframes fade-up { from { opacity:0; transform: translateX(-50%) translateY(8px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
</style>
