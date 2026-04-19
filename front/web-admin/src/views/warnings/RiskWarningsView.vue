<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getStudentDetail, getWarnings } from '../../api/admin';
import type { StudentDetail, StudentMetrics } from '../../types';

const router = useRouter();
const source = ref<StudentMetrics[]>([]);
const filterDrawerVisible = ref(false);
const drawerVisible = ref(false);
const currentDetail = ref<StudentDetail>();
const keyword = ref('');
const loading = ref(false);
const loadError = ref('');
const filters = reactive({ college: '', major: '', riskLevel: '', profileCategory: '', registrationStatus: '' });

async function loadWarnings() {
  loading.value = true;
  loadError.value = '';
  try {
    source.value = await getWarnings();
  } catch (error) {
    source.value = [];
    loadError.value = error instanceof Error ? error.message : '风险名单加载失败';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadWarnings();
});

const colleges = computed(() => [...new Set(source.value.map((item) => item.college).filter(Boolean))].sort());
const majors = computed(() => [...new Set(source.value.map((item) => item.major).filter(Boolean))].sort());
const riskLevels = computed(() => [...new Set(source.value.map((item) => item.riskLevel).filter(Boolean))]);
const categories = computed(() => [...new Set(source.value.map((item) => item.profileCategory).filter(Boolean))]);
const registrationStates = computed(() => [...new Set(source.value.map((item) => item.registrationStatus).filter(Boolean))]);

const filteredRows = computed(() => source.value.filter((item) => {
  const q = keyword.value.trim();
  return (!q || item.studentId.includes(q) || item.name.includes(q)) &&
    (!filters.college || item.college === filters.college) &&
    (!filters.major || item.major === filters.major) &&
    (!filters.riskLevel || item.riskLevel === filters.riskLevel) &&
    (!filters.profileCategory || item.profileCategory === filters.profileCategory) &&
    (!filters.registrationStatus || item.registrationStatus === filters.registrationStatus);
}));

async function openDetail(studentId: string) {
  currentDetail.value = await getStudentDetail(studentId);
  drawerVisible.value = true;
}

function handleRowClick(row: StudentMetrics) {
  openDetail(row.studentId);
}
</script>

