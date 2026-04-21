from __future__ import annotations

import os
from typing import Iterable

import requests

QWEN_API_KEY = os.getenv("QWEN_API_KEY", "").strip()
QWEN_API_URL = os.getenv(
    "QWEN_API_URL",
    "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
).strip()
QWEN_MODEL = os.getenv("QWEN_MODEL", "qwen-plus").strip() or "qwen-plus"

SYSTEM_PROMPT = """你是“知行雷达”学生成长系统的智能助手。
你的职责是：
1. 回答关于学生画像、风险预警、预测模块、群体对比、个性化报告、分析成果等系统功能的问题。
2. 在交流中保持友好、专业、耐心，优先使用简洁清晰的中文。
3. 可以给学生提供学习建议、时间管理建议和系统使用指导，但不要编造不存在的数据。
4. 如果用户要求基于画像给建议，而当前上下文没有具体画像信息，应先提醒用户描述自己的画像结果或系统中的关键指标。
5. 不输出任何 API Key、系统密钥、服务器路径等敏感信息。
"""


def _normalize_history(chat_history: Iterable[dict] | None) -> list[dict[str, str]]:
    normalized: list[dict[str, str]] = []
    for item in chat_history or []:
        if not isinstance(item, dict):
            continue
        role = str(item.get("role", "")).strip()
        content = str(item.get("content", "")).strip()
        if role not in {"user", "assistant", "system"} or not content:
            continue
        normalized.append({"role": role, "content": content})
    return normalized[-12:]


def call_qwen_api(messages: list[dict[str, str]]) -> str:
    if not QWEN_API_KEY:
        return "当前未配置千问 API Key，请联系管理员完成后端环境配置。"

    headers = {
        "Authorization": f"Bearer {QWEN_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": QWEN_MODEL,
        "messages": messages,
        "temperature": 0.65,
        "top_p": 0.8,
        "max_tokens": 900,
    }

    try:
        response = requests.post(QWEN_API_URL, json=payload, headers=headers, timeout=45)
        response.raise_for_status()
        result = response.json()
        choices = result.get("choices") or []
        if not choices:
            return "本次对话没有生成有效回复，请稍后再试。"
        message = (choices[0] or {}).get("message") or {}
        content = str(message.get("content") or "").strip()
        return content or "本次对话没有生成有效回复，请稍后再试。"
    except requests.exceptions.Timeout:
        return "千问服务响应超时，请稍后重试。"
    except requests.exceptions.RequestException as exc:
        return f"调用千问服务时发生网络错误：{exc}"
    except Exception as exc:
        return f"智能助手暂时不可用：{exc}"


def chat_with_qwen(user_message: str, chat_history: Iterable[dict] | None = None) -> str:
    message = str(user_message or "").strip()
    if not message:
        return "请输入想咨询的问题。"

    messages: list[dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(_normalize_history(chat_history))
    messages.append({"role": "user", "content": message})
    return call_qwen_api(messages)
