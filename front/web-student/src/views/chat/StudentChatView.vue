<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { sendChatMessage } from '../../api/student';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const messages = ref<ChatMessage[]>([]);
const inputMessage = ref('');
const isLoading = ref(false);
const messagesContainer = ref<HTMLElement>();

async function handleSendMessage() {
  if (!inputMessage.value.trim() || isLoading.value) return;
  
  const userMessage = inputMessage.value.trim();
  inputMessage.value = '';
  isLoading.value = true;
  
  messages.value.push({
    role: 'user',
    content: userMessage
  });
  
  await scrollToBottom();
  
  try {
    const response = await sendChatMessage(userMessage, messages.value.slice(0, -1));
    
    messages.value.push({
      role: 'assistant',
      content: response.response
    });
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: '抱歉，发生错误，请稍后重试。'
    });
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
}

async function scrollToBottom() {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

onMounted(() => {
  messages.value.push({
    role: 'assistant',
    content: '你好！我是学生成长档案系统的智能助手。你可以问我关于系统功能、学生画像、数据分析等任何问题，我会尽力为你解答！'
  });
});
</script>

<template>
  <section class="page-shell chat-page">
    <div class="panel-card chat-container">
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-title">智能助手</div>
          <div class="chat-subtitle">基于千问大模型，为你提供专业的解答</div>
        </div>
        <div class="chat-status">
          <span class="status-dot"></span>
          <span class="status-text">在线</span>
        </div>
      </div>
      
      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message-item"
          :class="message.role"
        >
          <div class="message-avatar">
            {{ message.role === 'user' ? '我' : 'AI' }}
          </div>
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
          </div>
        </div>
        
        <div v-if="isLoading" class="message-item assistant">
          <div class="message-avatar">AI</div>
          <div class="message-content">
            <div class="message-text">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chat-input-area">
        <div class="chat-input-wrapper">
          <input
            v-model="inputMessage"
            type="text"
            class="chat-input"
            placeholder="输入你的问题..."
            @keyup.enter="handleSendMessage"
            :disabled="isLoading"
          />
          <button
            class="send-button"
            @click="handleSendMessage"
            :disabled="!inputMessage.trim() || isLoading"
          >
            发送
          </button>
        </div>
        <div class="chat-tips">
          提示：你可以问我关于学生画像、风险评估、系统功能等问题
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  padding: 0;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e4edf8;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.chat-header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-title {
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
}

.chat-subtitle {
  font-size: 12px;
  color: #64748b;
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #f0fdf4;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
}

.status-text {
  font-size: 12px;
  font-weight: 700;
  color: #16a34a;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #f8fbff;
}

.message-item {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.message-item.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 14px;
  flex-shrink: 0;
}

.message-item.user .message-avatar {
  background: linear-gradient(135deg, #1677ff, #5aa9ff);
  color: #fff;
}

.message-item.assistant .message-avatar {
  background: linear-gradient(135deg, #22c55e, #86efac);
  color: #fff;
}

.message-content {
  flex: 1;
}

.message-text {
  padding: 14px 18px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
}

.message-item.user .message-text {
  background: linear-gradient(135deg, #1677ff, #4ea4ff);
  color: #fff;
}

.message-item.assistant .message-text {
  background: #ffffff;
  color: #0f172a;
  border: 1px solid #e4edf8;
}

.typing-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #64748b;
  margin-right: 6px;
  animation: typing 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-4px);
  }
}

.chat-input-area {
  padding: 20px 24px;
  border-top: 1px solid #e4edf8;
  background: #ffffff;
}

.chat-input-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.chat-input {
  flex: 1;
  padding: 14px 18px;
  border: 2px solid #e4edf8;
  border-radius: 14px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: #1677ff;
}

.chat-input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.send-button {
  padding: 14px 28px;
  background: linear-gradient(135deg, #1677ff, #4ea4ff);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.send-button:hover:not(:disabled) {
  opacity: 0.9;
}

.send-button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.chat-tips {
  margin-top: 10px;
  font-size: 12px;
  color: #64748b;
}
</style>
