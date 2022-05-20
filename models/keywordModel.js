class KeywordModel {
	tableName = 'keyword';
	findAllUser = async (content) => {
		const sql = `SELECT *
                     FROM ${this.tableName}
                     WHERE '${content}' LIKE
                           CONCAT('%', keyword, '%')`;
		const [result] = await db.query(sql);
		return result;
	}
}

module.exports = new KeywordModel;