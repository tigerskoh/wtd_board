const { DB } = require("../repository");

module.exports = async function (db_type) {
	const db = new DB(db_type);

	const CREATE_POST_TBL = `
        create table post
        (
            id          int unsigned auto_increment
                primary key,
            content     varchar(255) not null,
            title       varchar(255) not null,
            password    varchar(255) not null,
            username    varchar(255) not null,
            created_at  timestamp default CURRENT_TIMESTAMP null,
            modified_at timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
        )
	`;

	await db.query(CREATE_POST_TBL);

	const CREATE_REPLY_TBL = `
        create table reply
        (
            id          int unsigned auto_increment
                primary key,
            post_id     int          not null,
            ref_id      int null,
            content     varchar(255) not null,
            username    varchar(255) not null,
            created_at  timestamp default CURRENT_TIMESTAMP null,
            modified_at timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
        )
	`;
	await db.query(CREATE_REPLY_TBL);

	const CREATE_KEYWORD_TBL = `
        create table keyword
        (
            id       int unsigned auto_increment
                primary key,
            username varchar(255) not null,
            keyword  varchar(255) not null
        )
	`;
	await db.query(CREATE_KEYWORD_TBL);

	// 키워드 미리 저장.
	await db.query(`INSERT INTO keyword (username, keyword)
                    VALUES ('skoh', 'wanted')`);
	await db.query(`INSERT INTO keyword (username, keyword)
                    VALUES ('apple', 'wanted')`);

	return db;
}