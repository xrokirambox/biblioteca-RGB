from datetime import datetime, timezone
from typing import Any, Dict, Optional
import uuid

from pydantic import BaseModel, ConfigDict, EmailStr, Field


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


# ---------- Auth ----------
class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


# ---------- Users ----------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)
    name: str = ""
    role: str = "rector"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = Field(default=None, max_length=128)
    profile_photo_url: Optional[str] = None


class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: EmailStr
    name: str = ""
    role: str
    profile_photo_url: Optional[str] = None
    created_at: str
    created_by: str = ""
    updated_at: Optional[str] = None
    updated_by: Optional[str] = None


class UserWithToken(UserOut):
    csrf_token: str


# ---------- Book proposals ----------
class BookProposalCreate(BaseModel):
    teacher_name: str = Field(min_length=2, max_length=100)
    book_title: str = Field(min_length=2, max_length=200)
    author: str = Field(default="", max_length=120)
    reason: str = Field(default="", max_length=1000)


class BookProposalUpdate(BaseModel):
    status: str = Field(pattern="^(pending|attended|rejected)$")
    response_reason: str = Field(default="", max_length=1000)


class BookProposalRecord(BookProposalCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    status: str = "pending"
    submitted_by: str = ""
    submitted_at: str = Field(default_factory=now_iso)
    reviewed_by: str = ""
    reviewed_at: Optional[str] = None
    response_reason: str = ""


# ---------- Links ----------
class LinkCreate(BaseModel):
    grado_id: str
    materia_id: str
    url: str


class LinkRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    grado_id: str
    materia_id: str
    url: str
    created_by: str = ""
    updated_by: str = ""
    updated_at: str = Field(default_factory=now_iso)


# ---------- Books ----------
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
    id: str = Field(default_factory=new_id)
    created_by: str = ""
    updated_by: str = ""
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


# ---------- Categories ----------
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


# ---------- Hierarchy (Categoría → Subcategoría → Materia) ----------
class HierarchyCategoryCreate(BaseModel):
    name: str
    description: str = ""
    icon: str = "BookOpen"
    sort_order: int = 0


class HierarchyCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    sort_order: Optional[int] = None


class HierarchyCategoryRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    name: str
    description: str = ""
    icon: str = "BookOpen"
    sort_order: int = 0
    created_by: str = ""
    updated_by: str = ""
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class SubcategoryCreate(BaseModel):
    name: str
    category_id: str
    description: str = ""
    icon: str = "BookOpen"
    sort_order: int = 0


class SubcategoryUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    sort_order: Optional[int] = None


class SubcategoryRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    name: str
    category_id: str
    description: str = ""
    icon: str = "BookOpen"
    sort_order: int = 0
    created_by: str = ""
    updated_by: str = ""
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class HierarchyMateriaCreate(BaseModel):
    name: str
    subcategory_id: str
    description: str = ""
    icon: str = "BookOpen"
    url: str = ""
    notebook_url: str = ""
    cover: str = ""
    content_type: str = "book"
    embed_html: str = ""


class HierarchyMateriaUpdate(BaseModel):
    name: Optional[str] = None
    subcategory_id: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    url: Optional[str] = None
    notebook_url: Optional[str] = None
    cover: Optional[str] = None
    content_type: Optional[str] = None
    embed_html: Optional[str] = None


class HierarchyMateriaRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    name: str
    subcategory_id: str
    description: str = ""
    icon: str = "BookOpen"
    url: str = ""
    notebook_url: str = ""
    cover: str = ""
    content_type: str = "book"
    embed_html: str = ""
    created_by: str = ""
    updated_by: str = ""
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


# ---------- Audit ----------
class AuditRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    user_id: str
    user_email: str
    user_role: str
    action: str
    resource_type: str
    resource_id: str = ""
    details: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=now_iso)
