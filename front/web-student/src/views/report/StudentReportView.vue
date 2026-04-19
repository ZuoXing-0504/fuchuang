<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { getStudentReport } from '../../api/student';
import type { StudentReportData } from '../../types';

const data = ref<StudentReportData>();
const formulaDrawerVisible = ref(false);
const scoreFormulaDrawerVisible = ref(false);

onMounted(async () => {
  data.value = await getStudentReport();
});

async function handlePrint() {
  await nextTick();
  window.print();
}

async function handleExportPdf() {
  await nextTick();
  window.print();
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
  if (title.includes('主表')) return '汇总结果';
  if (title.includes('进阶')) return '对比结果';
  if (title.includes('模型')) return '判断结果';
  return '数据';
}

const scoreFormulaCards = computed(() => {
  const scoreFormulaKeys = ['学习投入展示分', '行为规律展示分', '健康发展展示分', '综合发展展示分', '风险安全展示分'];
  return (data.value?.featureFormulas ?? []).filter((item) => scoreFormulaKeys.includes(item.feature));
});
</script>

<template>
  <section class="page-shell report-page">
    <div class="report-actions no-print">
      <el-button @click="scoreFormulaDrawerVisible = true">得分公式</el-button>
      <el-button @click="formulaDrawerVisible = true">查看全部计算依据</el-button>
      <el-button @click="handlePrint">打印</el-button>
      <el-button type="primary" @click="handleExportPdf">导出 PDF</el-button>
    </div>

    <div class="hero panel-card">
      <div>
        <div class="hero-eyebrow">个性化报告</div>
        <h1 class="hero-title">{{ data?.title || '个性化报告' }}</h1>
        <p class="hero-subtitle">{{ data?.summary || '这里会把当前画像、关键依据、详细数据和接下来的建议整理成一份完整报告。' }}</p>
        <div v-if="data?.reportMeta" class="hero-meta-grid">
          <div class="meta-chip">{{ data.reportMeta.studentName }}</div>
          <div class="meta-chip">{{ data.reportMeta.college }}</div>
          <div class="meta-chip">{{ data.reportMeta.major }}</div>
          <div class="meta-chip accent">{{ data.reportMeta.profileCategory }}</div>
          <div v-if="data.reportMeta.profileSubtype" class="meta-chip accent">{{ data.reportMeta.profileSubtype }}</div>
          <div class="meta-chip warning">{{ data.reportMeta.riskLevel }}</div>
          <div class="meta-chip">{{ data.reportMeta.reportDate }}</div>
        </div>
      </div>
    </div>

    <div class="score-grid">
      <article v-for="card in data?.scoreCards ?? []" :key="card.label" class="score-card panel-card">
        <div class="score-label">{{ card.label }}</div>
        <div class="score-value">{{ card.score }}</div>
      </article>
    </div>

    <el-card v-if="scoreFormulaCards.length" class="panel-card">
      <template #header>
        <div class="card-header-inner">
          <span>核心分数公式</span>
          <span class="minor-copy">快速了解几项核心分数是怎么来的</span>
        </div>
      </template>
      <div class="formula-card-grid">
        <div v-for="item in scoreFormulaCards" :key="item.feature" class="formula-card">
          <div class="detail-label">{{ item.feature }}</div>
          <div class="formula-expression">{{ item.formula }}</div>
          <div class="detail-note">{{ item.explanation }}</div>
        </div>
      </div>
    </el-card>

    <div class="overview-grid">
      <el-card class="panel-card section-card">
        <template #header>
          <div class="card-header-inner">
            <span>报告正文</span>
            <span class="minor-copy">帮助你快速看清当前状态</span>
          </div>
        </template>
        <div class="content-list">
          <div v-for="(item, index) in data?.sections ?? []" :key="index" class="content-item">
            <div class="content-index">{{ index + 1 }}</div>
            <div class="content-text">{{ item }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="panel-card section-card">
        <template #header>
          <div class="card-header-inner">
            <span>解释结论</span>
            <span class="minor-copy">哪些信息共同形成了当前判断</span>
          </div>
        </template>
        <div class="content-list compact">
          <div v-for="(item, index) in data?.evaluations ?? []" :key="index" class="content-item compact-item">
            <div class="content-index">{{ index + 1 }}</div>
            <div class="content-text">{{ item }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="detail-grid">
      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>行为明细</span>
            <span class="minor-copy">与你日常行为直接相关的细节</span>
          </div>
        </template>
        <div class="detail-list">
          <div v-for="item in data?.behaviorDetails ?? []" :key="item.label" class="detail-item">
            <div>
              <div class="detail-label">{{ item.label }}</div>
              <div class="detail-note">{{ item.note }}</div>
            </div>
            <div class="detail-value">{{ item.value }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>学业明细</span>
            <span class="minor-copy">与学业表现相关的重点信息</span>
          </div>
        </template>
        <div class="detail-list">
          <div v-for="item in data?.academicDetails ?? []" :key="item.label" class="detail-item">
            <div>
              <div class="detail-label">{{ item.label }}</div>
              <div class="detail-note">{{ item.note }}</div>
            </div>
            <div class="detail-value">{{ item.value }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>预测依据</span>
            <span class="minor-copy">哪些信息最影响当前判断</span>
          </div>
        </template>
        <div class="detail-list">
          <div v-for="item in data?.predictionEvidence ?? []" :key="item.label" class="detail-item">
            <div>
              <div class="detail-label">{{ item.label }}</div>
              <div class="detail-note">{{ item.reason }}</div>
            </div>
            <div class="detail-side">
              <span class="detail-effect">{{ item.effect }}</span>
              <div class="detail-value">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>行动建议</span>
            <span class="minor-copy">结合当前画像与详细特征生成</span>
          </div>
        </template>
        <div class="content-list compact">
          <div v-for="(item, index) in data?.suggestions ?? []" :key="index" class="content-item suggestion">
            <div class="content-index success">{{ index + 1 }}</div>
            <div class="content-text">{{ item }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="detail-grid">
      <el-card v-if="data?.profileExplanation || data?.profileHighlights?.length" class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>画像细分解释</span>
            <span class="minor-copy">帮助你理解自己在这一类学生中的位置</span>
          </div>
        </template>
        <div class="detail-note strong">{{ data?.profileExplanation }}</div>
        <div v-if="data?.profileHighlights?.length" class="step-tags section-tags">
          <span v-for="item in data.profileHighlights" :key="item" class="step-tag">{{ item }}</span>
        </div>
      </el-card>

      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>维度判读</span>
            <span class="minor-copy">从四个方面看你的当前状态</span>
          </div>
        </template>
        <div class="dimension-list">
          <div v-for="item in data?.dimensionBasis ?? []" :key="item.dimension" class="dimension-item">
            <div class="dimension-head">
              <div class="detail-label">{{ item.dimension }}</div>
              <div class="detail-effect">{{ item.judgement }}</div>
            </div>
            <div class="dimension-bars">
              <div class="dimension-bar-group">
                <div class="minor-copy">本人 {{ item.selfScore }}</div>
                <div class="bar-track"><div class="bar-fill self" :style="{ width: `${item.selfScore}%` }"></div></div>
              </div>
              <div class="dimension-bar-group">
                <div class="minor-copy">群体 {{ item.clusterScore }}</div>
                <div class="bar-track"><div class="bar-fill cluster" :style="{ width: `${item.clusterScore}%` }"></div></div>
              </div>
              <div class="dimension-bar-group">
                <div class="minor-copy">全样本 {{ item.overallScore }}</div>
                <div class="bar-track"><div class="bar-fill overall" :style="{ width: `${item.overallScore}%` }"></div></div>
              </div>
            </div>
            <div class="detail-note">{{ item.summary }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>判断过程</span>
            <span class="minor-copy">看看这份结果是怎样一步步得出的</span>
          </div>
        </template>
        <div class="step-list">
          <div v-for="(item, index) in data?.predictionSteps ?? []" :key="item.title" class="step-item">
            <div class="step-index">{{ index + 1 }}</div>
            <div class="step-body">
              <div class="detail-label">{{ item.title }}</div>
              <div class="detail-note strong">{{ item.summary }}</div>
              <div class="step-tags">
                <span v-for="tag in item.items" :key="tag" class="step-tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="feature-sections">
      <div class="tone-guide panel-card">
        <span class="tone-chip raw">原始值：直接记录下来的行为或成绩信息</span>
        <span class="tone-chip master">汇总结果：来自主表的聚合信息</span>
        <span class="tone-chip derived">对比结果：换算后更便于理解和比较</span>
        <span class="tone-chip model">判断结果：模型或规则给出的结论</span>
      </div>
      <el-card v-for="table in data?.featureTables ?? []" :key="table.title" class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span class="table-head">
              <span>{{ table.title }}</span>
              <span class="table-tone" :class="tableTone(table.title)">{{ tableToneLabel(table.title) }}</span>
            </span>
            <span class="minor-copy">{{ table.description }}</span>
          </div>
        </template>
        <el-table :data="table.rows" stripe border>
          <el-table-column prop="label" label="特征名" min-width="140" />
          <el-table-column prop="value" label="当前值" min-width="120" />
          <el-table-column prop="source" label="来源" min-width="150" />
          <el-table-column label="参与判断" width="100">
            <template #default="{ row }">
              <el-tag :type="row.usedInPrediction ? 'danger' : 'info'">
                {{ row.usedInPrediction ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="说明" min-width="240" />
        </el-table>
      </el-card>
    </div>

    <el-drawer v-model="formulaDrawerVisible" title="全部计算依据" size="52%">
      <div class="formula-copy">这里展示当前报告中可追溯的计算规则和判断依据。</div>
      <div class="formula-list">
        <div v-for="item in data?.featureFormulas ?? []" :key="item.feature" class="formula-item">
          <div class="formula-head">
            <div class="detail-label">{{ item.feature }}</div>
            <div class="detail-effect">{{ item.source }}</div>
          </div>
          <div class="detail-note strong">{{ item.formula }}</div>
          <div class="detail-note">{{ item.explanation }}</div>
        </div>
      </div>
    </el-drawer>

    <el-drawer v-model="scoreFormulaDrawerVisible" title="得分公式" size="46%">
      <div class="formula-copy">这里集中展示报告里最常用的几项核心分数，方便快速理解这些分数如何由原始特征换算得到。</div>
      <div class="formula-list">
        <div v-for="item in scoreFormulaCards" :key="item.feature" class="formula-item">
          <div class="formula-head">
            <div class="detail-label">{{ item.feature }}</div>
            <div class="detail-effect">{{ item.source }}</div>
          </div>
          <div class="detail-note strong">{{ item.formula }}</div>
          <div class="detail-note">{{ item.explanation }}</div>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<style scoped>
.report-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.report-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.hero {
  padding: 24px;
  background: linear-gradient(135deg, #1677ff, #4ea4ff 55%, #7dc0ff);
  color: #fff;
}

.hero-eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
  opacity: 0.88;
}

.hero-title {
  margin: 0 0 10px;
  font-size: 30px;
  font-weight: 900;
}

.hero-subtitle {
  margin: 0;
  font-size: 14px;
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.9);
}

.hero-meta-grid {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.meta-chip {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.meta-chip.accent {
  background: rgba(255, 255, 255, 0.26);
}

.meta-chip.warning {
  background: rgba(255, 244, 230, 0.28);
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.score-card {
  padding: 18px 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
}

.score-label {
  font-size: 12px;
  color: #64748b;
}

.score-value {
  margin-top: 10px;
  font-size: 38px;
  font-weight: 900;
  color: #0f172a;
}

.formula-card-grid,
.overview-grid,
.detail-grid {
  display: grid;
  gap: 18px;
}

.formula-card-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.overview-grid {
  grid-template-columns: 1.15fr 0.85fr;
}

.detail-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.formula-card,
.content-item,
.detail-item,
.dimension-item,
.step-item {
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fbff;
}

.card-header-inner,
.formula-head,
.dimension-head,
.detail-side {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.minor-copy,
.detail-note,
.formula-copy {
  font-size: 12px;
  line-height: 1.8;
  color: #64748b;
}

.detail-label,
.table-head,
.content-text,
.formula-expression {
  color: #0f172a;
}

.detail-label {
  font-size: 13px;
  font-weight: 800;
}

.formula-expression {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.8;
  font-weight: 700;
}

.content-list,
.detail-list,
.dimension-list,
.step-list,
.formula-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-item {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 12px;
  align-items: start;
}

.content-item.compact-item,
.content-item.suggestion,
.step-item {
  background: #f7fbff;
}

.content-index,
.step-index {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #1677ff;
  color: #fff;
  font-weight: 800;
}

.content-index.success {
  background: #18a058;
}

.content-text {
  font-size: 14px;
  line-height: 1.9;
}

.section-card {
  min-height: 100%;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.detail-value {
  font-size: 16px;
  font-weight: 800;
  color: #1677ff;
  white-space: nowrap;
}

.detail-effect,
.step-tag,
.table-tone,
.tone-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.detail-effect,
.table-tone.master,
.tone-chip.master {
  background: #eaf4ff;
  color: #1677ff;
}

.tone-guide,
.section-tags,
.step-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.table-tone.raw,
.tone-chip.raw {
  background: #f1f5f9;
  color: #475569;
}

.table-tone.derived,
.tone-chip.derived {
  background: #edf7ed;
  color: #15803d;
}

.table-tone.model,
.tone-chip.model {
  background: #fff4e6;
  color: #c2410c;
}

.bar-track {
  height: 10px;
  border-radius: 999px;
  background: #e7eef8;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
}

.bar-fill.self { background: #1677ff; }
.bar-fill.cluster { background: #69b1ff; }
.bar-fill.overall { background: #18a058; }

.dimension-bars,
.step-body,
.dimension-bar-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-sections {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

@media (max-width: 1080px) {
  .score-grid,
  .formula-card-grid,
  .overview-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
