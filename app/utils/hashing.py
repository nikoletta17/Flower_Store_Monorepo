from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

class Hash:
    @staticmethod
    def bcrypt(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify(plain_password: str, password: str) -> bool:
        return pwd_context.verify(plain_password, password)