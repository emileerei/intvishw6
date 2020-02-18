import pandas as pd

df_m = pd.read_csv('mbta_total_monthly.csv', index_col='service_date')

monthly = pd.DataFrame(columns=['date','value','mode'])

for index in df_m.index:  #acts as for each date
  for column in df_m.columns:   #acts as for each mode
    monthly = monthly.append({'date': index, 'value': df_m[column][index], 'mode': df_m[column].name}, ignore_index=True)

# print(monthly)
monthly.to_csv('updated_total.csv', index=False)


df_w = pd.read_csv('mbta_avg_nofloat.csv', index_col='service_date')

weekday = pd.DataFrame(columns=['date','value','mode'])

for index in df_w.index:  #acts as for each date
  for column in df_w.columns:   #acts as for each mode
    weekday = weekday.append({'date': index, 'value': df_w[column][index], 'mode': df_w[column].name}, ignore_index=True)

# print(weekday)
weekday.to_csv('updated_average.csv', index=False)