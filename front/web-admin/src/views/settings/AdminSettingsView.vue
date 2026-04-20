<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '../../stores/auth';
import { useAdminLayoutPreferences } from '../../utils/layoutPreferences';

const auth = useAuthStore();
const preferences = useAdminLayoutPreferences();

const accountRows = computed(() => [
  { label: '姓名', value: auth.user?.name || '张老师' },
  { label: '账号', value: auth.user?.username || 'admin001' },
  { label: '角色', value: auth.user?.role || 'admin' },
  { label: '权限范围', value: '管理员全局视角' }
]);

const statusCards = computed(() => [
  { label: '数据状态', value: 'analysis_master 已接入' },
  { label: '模型状态', value: '风险预测可用' },
  { label: '报告状态', value: preferences.allowExportReports ? '允许导出' : '仅预览' },
  { label: '默认首页', value: preferences.defaultLandingPage }
]);

const passwordDialogVisible = ref(false);
const deviceDrawerVisible = ref(false);
const permissionDrawerVisible = ref(false);
const helpDrawerVisible = ref(false);
const helpTitle = ref('帮助中心');
const helpContent = ref('');
const passwordForm = reactive({
  currentPassword: '',
  nextPassword: '',
  confirmPassword: ''
});

const deviceRows = computed(() => [
  { name: '当前浏览器', status: '在线', location: '本机 Windows', lastActive: '刚刚' },
  { name: '后台管理会话', status: '在线', location: '管理控制台', lastActive: '当前会话' },
  { name: '最近一次登录记录', status: '离线', location: '本机浏览器', lastActive: '今日较早' }
]);

const permissionRows = computed(() => [
  { label: '风险名单与学生详情', value: '可查看学生名单、画像、详细特征和完整报告。' },
  { label: '分析成果与院系对比', value: '可查看全样本图表、学院对比和专业对比结果。' },
  { label: '导出权限', value: preferences.allowExportReports ? '当前允许导出完整报告。' : '当前仅允许在线预览。' },
  { label: '敏感字段可见性', value: preferences.showSensitiveFields ? '当前显示详细行为与成绩字段。' : '当前隐藏敏感字段。' }
]);

function openPasswordDialog() {
  passwordDialogVisible.value = true;
}

function submitPasswordChange() {
  if (!passwordForm.currentPassword || !passwordForm.nextPassword || !passwordForm.confirmPassword) {
    ElMessage.warning('请先填写完整的密码信息。');
    return;
  }
  if (passwordForm.nextPassword !== passwordForm.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致，请重新确认。');
    return;
  }
  passwordDialogVisible.value = false;
  passwordForm.currentPassword = '';
  passwordForm.nextPassword = '';
  passwordForm.confirmPassword = '';
  ElMessage.success('已记录修改密码请求，请按新密码重新登录。');
}

function openDeviceDrawer() {
  deviceDrawerVisible.value = true;
}

async function handleLogoutAllDevices() {
  await ElMessageBox.confirm('确定要让当前账号在其他设备上全部退出登录吗？', '退出全部设备', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  });
  ElMessage.success('已发起全部设备退出。');
}

function openPermissionDrawer() {
  permissionDrawerVisible.value = true;
}

function openHelp(title: string, content: string) {
  helpTitle.value = title;
  helpContent.value = content;
  helpDrawerVisible.value = true;
}
</script>

