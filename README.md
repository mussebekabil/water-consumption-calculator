# Water consumption Calculator

## Introduction

This service calculates the amount of water consumption for a given day. CSV formatted time series data is provided. This file contains two columns: timestamps, and respective water meter values as liters. The service parses this data and aggregates the data into a list of net hourly consumptions per each day.

> [!NOTE] This solution doesn't consider Daylight Saving Time (DST)

## Domain Driven Design approach for the solution

This water consumption calculator service is developed using [SST](https://sst.dev/) framework that makes it easy to build modern applications on AWS. This solution adopts _Domain Driven Design (DDD)_ to keep a separate layer to handle the business logic. The details of such approach and it's benefits on adopting in `sst` project can be found [here](https://docs.sst.dev/learn/domain-driven-design).

The project is modularized in to `packages/core` and `packages/functions` modules. Currently, all the business logic resides under the `core` module and `functions` module is used as presentation layer. One of the benefit of this is to take out the logic from the API. For instance, if the REST API implementation need to be changed to graphQL, it can be done without affecting the `core` module.

We have other `utils` and `repositories` under the `core` module. However, the `domains` are responsible for implementing the main business logic. This helps to separate the data access and related infrastructure details from the domain. Hence, only the `repository` has the data access. Similarly, this helps that, for example, if the water consumption data is coming from different database or local file, changes will only be applied to the data access layer without affecting the business logic implemented in the `domains`.

## Runbook

### Clone the Repository

Clone the project and change to the project directory.

```bash
git clone git@github.com:mussebekabil/water-consumption-calculator.git
cd water-consumption-calculator
```

### Check the right node version

In the project directory, there is `.nvmrc` file which has the proper `node` version. If you have `nvm` installed in your machine, you can run the following command to activate `v18.17.1`. Otherwise, install the version directly.

```bash
nvm use
```

### Install dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory and add the necessary environment variables. Refer to the sample `.env.example` for required keys. Also, it's possible to run with some third-party tool to securely store and access AWS credentials in a development environment. For example, [aws-vault](https://github.com/99designs/aws-vault)

### Start the Dev server

Once AWS credentials are configured, now we can run the service and test locally with live lambda that is accessible through `sst`.

If AWS CLI is connected through `.env` file, then run simply the following command to start testing the endpoints.

```bash
   npm run dev
```

However, if `aws-vault` is used, run the service using the following command

```bash
   aws-vault exec <name-of-your-aws-vault-profile> -- npm run dev
```

### Build and deploying to AWS

The service can be build and deployed with the following command.

```bash
   npm run build
```

```bash
   npm run deploy
```

Similarly, `aws-vault` can be used in such a way to run the build and deployment script.

```bash
   aws-vault exec <name-of-your-aws-vault-profile> -- npm run build
```

```bash
   aws-vault exec <name-of-your-aws-vault-profile> -- npm run deploy
```

## API Endpoints

The current solution is deployed on AWS, and can be used to as a [${base-url}](https://5xv1uwhyr9.execute-api.eu-west-1.amazonaws.com) to run the following endpoints.

[`GET /consumptions`](https://5xv1uwhyr9.execute-api.eu-west-1.amazonaws.com/consumptions)

Return list of net hourly consumptions for each day.

Example

```json
{
  "items": [
    {
      "date": "2022-12-12",
      "netConsumptions": [
        2, 0, 1, 0, 0, 0, 91, 120, 10, 3, 0, 1, 11, 20, 0, 1, 8, 22, 4, 1, 15,
        3, 99, 2
      ]
    },
    {
      "date": "2022-12-13",
      "netConsumptions": [
        1, 1, 0, 0, 0, 3, 5, 202, 10, 10, 1, 7, 25, 0, 11, 1, 3, 21, 2, 2, 0,
        10, 70, 4
      ]
    },
    {
      "date": "2022-12-14",
      "netConsumptions": [
        12, 0, 0, 0, 0, 1, 20, 93, 78, 13, 2, 0, 2, 33, 4, 0, 5, 3, 27, 3, 6,
        84, 15, 3
      ]
    },
    {
      "date": "2022-12-15",
      "netConsumptions": [
        0, 1, 1, 0, 0, 2, 77, 101, 30, 16, 0, 0, 9, 28, 3, 1, 6, 19, 7, 2, 6,
        14, 91, 1
      ]
    },
    {
      "date": "2022-12-16",
      "netConsumptions": [
        0, 1, 0, 0, 1, 1, 8, 67, 7, 4, 0, 1, 12, 20, 5, 1, 6, 16, 10, 2, 7, 28,
        69, 3
      ]
    }
  ]
}
```

[`GET /consumptions/daily`](https://5xv1uwhyr9.execute-api.eu-west-1.amazonaws.com/consumptions/daily)

[`GET /consumptions/daily?date="2022-12-12"`](https://5xv1uwhyr9.execute-api.eu-west-1.amazonaws.com/consumptions/daily?date="2022-12-12")

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
  "date": "2022-12-16",
  "netConsumptions": [
    0, 1, 0, 0, 1, 1, 8, 67, 7, 4, 0, 1, 12, 20, 5, 1, 6, 16, 10, 2, 7, 28, 69,
    3
  ]
}
```

If query parameter date is provided, actual usage of that given day will returned.

Example

```json
{
  "date": "2022-12-12",
  "netConsumptions": [
    2, 0, 1, 0, 0, 0, 91, 120, 10, 3, 0, 1, 11, 20, 0, 1, 8, 22, 4, 1, 15, 3,
    99, 2
  ]
}
```

## Future improvement directions

- Consider DST when generating net consumptions and forecasting hourly usages. It will be worth utilizing already existing date libraries, E.g. [date-fns](https://date-fns.org/).

- Add unit tests for endpoints and modules to properly test the corner cases.

- Aggregated data of net hourly usage per day can be saved into persistence storage so that it can be easily queried by a given date.

- Now the forecast is computed from average net consumption of the previous days for a specific hour. However, a proper machine learning model will give a better estimate. For example, considering if a given day is on weekday, weekend or holiday. Or consider some other correlated variables to water consumption.
