from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.services.attributes import ATTRIBUTES

router = APIRouter(tags=["attributes"], dependencies=[Depends(get_current_user)])


@router.get("/attributes")
def get_attributes() -> dict[str, list[dict]]:
    return ATTRIBUTES
