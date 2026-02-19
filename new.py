import pandas as pd
df = pd.read_csv('Lending-company.csv', usecols = ['Location'])
df.squeeze()