import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const OUT_DIR = path.resolve("outputs");
await fs.mkdir(OUT_DIR, { recursive: true });

const presentation = Presentation.create({
  slideSize: { width: 1280, height: 720 },
});

const FONT = {
  title: "Microsoft YaHei",
  body: "Microsoft YaHei",
};

const C = {
  bg: "#EEF5FC",
  card: "#FFFFFF",
  navy: "#0E223A",
  ink: "#23384D",
  muted: "#657B91",
  line: "#D9E6F2",
  blue: "#2165F5",
  blueDeep: "#123B74",
  cyan: "#27A9E1",
  green: "#1CA56F",
  violet: "#5D69FF",
  amber: "#F2A11F",
  blueSoft: "#EAF3FF",
  cyanSoft: "#EBF9FF",
  greenSoft: "#ECFBF3",
  violetSoft: "#F1F2FF",
  amberSoft: "#FFF6EA",
};

function addShape(slide, geometry, left, top, width, height, fill, lineFill = "#FFFFFF00", lineWidth = 0) {
  return slide.shapes.add({
    geometry,
    position: { left, top, width, height },
    fill,
    line: { width: lineWidth, fill: lineFill },
  });
}

function addText(slide, content, left, top, width, height, options = {}) {
  const shape = slide.shapes.add({
    geometry: "rect",
    position: { left, top, width, height },
    fill: "#FFFFFF00",
    line: { width: 0, fill: "#FFFFFF00" },
  });
  shape.text = content;
  shape.text.fontSize = options.fontSize ?? 20;
  shape.text.bold = options.bold ?? false;
  shape.text.color = options.color ?? C.ink;
  shape.text.typeface = options.typeface ?? FONT.body;
  shape.text.alignment = options.align ?? "left";
  shape.text.verticalAlignment = options.valign ?? "top";
  shape.text.insets = options.insets ?? { left: 0, right: 0, top: 0, bottom: 0 };
  return shape;
}

function addHeader(slide, eyebrow, title, subtitle, index, total) {
  slide.background.fill = C.bg;
  slide.shapes.add({
    geometry: "rect",
    position: { left: 0, top: 0, width: 1280, height: 116 },
    fill: {
      gradient: {
        angle: 0,
        stops: [
          { position: 0, color: C.blueDeep, transparency: 0 },
          { position: 100000, color: C.blue, transparency: 12 },
        ],
      },
    },
    line: { width: 0, fill: "#FFFFFF00" },
  });
  slide.shapes.add({
    geometry: "ellipse",
    position: { left: 970, top: -32, width: 250, height: 250 },
    fill: { color: "#D8EEFF", transparency: 34 },
    line: { width: 0, fill: "#FFFFFF00" },
  });
  slide.shapes.add({
    geometry: "ellipse",
    position: { left: 1080, top: 28, width: 120, height: 120 },
    fill: { color: "#FFFFFF", transparency: 42 },
    line: { width: 0, fill: "#FFFFFF00" },
  });
  addShape(slide, "roundRect", 52, 42, 1176, 130, C.card, "#E2ECF7", 1.2);
  addShape(slide, "roundRect", 78, 64, 120, 34, C.blueSoft, "#D7E8FF", 1);
  addText(slide, "知行雷达", 88, 73, 100, 18, { fontSize: 17, bold: true, color: C.blue, align: "center" });
  addText(slide, eyebrow, 82, 108, 360, 22, { fontSize: 17, color: C.muted, bold: true });
  addText(slide, title, 82, 136, 820, 46, { fontSize: index === 0 ? 34 : 30, bold: true, color: C.navy });
  addText(slide, subtitle, 82, 188, 860, 38, { fontSize: 16, color: C.muted });
  addShape(slide, "roundRect", 1010, 76, 168, 40, C.blueSoft, "#D8E8FF", 1);
  addText(slide, "学生成长分析平台", 1022, 88, 144, 18, { fontSize: 14, bold: true, color: C.blueDeep, align: "center" });
  addShape(slide, "rect", 68, 228, 1144, 2, C.line);
  addText(slide, `${index + 1} / ${total}`, 1090, 678, 110, 18, { fontSize: 12, color: C.muted, align: "right" });
}

function addBullets(slide, items, left, top, width, gap = 46, color = C.blue) {
  items.forEach((item, idx) => {
    addShape(slide, "ellipse", left, top + idx * gap + 7, 14, 14, color);
    addText(slide, item, left + 24, top + idx * gap, width, 30, { fontSize: 19, color: C.ink });
  });
}

