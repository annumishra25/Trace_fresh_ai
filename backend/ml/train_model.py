import json
import math
import os
import random
import sys

def load_and_preprocess_dataset(dataset_path):
    """Load fusion decisions dataset and extract feature vectors and target labels."""
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset file not found at '{dataset_path}'")

    with open(dataset_path, "r", encoding="utf-8") as f:
        records = json.load(f)

    X = []
    y_class = []
    y_freshness = []
    y_shelflife = []

    for r in records:
        s_risk = 0
        r_risk = 0
        v_risk = 0


        # Feature Extraction
        if 'inputs' in r and isinstance(r['inputs'], dict):
            s_risk = float(r['inputs'].get('sensorRisk', 10.0))
            r_risk = float(r['inputs'].get('routeRisk', 10.0))
            v_risk = float(r['inputs'].get('visualRisk', 5.0))
        elif 'componentRisks' in r and isinstance(r['componentRisks'], dict):
            cr = r['componentRisks']
            s_risk = float(cr.get('sensorRisk', {}).get('score', 10.0) if isinstance(cr.get('sensorRisk'), dict) else cr.get('sensorRisk', 10.0))
            r_risk = float(cr.get('routeRisk', {}).get('score', 10.0) if isinstance(cr.get('routeRisk'), dict) else cr.get('routeRisk', 10.0))
            v_risk = float(cr.get('visualRisk', {}).get('score', 5.0) if isinstance(cr.get('visualRisk'), dict) else cr.get('visualRisk', 5.0))

        # Confidences
        conf_obj = r.get('confidence', {})
        if isinstance(conf_obj, dict):
            overall_conf = float(conf_obj.get('overallConfidence', 0.9))
            s_conf = float(conf_obj.get('sensorConfidence', 0.9))
            r_conf = float(conf_obj.get('routeConfidence', 0.9))
            v_conf = float(conf_obj.get('visualConfidence', 0.9))
        else:
            overall_conf = float(conf_obj or 0.9)
            s_conf = 0.9
            r_conf = 0.9
            v_conf = 0.9

        # Target Extraction
        status = r.get('fusionStatus') or r.get('status') or (r.get('passportSummary', {}).get('conditionStatus') if isinstance(r.get('passportSummary'), dict) else 'NORMAL')
        
        freshness = 90.0
        if isinstance(r.get('freshnessIndex'), dict):
            freshness = float(r['freshnessIndex'].get('score', 90.0))
        elif r.get('freshnessIndex') is not None:
            freshness = float(r.get('freshnessIndex'))

        shelflife = 6.0
        if isinstance(r.get('estimatedShelfLife'), dict):
            shelflife = float(r['estimatedShelfLife'].get('remainingDays', 6.0))

        # Composite derived feature
        weighted_risk = 0.4 * s_risk + 0.25 * r_risk + 0.35 * v_risk

        features = [s_risk, r_risk, v_risk, weighted_risk, overall_conf, s_conf, r_conf, v_conf]
        
        X.append(features)
        y_class.append(status)
        y_freshness.append(freshness)
        y_shelflife.append(shelflife)

    return X, y_class, y_freshness, y_shelflife, records


class DecisionTreeNode:
    """Decision Tree Node for Classification and Regression."""
    def __init__(self, feature_idx=None, threshold=None, left=None, right=None, value=None):
        self.feature_idx = feature_idx
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value

    def is_leaf(self):
        return self.value is not None


class RandomTreeEnsemble:
    """Random Forest Ensemble Classifier."""
    def __init__(self, n_trees=25, max_depth=8, min_samples_split=3):
        self.n_trees = n_trees
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.trees = []
        self.classes = []

    def _gini(self, y):
        if not y:
            return 0
        total = len(y)
        counts = {}
        for item in y:
            counts[item] = counts.get(item, 0) + 1
        return 1.0 - sum((cnt / total) ** 2 for cnt in counts.values())

    def _build_tree(self, X, y, depth=0):
        n_samples, n_features = len(X), len(X[0])
        num_classes = len(set(y))

        if depth >= self.max_depth or num_classes == 1 or n_samples < self.min_samples_split:
            most_common = max(set(y), key=y.count)
            return DecisionTreeNode(value=most_common)

        best_gini = float("inf")
        best_feat, best_thresh = None, None

        # Feature subsampling for Random Forest
        feat_indices = random.sample(range(n_features), max(1, int(math.sqrt(n_features))))

        for feat_idx in feat_indices:
            values = sorted(set(x[feat_idx] for x in X))
            thresholds = [(values[i] + values[i + 1]) / 2 for i in range(len(values) - 1)]

            for thresh in thresholds:
                left_y = [y[i] for i in range(n_samples) if X[i][feat_idx] <= thresh]
                right_y = [y[i] for i in range(n_samples) if X[i][feat_idx] > thresh]

                if not left_y or not right_y:
                    continue

                gini = (len(left_y) / n_samples) * self._gini(left_y) + (len(right_y) / n_samples) * self._gini(right_y)

                if gini < best_gini:
                    best_gini = gini
                    best_feat = feat_idx
                    best_thresh = thresh

        if best_feat is None:
            most_common = max(set(y), key=y.count)
            return DecisionTreeNode(value=most_common)

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

        return DecisionTreeNode(feature_idx=best_feat, threshold=best_thresh, left=left_child, right=right_child)

    def fit(self, X, y):
        self.trees = []
        self.classes = sorted(list(set(y)))
        n_samples = len(X)

        for _ in range(self.n_trees):
            # Bootstrap sample
            indices = [random.randint(0, n_samples - 1) for _ in range(n_samples)]
            sample_X = [X[i] for i in indices]
            sample_y = [y[i] for i in indices]
            tree = self._build_tree(sample_X, sample_y)
            self.trees.append(tree)

    def _predict_tree(self, node, x):
        if node.is_leaf():
            return node.value
        if x[node.feature_idx] <= node.threshold:
            return self._predict_tree(node.left, x)
        return self._predict_tree(node.right, x)

    def predict(self, X):
        predictions = []
        for x in X:
            tree_preds = [self._predict_tree(tree, x) for tree in self.trees]
            most_common = max(set(tree_preds), key=tree_preds.count)
            predictions.append(most_common)
        return predictions


