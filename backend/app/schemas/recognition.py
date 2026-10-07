from pydantic import BaseModel


class RecognizeIn(BaseModel):
    photo_id: int


class GuessOut(BaseModel):
    value: str | None
    confidence: float


class RecognitionOut(BaseModel):
    category: GuessOut
    color: GuessOut
