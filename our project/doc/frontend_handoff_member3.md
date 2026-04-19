# 给 3 号前端的对接说明

这份说明面向前端联调，目标是让页面先跑通，再逐步美化，不需要前端直接理解底层分析表结构。

## 一、你现在直接接什么

前端不要直接读 `analysis_master.csv`，优先接我已经整理好的页面级 JSON。

当前可直接使用的 5 类 payload 在：

- [`analysis/outputs/api_payloads/student_detail_200307700011.json`](/F:/2026.0301/StudentBehaviorProjectDesign/StudentBehaviorProjectDesign/our%20project/analysis/outputs/api_payloads/student_detail_200307700011.json)
- [`analysis/outputs/api_payloads/individual_profile_200307700011.json`](/F:/2026.0301/StudentBehaviorProjectDesign/StudentBehaviorProjectDesign/our%20project/analysis/outputs/api_payloads/individual_profile_200307700011.json)
- [`analysis/outputs/api_payloads/group_profile_200307700011.json`](/F:/2026.0301/StudentBehaviorProjectDesign/StudentBehaviorProjectDesign/our%20project/analysis/outputs/api_payloads/group_profile_200307700011.json)
- [`analysis/outputs/api_payloads/risk_analysis_200307700011.json`](/F:/2026.0301/StudentBehaviorProjectDesign/StudentBehaviorProjectDesign/our%20project/analysis/outputs/api_payloads/risk_analysis_200307700011.json)
- [`analysis/outputs/api_payloads/report_page_200307700011.json`](/F:/2026.0301/StudentBehaviorProjectDesign/StudentBehaviorProjectDesign/our%20project/analysis/outputs/api_payloads/report_page_200307700011.json)

如果你后面要换学生学号，我这边可以继续按同样格式导出新的 payload。

## 二、推荐接入顺序

建议前端按下面顺序接，最稳：

1. 先接 `student_detail`
2. 再接 `individual_profile`
3. 再接 `group_profile`
4. 再接 `risk_analysis`
5. 最后接 `report_page`

原因很简单：

- `student_detail` 最轻，先把基础卡片和页面路由跑起来
- `individual_profile` 能把雷达图和学生画像页跑通
- `group_profile` 能把群体分布、群体卡片、聚类标签页跑通
- `risk_analysis` 能把风险等级、阈值、解释维度跑通
- `report_page` 是整合页，前面四块通了它基本就通了

## 三、字段口径先统一

这几条请前端直接按固定规则处理：

- `student_id` 是主展示标识，页面和路由都可以优先用它
- `college + major` 是当前最稳定的身份说明
- `name` 是可选字段，当前真实数据里经常为空，不能作为页面强依赖
- `consume_avg` 不是当前系统核心字段，前端不要围绕消费做主页面
- 当前画像核心维度是：学习投入、自律水平、健康发展、综合发展、风险反向值
- 当前群体展示标签不是“第 0 类、第 1 类”，而是展示名

当前真实可用群体标签有 4 个：

- `发展过渡型`
- `低投入风险型`
- `夜间波动型`
- `高投入稳健型`

## 四、每个页面建议怎么渲染

### 1. 学生详情页

优先接 `student_detail_*.json`

建议展示：

- 学号
- 学院
- 专业
- 风险等级
- 风险概率
- 群体标签
- 核心指标快照

如果 `name` 为空，就不要显示空名字，直接不展示或写“该学生”。

### 2. 个体画像页

优先接 `individual_profile_*.json`

建议展示：

- 基础信息卡
- 5 维雷达图
- 个体核心指标
- 与全体均值对比
- 与所属群体均值对比
- 当前群体标签和群体特征

雷达图固定用这 5 维：

- 学习投入
- 自律水平
- 健康发展
- 综合发展
- 风险反向值

### 3. 群体画像页

优先接 `group_profile_*.json`

建议展示：

- 群体总览
- 各群体人数分布
- 各群体标签说明
- 各群体特征均值卡片
- 风险分布摘要

