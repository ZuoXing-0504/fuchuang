<template>
  <view class="page-wrap admin-page">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">正在加载</view>
      <view class="helper-text">正在同步管理端总览数据...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else-if="data">
      <view class="hero-card admin-hero">
        <view class="hero-orb"></view>
        <view class="hero-brand">
          <view class="hero-brand-left">
            <BrandBadge compact />
            <view class="hero-brand-copy">
              <view class="hero-eyebrow">知行雷达管理端</view>
              <view class="hero-title">移动后台总览</view>
            </view>
          </view>
          <view class="hero-pill">总览</view>
        </view>
        <view class="hero-copy">
          在这里快速掌握全局风险、注册覆盖、重点学生与主要模块入口，整体风格与学生端保持一致。
        </view>
      </view>

      <view class="metric-grid">
        <view v-for="(item, index) in kpis" :key="item.label" class="metric-card admin-metric">
          <view class="metric-head">
            <view class="metric-mark" :class="metricMarkClass(index)">{{ metricGlyph(index) }}</view>
            <view class="metric-label">{{ item.label }}</view>
          </view>
          <view class="metric-value">{{ item.value }}</view>
          <view class="muted">{{ item.delta || item.note }}</view>
        </view>
      </view>

      <view class="panel-card feature-panel">
        <view class="panel-head">
          <view>
            <view class="card-title">核心模块</view>
            <view class="muted">按移动端习惯重排后的后台入口</view>
          </view>
        </view>
        <view class="shortcut-grid">
          <view class="shortcut-card card-blue" @click="openPage('/pages/admin/warnings/index')">
            <view class="shortcut-head">
              <view class="shortcut-badge">险</view>
              <view class="shortcut-arrow">›</view>
            </view>
            <view class="shortcut-title">风险名单</view>
            <view class="muted">查看重点学生，并进入详情和完整报告</view>
          </view>
          <view class="shortcut-card card-violet" @click="openPage('/pages/admin/profiles/index')">
            <view class="shortcut-head">
              <view class="shortcut-badge">比</view>
              <view class="shortcut-arrow">›</view>
            </view>
            <view class="shortcut-title">院系对比</view>
            <view class="muted">查看学院风险率、主导画像和细分解释</view>
          </view>
          <view class="shortcut-card card-green" @click="openPage('/pages/admin/tasks/index')">
            <view class="shortcut-head">
              <view class="shortcut-badge">干</view>
              <view class="shortcut-arrow">›</view>
            </view>
            <view class="shortcut-title">干预工作台</view>
            <view class="muted">查看任务历史并发起批量预测</view>
          </view>
          <view class="shortcut-card card-cyan" @click="openPage('/pages/admin/models/index')">
            <view class="shortcut-head">
              <view class="shortcut-badge">模</view>
              <view class="shortcut-arrow">›</view>
            </view>
            <view class="shortcut-title">预测模块</view>
            <view class="muted">查看模型概览和单学生预测结果</view>
          </view>
          <view class="shortcut-card card-amber" @click="openPage('/pages/admin/analysis/index')">
            <view class="shortcut-head">
              <view class="shortcut-badge">析</view>
              <view class="shortcut-arrow">›</view>
            </view>
            <view class="shortcut-title">分析成果</view>
            <view class="muted">查看全样本图表和图表解释</view>
          </view>
          <view class="shortcut-card card-slate" @click="openPage('/pages/admin/settings/index')">
            <view class="shortcut-head">
              <view class="shortcut-badge">设</view>
              <view class="shortcut-arrow">›</view>
            </view>
            <view class="shortcut-title">设置中心</view>
            <view class="muted">核对账号、接口地址和当前会话</view>
          </view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">重点风险学生</view>
        <view
          v-for="item in topRisks"
          :key="item.studentId"
          class="warning-card"
          @click="openDetail(item.studentId)"
        >
          <view class="row-head">
            <view class="row-title">{{ item.studentId }}</view>
            <view class="row-score">{{ item.riskLevel }}</view>
          </view>
          <view class="muted">{{ item.college }} · {{ item.major }}</view>
          <view class="chip-row top-gap">
            <view class="tag-chip">{{ item.profileCategory }}</view>
            <view v-if="item.profileSubtype" class="tag-chip">{{ item.profileSubtype }}</view>
            <view class="tag-chip">综合预测 {{ Number(item.scorePrediction || 0).toFixed(1) }}</view>
          </view>
        </view>
      </view>
    </template>

    <view class="page-bottom-space"></view>
    <AdminBottomNav current="home" />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getDashboardOverview } from '../../../api/admin';
import { ensureRole } from '../../../common/session';
import AdminBottomNav from '../../../components/AdminBottomNav.vue';
import BrandBadge from '../../../components/BrandBadge.vue';

const loading = ref(true);
const error = ref('');
const data = ref(null);

