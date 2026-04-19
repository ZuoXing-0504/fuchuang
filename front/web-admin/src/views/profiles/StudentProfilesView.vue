<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getWarnings } from '../../api/admin';
import type { StudentMetrics } from '../../types';

type DimensionKey = 'college' | 'major';

type AggregateRow = {
  label: string;
  studentCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  registeredCount: number;
  riskRate: number;
  registeredRate: number;
  avgScore: number;
  dominantProfile: string;
  dominantSubtype: string;
  students: StudentMetrics[];
};

const router = useRouter();
const rows = ref<StudentMetrics[]>([]);
const activeDimension = ref<DimensionKey>('college');
const loading = ref(false);
const loadError = ref('');
const keyword = ref('');
const detailDrawerVisible = ref(false);
const currentAggregate = ref<AggregateRow>();

async function loadRows() {
  loading.value = true;
  loadError.value = '';
  try {
    rows.value = await getWarnings();
  } catch (error) {
    rows.value = [];
    loadError.value = error instanceof Error ? error.message : '院系对比数据加载失败';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadRows();
});

function buildAggregate(source: StudentMetrics[], key: DimensionKey) {
  const counters = new Map<string, {
    studentCount: number;
    highRiskCount: number;
    mediumRiskCount: number;
    registeredCount: number;
    totalScore: number;
    profiles: Record<string, number>;
    subtypes: Record<string, number>;
    students: StudentMetrics[];
  }>();

  for (const item of source) {
    const raw = String(item[key] ?? '').trim();
    if (!raw) {
      continue;
    }
    const current = counters.get(raw) ?? {
      studentCount: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      registeredCount: 0,
      totalScore: 0,
      profiles: {},
      subtypes: {},
      students: []
    };

    current.studentCount += 1;
    current.totalScore += Number(item.scorePrediction ?? 0);
    if (item.riskLevel === '高风险') current.highRiskCount += 1;
    if (item.riskLevel === '中风险') current.mediumRiskCount += 1;
    if (item.registrationStatus === '已注册') current.registeredCount += 1;
    current.profiles[item.profileCategory] = (current.profiles[item.profileCategory] ?? 0) + 1;
    if (item.profileSubtype) {
      current.subtypes[item.profileSubtype] = (current.subtypes[item.profileSubtype] ?? 0) + 1;
    }
    current.students.push(item);
    counters.set(raw, current);
  }

  return Array.from(counters.entries()).map(([label, item]) => {
    const dominantProfile = Object.entries(item.profiles).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '未识别';
    const dominantSubtype = Object.entries(item.subtypes).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '未细分';
    return {
      label,
      studentCount: item.studentCount,
      highRiskCount: item.highRiskCount,
      mediumRiskCount: item.mediumRiskCount,
      registeredCount: item.registeredCount,
      riskRate: item.studentCount ? Math.round((item.highRiskCount / item.studentCount) * 100) : 0,
      registeredRate: item.studentCount ? Math.round((item.registeredCount / item.studentCount) * 100) : 0,
      avgScore: item.studentCount ? Number((item.totalScore / item.studentCount).toFixed(1)) : 0,
      dominantProfile,
      dominantSubtype,
      students: item.students.sort((a, b) => Number(b.scorePrediction) - Number(a.scorePrediction))
    } satisfies AggregateRow;
  }).sort((a, b) => b.riskRate - a.riskRate || b.studentCount - a.studentCount);
}

const collegeRows = computed(() => buildAggregate(rows.value, 'college'));
const majorRows = computed(() => buildAggregate(rows.value, 'major'));

const activeRows = computed(() => {
  const base = activeDimension.value === 'major' ? majorRows.value : collegeRows.value;
  const q = keyword.value.trim().toLowerCase();
  if (!q) {
    return base;
  }
  return base.filter((item) => item.label.toLowerCase().includes(q) || item.dominantProfile.toLowerCase().includes(q) || item.dominantSubtype.toLowerCase().includes(q));
});

const summaryCards = computed(() => [
  { label: '学院分组', value: collegeRows.value.length, note: '真实学院字段聚合' },
  { label: '专业分组', value: majorRows.value.length, note: '真实专业字段聚合' },
  { label: '最高风险学院', value: collegeRows.value[0]?.label ?? '暂无', note: `${collegeRows.value[0]?.riskRate ?? 0}% 高风险率` },
  { label: '当前视图', value: activeDimension.value === 'college' ? '学院' : '专业', note: '点击列表行查看抽屉详情' }
]);

const spotlightRows = computed(() => (activeDimension.value === 'major' ? majorRows.value : collegeRows.value).slice(0, 6));

function openAggregate(row: AggregateRow) {
  currentAggregate.value = row;
  detailDrawerVisible.value = true;
}
</script>

