import argparse
import json
import os

import joblib
import pandas as pd
from scipy.sparse import hstack, csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report, f1_score
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

NUMERIC_FEATURES = [
    "url_count",
    "url_length_max",
    "url_length_avg",
    "url_subdom_max",
    "url_subdom_avg",
    "attachment_count",
    "has_attachments",
]


def build_text_column(df: pd.DataFrame) -> pd.Series:
    return (df["subject"].fillna("") + " " + df["body"].fillna("")).str.slice(0, 20000)


def featurize(df: pd.DataFrame, vectorizer: TfidfVectorizer, scaler: StandardScaler, fit: bool):
    text = build_text_column(df)
    if fit:
        tfidf = vectorizer.fit_transform(text)
        numeric = scaler.fit_transform(df[NUMERIC_FEATURES].values)
    else:
        tfidf = vectorizer.transform(text)
        numeric = scaler.transform(df[NUMERIC_FEATURES].values)
    return hstack([tfidf, csr_matrix(numeric)]).tocsr()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--splits-dir", required=True)
    parser.add_argument("--artifacts-dir", required=True)
    parser.add_argument("--max-features", type=int, default=50000)
    args = parser.parse_args()

    os.makedirs(args.artifacts_dir, exist_ok=True)

    train_df = pd.read_parquet(os.path.join(args.splits_dir, "train.parquet"))
    val_df = pd.read_parquet(os.path.join(args.splits_dir, "val.parquet"))
    test_df = pd.read_parquet(os.path.join(args.splits_dir, "test.parquet"))

    vectorizer = TfidfVectorizer(
        max_features=args.max_features,
        ngram_range=(1, 2),
        min_df=3,
        sublinear_tf=True,
    )
    scaler = StandardScaler()

    print("Vectorizing training set...")
    X_train = featurize(train_df, vectorizer, scaler, fit=True)
    y_train = train_df["label"].values
    X_val = featurize(val_df, vectorizer, scaler, fit=False)
    y_val = val_df["label"].values
    X_test = featurize(test_df, vectorizer, scaler, fit=False)
    y_test = test_df["label"].values

    print("Training XGBoost classifier...")
    model = XGBClassifier(
        n_estimators=400,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric="logloss",
        n_jobs=-1,
    )
    model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)

    val_pred = model.predict(X_val)
    print("=== Validation report ===")
    print(classification_report(y_val, val_pred, target_names=["benign", "phishing"]))

    test_pred = model.predict(X_test)
    test_f1 = f1_score(y_test, test_pred)
    print("=== Test report ===")
    print(classification_report(y_test, test_pred, target_names=["benign", "phishing"]))
    print(f"Test F1: {test_f1:.4f}")

    joblib.dump(model, os.path.join(args.artifacts_dir, "xgb_phishing_classifier.joblib"))
    joblib.dump(vectorizer, os.path.join(args.artifacts_dir, "tfidf_vectorizer.joblib"))
    joblib.dump(scaler, os.path.join(args.artifacts_dir, "numeric_scaler.joblib"))

    with open(os.path.join(args.artifacts_dir, "metadata.json"), "w") as f:
        json.dump({
            "numeric_features": NUMERIC_FEATURES,
            "test_f1": test_f1,
            "train_rows": len(train_df),
            "val_rows": len(val_df),
            "test_rows": len(test_df),
            "source_dataset": "MeAJOR Corpus (Zenodo 10.5281/zenodo.18471483)",
        }, f, indent=2)

    print(f"Saved artifacts to {args.artifacts_dir}")


if __name__ == "__main__":
    main()