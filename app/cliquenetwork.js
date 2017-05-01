const random = require("random-js")();

class CliqueNetwork{
  constructor() {
    this.clusters = 8;
    this.fanals = 256;

    this.connections = {};
    this.cliques = [];
    this.activated = null;
  }

  storeClique(cl) {
    if (Array.isArray(cl)) {
      return this.storeCliqueArray(cl);
    }

    if (typeof cl == "object") {
      return this.storeCliqueArray(this.cliqueToArray(cl));
    }

    throw new Error("Invalid argument for storeClique: " + cl);
  }

  learnRandomClique() {
    this.storeClique(this.generateRandomClique());
  }

  generateRandomClique() {
    var clique = [];

    for (let i = 0; i < this.clusters; i = i+1) {
      clique.push(random.integer(0, this.fanals-1));
    }

    return clique;
  }

  getRandomClique() {
    return this.cliques[random.integer(0, this.cliques.length-1)];
  }

  static makePartial(cl, n) {
    var arr = random.shuffle(Array(n).fill(0).concat(Array(cl.length-n).fill(-1)));

    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === 0) {
        arr[i] = cl[i];
      }
    }

    return arr;
  }

  makePartial(cl, n) {
    return CliqueNetwork.makePartial(cl,n);
  }

  getPartialClique(n) {
    return this.makePartial(this.getRandomClique(), n);
  }

  storeCliqueArray(cl) {
    this.cliques.push(cl);

    for (let i = 0; i < cl.length; i = i+1) {
      for (let j = i+1; j < cl.length; j = j+1) {
        this.addConnection(i, cl[i], j, cl[j]);
      }
    }
  }

  addConnection(cl1, fan1, cl2, fan2) {
    if (fan1 == -1 || fan2 == -1) {
      return;
    }
    let wc1 = this.wideCoord(cl1, fan1);
    let wc2 = this.wideCoord(cl2, fan2);

    this.connections[wc1] =  this.connections[wc1] || {};
    this.connections[wc1][wc2] = true;

    this.connections[wc2] =  this.connections[wc2] || {};
    this.connections[wc2][wc1] = true;
  }

  isLinked(cl1, fan1, cl2, fan2) {
    let wc1 = this.wideCoord(cl1, fan1);
    let wc2 = this.wideCoord(cl2, fan2);

    return this.connections[wc1] && wc2 in this.connections[wc1] ? true : false;
  }

  cliqueToArray(cl) {
    var clique = [];
    for (let i = 0; i < this.clusters; i = i+1) {
      if (cl[""+i]) {
        clique.push(cl[i]);
      } else {
        clique.push(-1);
      }
    }

    return clique;
  }

  wideCoord(cluster, fanal) {
    return cluster*this.fanals + fanal;
  }

  coord(wc) {
    return {cluster: Math.floor(wc/this.fanals), fanal: wc % this.fanals};
  }

  activate(cl) {
    this.activated = [];
    cl.forEach((val, cl) => {
      if (val === -1) {
        return;
      }
      this.activated.push(this.wideCoord(cl,val));
    });
  }

  decode(cl) {
    this.activate(cl);

    for (let i = 0; i < 1; i++) {
      this.propagate();
      this.WTA();
    }

    var retCl = {};

    for (let val of this.activated) {
      let {cluster, fanal} = this.coord(val);

      retCl[cluster] = fanal;
    }

    return this.cliqueToArray(retCl);
  }

  propagate() {
    this.stimulated = {};

    for (let val of this.activated) {
      this.stimulate(val);
    }
  }

  stimulate(wc) {
    if (!this.connections[wc]) {
      return false;
    }

    for (let key in this.connections[wc]) {
      this.stimulated[key] = (this.stimulated[key] || 0) + 1;
    }
  }

  /* Winner-take-all */
  WTA() {
    var clustersMax = {};
    var clustersNode = {};

    for (let key in this.stimulated) {
      let {cluster, fanal} = this.coord(key);
      if (cluster in clustersMax && clustersMax[cluster] > this.stimulated[key]) {
        continue;
      }

      clustersMax[cluster] = this.stimulated[key];
      clustersNode[cluster] = fanal;
    }

    this.activated = [];
    for (let c in clustersNode) {
      this.activated.push(this.wideCoord(c, clustersNode[c]));
    }
  }
}

module.exports = CliqueNetwork;