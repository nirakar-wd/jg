# E-commerce

# Get started
1. Install dependencies
`npm install`

2. .env 

3. Setup database(create db named jg_commerce)
start server using `npm start` 

4. Migrations
Run migrations: `npx sequelize-cli db:migrate`
To undo migrations: `npx sequelize-cli db:migrate:undo`

5. Seed database
Run seeder: `npx sequelize-cli db:seed:all`
To undo: `npx sequelize-cli db:seed:undo`


# Features
- Authentication / Authorization
- Paging
- CRUD operations on products, comments, tags, categories

# Learning Params
- Sequelize ORM
    - associations: hasMany, belongsTo, belongsToMany
    - scopes
    - virtuals
    - complex queries
    - paging
    - eager loading, select columns on related associations
    
- express
    - middlewares
    - authentication
    - authorization
- seed data with faker js
- misc
    - project structure
    - dotenv
    
# Understanding the project

Project structure:
- models: Mvc, it is our domain data.
- dtos: it contains our serializers, they will create the response to be sent as json. They also take care of validating the input(feature incomplete)
- controllers: well this is the mvC, our business logic.
- routes: they register routes to router middleware
- middleware: some useful middleware, mainly the authentication and authorization middleware.
- config: the database configurer.
- seeders: contains the file that seeds the database.
- .env the env file from where to populate the process.env node js environment variable
- public: contains the uploaded files.

```shell
npm install --save sequelize
# npm install --save sqlite3
npm install --save mysql2
# or
# yarn add sqlite3
# yarn add mysql2
npm install --save sequelize-cli
# Generate sequelize folders and config.json with:
./node_modules/.bin/sequelize init

# Populate config.json with connection settings
# then create the database with:
$ ./node_modules/.bin/sequelize db:create

# generate models and migration files
$ node_modules/.bin/sequelize model:generate --name User --attributes firstName:string,lastName:string,email:string

# write migration code

# migrate
$ node_modules/.bin/sequelize db:migrate

# generate seeds
$ .\node_modules\.bin\sequelize seed:generate --name seed-categories

# seed
$ node_modules/.bin/sequelize db:seed:all
```