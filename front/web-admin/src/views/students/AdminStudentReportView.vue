<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getStudentDetail } from '../../api/admin';
import type { StudentDetail } from '../../types';

const route = useRoute();
const router = useRouter();
const detail = ref<StudentDetail>();
const formulaDrawerVisible = ref(false);
const loading = ref(true);
const loadError = ref('');

async function loadDetail(studentId: string) {
  if (!studentId) {
    return;
  }
  loading.value = true;
  loadError.value = '';
  try {
    detail.value = await getStudentDetail(studentId);
  } catch (error) {
    detail.value = undefined;
    loadError.value = error instanceof Error ? error.message : '报告加载失败';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadDetail(String(route.params.id ?? ''));
});

watch(() => route.params.id, async (studentId) => {
  await loadDetail(String(studentId ?? ''));
});

const reportMeta = ref<Array<{ label: string; value: string }>>([]);
const scoreFormulaCards = ref<Array<{ title: string; formula: string; explanation: string; source: string }>>([]);
const profileHighlights = ref<string[]>([]);
watch(detail, (value) => {
  if (!value) {
    reportMeta.value = [];
    scoreFormulaCards.value = [];
    profileHighlights.value = [];
    return;
  }
  reportMeta.value = [
    { label: '学号', value: value.studentId },
    { label: '姓名', value: value.name },
    { label: '学院', value: value.college || '未提供' },
    { label: '专业', value: value.major || '未提供' },
    { label: '表现档次', value: value.performanceLevel || '未提供' },
    { label: '健康档次', value: value.healthLevel || '未提供' },
    { label: '风险等级', value: value.riskLevel || '未提供' },
    { label: '画像类别', value: value.profileCategory || '未提供' },
    { label: '账号状态', value: value.registeredUsername ? `${value.registrationStatus}（${value.registeredUsername}）` : (value.registrationStatus || '未注册') }
  ];
  const scoreFormulaKeys = ['学习投入展示分', '行为规律展示分', '健康发展展示分', '综合发展展示分', '风险安全展示分'];
  scoreFormulaCards.value = (value.featureFormulas ?? [])
    .filter((item) => scoreFormulaKeys.includes(item.feature))
    .map((item) => ({
      title: item.feature,
      formula: item.formula,
      explanation: item.explanation,
      source: item.source
    }));
  profileHighlights.value = value.profileHighlights?.length
    ? value.profileHighlights
    : [
        value.profileSubtype || value.profileCategory,
        ...(value.secondaryTags ?? []).slice(0, 3),
        ...(value.dimensionBasis ?? []).slice(0, 2).map((item) => `${item.dimension}：${item.judgement}`)
      ].filter(Boolean);
}, { immediate: true });

function featureCount() {
  return (detail.value?.featureTables ?? []).reduce((sum, item) => sum + item.rows.length, 0);
}

function tableTone(title: string) {
  if (title.includes('原始')) return 'raw';
  if (title.includes('主表')) return 'master';
  if (title.includes('进阶')) return 'derived';
  if (title.includes('模型')) return 'model';
  return 'default';
}

function tableToneLabel(title: string) {
  if (title.includes('原始')) return '原始值';
  if (title.includes('主表')) return '展示主表';
  if (title.includes('进阶')) return '展示分/对比';
  if (title.includes('模型')) return '模型/规则';
  return '数据';
}

async function handlePrint() {
  await nextTick();
  window.print();
}

async function handleExportPdf() {
  await nextTick();
  window.print();
}

function backToDetail() {
  if (!detail.value?.studentId) {
    return;
  }
  router.push(`/students/${detail.value.studentId}`);
}
</script>

