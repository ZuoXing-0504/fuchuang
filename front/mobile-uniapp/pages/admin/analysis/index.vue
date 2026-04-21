<template>
  <view class="page-wrap admin-page">
    <view class="hero-card analysis-hero">
      <view class="hero-orb"></view>
      <view class="hero-eyebrow">知行雷达分析成果</view>
      <view class="card-title">全样本图表中心</view>
      <view class="hero-copy">
        这里汇总系统针对全体学生样本形成的分析图表。点击任意图卡，都可以继续查看横轴、纵轴、图表用途和解读方式。
      </view>
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
        <view
          v-for="chart in data.charts"
          :key="chart.id || chart.title"
          class="panel-card chart-card"
          @click="openChart(chart)"
        >
          <image :src="chartUrl(chart.url)" mode="aspectFit" class="chart-image" />
          <view class="chart-body">
            <view class="chart-title">{{ chart.title }}</view>
            <view class="muted chart-copy">{{ chart.description || chart.category }}</view>
            <view class="chart-insight">{{ chart.insight }}</view>
          </view>
        </view>
      </view>
    </template>

    <view v-if="activeChart" class="drawer-mask" @click="closeChart">
      <view class="drawer-panel" @click.stop>
        <view class="drawer-head">
          <view>
            <view class="drawer-title">{{ activeChart.title }}</view>
            <view class="muted">点击空白区域可关闭</view>
          </view>
        </view>

        <image :src="chartUrl(activeChart.url)" mode="aspectFit" class="drawer-image" />

        <view class="panel-card drawer-info">
          <view class="detail-block">
            <view class="sub-title">横轴</view>
            <view class="section-copy">{{ chartDetail.xAxis }}</view>
          </view>
          <view class="detail-block">
            <view class="sub-title">纵轴</view>
            <view class="section-copy">{{ chartDetail.yAxis }}</view>
          </view>
          <view class="detail-block">
            <view class="sub-title">图表用途</view>
            <view class="section-copy">{{ chartDetail.use }}</view>
          </view>
          <view class="detail-block">
            <view class="sub-title">适用场景</view>
            <view class="section-copy">{{ chartDetail.scene }}</view>
          </view>
          <view class="detail-block">
            <view class="sub-title">解读方式</view>
            <view class="section-copy">{{ chartDetail.guide }}</view>
          </view>
          <view class="detail-block">
            <view class="sub-title">系统结论</view>
            <view class="section-copy">{{ activeChart.insight }}</view>
          </view>
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

.analysis-hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 86% 18%, rgba(199, 236, 255, 0.82), transparent 22%),
    linear-gradient(180deg, rgba(135, 198, 255, 0.78) 0%, rgba(213, 239, 255, 0.72) 52%, rgba(246, 251, 255, 0.84) 100%);
  color: #13233b;
}

.hero-orb {
  position: absolute;
  right: -18rpx;
  top: -42rpx;
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.76), rgba(122, 210, 255, 0.16) 62%, transparent 72%);
}

.hero-eyebrow {
  position: relative;
  z-index: 1;
  font-size: 22rpx;
  font-weight: 700;
  color: #4b6b92;
  margin-bottom: 8rpx;
}

.hero-copy {
  position: relative;
  z-index: 1;
  font-size: 24rpx;
  line-height: 1.8;
  color: #4f6784;
}

.section-copy {
  font-size: 24rpx;
  line-height: 1.8;
  color: #334155;
}

.chart-grid {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.chart-card {
  padding: 0;
  overflow: hidden;
}

.chart-image {
  width: 100%;
  height: 320rpx;
  background: #f8fbff;
}

.chart-body {
  padding: 22rpx;
}

.chart-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #13223a;
}

.chart-copy {
  margin-top: 10rpx;
}

.chart-insight {
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: #0f6dff;
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

.drawer-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16rpx;
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

.detail-block + .detail-block {
  margin-top: 18rpx;
  padding-top: 18rpx;
  border-top: 1rpx solid rgba(223, 232, 244, 0.92);
}
</style>
