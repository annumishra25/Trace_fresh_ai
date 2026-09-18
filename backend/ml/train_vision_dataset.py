"""
TraceFresh-AI: Multi-Class Vision AI Model Trainer
Trains on dataset/ spanning:
- freshapples
- freshbanana
- freshoranges
- rottenapples
- rottenbanana
- rottenoranges

Extracts spatial color distribution, HSV moments, decay ratios, and edge entropy.
Trains an ensemble classifier and exports backend/ml/model/trained_vision_model.json
"""

import os
import json
import math
import random
import time
from PIL import Image, ImageFilter

CLASS_NAMES = [
    "freshapples",
    "freshbanana",
    "freshoranges",
    "rottenapples",
    "rottenbanana",
    "rottenoranges",
]

DATASET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "dataset"))
MODEL_OUTPUT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "model", "trained_vision_model.json"))


def extract_features_from_image(image_path_or_pil):
    """
    Extracts a 21-dimensional normalized feature vector from a produce image:
    - RGB mean & standard deviations (6)
    - HSV mean & hue circular statistics (6)
    - Color ratios (Red/Green, Red/Blue, Green/Blue) (3)
    - Dark & rot decay patch proportions (3)
    - Edge density & gradient contrast (2)
    - Center vs Border spatial color variance (1)
    """
    if isinstance(image_path_or_pil, str):
        img = Image.open(image_path_or_pil).convert("RGB")
    else:
        img = image_path_or_pil.convert("RGB")

    # Resize to standard analysis size for consistent fast processing
    img_resized = img.resize((128, 128), Image.Resampling.BILINEAR)
    pixels = list(img_resized.getdata())
    total_pixels = len(pixels)

    r_vals = [p[0] for p in pixels]
    g_vals = [p[1] for p in pixels]
    b_vals = [p[2] for p in pixels]

    # 1. RGB Mean & Std
    mean_r = sum(r_vals) / total_pixels
    mean_g = sum(g_vals) / total_pixels
    mean_b = sum(b_vals) / total_pixels

    std_r = math.sqrt(sum((r - mean_r) ** 2 for r in r_vals) / total_pixels)
    std_g = math.sqrt(sum((g - mean_g) ** 2 for g in g_vals) / total_pixels)
    std_b = math.sqrt(sum((b - mean_b) ** 2 for b in b_vals) / total_pixels)

    # 2. HSV Analysis
    hsv_img = img_resized.convert("HSV")
    hsv_pixels = list(hsv_img.getdata())
    h_vals = [p[0] for p in hsv_pixels]
    s_vals = [p[1] for p in hsv_pixels]
    v_vals = [p[2] for p in hsv_pixels]

    mean_h = sum(h_vals) / total_pixels
    mean_s = sum(s_vals) / total_pixels
    mean_v = sum(v_vals) / total_pixels

    # Yellow Hue Range (Banana): Hue roughly 28-60 in 0-255 scale
    # Orange Hue Range: Hue roughly 12-28
    # Red Hue Range: Hue < 12 or > 240
    yellow_pixel_count = sum(1 for p in hsv_pixels if 28 <= p[0] <= 60 and p[1] > 60 and p[2] > 70)
    orange_pixel_count = sum(1 for p in hsv_pixels if 12 <= p[0] < 28 and p[1] > 70 and p[2] > 70)
    red_pixel_count = sum(1 for p in hsv_pixels if (p[0] < 12 or p[0] > 240) and p[1] > 60 and p[2] > 60)

    pct_yellow = yellow_pixel_count / total_pixels
    pct_orange = orange_pixel_count / total_pixels
    pct_red = red_pixel_count / total_pixels

    # 3. Decay & Spoilage Patches (Dark spots / Brown rot)
    decay_count = 0
    dark_count = 0
    brown_count = 0

    for i in range(total_pixels):
        r, g, b = pixels[i]
        brightness = (r + g + b) / 3.0

        if brightness < 50:
            dark_count += 1
            decay_count += 1
        elif r > 35 and r < 145 and g > 20 and g < 95 and b < 80 and (r - g) < 50 and r >= b:
            brown_count += 1
            decay_count += 1

    decay_ratio = decay_count / total_pixels
    dark_ratio = dark_count / total_pixels
    brown_ratio = brown_count / total_pixels

    # 4. Color Ratios
    rg_ratio = mean_r / (mean_g + 1e-5)
    rb_ratio = mean_r / (mean_b + 1e-5)
    gb_ratio = mean_g / (mean_b + 1e-5)

    # 5. Edge / Texture Analysis
    gray_img = img_resized.convert("L")
    edges = gray_img.filter(ImageFilter.FIND_EDGES)
    edge_pixels = list(edges.getdata())
    mean_edge = sum(edge_pixels) / total_pixels
    edge_density = sum(1 for e in edge_pixels if e > 40) / total_pixels

    # 6. Center vs Border Color Distribution
    center_r = []
    w, h = img_resized.size
    for y in range(int(h * 0.25), int(h * 0.75)):
        for x in range(int(w * 0.25), int(w * 0.75)):
            center_r.append(pixels[y * w + x][0])
    center_mean_r = sum(center_r) / len(center_r) if center_r else mean_r

    return [
        mean_r / 255.0,
        mean_g / 255.0,
        mean_b / 255.0,
        std_r / 128.0,
        std_g / 128.0,
        std_b / 128.0,
        mean_h / 255.0,
        mean_s / 255.0,
        mean_v / 255.0,
        pct_yellow,
        pct_orange,
        pct_red,
        decay_ratio,
        dark_ratio,
        brown_ratio,
        min(3.0, rg_ratio) / 3.0,
        min(3.0, rb_ratio) / 3.0,
        min(3.0, gb_ratio) / 3.0,
        mean_edge / 255.0,
        edge_density,
        center_mean_r / 255.0,
    ]


