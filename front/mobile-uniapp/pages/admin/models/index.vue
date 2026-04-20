<template>
  <view class="page-wrap admin-page">
    <view class="hero-card">
      <view class="hero-eyebrow">预测模块</view>
      <view class="card-title">模型总览</view>
      <view class="hero-copy">这里统一查看风险、奖学金、综合成绩、健康、趋势、学习投入、综合发展以及四六级等模型任务。</view>
    </view>

    <view v-if="loading" class="status-card loading">
      <view class="status-title">正在加载</view>
      <view class="helper-text">正在同步模型概览...</view>
    </view>

    <view v-else-if="error" class="status-card error">
      <view class="status-title">加载失败</view>
      <view class="helper-text">{{ error }}</view>
      <button class="secondary-btn" @click="loadData">重新加载</button>
    </view>

    <template v-else>
      <view v-if="summary && summary.overviewCards.length" class="metric-grid">
        <view v-for="item in summary.overviewCards" :key="item.label" class="metric-card">
          <view class="metric-label">{{ item.label }}</view>
          <view class="metric-value small">{{ item.value }}</view>
          <view class="muted">{{ item.note }}</view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">单学生预测结果入口</view>
        <input v-model="studentId" class="field-input" placeholder="输入学号后查看该学生的各项预测结果" />
        <view class="action-row top-gap">
          <button class="primary-btn flex-btn" :disabled="studentLoading" @click="loadStudentPrediction">
            {{ studentLoading ? '查询中...' : '查看预测结果' }}
          </button>
          <button v-if="studentDetail" class="secondary-btn flex-btn" @click="openStudentDetail">学生详情</button>
        </view>
        <view v-if="studentError" class="helper-text top-gap">{{ studentError }}</view>
      </view>

      <view v-if="studentCards.length" class="panel-card">
        <view class="card-title">单学生预测结果</view>
        <view class="result-grid">
          <view v-for="item in studentCards" :key="item.label" class="result-card">
            <view class="metric-label">{{ item.label }}</view>
            <view class="metric-value small">{{ item.value }}</view>
            <view class="muted">{{ item.note }}</view>
          </view>
        </view>
      </view>

      <view class="panel-card">
        <view class="card-title">任务模型</view>
        <view v-for="task in tasks" :key="task.taskKey" class="task-card">
          <view class="row-head">
            <view class="row-title">{{ task.taskName }}</view>
            <view class="row-score">{{ task.onlineAvailable ? '已在线' : '离线评估' }}</view>
          </view>
          <view class="section-copy">{{ task.description }}</view>
          <view class="muted top-gap">最佳模型：{{ task.bestModel }}</view>
          <view class="muted">主指标：{{ task.primaryMetricLabel }} {{ metricText(task.primaryMetricValue) }}</view>
          <view class="muted">辅助指标：{{ task.secondaryMetricLabel }} {{ metricText(task.secondaryMetricValue) }}</view>
        </view>
      </view>
    </template>

    <view class="page-bottom-space"></view>
    <AdminBottomNav current="models" />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getModelSummary, getStudentDetail } from '../../../api/admin';
import { ensureRole } from '../../../common/session';
import AdminBottomNav from '../../../components/AdminBottomNav.vue';

const loading = ref(true);
const error = ref('');
const summary = ref(null);
const studentId = ref('');
const studentLoading = ref(false);
const studentError = ref('');
const studentDetail = ref(null);

const tasks = computed(() => ((summary.value && summary.value.tasks) || []));
const studentCards = computed(() => {
  if (!studentDetail.value) return [];
  const detail = studentDetail.value;
  const lookup = new Map((detail.academicDetails || []).map((item) => [item.label, item.value]));
  return [
    { label: '风险等级', value: detail.riskLevel || '未提供', note: '当前风险分类结果' },
    { label: '综合成绩预测', value: detail.scorePredictionLabel || String(detail.scorePrediction || '未提供'), note: '综合成绩或档次预测结果' },
    { label: '奖学金概率', value: lookup.get('奖学金概率') || '未提供', note: '奖学金获得概率预测' },
    { label: '英语四级通过概率', value: lookup.get('英语四级通过概率') || '未提供', note: '四级通过概率预测' },
    { label: '英语六级通过概率', value: lookup.get('英语六级通过概率') || '未提供', note: '六级通过概率预测' },
    { label: '学习投入档次预测', value: lookup.get('学习投入档次预测') || '未提供', note: '学习投入分类结果' },
    { label: '综合发展档次预测', value: lookup.get('综合发展档次预测') || '未提供', note: '综合发展分类结果' },
    { label: '健康状态', value: detail.healthLevel || '未提供', note: '健康水平分类结果' }
  ];
});

onShow(() => {
  if (!ensureRole('admin')) return;
  loadData();
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    summary.value = await getModelSummary();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '模型概览加载失败';
  } finally {
    loading.value = false;
  }
}

async function loadStudentPrediction() {
  if (!studentId.value.trim()) {
    studentError.value = '请先输入学号。';
    return;
  }
  studentLoading.value = true;
  studentError.value = '';
  try {
    studentDetail.value = await getStudentDetail(studentId.value.trim());
  } catch (err) {
    studentError.value = err instanceof Error ? err.message : '该学生预测结果加载失败';
    studentDetail.value = null;
  } finally {
    studentLoading.value = false;
  }
}

function openStudentDetail() {
  if (!studentDetail.value || !studentDetail.value.studentId) return;
  uni.navigateTo({ url: `/pages/admin/student-detail/index?studentId=${encodeURIComponent(studentDetail.value.studentId)}` });
}

function metricText(value) {
  return value === undefined || value === null ? '未提供' : Number(value).toFixed(3);
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

.top-gap {
  margin-top: 16rpx;
}

.action-row {
  display: flex;
  gap: 16rpx;
}

.flex-btn {
  flex: 1;
}

.metric-value.small {
  font-size: 28rpx;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.result-card,
.task-card {
  padding: 22rpx;
  border-radius: 22rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 2rpx solid rgba(148, 163, 184, 0.12);
}

.task-card + .task-card {
  margin-top: 16rpx;
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
  color: #1677ff;
}
</style>
