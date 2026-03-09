<template>
  <div class="chat-widget">
    <!-- Bubble button -->
    <button class="chat-bubble" :class="{ open: isOpen }" @click="toggle">
      <span v-if="!isOpen">💬</span>
      <span v-else>✕</span>
      <span v-if="unread > 0 && !isOpen" class="unread-badge">{{ unread }}</span>
    </button>

    <!-- Panel -->
    <div v-if="isOpen" class="chat-panel">
      <!-- Header -->
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="support-av">🛍</div>
          <div>
            <div class="support-name">{{ $t('chat_title') }}</div>
            <div class="support-status">● Online</div>
          </div>
        </div>
        <button v-if="room && room.status === 'open'" class="close-chat-btn" @click="closeRoom">
          {{ $t('chat_close') }}
        </button>
      </div>

      <!-- Not logged in -->
      <div v-if="!isLoggedIn" class="chat-login-prompt">
        <div class="chat-icon-lg">💬</div>
        <p>Please <nuxt-link to="/login" @click.native="isOpen = false">login</nuxt-link> to start chatting.</p>
      </div>

      <template v-else>
        <!-- Messages -->
        <div class="chat-messages" ref="msgs">
          <div v-if="loading" class="chat-loading"><div class="spinner sm"></div></div>
          <template v-else>
            <div class="welcome-msg">{{ $t('chat_welcome') }}</div>
            <div
              v-for="msg in messages" :key="msg._id"
              class="msg-row" :class="msg.senderRole === 'user' ? 'mine' : 'theirs'"
            >
              <div class="msg-bubble">
                <div class="msg-text">{{ msg.text }}</div>
                <div class="msg-time">{{ formatTime(msg.createdAt) }}</div>
              </div>
            </div>
          </template>
        </div>

        <!-- Closed notice -->
        <div v-if="room && room.status === 'closed'" class="closed-banner">{{ $t('chat_closed') }}</div>

        <!-- Start / Input -->
        <div v-else-if="!room" class="chat-start">
          <button class="btn btn-primary btn-block" :disabled="starting" @click="startChat">
            {{ starting ? '…' : $t('chat_start') }}
          </button>
        </div>
        <div v-else class="chat-input">
          <input
            v-model="inputText"
            class="input"
            :placeholder="$t('chat_placeholder')"
            @keyup.enter="sendMessage"
          />
          <button class="send-btn" :disabled="!inputText.trim()" @click="sendMessage">
            ➤
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isOpen: false, room: null, messages: [],
      inputText: '', loading: false, starting: false,
      socket: null, unread: 0
    }
  },
  computed: {
    isLoggedIn() { return this.$store.getters['auth/isAuthenticated'] }
  },
  watch: {
    isOpen(val) {
      if (val && this.isLoggedIn && !this.room) this.loadRoom()
      if (val) this.unread = 0
    }
  },
  methods: {
    toggle() { this.isOpen = !this.isOpen },
    async loadRoom() {
      this.loading = true
      try {
        const { data } = await this.$axios.get('/chat/rooms')
        const open = data.find(r => r.status === 'open') || data[0] || null
        if (open) {
          this.room = open
          await this.loadMessages()
          this.connectSocket()
        }
      } catch {} finally { this.loading = false }
    },
    async loadMessages() {
      const { data } = await this.$axios.get(`/chat/rooms/${this.room._id}/messages`)
      this.messages = data
      this.$nextTick(this.scrollBottom)
    },
    connectSocket() {
      const token = this.$store.state.auth.token
      if (!token || !this.room) return
      this.socket = this.$connectSocket(token)
      this.socket.emit('join_room', this.room._id)
      this.socket.on('new_message', msg => {
        if (msg.room === this.room._id) {
          this.messages.push(msg)
          this.$nextTick(this.scrollBottom)
          if (!this.isOpen) this.unread++
        }
      })
      this.socket.on('room_closed', ({ roomId }) => {
        if (this.room && roomId === this.room._id) this.room.status = 'closed'
      })
    },
    async startChat() {
      this.starting = true
      try {
        const { data } = await this.$axios.post('/chat/rooms')
        this.room = data
        this.messages = []
        this.connectSocket()
        // Notify admins
        if (this.socket) this.socket.emit('announce_room', data)
      } catch {} finally { this.starting = false }
    },
    sendMessage() {
      const text = this.inputText.trim()
      if (!text || !this.socket) return
      this.socket.emit('send_message', { roomId: this.room._id, text })
      this.inputText = ''
    },
    closeRoom() {
      if (this.socket) this.socket.emit('close_room', this.room._id)
    },
    scrollBottom() {
      const el = this.$refs.msgs
      if (el) el.scrollTop = el.scrollHeight
    },
    formatTime(d) {
      return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

<style scoped>
.chat-widget { position: fixed; bottom: 28px; right: 28px; z-index: 9000; }

.chat-bubble {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--primary); color: white; font-size: 22px;
  border: none; cursor: pointer; box-shadow: 0 4px 16px rgba(99,102,241,.4);
  display: flex; align-items: center; justify-content: center;
  transition: transform .2s; position: relative;
}
.chat-bubble:hover { transform: scale(1.08); }
.chat-bubble.open { background: #64748b; }
.unread-badge {
  position: absolute; top: -4px; right: -4px;
  background: #ef4444; color: white; font-size: 11px; font-weight: 700;
  width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
}

.chat-panel {
  position: absolute; bottom: 70px; right: 0;
  width: 340px; height: 480px;
  background: var(--card); border: 1px solid var(--border);
  border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,.2);
  display: flex; flex-direction: column; overflow: hidden;
  animation: panel-in .2s ease;
}
@keyframes panel-in { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }

.chat-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; background: var(--primary); color: white; flex-shrink: 0;
}
.chat-header-info { display: flex; align-items: center; gap: 10px; }
.support-av { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,.2); display: flex; align-items: center; justify-content: center; font-size: 18px; }
.support-name { font-weight: 700; font-size: 14px; }
.support-status { font-size: 11px; opacity: .85; }
.close-chat-btn { background: rgba(255,255,255,.15); border: none; color: white; font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 6px; cursor: pointer; }
.close-chat-btn:hover { background: rgba(255,255,255,.25); }

