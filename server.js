'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// List of Todos
let todos = [{
	id: 1,
	description: 'Get Started',
	completed: true
}, {
	id: 2,
	description: 'Clear Things',
	completed: false
}, {
	id: 3,
	description: 'Restart',
	completed: false
}];

app.get('/', (req, res) => {
	// res.writeHead(200, {'Content-type': 'text/html'});
	// res.write(JSON.stringify(todos));
	// res.end('<h1>Todo App.</h1>');
	res.json(todos);
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});