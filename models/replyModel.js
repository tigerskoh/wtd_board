const keywordModel = require("./keywordModel");

class ReplyModel {
	tableName = 'reply';
	findAll = async ({ post_id, pageNum = null }) => {
		let reply_sql = `SELECT *
                         FROM ${this.tableName}
                         WHERE post_id = ${post_id}
                           AND ref_id IS NULL`;
		const PER_PAGE = 5;
		if (pageNum) {
			reply_sql = reply_sql + ` LIMIT ${PER_PAGE} OFFSET ${PER_PAGE * (pageNum - 1)}`
		}

		const sql = `WITH RECURSIVE CTE AS
                                      ((${reply_sql})
                                       UNION ALL
                                       SELECT a.*
                                       FROM ${this.tableName} a
                                                INNER JOIN CTE b ON a.ref_id = b.id)
                   SELECT *
                   FROM CTE;;
		`;
		const [result] = await db.query(sql);
		return result;
	}
	create = async (reply) => {
		const sql = `INSERT INTO ${this.tableName}
                         (post_id, ref_id, content, username)
                     VALUES ('${reply.post_id}', ${reply.ref_id ? reply.ref_id : null},
                             '${reply.content}', '${reply.username}')`;
		const result = await db.query(sql);
		const affectedRows = result?.[0]?.affectedRows;
		// 키워드검색.
		const users = await keywordModel.findAllUser(reply.content);
		// call send alarm 하면 요구사항은 완료. 하지만 테스트를 위해 응답으로 내려줌
		return { affectedRows, users };
	}
}

module.exports = new ReplyModel;