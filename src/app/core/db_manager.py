from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from contextlib import contextmanager
import os
from typing import Generator
from functools import wraps
import logging

# データベース設定
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/moneykids")

# ロガーの設定
logger = logging.getLogger(__name__)

# SQLAlchemyのベースクラス
Base = declarative_base()

class DatabaseManager:
    """データベース操作を管理するクラス"""
    
    def __init__(self, db_url: str = DATABASE_URL):
        """
        DatabaseManagerの初期化
        
        Args:
            db_url (str): データベース接続URL
        """
        self.engine = create_engine(
            db_url,
            pool_pre_ping=True,  # コネクションの生存確認
            pool_size=5,         # コネクションプールのサイズ
            max_overflow=10      # 最大オーバーフロー数
        )
        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine
        )

    @contextmanager
    def get_db(self) -> Generator[Session, None, None]:
        """
        データベースセッションを取得するコンテキストマネージャー
        
        Yields:
            Session: データベースセッション
        """
        db = self.SessionLocal()
        try:
            yield db
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Database error occurred: {str(e)}")
            raise
        finally:
            db.close()

    def init_db(self) -> None:
        """データベースの初期化"""
        try:
            Base.metadata.create_all(bind=self.engine)
            logger.info("Database initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize database: {str(e)}")
            raise

    def transaction(self):
        """
        トランザクション管理用デコレータ
        """
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                with self.get_db() as db:
                    return func(db=db, *args, **kwargs)
            return wrapper
        return decorator

    def execute_query(self, query: str, params: dict = None) -> list:
        """
        生のSQLクエリを実行する
        
        Args:
            query (str): 実行するSQLクエリ
            params (dict): クエリパラメータ
            
        Returns:
            list: クエリ結果
        """
        with self.get_db() as db:
            try:
                result = db.execute(query, params or {})
                return result.fetchall()
            except Exception as e:
                logger.error(f"Query execution failed: {str(e)}")
                raise

    def health_check(self) -> bool:
        """
        データベース接続の健全性チェック
        
        Returns:
            bool: 接続が正常な場合True
        """
        try:
            with self.get_db() as db:
                db.execute("SELECT 1")
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            return False

# シングルトンインスタンスの作成
db_manager = DatabaseManager()
