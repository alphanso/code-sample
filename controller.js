var City = require('./model');
var Stop = require('../stop/model');
var Objection = require('objection');

module.exports = {
  /* Public route */
  index: function *() {
    var sqlQuery = City.query()
                  .orderBy('total_stops', 'desc');
    var result;              
    if(this.query.q) {
      var prefix = this.query.q + '%';
      result = yield sqlQuery
                      .andWhere('name', 'ilike', prefix)
                      .limit(20)
                      .select('id', 'name', 'correct_spelling');
    } else {
      result = yield sqlQuery;
    }
    this.response.body = result;
  },
  show: function *() {
    var params = this.params;
    var sqlQuery = City.query()
                  .findById(params.id);
    this.response.body = yield sqlQuery;
  },
  update: function *() {
    this.log.info(this.request.body);
    var body = this.request.body;
    var id = this.params.id;
    var sqlQuery = City.query()
      .patchAndFetchById(id, body);
    this.response.body = yield sqlQuery;
  },
  routes: function *() {
    var sqlQuery = City.query()
                  .where('id', '=', this.params.id)
                  .select('id', 'name', 'total_stops', 'correct_spelling', 'verified')
                  .eager('[routes(filterRouteColumns).stops(orderBySno, filterStopColumns).city(filterCityColumns)]', {
                    orderBySno: function(builder) {
                      builder.orderBy('stops.sno');
                    },
                    filterStopColumns: function(builder) {
                      builder.select('stops.route_id', 'stops.sno', 'stops.city_id');
                    },
                    filterRouteColumns: function(builder) {
                      builder.select('routes.id')
                    },
                    filterCityColumns: function(builder) {
                      builder.select('cities.id', 'cities.name', 'cities.total_stops');
                    }
                  }).omit(['city_id', 'route_id']);
    this.response.body = yield sqlQuery;
  },
  batch: function *() {
    var ids = this.query.id;
    var correct_spelling_id = this.request.body.correct_spelling;

    // if correct_spelling_id in ids then remove correct_spelling_id from ids
    var idx = ids.indexOf(correct_spelling_id);
    if (idx > -1) {
      ids.splice(idx, 1);
    }
    var trnx = yield Objection.transaction.start(City.knex());
    try {
      var city = yield City
        .bindTransaction(trnx)
        .query()
        .patch({correct_spelling: correct_spelling_id, total_stops: 0})
        .whereIn('id', ids);

      var stops = yield Stop
        .bindTransaction(trnx)
        .query()
        .patch({'city_id': correct_spelling_id})
        .whereIn('city_id', ids);

      yield trnx.commit();

      this.status = 200;
      this.body = {'city': city, 'stops':stops};
    } catch (error) {
      this.throw(400, error);
    }
  }
};