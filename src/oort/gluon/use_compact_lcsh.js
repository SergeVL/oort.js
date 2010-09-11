
var store = data.linked;
var sh95000541 = store["http://id.loc.gov/authorities/sh95000541#concept"]
print(sh95000541.prefLabel);
print(sh95000541.altLabel[0]);
print(store[sh95000541.narrower[2]].prefLabel);

