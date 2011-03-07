var sys = require('sys');
require("../../src/oort/gluon/gluon.js");
require("../../src/oort/gluon/query.js");

var queryGluon = {

  profile: {
    prefix: {
      dbpprop: "http://dbpedia.org/property/",
      dbpowl: "http://dbpedia.org/ontology/"
    },
    default: "dbpprop",
    define: {
      Country: {from: "dbpowl"},
      label: {from: "rdfs", localized: true} // "rdfs" is a default
    }
  },

  lang: "en",

  select: {
      "?country": { a: "Country",
        "?label": true,
        "?populationEstimate": "OPTIONAL#est", // groups patterns by id (o/w, false would do)
        "?populationEstimateYear": "OPTIONAL#est",
        "?populationCensus": "OPTIONAL#census",
        "?populationCensusYear": "OPTIONAL#census",
      }
  }

};

var query = Oort.Gluon.toSPARQL(queryGluon);
sys.print(query);

