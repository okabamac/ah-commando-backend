import uuid from 'uuid';
import sequelize from 'sequelize';
import models from '../db/models';
import Paginate from '../helpers/paginate';
import Utilites from '../helpers/Utilities';

const { Op } = sequelize;
const { paginateArticles } = Paginate;
const { errorStat, successStat } = Utilites;

const parseBool = (string) => {
  if (string === 'true') return true;
  return false;
};
/**
 * @Module ArticleController
 * @description Controlls all activities related to Articles
 */
class ArticleController {
  /**
   * @description Creates an Article
   * @param {Object} req - request object
   * @param {Object} res - response object
   * @returns {Object} Article data
   * @memberof ArticleController
   */
  static async createArticle(req, res) {
    const {
      title,
      description,
      tagList,
      articleBody,
      image
    } = req.body.article;
    const article = await models.Article.create({
      title,
      description,
      tagList,
      articleBody,
      uuid: uuid.v1().split('-')[0],
      authorId: req.user.id,
      image
    });
    article.tagList = [...article.dataValues.tagList.split(' ')];
    return successStat(res, 201, 'articles', article);
  }

  /**
   * @description returns all Articles
   * @param {Object} req - request object
   * @param {Object} res - response object
   * @returns {Object} An array of all Articles
   * @memberof ArticleController
   */
  static async getAllArticles(req, res) {
    const { page, limit } = req.query;
    if (!page && !limit) {
      const articles = await models.Article.findAll({
        include: [{ model: models.User, as: 'author', attributes: ['firstname', 'lastname', 'username', 'image', 'email'] }]
      });
      return successStat(res, 200, 'articles', articles);
    }
    paginateArticles(req, res);
  }

  /**
   * @description get a sinlge article
   * @param {Object} req - request object
   * @param {Object} res - response object
   * @returns {Object} returns a single article
   * @memberof ArticleController
   */
  static async getOneArticle(req, res) {
    const { slug } = req.params;
    const article = await models.Article.findOne({
      where: {
        slug,
      },
      include: [{
        model: models.User,
        as: 'author',
        attributes: ['firstname', 'lastname', 'username', 'image', 'email']
      }]
    });

    if (!article) {
      return errorStat(res, 404, 'Article not found');
    }

    const likes = await article.countLikes({
      where: { likes: true }
    });

    const dislikes = await article.countLikes({
      where: { likes: false }
    });

    const comments = await models.Comment.findAll({
      where: { articleId: article.id },
      attributes: {
        include: [
          [sequelize.fn('SUM', sequelize.literal('CASE likes WHEN false THEN 1 ELSE 0 END')), 'dislikes'],
          [sequelize.fn('SUM', sequelize.literal('CASE likes WHEN true THEN 1 ELSE 0 END')), 'likes']
        ],
      },
      include: [
        {
          model: models.Likes,
          attributes: [],
        }
      ],
      group: ['Comment.id']
    });
    return successStat(res, 200, 'article', {
      article, likes, dislikes, comments, noOfComments: comments.length
    });
  }

  /**
   * @description Edit an Article and returns the edited article
   * @param {Object} req - request object
   * @param {Object} res - response object
   * @returns {Object} Edited article
   * @memberof ArticleController
   */
  static async editArticle(req, res) {
    const {
      title,
      description,
      articleBody,
      tagList,
      image
    } = req.body.article;
    const editedArticle = await models.Article.update(
      {
        title,
        description,
        articleBody,
        tagList,
        image
      },
      {
        returning: true,
        where: {
          [Op.and]: [{ slug: req.params.slug }, { authorId: req.user.id }]
        }
      }
    );

    if (editedArticle[1].length < 1) {
      return errorStat(res, 404, 'Article not found');
    }

    const article = editedArticle[1][editedArticle[1].length - 1].dataValues;
    return successStat(res, 200, 'article', article);
  }

  /**
   * @description Deletes an Article
   * @param {Object} req - request object
   * @param {Object} res - response object
   * @returns {String} returns a message indicating that the article was deleted
   * @memberof ArticleController
   */
  static async deleteArticle(req, res) {
    const deletedArticle = await models.Article.destroy({
      returning: true,
      where: {
        [Op.and]: [{ slug: req.params.slug }, { authorId: req.user.id }]
      }
    });

    if (!deletedArticle) {
      return errorStat(res, 404, 'Article not found');
    }
    return successStat(
      res,
      200,
      'message',
      'Article deleted successfully'
    );
  }

  /**
   * @description Like or Dislike an Article
   * @param {Object} req - request object
   * @param {Object} res - response object
   * @returns {String} returns a message indicating that the article was liked or disliked
  */
  static async likeOrDislikeArticle(req, res) {
    const { user } = req;
    const { liked, resourceId, type } = req.body.liked;
    const likes = parseBool(liked);
    const modelType = type.charAt(0).toUpperCase() + type.slice(1);

    const tableType = await models[modelType].findByPk(resourceId);
    if (!tableType) return errorStat(res, 404, `${tableType} not found`);

    const likedArticle = await models.Likes.findOne({
      where: { resourceId, userId: user.id }
    });

    if (likedArticle && likedArticle.likes === likes) {
      await models.Likes.destroy({ where: { resourceId, userId: user.id } });
    } else if (likedArticle && likedArticle.likes !== likes) {
      await models.Likes.update({ likes }, { where: { resourceId, userId: user.id } });
    } else {
      await user.createLike({
        likes,
        resourceId,
        type
      });
    }

    const totalLikes = await tableType.countLikes({
      where: { likes: true }
    });

    const totalDislikes = await tableType.countLikes({
      where: { likes: false }
    });

    return successStat(res, 200, `${type} Likes`, {
      likes: totalLikes,
      dislikes: totalDislikes
    });
  }
}

export default ArticleController;
