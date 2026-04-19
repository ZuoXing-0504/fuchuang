<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getStudentCompare, getStudentProfile, getStudentRecommendations } from '../../api/student';
import type { StudentCompareData, StudentProfileData, StudentRecommendationsData } from '../../types';
import { getProfileCategoryExplanation, getProfileSubtypeExplanation } from '../../utils/profileSubtype';

const router = useRouter();
const profile = ref<StudentProfileData>();
const compare = ref<StudentCompareData>();
const recommendations = ref<StudentRecommendationsData>();
const profileExplainVisible = ref(false);

onMounted(async () => {
  const [profileData, compareData, recommendationData] = await Promise.all([
    getStudentProfile(),
    getStudentCompare(),
    getStudentRecommendations()
  ]);
  profile.value = profileData;
  compare.value = compareData;
  recommendations.value = recommendationData;
});

const sortedRadar = computed(() => [...(profile.value?.radar ?? [])].sort((a, b) => b.value - a.value));
const subtypeExplanation = computed(() => getProfileSubtypeExplanation(profile.value?.profileSubtype));

const headlineCards = computed(() => {
  const scholarshipPercent = Math.round((profile.value?.scholarshipProbability ?? 0) * 100);
  return [
    { label: '风险等级', value: profile.value?.riskLevel || '未提供', note: '用于说明当前风险状态' },
    { label: '健康档次', value: profile.value?.healthLevel || '未提供', note: '反映当前健康发展状态' },
    { label: '奖学金概率', value: `${scholarshipPercent}%`, note: '综合发展相关预测结果' },
    { label: '群体标签', value: compare.value?.clusterLabel || profile.value?.profileCategory || '未提供', note: '你当前最接近的学生群体' }
  ];
});

const insightList = computed(() => {
  const result: string[] = [];
  if (profile.value?.profileExplanation) {
    result.push(profile.value.profileExplanation);
  }
  if (profile.value?.profileHighlights?.length) {
    result.push(...profile.value.profileHighlights.slice(0, 3));
  }
  if (compare.value?.explanations?.length) {
    result.push(...compare.value.explanations.slice(0, 2));
  }
  return result.slice(0, 6);
});

const radarTop = computed(() => sortedRadar.value.slice(0, 3));
const radarBottom = computed(() => [...sortedRadar.value].slice(-2).reverse());

const actionItems = computed(() => {
  const recs = recommendations.value?.recommendations ?? [];
  return recs.slice(0, 4);
});

const profileExplainBlocks = computed(() => {
  if (!profile.value) return [];
  const blocks: Array<{ title: string; body: string }> = [];
  const categoryText = getProfileCategoryExplanation(profile.value.profileCategory);
  if (categoryText) {
    blocks.push({ title: `主画像：${profile.value.profileCategory}`, body: categoryText });
  }
  if (subtypeExplanation.value && profile.value.profileSubtype) {
    blocks.push({ title: `细分子类：${profile.value.profileSubtype}`, body: subtypeExplanation.value });
  }
  if (profile.value.profileExplanation) {
    blocks.push({ title: '系统个体解释', body: profile.value.profileExplanation });
  }
  return blocks;
});
</script>

