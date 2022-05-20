const mysql = require('mysql2');
const sqlite3 = require('sqlite3').verbose();
const sqlite3_db = new sqlite3.Database(':memory:');

const DB_INFO = require('../DB_migration/db_info');

class DB {
	constructor (repo_type = 'mysql') {
		this.DB_INFO = DB_INFO;
		this.repo_type = repo_type;
		if (repo_type === 'mysql') {
			this.pool = mysql.createPool({
				...this.DB_INFO,
				database: 'study_db',
			}).promise();
		} else {
			this.pool = sqlite3_db;
		}
	}

	async _queryByStrategy (SQL) {
		if (this.repo_type === 'mysql') {
			const pool = this.pool;
			console.log('-------------------------');
			console.log(SQL);
			console.log('-------------------------');
			return await pool.query(SQL);
		} else {
			return new Promise((resolve, reject) => {
				this.pool.all(SQL, null, function (error, rows) {
					if (error)
						reject(error);
					else
						resolve({ rows: rows });
				});
			});
		}
	}

	async query (SQL) {
		const result = await this._queryByStrategy(SQL);
		return result;
	}
}

module.exports = { DB };