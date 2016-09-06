'use strict';

module.exports = (db) => {
	return {
		authRequired (req, res, next) {
			// Get the token from the request header
			let authToken = req.get('Auth');

			db.user.findByToken(authToken)
				.then(user => {
					// Attach the user object onto the 'req' object
					req.user = user;
					next();
				})
				.catch(err => {
					// Not Authenticated
					res.status(401).send();
				})
		}
	}
};