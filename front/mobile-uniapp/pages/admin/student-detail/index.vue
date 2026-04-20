<template>
  <view class="page-wrap">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">正在加载</view>
      <view class="helper-text">正在同步单学生详情...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else-if="detail">
      <view class="hero-card">
        <view class="card-title">{{ detail.name || detail.studentId }}</view>
        <view class="hero-copy">{{ detail.studentId }} · {{ detail.college }} · {{ detail.major }}</view>
        <view class="chip-row">
          <view class="chip">{{ detail.riskLevel }}</view>
          <view class="chip">{{ detail.profileCategory }}</view>
          <view v-if="detail.profileSubtype" class="chip">{{ detail.profileSubtype }}</view>
        </view>
      </view>

      <view class="metric-grid">
        <view class="metric-card">
          <view class="metric-label">学业表现</view>
          <view class="metric-value">{{ detail.performanceLevel }}</view>
        </view>
        <view class="metric-card">
          <view class="metric-label">健康状态</view>
          <view class="metric-value">{{ detail.healthLevel }}</view>
        </view>
        <view class="metric-card">
          <view class="metric-label">账号状态</view>
          <view class="metric-value small">{{ detail.registrationStatus }}</view>
        </view>
        <view class="metric-card">
          <view class="metric-label">预测成绩</view>
          <view class="metric-value">{{ detail.scorePrediction.toFixed(1) }}</view>
        </view>
      </view>

      <view v-if="detail.profileExplanation || detail.profileHighlights.length" class="panel-card">
        <view class="card-title">画像说明</view>
        <view v-if="detail.profileExplanation" class="section-copy">{{ detail.profileExplanation }}</view>
        <view v-if="detail.profileHighlights.length" class="chip-row top-gap">
          <view v-for="item in detail.profileHighlights" :key="item" class="tag-chip">{{ item }}</view>
        </view>
      </view>

      <view v-if="detail.factors.length" class="panel-card">
        <view class="card-title">关键影响因素</view>
        <view v-for="item in detail.factors" :key="item.feature" class="detail-row">
          <text class="detail-label">{{ item.feature }}</text>
          <text class="detail-value">{{ item.impact.toFixed(2) }}</text>
        </view>
      </view>

      <view v-if="previewDetails.length" class="panel-card">
        <view class="card-title">行为与学业摘要</view>
        <view v-for="item in previewDetails" :key="item.label" class="detail-row">
          <text class="detail-label">{{ item.label }}</text>
          <text class="detail-value">{{ item.value }}</text>
        </view>
      </view>

      <view v-if="detail.featureTables.length" class="panel-card">
        <view class="card-title">特征总表</view>
        <view v-for="table in detail.featureTables" :key="table.title" class="feature-table">
          <view class="sub-title">{{ table.title }}</view>
          <view v-if="table.description" class="muted">{{ table.description }}</view>
          <view v-for="row in table.rows.slice(0, 8)" :key="`${table.title}-${row.label}`" class="detail-row">
            <text class="detail-label">{{ row.label }}</text>
            <text class="detail-value">{{ row.value }}<text v-if="row.unit">{{ row.unit }}</text></text>
          </view>
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

const previewDetails = computed(() => {
  if (!detail.value) return [];
  return [...(detail.value.behaviorDetails || []).slice(0, 4), ...(detail.value.academicDetails || []).slice(0, 4)];
});

onLoad((query) => {
  studentId.value = query.studentId || '';
});

onShow(() => {
  if (!ensureRole('admin')) return;
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
    error.value = err instanceof Error ? err.message : '学生详情加载失败';
  } finally {
    loading.value = false;
  }
}

function openReport() {
  uni.navigateTo({ url: `/pages/admin/student-report/index?studentId=${encodeURIComponent(studentId.value)}` });
}
</script>

<style scoped>
.hero-copy,
.section-copy {
  font-size: 24rpx;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.92);
}

.section-copy {
  color: #223127;
}

.metric-value.small {
  font-size: 28rpx;
}

.top-gap {
  margin-top: 14rpx;
}

.sub-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #1a2e1f;
  margin-bottom: 10rpx;
}

.feature-table + .feature-table {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #eef1eb;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #eef1eb;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 24rpx;
  color: #68756d;
}

.detail-value {
  font-size: 26rpx;
  font-weight: 700;
  color: #223127;
  text-align: right;
}
</style>
