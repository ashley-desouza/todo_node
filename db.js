'use strict';

const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development'; // NODE_ENV is assigned 'production' on heroku
const sequelize;

if (env === 'production') {
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		dialect: 'postgres'
	});
} else {
	sequelize = new Sequelize(undefined, undefined, undefined, {
		'dialect': 'sqlite',
		'storage': __dirname + '/data/dev-todo-api.sqlite'
	});
}

let db = {};

// http://docs.sequelizejs.com/en/latest/docs/models-definition/
db.todo = sequelize.import(__dirname + '/models/todo.js'); // This is IMP. It is a strict well-defined way of importing a sqlite db.
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;