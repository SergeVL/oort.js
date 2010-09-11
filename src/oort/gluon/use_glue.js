load("glue.js");

var ctx = new Glue.Context(/*profile, 'en'*/);
ctx.locale('en'); // .., 'sv', .., any=false
ctx.add(data); // add_new=true (but first dfn, token and pfx is *always* kept)
var concept = ctx.find("http://id.loc.gov/authorities/sh95000541#concept");
// .l and .r are reserved (but configurably so?)

print(concept.l);
print(concept.altLabel.f());
concept.altLabel.all().forEach(function(o) { print(o); });

print(concept.altLabel.lang.en.f);
concept.altLabel.lang.en.all.forEach(function(o) { print(o); });

print(concept.r.broader.all);

var concepts = ctx.find({type: ctx.ns.skos('Concept')});
var concepts = ctx.find({type: ctx.ns('Concept')});

