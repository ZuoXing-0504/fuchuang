<template>
  <view class="page-wrap">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">正在加载</view>
      <view class="helper-text">正在同步全样本分析图表...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else-if="data">
      <view class="hero-card">
        <view class="card-title">全样本分析</view>
        <view class="hero-copy">这里展示的是系统对全体学生样本做出的图表分析结果，用于理解整体分布、群体差异和关键关联。</view>
      </view>

      <view class="metric-grid">
        <view class="metric-card">
          <view class="metric-label">分析图数量</view>
          <view class="metric-value">{{ data.analysisCharts.length }}</view>
        </view>
        <view class="metric-card">
          <view class="metric-label">已就绪图表</view>
          <view class="metric-value">{{ data.chartStatus.availableCount }}</view>
        </view>
        <view class="metric-card">
          <view class="metric-label">缺失图表</view>
          <view class="metric-value">{{ data.chartStatus.missingCount }}</view>
        </view>
        <view class="metric-card">
          <view class="metric-label">图表状态</view>
          <view class="metric-value small">{{ data.chartStatus.ready ? '已准备' : '待补齐' }}</view>
        </view>
      </view>

      <view v-if="data.chartStatus.installHint" class="panel-card">
        <view class="card-title">图表提示</view>
        <view class="section-copy">{{ data.chartStatus.installHint }}</view>
      </view>

      <view v-if="!data.chartStatus.ready" class="status-card empty">
        <view class="status-title">图表尚未全部就绪</view>
        <view class="helper-text">{{ data.chartStatus.message || '请先确认图表生成环境是否完整。' }}</view>
      </view>

      <view v-else class="chart-grid">
        <view v-for="chart in data.analysisCharts" :key="chart.title" class="panel-card chart-card" @click="openChart(chart)">
          <image :src="chartUrl(chart.url)" mode="aspectFit" class="chart-image" />
          <view class="chart-title">{{ chart.title }}</view>
          <view class="muted">{{ chart.description || chart.category }}</view>
          <view class="chart-insight">{{ chart.insight }}</view>
        </view>
      </view>
    </template>

    <view v-if="activeChart" class="drawer-mask" @click="closeChart">
      <view class="drawer-panel" @click.stop>
        <view class="drawer-title">{{ activeChart.title }}</view>
        <image :src="chartUrl(activeChart.url)" mode="aspectFit" class="drawer-image" />
        <view class="panel-card drawer-info">
          <view class="sub-title">横轴</view>
          <view class="section-copy">{{ chartDetail.xAxis }}</view>
          <view class="sub-title top-gap">纵轴</view>
          <view class="section-copy">{{ chartDetail.yAxis }}</view>
          <view class="sub-title top-gap">图表用途</view>
          <view class="section-copy">{{ chartDetail.use }}</view>
          <view class="sub-title top-gap">适用场景</view>
          <view class="section-copy">{{ chartDetail.scene }}</view>
          <view class="sub-title top-gap">怎么看这张图</view>
          <view class="section-copy">{{ chartDetail.guide }}</view>
          <view class="sub-title top-gap">系统结论</view>
          <view class="section-copy">{{ activeChart.insight }}</view>
        </view>
        <button class="primary-btn" @click="closeChart">关闭</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getStudentHome } from '../../../api/student';
import { chartUrl, getChartDetail } from '../../../common/chart-details';
import { ensureRole } from '../../../common/session';

const loading = ref(true);
const error = ref('');
const data = ref(null);
const activeChart = ref(null);

const chartDetail = computed(() => getChartDetail(activeChart.value));

onShow(() => {
  if (!ensureRole('student')) return;
  loadData();
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    data.value = await getStudentHome();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '全样本分析加载失败';
  } finally {
    loading.value = false;
  }
}

function openChart(chart) {
  activeChart.value = chart;
}

function closeChart() {
  activeChart.value = null;
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

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.chart-card {
  padding: 0;
  overflow: hidden;
}

.chart-image {
  width: 100%;
  height: 280rpx;
  background: #f8fafc;
}

.chart-title,
.chart-insight {
  padding: 0 22rpx;
}

.chart-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #1a2e1f;
  margin-top: 18rpx;
}

.chart-insight {
  font-size: 24rpx;
  line-height: 1.8;
  color: #2d7a4f;
  padding-bottom: 22rpx;
  margin-top: 10rpx;
}

.drawer-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.56);
  display: flex;
  align-items: flex-end;
  z-index: 99;
}

.drawer-panel {
  width: 100%;
  max-height: 88vh;
  background: #f5f6f1;
  border-radius: 32rpx 32rpx 0 0;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.drawer-title,
.sub-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #1a2e1f;
}

.drawer-image {
  width: 100%;
  height: 360rpx;
  background: #ffffff;
  border-radius: 24rpx;
}

.drawer-info {
  padding: 22rpx;
}

.top-gap {
  margin-top: 16rpx;
}
</style>