function addAccentCards(slide, cards, left = 716, top = 252, width = 474, height = 110, gap = 130) {
  cards.forEach((card, idx) => {
    const y = top + idx * gap;
    addShape(slide, "roundRect", left, y, width, height, card.fill, "#DDE8F4", 1.2);
    addShape(slide, "rect", left, y, width, 6, card.badgeFill);
    addText(slide, card.title, left + 28, y + 20, 240, 28, { fontSize: 22, bold: true, color: C.navy });
    addText(slide, card.body, left + 28, y + 56, 390, 36, { fontSize: 16, color: C.muted });
    addShape(slide, "roundRect", left + 380, y + 22, 68, 68, card.badgeFill);
    addText(slide, card.badge, left + 392, y + 42, 44, 20, { fontSize: 18, bold: true, color: "#FFFFFF", align: "center" });
  });
}

function addMetricCards(slide, cards) {
  cards.forEach((card, idx) => {
    const left = 68 + idx * 290;
    addShape(slide, "roundRect", left, 252, 260, 118, card.fill, "#DDE8F4", 1.2);
    addShape(slide, "rect", left + 18, 270, 4, 60, card.accent ?? C.blue);
    addText(slide, card.label, left + 32, 274, 170, 20, { fontSize: 16, bold: true, color: C.muted });
    addText(slide, card.value, left + 32, 309, 180, 34, { fontSize: 30, bold: true, color: C.navy });
    addText(slide, card.note, left + 32, 350, 190, 20, { fontSize: 13, color: C.muted });
  });
}

function addGrid(slide, cards) {
  cards.forEach((card, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const left = 78 + col * 560;
    const top = 258 + row * 166;
    addShape(slide, "roundRect", left, top, 520, 138, card.fill, "#DDE8F4", 1.2);
    addShape(slide, "rect", left, top, 520, 6, card.badgeFill);
    addShape(slide, "roundRect", left + 24, top + 22, 50, 50, card.badgeFill);
    addText(slide, card.badge, left + 35, top + 37, 28, 18, { fontSize: 18, bold: true, color: "#FFFFFF", align: "center" });
    addText(slide, card.title, left + 92, top + 28, 320, 26, { fontSize: 21, bold: true, color: C.navy });
    addText(slide, card.body, left + 24, top + 78, 458, 38, { fontSize: 16, color: C.muted });
  });
}

