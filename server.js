'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');
const db = require('./db.js');
const bcryptjs = require('bcryptjs');
const middleware = require('./middleware.js')(db);

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// GET all todo items
app.get('/todos', middleware.authRequired, (req, res) => {
	// res.writeHead(200, {'Content-type': 'text/html'});
	// res.write(JSON.stringify(todos));
	// res.end('<h1>Todo App.</h1>');
	let query = req.query,
		where = {
			userId: req.user.id
		};

	// http://docs.sequelizejs.com/en/latest/docs/models-usage/#findall-search-for-multiple-elements-in-the-database
	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length) {
		where.description = {
			$like: `%${query.q}%`
		};
	}

	db.todo.findAll({ where })
		.then(todos => res.json(todos))
		.catch(err => res.status(500).send());
});

// GET a todo item by id
app.get('/todos/:id', middleware.authRequired, (req, res) => {
	let todoId = parseInt(req.params.id, 10);

	// http://docs.sequelizejs.com/en/latest/docs/models-usage/#data-retrieval-finders
	db.todo.findOne({
			where: { 
				userId: req.user.id, 
				id: todoId 
			}
		})
		.then(todo => {
			if (todo) {
				res.json(todo);
			} else {
				res.status(404).json({"error": `No todo item found with Id: ${todoId}`});
			}			
		})
});

// POST a new todo item
app.post('/todos', middleware.authRequired, (req, res) => {
	// Ensure only specific attributes from the body are retreived
	let body = _.pick(req.body, 'description', 'completed'); //http://underscorejs.org/#pick

	// Data Validation
	/* 
		http://underscorejs.org/#isBoolean
		http://underscorejs.org/#isString
	*/
	if (_.isBoolean(body.completed) && _.isString(body.description) && body.description.trim().length) {
		body.description = body.description.trim();

		db.todo.create(body)
			.then(todo => { 
				// Add the newly created todo item to the logged in user (Set Association)
				return Promise.all([todo, req.user.addTodo(todo)]);
			})
			.then(result => {
				// Reload the todo item because it has now been associated with a user
				return result[0].reload();
			})
			.then(todo => {
				// Send the newly reloaded todo item (post assoc)
				res.json(todo);
			})
			.catch(err => res.status(500).json(err));
	} else {
		res.status(400).send();
	}
	

});

// DELETE a todo item
app.delete('/todos/:id', middleware.authRequired, (req, res) => {
	let todoId = parseInt(req.params.id, 10);

	// http://docs.sequelizejs.com/en/latest/api/model/#destroyoptions-promiseinteger
	db.todo.destroy({
		where: { 
			userId: req.user.id,
			id: todoId 
		}
	})
	.then(numRowsDeleted => {
		if (numRowsDeleted) {
			res.status(204).send()
		} else {
			res.status(404).json({"error": `No todo item found with Id: ${todoId}`});
		}
	})
	.catch(err => res.status(500).send());
});

// PUT for a todo item
app.put('/todos/:id', middleware.authRequired, (req, res) => {
	let todoId = parseInt(req.params.id, 10);

	// Ensure only specific attributes from the body are retreived
	let body = _.pick(req.body, 'description', 'completed'); //http://underscorejs.org/#pick
	let attributes = {};

	// Data Validation
	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;	
	}

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;	
	}

	db.todo.findOne({
			where: {
				userId: req.user.id,
				id: todoId
			}
		})
		.then(todo => {
			if (todo) {
				// http://docs.sequelizejs.com/en/latest/api/instance/#updateupdates-options-promisethis
				todo.update(attributes)
					.then(result => res.json(result))
					.catch(err => res.status(400).json(err));
			} else {
				res.status(404).json({"error": `No todo item found with Id: ${todoId}`});
			}
		})
		.catch(err => res.status(500).send());
});

// POST a new user
app.post('/users', (req, res) => {
	let body = _.pick(req.body, 'email', 'password');

	db.user.create(body)
		.then(user => res.json(user.toPublicJSON()))
		.catch(err => res.status(400).json(err));
});

// POST to login users
app.post('/users/login', (req, res) => {
	let body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body)
		.then(user => {
			let generatedAuthToken = user.generateToken('authentication');

			if (generatedAuthToken) {
				return Promise.all([user, db.token.create({ token: generatedAuthToken })]);
			}
		})
		.then(result => {
			res.header('Auth', result[1].token).json(result[0].toPublicJSON());
		})
		.catch(err => {
			return res.status(401).send()
		});
});

// POST to logout users
app.post('/users/logout', middleware.authRequired, (req, res) => {
	req.token.destroy()
		.then(() => res.status(204).send())
		.catch(err => res.status(500).send());
});

// IMP: Setup the db connection before starting the server
db.sequelize.sync({force: true})
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Listening on port ${PORT}`);
		});
	});