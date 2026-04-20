<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getModelSummary, getStudentDetail } from '../../api/admin';
import type { ModelMetricValue, ModelTaskRow, ModelTaskSummary, ModelSummary, StudentDetail } from '../../types';

const router = useRouter();
const summary = ref<ModelSummary>();
const searchStudentId = ref('');
const studentDetail = ref<StudentDetail>();
const studentLoading = ref(false);
const studentError = ref('');

const taskPresentationMap: Record<string, { title: string; description: string; note?: string; primaryMetricKey?: string; secondaryMetricKey?: string }> = {
  risk: {
    title: '风险预测',
    description: '识别学生当前的风险水平，是预警链路里的核心任务。',
    primaryMetricKey: 'auc',
    secondaryMetricKey: 'f1'
  },
  scholarship: {
    title: '奖学金获得概率预测',
    description: '评估学生获得奖学金的可能性，用于体现学业与综合发展成果。',
    primaryMetricKey: 'auc',
    secondaryMetricKey: 'f1'
  },
  performance: {
    title: '综合成绩档次分类',
    description: '把学生综合表现划分为高、中、低档次，更适合看多分类稳定性。',
    primaryMetricKey: 'macro_f1',
    secondaryMetricKey: 'accuracy'
  },
  health: {
    title: '健康水平分类',
    description: '根据体测、锻炼与行为规律特征识别健康状态。',
    note: '这一版已经去掉了最直接贴着标签的健康总分特征，指标更克制，也更符合真实业务场景下的解释口径。',
    primaryMetricKey: 'macro_f1',
    secondaryMetricKey: 'accuracy'
  },
  change_trend: {
    title: '变化趋势预测',
    description: '判断学生整体状态更接近上升、稳定还是下降趋势。',
    primaryMetricKey: 'macro_f1',
    secondaryMetricKey: 'accuracy'
  },
  learning_engagement: {
    title: '学习投入档次分类',
    description: '对学习投入做高、中、低档分类，这类任务更适合看 Macro F1 和 Accuracy。',
    note: '学习投入是多分类任务，不应该只盯着 AUC 看。',
    primaryMetricKey: 'macro_f1',
    secondaryMetricKey: 'accuracy'
  },
  development: {
    title: '综合发展档次分类',
    description: '评估学生综合发展水平，更适合看分类一致性而不是单独看 AUC。',
    note: '综合发展也是多分类任务，展示时应把 Macro F1 和 Accuracy 放前面。',
    primaryMetricKey: 'macro_f1',
    secondaryMetricKey: 'accuracy'
  },
  cet4: {
    title: '英语四级通过概率预测',
    description: '基于学生基础特征和学习行为预测四级通过概率。',
    primaryMetricKey: 'auc',
    secondaryMetricKey: 'f1'
  },
  cet6: {
    title: '英语六级通过概率预测',
    description: '基于学生基础特征和学习行为预测六级通过概率。',
    note: '六级样本通过率非常高，类别不平衡会把 AUC 推得很高，所以不能只看一个高 AUC。',
    primaryMetricKey: 'auc',
    secondaryMetricKey: 'f1'
  },
  score_regression: {
    title: '综合成绩预测',
    description: '直接回归预测综合成绩分数，适合放在报告里做分值参考。',
    primaryMetricKey: 'r2',
    secondaryMetricKey: 'rmse'
  }
};

const metricLabelMap: Record<string, string> = {
  accuracy: 'Accuracy',
  precision: 'Precision',
  recall: 'Recall',
  f1: 'F1',
  auc: 'AUC',
  cv_auc: 'CV AUC',
  macro_precision: 'Macro Precision',
  macro_recall: 'Macro Recall',
  macro_f1: 'Macro F1',
  macro_auc_ovr: 'Macro AUC',
  r2: 'R2',
  rmse: 'RMSE',
  mae: 'MAE'
};

onMounted(async () => {
  summary.value = await getModelSummary();
});

const taskList = computed(() => summary.value?.tasks ?? []);
const onlineCount = computed(() => taskList.value.filter((task) => task.onlineAvailable).length);
const cautionCount = computed(() => taskList.value.filter((task) => Boolean(taskPresentationMap[task.taskKey]?.note)).length);

