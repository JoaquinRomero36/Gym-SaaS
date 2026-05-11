"""Generate synthetic dataset for churn prediction training (500 users)."""
import numpy as np
import pandas as pd

np.random.seed(42)
N = 500

data = {
    "days_since_last_attendance": np.random.randint(0, 60, N),
    "weekly_frequency": np.round(np.random.uniform(0, 6, N), 2),
    "tenure_days": np.random.randint(1, 730, N),
    "consistency_score": np.round(np.random.uniform(0, 1, N), 3),
    "avg_effort_level": np.round(np.random.uniform(1, 5, N), 2),
    "avg_energy_level": np.round(np.random.uniform(1, 5, N), 2),
    "feedback_count_last_2w": np.random.randint(0, 10, N),
}

df = pd.DataFrame(data)

# Labeling rules
labels = []
for _, row in df.iterrows():
    if row["days_since_last_attendance"] > 14 and row["avg_effort_level"] < 2:
        labels.append(1)
    elif row["weekly_frequency"] > 3 and row["consistency_score"] > 0.7:
        labels.append(0)
    elif np.random.random() < 0.15:
        labels.append(np.random.randint(0, 2))
    elif row["days_since_last_attendance"] < 7 and row["feedback_count_last_2w"] > 3:
        labels.append(0)
    elif row["weekly_frequency"] < 1 and row["avg_effort_level"] < 2.5:
        labels.append(1)
    else:
        labels.append(np.random.choice([0, 1], p=[0.7, 0.3]))

df["churn"] = labels
df.to_csv("training/churn_dataset.csv", index=False)
print(f"Dataset saved: {len(df)} rows, churn rate: {df['churn'].mean():.2%}")
