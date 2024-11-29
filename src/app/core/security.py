from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Security
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings

class SecurityManager:
    """
    セキュリティ関連の機能を管理するクラス
    - パスワードのハッシュ化
    - トークンの生成と検証
    - 認証・認可の処理
    """
    
    def __init__(self):
        # パスワードハッシュ化の設定
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        # OAuth2認証スキームの設定
        self.oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
        # JWTシークレットキー
        self.SECRET_KEY = settings.SECRET_KEY
        # トークンアルゴリズム
        self.ALGORITHM = "HS256"
        # アクセストークンの有効期限（分）
        self.ACCESS_TOKEN_EXPIRE_MINUTES = 30

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        パスワードの検証を行う
        """
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """
        パスワードをハッシュ化する
        """
        return self.pwd_context.hash(password)

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """
        JWTアクセストークンを生成する
        """
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.SECRET_KEY, algorithm=self.ALGORITHM)
        return encoded_jwt

    def decode_token(self, token: str) -> dict:
        """
        トークンをデコードして検証する
        """
        try:
            payload = jwt.decode(token, self.SECRET_KEY, algorithms=[self.ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=401,
                detail="Token has expired"
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=401,
                detail="Could not validate credentials"
            )

    async def get_current_user(self, token: str = Security(OAuth2PasswordBearer(tokenUrl="token"))) -> dict:
        """
        現在のユーザーを取得する
        """
        credentials_exception = HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = self.decode_token(token)
            user_id: str = payload.get("sub")
            if user_id is None:
                raise credentials_exception
            return {"user_id": user_id}
        except jwt.JWTError:
            raise credentials_exception

    def verify_permission(self, user: dict, required_role: str) -> bool:
        """
        ユーザーの権限を確認する
        """
        return user.get("role") == required_role

# セキュリティマネージャーのインスタンスを作成
security_manager = SecurityManager()