<template>
  <section class="page-shell warning-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">风险名单</h1>
        <p class="page-subtitle">查看重点学生名单，并通过抽屉预览快速进入单学生详情和完整报告。</p>
        <p class="status-inline">当前已加载 {{ source.length }} 条学生记录</p>
      </div>
      <div class="header-actions">
        <el-input v-model="keyword" placeholder="输入学号或姓名查询" clearable style="width: 240px" />
        <el-button @click="filterDrawerVisible = true">筛选</el-button>
        <el-button @click="loadWarnings" :loading="loading">刷新</el-button>
      </div>
    </div>

    <el-alert
      v-if="loadError"
      type="error"
      :closable="false"
      class="page-alert"
      :title="`风险名单加载失败：${loadError}`"
    />

    <div class="layout-grid single">
      <el-card class="panel-card table-card">
        <template #header>
          <div class="card-header-inner">
            <span>学生列表</span>
            <span class="minor-copy">单击行打开概览抽屉</span>
          </div>
        </template>
        <el-table :data="filteredRows" height="620" stripe @row-click="handleRowClick">
          <el-table-column prop="studentId" label="学号" width="140" />
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="college" label="学院" min-width="180" />
          <el-table-column prop="major" label="专业" min-width="160" />
          <el-table-column prop="riskLevel" label="风险等级" width="100" />
          <el-table-column prop="profileCategory" label="画像类别" min-width="140" />
          <el-table-column prop="profileSubtype" label="细分画像" min-width="170" />
          <el-table-column label="二级标签" min-width="220">
            <template #default="{ row }">
              <div v-if="row.secondaryTags?.length" class="tag-list compact">
                <span v-for="item in row.secondaryTags" :key="item" class="tag-chip">{{ item }}</span>
              </div>
              <span v-else class="minor-copy">暂无标签</span>
            </template>
          </el-table-column>
          <el-table-column prop="registrationStatus" label="账号状态" width="110" />
          <el-table-column label="操作" width="220">
            <template #default="{ row }">
              <el-space>
                <el-button type="primary" link size="small" @click="openDetail(row.studentId)">单学生详情</el-button>
                <el-button type="primary" link size="small" @click="router.push(`/students/${row.studentId}/report`)">完整报告</el-button>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <el-drawer v-model="filterDrawerVisible" title="筛选条件" size="360px">
      <el-form label-position="top">
        <el-form-item label="学院">
          <el-select v-model="filters.college" clearable placeholder="全部学院">
            <el-option v-for="item in colleges" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="专业">
          <el-select v-model="filters.major" clearable placeholder="全部专业">
            <el-option v-for="item in majors" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="风险等级">
          <el-select v-model="filters.riskLevel" clearable placeholder="全部等级">
            <el-option v-for="item in riskLevels" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="画像类别">
          <el-select v-model="filters.profileCategory" clearable placeholder="全部类别">
            <el-option v-for="item in categories" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="filters.registrationStatus" clearable placeholder="全部状态">
            <el-option v-for="item in registrationStates" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="filter-count">当前命中 {{ filteredRows.length }} 人</div>
    </el-drawer>

    <el-drawer v-model="drawerVisible" title="学生概览" size="480px" :destroy-on-close="true">
      <div v-if="currentDetail" class="drawer-content">
        <div class="drawer-name">{{ currentDetail.name }}</div>
        <div class="drawer-meta">{{ currentDetail.studentId }} · {{ currentDetail.college }} · {{ currentDetail.major }}</div>
        <div class="drawer-tags">
          <span class="drawer-tag risk">{{ currentDetail.riskLevel }}</span>
          <span class="drawer-tag">{{ currentDetail.profileCategory }}</span>
          <span v-if="currentDetail.profileSubtype" class="drawer-tag">{{ currentDetail.profileSubtype }}</span>
        </div>
        <div v-if="currentDetail.secondaryTags?.length" class="tag-list">
          <span v-for="item in currentDetail.secondaryTags" :key="item" class="tag-chip">{{ item }}</span>
        </div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="表现档次">{{ currentDetail.performanceLevel }}</el-descriptions-item>
          <el-descriptions-item label="健康档次">{{ currentDetail.healthLevel }}</el-descriptions-item>
          <el-descriptions-item label="账号状态">
            {{ currentDetail.registeredUsername ? `${currentDetail.registrationStatus}（${currentDetail.registeredUsername}）` : currentDetail.registrationStatus }}
          </el-descriptions-item>
          <el-descriptions-item label="综合结论">{{ currentDetail.reportSummary }}</el-descriptions-item>
        </el-descriptions>
        <div class="drawer-actions">
          <el-button type="primary" style="width:100%" @click="router.push(`/students/${currentDetail.studentId}`); drawerVisible = false">单学生详情</el-button>
          <el-button style="width:100%" @click="router.push(`/students/${currentDetail.studentId}/report`); drawerVisible = false">完整报告</el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<style scoped>
.warning-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-inline {
  margin: 8px 0 0;
  font-size: 12px;
  color: #64748b;
}

.page-alert {
  margin-top: -6px;
}

.layout-grid.single {
  display: grid;
  grid-template-columns: 1fr;
}

.card-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.minor-copy,
.filter-count,
.drawer-meta {
  font-size: 12px;
  color: #64748b;
}

.filter-count {
  margin-top: 10px;
  font-weight: 700;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-list.compact {
  gap: 6px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.drawer-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.drawer-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.drawer-name {
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
}

.drawer-tags {
  display: flex;
  gap: 8px;
}

.drawer-tag {
  padding: 6px 12px;
  border-radius: 999px;
  background: #eff6f1;
  color: #1f5136;
  font-size: 12px;
  font-weight: 700;
}

.drawer-tag.risk {
  background: #fef2f2;
  color: #b91c1c;
}

@media (max-width: 1100px) {
  .layout-grid.single {
    grid-template-columns: 1fr;
  }
}
</style>

