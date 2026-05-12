import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import joblib

# 1. Load attendance/activity data (replace with your export path)
data = pd.read_csv('attendance_data.csv')

# 2. Feature engineering (example: attendance %, assignments completed, etc.)
# Assume columns: student_id, attendance_percent, assignments_completed, at_risk (0/1)
X = data[['attendance_percent', 'assignments_completed']]
y = data['at_risk']

# 3. Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Train model
model = LogisticRegression()
model.fit(X_train, y_train)

# 5. Evaluate
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))

# 6. Save model
joblib.dump(model, 'at_risk_model.joblib')
print('Model saved as at_risk_model.joblib')