const overviewCards = computed(() => [
  { label: '预测任务数', value: String(taskList.value.length), tone: 'primary', note: '当前统一预测模块纳入的任务总数' },
  { label: '在线任务数', value: String(onlineCount.value), tone: 'success', note: '已经接入单学生在线预测的任务数' },
  { label: '离线评估任务数', value: String(Math.max(taskList.value.length - onlineCount.value, 0)), tone: 'warning', note: '已有评估结果但仍可继续补强线上推断的任务' },
  { label: '需谨慎解释', value: String(cautionCount.value), tone: 'danger', note: '指标过高或口径特殊，需要补充解释的任务数' }
]);

const moduleNotes = computed(() => [
  '这个模块把风险、奖学金、综合成绩、健康、趋势、学习投入、综合发展、四级、六级等任务统一展示。',
  '二分类任务优先看 AUC 与 F1；多分类任务更适合同时看 Macro F1、Accuracy，再把 AUC 作为辅助参考。',
  '如果某个任务的 AUC 过高，要优先排查数据泄漏、标签过于容易或类别极不平衡，而不是直接把结果当成“完美模型”。'
]);

function academicLookup(detail?: StudentDetail) {
  return new Map((detail?.academicDetails ?? []).map((item) => [item.label, item.value]));
}

const studentPredictionCards = computed(() => {
  if (!studentDetail.value) {
    return [];
  }
  const detail = studentDetail.value;
  const lookup = academicLookup(detail);
  return [
    { label: '风险等级', value: detail.riskLevel || '未提供', note: '当前风险分类结果' },
    { label: '风险概率', value: lookup.get('风险概率') || '未提供', note: '风险模型给出的总体概率' },
    { label: '综合预测分', value: lookup.get('综合预测分') || detail.scorePredictionLabel || '未提供', note: '综合成绩预测结果' },
    { label: '奖学金概率', value: lookup.get('奖学金概率') || '未提供', note: '奖学金获得概率预测' },
    { label: '英语四级通过概率', value: lookup.get('英语四级通过概率') || '未提供', note: '四级通过概率预测' },
    { label: '英语六级通过概率', value: lookup.get('英语六级通过概率') || '未提供', note: '六级通过概率预测' },
    { label: '学业表现档次', value: lookup.get('学业表现档次') || detail.performanceLevel || '未提供', note: '学业表现分类结果' },
    { label: '学习投入档次预测', value: lookup.get('学习投入档次预测') || '未提供', note: '学习投入分类结果' },
    { label: '高投入概率', value: lookup.get('高投入概率') || '未提供', note: '学习投入模型中的高投入概率' },
    { label: '综合发展档次预测', value: lookup.get('综合发展档次预测') || '未提供', note: '综合发展分类结果' },
    { label: '高发展概率', value: lookup.get('高发展概率') || '未提供', note: '综合发展模型中的高发展概率' },
    { label: '健康状态', value: detail.healthLevel || '未提供', note: '健康水平分类结果' },
    { label: '稳定健康概率', value: lookup.get('稳定健康概率') || '未提供', note: '健康模型中的稳定概率' },
    { label: '上升趋势概率', value: lookup.get('上升趋势概率') || '未提供', note: '变化趋势模型输出' },
    { label: '竞赛活跃概率', value: lookup.get('竞赛活跃概率') || '未提供', note: '竞赛活跃相关预测结果' }
  ];
});

function formatMetricValue(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return '未提供';
  return value.toFixed(3);
}

function toneType(tone: string) {
  if (tone === 'success') return 'success';
  if (tone === 'warning') return 'warning';
  if (tone === 'danger') return 'danger';
  return 'primary';
}

function taskView(task: ModelTaskSummary) {
  return taskPresentationMap[task.taskKey] ?? {
    title: task.taskName,
    description: task.description,
    primaryMetricKey: task.primaryMetricKey,
    secondaryMetricKey: task.secondaryMetricKey
  };
}

function metricValueMap(row: ModelTaskRow) {
  return new Map(row.values.map((item) => [item.key, item]));
}

function pickBestRow(task: ModelTaskSummary, metricKey: string) {
  let bestRow: ModelTaskRow | undefined;
  let bestValue = Number.NEGATIVE_INFINITY;
  for (const row of task.rows) {
    const value = metricValueMap(row).get(metricKey)?.value;
    if (value === undefined || value === null || Number.isNaN(value)) continue;
    if (value > bestValue) {
      bestValue = value;
      bestRow = row;
    }
  }
  return bestRow ?? task.rows[0];
}

