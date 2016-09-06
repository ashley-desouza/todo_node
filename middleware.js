'use strict';
const cryptojs = require('crypto-js');

module.exports = (db) => {
	return {
		authRequired (req, res, next) {
			// Get the token from the request header
			let authToken = req.get('Auth');

			// Check if provided token exits in the database
			db.token.findOne({
				where: {
					token_hash: cryptojs.MD5(authToken).toString()
				}
			})
			.then(token => {
				// Check if a token record was returned
				if (!token) {
					throw new Error();
				}
				// Attach the token to the 'req' object
				req.token = token;

				db.user.findByToken(authToken)
					.then(user => {
						// Attach the user object onto the 'req' object
						req.user = user;
						next();
					})
			})
			.catch(err => {
				// Not Authenticated
				res.status(401).send();
			})
		}
	}
};