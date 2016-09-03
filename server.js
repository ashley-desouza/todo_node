'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// List of Todos
let todos = [{
	description: 'Get Started',
	completed: false
}, {
	description: 'Clear Things',
	completed: true
}];

app.get('/', (req, res) => {
	res.send('<h1>Todo App.</h1>');
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});