function displayMetrics(task: ModelTaskSummary) {
  const view = taskView(task);
  const primaryMetricKey = view.primaryMetricKey ?? task.primaryMetricKey;
  const secondaryMetricKey = view.secondaryMetricKey ?? task.secondaryMetricKey;
  const bestRow = pickBestRow(task, primaryMetricKey);
  const metricMap = bestRow ? metricValueMap(bestRow) : new Map<string, ModelMetricValue>();
  return {
    bestModel: bestRow?.model ?? task.bestModel,
    primaryLabel: metricLabelMap[primaryMetricKey] ?? task.primaryMetricLabel,
    primaryValue: metricMap.get(primaryMetricKey)?.value,
    secondaryLabel: metricLabelMap[secondaryMetricKey] ?? task.secondaryMetricLabel,
    secondaryValue: metricMap.get(secondaryMetricKey)?.value
  };
}

function topImportance(task: ModelTaskSummary) {
  return task.importance.slice(0, 5);
}

async function searchStudentPredictions() {
  const studentId = searchStudentId.value.trim();
  if (!studentId) {
    studentError.value = '请输入学号后再查询';
    studentDetail.value = undefined;
    return;
  }
  studentLoading.value = true;
  studentError.value = '';
  try {
    studentDetail.value = await getStudentDetail(studentId);
  } catch (error) {
    studentDetail.value = undefined;
    studentError.value = error instanceof Error ? error.message : '该学生预测结果加载失败';
  } finally {
    studentLoading.value = false;
  }
}

function openStudentDetail() {
  if (!studentDetail.value?.studentId) return;
  router.push(`/students/${studentDetail.value.studentId}`);
}

function openStudentReport() {
  if (!studentDetail.value?.studentId) return;
  router.push(`/students/${studentDetail.value.studentId}/report`);
}
</script>

