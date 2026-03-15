#!/usr/bin/env python3
"""
Notebook 03: Train Recommendation Model
=========================================
Chạy khi đã có ít nhất 500 users × 100 meal logs = 50,000 interactions.

Mô hình: Two-stage recommendation
  Stage 1: Candidate retrieval (fast, all foods)
  Stage 2: Ranking (slow, top 50 candidates → rerank to 3-10)

Architecture options (chọn theo data size):
  - < 10k users:  LightGBM (tabular, fast, interpretable)
  - 10-100k users: Two-Tower Neural Net
  - > 100k users:  Approximate NN with FAISS embedding search
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd

# ── NOTE: Uncomment when libraries are installed ────────────────────────
# import torch
# import torch.nn as nn
# import lightgbm as lgb
# from sklearn.model_selection import train_test_split
# from sklearn.metrics import roc_auc_score, ndcg_score
# import mlflow


# ══════════════════════════════════════════════════════════════════════════
# STEP 1: Load training data
# ══════════════════════════════════════════════════════════════════════════
# Run this to export from production DB:
#   python backend/scripts/export_training_data.py --output ml/datasets/interactions.csv

DATASET_PATH = Path("ml/datasets/interactions.csv")

def load_data():
    """Load and validate interaction dataset."""
    if not DATASET_PATH.exists():
        print("⚠️  Dataset not found. Generating synthetic data for testing...")
        return _generate_synthetic_data()
    df = pd.read_csv(DATASET_PATH)
    print(f"Loaded {len(df)} interactions from {df['user_id'].nunique()} users")
    return df


def _generate_synthetic_data(n_users=100, n_foods=60, n_interactions=3000):
    """
    Generate synthetic interactions for testing the pipeline.
    Replace with real data when available.
    """
    np.random.seed(42)
    users = [f"user_{i}" for i in range(n_users)]
    foods = list(range(n_foods))
    goals = ["lose_weight", "gain_muscle", "maintain", "vegetarian"]

    rows = []
    for _ in range(n_interactions):
        user = np.random.choice(users)
        food = np.random.choice(foods)
        goal = np.random.choice(goals)
        calorie_target = np.random.choice([1600, 1800, 2000, 2200, 2500])
        meal_type = np.random.choice(["breakfast", "lunch", "dinner", "snack"])

        # Synthetic acceptance: higher protein foods more accepted for gain_muscle
        if goal == "gain_muscle" and food % 10 < 4:
            accepted = np.random.random() > 0.3
        elif goal == "lose_weight" and food % 10 < 3:
            accepted = np.random.random() > 0.25
        else:
            accepted = np.random.random() > 0.5

        rows.append({
            "user_id": user,
            "food_id": food,
            "health_goal": goal,
            "calorie_target": calorie_target,
            "meal_type": meal_type,
            "accepted": int(accepted),
            "calorie_diff_pct": np.random.normal(0, 0.2),
            "protein_g": np.random.exponential(15),
            "meal_time_match": np.random.choice([0, 1]),
        })

    return pd.DataFrame(rows)


# ══════════════════════════════════════════════════════════════════════════
# STEP 2: Feature engineering
# ══════════════════════════════════════════════════════════════════════════
def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create features for the ranking model.
    TODO: Enrich with actual food nutrition data from food_items table.
    """
    # Goal encoding
    goal_map = {"lose_weight": 0, "maintain": 1, "gain_muscle": 2, "vegetarian": 3}
    df["goal_encoded"] = df["health_goal"].map(goal_map).fillna(1)

    # Meal type encoding
    meal_map = {"breakfast": 0, "lunch": 1, "dinner": 2, "snack": 3}
    df["meal_encoded"] = df["meal_type"].map(meal_map).fillna(1)

    # Calorie alignment score (closer to budget = better)
    df["cal_score"] = 1 - df["calorie_diff_pct"].abs().clip(0, 1)

    # Protein score per goal (gain_muscle values high protein)
    df["protein_score"] = np.where(
        df["health_goal"] == "gain_muscle",
        (df["protein_g"] / 30).clip(0, 1),
        (df["protein_g"] / 20).clip(0, 1),
    )

    return df


FEATURE_COLS = [
    "goal_encoded", "meal_encoded", "calorie_target",
    "cal_score", "protein_score", "meal_time_match",
]