这里不要展示原始聚类编号给老师看，优先展示 `label`。

### 4. 风险分析页

优先接 `risk_analysis_*.json`

建议展示：

- 低中高风险阈值
- 风险等级人数分布
- 当前学生风险等级
- 当前学生风险概率
- 风险解释三维度

当前三维风险解释固定是：

- 学习投入风险
- 行为规律风险
- 健康发展风险

### 5. 个性化报告页

优先接 `report_page_*.json`

建议展示顺序：

1. 基础信息
2. 风险结果
3. 个体画像
4. 群体归属
5. 关键解释
6. 个性化建议

这个页面最适合做成最终展示页或弹窗详情页。

## 五、前端最常用的几个对象

重点先记这几个：

- `basic_info`
- `radar_profile`
- `group_profile`
- `risk_result`
- `explanations`
- `suggestions`

详细字段定义已经整理在：

- [`doc/frontend_field_spec.md`](/F:/2026.0301/StudentBehaviorProjectDesign/StudentBehaviorProjectDesign/our%20project/doc/frontend_field_spec.md)

如果前端只想先跑页面，不想一开始吃完整文档，最少理解这几点：

- `basic_info` 负责头部身份信息
- `radar_profile` 直接喂雷达图
- `group_profile` 负责群体卡片和群体解释
- `risk_result` 负责风险颜色、等级、概率
- `explanations` 是解释文案列表
- `suggestions` 是建议文案列表

## 六、联调时最容易踩的坑

- 不要把 `name` 当必填字段
- 不要假设有消费字段可展示
- 不要把 `cluster` 原值直接显示成页面文案
- 不要自己推风险等级，直接用 payload 里给出的结果
- 雷达图不要自己做归一化，直接用 `radar_profile.value`
- 如果一个字段为空，优先隐藏模块，不要显示 `null`

## 七、如果要自己重新导出 payload

导出入口在：

- [`analysis/api_payload_builder.py`](/F:/2026.0301/StudentBehaviorProjectDesign/StudentBehaviorProjectDesign/our%20project/analysis/api_payload_builder.py)

可直接运行：

```powershell
& "F:\2026.0301\StudentBehaviorProjectDesign\StudentBehaviorProjectDesign\our project\.venv\Scripts\python.exe" "F:\2026.0301\StudentBehaviorProjectDesign\StudentBehaviorProjectDesign\our project\analysis\api_payload_builder.py" 200307700011
```

运行后会在 `analysis/outputs/api_payloads` 下生成一整套页面 JSON。

## 八、前端如果只想最短时间出效果

最短路线建议：

1. 先用 `student_detail + individual_profile + report_page`
2. 雷达图先做静态组件，直接喂 `radar_profile`
3. 群体页先用 `group_profile` 做卡片和分布图
4. 风险页先用 `risk_analysis` 做阈值和等级展示

这样即使后端接口还没正式接通，页面演示也已经足够完整。

## 九、当前可直接用于演示的样例

前端联调时除了页面 payload，还可以直接参考 3 份报告样例：

- [`analysis/outputs/reports/samples/low_risk_pjxuqwbj784.json`](/F:/2026.0301/StudentBehaviorProjectDesign/StudentBehaviorProjectDesign/our%20project/analysis/outputs/reports/samples/low_risk_pjxuqwbj784.json)
- [`analysis/outputs/reports/samples/medium_risk_pjxsqxbj966.json`](/F:/2026.0301/StudentBehaviorProjectDesign/StudentBehaviorProjectDesign/our%20project/analysis/outputs/reports/samples/medium_risk_pjxsqxbj966.json)
- [`analysis/outputs/reports/samples/high_risk_pjxuqwbj788.json`](/F:/2026.0301/StudentBehaviorProjectDesign/StudentBehaviorProjectDesign/our%20project/analysis/outputs/reports/samples/high_risk_pjxuqwbj788.json)

这三份最适合拿来做低、中、高风险三种页面状态展示。