<template>
  <section class="page-shell settings-page">
    <div class="hero panel-card">
      <div class="hero-copy">
        <div class="hero-eyebrow">知行雷达管理端</div>
        <h1 class="hero-title">设置中心</h1>
        <p class="hero-subtitle">这里统一管理账号安全、通知提醒、数据权限、报告导出、分析展示和系统状态，让日常使用更加顺手。</p>
      </div>
      <div class="hero-badge">后台偏好设置</div>
    </div>

    <div class="status-grid">
      <article v-for="item in statusCards" :key="item.label" class="status-card panel-card">
        <div class="status-label">{{ item.label }}</div>
        <div class="status-value">{{ item.value }}</div>
      </article>
    </div>

    <div class="settings-grid">
      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>账号与安全</span>
            <span class="minor-copy">管理员身份与登录安全</span>
          </div>
        </template>
        <div class="info-list">
          <div v-for="item in accountRows" :key="item.label" class="info-item">
            <span class="info-label">{{ item.label }}</span>
            <span class="info-value">{{ item.value }}</span>
          </div>
          <div class="action-grid">
            <el-button plain @click="openPasswordDialog">修改密码</el-button>
            <el-button plain @click="openDeviceDrawer">登录设备管理</el-button>
            <el-button plain @click="handleLogoutAllDevices">退出全部设备</el-button>
            <el-button plain @click="openPermissionDrawer">查看权限说明</el-button>
          </div>
        </div>
      </el-card>

      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>通知与提醒</span>
            <span class="minor-copy">风险预警、报告生成、干预任务提醒</span>
          </div>
        </template>
        <div class="switch-list">
          <div class="switch-item">
            <div>
              <div class="switch-title">风险预警提醒</div>
              <div class="switch-copy">当高风险学生或重点关注名单出现变化时，在后台显式提醒。</div>
            </div>
            <el-switch v-model="preferences.riskNotice" />
          </div>
          <div class="switch-item">
            <div>
              <div class="switch-title">报告生成提醒</div>
              <div class="switch-copy">当个性化报告生成完成时提示可打印和导出。</div>
            </div>
            <el-switch v-model="preferences.reportNotice" />
          </div>
          <div class="switch-item">
            <div>
              <div class="switch-title">干预任务提醒</div>
              <div class="switch-copy">当重点学生队列或建议发生变化时提醒管理员。</div>
            </div>
            <el-switch v-model="preferences.taskNotice" />
          </div>
        </div>
      </el-card>

      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>隐私与数据权限</span>
            <span class="minor-copy">控制敏感字段和报告导出范围</span>
          </div>
        </template>
        <div class="switch-list">
          <div class="switch-item">
            <div>
              <div class="switch-title">显示敏感字段</div>
              <div class="switch-copy">控制学生详细行为数据、成绩字段和账号状态等敏感信息是否在界面中默认展示。</div>
            </div>
            <el-switch v-model="preferences.showSensitiveFields" />
          </div>
          <div class="switch-item">
            <div>
              <div class="switch-title">允许导出完整报告</div>
              <div class="switch-copy">控制管理员是否可导出包含特征明细和解释依据的完整 PDF 报告。</div>
            </div>
            <el-switch v-model="preferences.allowExportReports" />
          </div>
        </div>
      </el-card>

      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>报告与导出</span>
            <span class="minor-copy">决定完整报告的默认组成</span>
          </div>
        </template>
        <div class="form-stack">
          <div class="select-row">
            <div>
              <div class="switch-title">报告模板</div>
              <div class="switch-copy">标准模板更简洁，完整模板会展示更多特征明细和解释链路。</div>
            </div>
            <el-select v-model="preferences.reportTemplate" style="width: 180px">
              <el-option label="标准模板" value="standard" />
              <el-option label="完整模板" value="competition" />
            </el-select>
          </div>
          <div class="switch-item compact-item">
            <div>
              <div class="switch-title">导出时附带特征总表</div>
              <div class="switch-copy">将全部原始特征、进阶特征和模型输出一起写进报告。</div>
            </div>
            <el-switch v-model="preferences.includeFeatureTableInExport" />
          </div>
          <div class="switch-item compact-item">
            <div>
              <div class="switch-title">导出时附带模型解释</div>
              <div class="switch-copy">将预测依据、维度判读和计算说明一起写入导出报告。</div>
            </div>
            <el-switch v-model="preferences.includeExplanationInExport" />
          </div>
        </div>
      </el-card>

      <el-card class="panel-card">
        <template #header>
          <div class="card-header-inner">
            <span>分析与展示偏好</span>
            <span class="minor-copy">控制默认页面和特征展示深度</span>
          </div>
        </template>
        <div class="form-stack">
          <div class="select-row">
            <div>
              <div class="switch-title">默认首页</div>
              <div class="switch-copy">登录后台后优先进入的页面。</div>
            </div>
            <el-select v-model="preferences.defaultLandingPage" style="width: 180px">
              <el-option label="总览" value="dashboard" />
              <el-option label="风险名单" value="warnings" />
              <el-option label="院系对比" value="profiles" />
              <el-option label="干预工作台" value="tasks" />
            </el-select>
          </div>
          <div class="switch-item compact-item">
            <div>
              <div class="switch-title">自动展开特征总表</div>
              <div class="switch-copy">进入完整报告时直接显示全部特征表格。</div>
            </div>
            <el-switch v-model="preferences.autoExpandFeatureTable" />
          </div>
          <div class="switch-item compact-item">
            <div>
              <div class="switch-title">紧凑模式</div>
              <div class="switch-copy">压缩留白，让风险名单和学生详情页同时显示更多内容。</div>
            </div>
            <el-switch v-model="preferences.compactMode" />
          </div>
          <div class="switch-item compact-item">
            <div>
              <div class="switch-title">强化卡片层级</div>
              <div class="switch-copy">增强概览、名单和报告卡片的层次感。</div>
            </div>
            <el-switch v-model="preferences.highlightPanels" />
          </div>
          <div class="switch-item compact-item">
            <div>
              <div class="switch-title">显示面包屑与顶部状态</div>
              <div class="switch-copy">保留当前路径、账号信息和当前工作模式标识。</div>
            </div>
            <div class="stack-switch">
              <el-switch v-model="preferences.showBreadcrumb" />
              <el-switch v-model="preferences.showContextStrip" />
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="panel-card full-span">
        <template #header>
          <div class="card-header-inner">
            <span>系统与数据状态</span>
            <span class="minor-copy">查看当前数据、报告和图表状态</span>
          </div>
        </template>
        <div class="system-grid">
          <div class="system-item">
            <div class="info-label">数据更新时间</div>
            <div class="system-value">analysis_master 当前可读</div>
            <div class="switch-copy">当前系统已接入主表分析结果、学生详情和完整报告链路。</div>
          </div>
          <div class="system-item">
            <div class="info-label">模型解释状态</div>
            <div class="system-value">预测依据 / 维度判读 / 特征计算说明已启用</div>
            <div class="switch-copy">可以在学生详情与完整报告中查看可解释性链路。</div>
          </div>
          <div class="system-item">
            <div class="info-label">图表生成状态</div>
            <div class="system-value">分析成果页可用</div>
            <div class="switch-copy">若缺少图表生成依赖，页面会显示明确提示信息。</div>
          </div>
          <div class="system-item">
            <div class="info-label">帮助与反馈</div>
            <div class="action-grid">
              <el-button plain @click="openHelp('使用说明', '系统支持按风险、画像、院系和完整报告多维查看学生情况。')">使用说明</el-button>
              <el-button plain @click="openHelp('问题反馈', '如遇到数据缺失、页面异常或报告生成问题，可先刷新并重新加载当前页面。')">问题反馈</el-button>
              <el-button plain @click="openHelp('版本信息', '当前版本已支持完整报告、特征总表、计算依据和干预工作台抽屉详情。')">版本信息</el-button>
              <el-button plain @click="openHelp('帮助中心', '建议优先从风险名单、院系对比和干预工作台进入，再进入单学生详情和完整报告。')">帮助中心</el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="420px">
      <div class="form-stack">
        <el-input v-model="passwordForm.currentPassword" type="password" show-password placeholder="当前密码" />
        <el-input v-model="passwordForm.nextPassword" type="password" show-password placeholder="新密码" />
        <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="确认新密码" />
      </div>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPasswordChange">确认修改</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="deviceDrawerVisible" title="登录设备管理" size="420px">
      <div class="drawer-list">
        <div v-for="item in deviceRows" :key="item.name" class="drawer-card">
          <div class="drawer-card-title">{{ item.name }}</div>
          <div class="drawer-card-copy">状态：{{ item.status }}</div>
          <div class="drawer-card-copy">位置：{{ item.location }}</div>
          <div class="drawer-card-copy">最近活跃：{{ item.lastActive }}</div>
        </div>
      </div>
    </el-drawer>

    <el-drawer v-model="permissionDrawerVisible" title="权限说明" size="420px">
      <div class="drawer-list">
        <div v-for="item in permissionRows" :key="item.label" class="drawer-card">
          <div class="drawer-card-title">{{ item.label }}</div>
          <div class="drawer-card-copy">{{ item.value }}</div>
        </div>
      </div>
    </el-drawer>

    <el-drawer v-model="helpDrawerVisible" :title="helpTitle" size="420px">
      <div class="drawer-card-copy">{{ helpContent }}</div>
    </el-drawer>
  </section>
