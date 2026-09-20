import argparse
import os

import pandas as pd

NUMERIC_FEATURES = [
    "url_count",
    "url_length_max",
    "url_length_avg",
    "url_subdom_max",
    "url_subdom_avg",
    "attachment_count",
    "has_attachments",
]
TEXT_FEATURES = ["subject", "body"]
LABEL_COL = "label"
KEEP_COLS = TEXT_FEATURES + NUMERIC_FEATURES + [LABEL_COL, "source", "language"]


def load_raw(path: str) -> pd.DataFrame:
    if path.endswith(".parquet") or path.endswith(".gzip") or path.endswith(".parquet.gzip"):
        df = pd.read_parquet(path)
    else:
        df = pd.read_csv(path)
    return df


def clean(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    missing = [c for c in KEEP_COLS if c not in df.columns]
    if missing:
        raise ValueError(f"Dataset is missing expected columns: {missing}")
    df = df[KEEP_COLS]

    df = df.dropna(subset=[LABEL_COL])
    df["body"] = df["body"].fillna("")
    df["subject"] = df["subject"].fillna("")
    df = df[(df["body"].str.strip() != "") | (df["subject"].str.strip() != "")]

    for col in NUMERIC_FEATURES:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    df[LABEL_COL] = df[LABEL_COL].astype(int)

    df = df.drop_duplicates(subset=["subject", "body"])

    return df.reset_index(drop=True)


def split(df: pd.DataFrame, val_frac: float = 0.1, test_frac: float = 0.15, seed: int = 42):
    df = df.sample(frac=1.0, random_state=seed).reset_index(drop=True)
    n = len(df)
    n_test = int(n * test_frac)
    n_val = int(n * val_frac)
    test_df = df.iloc[:n_test]
    val_df = df.iloc[n_test:n_test + n_val]
    train_df = df.iloc[n_test + n_val:]
    return train_df.reset_index(drop=True), val_df.reset_index(drop=True), test_df.reset_index(drop=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--val-frac", type=float, default=0.1)
    parser.add_argument("--test-frac", type=float, default=0.15)
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)

    print(f"Loading raw dataset from {args.input} ...")
    raw = load_raw(args.input)
    print(f"Raw rows: {len(raw):,}")

    df = clean(raw)
    print(f"Rows after cleaning: {len(df):,}")
    print("Label balance:\n", df[LABEL_COL].value_counts(normalize=True))

    train_df, val_df, test_df = split(df, args.val_frac, args.test_frac)
    print(f"Train: {len(train_df):,}  Val: {len(val_df):,}  Test: {len(test_df):,}")

    train_df.to_parquet(os.path.join(args.output_dir, "train.parquet"))
    val_df.to_parquet(os.path.join(args.output_dir, "val.parquet"))
    test_df.to_parquet(os.path.join(args.output_dir, "test.parquet"))
    print(f"Wrote splits to {args.output_dir}")


if __name__ == "__main__":
    main()