import sys
import os

print(f"Python版本: {sys.version}")
print(f"Python路径: {sys.executable}")
print(f"当前目录: {os.getcwd()}")

# 尝试导入已安装的包
try:
    import pkg_resources
    print("\n已安装的包:")
    for package in pkg_resources.working_set:
        print(f"- {package.key}: {package.version}")
except ImportError as e:
    print(f"无法导入pkg_resources: {e}")

# 尝试直接导入flask
try:
    import flask
    print(f"\nFlask版本: {flask.__version__}")
except ImportError as e:
    print(f"无法导入Flask: {e}")
