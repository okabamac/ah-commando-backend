import express from 'express';
import ArticleController from '../controllers/articleController';
import middlewares from '../middlewares';

const router = express.Router();

const {
  verifyToken, validateLikes, isActive
} = middlewares;

const {
  likeOrDislikeArticle
} = ArticleController;

router.post('/:resourceId', verifyToken, isActive, validateLikes, likeOrDislikeArticle);

export default router;
