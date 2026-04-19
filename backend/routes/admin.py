from __future__ import annotations

from flask import Blueprint


def create_admin_blueprint(
    *,
    get_admin_analysis_results,
    get_dashboard_overview,
    get_cluster_insights,
    get_admin_student_detail,
    get_risk_students,
    get_chart_file,
    get_model_summary,
    get_model_importance,
    get_task_history,
    submit_batch_predict,
) -> Blueprint:
    blueprint = Blueprint("admin_api", __name__)
    blueprint.add_url_rule("/api/admin/analysis/results", view_func=get_admin_analysis_results, methods=["GET"])
    blueprint.add_url_rule("/api/admin/dashboard/overview", view_func=get_dashboard_overview, methods=["GET"])
    blueprint.add_url_rule("/api/admin/cluster/profile", view_func=get_cluster_insights, methods=["GET"])
    blueprint.add_url_rule("/api/admin/student/<student_id>", view_func=get_admin_student_detail, methods=["GET"])
    blueprint.add_url_rule("/api/admin/risk/list", view_func=get_risk_students, methods=["GET"])
    blueprint.add_url_rule("/api/admin/export/charts/<chart_file>", view_func=get_chart_file, methods=["GET"])
    blueprint.add_url_rule("/api/admin/model/metrics", view_func=get_model_summary, methods=["GET"])
    blueprint.add_url_rule("/api/admin/model/importance", view_func=get_model_importance, methods=["GET"])
    blueprint.add_url_rule("/api/admin/tasks/history", view_func=get_task_history, methods=["GET"])
    blueprint.add_url_rule("/api/admin/tasks/batch-predict", view_func=submit_batch_predict, methods=["POST"])
    return blueprint
