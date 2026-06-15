from fastapi import APIRouter, Depends
from middleware.token_verify import verify_token

router = APIRouter()


@router.get("/stats")
async def admin_stats(decoded_token: dict = Depends(verify_token)):
    return {"ok": True}
