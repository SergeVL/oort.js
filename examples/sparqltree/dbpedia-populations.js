var sys = require('sys');

var queryGluon = {

  profile: {
    prefix: {
      dbpprop: "http://dbpedia.org/property/",
      dbpowl: "http://dbpedia.org/ontology/"
    },
    import: ["rdf", "rdfs"], // builtins for "a", "label" etc.
    default: "dbpprop",
    define: {
      Country: {from: "dbpowl"},
      label: {localized: true}, // inherit from import and specialize
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

sys.print(JSON.stringify(queryGluon, null, 2));

