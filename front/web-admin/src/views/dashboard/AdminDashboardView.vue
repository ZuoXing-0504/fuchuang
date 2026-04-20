<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getAnalysisResults, getWarnings } from '../../api/admin';
import type { AnalysisResultsData, StudentMetrics } from '../../types';

type QuickEntry = {
  key: string;
  title: string;
  subtitle: string;
  route: string;
  tone: string;
  stats: string;
};

const router = useRouter();
const loading = ref(true);
const students = ref<StudentMetrics[]>([]);
const analysisData = ref<AnalysisResultsData>();
const activeEntry = ref<QuickEntry | null>(null);
const drawerVisible = ref(false);

const riskPalette: Record<string, string> = {
  高风险: '#ef4444',
  中风险: '#f59e0b',
  低风险: '#10b981'
};

onMounted(async () => {
  loading.value = true;
  try {
    const [warningRows, analysis] = await Promise.all([getWarnings(), getAnalysisResults()]);
    students.value = warningRows;
    analysisData.value = analysis;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '后台数据加载失败');
  } finally {
    loading.value = false;
  }
});

const stats = computed(() => {
  const rows = students.value;
  const total = rows.length;
  const highRisk = rows.filter((item) => item.riskLevel === '高风险').length;
  const mediumRisk = rows.filter((item) => item.riskLevel === '中风险').length;
  const registered = rows.filter((item) => item.registrationStatus === '已注册').length;
  return {
    total,
    highRisk,
    mediumRisk,
    registered,
    registerRate: total ? Math.round((registered / total) * 100) : 0
  };
});

