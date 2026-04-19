<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getStudentDetail, getWarnings } from '../../api/admin';
import type { StudentDetail, StudentMetrics } from '../../types';

const router = useRouter();
const rows = ref<StudentMetrics[]>([]);
const loading = ref(true);
const keyword = ref('');
const selectedStudentId = ref('');
const detail = ref<StudentDetail>();
const detailLoading = ref(false);
const detailDrawerVisible = ref(false);
const detailError = ref('');
const activeQuickFilter = ref<'all' | 'high' | 'medium' | 'registered'>('all');

const riskWeight: Record<string, number> = {
  高风险: 3,
  中风险: 2,
  低风险: 1
};

onMounted(async () => {
  loading.value = true;
  try {
    rows.value = await getWarnings();
  } finally {
    loading.value = false;
  }
});

watch(selectedStudentId, async (studentId) => {
  if (!studentId) {
    detail.value = undefined;
    detailError.value = '';
    return;
  }
  detailLoading.value = true;
  detailError.value = '';
  try {
    detail.value = await getStudentDetail(studentId);
  } catch (error) {
    detail.value = undefined;
    detailError.value = error instanceof Error ? error.message : '学生详情加载失败';
    ElMessage.error(detailError.value);
  } finally {
    detailLoading.value = false;
  }
});

const queue = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  return [...rows.value]
    .filter((item) => {
      if (activeQuickFilter.value === 'high' && item.riskLevel !== '高风险') return false;
      if (activeQuickFilter.value === 'medium' && item.riskLevel !== '中风险') return false;
      if (activeQuickFilter.value === 'registered' && item.registrationStatus !== '已注册') return false;
      return !q || item.studentId.toLowerCase().includes(q) || item.name.toLowerCase().includes(q) || item.college.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const riskGap = (riskWeight[b.riskLevel] ?? 0) - (riskWeight[a.riskLevel] ?? 0);
      if (riskGap !== 0) {
        return riskGap;
      }
      return a.scorePrediction - b.scorePrediction;
    })
    .slice(0, 20);
});

const summaryCards = computed(() => {
  const highRisk = rows.value.filter((item) => item.riskLevel === '高风险').length;
  const mediumRisk = rows.value.filter((item) => item.riskLevel === '中风险').length;
  const registered = rows.value.filter((item) => item.registrationStatus === '已注册').length;
  return [
    { key: 'high', label: '高风险待关注', value: highRisk, note: '点击查看高风险名单' },
    { key: 'medium', label: '中风险待跟踪', value: mediumRisk, note: '点击查看跟踪名单' },
    { key: 'registered', label: '已注册学生', value: registered, note: '点击查看已关联账号' },
    { key: 'all', label: '当前队列', value: queue.value.length, note: '显示当前筛选下的前 20 人' }
  ];
});

function categoryFromText(text: string) {
  if (text.includes('学习') || text.includes('图书馆') || text.includes('成绩')) return '学业';
  if (text.includes('夜间') || text.includes('作息') || text.includes('睡眠')) return '作息';
  if (text.includes('健康') || text.includes('运动') || text.includes('身体')) return '健康';
  if (text.includes('社交') || text.includes('同伴') || text.includes('人际')) return '社交';
  return '综合';
}

const suggestionBuckets = computed(() => {
  const counters = new Map<string, number>();
  for (const item of detail.value?.interventions ?? []) {
    const category = categoryFromText(item);
    counters.set(category, (counters.get(category) ?? 0) + 1);
  }
  return Array.from(counters.entries()).map(([label, value]) => ({ label, value }));
});

function openDetail(studentId: string) {
  selectedStudentId.value = studentId;
  detailDrawerVisible.value = true;
}

function applyQuickFilter(filter: 'all' | 'high' | 'medium' | 'registered') {
  activeQuickFilter.value = filter;
}
</script>

