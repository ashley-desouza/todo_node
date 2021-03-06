'use strict';

const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development'; // NODE_ENV is assigned 'production' on heroku
let sequelize;

if (env === 'production') {
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		'dialect': 'postgres'
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
db.user = sequelize.import(__dirname + '/models/user.js');
db.token = sequelize.import(__dirname + '/models/token.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Setup associations between the 'todo' and the 'user' model
db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;