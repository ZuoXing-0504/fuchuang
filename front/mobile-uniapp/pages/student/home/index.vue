<template>
  <view class="page-wrap">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">加载中</view>
      <view class="helper-text">正在读取学生首页数据...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">首页加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else-if="data">
      <view class="hero-card">
        <view class="hero-eyebrow">首页</view>
        <view class="card-title">{{ data.studentName || data.studentId || '当前学生' }}</view>
        <view class="helper-copy">这里集中展示你当前的画像状态、重点判断和后续入口，帮助你先看清整体，再进入更具体的页面。</view>
        <view class="chip-row">
          <view class="chip">{{ data.profileCategory }}</view>
          <view class="chip">{{ data.riskLevel }}</view>
          <view class="chip">{{ data.performanceLevel }}</view>
        </view>
      </view>

      <view class="metric-grid">
        <view v-for="item in summaryCards" :key="item.label" class="metric-card">
          <view class="metric-label">{{ item.label }}</view>
          <view class="metric-value">{{ item.value }}</view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">当前判断</view>
        <view v-for="(item, index) in data.insights" :key="'insight-' + index" class="list-card">
          <view class="insight-item">
            <view class="insight-index">{{ index + 1 }}</view>
            <view class="insight-copy">{{ item }}</view>
          </view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">常用入口</view>
        <view v-for="item in quickLinks" :key="item.path" class="quick-card" @click="go(item.path)">
          <view>
            <view class="quick-title">{{ item.title }}</view>
            <view class="muted">{{ item.description }}</view>
          </view>
          <view class="quick-action">{{ item.action }}</view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">全样本分析预览</view>
        <view v-if="!data.chartStatus.ready" class="status-card empty chart-tip">
          <view class="status-title">图表暂未就绪</view>
          <view class="helper-text">{{ data.chartStatus.message || '分析图表暂未准备完成。' }}</view>
        </view>
        <view v-else class="chart-list">
          <view v-for="chart in previewCharts" :key="chart.title" class="chart-card">
            <image class="chart-image" :src="chartUrl(chart.url)" mode="aspectFill"></image>
            <view class="chart-title">{{ chart.title }}</view>
            <view class="muted">{{ chart.insight || chart.description }}</view>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getApiBase } from '../../../common/config';
import { ensureRole } from '../../../common/session';
import { getStudentHome } from '../../../api/student';

const loading = ref(true);
const error = ref('');
const data = ref(null);

const quickLinks = [
  { path: '/pages/student/profile/index', title: '我的画像', description: '查看当前画像、细分标签和多维表现', action: '进入画像' },
  { path: '/pages/student/trend/index', title: '趋势与群体对比', description: '看看自己和所属群体、全样本之间的差异', action: '查看趋势' },
  { path: '/pages/student/report/index', title: '个性化报告', description: '集中查看判断依据、解释结论和后续建议', action: '查看报告' },
  { path: '/pages/student/mine/index', title: '我的账号', description: '查看登录账号、推荐摘要和退出入口', action: '查看我的' }
];

const summaryCards = computed(() => {
  const current = data.value || {};
  return (current.trendSummary || []).slice(0, 4);
});

const previewCharts = computed(() => {
  const current = data.value || {};
  return (current.analysisCharts || []).slice(0, 2);
});

onShow(() => {
  if (!ensureRole('student')) {
    return;
  }
  loadData();
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    data.value = await getStudentHome();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '学生首页加载失败';
  } finally {
    loading.value = false;
  }
}

function go(path) {
  uni.navigateTo({ url: path });
}

function chartUrl(path) {
  if (!path) {
    return '';
  }
  return path.startsWith('http') ? path : getApiBase() + path;
}
</script>

<style scoped>
.hero-eyebrow,
.helper-copy,
.quick-action {
  font-size: 22rpx;
}

.helper-copy {
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.insight-index {
  width: 44rpx;
  height: 44rpx;
  border-radius: 14rpx;
  background: rgba(59, 122, 87, 0.12);
  color: #2d7a4f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 800;
  flex-shrink: 0;
}

.insight-copy {
  font-size: 26rpx;
  color: #223127;
  line-height: 1.8;
}

.quick-card {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eef1eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.quick-card:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.quick-title,
.chart-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #1a2e1f;
  margin-bottom: 8rpx;
}

.quick-action {
  color: #2d7a4f;
  font-weight: 700;
  flex-shrink: 0;
}

.chart-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.chart-card {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.chart-image {
  width: 100%;
  height: 280rpx;
  border-radius: 20rpx;
  background: #e5e7eb;
}

.chart-tip {
  padding: 20rpx;
}
</style>