# ══════════════════════════════════════════════════════════════════════════
# STEP 3: Train LightGBM model
# ══════════════════════════════════════════════════════════════════════════
def train_lgbm(df: pd.DataFrame):
    """
    Train LightGBM ranking model.
    Uncomment lgb import above to use.
    """
    print("Training LightGBM model...")
    # Uncomment below when lightgbm is installed:

    # from sklearn.model_selection import train_test_split
    # from sklearn.metrics import roc_auc_score
    # import lightgbm as lgb

    # df = engineer_features(df)
    # X, y = df[FEATURE_COLS], df["accepted"]
    # X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

    # model = lgb.LGBMClassifier(
    #     n_estimators=300,
    #     learning_rate=0.05,
    #     max_depth=6,
    #     num_leaves=31,
    #     random_state=42,
    # )
    # model.fit(X_train, y_train, eval_set=[(X_val, y_val)], callbacks=[lgb.early_stopping(20)])

    # val_preds = model.predict_proba(X_val)[:, 1]
    # auc = roc_auc_score(y_val, val_preds)
    # print(f"Validation AUC: {auc:.4f}")

    # # Save model
    # checkpoint_path = "ml/checkpoints/recommendation_lgbm.txt"
    # model.booster_.save_model(checkpoint_path)
    # print(f"✅ Model saved: {checkpoint_path}")

    # # Feature importance
    # importance = pd.Series(model.feature_importances_, index=FEATURE_COLS).sort_values(ascending=False)
    # print("\nFeature Importance:")
    # print(importance)

    # return model
    print("  → Install lightgbm and uncomment to train")
    return None


# ══════════════════════════════════════════════════════════════════════════
# STEP 4: Two-Tower Neural Net (for larger scale)
# ══════════════════════════════════════════════════════════════════════════
def build_two_tower_model(n_users: int, n_foods: int, embedding_dim: int = 32):
    """
    Two-Tower model:
      User Tower: user_id embedding + health_goal + calorie_target → user_vector
      Food Tower: food_id embedding + nutrition features → food_vector
      Score: cosine_similarity(user_vector, food_vector)

    Install: pip install torch
    """
    # Uncomment when torch is available:

    # class TwoTowerModel(nn.Module):
    #     def __init__(self):
    #         super().__init__()
    #         self.user_embedding = nn.Embedding(n_users, embedding_dim)
    #         self.food_embedding = nn.Embedding(n_foods, embedding_dim)
    #         self.user_mlp = nn.Sequential(
    #             nn.Linear(embedding_dim + 2, 64), nn.ReLU(),
    #             nn.Linear(64, 32)
    #         )
    #         self.food_mlp = nn.Sequential(
    #             nn.Linear(embedding_dim + 4, 64), nn.ReLU(),
    #             nn.Linear(64, 32)
    #         )
    #
    #     def forward(self, user_ids, user_features, food_ids, food_features):
    #         u_emb = self.user_embedding(user_ids)
    #         u_vec = self.user_mlp(torch.cat([u_emb, user_features], dim=-1))
    #         f_emb = self.food_embedding(food_ids)
    #         f_vec = self.food_mlp(torch.cat([f_emb, food_features], dim=-1))
    #         return torch.cosine_similarity(u_vec, f_vec)
    #
    # return TwoTowerModel()

    print("Two-Tower model scaffold ready. Install torch and uncomment.")
    return None


# ══════════════════════════════════════════════════════════════════════════
# STEP 5: Evaluation
# ══════════════════════════════════════════════════════════════════════════
def evaluate_model(model, df_val: pd.DataFrame):
    """
    Metrics:
      - AUC-ROC: overall ranking quality
      - Precision@3: are top 3 recommendations accepted?
      - NDCG@3: ranking quality
    """
    print("\nModel Evaluation")
    print("----------------")
    print("TODO: Implement when model is trained")
    print("Target metrics:")
    print("  AUC-ROC     > 0.75")
    print("  Precision@3 > 0.60")
    print("  NDCG@3      > 0.70")


# ══════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("🤖 NutriAI Recommendation Model Training")
    print("=" * 50)

    df = load_data()
    print(f"\nDataset shape: {df.shape}")
    print(f"Acceptance rate: {df['accepted'].mean():.1%}")
    print(f"Features available: {list(df.columns)}")

    df = engineer_features(df)
    print("\n✅ Feature engineering done")
    print(f"Training features: {FEATURE_COLS}")

    model = train_lgbm(df)
    evaluate_model(model, df)

    print("\n📌 Next steps:")
    print("  1. pip install lightgbm scikit-learn mlflow")
    print("  2. Collect real user interactions (target: 50k+)")
    print("  3. Uncomment training code above")
    print("  4. Set AI_ENABLED=true in .env")
    print("  5. Deploy!")