</template>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 28px;
  background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.2), transparent 38%), linear-gradient(135deg, #0f172a, #10283d 60%, #1f5136);
  color: #f8fafc;
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
  max-width: 820px;
  font-size: 14px;
  line-height: 1.9;
  color: rgba(248, 250, 252, 0.82);
}

.hero-badge {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 12px;
  font-weight: 800;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.status-card {
  padding: 18px 20px;
}

.status-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
}

.status-value {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.5;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.full-span {
  grid-column: 1 / -1;
}

.card-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.minor-copy,
.switch-copy,
.info-label,
.drawer-card-copy {
  font-size: 12px;
  color: #64748b;
  line-height: 1.8;
}

.info-list,
.switch-list,
.form-stack,
.system-grid,
.drawer-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-item,
.switch-item,
.select-row,
.system-item,
.drawer-card {
  padding: 14px 16px;
  border-radius: 14px;
  background: #f8fafc;
}

.info-item,
.switch-item,
.select-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.info-value,
.system-value,
.switch-title,
.drawer-card-title {
  font-weight: 800;
  color: #0f172a;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.stack-switch {
  display: flex;
  gap: 10px;
}

@media (max-width: 1200px) {
  .status-grid,
  .settings-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .hero,
  .status-grid,
  .settings-grid,
  .action-grid {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .status-grid,
  .settings-grid {
    display: grid;
  }

  .info-item,
  .switch-item,
  .select-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
