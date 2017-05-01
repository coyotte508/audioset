const assert = require('assert');
const CliqueNetwork = require("../app/cliquenetwork");

describe('CliqueNetwork', function () {
  describe('#constructor', function () {
    it('should initialize clusters & fanals to default values', function() {
      var network = new CliqueNetwork();
      assert.equal(network.clusters, 8);
      assert.equal(network.fanals, 256);
    });

    it('should have empty cliques', function() {
      var network = new CliqueNetwork();
      assert.equal(network.cliques.length, 0);
    });
  });

  describe('#storeClique', function() {
    it('should store array cliques properly', function() {
      var network = new CliqueNetwork();

      network.storeClique([0,200,20,23,156,94, 7, 5]);

      assert.deepEqual(network.cliques[0], [0,200,20,23,156,94, 7, 5]);
    });
  })

  describe('#learnRandomClique', function () {
    it('should learn one clique', function () {
      var network = new CliqueNetwork();

      assert.equal(0, network.cliques.length);
      network.learnRandomClique();
      assert.equal(1, network.cliques.length);

      assert.equal(network.clusters, network.cliques[0].length);

      for (let val of network.cliques[0]) {
        assert(val >= 0 && val <= network.fanals);
      }
    });
  });

  describe('#getRandomClique', function () {
    it('should get the one clique', function () {
      var network = new CliqueNetwork();

      network.learnRandomClique();
      assert.equal(network.getRandomClique(), network.cliques[0]);
    });

    it('should not always get the one clique', function () {
      var network = new CliqueNetwork();

      for (var i = 0; i < 100; i++) {
        network.learnRandomClique();  
      }

      for (var i = 0; i < 10; i++) {
        if (network.getRandomClique() != network.getRandomClique()) {
          return;
        }
      }
      
      assert(false);
    });
  });

  describe('#makePartial', function() {
    it('should work as intended', function () {
      let arr = [1,2,3,4,5,6,7,8];
      let partial = CliqueNetwork.makePartial(arr, 5);

      assert.equal(partial.length, arr.length);

      var eq = 0;
      var part = 0;

      partial.forEach((val, i) => {
        if (val === -1) {
          part += 1;
        } else if (arr[i] == val) {
          eq += 1;
        }
      });

      assert.equal(eq, 5);
      assert.equal(part, 3);
    });
  });

  describe('#wideCoord', function() {
    it('should work as intended', function() {
      var network = new CliqueNetwork();

      assert.equal(456, network.wideCoord(1, 200));
    });
  });

  describe('#coord', function() {
    var network = new CliqueNetwork();

    it('should work with any coordinate', function() {
      let {cluster, fanal} = network.coord(456);

      assert.equal(cluster, 1);
      assert.equal(fanal, 200);
    });

    it('should work with an edge case', function() {
      let {cluster, fanal} = network.coord(256);

      assert.equal(cluster, 1);
      assert.equal(fanal, 0);
    });

    it('should work with another edge case', function() {
      let {cluster, fanal} = network.coord(255);

      assert.equal(cluster, 0);
      assert.equal(fanal, 255);
    });
  });

  describe('#activate', function() {
    var network = new CliqueNetwork();

    it('should work with a full clique', function() {
      var cl = [1,10,100,56,75,23,250,202];

      network.activate(cl);

      assert.deepEqual(network.activated, [1, 266, 612, 824, 1099, 1303, 1786, 1994]);
    });

    it('should work with a partial clique', function() {
      var cl = [1,-1,100,56,75,-1,-1,202];

      network.activate(cl);

      assert.deepEqual(network.activated, [1, 612, 824, 1099, 1994]);
    });
  });

  describe('#addConnection', function() {
    var network = new CliqueNetwork();

    it('should create a two-way connection', function() {
      network.addConnection(0, 100, 1, 150);
      assert.equal(network.isLinked(0, 100, 1, 150), true);
      assert.equal(network.isLinked(1, 150, 0, 100), true);
    });

    it('should ignore -1 coordinates', function() {
      network.addConnection(0, 100, 1, -1);
      assert.equal(network.isLinked(0, 100, 1, -1), false);
      assert.equal(network.isLinked(1, -1, 0, 100), false);
    });
  });

  describe('#isLinked', function(cl1, fan1, cl2, fan2) {
    var network = new CliqueNetwork();

    it('should check a one-way connection', function() {
      network.addConnection(0, 100, 1, 150);
      assert.equal(network.isLinked(0, 100, 1, 150), true);
      assert.equal(network.isLinked(1, 150, 0, 100), true);
      assert.equal(network.isLinked(1, 150, 0, 101), false);
    });
  });
});