import pandas as pd

df = pd.read_csv('mbta_total_monthly.csv', index_col='service_date')
print(df)

for index in df.index:  #acts as for each date
  for column in df.columns:   #acts as for each mode
    print(index, df[column][index], df[column].name)  #prints row data, not headers
