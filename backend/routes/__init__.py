from .admin import create_admin_blueprint
from .auth import create_auth_blueprint
from .student import create_student_blueprint

__all__ = [
    "create_admin_blueprint",
    "create_auth_blueprint",
    "create_student_blueprint",
]