<template>
  <section class="page-shell profile-page">
    <div class="hero panel-card">
      <div>
        <div class="hero-eyebrow">我的画像</div>
        <h1 class="hero-title">{{ profile?.profileCategory || '当前画像' }}</h1>
        <div v-if="profile?.profileSubtype" class="hero-subtype">{{ profile.profileSubtype }}</div>
        <div v-if="subtypeExplanation" class="hero-subtype-note">{{ subtypeExplanation }}</div>
        <p class="hero-subtitle">
          {{ profile?.description || '这里会从画像标签、多维表现、群体位置和建议方向四个层面，帮助你理解自己当前的状态。' }}
        </p>
        <div v-if="profile?.secondaryTags?.length" class="hero-tags">
          <span v-for="item in profile.secondaryTags" :key="item" class="hero-tag">{{ item }}</span>
        </div>
      </div>
      <div class="hero-side">
        <article v-for="item in headlineCards" :key="item.label" class="hero-badge">
          <span class="badge-label">{{ item.label }}</span>
          <span class="badge-value">{{ item.value }}</span>
          <span class="badge-note">{{ item.note }}</span>
        </article>
        <el-button class="hero-action outline" @click="profileExplainVisible = true">画像说明</el-button>
        <el-button class="hero-action" @click="router.push('/report')">查看完整报告</el-button>
      </div>
    </div>

    <div class="card-grid">
      <article v-for="item in headlineCards" :key="`${item.label}-grid`" class="summary-card panel-card">
        <div class="summary-label">{{ item.label }}</div>
        <div class="summary-value">{{ item.value }}</div>
        <div class="summary-note">{{ item.note }}</div>
      </article>
    </div>

    <div class="main-grid">
      <el-card class="panel-card metric-panel">
        <template #header>
          <div class="card-header-inner">
            <span>多维画像指标</span>
            <span class="minor-copy">从学习、规律、健康和成长等角度看当前表现</span>
          </div>
        </template>
        <div class="metric-list">
          <div v-for="item in profile?.radar ?? []" :key="item.indicator" class="metric-row">
            <div class="metric-name">{{ item.indicator }}</div>
            <div class="metric-track"><div class="metric-fill" :style="{ width: `${item.value}%` }"></div></div>
            <div class="metric-value">{{ item.value }}</div>
          </div>
        </div>
      </el-card>

      <div class="side-col">
        <el-card class="panel-card">
          <template #header>
            <div class="card-header-inner">
              <span>核心判断</span>
              <span class="minor-copy">为什么系统会这样看你</span>
            </div>
          </template>
          <div v-if="subtypeExplanation" class="subtype-panel">
            <div class="subtype-panel-title">细分子类解释</div>
            <div class="subtype-panel-copy">{{ subtypeExplanation }}</div>
          </div>
          <div class="highlight-list">
            <div v-for="(item, index) in insightList" :key="`${index}-${item}`" class="highlight-item">
              <div class="highlight-index">{{ index + 1 }}</div>
              <div class="highlight-copy">{{ item }}</div>
            </div>
          </div>
        </el-card>

        <el-card class="panel-card">
          <template #header>
            <div class="card-header-inner">
              <span>优势项</span>
              <span class="minor-copy">当前较有优势的维度</span>
            </div>
          </template>
          <div class="tag-list">
            <span v-for="item in profile?.strengths ?? []" :key="item" class="tag success">{{ item }}</span>
          </div>
        </el-card>

        <el-card class="panel-card">
          <template #header>
            <div class="card-header-inner">
              <span>待提升项</span>
              <span class="minor-copy">当前更值得优先关注的维度</span>
            </div>
          </template>
          <div class="tag-list">
            <span v-for="item in profile?.weaknesses ?? []" :key="item" class="tag warn">{{ item }}</span>
          </div>
        </el-card>
      </div>
    </div>

    <div class="detail-grid">
      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>群体对比</span>
            <span class="minor-copy">你和所属群体、全样本的位置差异</span>
          </div>
        </template>
        <div class="compare-list">
          <div v-for="item in compare?.compareMetrics ?? []" :key="item.label" class="compare-item">
            <div class="compare-head">
              <div class="metric-name">{{ item.label }}</div>
              <div class="compare-values">
                <span>本人 {{ item.selfScore }}</span>
                <span>群体 {{ item.clusterScore }}</span>
                <span>全样本 {{ item.overallScore }}</span>
              </div>
            </div>
            <div class="compare-bars">
              <div class="compare-track"><div class="compare-fill self" :style="{ width: `${item.selfScore}%` }"></div></div>
              <div class="compare-track"><div class="compare-fill cluster" :style="{ width: `${item.clusterScore}%` }"></div></div>
              <div class="compare-track"><div class="compare-fill overall" :style="{ width: `${item.overallScore}%` }"></div></div>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>样本位次</span>
            <span class="minor-copy">你在全样本中的相对位置</span>
          </div>
        </template>
        <div class="rank-list">
          <div v-for="item in compare?.rankingCards ?? []" :key="item.label" class="rank-item">
            <div>
              <div class="rank-name">{{ item.label }}</div>
              <div class="summary-note">越高说明该维度越靠前</div>
            </div>
            <div class="rank-score">{{ item.value }}{{ item.suffix }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="detail-grid">
      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>指标排序</span>
            <span class="minor-copy">先看最强项，再看最需要补的维度</span>
          </div>
        </template>
        <div class="rank-band">
          <div class="band-title">当前领先</div>
          <div class="band-row">
            <div v-for="item in radarTop" :key="item.indicator" class="band-card">
              <div class="rank-name">{{ item.indicator }}</div>
              <div class="band-score">{{ item.value }}</div>
            </div>
          </div>
          <div class="band-title weak">优先补强</div>
          <div class="band-row">
            <div v-for="item in radarBottom" :key="item.indicator" class="band-card weak">
              <div class="rank-name">{{ item.indicator }}</div>
              <div class="band-score">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>下一步建议</span>
            <span class="minor-copy">基于当前画像给出的优先动作</span>
          </div>
        </template>
        <div class="action-list">
          <div v-for="item in actionItems" :key="item.id" class="action-item">
            <div class="action-top">
              <span class="action-category">{{ item.category }}</span>
              <span class="action-priority" :class="item.priority">{{ item.priority }}</span>
            </div>
            <div class="action-title">{{ item.title }}</div>
            <div class="highlight-copy">{{ item.description }}</div>
          </div>
          <el-button plain @click="router.push('/report')">去完整报告看详细建议</el-button>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="profileExplainVisible" title="画像说明" width="560px">
      <div class="explain-dialog">
        <div v-for="item in profileExplainBlocks" :key="item.title" class="explain-card">
          <div class="explain-title">{{ item.title }}</div>
          <div class="explain-copy">{{ item.body }}</div>
        </div>
        <div class="explain-note">
          主画像反映你更接近哪一类学生群体，细分子类反映你在这类群体中的更具体位置。
        </div>
      </div>
    </el-dialog>
  </section>
</template>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 18px;
  padding: 24px;
  background: linear-gradient(135deg, #1677ff, #4ea4ff 55%, #7dc0ff);
  color: #fff;
}

.hero-eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.85;
  margin-bottom: 10px;
}

