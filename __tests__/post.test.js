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

const TIMEOUT = 600000;


test('본문 작성후 목록 전체 리스팅', async () => {
	expect.assertions(2);
	let resp = await _createOnePost();
	expect(resp.data).toMatchObject({ affectedRows: 1 })
	resp = await axios({
		url: `${addr}/api/posts`,
		method: 'get',
		headers: commonHeaders,
	});
	expect(resp.data.length).toEqual(1)
}, TIMEOUT);

test('ERR: 본문작성시 빠진 인풋', async () => {
	expect.assertions(1);
	try {
		await axios({
			url: `${addr}/api/post`,
			method: 'post',
			headers: commonHeaders,
			data: JSON.stringify({
				title: '타이틀',
				content: '테스트입니다.',
				password: '1',
			})
		});
	} catch (e) {
		expect(e.response.data).toEqual('EMPTY INPUT')
	}
}, TIMEOUT);


test('본문수정 및 재조회', async () => {
	expect.assertions(2);
	let resp = await axios({
		url: `${addr}/api/post/1`,
		method: 'put',
		headers: commonHeaders,
		data: JSON.stringify({
			title: '타이틀변경됨!',
			content: '동해물!',
			username: 'skoh',
			password: '1',
		})
	});
	expect(resp.data).toMatchObject({ affectedRows: 1 })
	resp = await axios({
		url: `${addr}/api/posts`,
		method: 'get',
		headers: commonHeaders,
	});
	expect(resp.data[0]).toMatchObject({ "content": "동해물!" })
}, TIMEOUT);

test('ERR: update wrong password', async () => {
	expect.assertions(1);
	try {
		await axios({
			url: `${addr}/api/post/1`,
			method: 'put',
			headers: commonHeaders,
			data: JSON.stringify({
				title: '타이틀변경됨!',
				content: '테스트입니다변경됨!',
				username: 'skoh',
				password: '3',
			})
		});
	} catch (e) {
		expect(e.response.data).toEqual('WRONG AUTH')
	}
}, TIMEOUT);

test('ERR: 삭제 wrong password', async () => {
	expect.assertions(1);
	try {
		await axios({
			url: `${addr}/api/post/1`,
			method: 'delete',
			headers: commonHeaders,
			data: JSON.stringify({
				username: 'skoh',
				password: 'wrong_pw',
			})
		});
	} catch (e) {
		expect(e.response.data).toEqual('WRONG AUTH')
	}
}, TIMEOUT);

test('본문삭제후 조회', async () => {
	expect.assertions(2);
	let resp = await axios({
		url: `${addr}/api/post/1`,
		method: 'delete',
		headers: commonHeaders,
		data: JSON.stringify({
			username: 'skoh',
			password: '1',
		})
	});
	expect(resp.data).toMatchObject({ affectedRows: 1 })
	resp = await axios({
		url: `${addr}/api/posts`,
		method: 'get',
		headers: commonHeaders,
	});
	expect(resp.data.length).toEqual(0)
}, TIMEOUT);

test('7개 createPost 후 2번째 paging > 총 7개 중 페이지당 5개씩 => 2개', async () => {
	expect.assertions(1);
	for (let i = 0; i < 7; i++) {
		await _createOnePost();
	}
	let resp = await axios({
		url: `${addr}/api/posts?pageNum=2`,
		method: 'get',
		headers: commonHeaders,
	});
	// console.log(resp)
	expect(resp.data.length).toEqual(2)
}, TIMEOUT);

test('포스트 검색', async () => {
	expect.assertions(1);
	let resp = await axios({
		url: `${addr}/api/postSearch`,
		method: 'post',
		headers: commonHeaders,
		data: JSON.stringify({
			keyword: 'oh'
		})
	});
	// console.log(resp)
	expect(resp.data.length).toEqual(7)
}, TIMEOUT);
//
// test('테스트 파일의 멱등성? 원자성을 위해. 테스트 종료시 테이블 리셋', async () => {
// 	const conn = mysql.createConnection({ ...DB_INFO, database: 'study_db' });
// 	await conn.promise().query('TRUNCATE TABLE post');
// 	await conn.promise().query('TRUNCATE TABLE reply');
// 	await conn.end();
// }, TIMEOUT);


