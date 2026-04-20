<template>
  <view class="page-wrap admin-page">
    <view class="hero-card">
      <view class="hero-eyebrow">分析成果</view>
      <view class="card-title">全样本图表</view>
      <view class="hero-copy">这里展示系统对全样本形成的图表分析结果。点击任意一张图都可以查看横轴、纵轴、图表用途和解读方式。</view>
    </view>

    <view v-if="loading" class="status-card loading">
      <view class="status-title">正在加载</view>
      <view class="helper-text">正在同步分析成果图表...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else-if="data">
      <view v-if="data.summaryCards.length" class="metric-grid">
        <view v-for="item in data.summaryCards" :key="item.label" class="metric-card">
          <view class="metric-label">{{ item.label }}</view>
          <view class="metric-value">{{ item.value }}</view>
        </view>
      </view>

      <view v-if="data.storyline.length" class="panel-card">
        <view class="card-title">系统解读路径</view>
        <view v-for="(item, index) in data.storyline" :key="`${index}-${item}`" class="list-card">
          <view class="section-copy">{{ index + 1 }}. {{ item }}</view>
        </view>
      </view>

      <view v-if="data.chartStatus.installHint" class="panel-card">
        <view class="card-title">图表提示</view>
        <view class="section-copy">{{ data.chartStatus.installHint }}</view>
      </view>

      <view class="chart-grid">
        <view v-for="chart in data.charts" :key="chart.id || chart.title" class="panel-card chart-card" @click="openChart(chart)">
          <image :src="chartUrl(chart.url)" mode="aspectFit" class="chart-image" />
          <view class="chart-title">{{ chart.title }}</view>
          <view class="muted chart-copy">{{ chart.description || chart.category }}</view>
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
          <view class="sub-title top-gap">如何解读</view>
          <view class="section-copy">{{ chartDetail.guide }}</view>
          <view class="sub-title top-gap">系统结论</view>
          <view class="section-copy">{{ activeChart.insight }}</view>
        </view>
        <button class="primary-btn" @click="closeChart">关闭</button>
      </view>
    </view>

    <view class="page-bottom-space"></view>
    <AdminBottomNav current="" />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getAnalysisResults } from '../../../api/admin';
import { chartUrl, getChartDetail } from '../../../common/chart-details';
import { ensureRole } from '../../../common/session';
import AdminBottomNav from '../../../components/AdminBottomNav.vue';

const loading = ref(true);
const error = ref('');
const data = ref(null);
const activeChart = ref(null);

const chartDetail = computed(() => getChartDetail(activeChart.value));

onShow(() => {
  if (!ensureRole('admin')) return;
  loadData();
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    data.value = await getAnalysisResults();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '分析成果加载失败';
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
.admin-page {
  padding-bottom: 0;
}

.hero-eyebrow {
  font-size: 22rpx;
  font-weight: 700;
  opacity: 0.9;
  margin-bottom: 8rpx;
}

.hero-copy,
.section-copy {
  font-size: 24rpx;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.92);
}

.section-copy {
  color: #334155;
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
.chart-insight,
.chart-copy {
  padding: 0 22rpx;
}

.chart-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #0f172a;
  margin-top: 18rpx;
}

.chart-copy {
  margin-top: 10rpx;
}

.chart-insight {
  font-size: 24rpx;
  line-height: 1.8;
  color: #1677ff;
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
  background: linear-gradient(180deg, #f5f8fc 0%, #eef4fb 100%);
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
  color: #0f172a;
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
