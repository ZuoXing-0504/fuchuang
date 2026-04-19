from __future__ import annotations

from flask import Blueprint


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
) -> Blueprint:
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
    return blueprint
