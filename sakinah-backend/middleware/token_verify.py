from fastapi import Depends, Request, HTTPException
from firebase_admin import auth


async def verify_token(request: Request) -> dict:
    authorization = request.headers.get("Authorization")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header")

    token = authorization.removeprefix("Bearer ").strip()

    try:
        decoded_token = auth.verify_id_token(token)
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Token verification failed")

    return decoded_token


def verify_admin(decoded_token: dict = Depends(verify_token)):
    try:
        if decoded_token.get("admin") is not True:
            raise HTTPException(status_code=403, detail="Forbidden: staff access only")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=403, detail="Forbidden: staff access only")
    return decoded_token
