<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const form = ref({ username: 'admin001', password: '123456' });
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  loading.value = true;
  error.value = '';
  try {
    await auth.login(form.value);
    router.push('/');
  } catch (err) {
    error.value = err instanceof Error ? err.message : '登录失败，请检查账号和密码';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page admin-brand">
    <section class="brand-panel">
      <div class="brand-grid"></div>
      <div class="brand-copy">
        <div class="brand-mark">AC</div>
        <div class="brand-eyebrow">Admin Intelligence Console</div>
        <h1 class="brand-title">学生行为分析后台</h1>
        <p class="brand-subtitle">面向学校与学院管理视角的风险预警、群体对比、成果展厅与干预工作台。</p>
        <div class="brand-points">
          <div class="point-item">全样本行为分析成果与可视化叙事</div>
          <div class="point-item">院系风险对比、学生检索与重点名单</div>
          <div class="point-item">基于真实名单联动学生详情与干预建议</div>
        </div>
      </div>
    </section>

    <section class="form-panel">
      <div class="form-shell panel-card">
        <div class="form-head">
          <div class="form-kicker">Management Portal</div>
          <h2 class="form-title">管理员入口</h2>
          <p class="form-desc">登录管理后台查看全样本分析、风险名单、院系对比和干预工作台。</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="field">
            <label>管理员账号</label>
            <input v-model="form.username" type="text" placeholder="请输入管理员账号" autocomplete="username" />
          </div>
          <div class="field">
            <label>密码</label>
            <input v-model="form.password" type="password" placeholder="请输入密码" autocomplete="current-password" />
          </div>
          <button type="submit" class="submit-btn" :disabled="loading">{{ loading ? '登录中...' : '进入管理后台' }}</button>
        </form>

        <p v-if="error" class="status-text error">{{ error }}</p>

        <div class="guide-box">
          <div>默认演示管理员：`admin001`</div>
          <div>默认密码：`123456`</div>
        </div>

        <div class="footer-note">仅限授权管理员使用，当前页面已接入真实后台登录接口。</div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  background: #08111f;
}

.brand-panel,
.form-panel {
  position: relative;
}

.brand-panel {
  overflow: hidden;
  background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.24), transparent 34%), linear-gradient(145deg, #08111f, #152231 58%, #334155);
  color: #f8fafc;
  display: flex;
  align-items: center;
}

.brand-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
  background-size: 30px 30px;
  mask-image: linear-gradient(180deg, rgba(0,0,0,0.95), rgba(0,0,0,0.2));
}

.brand-copy {
  position: relative;
  z-index: 1;
  padding: 72px 64px;
  max-width: 560px;
}

.brand-mark {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-weight: 900;
  letter-spacing: 0.08em;
  margin-bottom: 28px;
}

.brand-eyebrow,
.form-kicker {
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.brand-eyebrow {
  color: #93c5fd;
  margin-bottom: 12px;
}

.brand-title {
  margin: 0 0 14px;
  font-size: 42px;
  line-height: 1.12;
  font-weight: 900;
}

.brand-subtitle {
  margin: 0;
  font-size: 15px;
  line-height: 1.9;
  color: rgba(248, 250, 252, 0.8);
}

.brand-points {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.point-item {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(248, 250, 252, 0.86);
  font-size: 14px;
}

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: linear-gradient(180deg, #f8fbff, #eef4f9);
}

.form-shell {
  width: 100%;
  max-width: 420px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.18);
  backdrop-filter: blur(18px);
}

.form-kicker {
  color: #2563eb;
  margin-bottom: 10px;
}

.form-title {
  margin: 0 0 8px;
  font-size: 30px;
  font-weight: 900;
  color: #0f172a;
}

.form-desc {
  margin: 0 0 24px;
  font-size: 14px;
  line-height: 1.8;
  color: #64748b;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
}

.field input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid #dbe3ea;
  border-radius: 12px;
  font-size: 14px;
  color: #0f172a;
  background: rgba(255, 255, 255, 0.96);
  outline: none;
}

.field input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.12);
}

.submit-btn {
  height: 46px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-text {
  margin: 14px 0 0;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.7;
}

.status-text.error {
  background: #fef2f2;
  color: #b91c1c;
}

.guide-box {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 13px;
  line-height: 1.8;
}

.footer-note {
  margin-top: 18px;
  font-size: 12px;
  color: #64748b;
  text-align: center;
}

@media (max-width: 960px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    min-height: 320px;
  }

  .brand-copy,
  .form-panel {
    padding: 32px 24px;
  }
}
</style>