const riskDistribution = computed(() => {
  const counters = new Map<string, number>();
  for (const student of students.value) {
    counters.set(student.riskLevel, (counters.get(student.riskLevel) ?? 0) + 1);
  }
  return Array.from(counters.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
});

const profileDistribution = computed(() => {
  const counters = new Map<string, number>();
  for (const student of students.value) {
    counters.set(student.profileCategory, (counters.get(student.profileCategory) ?? 0) + 1);
  }
  return Array.from(counters.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
});

const topRiskStudents = computed(() => {
  const weight: Record<string, number> = { 高风险: 3, 中风险: 2, 低风险: 1 };
  return [...students.value]
    .sort((a, b) => ((weight[b.riskLevel] ?? 0) - (weight[a.riskLevel] ?? 0)) || (a.scorePrediction - b.scorePrediction))
    .slice(0, 6);
});

const quickEntries = computed<QuickEntry[]>(() => [
  {
    key: 'warnings',
    title: '风险名单',
    subtitle: '查看重点学生名单，并进入单学生详情和完整报告。',
    route: '/warnings',
    tone: 'warning',
    stats: `${stats.value.highRisk} 名高风险`
  },
  {
    key: 'profiles',
    title: '院系对比',
    subtitle: '查看学院与专业层级的风险比例、注册覆盖率和主导画像。',
    route: '/profiles',
    tone: 'profile',
    stats: `${profileDistribution.value.length} 类真实画像`
  },
  {
    key: 'tasks',
    title: '干预工作台',
    subtitle: '按优先级查看重点学生，并进入干预详情。',
    route: '/tasks',
    tone: 'task',
    stats: `${Math.min(topRiskStudents.value.length, 6)} 名优先学生`
  },
  {
    key: 'analysis',
    title: '分析成果',
    subtitle: '集中查看全样本分析图与关键结论。',
    route: '/analysis-results',
    tone: 'analysis',
    stats: `${analysisData.value?.charts?.length ?? 0} 张图表`
  }
]);

const entryDetails = computed(() => {
  const entry = activeEntry.value;
  if (!entry) {
    return [];
  }
  if (entry.key === 'warnings') {
    return topRiskStudents.value.map((student) => ({
      title: `${student.studentId} · ${student.riskLevel}`,
      copy: `${student.studentId} · ${student.college} · ${student.profileCategory}${student.profileSubtype ? ` / ${student.profileSubtype}` : ''}`
    }));
  }
  if (entry.key === 'profiles') {
    return profileDistribution.value.slice(0, 6).map((item, index) => ({
      title: `${index + 1}. ${item.name}`,
      copy: `当前共有 ${item.value} 人落在该主画像中。`
    }));
  }
  if (entry.key === 'tasks') {
    return topRiskStudents.value.map((student) => ({
      title: student.studentId,
      copy: `${student.college} · ${student.major} · 综合发展 ${student.scorePrediction.toFixed(1)}`
    }));
  }
  return (analysisData.value?.storyline ?? []).slice(0, 6).map((item, index) => ({
    title: `分析结论 ${index + 1}`,
    copy: item
  }));
});

const spotlightCards = computed(() => [
  { label: '样本总量', value: stats.value.total, note: '真实学生记录' },
  { label: '高风险学生', value: stats.value.highRisk, note: '优先干预对象' },
  { label: '中风险学生', value: stats.value.mediumRisk, note: '建议持续跟踪' },
  { label: '注册覆盖', value: `${stats.value.registerRate}%`, note: `${stats.value.registered} 个已注册账号` }
]);

function chartUrl(url: string) {
  return url.startsWith('http') ? url : `http://127.0.0.1:5000${url}`;
}

function percentage(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function openEntry(entry: QuickEntry) {
  activeEntry.value = entry;
  drawerVisible.value = true;
}

function jumpToEntry(route: string) {
  drawerVisible.value = false;
  router.push(route);
}
</script>

<template>
  <section class="page-shell dashboard-page">
    <div class="hero panel-card">
      <div class="hero-main">
        <div class="hero-eyebrow">首页</div>
        <h1 class="hero-title">首页</h1>
        <p class="hero-subtitle">这里汇总了当前学生群体的整体情况。你可以先看全局概况，再进入风险名单、院系对比、干预工作台和分析成果等模块。</p>
      </div>
      <div class="hero-actions">
        <el-button type="primary" round @click="jumpToEntry('/warnings')">进入风险名单</el-button>
        <el-button round @click="jumpToEntry('/analysis-results')">查看分析成果</el-button>
      </div>
    </div>

    <div class="summary-grid">
      <article v-for="card in spotlightCards" :key="card.label" class="summary-card panel-card">
        <div class="summary-label">{{ card.label }}</div>
        <div class="summary-value">{{ card.value }}</div>
        <div class="summary-note">{{ card.note }}</div>
      </article>
    </div>

    <el-card class="panel-card entry-panel">
      <template #header>
        <div class="card-header-inner">
          <span>功能入口</span>
          <span class="minor-copy">点击卡片查看摘要，再进入对应模块</span>
        </div>
      </template>

      <div class="entry-grid">
        <button
          v-for="entry in quickEntries"
          :key="entry.key"
          class="entry-card"
          :class="entry.tone"
          @click="openEntry(entry)"
        >
          <div class="entry-top">
            <span class="entry-kicker">{{ entry.title }}</span>
            <span class="entry-stat">{{ entry.stats }}</span>
          </div>
          <div class="entry-copy">{{ entry.subtitle }}</div>
          <div class="entry-footer">点击查看摘要</div>
        </button>
      </div>
    </el-card>

    <div class="content-grid">
      <el-card class="panel-card distribution-panel">
        <template #header>
          <div class="card-header-inner">
            <span>风险分层速览</span>
            <span class="minor-copy">按真实名单汇总</span>
          </div>
        </template>
        <div class="bar-list">
          <div v-for="item in riskDistribution" :key="item.name" class="bar-row">
            <div class="bar-label">
              <span class="bar-dot" :style="{ background: riskPalette[item.name] ?? '#64748b' }"></span>
              <span>{{ item.name }}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: `${percentage(item.value, students.length)}%`, background: riskPalette[item.name] ?? '#64748b' }"></div>
            </div>
            <div class="bar-value">{{ item.value }} / {{ percentage(item.value, students.length) }}%</div>
          </div>
        </div>
      </el-card>

      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>近期优先学生</span>
            <span class="minor-copy">从这里进入单学生详情</span>
          </div>
        </template>
        <div class="student-list">
          <button
            v-for="student in topRiskStudents"
            :key="student.studentId"
            class="student-item"
            @click="router.push(`/students/${student.studentId}`)"
          >
            <div class="student-main">
              <div class="student-name">{{ student.studentId }}</div>
              <div class="student-meta">{{ student.studentId }} · {{ student.college }} · {{ student.major }}</div>
            </div>
            <div class="student-side">
              <span class="risk-chip" :style="{ color: riskPalette[student.riskLevel] ?? '#64748b', background: `${riskPalette[student.riskLevel] ?? '#64748b'}18` }">{{ student.riskLevel }}</span>
              <span class="score-chip">{{ student.scorePrediction.toFixed(1) }}</span>
            </div>
          </button>
        </div>
      </el-card>
    </div>

    <el-card class="panel-card gallery-panel">
      <template #header>
        <div class="card-header-inner">
          <span>分析成果预览</span>
          <el-button link type="primary" @click="jumpToEntry('/analysis-results')">进入完整成果页</el-button>
        </div>
      </template>
      <div v-if="analysisData?.chartStatus && !analysisData.chartStatus.ready" class="chart-alert">
        {{ analysisData.chartStatus.message || '分析图表暂未准备完成' }}
      </div>
      <div v-else class="chart-preview-grid">
        <div v-for="chart in analysisData?.charts?.slice(0, 3) ?? []" :key="chart.id" class="chart-preview-card">
          <img :src="chartUrl(chart.url)" :alt="chart.title" class="chart-preview-image" />
          <div class="chart-preview-title">{{ chart.title }}</div>
          <div class="chart-preview-copy">{{ chart.insight || chart.description }}</div>
        </div>
      </div>
    </el-card>

    <el-drawer v-model="drawerVisible" :title="activeEntry?.title || '功能摘要'" size="460px">
      <div v-if="activeEntry" class="drawer-shell">
        <div class="drawer-stat">{{ activeEntry.stats }}</div>
        <div class="drawer-copy">{{ activeEntry.subtitle }}</div>
        <div class="drawer-list">
          <div v-for="(item, index) in entryDetails" :key="`${activeEntry.key}-${index}`" class="drawer-item">
            <div class="drawer-index">{{ index + 1 }}</div>
            <div>
              <div class="drawer-item-title">{{ item.title }}</div>
              <div class="drawer-item-copy">{{ item.copy }}</div>
            </div>
          </div>
        </div>
        <el-button type="primary" style="width: 100%" @click="jumpToEntry(activeEntry.route)">进入{{ activeEntry.title }}</el-button>
      </div>
    </el-drawer>
  </section>
</template>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 18px;
  padding: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f5faff 100%);
  border: 1px solid #dbe9f6;
}

