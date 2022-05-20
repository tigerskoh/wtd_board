const keywordModel = require('./keywordModel');

class PostModel {
	tableName = 'post';
	findAll = async ({ pageNum = null }) => {
		let sql = `SELECT *
                   FROM ${this.tableName}`;
		const PER_PAGE = 5;
		if (pageNum) {
			sql = sql + ` LIMIT ${PER_PAGE} OFFSET ${PER_PAGE * (pageNum - 1)}`
		}
		const [result] = await db.query(sql);
		return result;
	}
	create = async (p) => {
		const sql = `INSERT INTO ${this.tableName}
                         (title, content, username, password)
                     VALUES ('${p.title}', '${p.content}', '${p.username}', '${p.password}')`;

		const result = await db.query(sql);
		const affectedRows = result?.[0]?.affectedRows;
		// 키워드검색.
		const users = await keywordModel.findAllUser(p.content);
		// call send alarm 하면 요구사항은 완료. 하지만 테스트를 위해 응답으로 내려줌
		return { affectedRows, users };
	}

	findOne = async (id) => {
		const sql = `SELECT *
                     FROM ${this.tableName}
                     WHERE id = ${id}`;
		const [result] = await db.query(sql);
		return result[0];
	}

	update = async (p, id) => {
		const SET_SQL = Object.entries(p).map(([k, v]) => {
			return `${k} = '${v}'`;
		}).join(',')
		const sql = `UPDATE ${this.tableName}
                     SET ${SET_SQL}
                     WHERE id = ${id}`;
		const result = await db.query(sql);
		const affectedRows = result?.[0]?.affectedRows;
		return { affectedRows };
	}

	delete = async (id) => {
		const sql = `DELETE
                     FROM ${this.tableName}
                     WHERE id = ${id}`;
		const result = await db.query(sql);
		const affectedRows = result?.[0]?.affectedRows;
		return { affectedRows };
	}
	search = async (keyword) => {
		const sql = `SELECT *
                     FROM ${this.tableName}
                     WHERE title like '%${keyword}%'
                        OR username like '%${keyword}%'`;
		const [result] = await db.query(sql);
		return result;
	}

}

module.exports = new PostModel;