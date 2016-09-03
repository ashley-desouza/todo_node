'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// List of Todos
let todos = [{
	description: 'Get Started',
	completed: true
}, {
	description: 'Clear Things',
	completed: false
}, {
	description: 'Restart',
	completed: false
];

app.get('/', (req, res) => {
	res.send('<h1>Todo App.</h1>');
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});