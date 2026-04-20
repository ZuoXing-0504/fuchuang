<template>
  <view class="page-wrap">
    <view v-if="schemaLoading" class="status-card loading">
      <view class="status-title">正在加载</view>
      <view class="helper-text">正在读取在线预测所需的字段和默认值...</view>
    </view>

    <view v-else-if="schemaError" class="status-card error">
      <view class="status-title">加载失败</view>
      <view class="helper-text">{{ schemaError }}</view>
      <button class="secondary-btn" @click="loadSchema">重新加载</button>
    </view>

    <template v-else>
      <view class="hero-card">
        <view class="card-title">在线预测</view>
        <view class="hero-copy">页面会先用当前账号的默认数据自动跑一次预测，你也可以修改关键字段后重新计算。</view>
      </view>

      <view class="panel-card">
        <view class="card-title">预测操作</view>
        <view class="action-row">
          <button class="primary-btn flex-btn" :disabled="predicting" @click="runPrediction">
            {{ predicting ? '预测中...' : '开始预测' }}
          </button>
          <button class="secondary-btn flex-btn" @click="resetValues">恢复默认值</button>
        </view>
        <view v-if="schema.notes.length" class="top-gap">
          <view v-for="item in schema.notes" :key="item" class="helper-text">{{ item }}</view>
        </view>
      </view>

      <view v-if="result && result.cards.length" class="panel-card">
        <view class="card-title">预测总览</view>
        <view class="result-grid">
          <view v-for="card in result.cards" :key="card.label" class="result-card" :class="card.tone">
            <view class="metric-label">{{ card.label }}</view>
            <view class="metric-value">{{ card.value }}</view>
            <view class="muted">{{ card.description }}</view>
          </view>
        </view>
      </view>

      <view v-if="predictionError" class="status-card error">
        <view class="status-title">预测失败</view>
        <view class="helper-text">{{ predictionError }}</view>
      </view>

      <view v-for="group in schema.groups" :key="group.title" class="panel-card">
        <view class="card-title">{{ group.title }}</view>
        <view v-if="group.description" class="helper-text">{{ group.description }}</view>
        <view class="form-grid">
          <view v-for="field in group.fields" :key="field.key" class="field-item">
            <view class="field-label">{{ field.label }}<text v-if="field.unit"> / {{ field.unit }}</text></view>
            <input
              v-model="formValues[field.key]"
              class="field-input"
              :type="field.type === 'number' ? 'digit' : 'text'"
              :placeholder="field.placeholder || `请输入${field.label}`"
            />
          </view>
        </view>
      </view>

      <view v-if="result && result.sections.length" class="panel-card">
        <view class="card-title">结果明细</view>
        <view v-for="section in result.sections" :key="section.title" class="result-section">
          <view class="sub-title">{{ section.title }}</view>
          <view v-for="item in section.items" :key="`${section.title}-${item.label}`" class="detail-row">
            <text class="detail-label">{{ item.label }}</text>
            <text class="detail-value">{{ item.value || '未返回' }}</text>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getStudentPredictionSchema, submitStudentManualPredict } from '../../../api/student';
import { ensureRole } from '../../../common/session';

const schemaLoading = ref(true);
const schemaError = ref('');
const predicting = ref(false);
const predictionError = ref('');
const schema = ref({ studentId: '', groups: [], notes: [] });
const result = ref(null);
const formValues = reactive({});
let defaultValues = {};

onShow(() => {
  if (!ensureRole('student')) return;
  loadSchema();
});

async function loadSchema() {
  schemaLoading.value = true;
  schemaError.value = '';
  predictionError.value = '';
  try {
    const response = await getStudentPredictionSchema();
    schema.value = response;
    const initialValues = {};
    response.groups.forEach((group) => {
      group.fields.forEach((field) => {
        initialValues[field.key] = field.defaultValue === null || field.defaultValue === undefined ? '' : String(field.defaultValue);
      });
    });
    defaultValues = { ...initialValues };
    Object.keys(formValues).forEach((key) => delete formValues[key]);
    Object.assign(formValues, initialValues);
    await runPrediction();
  } catch (err) {
    schemaError.value = err instanceof Error ? err.message : '预测字段加载失败';
  } finally {
    schemaLoading.value = false;
  }
}

async function runPrediction() {
  predicting.value = true;
  predictionError.value = '';
  try {
    result.value = await submitStudentManualPredict({ ...formValues });
  } catch (err) {
    predictionError.value = err instanceof Error ? err.message : '在线预测失败';
  } finally {
    predicting.value = false;
  }
}

function resetValues() {
  Object.keys(formValues).forEach((key) => delete formValues[key]);
  Object.assign(formValues, defaultValues);
  runPrediction();
}
</script>

<style scoped>
.hero-copy {
  font-size: 24rpx;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.92);
}

.action-row {
  display: flex;
  gap: 16rpx;
}

.flex-btn {
  flex: 1;
}

.top-gap {
  margin-top: 16rpx;
}

.result-grid,
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.result-card {
  padding: 22rpx;
  border-radius: 22rpx;
  background: #f8faf6;
}

.result-card.primary {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
}

.result-card.success {
  background: linear-gradient(135deg, #ecfdf3, #dcfce7);
}

.result-card.warning {
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
}

.result-card.danger {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.field-label {
  font-size: 24rpx;
  font-weight: 700;
  color: #223127;
}

.result-section + .result-section {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #eef1eb;
}

.sub-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #1a2e1f;
  margin-bottom: 10rpx;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #eef1eb;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 24rpx;
  color: #68756d;
}

.detail-value {
  font-size: 26rpx;
  font-weight: 700;
  color: #223127;
  text-align: right;
}
</style>
