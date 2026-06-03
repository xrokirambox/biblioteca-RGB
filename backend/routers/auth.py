from fastapi import APIRouter, Depends, Request, Response
from backend.schemas import LoginIn, UserOut
from backend.services import audit, login_user
from backend.auth_helpers import get_current_user
from backend.settings import settings

router = APIRouter(prefix="/auth")


@router.post("/login", response_model=UserOut)
async def login(payload: LoginIn, response: Response, request: Request):
    user = await login_user(payload.email, payload.password, request)
    token = user["token"]
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="none",
        max_age=60 * 60 * settings.jwt_expiry_hours,
        path="/",
    )
    await audit(user, "login", "auth")
    return user


@router.post("/logout")
async def logout(response: Response, current: dict = Depends(get_current_user)):
    response.delete_cookie(
        key="access_token",
        path="/",
        secure=settings.secure_cookies,
        httponly=True,
        samesite="none",
    )
    await audit(current, "logout", "auth")
    return {"ok": True}


@router.get("/me", response_model=UserOut)
async def me(current: dict = Depends(get_current_user)):
    return current
