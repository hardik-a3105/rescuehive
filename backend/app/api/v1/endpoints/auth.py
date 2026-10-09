from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse
from app.services.auth_service import register_user, authenticate_user
from app.core.security import get_current_user
from app.models.domain import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201,
    summary="Register a new user",
)
def api_register(data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user with name, email, password, and role.
    Passwords are hashed with bcrypt before storage.
    """
    user = register_user(db, data)
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and obtain JWT token",
)
def api_login(data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate with email and password.
    Returns a JWT access token on success.
    """
    return authenticate_user(db, data.email, data.password)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
def api_get_me(current_user: User = Depends(get_current_user)):
    """
    Return the profile of the currently authenticated user.
    Requires a valid JWT token in the Authorization header.
    """
    return current_user
