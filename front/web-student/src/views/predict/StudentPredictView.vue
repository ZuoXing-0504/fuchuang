<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { getStudentPredictionSchema, submitStudentManualPredict } from '../../api/student';
import type { StudentPredictionResult, StudentPredictionSchema } from '../../types';

const schema = ref<StudentPredictionSchema>();
const result = ref<StudentPredictionResult>();
const loading = ref(false);
const form = reactive<Record<string, string | number | null>>({});

onMounted(async () => {
  schema.value = await getStudentPredictionSchema();
  for (const group of schema.value.groups) {
    for (const field of group.fields) {
      form[field.key] = field.defaultValue ?? null;
    }
  }
  await handlePredict();
});

async function handlePredict() {
  loading.value = true;
  try {
    result.value = await submitStudentManualPredict(form);
  } finally {
    loading.value = false;
  }
}

function resetToDefault() {
  if (!schema.value) return;
  for (const group of schema.value.groups) {
    for (const field of group.fields) {
      form[field.key] = field.defaultValue ?? null;
    }
  }
}

function toneClass(tone: string) {
  return `tone-${tone || 'primary'}`;
}
</script>

<template>
  <section class="page-shell predict-page">
    <div class="hero panel-card">
      <div>
        <div class="hero-eyebrow">在线预测</div>
        <h1 class="hero-title">自主预测中心</h1>
        <p class="hero-subtitle">
          这里会先带入你当前账号已有的数据。你可以按需要修改关键行为、学业和体测指标，
          系统会即时返回风险、奖学金、四六级、学习投入、综合发展等预测结果。
        </p>
      </div>
      <div class="hero-actions">
        <el-button @click="resetToDefault">恢复本人默认值</el-button>
        <el-button type="primary" :loading="loading" @click="handlePredict">开始预测</el-button>
      </div>
    </div>

    <el-card class="panel-card">
      <template #header>
        <div class="card-header-inner">
          <span>输入项</span>
          <span class="minor-copy">默认值来自你当前账号已有数据，只改你关心的部分也可以</span>
        </div>
      </template>

      <div v-for="group in schema?.groups ?? []" :key="group.title" class="group-block">
        <div class="group-title">{{ group.title }}</div>
        <div class="group-desc">{{ group.description }}</div>
        <div class="form-grid">
          <div v-for="field in group.fields" :key="field.key" class="field-card">
            <label class="field-label">
              {{ field.label }}
              <span v-if="field.unit" class="field-unit"> / {{ field.unit }}</span>
            </label>
            <el-input
              v-if="field.type !== 'number'"
              v-model="form[field.key]"
              :placeholder="field.placeholder"
              clearable
            />
            <el-input-number
              v-else
              v-model="form[field.key] as number | null"
              :controls="false"
              class="field-number"
              :placeholder="field.placeholder"
            />
          </div>
        </div>
      </div>

      <div class="note-list">
        <div v-for="item in schema?.notes ?? []" :key="item" class="note-item">{{ item }}</div>
      </div>
    </el-card>

    <div v-if="result" class="result-wrap">
      <div class="result-grid">
        <article
          v-for="card in result.cards"
          :key="card.label"
          class="result-card panel-card"
          :class="toneClass(card.tone)"
        >
          <div class="result-label">{{ card.label }}</div>
          <div class="result-value">{{ card.value }}</div>
          <div class="result-desc">{{ card.description }}</div>
        </article>
      </div>

      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>各模型结果总览</span>
            <span class="minor-copy">进入页面后已按你当前默认值自动跑了一次</span>
          </div>
        </template>
        <div class="model-output-list">
          <div v-for="card in result.cards" :key="`${card.label}-list`" class="model-output-item">
            <div>
              <div class="model-output-label">{{ card.label }}</div>
              <div class="result-desc">{{ card.description }}</div>
            </div>
            <strong class="model-output-value">{{ card.value }}</strong>
          </div>
        </div>
      </el-card>

      <div class="section-grid">
        <el-card v-for="section in result.sections" :key="section.title" class="panel-card">
          <template #header>
            <div class="card-header-inner">
              <span>{{ section.title }}</span>
            </div>
          </template>
          <div class="section-list">
            <div v-for="item in section.items" :key="`${section.title}-${item.label}`" class="section-item">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </el-card>
      </div>

      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>结果说明</span>
          </div>
        </template>
        <div class="note-list result-notes">
          <div v-for="item in result.notes" :key="item" class="note-item">{{ item }}</div>
        </div>
      </el-card>
    </div>
  </section>
</template>

<style scoped>
.predict-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.hero-eyebrow,
.minor-copy,
.result-label,
.result-desc,
.group-desc,
.field-unit {
  font-size: 12px;
  color: #64748b;
}

.hero-title {
  margin: 6px 0 10px;
  font-size: 30px;
  font-weight: 900;
  color: #0f172a;
}

.hero-subtitle {
  margin: 0;
  max-width: 760px;
  line-height: 1.8;
  color: #475569;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.card-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.group-block + .group-block {
  margin-top: 24px;
}

.group-title {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.group-desc {
  margin-top: 6px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin-top: 14px;
}

.field-card {
  padding: 14px;
  border-radius: 18px;
  background: #f8fbff;
  border: 1px solid #e4eef8;
}

.field-label {
  display: block;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.field-number {
  width: 100%;
}

.note-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
}

.note-item {
  padding: 12px 14px;
  border-radius: 14px;
  background: #f8fafc;
  color: #334155;
  line-height: 1.7;
}

.result-wrap {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.result-card {
  padding: 18px;
}

.result-value {
  margin: 10px 0 8px;
  font-size: 26px;
  font-weight: 900;
  color: #0f172a;
}

.tone-primary {
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
}

.tone-success {
  background: linear-gradient(180deg, #ffffff 0%, #f2fbf7 100%);
}

.tone-warning {
  background: linear-gradient(180deg, #ffffff 0%, #fffaf1 100%);
}

.tone-danger {
  background: linear-gradient(180deg, #ffffff 0%, #fff5f5 100%);
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.section-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.model-output-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.model-output-item {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #f8fafc;
  color: #334155;
}

.model-output-label {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 4px;
}

.model-output-value {
  align-self: center;
  font-size: 18px;
  color: #1677ff;
}

.section-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  background: #f8fafc;
  color: #334155;
}

.result-notes {
  margin-top: 0;
}

@media (max-width: 860px) {
  .hero {
    flex-direction: column;
  }
}
</style>
