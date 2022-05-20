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
			content: '테스트입니다.',
			username: 'skoh',
			password: '1',
		})
	});
	return resp;
}

async function _createOneReply (content = '댓글1') {
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

test('본문 작성후 목록 전체 리스팅', async () => {
	// expect.assertions(2);
	let resp = await _createOnePost();
	expect(resp.data).toMatchObject({ affectedRows: 1 })
	resp = await axios({
		url: `${addr}/api/posts`,
		method: 'get',
		headers: commonHeaders,
	});
	post_id = resp.data[0].id;
	expect(resp.data.length).toEqual(1)
}, TIMEOUT);

let ref_id;

test('댓글 작성후 댓글 확인. 페이징을 위해 6개 삽입.', async () => {
	expect.assertions(2);
	let resp = await _createOneReply();
	await _createOneReply();
	await _createOneReply();
	await _createOneReply();
	await _createOneReply();
	await _createOneReply();

	expect(resp.data).toMatchObject({ affectedRows: 1 })
	resp = await axios({
		url: `${addr}/api/post/${post_id}/reply`,
		method: 'get',
		headers: commonHeaders,
	});
	// console.log(JSON.stringify(resp.data, null, 4));
	ref_id = resp.data[0].id;
	expect(resp.data.length).toEqual(6)
}, TIMEOUT);


test('대댓글 2개 작성후 총댓글 확인', async () => {
	expect.assertions(1);
	await _createOneReply('댓글1-대댓글1');
	await _createOneReply('댓글1-대댓글2');
	let resp = await axios({
		url: `${addr}/api/post/${post_id}/reply`,
		method: 'get',
		headers: commonHeaders,
	});
	// console.log(JSON.stringify(resp.data, null, 4));
	ref_id = resp.data[0].replies[0].id;
	expect(resp.data.length).toEqual(6)
}, TIMEOUT);

test('대대댓글 3개 작성후 총댓글 확인', async () => {
	expect.assertions(1);
	await _createOneReply('댓글1-대댓글1-대대댓글1');
	await _createOneReply('댓글1-대댓글1-대대댓글2');
	await _createOneReply('댓글1-대댓글1-대대댓글3');
	let resp = await axios({
		url: `${addr}/api/post/${post_id}/reply`,
		method: 'get',
		headers: commonHeaders,
	});
	// console.log(JSON.stringify(resp.data, null, 4));
	ref_id = resp.data[0].replies[0].id;
	expect(resp.data).toEqual([
		{
			"id": 1,
			"post_id": 1,
			"content": "댓글1",
			"username": "wanted",
			"created_at": expect.any(String),
			"replies": [
				{
					"id": 7,
					"post_id": 1,
					"content": "댓글1-대댓글1",
					"username": "wanted",
					"created_at": expect.any(String),
					"replies": [
						{
							"id": 9,
							"post_id": 1,
							"content": "댓글1-대댓글1-대대댓글1",
							"username": "wanted",
							"created_at": expect.any(String),
							"replies": []
						},
						{
							"id": 10,
							"post_id": 1,
							"content": "댓글1-대댓글1-대대댓글2",
							"username": "wanted",
							"created_at": expect.any(String),
							"replies": []
						},
						{
							"id": 11,
							"post_id": 1,
							"content": "댓글1-대댓글1-대대댓글3",
							"username": "wanted",
							"created_at": expect.any(String),
							"replies": []
						}
					]
				},
				{
					"id": 8,
					"post_id": 1,
					"content": "댓글1-대댓글2",
					"username": "wanted",
					"created_at": expect.any(String),
					"replies": []
				}
			]
		},
		{
			"id": 2,
			"post_id": 1,
			"content": "댓글1",
			"username": "wanted",
			"created_at": expect.any(String),
			"replies": []
		},
		{
			"id": 3,
			"post_id": 1,
			"content": "댓글1",
			"username": "wanted",
			"created_at": expect.any(String),
			"replies": []
		},
		{
			"id": 4,
			"post_id": 1,
			"content": "댓글1",
			"username": "wanted",
			"created_at": expect.any(String),
			"replies": []
		},
		{
			"id": 5,
			"post_id": 1,
			"content": "댓글1",
			"username": "wanted",
			"created_at": expect.any(String),
			"replies": []
		},
		{
			"id": 6,
			"post_id": 1,
			"content": "댓글1",
			"username": "wanted",
			"created_at": expect.any(String),
			"replies": []
		}
	])
}, TIMEOUT);

test('6개 댓글중 중 페이지당 5개씩 => 1개', async () => {
	let resp = await axios({
		url: `${addr}/api/post/${post_id}/reply?pageNum=2`,
		method: 'get',
		headers: commonHeaders,
	});
	// console.log(resp)
	expect(resp.data.length).toEqual(1)
}, TIMEOUT);

test('테스트 파일의 멱등성? 원자성을 위해. 테스트 종료시 테이블 리셋', async () => {
	const conn = mysql.createConnection({ ...DB_INFO, database: 'study_db' });
	await conn.promise().query('TRUNCATE TABLE post');
	await conn.promise().query('TRUNCATE TABLE reply');
	await conn.end();
}, TIMEOUT);


