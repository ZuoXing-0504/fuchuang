<template>
  <view class="page-wrap">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">加载中</view>
      <view class="helper-text">正在读取管理员概览...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">管理首页加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else-if="data">
      <view class="hero-card">
        <view class="hero-eyebrow">Management Portal</view>
        <view class="card-title">学生行为分析后台</view>
        <view class="helper-copy">移动端保留管理员最常用的链路：概览 -> 风险名单 -> 单学生详情 -> 完整报告。</view>
      </view>

      <view class="metric-grid">
        <view v-for="item in data.kpis" :key="item.label" class="metric-card">
          <view class="metric-label">{{ item.label }}</view>
          <view class="metric-value">{{ item.value }}</view>
          <view class="muted">{{ item.delta }}</view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">数据质量摘要</view>
        <view class="summary-grid">
          <view class="metric-card">
            <view class="metric-label">字段数</view>
            <view class="metric-value">{{ data.dataQualitySummary.fieldCount || 0 }}</view>
          </view>
          <view class="metric-card">
            <view class="metric-label">长尾字段</view>
            <view class="metric-value">{{ data.dataQualitySummary.longTailFields || 0 }}</view>
          </view>
          <view class="metric-card">
            <view class="metric-label">零膨胀字段</view>
            <view class="metric-value">{{ data.dataQualitySummary.zeroInflatedFields || 0 }}</view>
          </view>
          <view class="metric-card">
            <view class="metric-label">高缺失字段</view>
            <view class="metric-value">{{ data.dataQualitySummary.missingHeavyFields || 0 }}</view>
          </view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">重点风险学生</view>
        <view v-for="item in data.topRisks.slice(0, 5)" :key="item.studentId" class="student-card" @click="openDetail(item.studentId)">
          <view>
            <view class="student-name">{{ item.name || item.studentId }}</view>
            <view class="muted">{{ item.studentId }} · {{ item.college }}</view>
            <view class="chip-row compact">
              <view class="tag-chip">{{ item.riskLevel }}</view>
              <view class="tag-chip">{{ item.profileCategory }}</view>
            </view>
          </view>
          <view class="student-score">{{ item.scorePrediction.toFixed(1) }}</view>
        </view>
        <button class="primary-btn top-space" @click="goWarnings">查看完整风险名单</button>
      </view>

      <button class="secondary-btn" @click="handleLogout">退出登录</button>
    </template>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getDashboardOverview } from '../../../api/admin';
import { logout } from '../../../api/auth';
import { ensureRole } from '../../../common/session';

const loading = ref(true);
const error = ref('');
const data = ref(null);

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
    data.value = await getDashboardOverview();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '管理员首页加载失败';
  } finally {
    loading.value = false;
  }
}

function openDetail(studentId) {
  uni.navigateTo({ url: `/pages/admin/student-detail/index?studentId=${studentId}` });
}

function goWarnings() {
  uni.navigateTo({ url: '/pages/admin/warnings/index' });
}

function handleLogout() {
  logout();
}
</script>

<style scoped>
.hero-eyebrow,
.helper-copy {
  font-size: 22rpx;
}

.helper-copy {
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.92);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.student-card {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eef1eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.student-card:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.student-name {
  font-size: 28rpx;
  font-weight: 800;
  color: #1a2e1f;
  margin-bottom: 8rpx;
}

.chip-row.compact {
  gap: 8rpx;
  margin-top: 10rpx;
}

.student-score {
  font-size: 30rpx;
  font-weight: 900;
  color: #2d7a4f;
  flex-shrink: 0;
}

.top-space {
  margin-top: 20rpx;
}
</style>
