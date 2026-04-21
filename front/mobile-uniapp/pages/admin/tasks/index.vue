<template>
  <view class="page-wrap admin-page">
    <view class="hero-card tasks-hero">
      <view class="hero-caption">知行雷达管理端</view>
      <view class="hero-title">干预工作台</view>
      <view class="hero-desc">这里可以查看批量任务历史，也可以手动触发一次批量预测。</view>
    </view>

    <view class="panel-card">
      <view class="card-title">批量预测</view>
      <view class="helper-text">输入待预测文件名后，系统会创建一条批量任务记录。</view>
      <input v-model="fileName" class="field-input top-gap" placeholder="请输入待预测文件名，例如 sample.csv" />
      <view class="action-row top-gap">
        <button class="primary-btn flex-btn" :disabled="submitting" @click="createTask">
          {{ submitting ? '提交中...' : '发起批量预测' }}
        </button>
        <button class="secondary-btn flex-btn" @click="loadData">刷新历史</button>
      </view>
    </view>

    <view v-if="message" class="status-card loading">
      <view class="status-title">操作反馈</view>
      <view class="helper-text">{{ message }}</view>
    </view>

    <view v-if="error" class="status-card error">
      <view class="status-title">加载失败</view>
      <view class="helper-text">{{ error }}</view>
    </view>

    <view class="panel-card">
      <view class="card-title">任务历史</view>
      <view v-if="loading" class="helper-text">正在加载任务记录...</view>
      <view v-else-if="!tasks.length" class="empty-text">当前还没有任务记录。</view>
      <view v-for="item in tasks" :key="item.taskId" class="task-card">
        <view class="row-head">
          <view class="row-title">{{ item.filename }}</view>
          <view class="row-score">{{ item.status }}</view>
        </view>
        <view class="muted">任务号 {{ item.taskId }}</view>
        <view class="muted">创建时间 {{ item.createdAt || '未提供' }}</view>
        <view class="muted">记录数 {{ item.records }}</view>
      </view>
    </view>

    <view class="page-bottom-space"></view>
    <AdminBottomNav current="" />
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getTaskHistory, submitBatchPredict } from '../../../api/admin';
import { ensureRole } from '../../../common/session';
import AdminBottomNav from '../../../components/AdminBottomNav.vue';

const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const message = ref('');
const fileName = ref('sample.csv');
const tasks = ref([]);

onShow(() => {
  if (!ensureRole('admin')) return;
  loadData();
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    tasks.value = await getTaskHistory();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '任务历史加载失败';
  } finally {
    loading.value = false;
  }
}

async function createTask() {
  if (!fileName.value.trim()) {
    message.value = '请先输入文件名。';
    return;
  }
  submitting.value = true;
  message.value = '';
  try {
    const task = await submitBatchPredict(fileName.value.trim());
    message.value = `任务已提交：${task.filename}，当前状态 ${task.status}`;
    await loadData();
  } catch (err) {
    message.value = err instanceof Error ? err.message : '批量预测提交失败';
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.admin-page {
  padding-bottom: 0;
}

.tasks-hero {
  background:
    radial-gradient(circle at 86% 18%, rgba(197, 240, 255, 0.68), transparent 18%),
    linear-gradient(180deg, rgba(146, 214, 255, 0.76) 0%, rgba(219, 241, 255, 0.74) 50%, rgba(248, 252, 255, 0.82) 100%);
  color: #13233b;
}

.hero-caption {
  font-size: 22rpx;
  font-weight: 700;
  color: #4a6b91;
  margin-bottom: 8rpx;
}

.hero-title {
  font-size: 40rpx;
  font-weight: 800;
  color: #13233b;
}

.hero-desc {
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: #526b88;
}

.top-gap {
  margin-top: 16rpx;
}

.action-row {
  display: flex;
  gap: 16rpx;
}

.flex-btn {
  flex: 1;
}

.task-card {
  padding: 20rpx 0;
  border-bottom: 1rpx solid rgba(223, 232, 244, 0.92);
}

.task-card:last-child {
  border-bottom: none;
}

.row-head {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.row-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #0f172a;
}

.row-score {
  font-size: 24rpx;
  font-weight: 800;
  color: #1677ff;
}
</style>
