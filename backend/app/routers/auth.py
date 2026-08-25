from fastapi import APIRouter, Depends, Request, Response

from app.config import settings
from app.core.deps import get_current_user
from app.domain.schemas import LoginIn
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login(payload: LoginIn, response: Response, request: Request):
    result = await auth_service.login(payload.email, payload.password, request)
    response.set_cookie(
        key="access_token",
        value=result["access_token"],
        httponly=True,
        secure=settings.secure_cookies,
        samesite="none" if settings.secure_cookies else "lax",
        max_age=settings.jwt_expire_hours * 3600,  # FIX: expiry→expire
        path="/",
    )
    return {k: v for k, v in result.items() if k != "access_token"}


@router.post("/logout")
async def logout(response: Response, request: Request):
    try:
        current = await get_current_user(request)
        await auth_service.logout(current)
    except Exception:
        pass
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@router.get("/me")
async def me(request: Request, user=Depends(get_current_user)):
    return {**user, "csrf_token": request.state.csrf_token}
