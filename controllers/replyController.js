const replyModel = require('../models/replyModel');

class ReplyInput {
	constructor (p) {
		this.post_id = p.post_id; // 필수
		this.ref_id = p.ref_id; // 옵셔널.
		this.content = p.content;
		this.username = p.username;
	}
}

class ReplyOutput {
	constructor (p) {
		this.id = p.id;
		this.post_id = p.post_id; // 필수
		this.content = p.content;
		this.username = p.username;
		this.created_at = p.created_at;
		this.replies = p.replies; // 대댓글들.
	}
}

class ReplyController {
	_makeNestedReply = (db_rows) => {
		// 임시저장용
		const map = {};
		// 최종결과
		const ret = [];

		db_rows.forEach((row, i) => {
			map[row.id] = i; // reply_id 가 db_row 의 몇번째에 있나를 저장해둔다.
			row.replies = []; // 일단 빈채로 모두 추가.
		});
		db_rows.forEach(({ id, post_id, ref_id, content, username, created_at, replies = null }) => {
			const insert = new ReplyOutput({ id, post_id, content, username, created_at, replies });
			if (!ref_id) { // ref 가 없는것을 마지막에 넣는다.
				ret.push(insert);
				return;
			}
			// ref 가 있으면 db_row 의 [] 빈 replies 에 ref 가 몇번째 row 인지 보고 넣는다.
			db_rows[map[ref_id]].replies.push(insert);
		});
		return ret;
	}

	getAllReply = async (req, res, next) => {
		try {
			const post_id = req.params.post_id;
			const replyList = await replyModel.findAll({ post_id, pageNum: req.query.pageNum });
			// 디비결과 값 검증.
			replyList.forEach(ret => {
				if (!Object.entries(ret).every(([k, v]) => {
					if (k === 'ref_id') return true;
					return v;
				})) throw new Error('EMPTY OUTPUT');
			});
			// 응답변환.
			const ret = this._makeNestedReply(replyList)
			res.send(ret);
		} catch (e) {
			next(e);
		}
	};

	createReply = async (req, res, next) => {
		try {
			const post_id = req.params.post_id;
			const reply = new ReplyInput({ ...req.body, post_id });
			if (!Object.entries(reply).every(([k, v]) => {
				if (k === 'ref_id') return true;
				return v;
			})) throw new Error('EMPTY INPUT');
			const result = await replyModel.create(reply);
			res.send(result);
		} catch (e) {
			next(e);
		}
	};
}

module.exports = new ReplyController;
