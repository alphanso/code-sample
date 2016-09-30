var objection = require('objection');
var Model = objection.Model;

function City() {
  Model.apply(this, arguments);
}

Model.extend(City);
module.exports = City;

// Table name is the only required property.
City.tableName = 'cities';

// Optional JSON schema. This is not the database schema!
// Nothing is generated based on this. This is only used
// for validation. Whenever a model instance is created
// it is checked against this schema.
// http://json-schema.org/.
City.jsonSchema = {
  type: 'object',
  required: ['name', 'total_stops', 'stop_ids'],

  properties: {
    id: {type: 'integer'},
    name: { type: 'string', unique: 'true'},
    total_stops: {type: 'integer'},
    correct_spelling: {type: 'integer'},
    verified: {type: 'integer',enum: [0,1]},
    stop_ids: {
      type: 'array',
      items: {type: 'integer'}
    }
  }
};

// This object defines the relations to other models.
City.relationMappings = {
  correct_spelling_city: {
    relation: Model.OneToOneRelation,
    // The related model. This can be either a Model
    // subclass constructor or an absolute file path
    // to a module that exports one. We use the file
    // path version in this example to prevent require
    // loops.
    modelClass: City,
    join: {
      from: 'cities.correct_spelling',
      to: 'cities.id'
    }
  },

  stops: {
    relation: Model.OneToManyRelation,
    modelClass: __dirname + '/../stop/model',
    join: {
      from: 'cities.id',
      to: 'stops.city_id'
    }
  },

  routes: {
    relation: Model.ManyToManyRelation,
    modelClass: __dirname + '/../route/model',
    join: {
      from: 'cities.id',
      through: {
        // If you have a model class for the join table
        // you need to specify it like this:
        // modelClass: PersonMovie,
        from: 'stops.city_id',
        to: 'stops.route_id'
      },
      to: 'routes.id'
    }
  }
};
