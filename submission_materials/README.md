# 提交材料打包说明

本目录用于把已经生成好的比赛材料整理成最终可提交版本。

## 一、现有输出目录

当前已生成的核心材料位于：

- `submission_materials/outputs`

包括：

- 项目概要介绍
- 20 页项目简介 PPT
- 项目详细方案
- 项目演示视频脚本
- 困难与解决过程
- 可运行 Demo 说明

## 二、先填写团队信息

复制：

```text
submission_materials/TEAM_INFO.template.json
```

改名为：

```text
submission_materials/TEAM_INFO.json
```

并填写：

- `team_id`
- `team_name`
- `track_id`
- `track_name`
- `project_name`

## 三、生成最终提交目录

运行：

```powershell
.\.venv\Scripts\python.exe .\submission_materials\build_final_package.py
```

生成后会得到：

- `submission_materials/final_package/`

其中的文件名会按比赛要求自动命名。

## 四、视频文件

脚本不会替你生成最终 MP4。

你们需要把最终视频放到：

- `submission_materials/final_package/`

并命名为：

- `团队编号-团队名称-赛题编号赛题名称-项目演示视频.mp4`

## 五、知识产权材料

如果你们有：

- 软件著作权
- 专利
- 论文或其他知识产权证明

请补充到：

- `项目知识产权证明.pdf`

没有则可以不交。

## 六、大小控制建议

比赛要求所有文件总大小不超过 `500MB` 时，建议控制为：

- PPT 与 PDF：`30MB` 以内
- 演示视频：`60MB ~ 150MB`
- 其余补充材料：`50MB` 以内

这样整体会很稳。

## 七、推荐最终目录

- `项目概要介绍.pdf`
- `项目简介PPT.pptx`
- `项目详细方案.pdf`
- `项目演示视频.mp4`
- `困难与解决过程.pdf`
- `可运行Demo说明.pdf`
- `项目知识产权证明.pdf`（可选）
- `企业要求其他材料`（若有）

