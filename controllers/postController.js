const postModel = require('../models/postModel');

class PostInput {
	constructor (p) {
		this.title = p.title;
		this.content = p.content;
		this.username = p.username;
		this.password = p.password;
	}
}

class PostOutput {
	constructor (p) {
		this.id = p.id;
		this.title = p.title;
		this.content = p.content;
		this.username = p.username;
		// this.password = p.password; // 패스워드는 내보내지 않는다.
		this.created_at = p.created_at;
		this.modified_at = p.modified_at;
	}
}


class PostController {
	getAllPost = async (req, res, next) => {
		try {
			const postList = await postModel.findAll({ pageNum: req.query.pageNum });
			postList.forEach(ret => {
				const p = new PostOutput(ret);
				if (!Object.values(p).every(r => r)) throw new Error('EMPTY OUTPUT');
			})
			res.send(postList);
		} catch (e) {
			next(e);
		}
	};
	createPost = async (req, res, next) => {
		try {
			const p = new PostInput(req.body)
			if (!Object.values(p).every(r => r)) throw new Error('EMPTY INPUT');
			let result = await postModel.create(p);
			res.send(result);
		} catch (e) {
			next(e);
		}
	};

	updatePost = async (req, res, next) => {
		try {
			const post_id = req.params.id;
			const foundPost = await postModel.findOne(post_id);
			if (foundPost.username !== req.body.username ||
				foundPost.password !== req.body.password) {
				throw new Error('WRONG AUTH');
			}
			const p = new PostInput(req.body);
			if (!Object.values(p).every(r => r)) throw new Error('EMPTY INPUT');
			const result = await postModel.update(p, post_id);
			res.send(result);
		} catch (e) {
			next(e);
		}
	};
	deletePost = async (req, res, next) => {
		try {
			const post_id = req.params.id;
			const foundPost = await postModel.findOne(post_id);
			if (foundPost.username !== req.body.username ||
				foundPost.password !== req.body.password) {
				throw new Error('WRONG AUTH');
			}
			const result = await postModel.delete(post_id);
			res.send(result);
		} catch (e) {
			next(e);
		}
	};

	searchPost = async (req, res, next) => {
		try {
			if (!req.body.keyword) throw new Error('NEED KEYWORD');
			const postList = await postModel.search(req.body.keyword);
			postList.forEach(ret => {
				const p = new PostOutput(ret);
				if (!Object.values(p).every(r => r)) throw new Error('EMPTY OUTPUT');
			})
			res.send(postList);
		} catch (e) {
			next(e);
		}
	};
}

module.exports = new PostController;
