from authlib.integrations.starlette_client import OAuth
from app.core.config import Config

oauth = OAuth()

oauth.register(
    name="google",
    client_id=Config.OAUTH_GOOGLE_CLIENT_ID,
    client_secret=Config.OAUTH_GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile"
    }
)