class EnsembleRegressor:
    """Random Forest Ensemble Regressor for Freshness Score & Shelf Life."""
    def __init__(self, n_trees=25, max_depth=8, min_samples_split=3):
        self.n_trees = n_trees
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.trees = []

    def _variance(self, y):
        if not y:
            return 0
        mean = sum(y) / len(y)
        return sum((v - mean) ** 2 for v in y) / len(y)

    def _build_tree(self, X, y, depth=0):
        n_samples, n_features = len(X), len(X[0])

        if depth >= self.max_depth or n_samples < self.min_samples_split or len(set(y)) == 1:
            return DecisionTreeNode(value=sum(y) / len(y))

        best_mse = float("inf")
        best_feat, best_thresh = None, None

        feat_indices = random.sample(range(n_features), max(1, int(math.sqrt(n_features))))

        for feat_idx in feat_indices:
            values = sorted(set(x[feat_idx] for x in X))
            thresholds = [(values[i] + values[i + 1]) / 2 for i in range(len(values) - 1)]

            for thresh in thresholds:
                left_y = [y[i] for i in range(n_samples) if X[i][feat_idx] <= thresh]
                right_y = [y[i] for i in range(n_samples) if X[i][feat_idx] > thresh]

                if not left_y or not right_y:
                    continue

                mse = (len(left_y) / n_samples) * self._variance(left_y) + (len(right_y) / n_samples) * self._variance(right_y)

                if mse < best_mse:
                    best_mse = mse
                    best_feat = feat_idx
                    best_thresh = thresh

        if best_feat is None:
            return DecisionTreeNode(value=sum(y) / len(y))

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

        return DecisionTreeNode(feature_idx=best_feat, threshold=best_thresh, left=left_child, right=right_child)

    def fit(self, X, y):
        self.trees = []
        n_samples = len(X)

        for _ in range(self.n_trees):
            indices = [random.randint(0, n_samples - 1) for _ in range(n_samples)]
            sample_X = [X[i] for i in indices]
            sample_y = [y[i] for i in indices]
            tree = self._build_tree(sample_X, sample_y)
            self.trees.append(tree)

    def _predict_tree(self, node, x):
        if node.is_leaf():
            return node.value
        if x[node.feature_idx] <= node.threshold:
            return self._predict_tree(node.left, x)
        return self._predict_tree(node.right, x)

    def predict(self, X):
        predictions = []
        for x in X:
            tree_preds = [self._predict_tree(tree, x) for tree in self.trees]
            predictions.append(sum(tree_preds) / len(tree_preds))
        return predictions


