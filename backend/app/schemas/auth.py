from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import Name, UserOut


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: Name = None


class LoginIn(BaseModel):
    email: str
    password: str


class PasswordChangeIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class PasswordResetRequestIn(BaseModel):
    email: EmailStr


class PasswordResetConfirmIn(BaseModel):
    token: str
    password: str = Field(min_length=8)


class AuthOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
