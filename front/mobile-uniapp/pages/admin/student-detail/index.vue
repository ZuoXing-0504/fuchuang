<template>
  <view class="page-wrap">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">加载中</view>
      <view class="helper-text">正在读取单学生详情...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">单学生详情加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else-if="detail">
      <view class="hero-card">
        <view class="card-title">{{ detail.name || detail.studentId }}</view>
        <view class="helper-copy">{{ detail.studentId }} · {{ detail.college }} · {{ detail.major }}</view>
        <view class="chip-row">
          <view class="chip">{{ detail.riskLevel }}</view>
          <view class="chip">{{ detail.profileCategory }}</view>
          <view class="chip" v-if="detail.profileSubtype">{{ detail.profileSubtype }}</view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">综合摘要</view>
        <view class="summary-copy">{{ detail.reportSummary }}</view>
        <view class="chip-row" v-if="secondaryTags.length">
          <view v-for="item in secondaryTags" :key="item" class="tag-chip">{{ item }}</view>
        </view>
      </view>

      <view class="metric-grid">
        <view class="metric-card">
          <view class="metric-label">表现档次</view>
          <view class="metric-value">{{ detail.performanceLevel }}</view>
        </view>
        <view class="metric-card">
          <view class="metric-label">健康档次</view>
          <view class="metric-value">{{ detail.healthLevel }}</view>
        </view>
        <view class="metric-card">
          <view class="metric-label">账号状态</view>
          <view class="metric-value">{{ detail.registrationStatus }}</view>
        </view>
        <view class="metric-card">
          <view class="metric-label">预测得分</view>
          <view class="metric-value">{{ detail.scorePrediction.toFixed(1) }}</view>
        </view>
      </view>

      <view class="panel-card" v-if="topFactors.length">
        <view class="card-title">风险解释</view>
        <view v-for="(item, index) in topFactors" :key="item.feature" class="factor-card">
          <view class="factor-index">{{ index + 1 }}</view>
          <view class="factor-body">
            <view class="factor-title">{{ item.feature }}</view>
            <view class="muted">{{ item.description }}</view>
          </view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">关键明细</view>
        <view v-for="item in previewDetails" :key="item.label" class="detail-card">
          <view>
            <view class="detail-label">{{ item.label }}</view>
            <view class="muted">{{ item.note }}</view>
          </view>
          <view class="detail-value">{{ item.value }}</view>
        </view>
      </view>

      <button class="primary-btn" @click="openReport">查看完整报告</button>
    </template>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { getStudentDetail } from '../../../api/admin';
import { ensureRole } from '../../../common/session';

const loading = ref(true);
const error = ref('');
const studentId = ref('');
const detail = ref(null);

const secondaryTags = computed(() => {
  const current = detail.value || {};
  return current.secondaryTags || [];
});

const topFactors = computed(() => {
  const current = detail.value || {};
  return (current.factors || []).slice(0, 4);
});

const previewDetails = computed(() => {
  if (!detail.value) {
    return [];
  }
  return [...(detail.value.behaviorDetails || []).slice(0, 3), ...(detail.value.academicDetails || []).slice(0, 3)];
});

onLoad((query) => {
  studentId.value = query.studentId || '';
});

onShow(() => {
  if (!ensureRole('admin')) {
    return;
  }
  loadData();
});

async function loadData() {
  if (!studentId.value) {
    error.value = '缺少 studentId 参数';
    loading.value = false;
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    detail.value = await getStudentDetail(studentId.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '单学生详情加载失败';
  } finally {
    loading.value = false;
  }
}

function openReport() {
  uni.navigateTo({ url: '/pages/admin/student-report/index?studentId=' + studentId.value });
}
</script>

<style scoped>
.helper-copy,
.summary-copy {
  font-size: 26rpx;
  line-height: 1.8;
}

.helper-copy {
  color: rgba(255, 255, 255, 0.92);
}

.summary-copy {
  color: #223127;
}

.factor-card {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 18rpx;
  border-radius: 20rpx;
  background: #f8faf6;
  margin-top: 16rpx;
}

.factor-index {
  width: 44rpx;
  height: 44rpx;
  border-radius: 14rpx;
  background: #2563eb;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 800;
  flex-shrink: 0;
}

.factor-body {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.factor-title,
.detail-label {
  font-size: 26rpx;
  font-weight: 800;
  color: #1a2e1f;
}

.detail-card {
  padding: 18rpx;
  border-radius: 20rpx;
  background: #f8faf6;
  margin-top: 16rpx;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.detail-value {
  font-size: 26rpx;
  font-weight: 800;
  color: #2d7a4f;
}
</style>
