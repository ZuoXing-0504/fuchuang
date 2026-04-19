# Student Behavior API Contract

## Canonical data policy

- `our project/analysis_master.csv` 是学生画像、风险列表、群体分析和报告展示的唯一主数据源。
- `our project/train_features_final.csv` 仅作为特征回溯和在线预测回退的补充数据源。
- `student_behavior.db` 仅作为运行时存储，负责账号、令牌和可选特征覆盖，不再承担主要画像展示职责。

## Response envelope

所有接口统一返回：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

失败时返回：

```json
{
  "code": 400,
  "message": "错误说明",
  "data": null
}
```

## Auth

### `POST /api/auth/register`

- 请求体：`studentId`、`username`、`password`、`confirmPassword`
- 成功：返回注册后的用户名、学号、展示姓名
- 失败：`400` 参数错误，`404` 学号不在分析样本中

### `POST /api/auth/login`

- 请求体：`username`、`password`、`role`
- `role` 支持 `admin`、`student`
- 成功：返回 `id`、`username`、`name`、`role`、`studentId`、`token`
- 失败：`401` 用户名或密码错误

### `GET /api/auth/me`

- Header：`Authorization: Bearer <token>`
- 成功：返回当前登录用户快照
- 失败：`401` 未登录或令牌失效

## Student APIs

### `GET /api/student/dashboard`

- 参数：可选 `student_id`
- 数据源：`analysis_master.csv`
- 返回：首页卡片、风险摘要、画像标签等

### `GET /api/student/profile`

- 参数：可选 `student_id`
- 数据源：`analysis_master.csv` + `train_features_final.csv`
- 返回：画像摘要、维度分数、解释说明

### `GET /api/student/trends`

- 参数：可选 `student_id`
- 数据源：`analysis_master.csv`
- 返回：趋势序列

### `GET /api/student/report`

- 参数：可选 `student_id`
- 数据源：`analysis_master.csv`
- 返回：完整报告

### `GET /api/student/recommendations`

- 参数：可选 `student_id`
- 数据源：`analysis_master.csv`
- 返回：建议列表

### `GET /api/student/compare/group`

- 参数：可选 `student_id`
- 数据源：`analysis_master.csv`
- 返回：个体与群体对比指标

## Admin APIs

### `GET /api/admin/risk/list`

- 参数：`keyword`、`college`、`major`、`risk_level`、`page`、`page_size`
- 数据源：`analysis_master.csv`
- 返回：风险名单分页列表

### `GET /api/admin/student/<student_id>`

- 数据源：`analysis_master.csv` + `train_features_final.csv`
- 返回：单学生详情、报告摘要、可解释字段

### `GET /api/admin/analysis/results`

- 数据源：分析图产物目录
- 返回：分析图清单、图表状态、叙事说明

### `GET /api/admin/dashboard/overview`

- 数据源：`analysis_master.csv`
- 返回：首页 KPI、风险分布、表现分布、画像分布、重点学生

### `GET /api/admin/cluster/profile`

- 数据源：`our project/model_outputs/cluster_profile.csv` + `analysis_master.csv`
- 返回：群体画像说明、雷达图、均值信息、代表学生

### `GET /api/admin/model/metrics`

- 数据源：`our project/model_outputs/risk_classification_model_compare.csv`
- 返回：模型指标、特征重要性、业务说明

### `GET /api/admin/model/importance`

- 数据源：`our project/model_outputs/risk_classification_importance.csv`
- 返回：与模型指标页一致的结构，便于前端复用

### `GET /api/admin/tasks/history`

- 数据源：进程内任务队列
- 返回：批量任务历史

### `POST /api/admin/tasks/batch-predict`

- 请求体：`fileName`
- 返回：已创建的批量任务快照

### `GET /api/admin/export/charts/<chart_file>`

- 数据源：`our project/analysis/outputs/charts`
- 返回：PNG 图片文件
