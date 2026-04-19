# 前端字段说明表

本文档对应 [`analysis/api_payload_builder.py`](/F:/2026.0301/StudentBehaviorProjectDesign/StudentBehaviorProjectDesign/our%20project/analysis/api_payload_builder.py) 产出的页面级 JSON。

说明口径：
- `name` 为可选字段，当前真实数据中默认不依赖。
- `consume_avg` 为可选字段，当前真实数据中默认不依赖。
- 前端展示主键统一使用 `student_id`，身份说明统一使用 `college + major`。

## 页面级 Payload

### `student_detail`

| 字段名 | 含义 | 类型 | 是否必填 | 示例值 |
| --- | --- | --- | --- | --- |
| `page` | 页面标识 | `string` | 是 | `student_detail` |
| `basic_info` | 学生基础信息对象 | `object` | 是 | `{...}` |
| `summary` | 风险与群体摘要对象 | `object` | 是 | `{...}` |
| `core_metrics` | 核心指标对象 | `object` | 是 | `{...}` |

### `individual_profile`

| 字段名 | 含义 | 类型 | 是否必填 | 示例值 |
| --- | --- | --- | --- | --- |
| `page` | 页面标识 | `string` | 是 | `individual_profile` |
| `basic_info` | 学生基础信息对象 | `object` | 是 | `{...}` |
| `radar_profile` | 5 维雷达画像数据 | `array<object>` | 是 | `[{...}]` |
| `metric_snapshot` | 个体核心指标快照 | `object` | 是 | `{...}` |
| `comparison` | 与总体/群体对比信息 | `object` | 是 | `{...}` |
| `cluster_profile` | 当前聚类群体摘要 | `object` | 是 | `{...}` |

### `group_profile`

| 字段名 | 含义 | 类型 | 是否必填 | 示例值 |
| --- | --- | --- | --- | --- |
| `page` | 页面标识 | `string` | 是 | `group_profile` |
| `overview` | 群体总览对象 | `object` | 是 | `{...}` |
| `cluster_label_map` | 聚类编号到展示名映射 | `object` | 是 | `{"0":"发展过渡型"}` |
| `cluster_distribution` | 各群体人数分布 | `array<object>` | 是 | `[{...}]` |
| `cluster_cards` | 各群体画像卡片 | `array<object>` | 是 | `[{...}]` |
| `overall_means` | 全体均值 | `object` | 是 | `{...}` |
| `risk_distribution` | 风险分布摘要 | `object` | 是 | `{...}` |

### `risk_analysis`

| 字段名 | 含义 | 类型 | 是否必填 | 示例值 |
| --- | --- | --- | --- | --- |
| `page` | 页面标识 | `string` | 是 | `risk_analysis` |
| `thresholds` | 风险等级阈值 | `object` | 是 | `{"low_upper":0.04,"medium_upper":0.12}` |
| `level_distribution` | 低中高风险分布 | `array<object>` | 是 | `[{...}]` |
| `risk_dimensions` | 风险解释三维度 | `array<object>` | 是 | `[{...}]` |
| `focus_student` | 当前学生风险卡片 | `object` | 否 | `{...}` |

### `report_page`

| 字段名 | 含义 | 类型 | 是否必填 | 示例值 |
| --- | --- | --- | --- | --- |
| `page` | 页面标识 | `string` | 是 | `report_page` |
| `basic_info` | 基础信息对象 | `object` | 是 | `{...}` |
| `individual_profile` | 个体画像对象 | `object` | 是 | `{...}` |
| `group_profile` | 群体画像对象 | `object` | 是 | `{...}` |
| `risk_result` | 风险结果对象 | `object` | 是 | `{...}` |
| `explanations` | 关键解释列表 | `array<string>` | 是 | `["..."]` |
| `suggestions` | 个性化建议列表 | `array<string>` | 是 | `["..."]` |

## 核心对象说明

### `basic_info`

| 字段名 | 含义 | 类型 | 是否必填 | 示例值 |
| --- | --- | --- | --- | --- |
| `student_id` | 学生学号 | `string` | 是 | `200307700011` |
| `name` | 学生姓名，可为空 | `string` | 否 | `` |
| `college` | 学院名称 | `string` | 是 | `计算机科学与技术学院` |
| `major` | 专业名称 | `string` | 是 | `数据科学与大数据技术` |

### `radar_profile`

`radar_profile` 是一个数组，每个元素结构如下：

| 字段名 | 含义 | 类型 | 是否必填 | 示例值 |
| --- | --- | --- | --- | --- |
| `indicator` | 雷达维度名称 | `string` | 是 | `学习投入` |
| `column` | 对应原始指标字段 | `string` | 是 | `study_index` |
| `value` | 百分位得分，范围约 `0-100` | `number/null` | 是 | `42.35` |

当前 5 个固定维度：
- `学习投入`
- `自律水平`
- `健康发展`
- `综合发展`
- `风险反向值`

### `group_profile`

| 字段名 | 含义 | 类型 | 是否必填 | 示例值 |
| --- | --- | --- | --- | --- |
| `cluster` | 聚类编号 | `number` | 是 | `3` |
| `cluster_label` | 聚类展示名 | `string` | 是 | `高投入稳健型` |
| `cluster_traits` | 群体典型特征列表 | `array<string>` | 是 | `["学习投入较高"]` |
| `cluster_means` | 群体核心指标均值 | `object` | 是 | `{...}` |
| `cluster_distribution` | 全部群体分布 | `array<object>` | 是 | `[{...}]` |

### `risk_result`

| 字段名 | 含义 | 类型 | 是否必填 | 示例值 |
| --- | --- | --- | --- | --- |
| `risk_prob` | 风险概率 | `number/null` | 是 | `0.1186` |
| `risk_label` | 原始模型风险标签 | `number/null` | 否 | `1` |
| `risk_level` | 展示用风险等级 | `string` | 是 | `中风险` |
| `risk_thresholds` | 当前样本的低中高阈值 | `object` | 是 | `{"low_upper":0.04,"medium_upper":0.12}` |
| `cluster` | 聚类编号 | `number` | 是 | `3` |
| `cluster_label` | 聚类展示名 | `string` | 是 | `高投入稳健型` |
| `risk_dimensions` | 风险解释三维度 | `array<object>` | 是 | `[{...}]` |

### `explanations`

| 字段名 | 含义 | 类型 | 是否必填 | 示例值 |
| --- | --- | --- | --- | --- |
| `explanations` | 面向报告页展示的关键解释列表 | `array<string>` | 是 | `["该学生在学习投入维度低于总体均值。"]` |

### `suggestions`

| 字段名 | 含义 | 类型 | 是否必填 | 示例值 |
| --- | --- | --- | --- | --- |
| `suggestions` | 面向报告页展示的个性化建议列表 | `array<string>` | 是 | `["建议增加图书馆打卡频率。"]` |

## 当前前端接入建议

- 学生详情页：优先使用 `student_detail`
- 个体画像页：优先使用 `individual_profile`
- 群体画像页：优先使用 `group_profile`
- 风险分析页：优先使用 `risk_analysis`
- 个性化报告页：优先使用 `report_page`

- 若 `name` 为空，前端不要补默认姓名，直接展示 `student_id / college / major`
- 当前版本不要把 `consume_avg` 作为页面强依赖字段
