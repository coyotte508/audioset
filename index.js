const CliqueNetwork = require("./app/cliquenetwork");

var network = new CliqueNetwork();

for (var i = 0; i < 100; i = i+1) {
  network.learnRandomClique();
}

console.log(network.connections);

console.log(network.cliques.length);
console.log(network.generateRandomClique());
console.log(network.getPartialClique(5));

var cl = network.getRandomClique();
var pcl = network.makePartial(cl, 5);

var res = network.decode(pcl);

console.log(cl, pcl, res); 
