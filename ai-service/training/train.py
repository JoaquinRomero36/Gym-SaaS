"""Train LogisticRegression on synthetic dataset and save model."""
import pandas as pd
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

df = pd.read_csv("training/churn_dataset.csv")

FEATURES = [
    "days_since_last_attendance",
    "weekly_frequency",
    "tenure_days",
    "consistency_score",
    "avg_effort_level",
    "avg_energy_level",
    "feedback_count_last_2w",
]

X = df[FEATURES]
y = df["churn"]

pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", LogisticRegression(class_weight="balanced", random_state=42, max_iter=1000)),
])

pipeline.fit(X, y)

joblib.dump(pipeline, "models/churn_model.joblib")
print(f"Model trained and saved. Accuracy: {pipeline.score(X, y):.2%}")
