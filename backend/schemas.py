from datetime import datetime, timezone
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
import uuid


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str = ""
    role: str = "rector"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None
    profile_photo_url: Optional[str] = None


class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: EmailStr
    name: str
    role: str
    profile_photo_url: Optional[str] = None
    created_at: str
    created_by: str
    updated_at: Optional[str] = None
    updated_by: Optional[str] = None


class UserWithToken(UserOut):
    token: str


class LinkCreate(BaseModel):
    grado_id: str
    materia_id: str
    url: str


class LinkRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    grado_id: str
    materia_id: str
    url: str
    created_by: str = ""
    updated_by: str = ""
    updated_at: str = Field(default_factory=now_iso)


class BookBase(BaseModel):
    title: str
    author: str = ""
    category: str = "literatura"
    cover: str = ""
    url: str = ""
    description: str = ""


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    cover: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None


class BookRecord(BookBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_by: str = ""
    updated_by: str = ""
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    audience: str = "general"
    status: str = "show"


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    audience: Optional[str] = None
    status: Optional[str] = None


class CategoryRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str = ""
    audience: str = "general"
    status: str = "show"
    created_by: str = ""
    updated_by: str = ""
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class AuditRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    user_email: str
    user_role: str
    action: str
    resource_type: str
    resource_id: str = ""
    details: Dict[str, str] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=now_iso)
