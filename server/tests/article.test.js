import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiInteger from 'chai-integer';
import jwt from 'jsonwebtoken';
import path from 'path';
import dotenv from 'dotenv';
import app from '../index';
import articleData from './testData/article.data';


dotenv.config();
const { expect } = chai;
chai.use(chaiHttp);
chai.use(chaiInteger);

const baseUrl = '/api/v1';
const wrongToken = 'wrongtoken';


let userToken;
describe('Article test', () => {
  before((done) => {
    chai
      .request(app)
      .post(`${baseUrl}/users`)
      .send({
        user: {
          firstname: 'test',
          lastname: 'testlastname',
          username: 'testusername1',
          email: 'test1@testdomain.com',
          password: 'P@ssword123'
        }
      })
      .end((err, res) => {
        const {
          user: { token }
        } = res.body;
        userToken = token;
        done();
      });
  });

  it('it should return error if no token is provided', (done) => {
    chai
      .request(app)
      .post(`${baseUrl}/articles`)
      .send(articleData[0])
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(401);
        done();
      });
  });

  it('it should return error if wrong token is supplied', (done) => {
    chai
      .request(app)
      .post(`${baseUrl}/articles`)
      .send(articleData[0].article)
      .set('Authorization', `Bearer ${wrongToken}`)
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(401);
        done();
      });
  });

  it('should not create an article if the supplied ID is wrong', (done) => {
    const user = jwt.verify(userToken, process.env.SECRET_KEY, { expiresIn: '1h' });
    user.id = 2560;
    const newToken = jwt.sign(user, process.env.SECRET_KEY);
    chai
      .request(app)
      .post(`${baseUrl}/articles`)
      .set('Authorization', `Bearer ${newToken}`)
      .send(articleData[0])
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(404);
        done();
      });
  });

  it('should create an article', (done) => {
    chai
      .request(app)
      .post(`${baseUrl}/articles`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(articleData[0])
      .end((err, res) => {
        const { status, articles } = res.body;
        expect(status).to.equal(201);
        expect(articles).to.have.property('readTime');
        expect(articles.readTime).to.be.an.integer();
        done();
      });
  });

  it('should dislike an article', (done) => {
    chai
      .request(app)
      .post(`${baseUrl}/likes/1`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        liked: {
          liked: 'false',
          type: 'article'
        }
      })
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(200);
        done();
      });
  });

  it('should like an article', (done) => {
    chai
      .request(app)
      .post(`${baseUrl}/likes/1`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        liked: {
          liked: 'true',
          type: 'article'
        }
      })
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(200);
        done();
      });
  });

  it('should unlike an already liked article', (done) => {
    chai
      .request(app)
      .post(`${baseUrl}/likes/1`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        liked: {
          liked: 'true',
          type: 'article'
        }
      })
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(200);
        done();
      });
  });

  it('should should return an error if no article is found', (done) => {
    chai
      .request(app)
      .post(`${baseUrl}/likes/100`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        liked: {
          liked: 'true',
          type: 'article'
        }
      })
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(404);
        done();
      });
  });

  it('should get all articles', (done) => {
    chai
      .request(app)
      .get(`${baseUrl}/articles`)
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(200);
        done();
      });
  });

  it('should get all articles with pagination', (done) => {
    chai
      .request(app)
      .get(`${baseUrl}/articles/?limit=1&page=1`)
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(200);
        done();
      });
  });

  it('should get all articles with pagination if no limit is provided', (done) => {
    chai
      .request(app)
      .get(`${baseUrl}/articles/?page=1`)
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(200);
        done();
      });
  });

  it('should return a 404 if a page that does not exist is entered', (done) => {
    chai
      .request(app)
      .get(`${baseUrl}/articles/?limit=1&page=1500`)
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(404);
        done();
      });
  });

  it('should get all articles with pagination if no page is provided', (done) => {
    chai
      .request(app)
      .get(`${baseUrl}/articles/?limit=1`)
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(200);
        done();
      });
  });


  it('should get a single article', (done) => {
    chai
      .request(app)
      .get(`${baseUrl}/articles/this-is-the-first-title`)
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(200);
        done();
      });
  });

  it('get single article: should throw an error if article does not exist', (done) => {
    chai
      .request(app)
      .get(`${baseUrl}/articles/44`)
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(404);
        done();
      });
  });

  it('should edit a single article', (done) => {
    chai
      .request(app)
      .put(`${baseUrl}/articles/this-is-the-first-title/edit`)
      .send({ article: { title: 'new title' } })
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(200);
        done();
      });
  });

  it('edit single article: should throw an error if article does not exist', (done) => {
    chai
      .request(app)
      .put(`${baseUrl}/articles/wrongslug/edit`)
      .send({ article: { title: 'new title' } })
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(404);
        done();
      });
  });

  it('should delete an article', (done) => {
    chai
      .request(app)
      .delete(`${baseUrl}/articles/this-is-the-first-title`)
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(200);
        done();
      });
  });

  it('delete article: should throw an error if article does not exist', (done) => {
    chai
      .request(app)
      .delete(`${baseUrl}/articles/44`)
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(404);
        done();
      });
  });

  it('no title: should throw an error if title is not provided', (done) => {
    chai
      .request(app)
      .post(`${baseUrl}/articles`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(articleData[1])
      .end((err, res) => {
        const { status, error } = res.body;
        expect(status).to.equal(400);
        expect(error[0]).to.equal('title is required');
        done();
      });
  });

  it('no description: should throw an error if description is not provided', (done) => {
    chai
      .request(app)
      .post(`${baseUrl}/articles`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(articleData[2])
      .end((err, res) => {
        const { status, error } = res.body;
        expect(status).to.equal(400);
        expect(error[0]).to.equal('description is required');
        done();
      });
  });

  it('no articleBody: should throw an error if articleBody is not provided', (done) => {
    chai
      .request(app)
      .post(`${baseUrl}/articles`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(articleData[3])
      .end((err, res) => {
        const { status, error } = res.body;
        expect(status).to.equal(400);
        expect(error[0]).to.equal('articleBody is required');
        done();
      });
  });

  it('no tagList: should throw an error if tagList is not provided', (done) => {
    chai
      .request(app)
      .post(`${baseUrl}/articles`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(articleData[4])
      .end((err, res) => {
        const { status, error } = res.body;
        expect(status).to.equal(400);
        expect(error[0]).to.equal('tagList is required');
        done();
      });
  });

  it('no image: should throw an error if image is not provided', (done) => {
    chai
      .request(app)
      .post(`${baseUrl}/articles`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(articleData[5])
      .end((err, res) => {
        const { status, error } = res.body;
        expect(status).to.equal(400);
        expect(error[0]).to.equal('image is required');
        done();
      });
  });

  it('wrong taglist format: should throw an error if description has incorrect format', (done) => {
    chai
      .request(app)
      .post(`${baseUrl}/articles`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(articleData[6])
      .end((err, res) => {
        const { status, error } = res.body;
        expect(status).to.equal(400);
        expect(error[0]).to.equal('taglist does not follow the specified format');
        done();
      });
  });

  it('Should upload Image successfully to cloudinary', (done) => {
    chai
      .request(app)
      .post(`${baseUrl}/image`)
      .set('Authorization', `Bearer ${userToken}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('image', path.join(__dirname, './testData/img/andela.png'))
      .end((err, res) => {
        const { status } = res.body;
        expect(status).to.equal(200);
        done();
      });
  });
});

describe('Search for an article', () => {
  it('Should return 400 if categories is a number', (done) => {
    chai.request(app)
      .post(`${baseUrl}/articles/search/filter`)
      .send({
        categories: 543234
      })
      .end((err, res) => {
        expect(res.body).to.have.a.status(400);
        expect(res.body).to.include.all.keys('status', 'error');
        expect(res.body.error[0]).to.be.equal('categories must be a string');
        done();
      });
  });
  it('Should return 400 if searchQuery is less than two characters', (done) => {
    chai.request(app)
      .post(`${baseUrl}/articles/search/filter?searchQuery=a`)
      .send({
        categories: 'technoloy'
      })
      .end((err, res) => {
        expect(res.body).to.have.a.status(400);
        expect(res.body).to.include.all.keys('status', 'error');
        expect(res.body.error[0]).to.be.equal('searchQuery length must be at least 2 characters long');
        done();
      });
  });
  it('Should return 400 if authorNames is a number', (done) => {
    chai.request(app)
      .post(`${baseUrl}/articles/search/filter`)
      .send({
        authorNames: 543234
      })
      .end((err, res) => {
        expect(res).to.have.a.status(400);
        expect(res.body).to.include.all.keys('status', 'error');
        expect(res.body.error[0]).to.be.equal('authorNames must be a string');
        done();
      });
  });
  it('Should return 400 if authorNames is a number', (done) => {
    chai.request(app)
      .post(`${baseUrl}/articles/search/filter`)
      .send({
        tags: 543234
      })
      .end((err, res) => {
        expect(res).to.have.a.status(400);
        expect(res.body).to.include.all.keys('status', 'error');
        expect(res.body.error[0]).to.be.equal('tags must be a string');
        done();
      });
  });
  it('Should return 400 if limit or page is not a number', (done) => {
    chai.request(app)
      .get(`${baseUrl}/articles?limit=erwer`)
      .end((err, res) => {
        expect(res).to.have.a.status(400);
        expect(res.body).to.include.all.keys('status', 'error');
        expect(res.body.error[0]).to.be.equal('limit must be a number');
        done();
      });
  });
  it('Should get all articles with search query provided', (done) => {
    chai.request(app)
      .get(`${baseUrl}/articles?searchQuery=on`)
      .end((err, res) => {
        expect(res).to.have.a.status(200);
        expect(res.body).to.include.all.keys('status', 'articles');
        expect(res.body.articles.rows).to.be.an('array');
        expect(res.body.articles.rows[0]).to.include.all.keys('title', 'articleBody', 'description', 'author', 'Categories', 'Tags');
        done();
      });
  });
  it('Should get all articles with search query provided include limit and/or page', (done) => {
    chai.request(app)
      .get(`${baseUrl}/articles?searchQuery=on&limit=20&page=1`)
      .end((err, res) => {
        expect(res).to.have.a.status(200);
        expect(res.body).to.include.all.keys('status', 'articles');
        expect(res.body.articles.data).to.be.an('array');
        expect(res.body.articles.data[0]).to.include.all.keys('title', 'articleBody', 'description', 'author', 'Categories', 'Tags');
        done();
      });
  });
  it('Should get all articles with the query string a categories listed', (done) => {
    chai.request(app)
      .post(`${baseUrl}/articles/search/filter?searchQuery=an`)
      .send({
        categories: 'technology,health,fashion,lifestyle,education'
      })
      .end((err, res) => {
        expect(res).to.have.a.status(200);
        expect(res.body).to.include.all.keys('status', 'articles');
        expect(res.body.articles.rows).to.be.an('array');
        expect(res.body.articles.rows[0]).to.include.all.keys('title', 'articleBody', 'description', 'author', 'Categories', 'Tags');
        done();
      });
  });
  it('Should get all articles that include the query string and the tag(s) listed', (done) => {
    chai.request(app)
      .post(`${baseUrl}/articles/search/filter?searchQuery=an`)
      .send({
        tags: 'javascript,love,ai,react,tutorial,believe'
      })
      .end((err, res) => {
        expect(res).to.have.a.status(200);
        expect(res.body).to.include.all.keys('status', 'articles');
        expect(res.body.articles.rows).to.be.an('array');
        expect(res.body.articles.rows[0]).to.include.all.keys('title', 'articleBody', 'description', 'author', 'Categories', 'Tags');
        done();
      });
  });
  it('Should get all articles that include the query string ad the tag(s) listed including limit and/or page', (done) => {
    chai.request(app)
      .post(`${baseUrl}/articles/search/filter?searchQuery=an&limit=10&page=1`)
      .send({
        tags: 'javascript,love,ai,react,tutorial,believe'
      })
      .end((err, res) => {
        expect(res).to.have.a.status(200);
        expect(res.body).to.include.all.keys('status', 'articles');
        expect(res.body.articles.data).to.be.an('array');
        expect(res.body.articles.data[0]).to.include.all.keys('title', 'articleBody', 'description', 'author', 'Categories', 'Tags');
        done();
      });
  });
  it('Should get all articles with query string, the categories and the tags', (done) => {
    chai.request(app)
      .post(`${baseUrl}/articles/search/filter?searchQuery=an`)
      .send({
        categories: 'fashion,technology,health,lifestyle,education',
        tags: 'believe,race,react,tutorial,knowledge,javascript'
      })
      .end((err, res) => {
        expect(res).to.have.a.status(200);
        expect(res.body).to.include.all.keys('status', 'articles');
        expect(res.body.articles.rows).to.be.an('array');
        expect(res.body.articles.rows[0]).to.include.all.keys('title', 'articleBody', 'description', 'author', 'Categories', 'Tags');
        done();
      });
  });
  it('Should get all articles with the query string, categories, tags and authorName', (done) => {
    chai.request(app)
      .post(`${baseUrl}/articles/search/filter?searchQuery=an`)
      .send({
        categories: 'fashion,technology,health,fashion,lifestyle,education',
        tags: 'believe,race,react,tutorial,knowledge,javascript,ai',
        authorNames: 'dominic,monday,jude,kafilat,chukwudi,martins'
      })
      .end((err, res) => {
        expect(res).to.have.a.status(200);
        expect(res.body).to.include.all.keys('status', 'articles');
        expect(res.body.articles.rows).to.be.an('array');
        expect(res.body.articles.rows[0]).to.include.all.keys('title', 'articleBody', 'description', 'author', 'Categories', 'Tags');
        done();
      });
  });
});
