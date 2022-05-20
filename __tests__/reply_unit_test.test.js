// 알고리즘이 좀 필요해보여서 따로 유닛테스트 작성해봄.
test('댓글 디비 결과값을 nested 응답 하게 만든다.', () => {
	expect.assertions(1);
	const db_rows = [
		{ id: 1, ref_id: null, content: 'aaa' },
		{ id: 3, ref_id: 1, content: 'ccc' },
		{ id: 5, ref_id: 3, content: 'ddd' },
		{ id: 4, ref_id: 1, content: 'eee' },
		{ id: 2, ref_id: null, content: 'bbb' },
		{ id: 6, ref_id: 2, content: 'fff' },
	];

	const ret = makeNestedReply(db_rows);

	expect(ret).toEqual([{
		id: 1,
		content: 'aaa',
		replies: [
			{
				id: 3,
				content: 'ccc',
				replies: [{
					id: 5,
					content: 'ddd',
					replies: []
				}]
			}, {
				id: 4,
				content: 'eee',
				replies: []
			}]
	}, {
		id: 2,
		content: 'bbb',
		replies: [
			{
				id: 6,
				content: 'fff',
				replies: []
			}]
	}])
});

function makeNestedReply (db_rows) {
	// 임시저장용
	const map = {};
	// 최종결과
	const ret = [];

	db_rows.forEach((row, i) => {
		map[row.id] = i; // reply_id 가 db_row 의 몇번째에 있나를 저장해둔다.
		row.replies = []; // 일단 빈채로 모두 추가.
	});
	db_rows.forEach(({ id, ref_id, content, replies = null }) => {
		const insert = { id, content, replies };
		if (!ref_id) { // ref 가 없는것을 마지막에 넣는다.
			ret.push(insert);
			return;
		}
		// ref 가 있으면 db_row 의 [] 빈 replies 에 ref 가 몇번째 row 인지 보고 넣는다.
		db_rows[map[ref_id]].replies.push(insert);
	});
	return ret;
}