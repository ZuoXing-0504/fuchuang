<template>
  <view class="page-wrap">
    <view v-if="schemaLoading" class="status-card loading">
      <view class="status-title">正在加载</view>
      <view class="helper-text">正在读取在线预测所需字段和默认值...</view>
    </view>

    <view v-else-if="schemaError" class="status-card error">
      <view class="status-title">加载失败</view>
      <view class="helper-text">{{ schemaError }}</view>
      <button class="secondary-btn" @click="loadSchema">重新加载</button>
    </view>

    <template v-else>
      <view class="hero-card predict-hero">
        <view class="hero-caption">知行雷达 · 在线预测</view>
        <view class="hero-title">自主预测中心</view>
        <view class="hero-desc">系统会先使用当前账号的默认数据自动运行一次预测，你也可以调整字段后重新计算。</view>
      </view>

      <view class="panel-card">
        <view class="card-title">预测操作</view>
        <view class="action-row top-gap">
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
          <view v-for="card in result.cards" :key="card.label" class="result-card" :class="card.tone || 'primary'">
            <view class="result-chip">{{ metricGlyph(card.label) }}</view>
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
        <view class="form-grid top-gap">
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

function metricGlyph(label) {
  if (String(label).includes('风险')) return '险';
  if (String(label).includes('奖学金')) return '奖';
  if (String(label).includes('四级')) return '四';
  if (String(label).includes('六级')) return '六';
  if (String(label).includes('健康')) return '健';
  if (String(label).includes('趋势')) return '势';
  return '测';
}
</script>

<style scoped>
.predict-hero {
  background:
    radial-gradient(circle at 86% 18%, rgba(197, 240, 255, 0.68), transparent 18%),
    linear-gradient(180deg, rgba(144, 214, 255, 0.76) 0%, rgba(219, 241, 255, 0.74) 50%, rgba(248, 252, 255, 0.82) 100%);
  color: #13233b;
}

.hero-caption {
  font-size: 22rpx;
  font-weight: 700;
  color: #4a6b91;
  margin-bottom: 8rpx;
}

.hero-title {
  font-size: 40rpx;
  font-weight: 800;
  color: #13233b;
}

.hero-desc {
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: #526b88;
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
  border-radius: 24rpx;
  border: 1rpx solid rgba(177, 201, 227, 0.22);
  box-shadow: 0 14rpx 28rpx rgba(45, 93, 154, 0.04);
}

.result-card.primary {
  background: linear-gradient(180deg, #ffffff 0%, #edf5ff 100%);
}

.result-card.success {
  background: linear-gradient(180deg, #ffffff 0%, #eefcf5 100%);
}

.result-card.warning {
  background: linear-gradient(180deg, #ffffff 0%, #fff8ed 100%);
}

.result-card.danger {
  background: linear-gradient(180deg, #ffffff 0%, #fff1f2 100%);
}

.result-chip {
  width: 48rpx;
  height: 48rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f6dff, #57b8ff);
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 800;
  margin-bottom: 12rpx;
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
  border-top: 1rpx solid rgba(223, 232, 244, 0.92);
}

.sub-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #1b2533;
  margin-bottom: 10rpx;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 14rpx 0;
  border-bottom: 1rpx solid rgba(223, 232, 244, 0.92);
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
