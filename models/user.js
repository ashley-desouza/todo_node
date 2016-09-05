'use strict';

const bcryptjs = require('bcryptjs');
const _ = require('underscore');

// http://docs.sequelizejs.com/en/latest/docs/models-definition/
module.exports = (sequelize, DataTypes) => {
	const user = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true				
			}
		},
		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
            validate: {
                len: [7, 100]
            },
            set (value) {
            	let salt = bcryptjs.genSaltSync(10);
            	let passwordHash = bcryptjs.hashSync(value, salt);

            	this.setDataValue('salt', salt);
            	this.setDataValue('password_hash', passwordHash);
            	this.setDataValue('password', value);
            }	
		},
		salt: {
			type: DataTypes.STRING,
			allowNull: false
		},
		password_hash: {
			type: DataTypes.STRING
		}
	}, {
		hooks: {
			beforeValidate (user, options) {
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		},
		classMethods: {
			authenticate (body) {
				return new Promise((resolve, reject) => {
					// Data Validation
					if (typeof body.email !== 'string' || typeof body.password !== 'string') {
						reject();
					}

					user.findOne({
						where: { email: body.email }
					})
					.then(user => {
						// If there isn't any user having the provided email addr
						// 	OR
						// The password provided does not match the one in the database
						if (!user || !bcryptjs.compareSync(body.password, user.get('password_hash'))) {
							reject();
						}

						resolve(user.toPublicJSON());
					})
					.catch(err => reject());
				});
			}
		},
		instanceMethods: {
			toPublicJSON () {
				return _.pick(this, 'id', 'email', 'createdAt', 'updatedAt');
			}
		}
	})
	return user;
};