.chat-login-prompt { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 24px; text-align: center; color: var(--text-muted); font-size: 14px; }
.chat-login-prompt a { color: var(--primary); font-weight: 600; }
.chat-icon-lg { font-size: 40px; }

.chat-messages { flex: 1; overflow-y: auto; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
.chat-loading { display: flex; justify-content: center; padding: 24px; }
.spinner.sm { width: 24px; height: 24px; border-width: 2px; }
.welcome-msg { text-align: center; font-size: 12px; color: var(--text-muted); padding: 4px 0 8px; }

.msg-row { display: flex; }
.mine { justify-content: flex-end; }
.theirs { justify-content: flex-start; }
.msg-bubble { max-width: 80%; padding: 8px 12px; border-radius: 12px; }
.mine .msg-bubble { background: var(--primary); color: white; border-bottom-right-radius: 3px; }
.theirs .msg-bubble { background: var(--bg); border: 1px solid var(--border); border-bottom-left-radius: 3px; }
.msg-text { font-size: 13px; line-height: 1.5; }
.msg-time { font-size: 10px; opacity: .6; margin-top: 3px; text-align: right; }

.closed-banner { padding: 12px; text-align: center; background: #fef3c7; color: #92400e; font-size: 12px; font-weight: 600; flex-shrink: 0; }
.chat-start { padding: 14px 16px; flex-shrink: 0; border-top: 1px solid var(--border); }
.chat-input { display: flex; gap: 8px; padding: 10px 12px; border-top: 1px solid var(--border); flex-shrink: 0; }
.chat-input .input { flex: 1; padding: 8px 12px; font-size: 13px; }
.send-btn { background: var(--primary); color: white; border: none; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 16px; transition: background .15s; }
.send-btn:hover:not(:disabled) { background: var(--primary-dark); }
.send-btn:disabled { opacity: .4; cursor: not-allowed; }

@media (max-width: 480px) {
  .chat-widget { bottom: 16px; right: 16px; }
  .chat-panel { width: calc(100vw - 32px); right: 0; }
}
</style>