.hero-title {
  margin: 0 0 10px;
  font-size: 30px;
  font-weight: 900;
}

.hero-subtype {
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 700;
  opacity: 0.92;
}

.hero-subtype-note {
  margin-bottom: 10px;
  max-width: 720px;
  font-size: 13px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.84);
}

.hero-subtitle {
  margin: 0;
  font-size: 14px;
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.9);
}

.hero-tags {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-tag {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 12px;
  font-weight: 700;
}

.hero-side,
.metric-list,
.highlight-list,
.rank-list,
.compare-list,
.action-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subtype-panel {
  margin-bottom: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fbff;
  border: 1px solid #e2edf9;
}

.subtype-panel-title {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}

.subtype-panel-copy {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.8;
  color: #475569;
}

.hero-badge,
.summary-card,
.band-card,
.action-item {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.14);
}

.badge-label,
.minor-copy,
.summary-label,
.summary-note {
  font-size: 12px;
  color: #64748b;
}

.badge-label,
.badge-note {
  color: rgba(255, 255, 255, 0.76);
}

.badge-value,
.summary-value,
.band-score {
  display: block;
  margin-top: 6px;
  font-size: 20px;
  font-weight: 800;
}

.badge-note {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.6;
}

.hero-action {
  border: none;
  border-radius: 14px;
  background: #fff;
  color: #1677ff;
}

.hero-action.outline {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.24);
}

.card-grid,
.main-grid,
.detail-grid {
  display: grid;
  gap: 18px;
}

.card-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.summary-card {
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
}

.summary-value {
  color: #0f172a;
}

.main-grid,
.detail-grid {
  grid-template-columns: 1fr 1fr;
}

.side-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card-header-inner,
.compare-head,
.action-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.metric-row {
  display: grid;
  grid-template-columns: 110px 1fr 48px;
  gap: 12px;
  align-items: center;
}

.metric-name,
.rank-name,
.action-title,
.band-title {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}

.metric-track,
.compare-track {
  height: 12px;
  border-radius: 999px;
  background: #e8f1fb;
  overflow: hidden;
}

.metric-fill,
.compare-fill {
  height: 100%;
  border-radius: 999px;
}

.metric-fill,
.compare-fill.cluster {
  background: linear-gradient(90deg, #1677ff, #69b1ff);
}

.compare-fill.self {
  background: linear-gradient(90deg, #1d4ed8, #38bdf8);
}

.compare-fill.overall {
  background: linear-gradient(90deg, #94a3b8, #cbd5e1);
}

.metric-value,
.rank-score {
  font-size: 18px;
  font-weight: 900;
  color: #1677ff;
  text-align: right;
}

.highlight-item,
.rank-item,
.compare-item {
  padding: 14px;
  border-radius: 14px;
  background: #f8fbff;
}

.highlight-item {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;
  align-items: start;
}

.highlight-index {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(22, 119, 255, 0.12);
  color: #1677ff;
  font-size: 13px;
  font-weight: 800;
}

.highlight-copy {
  font-size: 14px;
  line-height: 1.8;
  color: #475569;
}

.compare-values {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #64748b;
}

.compare-bars {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rank-item,
.band-row {
  display: flex;
  gap: 12px;
}

.rank-item {
  align-items: center;
  justify-content: space-between;
}

.rank-band {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.band-title.weak {
  color: #c2410c;
}

.band-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.band-card {
  background: #f8fbff;
}

.band-card.weak {
  background: #fff7ed;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.tag.success {
  background: #ecfdf3;
  color: #15803d;
}

.tag.warn {
  background: #fff7ed;
  color: #c2410c;
}

.action-category,
.action-priority {
  font-size: 12px;
  font-weight: 700;
}

.action-category {
  color: #1677ff;
}

.action-priority {
  text-transform: uppercase;
}

.action-priority.high {
  color: #b91c1c;
}

.action-priority.medium {
  color: #c2410c;
}

.action-priority.low {
  color: #15803d;
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

@media (max-width: 1200px) {
  .card-grid,
  .main-grid,
  .detail-grid,
  .band-row,
  .hero {
    grid-template-columns: 1fr;
  }
}
</style>
