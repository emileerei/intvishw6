import pandas as pd

# transpose the total monthly data first
df_m = pd.read_csv('mbta_total_monthly.csv', index_col='service_date')

monthly = pd.DataFrame(columns=['date','value','mode'])

for index in df_m.index:  #for each date
  for column in df_m.columns:   #for each mode of transport
    monthly = monthly.append({'date': index, 'value': df_m[column][index], 'mode': df_m[column].name}, ignore_index=True)

monthly.to_csv('updated_total.csv', index=False)

# transpose the weekday average data next
df_w = pd.read_csv('mbta_avg_nofloat.csv', index_col='service_date')

# create an empty dataframe for our new data with 3 columns
weekday = pd.DataFrame(columns=['date','value','mode'])

for index in df_w.index:  #for each date
  for column in df_w.columns:   #for each mode of transport
    weekday = weekday.append({'date': index, 'value': df_w[column][index], 'mode': df_w[column].name}, ignore_index=True)

weekday.to_csv('updated_average.csv', index=False)