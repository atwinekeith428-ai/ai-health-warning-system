import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

# 1. Load the dataset
print("Loading dataset...")
df = pd.read_csv('Maternal Health Risk Data Set.csv')

# 2. Clean the data (Remove any rows with missing values)
df = df.dropna()

# 3. Prepare Features (X) and Target (y)
# The CSV columns are: Age, SystolicBP, DiastolicBP, BS, BodyTemp, HeartRate, RiskLevel
X = df[['Age', 'SystolicBP', 'DiastolicBP', 'BS', 'BodyTemp', 'HeartRate']]
y = df['RiskLevel']

# 4. Encode the Target Labels (low risk, mid risk, high risk -> 0, 1, 2)
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# 5. Split data into Training and Testing sets (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

# 6. Train the Machine Learning Model
print("Training the model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 7. Check Accuracy
accuracy = model.score(X_test, y_test)
print(f"Model Accuracy: {accuracy * 100:.2f}%")

# 8. Save the model and the label encoder to disk
joblib.dump(model, 'maternal_risk_model.pkl')
joblib.dump(label_encoder, 'label_encoder.pkl')
print("Model saved as 'maternal_risk_model.pkl'")