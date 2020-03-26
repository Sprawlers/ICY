# Utility App for ISE

A stack of services and APIs that is designed to work together as an application providing comfortability for ISE student amidst an intense, as well as competitive, studying environment.

**Important:** Currently, this README.md is completely deprecated and required for an update.

## Getting started

To setup a development environment, you can simply run `docker-compose up -d` at the project's home folder to initiate the compose file above. After a few minutes of the installation, two application instances will be deployed: MongoDB  on `localhost:27017` and Mongo Express on `localhost:8081`. The DB default username and password in development environment are `administrator` and `12345` respectively.

**Important:** Keep in mind that the database IP address of within the production ecosystem might be different from that of development environment.

## Directory structure

Currently, as a guideline, the maintainer thinks that the structure of the project should be organized as followed.
- `/homework/` for homework solution service
- `/linebot/` for LINE messaging API integration service