.hero-eyebrow,
.summary-label,
.summary-note,
.minor-copy,
.student-meta,
.bar-value,
.drawer-item-copy {
  font-size: 12px;
  color: #64748b;
}

.hero-title {
  margin: 0 0 12px;
  font-size: 32px;
  font-weight: 900;
  color: #0f172a;
}

.hero-subtitle {
  margin: 0;
  max-width: 760px;
  font-size: 14px;
  line-height: 1.9;
  color: #475569;
}

.hero-actions {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.summary-grid,
.entry-grid,
.content-grid,
.chart-preview-grid {
  display: grid;
  gap: 16px;
}

.summary-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.summary-card,
.entry-panel,
.gallery-panel,
.chart-preview-card {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfd 100%);
}

.summary-card {
  padding: 22px;
}

.summary-value {
  font-size: 34px;
  font-weight: 900;
  color: #0f172a;
  margin: 8px 0;
}

.card-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.entry-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.entry-card {
  padding: 18px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.entry-card:hover {
  transform: translateY(-2px);
  border-color: #93c5fd;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
}

.entry-card.warning { background: linear-gradient(180deg, #fff 0%, #fff7ed 100%); }
.entry-card.profile { background: linear-gradient(180deg, #fff 0%, #eff6ff 100%); }
.entry-card.task { background: linear-gradient(180deg, #fff 0%, #f0fdf4 100%); }
.entry-card.analysis { background: linear-gradient(180deg, #fff 0%, #eef2ff 100%); }

.entry-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.entry-kicker,
.chart-preview-title,
.student-name,
.drawer-item-title {
  font-weight: 800;
  color: #0f172a;
}

.entry-stat {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  font-size: 11px;
  font-weight: 700;
  color: #334155;
}

.entry-copy {
  line-height: 1.8;
  color: #475569;
  min-height: 74px;
}

.entry-footer {
  margin-top: 12px;
  font-size: 12px;
  font-weight: 700;
  color: #2563eb;
}

.content-grid {
  grid-template-columns: 1fr 1fr;
}

.distribution-panel {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfd 100%);
}

.bar-list,
.student-list,
.drawer-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bar-row {
  display: grid;
  grid-template-columns: 160px 1fr 90px;
  gap: 12px;
  align-items: center;
}

.bar-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #0f172a;
}

.bar-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.bar-track {
  height: 10px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
}

.student-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
}

.student-item:hover {
  background: #eff6ff;
}

.student-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.risk-chip,
.score-chip {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.score-chip {
  background: #e2e8f0;
  color: #334155;
}

.chart-alert {
  padding: 16px;
  border-radius: 14px;
  background: #fff7ed;
  color: #9a3412;
  font-size: 13px;
}

.chart-preview-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.chart-preview-card {
  padding: 12px;
  border-radius: 18px;
}

.chart-preview-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 10px;
  border: 1px solid #dbe3ea;
}

.chart-preview-copy {
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
}

.drawer-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drawer-stat {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.drawer-copy {
  line-height: 1.8;
  color: #475569;
}

.drawer-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
}

.drawer-index {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
  flex-shrink: 0;
}

@media (max-width: 1280px) {
  .entry-grid,
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-preview-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .hero,
  .content-grid,
  .entry-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    justify-content: flex-start;
  }

  .bar-row {
    grid-template-columns: 1fr;
  }
}
</style>
