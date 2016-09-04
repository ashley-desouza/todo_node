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
	let queryParams = req.query;
	let filteredTodos = todos;

	// http://underscorejs.org/#where
	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {completed: true});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {completed: false});
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.length) {
		// http://underscorejs.org/#filter
		filteredTodos = _.filter(filteredTodos, (todo) => todo.description.toLowerCase().includes(queryParams.q.toLowerCase()));
	}
	res.json(filteredTodos);
});

// GET a todo item by id
app.get('/todos/:id', (req, res) => {
	let todoId = parseInt(req.params.id, 10);
	let matchedTodo;

	// http://underscorejs.org/#findWhere
	matchedTodo = _.findWhere(todos, {id: todoId});

	if (matchedTodo) {
		res.send(matchedTodo);
	} else {
		res.status(404).json({"error": `No todo item found with Id: ${todoId}`});
	}
});

// POST a new todo item
app.post('/todos', (req, res) => {
	// Ensure only specific attributes from the body are retreived
	let body = _.pick(req.body, 'description', 'completed'); //http://underscorejs.org/#pick

	// Data Validation
	/* 
		http://underscorejs.org/#isBoolean
		http://underscorejs.org/#isString
	*/
	if (_.isBoolean(body.completed) && _.isString(body.description) && body.description.trim().length) {
		body.id = todoGlobalId++;
		body.description = body.description.trim();

		todos.push(body);

		res.json(body);		
	} else {
		res.status(400).send();
	}
	

});

// DELETE a todo item
app.delete('/todos/:id', (req, res) => {
	let todoId = parseInt(req.params.id, 10),
		matchedTodo = todos.filter(todo => todo.id === todoId);

	if (matchedTodo.length) {
		todos = todos.filter(todo => todo.id !== todoId);
		 res.json(matchedTodo);		
	} else {
		res.status(404).json({"error": `No todo item found with Id: ${todoId}`});
	}
});

// PUT for a todo item
app.put('/todos/:id', (req, res) => {
	let todoId = parseInt(req.params.id, 10),
		matchedTodo = todos.filter(todo => todo.id === todoId);

	// Ensure only specific attributes from the body are retreived
	let body = _.pick(req.body, 'description', 'completed'); //http://underscorejs.org/#pick

	if (!matchedTodo.length) {
		return res.status(404).json({"error": `No todo item found with Id: ${todoId}`});
	}

	// Data Validation
	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length) {
		body.description = body.description.trim();	
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		body.completed = body.completed;	
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	// http://underscorejs.org/#extend
	_.extend(matchedTodo[0], body);
	res.json(matchedTodo[0]);
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});