<template>
  <section v-if="detail" class="report-shell">
    <div class="report-actions no-print">
      <el-button @click="backToDetail">返回学生详情</el-button>
      <el-button @click="formulaDrawerVisible = true">查看特征计算依据</el-button>
      <el-button @click="handlePrint">打印</el-button>
      <el-button type="primary" @click="handleExportPdf">导出 PDF</el-button>
    </div>

    <article class="report-paper">
      <header class="report-hero">
        <div class="hero-grid"></div>
        <div class="hero-copy">
          <div class="hero-eyebrow">Personal Student Report</div>
          <h1 class="hero-title">{{ detail.reportTitle || '个性化成长评价报告' }}</h1>
          <p class="hero-subtitle">{{ detail.reportSummary }}</p>
          <div class="hero-tags">
            <span class="hero-tag">{{ detail.studentId }}</span>
            <span class="hero-tag">{{ detail.profileCategory }}</span>
            <span v-if="detail.profileSubtype" class="hero-tag">{{ detail.profileSubtype }}</span>
            <span class="hero-tag risk">{{ detail.riskLevel }}</span>
            <span class="hero-tag info">综合预测 {{ detail.scorePredictionLabel || '未提供' }}</span>
            <span class="hero-tag neutral">特征总数 {{ featureCount() }}</span>
          </div>
        </div>
      </header>

      <section class="section-block">
        <div class="section-header">
          <h2>一、学生基本信息</h2>
          <p>报告包含学生个人信息、可用特征、判断依据、阶段分析与后续建议。</p>
        </div>
        <div class="info-grid">
          <div v-for="item in reportMeta" :key="item.label" class="info-card">
            <div class="info-label">{{ item.label }}</div>
            <div class="info-value">{{ item.value }}</div>
          </div>
        </div>
      </section>

      <section class="section-block">
        <div class="section-header">
          <h2>二、画像细分解释</h2>
          <p>在主画像之外，进一步说明当前学生更接近哪一种细分类型，以及形成这一细分结果的关键信号。</p>
        </div>
        <div class="dual-grid">
          <div class="panel">
            <h3>细分解释</h3>
            <div class="evidence-note">{{ detail.profileExplanation || '系统会结合学习投入、行为规律、图书馆使用、夜间活跃和风险敏感度，对主画像继续细分。' }}</div>
          </div>
          <div class="panel">
            <h3>细分亮点</h3>
            <div class="tag-list" v-if="profileHighlights.length">
              <span v-for="item in profileHighlights" :key="item" class="tiny-tag">{{ item }}</span>
            </div>
            <div v-else class="evidence-note">当前学生暂无单独亮点标签，系统已回退为主画像、二级标签和维度判读结果。</div>
          </div>
        </div>
      </section>

      <section v-if="scoreFormulaCards.length" class="section-block">
        <div class="section-header">
          <h2>三、核心分数公式</h2>
          <p>把最常用的几项核心分数单独列出来，方便快速理解这些分数是如何得到的。</p>
        </div>
        <div class="formula-card-grid">
          <div v-for="item in scoreFormulaCards" :key="item.title" class="formula-card">
            <div class="formula-card-title">{{ item.title }}</div>
            <div class="formula-card-formula">{{ item.formula }}</div>
            <div class="formula-card-copy">{{ item.explanation }}</div>
            <div class="formula-card-source">{{ item.source }}</div>
          </div>
        </div>
      </section>

      <section class="section-block">
        <div class="section-header">
          <h2>四、当前情况分析与建议</h2>
          <p>先给出当前判断，再列出建议，便于从结果直接过渡到行动。</p>
        </div>
        <div class="dual-grid">
          <div class="panel">
            <h3>当前情况分析</h3>
            <ol class="ordered-list">
              <li v-for="(item, index) in detail.reportSections ?? []" :key="`section-${index}`">{{ item }}</li>
            </ol>
          </div>
          <div class="panel">
            <h3>后续行动建议</h3>
            <ol class="ordered-list success">
              <li v-for="(item, index) in detail.interventions ?? []" :key="`intervention-${index}`">{{ item }}</li>
            </ol>
          </div>
        </div>
      </section>

      <section class="section-block">
        <div class="section-header">
          <h2>五、预测依据与判断链路</h2>
          <p>展示系统使用了哪些主要特征，以及这些特征是如何一步步形成当前结论的。</p>
        </div>
        <div class="dual-grid">
          <div class="panel">
            <h3>预测依据</h3>
            <div class="evidence-list">
              <div v-for="item in detail.predictionEvidence ?? []" :key="item.label" class="evidence-item">
                <div>
                  <div class="evidence-label">{{ item.label }}</div>
                  <div class="evidence-note">{{ item.reason }}</div>
                </div>
                <div class="evidence-side">
                  <span class="evidence-effect">{{ item.effect }}</span>
                  <span class="evidence-value">{{ item.value }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="panel">
            <h3>预测链路</h3>
            <div class="step-list">
              <div v-for="(item, index) in detail.predictionSteps ?? []" :key="item.title" class="step-item">
                <div class="step-index">{{ index + 1 }}</div>
                <div class="step-body">
                  <div class="evidence-label">{{ item.title }}</div>
                  <div class="evidence-note">{{ item.summary }}</div>
                  <div class="tag-list">
                    <span v-for="entry in item.items" :key="entry" class="tiny-tag">{{ entry }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-block">
        <div class="section-header">
          <h2>六、维度判读</h2>
          <p>从学习投入、行为规律、健康发展、综合发展四个维度解释当前状态。</p>
        </div>
        <div class="dimension-list">
          <div v-for="item in detail.dimensionBasis ?? []" :key="item.dimension" class="dimension-card">
            <div class="dimension-head">
              <div>
                <div class="evidence-label">{{ item.dimension }}</div>
                <div class="evidence-note">{{ item.summary }}</div>
              </div>
              <span class="judge-chip">{{ item.judgement }}</span>
            </div>
            <div class="bar-block">
              <div class="bar-row">
                <span>本人 {{ item.selfScore }}</span>
                <div class="bar-track"><div class="bar-fill self" :style="{ width: `${item.selfScore}%` }"></div></div>
              </div>
              <div class="bar-row">
                <span>群体 {{ item.clusterScore }}</span>
                <div class="bar-track"><div class="bar-fill cluster" :style="{ width: `${item.clusterScore}%` }"></div></div>
              </div>
              <div class="bar-row">
                <span>全样本 {{ item.overallScore }}</span>
                <div class="bar-track"><div class="bar-fill overall" :style="{ width: `${item.overallScore}%` }"></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-block">
        <div class="section-header">
          <h2>七、全部特征数据总表</h2>
          <p>系统会把原始值、展示分、模型输出和规则结论分开列出，避免不同口径混淆。</p>
        </div>
        <div class="tone-guide">
          <span class="tone-chip raw">原始值：直接来自行为、成绩或训练特征表</span>
          <span class="tone-chip master">展示主表：来自 analysis_master.csv 聚合结果</span>
          <span class="tone-chip derived">展示分/对比：用于页面呈现的标准化结果</span>
          <span class="tone-chip model">模型/规则：模型输出或规则生成标签</span>
        </div>
        <div v-for="table in detail.featureTables ?? []" :key="table.title" class="table-section">
          <div class="table-title-row">
            <div>
              <div class="table-title-top">
                <h3>{{ table.title }}</h3>
                <span class="table-tone" :class="tableTone(table.title)">{{ tableToneLabel(table.title) }}</span>
              </div>
              <p>{{ table.description }}</p>
            </div>
            <div class="table-count">{{ table.rows.length }} 项</div>
          </div>
          <el-table :data="table.rows" stripe border class="feature-table">
            <el-table-column prop="label" label="特征名" min-width="150" />
            <el-table-column prop="value" label="当前值" min-width="120" />
            <el-table-column prop="source" label="数据来源" min-width="150" />
            <el-table-column label="参与预测" width="100">
              <template #default="{ row }">
                <el-tag :type="row.usedInPrediction ? 'danger' : 'info'">
                  {{ row.usedInPrediction ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" min-width="260" />
          </el-table>
        </div>
      </section>
    </article>

    <el-drawer v-model="formulaDrawerVisible" title="特征计算依据" size="52%">
      <div class="formula-copy">这里仅展示当前代码和分析模块中可以真实追溯到的计算规则，不补写无法验证的公式。</div>
      <div class="formula-list">
        <div v-for="item in detail.featureFormulas ?? []" :key="item.feature" class="formula-item">
          <div class="formula-head">
            <div class="formula-title">{{ item.feature }}</div>
            <div class="formula-source">{{ item.source }}</div>
          </div>
          <div class="formula-block">
            <div class="formula-label">计算规则</div>
            <div class="formula-text">{{ item.formula }}</div>
          </div>
          <div class="formula-block">
            <div class="formula-label">解释说明</div>
            <div class="formula-text">{{ item.explanation }}</div>
          </div>
        </div>
      </div>
    </el-drawer>
  </section>

  <el-empty v-else-if="loading" description="正在生成个性化报告..." />
  <el-empty v-else :description="loadError || '未获取到报告数据'" />
</template>

<style scoped>
.report-shell {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.report-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.report-paper {
  background: #ffffff;
  border-radius: 28px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
  overflow: hidden;
}

.report-hero {
  position: relative;
  padding: 34px 36px;
  background: linear-gradient(135deg, #1677ff, #4ea4ff 55%, #7dc0ff);
  color: #f8fafc;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
  background-size: 28px 28px;
}

.hero-copy {
  position: relative;
  z-index: 1;
}

.hero-eyebrow {
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #93c5fd;
}

.hero-title {
  margin: 12px 0;
  font-size: 34px;
  font-weight: 900;
}

.hero-subtitle {
  margin: 0;
  max-width: 880px;
  line-height: 1.9;
  color: rgba(248, 250, 252, 0.84);
}

.hero-tags {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-tag {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 13px;
}

.hero-tag.risk {
  background: rgba(248, 113, 113, 0.16);
}

.hero-tag.info {
  background: rgba(96, 165, 250, 0.16);
}

.hero-tag.neutral {
  background: rgba(226, 232, 240, 0.14);
}

.section-block {
  padding: 26px 30px 12px;
}

.section-header {
  margin-bottom: 16px;
}

.section-header h2 {
  margin: 0 0 8px;
  font-size: 22px;
  color: #0f172a;
}

.section-header p {
  margin: 0;
  color: #64748b;
  line-height: 1.8;
}

.info-grid,
.dual-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.info-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.info-card,
.panel,
.dimension-card {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 16px 18px;
  background: #fff;
}

.info-label,
.formula-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
}

.info-value {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.panel h3,
.table-title-row h3 {
  margin: 0 0 12px;
  font-size: 18px;
  color: #0f172a;
}

.ordered-list {
  margin: 0;
  padding-left: 20px;
  line-height: 1.9;
  color: #1e293b;
}

.ordered-list.success li::marker {
  color: #16a34a;
}

.evidence-list,
.step-list,
.formula-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.evidence-item,
.step-item,
.formula-item {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.evidence-label,
.formula-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.evidence-note,
.formula-text {
  color: #475569;
  line-height: 1.7;
}

.evidence-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  min-width: 120px;
}

.evidence-effect,
.judge-chip,
.formula-source,
.table-count {
  font-size: 12px;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
  padding: 4px 10px;
  border-radius: 999px;
}

.evidence-value {
  font-weight: 700;
  color: #0f172a;
}

.step-index {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: #fff;
  font-weight: 800;
  flex-shrink: 0;
}

.step-body {
  flex: 1;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.tiny-tag {
  padding: 6px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
}

.dimension-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dimension-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.bar-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bar-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #475569;
}

.bar-track {
  height: 9px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: inherit;
}

.bar-fill.self {
  background: linear-gradient(90deg, #0f766e, #22c55e);
}

.bar-fill.cluster {
  background: linear-gradient(90deg, #2563eb, #60a5fa);
}

.bar-fill.overall {
  background: linear-gradient(90deg, #d97706, #f59e0b);
}

.table-section {
  margin-bottom: 18px;
}

.tone-guide {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.tone-chip {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.tone-chip.raw {
  background: rgba(15, 23, 42, 0.08);
  color: #334155;
}

.tone-chip.master {
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}

.tone-chip.derived {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.tone-chip.model {
  background: rgba(245, 158, 11, 0.14);
  color: #b45309;
}

.table-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.table-title-row p {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

.table-title-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-tone {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.table-tone.raw {
  background: rgba(15, 23, 42, 0.08);
  color: #334155;
}

.table-tone.master {
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}

.table-tone.derived {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.table-tone.model {
  background: rgba(245, 158, 11, 0.14);
  color: #b45309;
}

.feature-table {
  width: 100%;
}

.formula-copy {
  margin-bottom: 16px;
  color: #475569;
  line-height: 1.8;
}

.formula-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.formula-block + .formula-block {
  margin-top: 10px;
}

@media (max-width: 1080px) {
  .info-grid,
  .dual-grid {
    grid-template-columns: 1fr;
  }
}

@media print {
  .no-print,
  :deep(.el-drawer__wrapper) {
    display: none !important;
  }

  .report-shell {
    background: #fff;
  }

  .report-paper {
    box-shadow: none;
    border-radius: 0;
  }

  .section-block {
    break-inside: avoid;
  }
}
</style>


