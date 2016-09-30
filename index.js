var Router = require('koa-router');
var CityController = require('./controller');
var Jwt = require("koa-jwt");
var Config = require("../../config/config");

var router = new Router({
  prefix: '/api/v1/cities'
});

var jwtCheck = Jwt({
  secret: new Buffer(Config.auth0.secret, 'base64'),
  audience: Config.auth0.id
});

router.get('/', CityController.index)
  .post('/', jwtCheck, CityController.batch)
  .get('/:id', jwtCheck, CityController.show)
  .post('/:id', jwtCheck, CityController.update)
  .get('/:id/routes', jwtCheck, CityController.routes);

module.exports = router;
