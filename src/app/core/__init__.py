"""
Core module initialization file for MoneyKids backend application.
This module contains core functionality and configurations.
"""

from typing import Dict, Any

# Version information
__version__ = "1.0.0"

# Core configuration defaults
DEFAULT_CONFIG: Dict[str, Any] = {
    "APP_NAME": "MoneyKids",
    "DEBUG": False,
    "API_V1_PREFIX": "/api/v1",
    "BACKEND_CORS_ORIGINS": [
        "http://localhost:3000",  # Next.js frontend development server
        "https://moneykids.com"   # Production frontend
    ],
}

# Initialize core components
def init_app() -> None:
    """
    Initialize core application components.
    This function is called during application startup.
    """
    pass  # Core initialization logic will be implemented as needed

# Export commonly used components
__all__ = [
    "DEFAULT_CONFIG",
    "init_app",
    "__version__"
]