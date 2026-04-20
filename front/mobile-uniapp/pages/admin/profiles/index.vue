<template>
  <view class="page-wrap admin-page">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">正在加载</view>
      <view class="helper-text">正在同步院系对比与群体画像信息...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else>
      <view v-for="group in groups" :key="group.title" class="panel-card">
        <view class="card-title">{{ group.title }}</view>
        <view class="helper-text">{{ group.description }}</view>
        <view v-if="group.averages.length" class="metric-grid top-gap">
          <view v-for="item in group.averages" :key="item.name" class="metric-card">
            <view class="metric-label">{{ item.name }}</view>
            <view class="metric-value">{{ item.value }}</view>
          </view>
        </view>
        <view v-if="group.radar.length" class="top-gap">
          <view v-for="item in group.radar" :key="item.indicator" class="detail-row">
            <text class="detail-label">{{ item.indicator }}</text>
            <text class="detail-value">{{ item.value }}</text>
          </view>
        </view>
        <view v-if="group.students.length" class="top-gap">
          <view class="sub-title">代表学生</view>
          <view v-for="student in group.students.slice(0, 5)" :key="student.studentId" class="warning-card" @click="openDetail(student.studentId)">
            <view class="row-title">{{ student.studentId }}</view>
            <view class="muted">{{ student.college }} · {{ student.major }}</view>
          </view>
        </view>
      </view>
    </template>

    <view class="page-bottom-space"></view>
    <AdminBottomNav current="profiles" />
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getClusterInsights } from '../../../api/admin';
import { ensureRole } from '../../../common/session';
import AdminBottomNav from '../../../components/AdminBottomNav.vue';

const loading = ref(true);
const error = ref('');
const groups = ref([]);

onShow(() => {
  if (!ensureRole('admin')) return;
  loadData();
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    groups.value = await getClusterInsights();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '院系对比加载失败';
  } finally {
    loading.value = false;
  }
}

function openDetail(studentId) {
  uni.navigateTo({ url: `/pages/admin/student-detail/index?studentId=${encodeURIComponent(studentId)}` });
}
</script>

<style scoped>
.admin-page {
  padding-bottom: 0;
}

.top-gap {
  margin-top: 16rpx;
}

.sub-title,
.row-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #0f172a;
}

.warning-card {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #e8eef7;
}

.warning-card:last-child {
  border-bottom: none;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #e8eef7;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 24rpx;
  color: #64748b;
}

.detail-value {
  font-size: 26rpx;
  font-weight: 700;
  color: #0f172a;
}
</style>
