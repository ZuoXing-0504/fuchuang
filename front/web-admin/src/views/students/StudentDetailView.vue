<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getStudentDetail } from '../../api/admin';
import type { StudentDetail } from '../../types';
import { getProfileCategoryExplanation, getProfileSubtypeExplanation } from '../../utils/profileSubtype';

type DetailPanelKey = 'profile' | 'evidence' | 'metrics' | 'risk' | 'pipeline';

const route = useRoute();
const router = useRouter();
const detail = ref<StudentDetail>();
const searchStudentId = ref(String(route.params.id ?? ''));
const panelDrawerVisible = ref(false);
const activePanel = ref<DetailPanelKey>('profile');
const formulaDrawerVisible = ref(false);
const profileExplainVisible = ref(false);

async function loadDetail(studentId: string) {
  if (!studentId) {
    return;
  }
  detail.value = await getStudentDetail(studentId);
}

onMounted(async () => {
  await loadDetail(String(route.params.id ?? ''));
});

watch(() => route.params.id, async (studentId) => {
  searchStudentId.value = String(studentId ?? '');
  await loadDetail(String(studentId ?? ''));
});

const baseInfo = computed(() => {
  if (!detail.value) {
    return [];
  }
  return [
    { label: '学号', value: detail.value.studentId },
    { label: '学院', value: detail.value.college || '未提供' },
    { label: '专业', value: detail.value.major || '未提供' },
    { label: '表现档次', value: detail.value.performanceLevel || '未提供' },
    { label: '健康档次', value: detail.value.healthLevel || '未提供' },
    { label: '账号状态', value: detail.value.registeredUsername ? `${detail.value.registrationStatus}（${detail.value.registeredUsername}）` : (detail.value.registrationStatus || '未注册') }
  ];
});

const insightCards = computed(() => {
  if (!detail.value) {
    return [];
  }
  return [
    {
      key: 'profile' as DetailPanelKey,
      title: '画像解释',
      note: detail.value.profileSubtype || detail.value.profileCategory,
      summary: detail.value.profileExplanation || '查看主画像和细分画像的解释说明。'
    },
    {
      key: 'evidence' as DetailPanelKey,
      title: '预测依据',
      note: `${detail.value.predictionEvidence?.length ?? 0} 条依据`,
      summary: detail.value.predictionEvidence?.[0]?.reason || '查看原始特征如何影响画像与风险。'
    },
    {
      key: 'metrics' as DetailPanelKey,
      title: '详细特征',
      note: `${(detail.value.behaviorDetails?.length ?? 0) + (detail.value.academicDetails?.length ?? 0)} 项明细`,
      summary: '查看行为明细、学业明细和群体对比。'
    },
    {
      key: 'risk' as DetailPanelKey,
      title: '风险结论',
      note: `${detail.value.factors?.length ?? 0} 条说明`,
      summary: detail.value.reportSummary || '查看风险解释与完整报告入口。'
    },
    {
      key: 'pipeline' as DetailPanelKey,
      title: '预测链路',
      note: `${detail.value.predictionSteps?.length ?? 0} 个步骤`,
      summary: '查看从原始特征到画像与风险输出的过程。'
    }
  ];
});

const activePanelTitle = computed(() => {
  switch (activePanel.value) {
    case 'profile': return '画像与细分解释';
    case 'evidence': return '预测依据与维度判读';
    case 'metrics': return '详细特征与群体对比';
    case 'risk': return '风险解释与报告入口';
    case 'pipeline': return '预测链路';
    default: return '详情';
  }
});

const profileHighlights = computed(() => {
  if (!detail.value) {
    return [];
  }
  return detail.value.profileHighlights?.length
    ? detail.value.profileHighlights
    : [
        detail.value.profileSubtype || detail.value.profileCategory,
        ...(detail.value.secondaryTags ?? []).slice(0, 3),
        ...(detail.value.dimensionBasis ?? []).slice(0, 2).map((item) => `${item.dimension}：${item.judgement}`)
      ].filter(Boolean);
});

const scoreFormulaCards = computed(() => {
  const scoreFormulaKeys = ['学习投入展示分', '行为规律展示分', '健康发展展示分', '综合发展展示分', '风险安全展示分'];
  return (detail.value?.featureFormulas ?? []).filter((item) => scoreFormulaKeys.includes(item.feature));
});

const profileExplainBlocks = computed(() => {
  if (!detail.value) return [];
  const blocks: Array<{ title: string; body: string }> = [];
  const categoryText = getProfileCategoryExplanation(detail.value.profileCategory);
  const subtypeText = getProfileSubtypeExplanation(detail.value.profileSubtype);
  if (categoryText) {
    blocks.push({ title: `主画像：${detail.value.profileCategory}`, body: categoryText });
  }
  if (subtypeText && detail.value.profileSubtype) {
    blocks.push({ title: `细分子类：${detail.value.profileSubtype}`, body: subtypeText });
  }
  if (detail.value.profileExplanation) {
    blocks.push({ title: '系统个体解释', body: detail.value.profileExplanation });
  }
  return blocks;
});

