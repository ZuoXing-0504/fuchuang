<template>
  <view class="page-wrap">
    <view class="hero-card">
      <view class="hero-eyebrow">知行雷达智能助手</view>
      <view class="card-title">智能助手</view>
      <view class="hero-copy">你可以直接询问画像、风险、报告、学习建议和系统功能。助手会结合你当前账号的学生画像做回答。</view>
    </view>

    <view class="panel-card">
      <view class="card-title">快捷提问</view>
      <view class="chip-row top-gap">
        <view
          v-for="item in quickPrompts"
          :key="item"
          class="tag-chip"
          @click="fillPrompt(item)"
        >
          {{ item }}
        </view>
      </view>
    </view>

    <view class="panel-card chat-panel">
      <view class="card-title">对话记录</view>
      <view v-if="messages.length === 0" class="empty-text top-gap">还没有消息，试着从上面的快捷问题开始。</view>

      <view v-for="(item, index) in messages" :key="`${item.role}-${index}`" class="message-wrap" :class="item.role">
        <view class="message-avatar">{{ item.role === 'user' ? '我' : 'AI' }}</view>
        <view class="message-bubble">
          <view class="message-text">{{ item.content }}</view>
        </view>
      </view>

      <view v-if="loading" class="message-wrap assistant">
        <view class="message-avatar">AI</view>
        <view class="message-bubble loading-bubble">
          <view class="message-text">正在思考，请稍候...</view>
        </view>
      </view>
    </view>

    <view class="panel-card">
      <view class="card-title">发送消息</view>
      <textarea
        v-model="draft"
        class="chat-input"
        placeholder="可以问：根据我的画像给我建议，或者解释一下我的风险等级。"
        maxlength="1000"
      />
      <view class="action-row top-gap">
        <button class="secondary-btn flex-btn" @click="clearHistory">清空记录</button>
        <button class="primary-btn flex-btn" :disabled="loading || !draft.trim()" @click="sendMessage">发送</button>
      </view>
      <view v-if="error" class="status-card error top-gap">
        <view class="status-title">发送失败</view>
        <view class="helper-text">{{ error }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { ensureRole } from '../../../common/session';
import { sendStudentChatMessage } from '../../../api/student';

const draft = ref('');
const loading = ref(false);
const error = ref('');
const messages = ref([
  {
    role: 'assistant',
    content: '你好，我是知行雷达智能助手。你可以问我学生画像、风险解释、学习建议、系统功能等问题。'
  }
]);

const quickPrompts = [
  '根据我的学生画像给我建议',
  '解释一下我的风险等级',
  '我现在最需要提升什么',
  '我们系统有哪些功能'
];

onShow(() => {
  ensureRole('student');
});

function fillPrompt(text) {
  draft.value = text;
}

function clearHistory() {
  messages.value = [
    {
      role: 'assistant',
      content: '对话记录已清空。你可以继续问我画像、报告或学习建议相关问题。'
    }
  ];
  draft.value = '';
  error.value = '';
}

async function sendMessage() {
  const content = draft.value.trim();
  if (!content || loading.value) return;

  const history = messages.value.map((item) => ({
    role: item.role,
    content: item.content
  }));

  messages.value.push({ role: 'user', content });
  draft.value = '';
  loading.value = true;
  error.value = '';

  try {
    const result = await sendStudentChatMessage(content, history);
    messages.value.push({
      role: 'assistant',
      content: result.response || '当前没有拿到有效回复，请稍后重试。'
    });
  } catch (err) {
    error.value = err instanceof Error ? err.message : '智能助手暂时不可用';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.hero-eyebrow {
  font-size: 22rpx;
  font-weight: 700;
  opacity: 0.9;
  margin-bottom: 8rpx;
}

.hero-copy {
  font-size: 24rpx;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.92);
}

.top-gap {
  margin-top: 16rpx;
}

.chat-panel {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.message-wrap {
  display: flex;
  gap: 16rpx;
  align-items: flex-start;
}

.message-wrap.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  flex-shrink: 0;
}

.message-wrap.assistant .message-avatar {
  background: linear-gradient(135deg, #22c55e, #38bdf8);
}

.message-bubble {
  max-width: 78%;
  padding: 22rpx 24rpx;
  border-radius: 24rpx;
  background: #f8fbff;
  border: 2rpx solid rgba(148, 163, 184, 0.12);
}

.message-wrap.user .message-bubble {
  background: linear-gradient(135deg, #1677ff, #5aa9ff);
  color: #ffffff;
}

.loading-bubble {
  background: #eef6ff;
}

.message-text {
  font-size: 26rpx;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.chat-input {
  width: 100%;
  min-height: 220rpx;
  padding: 24rpx;
  border-radius: 22rpx;
  background: #f8fbff;
  border: 2rpx solid rgba(148, 163, 184, 0.12);
  font-size: 26rpx;
  line-height: 1.7;
  box-sizing: border-box;
}

.action-row {
  display: flex;
  gap: 16rpx;
}

.flex-btn {
  flex: 1;
}
</style>
