<template>
  <view class="page-wrap">
    <view v-if="loading" class="status-card loading">
      <view class="status-title">正在加载</view>
      <view class="helper-text">正在同步学生首页数据...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else-if="data">
      <view class="hero-card student-hero">
        <view class="hero-glow"></view>
        <view class="hero-top">
          <view class="hero-user">
            <view class="hero-avatar">知</view>
            <view class="hero-copy-group">
              <view class="hero-caption">知行雷达学生端</view>
              <view class="hero-name">{{ data.studentName || data.studentId }}</view>
              <view class="hero-subtitle">
                {{ data.profileCategory }}
                <text v-if="data.profileSubtype"> · {{ data.profileSubtype }}</text>
              </view>
            </view>
          </view>
          <view class="hero-pill">在线</view>
        </view>
        <view class="chip-row hero-chip-row">
          <view class="chip">{{ data.riskLevel }}</view>
          <view class="chip">{{ data.performanceLevel }}</view>
          <view class="chip">{{ data.healthLevel }}</view>
        </view>
      </view>

      <view class="metric-grid">
        <view class="metric-card light-card">
          <view class="metric-meta">
            <view class="metric-mark blue">奖</view>
            <view class="metric-label">奖学金概率</view>
          </view>
          <view class="metric-value">{{ percentText(data.scholarshipProbability) }}</view>
          <view class="muted">根据当前画像与表现给出的估计结果</view>
        </view>
        <view class="metric-card light-card">
          <view class="metric-meta">
            <view class="metric-mark cyan">像</view>
            <view class="metric-label">画像标签数</view>
          </view>
          <view class="metric-value">{{ data.secondaryTags.length }}</view>
          <view class="muted">当前系统已经生成的二级标签数量</view>
        </view>
        <view class="metric-card light-card">
          <view class="metric-meta">
            <view class="metric-mark deep">图</view>
            <view class="metric-label">分析图表</view>
          </view>
          <view class="metric-value">{{ data.analysisCharts.length }}</view>
          <view class="muted">全样本分析页可查看的图表数量</view>
        </view>
        <view class="metric-card light-card">
          <view class="metric-meta">
            <view class="metric-mark slate">态</view>
            <view class="metric-label">图表状态</view>
          </view>
          <view class="metric-value small">{{ data.chartStatus.ready ? '已就绪' : '待补齐' }}</view>
          <view class="muted">当前图表文件与说明是否准备完成</view>
        </view>
      </view>

      <view class="panel-card feature-panel">
        <view class="panel-head">
          <view>
            <view class="card-title">功能模块</view>
            <view class="muted">以简洁方式进入常用能力</view>
          </view>
        </view>
        <view class="shortcut-grid">
          <view class="shortcut-card card-blue" @click="switchStudentTab('/pages/student/profile/index')">
            <view class="shortcut-head">
              <view class="shortcut-badge">像</view>
              <view class="shortcut-arrow">›</view>
            </view>
            <view class="shortcut-title">我的画像</view>
            <view class="muted">查看主画像、细分子类与解释说明</view>
          </view>
          <view class="shortcut-card card-cyan" @click="switchStudentTab('/pages/student/predict/index')">
            <view class="shortcut-head">
              <view class="shortcut-badge">测</view>
              <view class="shortcut-arrow">›</view>
            </view>
            <view class="shortcut-title">在线预测</view>
            <view class="muted">修改关键字段后立即获取全部预测结果</view>
          </view>
          <view class="shortcut-card card-violet" @click="openPage('/pages/student/compare/index')">
            <view class="shortcut-head">
              <view class="shortcut-badge">比</view>
              <view class="shortcut-arrow">›</view>
            </view>
            <view class="shortcut-title">群体对比</view>
            <view class="muted">查看你与群体均值及同类群体差异</view>
          </view>
          <view class="shortcut-card card-green" @click="openPage('/pages/student/chat/index')">
            <view class="shortcut-head">
              <view class="shortcut-badge">聊</view>
              <view class="shortcut-arrow">›</view>
            </view>
            <view class="shortcut-title">智能助手</view>
            <view class="muted">围绕画像、风险、建议和系统功能交流</view>
          </view>
          <view class="shortcut-card card-amber" @click="openPage('/pages/student/trend/index')">
            <view class="shortcut-head">
              <view class="shortcut-badge">势</view>
              <view class="shortcut-arrow">›</view>
            </view>
            <view class="shortcut-title">趋势观察</view>
            <view class="muted">查看学习、风险与健康变化趋势</view>
          </view>
          <view class="shortcut-card card-rose" @click="switchStudentTab('/pages/student/report/index')">
            <view class="shortcut-head">
              <view class="shortcut-badge">报</view>
              <view class="shortcut-arrow">›</view>
            </view>
            <view class="shortcut-title">个性化报告</view>
            <view class="muted">阅读完整结论、依据、建议和关键特征</view>
          </view>
          <view class="shortcut-card card-slate" @click="openPage('/pages/student/analysis/index')">
            <view class="shortcut-head">
              <view class="shortcut-badge">析</view>
              <view class="shortcut-arrow">›</view>
            </view>
            <view class="shortcut-title">全样本分析</view>
            <view class="muted">查看 8 张分析图以及每张图的解释</view>
          </view>
          <view class="shortcut-card card-blue" @click="switchStudentTab('/pages/student/settings/index')">
            <view class="shortcut-head">
              <view class="shortcut-badge">设</view>
              <view class="shortcut-arrow">›</view>
            </view>
            <view class="shortcut-title">设置中心</view>
            <view class="muted">查看账号、接口地址和常用入口</view>
          </view>
        </view>
      </view>

      <view v-if="data.secondaryTags.length" class="panel-card">
        <view class="card-title">当前标签</view>
        <view class="chip-row top-gap">
          <view v-for="item in data.secondaryTags" :key="item" class="tag-chip">{{ item }}</view>
        </view>
      </view>

      <view v-if="data.trendSummary.length" class="panel-card">
        <view class="card-title">核心摘要</view>
        <view v-for="item in data.trendSummary" :key="item.label" class="list-card">
          <view class="row-head">
            <view class="row-title">{{ item.label }}</view>
            <view class="row-score">{{ item.value }}</view>
          </view>
        </view>
      </view>

      <view v-if="data.insights.length" class="panel-card">
        <view class="card-title">系统洞察</view>
        <view v-for="item in data.insights" :key="item" class="list-card">
          <view class="section-copy">{{ item }}</view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">分析图预览</view>
        <view v-if="!data.analysisCharts.length" class="empty-text">当前没有可展示的分析图。</view>
        <view
          v-for="chart in previewCharts"
          :key="chart.title"
          class="chart-preview"
          @click="openPage('/pages/student/analysis/index')"
        >
          <view class="preview-left">
            <view class="preview-dot"></view>
            <view>
              <view class="row-title">{{ chart.title }}</view>
              <view class="muted">{{ chart.description || chart.category }}</view>
            </view>
          </view>
          <view class="preview-link">查看</view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getStudentHome } from '../../../api/student';
