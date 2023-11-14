# Water consumption Calculator

This service calculates the amount of water consumption for a given day. CSV formatted time series data is provided. This file contains two columns: timestamps, and respective water meter values as liters. The service parses this data and aggregates the data into a list of net hourly consumptions per each day.

> [!NOTE]
> This solution doesn't consider Daylight Saving Time (DST)

## API Endpoints

`GET /consumptions`

Return list of net hourly consumptions for each day.

Example

```json
{
  "items": [
    {"date":"2022-12-12","netConsumptions":[2,0,1,0,0,0,91,120,10,3,0,1,11,20,0,1,8,22,4,1,15,3,99,2]},
    {"date":"2022-12-13","netConsumptions":[1,1,0,0,0,3,5,202,10,10,1,7,25,0,11,1,3,21,2,2,0,10,70,4]},
    {"date":"2022-12-14","netConsumptions":[12,0,0,0,0,1,20,93,78,13,2,0,2,33,4,0,5,3,27,3,6,84,15,3]},
    {"date":"2022-12-15","netConsumptions":[0,1,1,0,0,2,77,101,30,16,0,0,9,28,3,1,6,19,7,2,6,14,91,1]},
    {"date":"2022-12-16","netConsumptions":[0,1,0,0,1,1,8,67,7,4,0,1,12,20,5,1,6,16,10,2,7,28,69,3]}
  ]
}
```

`GET /consumptions/daily`
`GET /consumptions/daily?date="2022-12-12"`

Return net hourly consumptions for a given day.

If optional query parameter date is not provided

- It will return current date consumption
- It uses the actual values for the passed hours
- For the ongoing hour and future hours of the day, forecast from previous usage will be provided

Example

- Assumed current time _2022-12-16 13:37_
- Net consumption from _00:00 - 13:00_ are used from actual values, while the remaining hours from _14:00 - 24:00_ are estimated values based on water consumption of previous days.

```json
{
  "date":"2022-12-16",
  "netConsumptions":[0,1,0,0,1,1,8,67,7,4,0,1,12,20,5,1,6,16,10,2,7,28,69,3]
}
```

If query parameter date is provided, actual usage of that given day will returned.

Example

```json
{
  "date":"2022-12-12",
  "netConsumptions": [2,0,1,0,0,0,91,120,10,3,0,1,11,20,0,1,8,22,4,1,15,3,99,2]
}
```

## Future improvement directions

- Consider DST when generating net consumptions and forecasting hourly usages. It will be worth utilizing already existing date libraries, E.g. [date-fns](https://date-fns.org/).

- Add unit tests for endpoints and modules to properly test the corner cases.

- Aggregated data of net hourly usage per day can be saved into persistence storage so that it can be easily queried by a given date.

- Now the forecast is computed from average net consumption of the previous days for a specific hour. However, a proper machine learning model will give a better estimate. For example, considering if a given day is on weekday, weekend or holiday. Or consider some other correlated variables to water consumption.