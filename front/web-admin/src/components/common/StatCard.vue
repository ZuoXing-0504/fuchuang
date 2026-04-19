<script setup lang="ts">
const props = defineProps<{
  label: string;
  value: string;
  delta: string;
  tone: 'danger' | 'warning' | 'success' | 'primary';
  icon?: string;
}>();

const toneMap = {
  danger: { color: '#ef4444', bg: 'linear-gradient(135deg, #fef2f2, #fee2e2)', iconBg: 'linear-gradient(135deg, #ef4444, #f87171)', glow: 'rgba(239, 68, 68, 0.15)' },
  warning: { color: '#f59e0b', bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)', iconBg: 'linear-gradient(135deg, #f59e0b, #fbbf24)', glow: 'rgba(245, 158, 11, 0.15)' },
  success: { color: '#10b981', bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', iconBg: 'linear-gradient(135deg, #10b981, #34d399)', glow: 'rgba(16, 185, 129, 0.15)' },
  primary: { color: '#2563eb', bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)', iconBg: 'linear-gradient(135deg, #2563eb, #3b82f6)', glow: 'rgba(37, 99, 235, 0.15)' }
};

const iconMap = {
  danger: '⚠',
  warning: '⚡',
  success: '✦',
  primary: '◆'
};
</script>

<template>
  <div class="stat-card panel-card" :style="{ background: toneMap[props.tone].bg }">
    <div class="stat-top">
      <div class="stat-icon" :style="{ background: toneMap[props.tone].iconBg, boxShadow: `0 4px 12px ${toneMap[props.tone].glow}` }">
        {{ iconMap[props.tone] }}
      </div>
      <div class="stat-delta" :style="{ color: toneMap[props.tone].color, background: `${toneMap[props.tone].color}12` }">{{ props.delta }}</div>
    </div>
    <div class="stat-value" :style="{ color: toneMap[props.tone].color }">{{ props.value }}</div>
    <div class="stat-label">{{ props.label }}</div>
  </div>
</template>

<style scoped>
.stat-card {
  padding: 24px;
  min-height: 148px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: -30%;
  right: -20%;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  opacity: 0.06;
  background: currentColor;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 18px;
  font-weight: 800;
}

.stat-delta {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
}

.stat-value {
  font-size: 36px;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  margin-top: 6px;
}
</style>
