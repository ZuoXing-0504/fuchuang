<template>
  <view class="page-wrap">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">加载中</view>
      <view class="helper-text">正在读取风险名单...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">风险名单加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else>
      <view class="panel-card">
        <view class="card-title">风险名单</view>
        <view class="helper-text">点击学生进入单学生详情，长按或按钮进入完整报告。</view>
        <view v-for="item in rows" :key="item.studentId" class="warning-card">
          <view class="warning-main" @click="openDetail(item.studentId)">
            <view class="warning-name">{{ item.name || item.studentId }}</view>
            <view class="muted">{{ item.studentId }} · {{ item.college }} · {{ item.major }}</view>
            <view class="chip-row compact">
              <view class="tag-chip">{{ item.riskLevel }}</view>
              <view class="tag-chip">{{ item.profileCategory }}</view>
              <view class="tag-chip">{{ item.registrationStatus }}</view>
            </view>
          </view>
          <view class="warning-actions">
            <view class="action-link" @click="openDetail(item.studentId)">单学生详情</view>
            <view class="action-link secondary" @click="openReport(item.studentId)">完整报告</view>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getWarnings } from '../../../api/admin';
import { ensureRole } from '../../../common/session';

const loading = ref(true);
const error = ref('');
const rows = ref([]);

onShow(() => {
  if (!ensureRole('admin')) {
    return;
  }
  loadData();
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const result = await getWarnings({ page: 1, pageSize: 50 });
    rows.value = result.list || [];
  } catch (err) {
    error.value = err instanceof Error ? err.message : '风险名单加载失败';
  } finally {
    loading.value = false;
  }
}

function openDetail(studentId) {
  uni.navigateTo({ url: `/pages/admin/student-detail/index?studentId=${studentId}` });
}

function openReport(studentId) {
  uni.navigateTo({ url: `/pages/admin/student-report/index?studentId=${studentId}` });
}
</script>

<style scoped>
.warning-card {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #eef1eb;
}

.warning-card:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.warning-main {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.warning-name {
  font-size: 28rpx;
  font-weight: 800;
  color: #1a2e1f;
}

.chip-row.compact {
  gap: 8rpx;
}

.warning-actions {
  display: flex;
  gap: 18rpx;
  margin-top: 16rpx;
}

.action-link {
  font-size: 24rpx;
  font-weight: 700;
  color: #2d7a4f;
}

.action-link.secondary {
  color: #2563eb;
}
</style>