function handleSearch() {
  const value = searchStudentId.value.trim();
  if (!value) {
    return;
  }
  router.push(`/students/${value}`);
}

function openReport() {
  if (!detail.value?.studentId) {
    return;
  }
  router.push(`/students/${detail.value.studentId}/report`);
}

function openPanel(panel: DetailPanelKey) {
  activePanel.value = panel;
  panelDrawerVisible.value = true;
}

function isMissingValue(value?: string) {
  const text = String(value ?? '').trim();
  return text === '暂无原始记录' || text === '模型未返回' || text.includes('原始表中缺失') || text.includes('原表缺失');
}
</script>

<template>
  <section v-if="detail" class="page-shell detail-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">学生详情</h1>
        <p class="page-subtitle">先看核心摘要，再按模块进入抽屉查看详细特征、预测依据和完整报告，减少默认展开内容。</p>
      </div>
      <div class="header-actions">
        <el-input v-model="searchStudentId" placeholder="输入学号直接查询" clearable style="width: 240px" @keyup.enter="handleSearch" />
        <el-button @click="profileExplainVisible = true">画像说明</el-button>
        <el-button @click="formulaDrawerVisible = true">得分公式</el-button>
        <el-button @click="openReport">完整报告</el-button>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>
    </div>

    <div class="hero panel-card">
      <div>
        <div class="hero-name">{{ detail.studentId }}</div>
        <div class="hero-meta">{{ detail.studentId }} · {{ detail.college }} · {{ detail.major }}</div>
        <div v-if="detail.profileSubtype" class="hero-subtype">{{ detail.profileSubtype }}</div>
      </div>
      <div class="hero-tags">
        <span class="hero-tag risk">{{ detail.riskLevel }}</span>
        <span class="hero-tag">{{ detail.profileCategory }}</span>
        <span class="hero-tag info">综合预测 {{ detail.scorePredictionLabel || '未提供' }}</span>
      </div>
    </div>

    <div v-if="detail.secondaryTags?.length" class="tag-band panel-card">
      <div class="band-label">二级行为标签</div>
      <div class="band-tags">
        <span v-for="item in detail.secondaryTags" :key="item" class="band-tag">{{ item }}</span>
      </div>
    </div>

    <div class="base-grid">
      <article v-for="item in baseInfo" :key="item.label" class="base-card panel-card">
        <div class="base-label">{{ item.label }}</div>
        <div class="base-value">{{ item.value }}</div>
      </article>
    </div>

    <div class="summary-layout">
      <el-card class="panel-card summary-panel">
        <template #header>
          <div class="card-header-inner">
            <span>综合摘要</span>
            <span class="minor-copy">当前学生的核心结论</span>
          </div>
        </template>
        <div class="summary-box">{{ detail.reportSummary }}</div>
        <el-button type="primary" plain @click="openPanel('risk')">查看风险解释</el-button>
      </el-card>

      <el-card class="panel-card summary-panel">
        <template #header>
          <div class="card-header-inner">
            <span>模块入口</span>
            <span class="minor-copy">点击卡片打开抽屉</span>
          </div>
        </template>
        <div class="insight-grid">
          <button
            v-for="item in insightCards"
            :key="item.key"
            class="insight-card"
            @click="openPanel(item.key)"
          >
            <div class="insight-head">
              <span class="insight-title">{{ item.title }}</span>
              <span class="insight-note">{{ item.note }}</span>
            </div>
            <div class="insight-copy">{{ item.summary }}</div>
          </button>
        </div>
      </el-card>
    </div>

    <el-drawer v-model="panelDrawerVisible" :title="activePanelTitle" size="640px">
      <div v-if="activePanel === 'profile'" class="drawer-shell">
        <div class="summary-box">{{ detail.profileExplanation || '系统会结合学习投入、行为规律、图书馆使用、夜间活跃和风险敏感度，对当前主画像继续细分。' }}</div>
        <div v-if="profileHighlights.length" class="highlight-list">
          <div v-for="(item, index) in profileHighlights" :key="item" class="highlight-item">
            <div class="highlight-index">{{ index + 1 }}</div>
            <div class="highlight-copy">{{ item }}</div>
          </div>
        </div>
      </div>

      <div v-else-if="activePanel === 'evidence'" class="drawer-shell">
        <div class="evidence-list">
          <div v-for="item in detail.predictionEvidence ?? []" :key="item.label" class="evidence-item">
            <div>
              <div class="snapshot-label">{{ item.label }}</div>
              <div class="snapshot-note">{{ item.reason }}</div>
            </div>
            <div class="evidence-side">
              <span class="evidence-effect">{{ item.effect }}</span>
              <span class="snapshot-value" :class="{ missing: isMissingValue(item.value) }">{{ item.value }}</span>
            </div>
          </div>
        </div>
        <el-collapse>
          <el-collapse-item title="查看维度判读" name="dimension">
            <div class="dimension-list">
              <div v-for="item in detail.dimensionBasis ?? []" :key="item.dimension" class="dimension-item">
                <div class="dimension-head">
                  <div class="snapshot-label">{{ item.dimension }}</div>
                  <div class="dimension-judgement">{{ item.judgement }}</div>
                </div>
                <div class="compare-bars">
                  <div class="compare-bar-group">
                    <div class="compare-meta">本人 {{ item.selfScore }}</div>
                    <div class="compare-track"><div class="compare-fill self" :style="{ width: `${item.selfScore}%` }"></div></div>
                  </div>
                  <div class="compare-bar-group">
                    <div class="compare-meta">群体 {{ item.clusterScore }}</div>
                    <div class="compare-track"><div class="compare-fill cluster" :style="{ width: `${item.clusterScore}%` }"></div></div>
                  </div>
                  <div class="compare-bar-group">
                    <div class="compare-meta">全样本 {{ item.overallScore }}</div>
                    <div class="compare-track"><div class="compare-fill overall" :style="{ width: `${item.overallScore}%` }"></div></div>
                  </div>
                </div>
                <div class="snapshot-note">{{ item.summary }}</div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <div v-else-if="activePanel === 'metrics'" class="drawer-shell">
        <el-alert
          v-if="scoreFormulaCards.length"
          type="info"
          :closable="false"
          show-icon
          title="需要看分数怎么来的？可点顶部“得分公式”查看核心分数说明。"
        />
        <el-collapse>
          <el-collapse-item title="行为明细快照" name="behavior">
            <div class="snapshot-list">
              <div v-for="item in detail.behaviorDetails ?? []" :key="item.label" class="snapshot-item">
                <div>
                  <div class="snapshot-label">{{ item.label }}</div>
                  <div class="snapshot-note">{{ item.note }}</div>
                </div>
                <div class="snapshot-value" :class="{ missing: isMissingValue(item.value) }">{{ item.value }}</div>
              </div>
            </div>
          </el-collapse-item>
          <el-collapse-item title="学业明细快照" name="academic">
            <div class="snapshot-list">
              <div v-for="item in detail.academicDetails ?? []" :key="item.label" class="snapshot-item">
                <div>
                  <div class="snapshot-label">{{ item.label }}</div>
                  <div class="snapshot-note">{{ item.note }}</div>
                </div>
                <div class="snapshot-value" :class="{ missing: isMissingValue(item.value) }">{{ item.value }}</div>
              </div>
            </div>
          </el-collapse-item>
          <el-collapse-item title="群体对比" name="compare">
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
      </div>

      <div v-else-if="activePanel === 'risk'" class="drawer-shell">
        <div class="factor-list">
          <div v-for="(factor, index) in detail.factors" :key="factor.feature" class="factor-item">
            <div class="factor-index">{{ index + 1 }}</div>
            <div>
              <div class="factor-name">{{ factor.feature }}</div>
              <div class="factor-copy">{{ factor.description }}</div>
            </div>
          </div>
        </div>
        <el-card class="panel-card">
          <template #header>
            <div class="card-header-inner">
              <span>完整报告入口</span>
              <span class="minor-copy">正文、建议和打印导出统一收口</span>
            </div>
          </template>
          <div class="report-entry">
            <div class="intervention-text">当前详情页重点展示摘要、特征和依据；个性化分析正文、建议以及打印导出已统一放在完整报告页。</div>
            <el-button type="primary" @click="openReport">打开完整报告</el-button>
          </div>
        </el-card>
      </div>

      <div v-else class="drawer-shell">
        <div class="step-list">
          <div v-for="(item, index) in detail.predictionSteps ?? []" :key="item.title" class="step-item">
            <div class="step-index">{{ index + 1 }}</div>
            <div class="step-body">
              <div class="step-title">{{ item.title }}</div>
              <div class="step-summary">{{ item.summary }}</div>
              <div class="step-tags">
                <span v-for="tag in item.items" :key="tag" class="step-tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>

    <el-drawer v-model="formulaDrawerVisible" title="核心分数公式" size="520px">
      <div class="drawer-shell">
        <div class="summary-box">这里集中展示当前页面最常用的几项核心分数，方便快速理解这些分数是如何由原始特征换算得到的。</div>
        <div v-for="item in scoreFormulaCards" :key="item.feature" class="formula-card">
          <div class="formula-title">{{ item.feature }}</div>
          <div class="formula-expression">{{ item.formula }}</div>
          <div class="formula-copy">{{ item.explanation }}</div>
          <div class="formula-source">{{ item.source }}</div>
        </div>
        <div v-if="!scoreFormulaCards.length" class="loading-box">当前学生暂无可展示的核心分数公式。</div>
      </div>
    </el-drawer>

    <el-dialog v-model="profileExplainVisible" title="画像说明" width="560px">
      <div class="explain-dialog">
        <div v-for="item in profileExplainBlocks" :key="item.title" class="explain-card">
          <div class="explain-title">{{ item.title }}</div>
          <div class="explain-copy">{{ item.body }}</div>
        </div>
        <div class="explain-note">
          主画像和风险等级不是同一口径：主画像看的是学生更接近哪一类群体，风险等级看的是当前风险概率。
        </div>
      </div>
    </el-dialog>
  </section>
