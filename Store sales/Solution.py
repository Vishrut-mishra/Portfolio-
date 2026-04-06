import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error
from xgboost import XGBRegressor
train = pd.read_csv("/Users/vishrutmishra/Project/Store sales/train.csv", parse_dates=["date"])
print(f"Data ranges from {train.date.min()} to {train.date.max()}")
print(train.head())
stores = pd.read_csv("/Users/vishrutmishra/Project/Store sales/stores.csv")
train = train.merge(stores, on = "store_nbr", how = "left")
print(train.head())
print(train.columns)
oil = pd.read_csv('oil.csv', parse_dates=['date'])

# Merge oil into our main dataframe
train = train.merge(oil, on='date', how='left')
print(train.head())
train['dcoilwtico'] = train['dcoilwtico'].ffill()
holidays = pd.read_csv("/Users/vishrutmishra/Project/Store sales/holidays_events.csv", parse_dates = ["date"])
national_holidays = holidays[holidays["type"] != "Work Day"]
national_holidays = national_holidays.drop_duplicates(subset = ["date"])
train = train.merge(national_holidays[["date", "type", "transferred"]], on = "date", how = "left")
train['month'] = train['date'].dt.month
train['day_of_week'] = train['date'].dt.dayofweek
train["is_pay_day"] = ((train['date'].dt.day == 15)|(train['date'].dt.is_month_end)).astype(int)    
train["is_weekend"] = train['day_of_week'].isin([5,6]).astype(int)
label_encoder = LabelEncoder()
train['family'] = label_encoder.fit_transform(train['family'])
train['city'] = label_encoder.fit_transform(train['city'])
train['type'] = label_encoder.fit_transform(train['type'])
print(train.head())
# 1. Define the split date (we'll take the last 30 days of data for testing)
split_date = train['date'].max() - pd.Timedelta(days=30)

# 2. Create the Training and Validation sets
# Training: Everything BEFORE the split date
# Validation: Everything AFTER the split date
train_set = train[train['date'] <= split_date]
val_set = train[train['date'] > split_date]

# 3. Separate the 'Target' (sales) from the 'Features'
X_train = train_set.drop(['sales', 'date', 'id'], axis=1)
y_train = train_set['sales']

X_val = val_set.drop(['sales', 'date', 'id'], axis=1)
y_val = val_set['sales']

# Initialize the model
# n_estimators=100 means we are building 100 small trees that learn from each other
model = XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5)

# Train the model
model.fit(X_train, y_train)

# 1. Ask the model to predict sales for the Validation set
predictions = model.predict(X_val)

# 2. Compare predictions to the actual answers (y_val)
# We take the square root to get the error in the same units as sales
rmse = np.sqrt(mean_squared_error(y_val, predictions))

print(f"Our model's average error is: {rmse:.2f} sales units")

test = pd.read_csv("/Users/vishrutmishra/Project/Store sales/test.csv", parse_dates = ["dates"])
test = test.merge(stores, on = "store_nbr", how = "left")
test = test.merge(oil, on = "date", how = "left")
test['dcoilwtico'] = test['dcoilwtico'].ffill()
test = test.merge(national_holidays[["date", "type", "transferred"]], on = "date", how = "left")
test['month'] = test['date'].dt.month
test['day_of_week'] = test['date'].dt.dayofweek
test["is_pay_day"] = ((test['date'].dt.day == 15)|(test['date'].dt.is_month_end)).astype(int)    
test["is_weekend"] = test['day_of_week'].isin([5,6]).astype(int)
test['family'] = label_encoder.transform(test['family'])
test['city'] = label_encoder.transform(test['city'])
test['type'] = label_encoder.transform(test['type'])
print(test.head())
X_test = test.drop(['date', 'id'], axis=1)

# 3. Make predictions on the test set
test_predictions = model.predict(X_test)

# 4. Create the submission file
submission = pd.DataFrame({
    'id': test['id'],
    'sales': test_predictions
})

# 5. Save the submission file
submission.to_csv('submission.csv', index=False)

print("Submission file created successfully!")