<template>
  <section class="page-shell">
    <div class="page-header">
      <div>
        <h1 class="page-title">预测模型模块</h1>
        <p class="page-subtitle">集中展示风险、奖学金、综合成绩、健康、趋势、学习投入、综合发展和四六级等任务模型。</p>
      </div>
    </div>

    <el-card class="panel-card student-query-card">
      <template #header>
        <div class="card-header-inner">
          <span>单学生预测结果入口</span>
          <span class="minor-copy">直接输入学号查看该学生对应的各项预测结果</span>
        </div>
      </template>
      <div class="student-query-bar">
        <el-input
          v-model="searchStudentId"
          placeholder="输入学号后查看该学生的各项预测结果"
          clearable
          style="width: 320px"
          @keyup.enter="searchStudentPredictions"
        />
        <el-button type="primary" :loading="studentLoading" @click="searchStudentPredictions">查看预测结果</el-button>
        <el-button v-if="studentDetail" @click="openStudentDetail">学生详情</el-button>
        <el-button v-if="studentDetail" @click="openStudentReport">完整报告</el-button>
      </div>

      <el-alert
        v-if="studentError"
        type="error"
        :closable="false"
        class="student-alert"
        :title="studentError"
      />

      <div v-if="studentDetail" class="student-result-wrap">
        <div class="student-meta">
          <div class="student-name">{{ studentDetail.studentId }}</div>
          <div class="student-copy">{{ studentDetail.studentId }} · {{ studentDetail.college }} · {{ studentDetail.major }}</div>
        </div>
        <div class="student-result-grid">
          <article v-for="item in studentPredictionCards" :key="item.label" class="student-result-card">
            <div class="student-result-label">{{ item.label }}</div>
            <div class="student-result-value">{{ item.value }}</div>
            <div class="student-result-note">{{ item.note }}</div>
          </article>
        </div>
      </div>
    </el-card>

    <div class="overview-grid">
      <el-card v-for="card in overviewCards" :key="card.label" class="overview-card">
        <div class="overview-label">{{ card.label }}</div>
        <div class="overview-value">{{ card.value }}</div>
        <el-tag size="small" round :type="toneType(card.tone)">{{ card.note }}</el-tag>
      </el-card>
    </div>

    <el-card class="panel-card">
      <template #header>
        <div class="card-header-inner">
          <span>模块说明</span>
          <el-tag size="small" round type="info">指标口径</el-tag>
        </div>
      </template>
      <div class="desc-list">
        <div v-for="(item, index) in moduleNotes" :key="index" class="desc-item">
          <div class="desc-index">{{ index + 1 }}</div>
          <div class="desc-text">{{ item }}</div>
        </div>
      </div>
    </el-card>

    <div class="task-grid">
      <el-card v-for="task in taskList" :key="task.taskKey" class="task-card">
        <div class="task-top">
          <div>
            <div class="task-name">{{ taskView(task).title }}</div>
            <div class="task-desc">{{ taskView(task).description }}</div>
          </div>
          <el-tag :type="task.onlineAvailable ? 'success' : 'warning'" round>
            {{ task.onlineAvailable ? '已接入在线预测' : '仅有离线评估' }}
          </el-tag>
        </div>

        <div v-if="taskView(task).note" class="task-note">
          {{ taskView(task).note }}
        </div>

        <div class="metric-pair">
          <div class="metric-pill">
            <div class="metric-title">{{ displayMetrics(task).primaryLabel }}</div>
            <div class="metric-number">{{ formatMetricValue(displayMetrics(task).primaryValue) }}</div>
          </div>
          <div class="metric-pill subtle">
            <div class="metric-title">{{ displayMetrics(task).secondaryLabel }}</div>
            <div class="metric-number">{{ formatMetricValue(displayMetrics(task).secondaryValue) }}</div>
          </div>
        </div>

        <div class="task-meta">
          <span>推荐展示模型：{{ displayMetrics(task).bestModel }}</span>
          <span>评估文件：{{ task.source }}</span>
        </div>

        <el-table :data="task.rows" stripe size="small" class="task-table">
          <el-table-column prop="model" label="模型" min-width="150" />
          <el-table-column label="指标详情" min-width="320">
            <template #default="{ row }">
              <div class="metric-chip-list">
                <span v-for="item in row.values" :key="item.key" class="metric-chip">
                  {{ item.label }} {{ item.value.toFixed(3) }}
                </span>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="topImportance(task).length" class="importance-block">
          <div class="importance-title">Top 特征</div>
          <div class="importance-list">
            <div v-for="item in topImportance(task)" :key="`${task.taskKey}-${item.feature}`" class="importance-row">
              <span class="importance-feature">{{ item.feature }}</span>
              <span class="importance-value">{{ (item.importance * 100).toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </section>
</template>

<style scoped>
.student-query-card,
.overview-card,
.task-card {
  border-radius: 20px;
}

.student-query-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.student-alert {
  margin-top: 14px;
}

.student-result-wrap {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.student-meta {
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fbff;
}

.student-name {
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
}

.student-copy,
.minor-copy,
.overview-label,
.metric-title,
.task-desc,
.student-result-label,
.student-result-note {
  font-size: 12px;
  color: #64748b;
}

.student-result-grid,
.overview-grid,
.task-grid {
  display: grid;
  gap: 16px;
}

.student-result-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.student-result-card {
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
  border: 1px solid #e4edf8;
}

.student-result-value,
.overview-value,
.metric-number {
  margin: 8px 0 10px;
  font-size: 28px;
  font-weight: 900;
  color: #0f172a;
}

.overview-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin: 20px 0;
}

.card-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.desc-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.desc-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fafc;
}

.desc-index {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #1677ff;
  color: #fff;
  font-weight: 800;
  flex-shrink: 0;
}

.desc-text {
  line-height: 1.7;
  color: #334155;
}

.task-grid {
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  margin-top: 20px;
}

.task-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.task-name,
.importance-title {
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
}

.task-note {
  margin-bottom: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #fff7ed;
  color: #9a3412;
  font-size: 13px;
  line-height: 1.7;
}

.metric-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.metric-pill {
  padding: 14px 16px;
  border-radius: 18px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
}

.metric-pill.subtle {
  background: linear-gradient(135deg, #f8fafc, #eef2f7);
}

.task-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  color: #475569;
  font-size: 13px;
  margin-bottom: 14px;
}

.task-table {
  margin-bottom: 16px;
}

.metric-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.metric-chip {
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef4ff;
  color: #315ea8;
  font-size: 12px;
  font-weight: 700;
}

.importance-block {
  border-top: 1px solid #e5edf6;
  padding-top: 14px;
}

.importance-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.importance-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: #334155;
}

.importance-feature {
  font-weight: 700;
}

.importance-value {
  color: #1677ff;
  font-weight: 800;
}

@media (max-width: 960px) {
  .task-grid,
  .metric-pair {
    grid-template-columns: 1fr;
  }
}
</style>
