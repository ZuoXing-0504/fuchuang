<template>
  <view class="page-wrap">
    <view class="hero-card analysis-hero">
      <view class="hero-orb"></view>
      <view class="hero-eyebrow">知行雷达全样本分析</view>
      <view class="card-title">分析图集</view>
      <view class="hero-copy">
        用更轻量的移动端方式查看全样本分析图。每张图都保留标题、结论与解读入口，适合快速浏览整体趋势。
      </view>
    </view>

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
      <view class="metric-grid">
        <view class="metric-card">
          <view class="metric-label">图表总数</view>
          <view class="metric-value">{{ data.analysisCharts.length }}</view>
        </view>
        <view class="metric-card">
          <view class="metric-label">可查看图表</view>
          <view class="metric-value">{{ data.chartStatus.availableCount }}</view>
        </view>
        <view class="metric-card">
          <view class="metric-label">缺失图表</view>
          <view class="metric-value">{{ data.chartStatus.missingCount }}</view>
        </view>
        <view class="metric-card">
          <view class="metric-label">图表状态</view>
          <view class="metric-value small">{{ data.chartStatus.ready ? '已就绪' : '待补齐' }}</view>
        </view>
      </view>

      <view v-if="data.chartStatus.installHint" class="panel-card">
        <view class="card-title">图表提示</view>
        <view class="section-copy">{{ data.chartStatus.installHint }}</view>
      </view>

      <view v-if="!data.chartStatus.ready" class="status-card empty">
        <view class="status-title">图表尚未全部就绪</view>
        <view class="helper-text">{{ data.chartStatus.message || '请先确认图表文件与后端导出链路是否完整。' }}</view>
      </view>

      <view v-else class="chart-grid">
        <view
          v-for="chart in data.analysisCharts"
          :key="chart.title"
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
.analysis-hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 88% 18%, rgba(194, 236, 255, 0.8), transparent 22%),
    linear-gradient(180deg, rgba(139, 202, 255, 0.78) 0%, rgba(213, 240, 255, 0.72) 54%, rgba(247, 251, 255, 0.84) 100%);
  color: #14233b;
}

.hero-orb {
  position: absolute;
  right: -24rpx;
  top: -40rpx;
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.76), rgba(137, 211, 255, 0.16) 62%, transparent 72%);
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

.metric-value.small {
  font-size: 28rpx;
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

.section-copy {
  font-size: 24rpx;
  line-height: 1.8;
  color: #334155;
  margin-top: 8rpx;
}

.detail-block + .detail-block {
  margin-top: 18rpx;
  padding-top: 18rpx;
  border-top: 1rpx solid rgba(223, 232, 244, 0.92);
}
</style>
