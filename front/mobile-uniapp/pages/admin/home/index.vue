<template>
  <view class="page-wrap admin-page">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">正在加载</view>
      <view class="helper-text">正在同步管理员总览数据...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else-if="data">
      <view class="hero-card">
        <view class="hero-eyebrow">管理员总览</view>
        <view class="card-title">移动后台首页</view>
        <view class="hero-copy">这里汇总当前学生群体的全局情况。你可以先看整体指标，再进入风险名单、院系对比、干预工作台、预测模块和分析成果。</view>
      </view>

      <view class="metric-grid">
        <view v-for="item in kpis" :key="item.label" class="metric-card">
          <view class="metric-label">{{ item.label }}</view>
          <view class="metric-value">{{ item.value }}</view>
          <view class="muted">{{ item.delta || item.note }}</view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">模块入口</view>
        <view class="shortcut-grid">
          <view class="shortcut-card" @click="openPage('/pages/admin/warnings/index')">
            <view class="shortcut-title">风险名单</view>
            <view class="muted">查看重点学生，进入单学生详情和完整报告</view>
          </view>
          <view class="shortcut-card" @click="openPage('/pages/admin/profiles/index')">
            <view class="shortcut-title">院系对比</view>
            <view class="muted">查看学院风险率、主导画像和细分解释</view>
          </view>
          <view class="shortcut-card" @click="openPage('/pages/admin/tasks/index')">
            <view class="shortcut-title">干预工作台</view>
            <view class="muted">查看任务历史并发起批量预测</view>
          </view>
          <view class="shortcut-card" @click="openPage('/pages/admin/models/index')">
            <view class="shortcut-title">预测模块</view>
            <view class="muted">查看模型概览和单学生预测结果</view>
          </view>
          <view class="shortcut-card" @click="openPage('/pages/admin/analysis/index')">
            <view class="shortcut-title">分析成果</view>
            <view class="muted">查看全样本图表和图表解释</view>
          </view>
          <view class="shortcut-card" @click="openPage('/pages/admin/settings/index')">
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

.hero-copy {
  font-size: 24rpx;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.92);
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.shortcut-card {
  padding: 22rpx;
  border-radius: 22rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 2rpx solid rgba(148, 163, 184, 0.12);
}

.shortcut-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 10rpx;
}

.warning-card {
  padding: 22rpx 0;
  border-bottom: 1rpx solid #e8eef7;
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
</style>
