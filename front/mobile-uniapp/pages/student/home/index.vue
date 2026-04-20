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
      <view class="hero-card">
        <view class="card-title">{{ data.studentName || data.studentId }}</view>
        <view class="hero-copy">{{ data.profileCategory }}<text v-if="data.profileSubtype"> · {{ data.profileSubtype }}</text></view>
        <view class="chip-row">
          <view class="chip">{{ data.riskLevel }}</view>
          <view class="chip">{{ data.performanceLevel }}</view>
          <view class="chip">{{ data.healthLevel }}</view>
        </view>
      </view>

      <view class="metric-grid">
        <view class="metric-card">
          <view class="metric-label">奖学金概率</view>
          <view class="metric-value">{{ percentText(data.scholarshipProbability) }}</view>
        </view>
        <view class="metric-card">
          <view class="metric-label">画像标签数</view>
          <view class="metric-value">{{ data.secondaryTags.length }}</view>
        </view>
        <view class="metric-card">
          <view class="metric-label">分析图表</view>
          <view class="metric-value">{{ data.analysisCharts.length }}</view>
        </view>
        <view class="metric-card">
          <view class="metric-label">图表状态</view>
          <view class="metric-value small">{{ data.chartStatus.ready ? '已准备' : '待补齐' }}</view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">快捷入口</view>
        <view class="shortcut-grid">
          <view class="shortcut-card" @click="switchStudentTab('/pages/student/profile/index')">
            <view class="shortcut-title">我的画像</view>
            <view class="muted">查看主画像、细分子类和解释说明</view>
          </view>
          <view class="shortcut-card" @click="switchStudentTab('/pages/student/predict/index')">
            <view class="shortcut-title">在线预测</view>
            <view class="muted">输入关键特征，直接得到全部预测结果</view>
          </view>
          <view class="shortcut-card" @click="openPage('/pages/student/compare/index')">
            <view class="shortcut-title">群体对比</view>
            <view class="muted">查看自己与群体均值、同类群体的差异</view>
          </view>
          <view class="shortcut-card" @click="openPage('/pages/student/trend/index')">
            <view class="shortcut-title">趋势观察</view>
            <view class="muted">查看学习、风险、健康与成绩变化趋势</view>
          </view>
          <view class="shortcut-card" @click="switchStudentTab('/pages/student/report/index')">
            <view class="shortcut-title">个性化报告</view>
            <view class="muted">阅读完整结论、依据、建议和特征表</view>
          </view>
          <view class="shortcut-card" @click="openPage('/pages/student/analysis/index')">
            <view class="shortcut-title">全样本分析</view>
            <view class="muted">查看 8 张全样本分析图及每张图的解释</view>
          </view>
        </view>
      </view>

      <view v-if="data.secondaryTags.length" class="panel-card">
        <view class="card-title">当前标签</view>
        <view class="chip-row">
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
        <view v-for="chart in previewCharts" :key="chart.title" class="chart-preview" @click="openPage('/pages/student/analysis/index')">
          <view>
            <view class="row-title">{{ chart.title }}</view>
            <view class="muted">{{ chart.description || chart.category }}</view>
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
.hero-copy {
  font-size: 24rpx;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.92);
}

.metric-value.small {
  font-size: 28rpx;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.shortcut-card,
.chart-preview {
  padding: 22rpx;
  border-radius: 22rpx;
  background: #f8faf6;
  border: 2rpx solid #e9efe7;
}

.shortcut-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #1a2e1f;
  margin-bottom: 10rpx;
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
}
</style>
