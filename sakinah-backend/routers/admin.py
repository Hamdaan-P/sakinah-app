from fastapi import APIRouter, Depends, HTTPException
from middleware.token_verify import verify_admin

router = APIRouter()

@router.get("/stats")
async def admin_stats(decoded_token: dict = Depends(verify_admin)):
    try:
        return {"ok": True, "uid": decoded_token.get("uid")}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=403, detail="Forbidden: staff access only")
