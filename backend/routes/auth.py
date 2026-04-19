from __future__ import annotations

from flask import Blueprint


def create_auth_blueprint(*, register_account, login, get_current_user) -> Blueprint:
    blueprint = Blueprint("auth_api", __name__)
    blueprint.add_url_rule("/api/auth/register", view_func=register_account, methods=["POST"])
    blueprint.add_url_rule("/api/auth/login", view_func=login, methods=["POST"])
    blueprint.add_url_rule("/api/auth/me", view_func=get_current_user, methods=["GET"])
    return blueprint
