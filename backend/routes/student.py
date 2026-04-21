from __future__ import annotations

from flask import Blueprint, request, jsonify
from backend.qwen_chat import chat_with_qwen


def create_student_blueprint(
    *,
    get_student_dashboard,
    get_student_profile,
    get_student_trends,
    get_student_report,
    get_student_recommendations,
    get_student_group_compare,
    get_student_predict_schema,
    submit_student_manual_predict,
):
    blueprint = Blueprint("student_api", __name__)
    blueprint.add_url_rule("/api/student/dashboard", view_func=get_student_dashboard, methods=["GET"])
    blueprint.add_url_rule("/api/student/profile", view_func=get_student_profile, methods=["GET"])
    blueprint.add_url_rule("/api/student/trend", view_func=get_student_trends, methods=["GET"])
    blueprint.add_url_rule("/api/student/trends", view_func=get_student_trends, methods=["GET"])
    blueprint.add_url_rule("/api/student/report", view_func=get_student_report, methods=["GET"])
    blueprint.add_url_rule("/api/student/advice", view_func=get_student_recommendations, methods=["GET"])
    blueprint.add_url_rule("/api/student/recommendations", view_func=get_student_recommendations, methods=["GET"])
    blueprint.add_url_rule("/api/student/compare/group", view_func=get_student_group_compare, methods=["GET"])
    blueprint.add_url_rule("/api/student/predict/schema", view_func=get_student_predict_schema, methods=["GET"])
    blueprint.add_url_rule("/api/student/predict/manual", view_func=submit_student_manual_predict, methods=["POST"])
    
    @blueprint.route("/api/student/chat", methods=["POST"])
    def chat():
        try:
            data = request.json or {}
            user_message = data.get('message', '').strip()
            chat_history = data.get('history', [])
            
            if not user_message:
                return jsonify({'code': 400, 'message': '请输入消息', 'data': None}), 400
            
            response = chat_with_qwen(user_message, chat_history)
            
            return jsonify({
                'code': 200,
                'message': 'success',
                'data': {
                    'response': response
                }
            })
        except Exception as e:
            return jsonify({'code': 500, 'message': str(e), 'data': None}), 500
            
    return blueprint
