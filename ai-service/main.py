"""AI Gym Retention Service — FastAPI microservice."""
from datetime import datetime, timezone
from typing import List
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="AI Gym Retention", version="1.0.0")

# Load model
try:
    model = joblib.load("models/churn_model.joblib")
except FileNotFoundError:
    model = None
    print("WARNING: model not found, run training/seed_data.py && training/train.py first")

FEATURES = [
    "days_since_last_attendance",
    "weekly_frequency",
    "tenure_days",
    "consistency_score",
    "avg_effort_level",
    "avg_energy_level",
    "feedback_count_last_2w",
]


# ─── Schemas ──────────────────────────────────────────────────────────

class ChurnInput(BaseModel):
    days_since_last_attendance: int
    weekly_frequency: float
    tenure_days: int
    consistency_score: float
    avg_effort_level: float
    avg_energy_level: float
    feedback_count_last_2w: int


class ChurnOutput(BaseModel):
    score: float
    category: str
    calculated_at: str


class BatchInput(BaseModel):
    users: List[ChurnInput]


class BatchOutput(BaseModel):
    predictions: List[ChurnOutput]


class MessageInput(BaseModel):
    days_inactive: int
    level: str  # beginner | intermediate | advanced
    last_effort: float
    last_energy: float


class MessageOutput(BaseModel):
    message: str


# ─── Helpers ──────────────────────────────────────────────────────────

def _score_to_category(score: float) -> str:
    if score >= 0.7:
        return "high"
    elif score >= 0.4:
        return "medium"
    return "low"


def _predict_single(input_data: ChurnInput) -> ChurnOutput:
    if model is None:
        raise HTTPException(503, "Model not loaded")

    x = np.array([[getattr(input_data, f) for f in FEATURES]], dtype=float)
    proba = model.predict_proba(x)[0]
    score = float(proba[1]) if model.classes_[1] == 1 else float(proba[0])

    return ChurnOutput(
        score=round(score, 4),
        category=_score_to_category(score),
        calculated_at=datetime.now(timezone.utc).isoformat(),
    )


MESSAGES = {
    ("beginner", True): (
        "¡Hola! Notamos que hace unos días no pasás por el gym. "
        "No te preocupes, todos tenemos semanas difíciles. "
        "Esta semana podés empezar con una sesión corta de 20 minutos, sin presión. ¿Te animás?"
    ),
    ("intermediate", True): (
        "¡Hey! Vimos que estuviste ausente unos días. "
        "Recordá que la constancia es clave para ver resultados. "
        "Te esperamos para seguir con tu progreso. ¡Vamos!"
    ),
    ("advanced", True): (
        "Notamos tu ausencia. Es importante mantener el ritmo. "
        "¿Querés que ajustemos tu rutina para retomarla con más ganas? "
        "Pasate por el gym y lo charlamos."
    ),
}


def _generate_message(input_data: MessageInput) -> str:
    is_inactive = input_data.days_inactive > 3
    key = (input_data.level, is_inactive)

    if key in MESSAGES:
        return MESSAGES[key]

    # Fallback
    return (
        "¡Hola! Queremos recordarte que en tu gym estamos para ayudarte. "
        "Pasate cuando tengas un rato y vemos cómo seguir."
    )


# ─── Endpoints ────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/predict/churn", response_model=ChurnOutput)
async def predict_churn(input_data: ChurnInput):
    return _predict_single(input_data)


@app.post("/predict/churn/batch", response_model=BatchOutput)
async def predict_churn_batch(input_data: BatchInput):
    predictions = [_predict_single(u) for u in input_data.users]
    return BatchOutput(predictions=predictions)


@app.post("/messaging/generate", response_model=MessageOutput)
async def generate_message(input_data: MessageInput):
    message = _generate_message(input_data)
    return MessageOutput(message=message)