const kpis = computed(() => (data.value && data.value.kpis) || []);
const topRisks = computed(() => ((data.value && data.value.topRisks) || []).slice(0, 5));

onShow(() => {
  if (!ensureRole('admin')) return;
  loadData();
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    data.value = await getDashboardOverview();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '管理员总览加载失败';
  } finally {
    loading.value = false;
  }
}

function openPage(url) {
  uni.redirectTo({ url });
}

function openDetail(studentId) {
  uni.navigateTo({ url: `/pages/admin/student-detail/index?studentId=${encodeURIComponent(studentId)}` });
}

function metricGlyph(index) {
  return ['样', '高', '中', '注'][index % 4];
}

function metricMarkClass(index) {
  return ['blue', 'cyan', 'green', 'amber'][index % 4];
}
</script>

<style scoped>
.admin-page {
  padding-bottom: 0;
}

.admin-hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 86% 16%, rgba(187, 239, 255, 0.78), transparent 20%),
    linear-gradient(180deg, rgba(126, 194, 255, 0.78) 0%, rgba(192, 230, 255, 0.72) 48%, rgba(244, 250, 255, 0.84) 100%);
  color: #12243c;
}

.hero-orb {
  position: absolute;
  top: -42rpx;
  right: -12rpx;
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.74), rgba(115, 198, 255, 0.14) 62%, transparent 72%);
  pointer-events: none;
}

.hero-brand {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18rpx;
}

.hero-brand-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.hero-brand-copy {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.hero-eyebrow {
  font-size: 22rpx;
  font-weight: 700;
  color: #4d6d95;
}

.hero-title {
  font-size: 38rpx;
  font-weight: 800;
  color: #13223a;
}

.hero-pill {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.82);
  color: #135edc;
  font-size: 22rpx;
  font-weight: 700;
}

.hero-copy {
  position: relative;
  z-index: 1;
  margin-top: 18rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: #4f6784;
}

.admin-metric {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 250, 255, 0.92) 100%);
}

.metric-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.metric-mark {
  width: 50rpx;
  height: 50rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 800;
}

.metric-mark.blue {
  background: linear-gradient(135deg, #0f6dff, #53b2ff);
}

.metric-mark.cyan {
  background: linear-gradient(135deg, #089ebf, #57d0f0);
}

.metric-mark.green {
  background: linear-gradient(135deg, #12996f, #43cb9b);
}

.metric-mark.amber {
  background: linear-gradient(135deg, #ef9b18, #f6c75d);
}

.feature-panel {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, rgba(248, 251, 255, 0.92) 100%);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}

.shortcut-card {
  padding: 24rpx;
  border-radius: 28rpx;
  border: 1rpx solid rgba(177, 201, 227, 0.22);
  box-shadow: 0 14rpx 30rpx rgba(45, 93, 154, 0.04);
}

.shortcut-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shortcut-badge {
  width: 56rpx;
  height: 56rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 800;
  color: #ffffff;
}

.shortcut-arrow {
  color: #8ba0b8;
  font-size: 34rpx;
  line-height: 1;
}

.shortcut-title {
  font-size: 29rpx;
  font-weight: 800;
  color: #1b2533;
  margin: 14rpx 0 10rpx;
}

.warning-card {
  padding: 22rpx 0;
  border-bottom: 1rpx solid rgba(223, 232, 244, 0.92);
}

.warning-card:last-child {
  border-bottom: none;
}

.row-head {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.row-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #0f172a;
}

.row-score {
  font-size: 24rpx;
  font-weight: 800;
  color: #c2410c;
}

.top-gap {
  margin-top: 10rpx;
}

.card-blue {
  background: linear-gradient(180deg, #ffffff 0%, #edf5ff 100%);
}

.card-blue .shortcut-badge {
  background: linear-gradient(135deg, #0f6dff, #53b2ff);
}

.card-cyan {
  background: linear-gradient(180deg, #ffffff 0%, #ecfbff 100%);
}

.card-cyan .shortcut-badge {
  background: linear-gradient(135deg, #0ea5b7, #59d5f3);
}

.card-violet {
  background: linear-gradient(180deg, #ffffff 0%, #f3f4ff 100%);
}

.card-violet .shortcut-badge {
  background: linear-gradient(135deg, #5567ff, #8c91ff);
}

.card-green {
  background: linear-gradient(180deg, #ffffff 0%, #eefcf5 100%);
}

.card-green .shortcut-badge {
  background: linear-gradient(135deg, #10956c, #45cb9b);
}

.card-amber {
  background: linear-gradient(180deg, #ffffff 0%, #fff8ed 100%);
}

.card-amber .shortcut-badge {
  background: linear-gradient(135deg, #ec9a1a, #f6c55f);
}

.card-slate {
  background: linear-gradient(180deg, #ffffff 0%, #f5f8fc 100%);
}

.card-slate .shortcut-badge {
  background: linear-gradient(135deg, #405468, #7387a0);
}
</style>