</template>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hero {
  padding: 24px 28px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.hero-name {
  font-size: 28px;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 8px;
}

.hero-subtype {
  font-size: 14px;
  font-weight: 700;
  color: #2563eb;
}

.hero-meta,
.minor-copy,
.base-label,
.compare-meta {
  font-size: 12px;
  color: #64748b;
}

.hero-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-band {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
}

.band-label {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
}

.band-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.band-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.hero-tag {
  padding: 6px 12px;
  border-radius: 999px;
  background: #eff6f1;
  color: #1f5136;
  font-size: 12px;
  font-weight: 700;
}

.hero-tag.risk {
  background: #fef2f2;
  color: #b91c1c;
}

.hero-tag.info {
  background: #eef2ff;
  color: #4338ca;
}

.base-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.base-card {
  padding: 20px;
}

.base-value {
  margin-top: 8px;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.summary-layout {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 18px;
}

.summary-panel {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfd 100%);
}

.card-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-box {
  padding: 16px;
  border-radius: 14px;
  background: #f8fafc;
  font-size: 14px;
  line-height: 1.8;
  color: #475569;
}

.insight-grid,
.evidence-list,
.snapshot-list,
.factor-list,
.dimension-list,
.step-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.insight-card {
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.insight-card:hover {
  border-color: #93c5fd;
  background: #f8fbff;
}

.insight-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.insight-title,
.snapshot-label,
.factor-name,
.step-title {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}

.insight-note,
.snapshot-note,
.intervention-text {
  font-size: 12px;
  color: #64748b;
}

.insight-copy,
.factor-copy,
.step-summary,
.highlight-copy {
  font-size: 14px;
  line-height: 1.8;
  color: #475569;
}

.drawer-shell,
.compare-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.evidence-item,
.snapshot-item,
.factor-item,
.highlight-item,
.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
}

.evidence-side {
  display: flex;
  align-items: center;
  gap: 10px;
}

.snapshot-value {
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
  white-space: nowrap;
}

.snapshot-value.missing {
  color: #c2410c;
  font-size: 15px;
}

.explain-dialog {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.explain-card {
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fbff;
  border: 1px solid #e2edf9;
}

.explain-title {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

.explain-copy,
.explain-note {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.8;
  color: #475569;
}

.evidence-effect,
.dimension-judgement,
.step-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.dimension-item {
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
}

.dimension-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.compare-row {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 14px;
  padding: 12px 0;
  border-top: 1px solid #eef2f7;
}

.compare-row:first-of-type {
  border-top: 0;
  padding-top: 0;
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

.compare-fill.self {
  background: #1f5136;
}

.compare-fill.cluster {
  background: #2563eb;
}

.compare-fill.overall {
  background: #d97706;
}

.factor-index,
.highlight-index,
.step-index {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 800;
  flex-shrink: 0;
}

.factor-index,
.step-index {
  background: linear-gradient(135deg, #2563eb, #38bdf8);
}

.highlight-index {
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
}

.report-entry {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.step-body,
.compare-bar-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.formula-card {
  padding: 16px;
  border-radius: 16px;
  background: #f8fafc;
}

.formula-title {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
}

.formula-expression {
  font-family: Consolas, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.8;
  color: #1d4ed8;
  margin-bottom: 8px;
}

.formula-copy {
  font-size: 13px;
  line-height: 1.8;
  color: #475569;
}

.formula-source {
  margin-top: 8px;
  font-size: 12px;
  color: #64748b;
}

@media (max-width: 1100px) {
  .base-grid,
  .summary-layout {
    grid-template-columns: 1fr;
  }

  .hero {
    flex-direction: column;
  }

  .compare-row {
    grid-template-columns: 1fr;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>

