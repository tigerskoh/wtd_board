const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

const mysql = require('mysql2');
const DB_INFO = require('./DB_migration/db_info');
const DB_migration = require('./DB_migration/bootstrap');

const apiRouter = require('./routes');

app.use('/api', apiRouter);

// 글로벌 에러핸들러.
app.use(function (err, req, res, next) {
	console.log(err);
	res.status(500).send(err.message);
});

app.listen(port, async () => {
	// mysql 과 sqlite 를 전략에 맞게 해보려시도 했으나. 문법차가 있어서 no arg 면 default mysql 로 동작하도록 함.
	if (!process.argv[2]) {
		// mysql 접속하고 DROP CREATE.
		// database init
		const conn = mysql.createConnection(DB_INFO);
		await conn.promise().query('DROP DATABASE study_db');
		await conn.promise().query('CREATE DATABASE study_db default CHARACTER SET UTF8;');
		await conn.end();
	}
	// DDL + DML
	global.db = await DB_migration(process.argv[2]);
	console.log(`Example app listening on port ${port}`);
});