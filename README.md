# Introduction

- Client CLI to process email message based on predefined set of rules

## :ledger: Index

- [Usage](#zap-usage)
  - [Installation](#cli-installation)
  - [Configuration](#cli-configuration)
  - [Commands](#cli-commands)
- [Development](#development)
  - [Pre-Requisites](#pre-requisites)
  - [File Structure](#file_folder-file-structure)

## :zap: Usage

1. Run load script to get a list of messages and store the email messages on mysql database.
2. Process the emails based on the predefined set of rules

## :electric_plug: Installation

- Install package dependencies

```
yarn
```

- Start MySQL database using docker compose up command
- Run below command on root of the project folder

```
docker-compose up -d
```

## :electric_plug: Configuration

- OAuth setup is required to run this app, please follow the steps mentioned on the below documentation for obtaining the EMAIL_OAUTH_CODE, EMAIL_CLIENT_REFRESH_TOKEN mentioned on .env file

<https://developers.google.com/identity/protocols/oauth2>

- Need to add email to the whitelist on client console for testing the app

## :package: Commands

- Load the inbox messages:

```
yarn load-inbox
```

- Apply rules based on apply-rules.json:

```
yarn apply-rules
```

## :notebook: Pre-Requisites

- Docker
- Node (Version>=16.17.0)
- yarn

## :file_folder: File Structure

Project folder structure and details

```
.
├── common
│   ├── utils.js
├── connector
│   ├── db-connect.js
│   ├── gmail-connect.js
├── docker
│   ├── docker-entrypoint-initdb.d
│       ├── createdb.sql
│   ├── Dockerfile
│   ├── my.cnf
│── engine
│   ├── config-rules.json
│   └── manage-rules.js
├── node_modules
├── .env
├── .gitignore
├── apply-rules.js
├── apply-rules.json
├── docker-compose.yml
├── load-inbox.js
├── package.json
└── README.md
```

| No | File Name | Details
|----|------------|-------|
| 1  | load-inbox.js | Refresh the inbox list
| 2  | apply-rules.js | Apply the rules on apply-rules.json
| 3  | apply-rules.json | Example rules for applying
| 4  | engine/config-rules.json | Available rules and predicates
