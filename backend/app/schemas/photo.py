from pydantic import BaseModel

from app.models import Photo


class PhotoOut(BaseModel):
    id: int
    url: str

    @classmethod
    def from_photo(cls, photo: Photo) -> "PhotoOut":
        return cls(id=photo.id, url=photo.url)
