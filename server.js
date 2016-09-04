'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');

const app = express();

const PORT = process.env.PORT || 3000;
let todoGlobalId = 1;

// List of Todos
let todos = [];

app.use(bodyParser.json());

// GET all todo items
app.get('/todos', (req, res) => {
	// res.writeHead(200, {'Content-type': 'text/html'});
	// res.write(JSON.stringify(todos));
	// res.end('<h1>Todo App.</h1>');
	res.json(todos);
});

// GET a todo item by id
app.get('/todos/:id', (req, res) => {
	let todoId = parseInt(req.params.id, 10);
	let matchedTodo;

	matchedTodo = _.findWhere(todos, {id: todoId});

	if (matchedTodo) {
		res.send(matchedTodo);
	} else {
		res.status(404).send();
	}
});

// POST a new todo item
app.post('/todos', (req, res) => {
	let body = req.body;
	
	body.id = todoGlobalId++;

	todos.push(body);

	res.json(body);
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});