<template>
  <section class="page-shell workbench-page">
    <div class="hero panel-card">
      <div class="hero-grid"></div>
      <div class="hero-copy">
        <div class="hero-eyebrow">Intervention Console</div>
        <h1 class="hero-title">干预工作台</h1>
        <p class="hero-subtitle">按优先级查看重点学生队列，并进入单学生干预详情、风险解释和完整报告。</p>
      </div>
      <div class="hero-side">
        <div class="hero-chip">重点学生</div>
        <div class="hero-chip">抽屉详情</div>
        <div class="hero-chip">完整报告</div>
      </div>
    </div>

    <div class="summary-grid">
      <button
        v-for="card in summaryCards"
        :key="card.label"
        type="button"
        class="summary-card summary-button panel-card"
        :class="{ active: activeQuickFilter === card.key }"
        @click="applyQuickFilter(card.key as 'all' | 'high' | 'medium' | 'registered')"
      >
        <div class="summary-label">{{ card.label }}</div>
        <div class="summary-value">{{ card.value }}</div>
        <div class="summary-note">{{ card.note }}</div>
      </button>
    </div>

    <el-card class="panel-card queue-card">
      <template #header>
        <div class="card-header-inner">
          <span>干预队列</span>
          <span class="minor-copy">
            {{ activeQuickFilter === 'high' ? '当前查看高风险名单' : activeQuickFilter === 'medium' ? '当前查看中风险跟踪名单' : activeQuickFilter === 'registered' ? '当前查看已注册学生名单' : '点击条目打开干预详情抽屉' }}
          </span>
        </div>
      </template>

      <el-input v-model="keyword" placeholder="按学号、姓名或学院过滤" clearable class="search-box" />

      <div v-if="loading" class="loading-box">正在加载真实名单...</div>
      <div v-else class="queue-grid">
        <button
          v-for="item in queue"
          :key="item.studentId"
          class="queue-item"
          @click="openDetail(item.studentId)"
        >
          <div class="queue-main">
            <div class="queue-name">{{ item.name || item.studentId }}</div>
            <div class="queue-meta">{{ item.studentId }} · {{ item.college }} · {{ item.profileCategory }}</div>
          </div>
          <div class="queue-side">
            <span class="risk-chip" :class="item.riskLevel">{{ item.riskLevel }}</span>
            <span class="score-chip">{{ item.scorePrediction.toFixed(1) }}</span>
          </div>
        </button>
      </div>
    </el-card>

    <el-drawer v-model="detailDrawerVisible" title="干预详情" size="560px" :destroy-on-close="false">
      <div v-if="detailLoading" class="loading-box">正在加载学生详情...</div>
      <div v-else-if="detailError" class="loading-box">{{ detailError }}</div>
      <div v-else-if="detail" class="drawer-shell">
        <div class="detail-hero dark-panel">
          <div>
            <div class="detail-name">{{ detail.name }}</div>
            <div class="detail-meta">{{ detail.studentId }} · {{ detail.college }} · {{ detail.major }}</div>
          </div>
          <div class="detail-tags">
            <span class="hero-tag risk">{{ detail.riskLevel }}</span>
            <span class="hero-tag">{{ detail.profileCategory }}</span>
            <span class="hero-tag info">{{ detail.registeredUsername ? `已注册 ${detail.registeredUsername}` : '未注册' }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">综合结论</div>
          <div class="summary-box">{{ detail.reportSummary || '当前学生暂无可展示的结论摘要。' }}</div>
        </div>

        <div class="detail-section">
          <div class="section-title">风险解释</div>
          <div class="factor-list">
            <div v-for="(factor, index) in detail.factors" :key="factor.feature" class="factor-item">
              <div class="factor-index">{{ index + 1 }}</div>
              <div>
                <div class="factor-title">{{ factor.feature }}</div>
                <div class="factor-copy">{{ factor.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">建议分类</div>
          <div class="bucket-list">
            <div v-for="bucket in suggestionBuckets" :key="bucket.label" class="bucket-item">
              <div class="bucket-label">{{ bucket.label }}</div>
              <div class="bucket-value">{{ bucket.value }}</div>
            </div>
          </div>
        </div>

        <el-collapse>
          <el-collapse-item title="查看行动建议" name="advice">
            <div class="advice-list">
              <div v-for="(item, index) in detail.interventions" :key="index" class="advice-item">
                <div class="advice-index">{{ index + 1 }}</div>
                <div class="advice-copy">{{ item }}</div>
              </div>
            </div>
          </el-collapse-item>
          <el-collapse-item title="查看群体对比" name="compare">
            <div class="compare-list">
              <div v-for="metric in detail.compareMetrics ?? []" :key="metric.label" class="compare-row">
                <div class="compare-label">{{ metric.label }}</div>
                <div class="compare-bars">
                  <div class="compare-bar-group">
                    <div class="compare-meta">本人 {{ metric.selfScore }}</div>
                    <div class="compare-track"><div class="compare-fill self" :style="{ width: `${metric.selfScore}%` }"></div></div>
                  </div>
                  <div class="compare-bar-group">
                    <div class="compare-meta">群体 {{ metric.clusterScore }}</div>
                    <div class="compare-track"><div class="compare-fill cluster" :style="{ width: `${metric.clusterScore}%` }"></div></div>
                  </div>
                  <div class="compare-bar-group">
                    <div class="compare-meta">全样本 {{ metric.overallScore }}</div>
                    <div class="compare-track"><div class="compare-fill overall" :style="{ width: `${metric.overallScore}%` }"></div></div>
                  </div>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>

        <div class="drawer-actions">
          <el-button type="primary" style="width:100%" @click="router.push(`/students/${detail.studentId}`); detailDrawerVisible = false">单学生详情</el-button>
          <el-button style="width:100%" @click="router.push(`/students/${detail.studentId}/report`); detailDrawerVisible = false">完整报告</el-button>
        </div>
      </div>
      <div v-else class="loading-box">请选择一名学生查看干预详情。</div>
    </el-drawer>
  </section>
</template>

<style scoped>
.workbench-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 18px;
  padding: 28px;
  background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.2), transparent 38%), linear-gradient(135deg, #0f172a, #10283d 60%, #1f5136);
  color: #f8fafc;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.25));
}

.hero-copy,
.hero-side {
  position: relative;
  z-index: 1;
}

.hero-eyebrow {
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #93c5fd;
  margin-bottom: 10px;
}

.hero-title {
  margin: 0 0 12px;
  font-size: 34px;
  font-weight: 900;
}

.hero-subtitle {
  margin: 0;
  max-width: 760px;
  font-size: 14px;
  line-height: 1.9;
  color: rgba(248, 250, 252, 0.82);
}

.hero-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.hero-chip,
.hero-tag {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.hero-chip {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

.hero-tag {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

.hero-tag.risk {
  background: rgba(239, 68, 68, 0.16);
  color: #fecaca;
}

.hero-tag.info {
  background: rgba(59, 130, 246, 0.16);
  color: #bfdbfe;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.summary-card {
  padding: 22px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfd 100%);
}

.summary-button {
  border: none;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.summary-button.active {
  border: 1px solid rgba(59, 130, 246, 0.22);
  box-shadow: 0 18px 40px rgba(37, 99, 235, 0.14);
  transform: translateY(-1px);
}

.summary-label,
.summary-note,
.minor-copy,
.compare-meta {
  font-size: 12px;
  color: #64748b;
}

.summary-value {
  font-size: 30px;
  font-weight: 900;
  color: #0f172a;
  margin: 8px 0;
}

.queue-card {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfd 100%);
}

.card-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-box {
  margin-bottom: 14px;
}

.queue-grid,
.factor-list,
.advice-list,
.bucket-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.queue-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
  cursor: pointer;
  text-align: left;
}

.queue-item:hover {
  border-color: #38bdf8;
  background: #eff6ff;
}

.queue-name,
.detail-name,
.factor-title,
.section-title {
  font-weight: 800;
  color: #0f172a;
}

.queue-meta,
.detail-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.queue-side,
.detail-tags {
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

.risk-chip.高风险 { background: #fef2f2; color: #dc2626; }
.risk-chip.中风险 { background: #fff7ed; color: #d97706; }
.risk-chip.低风险 { background: #ecfdf5; color: #059669; }

.score-chip {
  background: #e2e8f0;
  color: #334155;
}

.loading-box {
  padding: 18px;
  border-radius: 14px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
}

.drawer-shell,
.compare-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-hero {
  padding: 18px;
  border-radius: 18px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.dark-panel {
  background: linear-gradient(135deg, #0f172a, #16263a);
  color: #f8fafc;
}

.detail-name {
  color: #f8fafc;
  font-size: 26px;
}

.detail-meta {
  color: rgba(248, 250, 252, 0.72);
}

.detail-section {
  padding: 16px;
  border-radius: 16px;
  background: #f8fafc;
}

.summary-box {
  margin-top: 10px;
  line-height: 1.8;
  color: #475569;
}

.factor-item,
.advice-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 14px;
  background: #fff;
}

.factor-index,
.advice-index {
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

.factor-copy,
.advice-copy {
  line-height: 1.8;
  color: #475569;
}

.bucket-list {
  flex-direction: row;
  flex-wrap: wrap;
}

.bucket-item {
  min-width: 120px;
  padding: 14px;
  border-radius: 14px;
  background: #fff;
}

.bucket-label {
  font-size: 12px;
  color: #64748b;
}

.bucket-value {
  margin-top: 8px;
  font-size: 26px;
  font-weight: 900;
  color: #0f172a;
}

.compare-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 14px;
  align-items: start;
}

.compare-label {
  font-weight: 700;
  color: #0f172a;
}

.compare-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.compare-track {
  height: 10px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}

.compare-fill {
  height: 100%;
  border-radius: 999px;
}

.compare-fill.self { background: #34d399; }
.compare-fill.cluster { background: #60a5fa; }
.compare-fill.overall { background: #f59e0b; }

.drawer-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media (max-width: 1200px) {
  .summary-grid,
  .hero {
    grid-template-columns: 1fr;
  }

  .hero-side,
  .detail-tags,
  .queue-side {
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .compare-row,
  .detail-hero {
    grid-template-columns: 1fr;
    flex-direction: column;
  }
}
</style>

