import {
  userSchema,
  loginSchema,
  profileSchema,
  articleSchema,
  resetPasswordSchema,
  resetEmailSchema,
  ratingSchema
} from './schema';
import validate from '../helpers/validate';

/**
 * @class InputValidator
 * @description Validates all user inputs
 * @exports InputValidator
 */
class InputValidator {
  /**
   * @method validateUser
   * @description Validates user details on signup
   * @param {object} req - The Request Object
   * @param {object} res - The Response Object
   * @param {function} next - The next function to point to the next middleware
   * @returns {function} validate() - An execucted validate function
   */
  static validateUser(req, res, next) {
    const user = { ...req.body.user };
    return validate(user, userSchema, req, res, next);
  }

  /**
   * @method validateUser
   * @description Validates user details on signup
   * @param {object} req - The Request Object
   * @param {object} res - The Response Object
   * @param {function} next - The next function to point to the next middleware
   * @returns {function} validate() - An execucted validate function
   */
  static validateRating(req, res, next) {
    const { articleId } = req.params;
    const { rate, description } = req.body.rating;
    return validate({ articleId, rate, description }, ratingSchema, req, res, next);
  }

  /**
   * @method validateLogin
   * @description Validates user login details on login
   * @param {object} req - The Request Object
   * @param {object} res - The Response Object
   * @param {function} next - The next function to point to the next middleware
   * @returns {function} validate() - An execucted validate function
   */
  static validateLogin(req, res, next) {
    const login = { ...req.body.user };
    return validate(login, loginSchema, req, res, next);
  }

  /**
   * @method validateUser
   * @description Validates user details on profile edit
   * @param {object} req - The Request Object
   * @param {object} res - The Response Object
   * @param {function} next - The next function to point to the next middleware
   * @returns {function} validate() - An execucted validate function
   */
  static validateProfileUpdate(req, res, next) {
    const profile = { ...req.body.user };
    return validate(profile, profileSchema, req, res, next);
  }

  /**
  * @method validateArticle
  * @description Validates articles input details
  * @param {object} req - The Request Object
  * @param {object} res - The Response Object
  * @param {function} next - The next function to point to the next middleware
  * @returns {function} validate() - An execucted validate function
  */
  static validateArticle(req, res, next) {
    const article = { ...req.body.article };
    return validate(article, articleSchema, req, res, next);
  }

  /**
   * @method validatePasswordReset
   * @description Validates user input for password reset
   * @param {object} req - The Request Object
   * @param {object} res - The Response Object
   * @param {function} next - The next function to point to the next middleware
   * @returns {function} validate() - An execucted validate function
   */
  static validatePasswordReset(req, res, next) {
    const password = { ...req.body.user };
    return validate(password, resetPasswordSchema, req, res, next);
  }

  /**
   * @method validateEmail
   * @description Validates user email input for password reset
   * @param {object} req - The Request Object
   * @param {object} res - The Response Object
   * @param {function} next - The next function to point to the next middleware
   * @returns {function} validate() - An execucted validate function
   */
  static validateEmail(req, res, next) {
    const email = { ...req.body.user };
    return validate(email, resetEmailSchema, req, res, next);
  }
}

export default InputValidator;