const slides = [
  {
    eyebrow: "第十七届中国大学生服务外包创新创业大赛 A14 赛题",
    title: "知行雷达：高校学生行为分析与成长支持平台",
    subtitle: "多源数据融合 · 学生画像 · 风险预警 · 个性化报告 · Web / 安卓一体化服务",
    render(slide) {
      addShape(slide, "roundRect", 72, 278, 1136, 294, C.card, "#DDE8F4", 1.2);
      addText(slide, "项目关键词", 100, 312, 140, 22, { fontSize: 18, color: C.blue, bold: true });
      const tags = ["个体画像", "群体画像", "风险预测", "多任务模型", "智能助手", "移动端同步"];
      tags.forEach((tag, idx) => {
        const x = 100 + (idx % 3) * 188;
        const y = 352 + Math.floor(idx / 3) * 58;
        addShape(slide, "roundRect", x, y, 148, 38, C.blueSoft, "#D8E8FF", 1);
        addText(slide, tag, x + 18, y + 10, 112, 18, { fontSize: 15, color: C.blue, bold: true, align: "center" });
      });
      addText(slide, "面向高校学生管理、辅导员支持与学生自助成长场景，构建一套可运行、可展示、可扩展的学生成长分析系统。", 716, 324, 420, 74, { fontSize: 20, color: C.ink });
      addText(slide, "知行雷达", 716, 446, 320, 36, { fontSize: 34, bold: true, color: C.navy });
      addText(slide, "让成长状态看得见、讲得清、可行动", 716, 494, 360, 24, { fontSize: 18, color: C.muted });
    },
  },
  {
    eyebrow: "项目背景",
    title: "高校学生管理面临从经验判断走向数据驱动的转变",
    subtitle: "我们聚焦“识别不及时、解释不充分、干预不精准、展示不完整”四类核心问题",
    render(slide) {
      addBullets(slide, [
        "多源学生行为数据分散，难以统一归集和清洗",
        "传统预警依赖经验判断，缺少量化依据",
        "学生个体差异明显，统一管理难以触达真实需求",
        "管理端与学生端之间缺少统一的数据服务入口",
        "系统往往只给结论，不给解释与建议",
      ], 90, 270, 540, 50, C.blue);
      addAccentCards(slide, [
        { title: "数据割裂", body: "门禁、图书馆、学业、体测、英语、奖助学金等数据口径不统一。", fill: C.blueSoft, badgeFill: C.blue, badge: "数" },
        { title: "解释不足", body: "只有风险等级或分数，缺少可支撑干预的解释依据。", fill: C.cyanSoft, badgeFill: C.cyan, badge: "释" },
        { title: "展示单薄", body: "缺少全样本图表、移动端与学生自助服务能力。", fill: C.violetSoft, badgeFill: C.violet, badge: "展" },
      ]);
    },
  },
  {
    eyebrow: "赛题对齐",
    title: "围绕 A14 赛题要求组织系统能力与交付成果",
    subtitle: "从画像、模式识别、预测指标、分析成果与解释能力五个方向完成落地",
    render(slide) {
      addGrid(slide, [
        { title: "8 张分析成果图", body: "系统已形成 8 张全样本分析图，支持点击查看图表解释。", fill: C.blueSoft, badgeFill: C.blue, badge: "8" },
        { title: "学生个体画像", body: "围绕风险、投入、健康、发展四个维度形成个人成长画像。", fill: C.cyanSoft, badgeFill: C.cyan, badge: "个" },
        { title: "学生群体画像", body: "按学院、专业展示风险率、主导画像与细分子类分布。", fill: C.greenSoft, badgeFill: C.green, badge: "群" },
        { title: "4 类学生模式", body: "识别高投入稳健型、低投入风险型、夜间波动型、发展过渡型。", fill: C.violetSoft, badgeFill: C.violet, badge: "4" },
        { title: "AUC 达标", body: "风险预测和英语通过预测等核心模型达到可展示指标。", fill: C.amberSoft, badgeFill: C.amber, badge: "模" },
        { title: "多维解释能力", body: "从学习投入、行为规律、健康发展、资源利用等维度解释结论。", fill: C.blueSoft, badgeFill: C.blue, badge: "释" },
      ]);
    },
  },
  {
    eyebrow: "项目目标",
    title: "构建“识别—解释—干预—服务”的完整学生成长支持闭环",
    subtitle: "项目既满足竞赛要求，也贴近高校学生工作中的真实使用场景",
    render(slide) {
      addBullets(slide, [
        "统一接入学生基础、行为、成绩、体测与英语等多源数据",
        "建立个体画像与群体画像并联动展示",
        "完成风险识别与多任务成长预测",
        "生成个性化报告与可执行建议",
        "通过 Web 与安卓端形成完整使用闭环",
      ], 88, 280, 540, 52, C.cyan);
      addShape(slide, "roundRect", 718, 274, 470, 286, C.card, "#DDE8F4", 1.2);
      addText(slide, "闭环价值", 748, 302, 160, 22, { fontSize: 18, color: C.blue, bold: true });
      const chain = [["识别", C.blue], ["解释", C.cyan], ["干预", C.green], ["服务", C.violet]];
      chain.forEach(([label, color], idx) => {
        const left = 758 + idx * 92;
        addShape(slide, "roundRect", left, 384, 74, 74, color);
        addText(slide, label, left + 14, 408, 46, 20, { fontSize: 18, color: "#FFFFFF", bold: true, align: "center" });
        if (idx < chain.length - 1) addShape(slide, "rect", left + 80, 418, 40, 4, "#BDD7FF");
      });
      addText(slide, "从被动筛查走向主动洞察和持续支持。", 760, 504, 340, 24, { fontSize: 18, color: C.muted });
    },
  },
  {
    eyebrow: "系统架构",
    title: "统一后端 + 双 Web 前端 + 安卓端 + 智能助手的整体方案",
    subtitle: "围绕 Flask API 搭建统一业务中台，支撑管理端、学生端与移动端同步取数",
    render(slide) {
      addShape(slide, "roundRect", 98, 296, 258, 118, C.blueSoft, "#DDE8F4", 1.2);
      addShape(slide, "roundRect", 512, 242, 262, 228, C.card, "#DDE8F4", 1.2);
      addShape(slide, "roundRect", 922, 194, 238, 98, C.cyanSoft, "#DDE8F4", 1.2);
      addShape(slide, "roundRect", 922, 320, 238, 98, C.greenSoft, "#DDE8F4", 1.2);
      addShape(slide, "roundRect", 922, 446, 238, 98, C.violetSoft, "#DDE8F4", 1.2);
      addText(slide, "多源数据层", 164, 330, 120, 22, { fontSize: 22, color: C.navy, bold: true, align: "center" });
      addText(slide, "基础信息 / 行为 / 学业 / 体测 / 英语 / 奖助 / 竞赛", 116, 366, 220, 44, { fontSize: 15, color: C.muted, align: "center" });
      addText(slide, "统一 Flask 服务层", 552, 276, 184, 22, { fontSize: 24, color: C.navy, bold: true, align: "center" });
      addBullets(slide, ["鉴权与账号", "画像与风险接口", "预测与报告服务", "图表与大模型接口"], 548, 326, 180, 34, C.blue);
      addText(slide, "管理端 Web", 986, 226, 110, 20, { fontSize: 22, color: C.navy, bold: true, align: "center" });
      addText(slide, "总览 / 名单 / 对比 / 模型 / 分析成果", 944, 252, 194, 24, { fontSize: 14, color: C.muted, align: "center" });
      addText(slide, "学生端 Web", 986, 352, 110, 20, { fontSize: 22, color: C.navy, bold: true, align: "center" });
      addText(slide, "画像 / 预测 / 报告 / 智能助手", 950, 378, 182, 24, { fontSize: 14, color: C.muted, align: "center" });
      addText(slide, "安卓端", 1012, 478, 70, 20, { fontSize: 22, color: C.navy, bold: true, align: "center" });
      addText(slide, "学生端与管理端移动化同步", 948, 504, 188, 24, { fontSize: 14, color: C.muted, align: "center" });
      addShape(slide, "rect", 356, 350, 124, 4, "#BFD8FF");
      addShape(slide, "rect", 774, 240, 120, 4, "#BFD8FF");
      addShape(slide, "rect", 774, 366, 120, 4, "#BFD8FF");
      addShape(slide, "rect", 774, 492, 120, 4, "#BFD8FF");
    },
  },
  {
    eyebrow: "数据工程",
    title: "多源数据整合与特征工程形成统一分析底座",
    subtitle: "从原始业务表到训练主表、分析主表与特征表，建立稳定的数据口径",
    render(slide) {
      addGrid(slide, [
        { title: "基础信息统一", body: "性别、民族、政治面貌、学院、专业、籍贯等字段统一对齐。", fill: C.blueSoft, badgeFill: C.blue, badge: "基" },
        { title: "行为数据聚合", body: "上网、门禁、图书馆、课程学习、视频时长等多来源聚合。", fill: C.cyanSoft, badgeFill: C.cyan, badge: "行" },
        { title: "学业成长接入", body: "英语、综合成绩、奖学金、竞赛、体测等统一纳入。", fill: C.greenSoft, badgeFill: C.green, badge: "学" },
        { title: "缺失值治理", body: "纠正将缺失误写成 0 的问题，页面明确标记“暂无原始记录”。", fill: C.amberSoft, badgeFill: C.amber, badge: "缺" },
        { title: "基本特征+进阶特征", body: "只展示真实业务特征，不把派生展示字段混入核心特征表。", fill: C.violetSoft, badgeFill: C.violet, badge: "特" },
        { title: "可追溯审计", body: "已回查基本特征与 data 原始表的对应关系并形成审计结果。", fill: C.blueSoft, badgeFill: C.blue, badge: "审" },
      ]);
    },
  },
  {
    eyebrow: "个体画像",
    title: "学生个体画像：把行为数据转成可理解的成长视图",
    subtitle: "围绕学习投入、行为规律、健康发展与综合发展构建个体成长状态图谱",
    render(slide) {
      addBullets(slide, [
        "主画像：概括学生当前的整体状态类型",
        "细分子类：进一步区分同一类中的不同特征",
        "指标排序：展示优势项与待提升项",
        "核心判断：告诉老师和学生最重要的结论是什么",
        "建议模块：把画像结果转化为行动建议",
      ], 90, 278, 540, 52, C.blue);
      addAccentCards(slide, [
        { title: "主画像", body: "高投入稳健型、低投入风险型、夜间波动型、发展过渡型。", fill: C.blueSoft, badgeFill: C.blue, badge: "主" },
        { title: "细分画像", body: "如资源活跃稳健子类、节律失衡风险子类等 12 类细分。", fill: C.cyanSoft, badgeFill: C.cyan, badge: "细" },
        { title: "画像解释", body: "已在管理端与学生端加入统一的画像说明入口。", fill: C.greenSoft, badgeFill: C.green, badge: "释" },
      ]);
    },
  },
  {
    eyebrow: "群体画像",
    title: "群体画像：从个人走向学院、专业与全样本视角",
    subtitle: "支持按学院和专业维度查看高风险率、主导画像与主导细分画像",
    render(slide) {
      addMetricCards(slide, [
        { label: "分组维度", value: "学院 / 专业", note: "支持切换查看", fill: C.blueSoft, accent: C.blue },
        { label: "核心指标", value: "风险率", note: "高风险学生占比分层展示", fill: C.cyanSoft, accent: C.cyan },
        { label: "画像结构", value: "主导画像", note: "显示人数最多的画像类别", fill: C.greenSoft, accent: C.green },
        { label: "细分解释", value: "主导细分", note: "每个细分画像都带解释说明", fill: C.violetSoft, accent: C.violet },
      ]);
      addText(slide, "系统已经明确区分“高风险率”和“主导画像”不是同一个统计口径，避免误解某学院既高风险又高投入稳健的现象。", 90, 430, 1080, 56, { fontSize: 20, color: C.ink });
    },
  },
  {
    eyebrow: "模式识别",
    title: "4 类学生模式 + 12 类细分子类提升群体识别精度",
    subtitle: "系统不仅告诉我们“哪一类学生”，还进一步说明“这类里具体是哪一种”",
    render(slide) {
      addGrid(slide, [
        { title: "高投入稳健型", body: "整体投入高、状态稳，包含资源活跃、潜力释放、节律稳定等子类。", fill: C.blueSoft, badgeFill: C.blue, badge: "稳" },
        { title: "低投入风险型", body: "投入不足且风险敏感，包含资源稀缺补强、节律失衡、基础薄弱等子类。", fill: C.amberSoft, badgeFill: C.amber, badge: "险" },
        { title: "夜间波动型", body: "夜间活跃与作息波动明显，需重点观察节律偏移与波动风险。", fill: C.cyanSoft, badgeFill: C.cyan, badge: "夜" },
        { title: "发展过渡型", body: "当前处于适应与过渡阶段，强调成长潜力与状态稳定。", fill: C.violetSoft, badgeFill: C.violet, badge: "过" },
      ]);
    },
  },
  {
    eyebrow: "核心模型",
    title: "风险预测模型：作为系统的核心判断引擎",
    subtitle: "围绕风险识别建立核心二分类模型，并作为多个页面的统一风险来源",
    render(slide) {
      addMetricCards(slide, [
        { label: "风险模型 AUC", value: "0.921", note: "满足赛题要求", fill: C.greenSoft, accent: C.green },
        { label: "交叉验证 AUC", value: "0.936", note: "表现稳定", fill: C.violetSoft, accent: C.violet },
        { label: "口径统一", value: "已完成", note: "区分概率、标签与画像", fill: C.blueSoft, accent: C.blue },
        { label: "展示入口", value: "多页面联动", note: "总览 / 名单 / 学生首页同步展示", fill: C.cyanSoft, accent: C.cyan },
      ]);
      addBullets(slide, [
        "风险预测是整个系统最核心的模型任务",
        "结果同步服务于管理端总览、风险名单与学生端首页",
        "系统通过解释因素与画像维度增强结果可信度",
      ], 90, 430, 600, 50, C.blue);
    },
  },
  {
    eyebrow: "扩展模型",
    title: "多任务成长预测：从风险识别走向成长能力判断",
    subtitle: "围绕奖学金、英语、成绩、健康、趋势、学习投入与综合发展构建多模型体系",
    render(slide) {
      addGrid(slide, [
        { title: "奖学金概率", body: "辅助识别成长机会与高表现学生。", fill: C.blueSoft, badgeFill: C.blue, badge: "奖" },
        { title: "英语四/六级", body: "四级 AUC 约 0.865，六级 AUC 约 0.989。", fill: C.cyanSoft, badgeFill: C.cyan, badge: "英" },
        { title: "健康分类", body: "Macro F1 约 0.75，避免特征泄漏后的合理指标。", fill: C.greenSoft, badgeFill: C.green, badge: "健" },
        { title: "学习投入分类", body: "Macro F1 约 0.92，用于判断投入档次。", fill: C.violetSoft, badgeFill: C.violet, badge: "投" },
        { title: "综合发展分类", body: "Macro F1 约 0.90，用于反映成长潜力。", fill: C.amberSoft, badgeFill: C.amber, badge: "发" },
        { title: "变化趋势预测", body: "用于观察未来状态变化与持续跟踪。", fill: C.blueSoft, badgeFill: C.blue, badge: "变" },
      ]);
    },
  },
  {
    eyebrow: "可解释性",
    title: "结果不仅有分数，还能解释“为什么”和“怎么办”",
    subtitle: "我们把模型输出、画像说明、关键特征与建议统一组织成可解释结果",
    render(slide) {
      addAccentCards(slide, [
        { title: "关键影响因素", body: "展示对单学生结果影响较大的核心特征。", fill: C.blueSoft, badgeFill: C.blue, badge: "因" },
        { title: "画像说明", body: "解释主画像、细分子类以及对应管理含义。", fill: C.cyanSoft, badgeFill: C.cyan, badge: "像" },
        { title: "干预建议", body: "根据个体画像和风险状态生成可执行建议。", fill: C.greenSoft, badgeFill: C.green, badge: "策" },
      ]);
      addBullets(slide, [
        "满足赛题对多维解释能力的要求",
        "在管理端和学生端都能查看解释内容",
        "让“预测结果”真正变成“行动依据”",
      ], 90, 310, 520, 52, C.violet);
    },
  },
  {
    eyebrow: "分析成果",
    title: "8 张全样本分析图构成系统级证据链",
    subtitle: "从群体分布、结构差异、趋势与重要关联四个角度支撑系统展示",
    render(slide) {
      addMetricCards(slide, [
        { label: "图表数量", value: "8", note: "满足赛题要求区间", fill: C.blueSoft, accent: C.blue },
        { label: "查看方式", value: "点图解读", note: "图卡 + 抽屉解释", fill: C.cyanSoft, accent: C.cyan },
        { label: "跨端能力", value: "Web / 安卓", note: "两端均支持查看", fill: C.greenSoft, accent: C.green },
        { label: "分析维度", value: "多维度", note: "风险 / 画像 / 行为 / 资源", fill: C.violetSoft, accent: C.violet },
      ]);
      addBullets(slide, [
        "支撑群体画像、模式识别和整体趋势判断",
        "帮助老师快速理解图表看点，而不是只看静态图片",
        "点击图表可查看横轴、纵轴、图表用途与系统结论",
      ], 90, 430, 600, 48, C.amber);
    },
  },
  {
    eyebrow: "管理端",
    title: "Web 管理端：从总览到单学生详情形成完整管理链路",
    subtitle: "面向学校、学院和辅导员角色，突出全局看板、重点名单与深度报告",
    render(slide) {
      addGrid(slide, [
        { title: "总览主页", body: "样本总量、风险分布、注册覆盖率和重点学生一屏查看。", fill: C.blueSoft, badgeFill: C.blue, badge: "总" },
        { title: "风险名单", body: "查看重点学生并进入学生详情与完整报告。", fill: C.amberSoft, badgeFill: C.amber, badge: "单" },
        { title: "院系对比", body: "比较学院风险率、主导画像和主导细分画像。", fill: C.cyanSoft, badgeFill: C.cyan, badge: "比" },
        { title: "预测模块", body: "集中查看模型指标并检索单学生全部预测结果。", fill: C.greenSoft, badgeFill: C.green, badge: "模" },
        { title: "分析成果", body: "查看 8 张图表及其详细说明。", fill: C.violetSoft, badgeFill: C.violet, badge: "图" },
        { title: "完整报告", body: "结构化呈现结论、解释、建议与关键特征。", fill: C.blueSoft, badgeFill: C.blue, badge: "报" },
      ]);
    },
  },
  {
    eyebrow: "学生端",
    title: "学生端：从被管理对象转化为自助成长参与者",
    subtitle: "学生可查看画像、报告、预测结果并通过智能助手理解自己的成长状态",
    render(slide) {
      addGrid(slide, [
        { title: "我的画像", body: "查看主画像、细分子类、优势项与待提升项。", fill: C.blueSoft, badgeFill: C.blue, badge: "像" },
        { title: "在线预测", body: "输入关键字段后实时得到多模型预测结果。", fill: C.cyanSoft, badgeFill: C.cyan, badge: "测" },
        { title: "群体对比", body: "比较个人与群体均值的差异。", fill: C.greenSoft, badgeFill: C.green, badge: "比" },
        { title: "个性化报告", body: "集中查看结论、依据与建议。", fill: C.violetSoft, badgeFill: C.violet, badge: "报" },
        { title: "全样本分析", body: "以学生视角理解全样本分析成果。", fill: C.amberSoft, badgeFill: C.amber, badge: "图" },
        { title: "智能助手", body: "围绕画像、风险与系统功能进行问答。", fill: C.blueSoft, badgeFill: C.blue, badge: "AI" },
      ]);
    },
  },
  {
    eyebrow: "移动端",
    title: "安卓端同步核心能力，形成可展示、可运行的移动闭环",
    subtitle: "学生端与管理端都已完成移动化重排，并统一到“知行雷达”品牌风格",
    render(slide) {
      addMetricCards(slide, [
        { label: "学生端", value: "已同步", note: "画像 / 预测 / 报告 / 智能助手", fill: C.blueSoft, accent: C.blue },
        { label: "管理端", value: "已同步", note: "总览 / 名单 / 对比 / 分析成果", fill: C.cyanSoft, accent: C.cyan },
        { label: "品牌统一", value: "知行雷达", note: "图标 / 名称 / 导航 / 主题统一", fill: C.greenSoft, accent: C.green },
        { label: "交互重排", value: "移动优先", note: "不是简单缩放 Web 页面", fill: C.violetSoft, accent: C.violet },
      ]);
      addText(slide, "移动端采用更轻量、更简洁的浅蓝白科技感风格，同时保留图表查看、详情页、预测页与设置中心等关键功能。", 90, 432, 1060, 56, { fontSize: 20, color: C.ink });
    },
  },
  {
    eyebrow: "智能服务",
    title: "接入千问大模型，构建可对话的学生智能助手",
    subtitle: "把静态系统页面扩展成可解释、可问答、可引导的交互式服务入口",
    render(slide) {
      addAccentCards(slide, [
        { title: "画像问答", body: "解释学生画像、细分子类和风险等级的含义。", fill: C.blueSoft, badgeFill: C.blue, badge: "问" },
        { title: "建议生成", body: "结合当前账号数据生成学习与提升建议。", fill: C.cyanSoft, badgeFill: C.cyan, badge: "建" },
        { title: "系统导览", body: "帮助学生理解各模块功能和使用方式。", fill: C.greenSoft, badgeFill: C.green, badge: "导" },
      ]);
      addBullets(slide, [
        "后端统一封装大模型接口，Web 与安卓学生端都可访问",
        "保留会话历史，支持围绕画像和报告连续交流",
        "增强系统互动性和展示亮点",
      ], 90, 312, 520, 52, C.violet);
    },
  },
  {
    eyebrow: "工程难点",
    title: "我们重点解决了数据口径、模型可信度与移动端稳定性问题",
    subtitle: "不只是堆功能，而是围绕真实问题做了系统性治理与修复",
    render(slide) {
      addGrid(slide, [
        { title: "缺失值治理", body: "修正把缺失值误写成 0 的问题，并在前端明确标注。", fill: C.amberSoft, badgeFill: C.amber, badge: "缺" },
        { title: "风险口径统一", body: "区分风险等级、风险标签与画像类别，避免语义冲突。", fill: C.blueSoft, badgeFill: C.blue, badge: "口" },
        { title: "账号同步", body: "统一 Web 与移动端读取的数据库路径与账号绑定链路。", fill: C.cyanSoft, badgeFill: C.cyan, badge: "账" },
        { title: "移动端稳定", body: "重建 pages.json、manifest 和关键页面，解决白屏与乱码。", fill: C.greenSoft, badgeFill: C.green, badge: "稳" },
      ]);
    },
  },
  {
    eyebrow: "可信度控制",
    title: "模型指标不仅要高，更要可解释、可信赖",
    subtitle: "我们关注 AUC 达标，也排查高指标背后的类别不平衡与潜在泄漏问题",
    render(slide) {
      addBullets(slide, [
        "风险模型 AUC 超过 0.92，满足赛题要求",
        "四级模型更接近真实预测任务，六级模型同时说明样本不平衡背景",
        "多分类任务优先展示 Macro F1 与 Accuracy，而不是生硬强调 AUC",
        "健康、学习投入、综合发展等模型都做了可信度口径修正",
        "系统展示结果时同步补充解释与限制说明",
      ], 88, 280, 560, 48, C.blue);
      addShape(slide, "roundRect", 718, 278, 472, 252, C.card, "#DDE8F4", 1.2);
      addText(slide, "可信度控制策略", 748, 308, 220, 22, { fontSize: 20, bold: true, color: C.navy });
      addBullets(slide, [
        "不夸大单一指标",
        "区分二分类与多分类口径",
        "说明样本不平衡背景",
        "排查特征泄漏风险",
      ], 748, 352, 320, 40, C.green);
    },
  },
  {
    eyebrow: "交付形态",
    title: "项目已经具备完整的竞赛交付与演示基础",
    subtitle: "从源码、模型、文档到 PPT、视频脚本和移动端安装包，形成完整材料体系",
    render(slide) {
      addGrid(slide, [
        { title: "源码与模型", body: "包含前后端代码、数据库、模型文件和图表资源。", fill: C.blueSoft, badgeFill: C.blue, badge: "码" },
        { title: "文档与部署", body: "提供部署说明、接口契约、环境步骤与 Demo 说明。", fill: C.cyanSoft, badgeFill: C.cyan, badge: "文" },
        { title: "PPT 与视频脚本", body: "便于快速录制演示视频和准备答辩。", fill: C.violetSoft, badgeFill: C.violet, badge: "演" },
        { title: "移动端安装包", body: "支持安卓真机安装与基座调试。", fill: C.greenSoft, badgeFill: C.green, badge: "端" },
      ]);
    },
  },
  {
    eyebrow: "应用价值",
    title: "从竞赛作品走向校园管理与学生成长支持的实际应用",
    subtitle: "项目兼顾展示效果与真实业务逻辑，具备继续部署和扩展的潜力",
    render(slide) {
      addBullets(slide, [
        "帮助学校更早识别需要关注的学生群体",
        "帮助辅导员从名单走向解释和建议",
        "帮助学生理解自身状态并做出主动调整",
        "支持服务器部署、账号扩展与后续接入更多数据",
      ], 88, 290, 560, 52, C.cyan);
      addShape(slide, "roundRect", 720, 286, 470, 250, C.blueSoft, "#DDE8F4", 1.2);
      addText(slide, "后续扩展方向", 748, 316, 180, 22, { fontSize: 20, bold: true, color: C.navy });
      addBullets(slide, [
        "接入更多高校业务数据",
        "完善干预闭环工作流",
        "正式部署到服务器",
        "形成持续运营的数据平台",
      ], 748, 360, 320, 40, C.blue);
    },
  },
  {
    eyebrow: "总结",
    title: "知行雷达：让学生成长状态看得见、讲得清、可行动",
    subtitle: "项目完成了从多源数据、画像分析、风险预警到多端服务与智能交互的完整闭环",
    render(slide) {
      addShape(slide, "roundRect", 92, 284, 1096, 250, C.card, "#DDE8F4", 1.2);
      addText(slide, "项目亮点回顾", 120, 320, 220, 22, { fontSize: 20, color: C.blue, bold: true });
      addBullets(slide, [
        "多源数据融合 + 学生个体画像 + 群体画像",
        "风险预警 + 多任务成长预测 + 可解释结果",
        "管理端、学生端、安卓端、智能助手四位一体",
        "具备完整竞赛交付形态与后续扩展能力",
      ], 120, 362, 760, 48, C.blue);
      addShape(slide, "roundRect", 932, 332, 168, 168, C.cyanSoft, "#DDE8F4", 1.2);
      addText(slide, "知行\n雷达", 964, 370, 104, 80, { fontSize: 28, bold: true, color: C.navy, align: "center" });
    },
  },
];

const exportedSlides = slides.filter((_, index) => ![17, 20].includes(index));

exportedSlides.forEach((def, index) => {
  const slide = presentation.slides.add();
  addHeader(slide, def.eyebrow, def.title, def.subtitle, index, exportedSlides.length);
  def.render(slide);
});

const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(path.join(OUT_DIR, "02_项目简介PPT_20页_精修版.pptx"));