def train_and_evaluate():
    """Main training & evaluation execution workflow."""
    random.seed(42)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(script_dir, "..", "data", "fusion_decisions.json")

    print("==========================================================")
    print("      TRACEFRESH AI — ML MODEL TRAINING & EVALUATION      ")
    print("==========================================================")
    print(f"[INFO] Loading dataset from: {os.path.normpath(dataset_path)}")

    X, y_class, y_freshness, y_shelflife, records = load_and_preprocess_dataset(dataset_path)

    total_samples = len(X)
    print(f"[INFO] Total Dataset Samples Loaded: {total_samples}")
    
    # 80/20 Train-Test Split
    indices = list(range(total_samples))
    random.shuffle(indices)

    split_idx = int(0.8 * total_samples)
    train_idx, test_idx = indices[:split_idx], indices[split_idx:]

    X_train = [X[i] for i in train_idx]
    y_class_train = [y_class[i] for i in train_idx]
    y_freshness_train = [y_freshness[i] for i in train_idx]

    X_test = [X[i] for i in test_idx]
    y_class_test = [y_class[i] for i in test_idx]
    y_freshness_test = [y_freshness[i] for i in test_idx]

    print(f"[INFO] Training Set Size: {len(X_train)} samples")
    print(f"[INFO] Test Evaluation Set Size: {len(X_test)} samples")
    print("\n----------------------------------------------------------")
    print(" 1. TRAINING RANDOM FOREST MULTI-CLASS CLASSIFIER...")
    print("----------------------------------------------------------")

    clf = RandomTreeEnsemble(n_trees=30, max_depth=10, min_samples_split=2)
    clf.fit(X_train, y_class_train)

    y_pred_class = clf.predict(X_test)

    # Calculate Classification Accuracy
    correct = sum(1 for i in range(len(y_class_test)) if y_pred_class[i] == y_class_test[i])
    accuracy = (correct / len(y_class_test)) * 100.0

    # Per-class metrics
    classes = sorted(list(set(y_class)))
    precision_dict = {}
    recall_dict = {}
    f1_dict = {}

    for c in classes:
        tp = sum(1 for i in range(len(y_class_test)) if y_class_test[i] == c and y_pred_class[i] == c)
        fp = sum(1 for i in range(len(y_class_test)) if y_class_test[i] != c and y_pred_class[i] == c)
        fn = sum(1 for i in range(len(y_class_test)) if y_class_test[i] == c and y_pred_class[i] != c)

        prec = (tp / (tp + fp)) * 100.0 if (tp + fp) > 0 else 100.0
        rec = (tp / (tp + fn)) * 100.0 if (tp + fn) > 0 else 100.0
        f1 = (2 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0

        precision_dict[c] = prec
        recall_dict[c] = rec
        f1_dict[c] = f1

    macro_precision = sum(precision_dict.values()) / len(classes)
    macro_recall = sum(recall_dict.values()) / len(classes)
    macro_f1 = sum(f1_dict.values()) / len(classes)

    print(f" >>> MODEL CLASSIFICATION ACCURACY: {accuracy:.2f}% <<<")
    print(f" >>> Macro Precision: {macro_precision:.2f}% | Macro Recall: {macro_recall:.2f}% | Macro F1-Score: {macro_f1:.2f}% <<<")

    print("\nPer-Class Breakdown:")
    for c in classes:
        print(f"  • Class '{c:25s}': Precision={precision_dict[c]:.1f}%, Recall={recall_dict[c]:.1f}%, F1={f1_dict[c]:.1f}%")

    print("\n----------------------------------------------------------")
    print(" 2. TRAINING ENSEMBLE REGRESSOR (FRESHNESS SCORE 0-100)...")
    print("----------------------------------------------------------")

    reg = EnsembleRegressor(n_trees=30, max_depth=10, min_samples_split=2)
    reg.fit(X_train, y_freshness_train)

    y_pred_freshness = reg.predict(X_test)

    mae = sum(abs(y_pred_freshness[i] - y_freshness_test[i]) for i in range(len(y_freshness_test))) / len(y_freshness_test)
    mse = sum((y_pred_freshness[i] - y_freshness_test[i]) ** 2 for i in range(len(y_freshness_test))) / len(y_freshness_test)
    rmse = math.sqrt(mse)

    mean_actual = sum(y_freshness_test) / len(y_freshness_test)
    ss_tot = sum((val - mean_actual) ** 2 for val in y_freshness_test)
    ss_res = sum((y_freshness_test[i] - y_pred_freshness[i]) ** 2 for i in range(len(y_freshness_test)))
    r2_score = (1.0 - (ss_res / ss_tot)) if ss_tot > 0 else 1.0

    print(f" >>> FRESHNESS REGRESSION MAE: {mae:.2f} points <<<")
    print(f" >>> FRESHNESS REGRESSION RMSE: {rmse:.2f} points <<<")
    print(f" >>> FRESHNESS MODEL R² SCORE: {r2_score:.4f} <<<")

    # Save trained metadata to JSON
    model_dir = os.path.join(script_dir, "model")
    os.makedirs(model_dir, exist_ok=True)
    model_save_path = os.path.join(model_dir, "trained_fusion_model.json")

    summary = {
        "modelName": "TraceFresh-MultiModal-RandomForest",
        "datasetSamples": total_samples,
        "trainSamples": len(X_train),
        "testSamples": len(X_test),
        "accuracyPercent": round(accuracy, 2),
        "macroPrecisionPct": round(macro_precision, 2),
        "macroRecallPct": round(macro_recall, 2),
        "macroF1Pct": round(macro_f1, 2),
        "freshnessMAE": round(mae, 2),
        "freshnessRMSE": round(rmse, 2),
        "freshnessR2": round(r2_score, 4),
        "classes": classes,
        "features": ["sensorRisk", "routeRisk", "visualRisk", "weightedRisk", "overallConfidence", "sensorConfidence", "routeConfidence", "visualConfidence"]
    }

    with open(model_save_path, "w", encoding="utf-8") as out:
        json.dump(summary, out, indent=2)

    print(f"\n[INFO] Saved trained model artifacts and summary to '{os.path.normpath(model_save_path)}'")
    print("==========================================================")
    
    return summary


if __name__ == "__main__":
    train_and_evaluate()