<template>
  <section class="page-shell comparison-page">
    <el-alert
      v-if="loadError"
      type="error"
      :closable="false"
      class="page-alert"
      :title="`院系对比数据加载失败：${loadError}`"
    />

    <div class="hero panel-card">
      <div class="hero-grid"></div>
      <div class="hero-copy">
        <div class="hero-eyebrow">Organization Comparison</div>
        <h1 class="hero-title">学院 / 专业对比</h1>
        <p class="hero-subtitle">按学院和专业查看风险比例、注册覆盖率、主导画像和主导细分，并可继续进入具体学生名单。</p>
      </div>
      <div class="hero-side">
        <div class="hero-chip">真实名单聚合</div>
        <div class="hero-chip">抽屉查看明细</div>
        <div class="hero-chip">已载入 {{ rows.length }} 条</div>
      </div>
    </div>

    <div class="summary-grid">
      <article v-for="card in summaryCards" :key="card.label" class="summary-card panel-card">
        <div class="summary-label">{{ card.label }}</div>
        <div class="summary-value">{{ card.value }}</div>
        <div class="summary-note">{{ card.note }}</div>
      </article>
    </div>

    <el-card class="panel-card main-card">
      <template #header>
        <div class="card-header-inner">
            <span>聚合对比列表</span>
            <span class="minor-copy">点击行查看该学院或专业的详细构成</span>
        </div>
      </template>

      <div class="control-row">
        <div class="tab-row">
          <button class="tab-btn" :class="{ active: activeDimension === 'college' }" @click="activeDimension = 'college'">学院对比</button>
          <button class="tab-btn" :class="{ active: activeDimension === 'major' }" @click="activeDimension = 'major'">专业对比</button>
        </div>
        <el-input v-model="keyword" clearable placeholder="搜索学院、专业或主导画像" style="width: 280px" />
      </div>

      <div v-if="loading" class="empty-tip">正在加载真实名单...</div>

      <el-table v-else :data="activeRows" stripe @row-click="openAggregate">
        <el-table-column prop="label" :label="activeDimension === 'college' ? '学院' : '专业'" min-width="220" />
        <el-table-column prop="studentCount" label="人数" width="90" />
        <el-table-column prop="highRiskCount" label="高风险" width="90" />
        <el-table-column prop="riskRate" label="高风险率" width="110">
          <template #default="{ row }">
            <span class="risk-text">{{ row.riskRate }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="registeredRate" label="注册覆盖" width="110">
          <template #default="{ row }">
            <span>{{ row.registeredRate }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="avgScore" label="综合发展均值" width="130" />
        <el-table-column prop="dominantProfile" label="主导画像" min-width="160" />
        <el-table-column prop="dominantSubtype" label="主导细分" min-width="190" />
      </el-table>
    </el-card>

    <el-card class="panel-card compact-card">
      <template #header>
        <div class="card-header-inner">
          <span>重点关注名单</span>
          <span class="minor-copy">当前层级 Top 6</span>
        </div>
      </template>
      <div class="spotlight-list">
        <div v-for="item in spotlightRows" :key="item.label" class="spotlight-item" @click="openAggregate(item)">
          <div>
            <div class="spotlight-name">{{ item.label }}</div>
            <div class="spotlight-meta">{{ item.studentCount }} 人 · {{ item.highRiskCount }} 名高风险 · {{ item.dominantProfile }}</div>
          </div>
          <div class="spotlight-rate">{{ item.riskRate }}%</div>
        </div>
      </div>
    </el-card>

    <el-drawer v-model="detailDrawerVisible" :title="currentAggregate?.label || '聚合详情'" size="560px" :destroy-on-close="true">
      <div v-if="currentAggregate" class="drawer-shell">
        <div class="drawer-summary">
          <div class="drawer-badge">{{ activeDimension === 'college' ? '学院' : '专业' }}</div>
          <div class="drawer-title">{{ currentAggregate.label }}</div>
          <div class="drawer-meta">
            <span>{{ currentAggregate.studentCount }} 人</span>
            <span>{{ currentAggregate.highRiskCount }} 名高风险</span>
            <span>注册覆盖 {{ currentAggregate.registeredRate }}%</span>
          </div>
        </div>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="主导画像">{{ currentAggregate.dominantProfile }}</el-descriptions-item>
          <el-descriptions-item label="主导细分">{{ currentAggregate.dominantSubtype }}</el-descriptions-item>
          <el-descriptions-item label="高风险率">{{ currentAggregate.riskRate }}%</el-descriptions-item>
          <el-descriptions-item label="综合发展均值">{{ currentAggregate.avgScore }}</el-descriptions-item>
        </el-descriptions>

        <el-collapse class="drawer-collapse">
          <el-collapse-item title="查看该分组学生名单" name="students">
            <div class="student-list">
              <div v-for="item in currentAggregate.students.slice(0, 20)" :key="item.studentId" class="student-item">
                <div>
                  <div class="student-name">{{ item.name || item.studentId }}</div>
                  <div class="student-meta">{{ item.studentId }} · {{ item.profileCategory }} · {{ item.profileSubtype || '未细分' }}</div>
                </div>
                <el-button type="primary" link @click="router.push(`/students/${item.studentId}`)">单学生详情</el-button>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-drawer>
  </section>
</template>

<style scoped>
.comparison-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.page-alert {
  margin-bottom: -2px;
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

.hero-chip {
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 700;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.summary-card,
.compact-card {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfd 100%);
}

.summary-card {
  padding: 22px;
}

.summary-label,
.summary-note,
.minor-copy {
  font-size: 12px;
  color: #64748b;
}

.summary-value {
  font-size: 30px;
  font-weight: 900;
  color: #0f172a;
  margin: 8px 0;
}

.card-header-inner,
.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.control-row {
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.tab-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #dbe5ee;
  background: #fff;
  color: #475569;
  font-weight: 700;
  cursor: pointer;
}

.tab-btn.active {
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  border-color: transparent;
  color: #fff;
}

.risk-text {
  color: #b91c1c;
  font-weight: 700;
}

.empty-tip {
  padding: 16px;
  border-radius: 14px;
  background: #fff7ed;
  color: #9a3412;
  font-size: 13px;
}

.spotlight-list,
.student-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.spotlight-item,
.student-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
  cursor: pointer;
}

.spotlight-name,
.student-name,
.drawer-title {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
}

.spotlight-meta,
.student-meta,
.drawer-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.spotlight-rate {
  font-size: 20px;
  font-weight: 900;
  color: #b91c1c;
}

.drawer-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drawer-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.drawer-collapse {
  margin-top: 6px;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .hero {
    grid-template-columns: 1fr;
  }
}
</style>

