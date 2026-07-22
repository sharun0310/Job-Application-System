from typing import Any, List
from datetime import datetime, timezone
from pydantic import BaseModel


class APIResponse(BaseModel):
    success: bool
    message: str
    data: Any = {}
    errors: List[str] = []
    timestamp: str


def success_response(
    data: Any = {}, message: str = "Request successful"
) -> APIResponse:
    return APIResponse(
        success=True,
        message=message,
        data=data,
        errors=[],
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


def error_response(
    errors: List[str], message: str = "An error occurred"
) -> APIResponse:
    return APIResponse(
        success=False,
        message=message,
        data={},
        errors=errors,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
