# nutrition_tracker
web application to track nutrition intake

## Technical Stack
1. Node
2. Express
3. React
4. Postgresql

you need to have these three installed to run these web application.

## How to run?

### Node service
* Go to the node folder
* Add the following environment variables which represent the database connection.
  * DB_PASSWORD  
  * DB_USER  
  * DB_NAME  
  * DB_PORT
  * TOKEN_STRING
* Afer that do ```npm install```
* Then you have to install knex using ```npm install -g knex```
* You have to do ```knex migrate:latest``` to do database migrations to create all the tables.
* Use ```npm run start``` to start the server on port 3000

### Web Service
* Go to the web folder
* A note for running on windows system. Open package.json and change line number 6. There change the port to set so that environment variable can be set deciding where this service will be run.
* Do ```npm install``` which will install all dependencies.
* After that to run webserver do ```npm run start```

## Folder Structure
* Both services have almost all of their codes in the src directory.
* Both services have ```.eslintrc.json``` to use eslint which helps in maintaining proper code structure.
* For node's codebase we have following folders
  * auth - contains authentication and authorization helpers functions.
  * db - to store database connection file and database migrations
  * routes - it contains all the routes for this service
* For web's codebase we have the following folders
  * urls.js stores all the URLs we will be needing to make our service functional which in this case is one.
  * pages - contains all the folders for every single route which makes it easier to navigate from the interface to file for developers.

## Design choices
* For log in we are storing password as encrypted strings and you can use a seed string by setting ```TOKEN_STRING```.
* For backend queries we are using knex. It helps in making easy migrations and rollback. It is also easier to do simple tasks like inserts, updates and deletes. All of that should be done using queries but knex provides processing of user-entered parameters which can contain certain characters. That can break the code and this does handle that.
* I am not allowing admins to created new meals as it didn't make sense that an admin can create content for other users.