class DecisionNode:
    def __init__(self, feature_idx=None, threshold=None, left=None, right=None, value=None):
        self.feature_idx = feature_idx
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value

    def is_leaf(self):
        return self.value is not None

    def to_dict(self):
        if self.is_leaf():
            return {"value": self.value}
        return {
            "feature_idx": self.feature_idx,
            "threshold": self.threshold,
            "left": self.left.to_dict() if self.left else None,
            "right": self.right.to_dict() if self.right else None,
        }

    @staticmethod
    def from_dict(d):
        if not d:
            return None
        if "value" in d:
            return DecisionNode(value=d["value"])
        return DecisionNode(
            feature_idx=d["feature_idx"],
            threshold=d["threshold"],
            left=DecisionNode.from_dict(d["left"]),
            right=DecisionNode.from_dict(d["right"]),
        )


class VisionRandomForest:
    def __init__(self, n_trees=30, max_depth=10, min_samples_split=4, max_features=8):
        self.n_trees = n_trees
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.max_features = max_features
        self.trees = []
        self.classes = CLASS_NAMES

    def _gini(self, y):
        if not y:
            return 0
        counts = {}
        for item in y:
            counts[item] = counts.get(item, 0) + 1
        n = len(y)
        return 1.0 - sum((c / n) ** 2 for c in counts.values())

    def _build_tree(self, X, y, depth=0):
        n_samples = len(y)
        if depth >= self.max_depth or n_samples < self.min_samples_split or len(set(y)) == 1:
            counts = {c: y.count(c) for c in self.classes}
            total = sum(counts.values()) or 1
            probs = {c: counts[c] / total for c in self.classes}
            return DecisionNode(value=probs)

        n_features = len(X[0])
        feature_indices = random.sample(range(n_features), min(self.max_features, n_features))

        best_gain = -1
        best_feat = None
        best_thresh = None
        current_gini = self._gini(y)

        for feat in feature_indices:
            vals = sorted(list(set(X[i][feat] for i in range(n_samples))))
            if len(vals) < 2:
                continue

            step = max(1, len(vals) // 10)
            candidate_thresholds = [vals[i] for i in range(0, len(vals), step)]

            for thresh in candidate_thresholds:
                left_y = [y[i] for i in range(n_samples) if X[i][feat] <= thresh]
                right_y = [y[i] for i in range(n_samples) if X[i][feat] > thresh]

                if not left_y or not right_y:
                    continue

                p_left = len(left_y) / n_samples
                gain = current_gini - (p_left * self._gini(left_y) + (1 - p_left) * self._gini(right_y))

                if gain > best_gain:
                    best_gain = gain
                    best_feat = feat
                    best_thresh = thresh

        if best_gain <= 0.0001 or best_feat is None:
            counts = {c: y.count(c) for c in self.classes}
            total = sum(counts.values()) or 1
            probs = {c: counts[c] / total for c in self.classes}
            return DecisionNode(value=probs)

        left_X, left_y = [], []
        right_X, right_y = [], []

        for i in range(n_samples):
            if X[i][best_feat] <= best_thresh:
                left_X.append(X[i])
                left_y.append(y[i])
            else:
                right_X.append(X[i])
                right_y.append(y[i])

        left_child = self._build_tree(left_X, left_y, depth + 1)
        right_child = self._build_tree(right_X, right_y, depth + 1)

        return DecisionNode(feature_idx=best_feat, threshold=best_thresh, left=left_child, right=right_child)

    def fit(self, X, y):
        self.trees = []
        n_samples = len(X)

        for t in range(self.n_trees):
            indices = [random.randint(0, n_samples - 1) for _ in range(n_samples)]
            b_X = [X[i] for i in indices]
            b_y = [y[i] for i in indices]

            tree_root = self._build_tree(b_X, b_y)
            self.trees.append(tree_root)
            if (t + 1) % 5 == 0 or t == self.n_trees - 1:
                print(f"  [Progress] Trained {t + 1}/{self.n_trees} decision trees in ensemble...")

    def _predict_sample(self, node, x):
        if node.is_leaf():
            return node.value
        if x[node.feature_idx] <= node.threshold:
            return self._predict_sample(node.left, x)
        return self._predict_sample(node.right, x)

    def predict_proba(self, x):
        accum = {c: 0.0 for c in self.classes}
        for tree in self.trees:
            p = self._predict_sample(tree, x)
            for c in self.classes:
                accum[c] += p.get(c, 0.0)
        n = len(self.trees)
        return {c: accum[c] / n for c in self.classes}

    def predict(self, x):
        proba = self.predict_proba(x)
        best_cls = max(proba, key=proba.get)
        return best_cls, proba[best_cls]

    def to_dict(self):
        return {
            "n_trees": self.n_trees,
            "classes": self.classes,
            "trees": [t.to_dict() for t in self.trees],
        }

    @staticmethod
    def from_dict(d):
        rf = VisionRandomForest(n_trees=d["n_trees"])
        rf.classes = d["classes"]
        rf.trees = [DecisionNode.from_dict(t) for t in d["trees"]]
        return rf


def load_dataset(max_per_class=350):
    """
    Recursively scans dataset/ folder and extracts feature vectors from each fruit category.
    """
    print(f"[1/4] Scanning dataset directory at: {DATASET_DIR}")
    X = []
    y = []
    class_counts = {}

    for cls in CLASS_NAMES:
        cls_dir = os.path.join(DATASET_DIR, cls)
        if not os.path.exists(cls_dir):
            alt_dir = os.path.join(DATASET_DIR, "train", cls)
            if os.path.exists(alt_dir):
                cls_dir = alt_dir
            else:
                print(f"[WARN] Class directory {cls} not found at {cls_dir}")
                continue

        valid_exts = {".jpg", ".jpeg", ".png", ".webp"}
        files = [f for f in os.listdir(cls_dir) if os.path.splitext(f.lower())[1] in valid_exts]
        random.seed(42)
        random.shuffle(files)
        files_to_use = files[:max_per_class]

        print(f"  -> Class '{cls}': Ingesting {len(files_to_use)} images (available: {len(files)})...")
        loaded = 0

        for fname in files_to_use:
            fpath = os.path.join(cls_dir, fname)
            try:
                feats = extract_features_from_image(fpath)
                X.append(feats)
                y.append(cls)
                loaded += 1
            except Exception as e:
                pass

        class_counts[cls] = loaded

    print(f"Total dataset samples successfully extracted: {len(X)}")
    return X, y, class_counts


def train_and_evaluate():
    start_time = time.time()
    print("=" * 70)
    print("TraceFresh-AI Computer Vision Dataset Training Pipeline")
    print("=" * 70)

    # 1. Ingest Data
    X, y, counts = load_dataset(max_per_class=300)
    if not X:
        print("[ERROR] No images loaded from dataset! Please check dataset/ directory.")
        return

    # 2. Train / Test Split (80% Train, 20% Test)
    combined = list(zip(X, y))
    random.seed(42)
    random.shuffle(combined)

    split_idx = int(0.8 * len(combined))
    train_data = combined[:split_idx]
    test_data = combined[split_idx:]

    train_X, train_y = zip(*train_data)
    test_X, test_y = zip(*test_data)

    print(f"\n[2/4] Dataset Split: {len(train_X)} Training Samples, {len(test_X)} Validation Samples")

    # 3. Fit Ensemble Model
    print(f"\n[3/4] Training Multi-Tree Random Forest Vision Classifier on {len(train_X)} samples...")
    model = VisionRandomForest(n_trees=30, max_depth=12, min_samples_split=3, max_features=10)
    model.fit(list(train_X), list(train_y))

    # 4. Evaluate on Test Split
    print(f"\n[4/4] Evaluating Model Accuracy on {len(test_X)} Unseen Validation Images...")
    correct = 0
    per_class_correct = {c: 0 for c in CLASS_NAMES}
    per_class_total = {c: 0 for c in CLASS_NAMES}
    confusion_matrix = {actual: {pred: 0 for pred in CLASS_NAMES} for actual in CLASS_NAMES}

    for i in range(len(test_X)):
        pred_cls, conf = model.predict(test_X[i])
        actual_cls = test_y[i]
        per_class_total[actual_cls] += 1
        confusion_matrix[actual_cls][pred_cls] += 1

        if pred_cls == actual_cls:
            correct += 1
            per_class_correct[actual_cls] += 1

    overall_accuracy = (correct / len(test_X)) * 100.0
    elapsed = time.time() - start_time

    print("-" * 70)
    print(f"[METRIC] VALIDATION ACCURACY: {overall_accuracy:.2f}% ({correct}/{len(test_X)} correct)")
    print(f"[METRIC] TRAINING TIME: {elapsed:.2f}s")
    print("-" * 70)
    print("Class-Level Accuracy Breakdown:")
    for c in CLASS_NAMES:
        tot = per_class_total[c]
        corr = per_class_correct[c]
        pct = (corr / tot * 100.0) if tot > 0 else 0.0
        print(f"  - {c.ljust(16)}: {pct:6.2f}% ({corr}/{tot})")
    print("-" * 70)

    # 5. Export Model Artifact
    os.makedirs(os.path.dirname(MODEL_OUTPUT_PATH), exist_ok=True)
    export_payload = {
        "modelName": "tracefresh_vision_rf_v1",
        "trainedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "validationAccuracy": round(overall_accuracy, 2),
        "totalSamples": len(X),
        "classes": CLASS_NAMES,
        "featureDimension": len(X[0]),
        "modelData": model.to_dict(),
    }

    with open(MODEL_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(export_payload, f)

    print(f"[SUCCESS] Trained Vision AI Model exported to:\n  -> {MODEL_OUTPUT_PATH}\n")
    print("=" * 70)


if __name__ == "__main__":
    train_and_evaluate()
