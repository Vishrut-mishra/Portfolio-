import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import datetime as dt

df = pd.read_csv("/Users/vishrutmishra/Project/Online_Retail_Analysis/data/raw/online_retail_II.csv")

df.head()
df['InvoiceDate'] = pd.to_datetime(df["InvoiceDate"], format='%Y-%m-%d %H:%M:%S')
#print(df["InvoiceDate"].head())
# Removing rows with no Customer ID
df.dropna(subset = ["Customer ID"], inplace=True)
# Removing rows with C in InvoiceNo since they are cancellations
df = df[~df["InvoiceNo"].str.contains("C", na = False)]
# Removing Free stuff or invalid data
df = df[(df['Quantity']>0) & (df['Price']>0)] 
df['TotalRevenue'] = df['Quantity'] * df['Price']
print(df['TotalRevenue'].head())
# Grouping by country and calculating total revenue and number of unique customers
country_analysis = df.groupby('Country').agg({
    'TotalRevenue': 'sum',
    'Customer ID': 'nunique'
}).sort_values(by='TotalRevenue', ascending=False)


# 1. Create a Year-Month column
df['Month'] = df['InvoiceDate'].dt.month
df['Year'] = df['InvoiceDate'].dt.year

# 2. Group by Year and Month to see the trend
monthly_trend = df.groupby(['Year', 'Month'])['TotalRevenue'].sum().reset_index()

print(monthly_trend)