"""
Consistent error envelope matching BACKEND.md §5.9.
"""

from fastapi import HTTPException
from fastapi.responses import JSONResponse


class AppError(HTTPException):
    """Application error that serializes to the spec's error envelope."""

    def __init__(self, status: int, code: str, message: str):
        self.error_code = code
        self.error_message = message
        super().__init__(status_code=status, detail=message)


def error_response(status: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={
            "error": {
                "code": code,
                "message": message,
                "status": status,
            }
        },
    )


async def app_error_handler(_request, exc: AppError):
    return error_response(exc.status_code, exc.error_code, exc.error_message)
