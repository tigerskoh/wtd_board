const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const replyController = require('../controllers/replyController');

//포스트리스트.+페이징
router.get('/posts', postController.getAllPost);
// 포스트생성.
router.post('/post', postController.createPost);
// 포스트수정
router.put('/post/:id', postController.updatePost);
// 포스트삭제
router.delete('/post/:id', postController.deletePost);
// 포스트검색
router.post('/postSearch', postController.searchPost);

//댓글생성
router.post('/post/:post_id/reply', replyController.createReply);
//댓글리스트+페이징
router.get('/post/:post_id/reply', replyController.getAllReply);

module.exports = router;