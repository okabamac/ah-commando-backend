import express from 'express';
import ArticleController from '../controllers/articleController';
import middlewares from '../middlewares';

const router = express.Router();

const { validateArticle, multerUploads, verifyToken } = middlewares;

const {
  createArticle,
  getAllArticles,
  getOneArticle,
  editArticle,
  deleteArticle,
  likeOrDislikeArticle,
} = ArticleController;
router.post('/', verifyToken, validateArticle, createArticle);
router.get('/', getAllArticles);
router.get('/:slug', getOneArticle);
router.put('/:slug/edit', verifyToken, multerUploads, editArticle);
router.delete('/:slug', verifyToken, deleteArticle);
router.post('/:articleId/likes', verifyToken, likeOrDislikeArticle);

export default router;