import { ensureRole } from '../../../common/session';

const loading = ref(true);
const error = ref('');
const data = ref(null);

const previewCharts = computed(() => ((data.value && data.value.analysisCharts) || []).slice(0, 3));

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
    error.value = err instanceof Error ? err.message : '学生首页加载失败';
  } finally {
    loading.value = false;
  }
}

function percentText(value) {
  return `${Math.round((Number(value) || 0) * 100)}%`;
}

function switchStudentTab(url) {
  uni.switchTab({ url });
}

function openPage(url) {
  uni.navigateTo({ url });
}
</script>

<style scoped>
.student-hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 88% 18%, rgba(208, 243, 255, 0.82), transparent 18%),
    linear-gradient(180deg, rgba(155, 213, 255, 0.78) 0%, rgba(218, 241, 255, 0.7) 52%, rgba(248, 252, 255, 0.82) 100%);
  color: #13233b;
}

.hero-glow {
  position: absolute;
  top: -48rpx;
  right: -24rpx;
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.72), rgba(130, 214, 255, 0.1) 65%, transparent 72%);
  pointer-events: none;
}

.hero-top {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  align-items: flex-start;
}

.hero-user {
  display: flex;
  gap: 18rpx;
  align-items: center;
}

.hero-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
  font-weight: 800;
  color: #0f6dff;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 12rpx 32rpx rgba(71, 134, 212, 0.12);
}

.hero-copy-group {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.hero-caption {
  font-size: 22rpx;
  color: #4a6b91;
  font-weight: 700;
}

.hero-name {
  font-size: 38rpx;
  font-weight: 800;
  color: #14233b;
}

.hero-subtitle {
  font-size: 24rpx;
  line-height: 1.7;
  color: #506884;
}

.hero-pill {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.8);
  color: #0f6dff;
  font-size: 22rpx;
  font-weight: 700;
}

.hero-chip-row {
  position: relative;
  z-index: 1;
  margin-top: 18rpx;
}

.hero-chip-row .chip {
  background: rgba(255, 255, 255, 0.78);
  color: #315071;
}

.light-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 251, 255, 0.92) 100%);
}

.metric-meta {
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
  background: linear-gradient(135deg, #0f6dff, #4eb4ff);
}

.metric-mark.cyan {
  background: linear-gradient(135deg, #11a4bf, #5ac9ef);
}

.metric-mark.deep {
  background: linear-gradient(135deg, #2563eb, #315efb);
}

.metric-mark.slate {
  background: linear-gradient(135deg, #42566f, #71859c);
}

.metric-value.small {
  font-size: 28rpx;
}

.feature-panel {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(247, 250, 255, 0.92) 100%);
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

.row-head {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.row-title,
.section-copy {
  font-size: 26rpx;
  color: #223127;
}

.row-title {
  font-weight: 800;
}

.row-score,
.preview-link {
  font-size: 26rpx;
  font-weight: 800;
  color: #2d7a4f;
}

.chart-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14rpx;
  padding: 22rpx;
  border-radius: 22rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(247, 250, 255, 0.9) 100%);
  border: 1rpx solid rgba(180, 203, 225, 0.18);
}

.preview-left {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.preview-dot {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #1677ff, #58b4ff);
  box-shadow: 0 0 0 10rpx rgba(22, 119, 255, 0.1);
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

.card-rose {
  background: linear-gradient(180deg, #ffffff 0%, #fff1f5 100%);
}

.card-rose .shortcut-badge {
  background: linear-gradient(135deg, #f0517f, #ff8ba8);
}

.card-slate {
  background: linear-gradient(180deg, #ffffff 0%, #f5f8fc 100%);
}

.card-slate .shortcut-badge {
  background: linear-gradient(135deg, #405468, #7387a0);
}

.top-gap {
  margin-top: 14rpx;
}
</style>
