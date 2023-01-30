# IoT Receiver

## Description

This repository contains the project work for courses COMP.SE.610 and COMP.SE.620. This project is a system that handles IoT Receiver data and visualises the data on a web page.
The system is divided into a backend and frontend. Both applications will be deployed as Docker containers and should be independent of each other.

## Tool and technologies - Backend

- Data from the IoT devices is stored in PostgreSQL and served through a REST API.
API server is built using Express.js.
- API server requests data from the database manager that handles queries to the database.
- Separate MQTT client subscribes to the MQTT Broker and passes the data to the database 
manager.

## Usage instructions

1. To install the system, you must first have Docker installed and running.
2. Go to the root of the project and copy and paste the .env.dist file.
   Then rename that file as .env. Modify it to your liking and make sure that each key has a valid value.
   On first run, you should set the env. variable "DB_CREATE_DATABASE" to "true", so the tables get built. After the first run, it can be set as false.
3. After environment file is set up, you can run terminal command "docker-compose build".
4. After docker-compose has finished running, run command "docker-compose up".
5. Wait until app is up, and navigate to localhost:3000.
6. Log in with the following use the credentials that you set in the environment file for Docker compose.

## program structure

![alt](/backend/docs/SystemArchitecture.png?raw=true)

Basic diagram of high-level program structure.

## database diagram

![alt](/backend/docs/database_diagram.png?raw=true)