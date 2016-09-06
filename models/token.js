'use strict';

const cryptojs = require('crypto-js');
// http://docs.sequelizejs.com/en/latest/docs/models-definition/

module.exports = (sequelize, DataTypes) => {
	return sequelize.define('token', {
		token: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [1]
			},
			set (value) {
				let hash = cryptojs.MD5(value).toString();

				this.setDataValue('token_hash', hash);
				this.setDataValue('token', value);
			}
		},
		token_hash: {
			type: DataTypes.STRING
		}
	});
};