<template>
  <div class="chat-shell">
    <!-- Room list -->
    <div class="room-list">
      <div class="room-list-header">
        <h2 class="room-list-title">{{ $t('chat') }}</h2>
        <div class="room-filter">
          <button :class="{ active: filter === '' }"      @click="filter = ''">{{ $t('all_chats') }}</button>
          <button :class="{ active: filter === 'open' }"  @click="filter = 'open'">{{ $t('open') }}</button>
          <button :class="{ active: filter === 'closed' }" @click="filter = 'closed'">{{ $t('closed') }}</button>
        </div>
      </div>

      <div v-if="loadingRooms" class="loading-center" style="padding:40px 0"><div class="spinner" style="width:24px;height:24px"></div></div>

      <div v-else class="room-items">
        <div v-if="filteredRooms.length === 0" class="no-rooms">{{ $t('no_data') }}</div>
        <div
          v-for="room in filteredRooms" :key="room._id"
          class="room-item" :class="{ active: activeRoom && activeRoom._id === room._id, closed: room.status === 'closed' }"
          @click="selectRoom(room)"
        >
          <div class="room-av" :style="{ background: avatarColor(room.customer?.name || '?') }">
            {{ (room.customer?.name || '?').charAt(0).toUpperCase() }}
          </div>
          <div class="room-info">
            <div class="room-title">{{ room.title }}</div>
            <div class="room-meta">{{ room.customer?.email }}</div>
          </div>
          <span :class="['room-status', room.status === 'open' ? 'status-open' : 'status-closed']">
            {{ $t(room.status) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Chat area -->
    <div class="chat-area">
      <div v-if="!activeRoom" class="chat-empty">
        <div class="chat-empty-icon">💬</div>
        <p>{{ $t('select_chat') }}</p>
      </div>

      <template v-else>
        <!-- Chat header -->
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="room-av sm" :style="{ background: avatarColor(activeRoom.customer?.name || '?') }">
              {{ (activeRoom.customer?.name || '?').charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="chat-customer-name">{{ activeRoom.customer?.name }}</div>
              <div class="chat-customer-email">{{ activeRoom.customer?.email }}</div>
            </div>
          </div>
          <button
            v-if="activeRoom.status === 'open'"
            class="btn btn-danger btn-sm"
            @click="closeRoom"
          >{{ $t('close_room') }}</button>
          <span v-else class="badge badge-gray">{{ $t('closed') }}</span>
        </div>

        <!-- Messages -->
        <div class="messages" ref="messages">
          <div v-if="loadingMsgs" class="loading-center"><div class="spinner"></div></div>
          <template v-else>
            <div v-if="messages.length === 0" class="no-msgs">No messages yet</div>
            <div
              v-for="msg in messages" :key="msg._id"
              class="msg-row" :class="msg.senderRole === 'user' ? 'msg-left' : 'msg-right'"
            >
              <div class="msg-bubble">
                <div class="msg-sender">{{ msg.senderName }}</div>
                <div class="msg-text">{{ msg.text }}</div>
                <div class="msg-time">{{ formatTime(msg.createdAt) }}</div>
              </div>
            </div>
          </template>
        </div>

        <!-- Closed notice -->
        <div v-if="activeRoom.status === 'closed'" class="closed-notice">{{ $t('room_closed') }}</div>

        <!-- Input -->
        <div v-else class="chat-input-row">
          <input
            v-model="inputText" class="input" :placeholder="$t('type_message')"
            @keyup.enter="sendMessage"
          />
          <button class="btn btn-primary" :disabled="!inputText.trim()" @click="sendMessage">{{ $t('send') }}</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rooms: [], loadingRooms: true,
      activeRoom: null, messages: [], loadingMsgs: false,
      inputText: '', filter: 'open',
      socket: null
    }
  },
  computed: {
    filteredRooms() {
      return this.rooms.filter(r => !this.filter || r.status === this.filter)
    }
  },
  async mounted() {
    await this.loadRooms()
    const token = this.$store.state.auth.token
    if (token) {
      this.socket = this.$connectSocket(token)
      this.socket.on('new_message', msg => {
        if (this.activeRoom?._id === msg.room) {
          this.messages.push(msg)
          this.$nextTick(this.scrollBottom)
        }
      })
      this.socket.on('new_room', room => { this.rooms.unshift(room) })
      this.socket.on('room_closed', ({ roomId }) => {
        const r = this.rooms.find(r => r._id === roomId)
        if (r) r.status = 'closed'
        if (this.activeRoom?._id === roomId) this.activeRoom.status = 'closed'
      })
    }
  },
  beforeDestroy() {
    if (this.socket && this.activeRoom) this.socket.emit('leave_room', this.activeRoom._id)
  },
  methods: {
    async loadRooms() {
      try {
        const { data } = await this.$axios.get('/chat/rooms')
        this.rooms = data
      } catch {} finally { this.loadingRooms = false }
    },
    async selectRoom(room) {
      if (this.socket && this.activeRoom) this.socket.emit('leave_room', this.activeRoom._id)
      this.activeRoom = room
      this.loadingMsgs = true
      try {
        const { data } = await this.$axios.get(`/chat/rooms/${room._id}/messages`)
        this.messages = data
        if (this.socket) this.socket.emit('join_room', room._id)
        this.$nextTick(this.scrollBottom)
      } catch {} finally { this.loadingMsgs = false }
    },
    sendMessage() {
      const text = this.inputText.trim()
      if (!text || !this.socket) return
      this.socket.emit('send_message', { roomId: this.activeRoom._id, text })
      this.inputText = ''
    },
    closeRoom() {
      if (!this.socket) return
      this.socket.emit('close_room', this.activeRoom._id)
    },
    scrollBottom() {
      const el = this.$refs.messages
      if (el) el.scrollTop = el.scrollHeight
    },
    formatTime(d) { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    avatarColor(name) {
      const c = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444']
      return c[(name || '?').charCodeAt(0) % c.length]
    }
  }
}
</script>

<style scoped>
.chat-shell {
  display: flex; height: calc(100vh - var(--header-h));
  overflow: hidden;
}

/* Room list */
.room-list { width: 300px; flex-shrink: 0; border-right: 1px solid var(--border); display: flex; flex-direction: column; background: var(--card); }
.room-list-header { padding: 18px 16px 12px; border-bottom: 1px solid var(--border); }
.room-list-title { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
.room-filter { display: flex; gap: 4px; }
.room-filter button { padding: 4px 10px; border: 1.5px solid var(--border); border-radius: 999px; background: none; font-size: 12px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all .15s; }
.room-filter button.active { background: var(--primary); color: white; border-color: var(--primary); }
.room-items { flex: 1; overflow-y: auto; }
.no-rooms { padding: 32px; text-align: center; color: var(--text-muted); font-size: 13px; }

.room-item { display: flex; align-items: center; gap: 10px; padding: 12px 16px; cursor: pointer; border-bottom: 1px solid var(--border); transition: background .12s; }
.room-item:hover { background: var(--bg); }
.room-item.active { background: var(--primary-light); }
.room-item.closed { opacity: .6; }
.room-av { width: 38px; height: 38px; border-radius: 50%; color: white; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.room-av.sm { width: 32px; height: 32px; font-size: 12px; }
.room-info { flex: 1; min-width: 0; }
.room-title { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.room-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.room-status { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; flex-shrink: 0; }
.status-open { background: #d1fae5; color: #065f46; }
.status-closed { background: #f1f5f9; color: #64748b; }

/* Chat area */
.chat-area { flex: 1; display: flex; flex-direction: column; background: var(--bg); }
.chat-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); gap: 12px; }
.chat-empty-icon { font-size: 48px; }
.chat-empty p { font-size: 14px; }

.chat-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: var(--card); border-bottom: 1px solid var(--border); }
.chat-header-info { display: flex; align-items: center; gap: 10px; }
.chat-customer-name { font-size: 14px; font-weight: 700; }
.chat-customer-email { font-size: 12px; color: var(--text-muted); }

.messages { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; }
.no-msgs { text-align: center; color: var(--text-muted); font-size: 13px; padding: 24px 0; }

.msg-row { display: flex; }
.msg-left { justify-content: flex-start; }
.msg-right { justify-content: flex-end; }
.msg-bubble { max-width: 70%; padding: 10px 14px; border-radius: 14px; }
.msg-left .msg-bubble { background: var(--card); border: 1px solid var(--border); border-bottom-left-radius: 4px; }
.msg-right .msg-bubble { background: var(--primary); color: white; border-bottom-right-radius: 4px; }
.msg-sender { font-size: 11px; font-weight: 700; margin-bottom: 3px; opacity: .7; }
.msg-text { font-size: 14px; line-height: 1.5; }
.msg-time { font-size: 10px; margin-top: 4px; opacity: .6; text-align: right; }

.closed-notice { padding: 14px; text-align: center; background: #fef3c7; color: #92400e; font-size: 13px; font-weight: 600; }
.chat-input-row { display: flex; gap: 10px; padding: 14px 20px; background: var(--card); border-top: 1px solid var(--border); }
.chat-input-row .input { flex: 1; }
</style>
