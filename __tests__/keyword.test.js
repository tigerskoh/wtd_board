const axios = require('axios');
const mysql = require("mysql2");
const DB_INFO = require("../DB_migration/db_info");
const PORT = 3000;
const addr = `http://localhost:${PORT}`;
const commonHeaders = {
	'Content-Type': 'application/json; charset=utf-8'
};

async function _createOnePost () {
	let resp = await axios({
		url: `${addr}/api/post`,
		method: 'post',
		headers: commonHeaders,
		data: JSON.stringify({
			title: '타이틀',
			content: 'i think wanted is good',
			username: 'skoh',
			password: '1',
		})
	});
	return resp;
}

async function _createOneReply (content = 'i think wanted is good') {
	let resp = await axios({
		url: `${addr}/api/post/${post_id}/reply`,
		method: 'post',
		headers: commonHeaders,
		data: JSON.stringify({
			ref_id,
			content,
			username: 'wanted',
		})
	});
	return resp;
}


const TIMEOUT = 600000;
let post_id;

test('본문 작성때 컨텐츠에 키워드 삽입되있으면 알람 유저리스트 뽑기', async () => {
	expect.assertions(1);
	let resp = await _createOnePost();
	expect(resp.data).toMatchObject({
		affectedRows: 1,
		users: [
			{
				id: 1,
				username: 'skoh',
				keyword: 'wanted',
			},
			{
				id: 2,
				username: 'apple',
				keyword: 'wanted',
			}
		]
	})
	resp = await axios({
		url: `${addr}/api/posts`,
		method: 'get',
		headers: commonHeaders,
	});
	post_id = resp.data[0].id;
}, TIMEOUT);

let ref_id;

test('댓글 작성도 동일하게 테스트', async () => {
	expect.assertions(1);
	let resp = await _createOneReply();
	expect(resp.data).toMatchObject({
		affectedRows: 1,
		users: [
			{
				id: 1,
				username: 'skoh',
				keyword: 'wanted',
			},
			{
				id: 2,
				username: 'apple',
				keyword: 'wanted',
			}
		]
	})
}, TIMEOUT);

test('테스트 파일의 멱등성? 원자성을 위해. 테스트 종료시 테이블 리셋', async () => {
	const conn = mysql.createConnection({ ...DB_INFO, database: 'study_db' });
	await conn.promise().query('TRUNCATE TABLE post');
	await conn.promise().query('TRUNCATE TABLE reply');
	await conn.end();
}, TIMEOUT);


