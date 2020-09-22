// From row name to [internal Y coordinate, screen Y coordinate]
var rowInfo = {
 "row.I.local.5": [0, 999],
 "row.I.long.2": [4, 646],
 "row.I.local.4": [6, 642],
 "row.I.local.3": [7, 638],
 "row.I.local.2": [9, 634],
 "row.I.local.1": [10, 630],
 "row.I.long.1": [12, 624],
 "row.I.local.0": [17, 604],

 "row.A.local.5": [160, 52],
 "row.A.long.3": [161, 48],
 "row.A.local.4": [163, 42],
 "row.A.local.3": [164, 38],
 "row.A.local.2": [166, 34],
 "row.A.local.1": [167, 30],
 "row.A.long.2": [169, 26],
 "row.A.local.0": [173, 999],
}

// From column name to [internal X coordinate, screen X coordinate]
var colInfo = {
 "col.A.local.0": [0, 999],
 "col.A.long.2": [3, 22],
 "col.A.local.1": [5, 26],
 "col.A.local.2": [6, 30],
 "col.A.local.3": [8, 34],
 "col.A.local.4": [9, 38],
 "col.A.long.3": [11, 44],
 "col.A.long.4": [12, 48],
 "col.A.local.5": [14, 56],

 "col.I.local.0": [167, 618],
 "col.I.long.1": [169, 626],
 "col.I.long.2": [170, 630],
 "col.I.local.1": [172, 636],
 "col.I.local.2": [173, 640],
 "col.I.local.3": [175, 644],
 "col.I.local.4": [176, 648],
 "col.I.long.3": [178, 652],
 "col.I.local.5": [181, 999],
}

function initNames() {
  // Generate formulaic row and column names (B through H)
  for (var i = 1; i < 8; i++) {
    var cstart = 27 + 20 * (i-1);
    var name = "ABCDEFGHI"[i];

    colInfo['col.' + name + '.local.1'] = [cstart, 108 + 72 * (i-1)];
    colInfo['col.' + name + '.local.2'] = [cstart + 1, 112 + 72 * (i-1)];
    colInfo['col.' + name + '.local.3'] = [cstart + 3, 116 + 72 * (i-1)];
    colInfo['col.' + name + '.local.4'] = [cstart + 4, 120 + 72 * (i-1)];
    colInfo['col.' + name + '.local.5'] = [cstart + 6, 126 + 72 * (i-1)];
    colInfo['col.' + name + '.local.6'] = [cstart + 7, 130 + 72 * (i-1)];
    colInfo['col.' + name + '.long.1'] = [cstart + 8, 134 + 72 * (i-1)];
    colInfo['col.' + name + '.long.2'] = [cstart + 9, 138 + 72 * (i-1)];

    var rstart = 25 + 19 * (7 - i);
    rowInfo['row.' + name + '.long.1'] = [rstart, 132 + 72 * (i-1)];
    rowInfo['row.' + name + '.local.5'] = [rstart + 2, 126 + 72 * (i-1)];
    rowInfo['row.' + name + '.local.4'] = [rstart + 3, 122 + 72 * (i-1)];
    rowInfo['row.' + name + '.local.3'] = [rstart + 5, 118 + 72 * (i-1)];
    rowInfo['row.' + name + '.local.1'] = [rstart + 6, 114 + 72 * (i-1)];
    rowInfo['row.' + name + '.local.0'] = [rstart + 7, 112 + 72 * (i-1)];
  }
}

  // Bit position starts for the tiles A through I. Note there is I/O before A and buffers between C-D and F-G.
  var xTileStarts = [3, 21, 39, 59, 77, 95, 115, 133, 151];

  /**
   * Take a bit index and return the tile A-I, along with starting bitstream index.
   */
  function findTileX(x) {
    for (var i = 8; i >= 0; i--) {
      if (x >= xTileStarts[i]) {
        if (x < xTileStarts[i] + 18) {
          return ["ABCDEFGHI"[i], xTileStarts[i], i];
        } else {
          return ["buf", xTileStarts[i] + 18, -1];
        }
      }
    }
    return ["io", 0, -2];
  }

  var yTileStarts = [1, 9, 17, 26, 34, 42, 51, 59, 67];

  /**
   * Take a bit index and return the tile A-I, along with starting bitstream index.
   */
  function findTileY(y) {
    for (var i = 8; i >= 0; i--) {
      if (y >= yTileStarts[i]) {
        if (y < yTileStarts[i] + 8) {
          return ["ABCDEFGHI"[i], yTileStarts[i], i];
        } else {
          return ["buf", yTileStarts[i] + 8, -1];
        }
      }
    }
    return ["io", 0, -2];
  }
  

  class Clb {
    constructor(x, y, screenPt, gPt, bitPt) {
      this.x = x;
      this.y = y;
      this.name = "ABCDEFGH"[y] + "ABCDEFGH"[x];
      this.screenPt = screenPt;
      this.gPt = gPt;
      this.bitPt = bitPt;
      this.configString = '';
    }

    draw(ctx) {
      ctx.strokeStyle = "red";
      ctx.beginPath();
      var x0 = this.screenPt[0];
      var y0 = this.screenPt[1];
      ctx.rect(x0, y0, 20, 32);
      ctx.moveTo(x0 + 16, y0 - 2);
      ctx.lineTo(x0 + 16, y0);

      ctx.moveTo(x0 - 2, y0 + 12);
      ctx.lineTo(x0, y0 + 12);
      ctx.moveTo(x0 - 2, y0 + 18);
      ctx.lineTo(x0, y0 + 18);
      ctx.moveTo(x0 - 2, y0 + 24);
      ctx.lineTo(x0, y0 + 24);

      ctx.moveTo(x0 + 10, y0 + 33);
      ctx.lineTo(x0 + 10, y0 + 35);

      ctx.moveTo(x0 + 21, y0 + 18);
      ctx.lineTo(x0 + 23, y0 + 18);
      ctx.moveTo(x0 + 21, y0 + 28);
      ctx.lineTo(x0 + 23, y0 + 28);

      ctx.stroke();
      ctx.font = "10px arial";
      ctx.fillStyle = "green";
      fillText(ctx, this.name, x0 + 1, y0 + 8);
    }

    /**
     * Decode this CLB from the bitstream.
     */
    decode(bitstream) {
      var x = this.bitPt[0];
      var y = this.bitPt[1];
      var nf = 0;
      for (var bitnum = 0; bitnum < 8; bitnum++) {
        var bit = bitstream[x + bitnum][y + 7];
        if (bit) {
          nf |= 1 << [1, 0, 2, 3, 5, 4, 6, 7][bitnum]; // Ordering of LUT is irregular
        }
      }
      this.configNf = nf;
      var fin1 = bitstream[x + 7][y + 6] ? 'A' : 'B';
      var fin2 = bitstream[x + 6][y + 6] ? 'B' : 'C';
      var fin3 = 'Q';
      if (bitstream[x + 1][y + 6]) {
        fin3 = 'C';
      } else if ( bitstream[x + 0][y + 6]) {
        fin3 = 'D';
      }

      var ng = 0;
      for (var bitnum = 0; bitnum < 8; bitnum++) {
        bit = bitstream[x + bitnum + 10][y + 7];
        if (bit) {
          ng |= 1 << [7, 6, 4, 5, 3, 2, 0, 1][bitnum]; // Ordering of LUT is irregular
        }
      }
      this.configNg = ng;
      var gin1 = bitstream[x + 11][y + 6] ? 'A' : 'B';
      var gin2 = bitstream[x + 12][y + 6] ? 'B' : 'C';
      var gin3 = 'Q';
      if ( bitstream[x + 16][y + 6]) {
        gin3 = 'C';
      } else if ( bitstream[x + 17][y + 6]) {
        gin3 = 'D';
      }

      var str;
      var fname = 'F'; // The F output used internally; renamed to M for Base FGM.
      var gname = 'G';
      if (bitstream[x + 9][y + 7] != 1) {
        if (fin1 == gin1 && fin2 == gin2 && fin3 == gin3) {
          this.configBase = 'F';
          this.configF = fin1 + ':B:' + fin2 + ':' + fin3;
          this.configG = '';
          // F,G combined
          str = 'F = ' + formula4((nf << 8) | ng, fin1, fin2, fin3, 'B');
        } else {
          // MUX
          this.configBase = 'FGM';
          this.configF = fin1 + ':' + fin2 + ':' + fin3;
          this.configG = gin1 + ':' + gin2 + ':' + gin3;
          fname = 'M';
          gname = 'M';
          str = 'F = B*(' + formula3(nf, fin1, fin2, fin3) +
            ') + ~B*(' + formula3(ng, gin1, gin2, gin3) + ')';
        }
      } else {
        // F, G separate
        this.configBase = 'FG';
        this.configF = fin1 + ':' + fin2 + ':' + fin3;
        this.configG = gin1 + ':' + gin2 + ':' + gin3;
        str = 'F = ' + formula3(nf, fin1, fin2, fin3);
        str += '<br/>G = ' + formula3(ng, gin1, gin2, gin3);
      }

      // Select one of four values based on two index bits
      function choose4(bit1, bit0, [val0, val1, val2, val3]) {
        if (bit1) {
          return bit0 ? val3 : val2;
        } else {
          return bit0 ? val1 : val0;
          }
        }
      
      // Decode X input
      this.configX = choose4(bitstream[x + 11][y + 5], bitstream[x + 10][y + 5], ['Q', fname, gname, 'UNDEF']);
      this.configY = choose4(bitstream[x + 13][y + 5], bitstream[x + 12][y + 5], ['Q', gname, fname, 'UNDEF']);
      this.configQ = bitstream[x + 9][y + 5] ? 'LATCH': 'FF';

      // Figure out flip flop type and clock source. This seems a bit messed up.
      let clkInvert = bitstream[x + 5][y + 4]; // Invert flag
      if (bitstream[x + 9][y + 5]) {
        clkInvert = !clkInvert; // LATCH flips the clock
      }
      if (bitstream[x + 6][y + 4] == 0) {
        // No clock
        this.configClk = '';
      } else {
        if (bitstream[x + 4][y + 4] == 1) {
          this.configClk = 'C';
        } else {
          // K or G inverted. This seems like a bug in XACT?
          // Assume not inverted?
          if (clkInvert) {
            clkInvert = 0;
            this.configClk = gname;
          } else {
            this.configClk = 'K';
          }
        }
      }
      if (clkInvert) { // Add NOT, maybe with colon separator.
        if (this.configClk != '') {
          this.configClk += ':NOT';
        } else {
          this.configClk += 'NOT';
        }
      }

      this.configSet = choose4(bitstream[x + 3][y + 5], bitstream[x + 2][y + 5], ['A', '', fname, 'BOTH?']);
      this.configRes = choose4(bitstream[x + 1][y + 5], bitstream[x + 0][y + 5], ['', 'G?', 'D', gname]);
      this.configString = 'X:' + this.configX + ' Y:' + this.configY + ' F:' + this.configF + ' G:' + this.configG + ' Q:' + this.configQ +
          ' SET:' + this.configSet + ' RES:' + this.configRes + ' CLK:' + this.configClk;
    }

    config() {
      return this.configString;
    }

    describe() {
      return this.configString;
    }
  }

  class Pip {
    constructor(name, bitPt) {
      this.name = name;
      var parts = name.split(':');
      if (colInfo[parts[0]] == undefined || rowInfo[parts[1]] == undefined) {
        alert('undefined name ' + name);
      }
      this.screenPt = [colInfo[parts[0]][1], rowInfo[parts[1]][1]];
      if (this.screenPt[0] == 999 || this.screenPt[1] == 999) {
        alert('Undefined coord ' + name);
      }
      this.bitPt = bitPt;
      if (bitPt[0] >= 160 || bitPt[1] >= 71) {
        alert('Out of bounds bitstream index: ' + bitPt[0] + ',' + bitPt[1]);
      }
      this.state = 0;

    }

    draw(ctx) {
      if (this.bitPt[0] < 0 || this.state < 0) {
        ctx.fillStyle = "black";
        ctx.strokeStyle = "black";
      } else if (this.state == 0) {
        ctx.strokeStyle = "gray";
        ctx.fillStyle = "white";
      } else if (this.state == 1) {
        ctx.strokeStyle = "red";
        ctx.fillStyle = "red";
      } else {
        // Shouldn't happen
        ctx.strokeStyle = "blue";
        ctx.fillStyle = "blue";
      }
      ctx.translate(-0.5,- .5); // Prevent antialiasing
      ctx.fillRect(this.screenPt[0] - 1, this.screenPt[1] - 1, 2, 2);
      ctx.translate(0.5, .5); // Prevent antialiasing
      ctx.beginPath();
      ctx.rect(this.screenPt[0] - 1, this.screenPt[1] - 1, 2, 2);
      ctx.stroke();
    }

    decode(bitstream) {
      if (this.bitPt[0] < 0) {
        this.state = -1;
      } else {
        this.state = bitstream[this.bitPt[0]][this.bitPt[1]];
      }
    }
  }

  // There are 9 types of tiles depending on if they are along an edge. (Think of a tic-tac-toe grid.) Most will be the center type.
  // Maybe we could make 9 subclasses for everything, but for now I'll hardcode types in the code.
  const TILE = Object.freeze({ul: 1, top: 2, ur: 3, left: 4, center: 5, right: 6, ll: 7, bottom: 8, lr: 9});

  function tileType(x, y) {
    if (y == 0) {
      if (x == 0) {
        return TILE.ul;
      } else if (x < 8) {
        return TILE.top;
      } else if (x == 8) {
        return TILE.ur;
      }
    } else if (y < 8) {
      if (x == 0) {
        return TILE.left;
      } else if (x < 8) {
        return TILE.center;
      } else if (x == 8) {
        return TILE.right;
      }
    } else if (y == 8) {
      if (x == 0) {
        return TILE.ll;
      } else if (x < 8) {
        return TILE.bottom;
      } else if (x == 8) {
        return TILE.lr;
      }
    }
    throw "unexpected";
  }

  class Tile {
    constructor(x, y) {
      this.x = x; // Index 0-8
      this.y = y;
      this.name = "ABCDEFGHI"[y] + "ABCDEFGHI"[x];
      this.screenPt = [x * 72 + 78, y * 72 + 68];
      this.gPt = [x * 19, y * 20];
      this.bitPt = [xTileStarts[x], yTileStarts[y]];
      this.pips = [];
      this.pins = [];
      if (x < 8 && y < 8) {
        this.clb = new Clb(x, y, [x * 72 + 78, y * 72 + 68], [x * 19, y * 20], this.bitPt);
      } else {
        this.clb = null;
      }
      this.type = tileType(x, y);

      var row = "ABCDEFGHI"[y];
      var col = "ABCDEFGHI"[x];
      // Substitute for ROW and COL in the pip name
      function rename(pip) {
        return pip.replace('ROW', row).replace('COL', col);
      }

      // For a repeated tile, the pip location is relative to the origin for tile BB. The x and y will need to shift based on the row/column.
      // (The pip location could be given relative to the start of tile BB, but it's not.)
      // This shift is not constant because of the buffers.
      // For non-repeated tiles, the pip does not need to be adjusted.
      // 
      var xoffset = xTileStarts[x] - xTileStarts[1]; // xoffset == 0 for tile B
      var yoffset = yTileStarts[y] - yTileStarts[1]; // xoffset == 0 for tile B

      this.switch1 = null;
      this.switch2 = null;
      if (this.type == TILE.ul) {

        // Name of pip and corresponding bitmap entry
        var pips = [
          ["col.A.long.2:row.A.long.2", [6, 3]], ["col.A.local.1:row.A.long.2", [7, 3]], ["col.A.long.3:row.A.long.2", [12, 1]],
          ["col.A.long.2:row.A.local.1", [9, 3]], ["col.A.local.1:row.A.local.1", [8, 3]],
          ["col.A.local.2:row.A.local.2", [12, 3]],
          ["col.A.local.3:row.A.local.3", [14, 3]], ["col.A.long.4:row.A.local.3", [17, 0]],
          ["col.A.local.4:row.A.local.4", [20, 3]],
          ["col.A.local.4:row.A.long.3", [20, 1]], ["col.A.long.3:row.A.long.3", [13, 3]], ["col.A.long.4:row.A.long.3", [16, 3]]];
        pips.forEach(pip => this.pips.push(new Pip(rename(pip[0]), pip[1])));
      } else if (this.type == TILE.top) {
        var pips = [
          ["col.COL.long.1:row.A.long.2", [30, 1]],
          ["col.COL.long.2:row.A.local.1", [33, 3]],
          ["col.COL.local.5:row.A.local.2", [28, 3]], ["col.COL.long.1:row.A.local.2", [31, 2]],
          ["col.COL.local.5:row.A.local.3", [29, 2]], ["col.COL.long.2:row.A.local.3", [35, 0]],
          ["col.COL.long.1:row.A.local.4", [33, 2]],
          ["col.COL.local.1:row.A.long.3", [23, 2]], ["col.COL.local.4:row.A.long.3", [38, 1]], ["col.COL.long.1:row.A.long.3", [32, 2]], ["col.COL.long.2:row.A.long.3", [32, 3]]];

        this.switch1 = new Switch(this, 1);
        this.switch2 = new Switch(this, 2);

        pips.forEach(pip => this.pips.push(new Pip(rename(pip[0]), [pip[1][0] + xoffset, pip[1][1]])));

      } else if (this.type == TILE.ur) {
        var pips = [
          ["col.I.local.4:row.A.long.2", [152, 4]], ["col.I.long.3:row.A.long.2", [153, 4]],
          ["col.I.local.0:row.A.local.1", [-1, -1]], ["col.I.local.4:row.A.local.1", [151, 2]], ["col.I.long.3:row.A.local.1", [152, 2]],
          ["col.I.local.0:row.A.local.2", [-1, -1]], ["col.I.local.3:row.A.local.2", [155, 4]],
          ["col.I.local.0:row.A.local.3", [-1, -1]], ["col.I.local.2:row.A.local.3", [157, 4]],
          ["col.I.local.1:row.A.local.4", [156, 4]], ["col.I.local.0:row.A.local.4", [-1, -1]],
          ["col.I.local.0:row.A.long.3", [-1, -1]], ["col.I.long.1:row.A.long.3", [154, 2]], ["col.I.long.2:row.A.long.3", [153, 2]],
          ["col.I.long.2:row.A.local.5", [-1, -1]], ["col.I.local.1:row.A.local.5", [-1, -1]], ["col.I.local.2:row.A.local.5", [-1, -1]],  ["col.I.local.3:row.A.local.5", [-1, -1]],  ["col.I.local.4:row.A.local.5", [-1, -1]]];
        pips.forEach(pip => this.pips.push(new Pip(rename(pip[0]), pip[1])));

        // pins.push(new Iob(11, 58, 'left'));
        // pins.push(new Iob(9, 1, 'top'));
        // pins.push(new Iob(8, 2, 'top'));
      } else if (this.type == TILE.left) {
        var pips = [
          ["col.A.long.3:row.ROW.local.1", [9, 11]],
          ["col.A.long.4:row.ROW.local.3", [11, 11]],
          ["col.A.long.2:row.ROW.long.1", [5, 11]], ["col.A.local.1:row.ROW.long.1", [4, 11]], ["col.A.local.4:row.ROW.long.1", [17, 11]], ["col.A.long.3:row.ROW.long.1", [10, 11]], ["col.A.long.4:row.ROW.long.1", [15, 11]]];
        this.switch1 = new Switch(this, 1);
        this.switch2 = new Switch(this, 2);
        pips.forEach(pip => this.pips.push(new Pip(rename(pip[0]), [pip[1][0], pip[1][1] + yoffset])));
      } else if (this.type == TILE.center) {
        var pips = [
          ["col.COL.local.5:row.ROW.local.0", [23, 11]],
          ["col.COL.long.2:row.ROW.local.1", [32, 11]],
          ["col.COL.local.5:row.ROW.local.3", [24, 11]], ["col.COL.local.6:row.ROW.local.3", [27, 11]], ["col.COL.long.1:row.ROW.local.3", [28, 11]],
          ["col.COL.local.5:row.ROW.local.4", [25, 11]], ["col.COL.local.6:row.ROW.local.4", [26, 11]], ["col.COL.long.2:row.ROW.local.4", [33, 11]],
          ["col.COL.long.1:row.ROW.local.5", [31, 11]],
          ["col.COL.local.1:row.ROW.long.1", [22, 11]], ["col.COL.local.4:row.ROW.long.1", [35, 11]]];
        // Main part
        this.switch1 = new Switch(this, 1);
        this.switch2 = new Switch(this, 2);
        pips.forEach(pip => this.pips.push(new Pip(rename(pip[0]), [pip[1][0] + xoffset, pip[1][1] + yoffset])));
      } else if (this.type == TILE.right) {
        var pips = [
          ["col.I.long.2:row.ROW.local.1", [159, 11]],
          ["col.I.long.1:row.ROW.local.3", [153, 11]],
          ["col.I.long.2:row.ROW.local.4", [153, 12]],
          ["col.I.long.1:row.ROW.local.5", [154, 12]],
          ["col.I.long.1:row.ROW.long.1", [154, 11]], ["col.I.long.2:row.ROW.long.1", [158, 11]], ["col.I.local.1:row.ROW.long.1", [155, 11]], ["col.I.local.4:row.ROW.long.1", [151, 11]], ["col.I.long.3:row.ROW.long.1", [152, 11]]];
        this.switch1 = new Switch(this, 1);
        this.switch2 = new Switch(this, 2);
        pips.forEach(pip => this.pips.push(new Pip(rename(pip[0]), [pip[1][0], pip[1][1] + yoffset])));
      } else if (this.type == TILE.ll) {
        // bottom left
        var pips = [
          ["col.A.local.1:row.I.local.0", [-1, -1]], ["col.A.local.2:row.I.local.0", [-1, -1]], ["col.A.local.3:row.I.local.0", [-1, -1]], ["col.A.local.4:row.I.local.0", [-1, -1]], ["col.A.long.3:row.I.local.0", [-1, -1]],
          ["col.A.local.4:row.I.long.1", [20, 69]], ["col.A.long.3:row.I.long.1", [13, 67]], ["col.A.long.4:row.I.long.1", [16, 67]], ["col.A.local.5:row.I.long.1", [-1, -1]],
          ["col.A.local.4:row.I.local.1", [20, 67]], ["col.A.local.5:row.I.local.1", [-1, -1]],
          ["col.A.local.3:row.I.local.2", [14, 67]], ["col.A.long.4:row.I.local.2", [17, 70]], ["col.A.local.5:row.I.local.2", [-1, -1]],
          ["col.A.local.2:row.I.local.3", [12, 67]], ["col.A.local.5:row.I.local.3", [-1, -1]],
          ["col.A.long.2:row.I.local.4", [9, 67]], ["col.A.local.1:row.I.local.4", [8, 67]], ["col.A.local.5:row.I.local.4", [-1, -1]],
          ["col.A.long.2:row.I.long.2", [6, 67]], ["col.A.local.1:row.I.long.2", [7, 67]], ["col.A.long.3:row.I.long.2", [12, 69]]];
        pips.forEach(pip => this.pips.push(new Pip(rename(pip[0]), pip[1])));
      } else if (this.type == TILE.bottom) {
        var pips = [
          ["col.COL.local.1:row.I.long.1", [23, 68]], ["col.COL.local.4:row.I.long.1", [38, 69]], ["col.COL.long.1:row.I.long.1", [32, 68]], ["col.COL.long.2:row.I.long.1", [32, 67]],
          ["col.COL.long.1:row.I.local.1", [33, 68]],
          ["col.COL.local.5:row.I.local.2", [29, 68]], ["col.COL.long.2:row.I.local.2", [35, 70]],
          ["col.COL.local.5:row.I.local.3", [28, 67]], ["col.COL.long.1:row.I.local.3", [31, 68]],
          ["col.COL.long.2:row.I.local.4", [33, 67]],
          ["col.COL.long.1:row.I.long.2", [30, 69]]];
        this.switch1 = new Switch(this, 1);
        this.switch2 = new Switch(this, 2);
        pips.forEach(pip => this.pips.push(new Pip(rename(pip[0]), [pip[1][0] + xoffset, pip[1][1]])));
      } else if (this.type == TILE.lr) {
        // bottom right
        var pips = [
          ["col.I.long.1:row.I.long.1", [155, 67]], ["col.I.long.2:row.I.long.1", [158, 67]],
          ["col.I.local.1:row.I.local.1", [156, 67]],
          ["col.I.local.2:row.I.local.2", [157, 67]],
          ["col.I.local.3:row.I.local.3", [154, 67]],
          ["col.I.local.4:row.I.local.4", [151, 68]], ["col.I.long.3:row.I.local.4", [152, 67]],
          ["col.I.local.4:row.I.long.2", [151, 67]], ["col.I.long.3:row.I.long.2", [153, 67]]];
        pips.forEach(pip => this.pips.push(new Pip(rename(pip[0]), pip[1])));
      }
    }

    draw(ctx) {
      if (this.switch1 != null) {
        this.switch1.draw(ctx);
        this.switch2.draw(ctx);
      }
      if (this.clb) {
        this.clb.draw(ctx);
      }
      this.pips.forEach(pip => pip.draw(ctx));
      this.pins.forEach(pin => pin.draw(ctx));
    }

    /**
     * Decode this tile from the bitstream.
     * Returns string.
     */
    decode(bitstream) {
      var result = ['tile info'];
      if (this.clb) {
        result.push(this.clb.decode(bitstream));
      }
      if (this.switch1 != null) {
        result.push(this.switch1.decode(bitstream));
        result.push(this.switch2.decode(bitstream));
      }
      this.pips.forEach(pip => result.push(pip.decode(bitstream)));
      this.pins.forEach(pin => result.push(pin.decode(bitstream)));
      return result;
    }
  }

  /**
   * A switch matrix.
   * Coordinates: screenPt is the upper left corner of the box. gPt is the coordinate of pin 8.
   */
  class Switch {
    constructor(tile, num) {
      this.tile = tile; // Back pointer to enclosing tile.
      this.num = num; // 1 or 2
      this.name = tile.name + '.8.' + num;
      this.state = null;
      this.wires = [];

      // The switch pair's upper left wires are local.1
      var row = rowInfo['row.' + this.tile.name[0] + '.local.1'];
      var col = colInfo['col.' + this.tile.name[1] + '.local.1'];
      if (this.tile.type == TILE.bottom) {
        // The bottom switches are mirror-imaged, inconveniently.
        if (num == 1) {
          this.gPt = [col[0] + 3, row[0] + 1];
          this.screenPt = [col[1] - 2, row[1] + 6];
        } else {
          this.gPt = [col[0], row[0] - 2];
          this.screenPt = [col[1] - 2 + 8, row[1] + 6 - 8];
        }
      } else {
        if (num == 1) {
          this.gPt =[col[0], row[0] + 1]
          this.screenPt = [col[1] - 2, row[1] - 2];
        } else {
          this.gPt = [col[0] + 3, row[0] - 2];
          this.screenPt = [col[1] - 2 + 8, row[1] - 2 + 8];
        }
      }
    }

    /**
     * Returns (x, y) screen coordinate for the pin.
     */
    pinCoord(pin) {
        return [this.screenPt[0] + [2, 6, 9, 9, 6, 2, 0, 0][pin],
                this.screenPt[1] + [0, 0, 2, 6, 9, 9, 6, 2][pin]];
    }

    /**
     * Draws the internal wire between pin1 and pin2.
     */
    drawWires(ctx) {
      ctx.beginPath();
      const self = this;
      ctx.strokeStyle = 'blue';
      this.wires.forEach(function([pin1, pin2]) {
        var coord1 = self.pinCoord(pin1);
        var coord2 = self.pinCoord(pin2);
        ctx.moveTo(coord1[0], coord1[1]);
        ctx.lineTo(coord2[0], coord2[1]);
      });
      ctx.stroke();
      
    }

    draw(ctx) {
      ctx.strokeStyle = "red";
      ctx.beginPath();
      var x0 = this.screenPt[0];
      var y0 = this.screenPt[1];
      ctx.rect(x0, y0, 8, 8);
      // Draw the pins
      for (var i = 0; i < 8; i++) {
        if (this.skip(i)) continue;
        var coord = this.pinCoord(i);
        ctx.moveTo(coord[0], coord[1]);
        ctx.lineTo(coord[0] + [0, 0, 2, 2, 0, 0, -2, -2][i], coord[1] + [-2, -2, 0, 0, 2, 2, 0, 0][i]);
      }
      ctx.stroke();
      this.drawWires(ctx);
    }

    // Helper to remove pins from switches along edges.
    skip(pin) {
      return ((this.tile.type == TILE.top && (pin == 0 || pin == 1)) || (this.tile.type == TILE.bottom && (pin == 4 || pin == 5)) ||
          (this.tile.type == TILE.left && (pin == 6 || pin == 7)) || (this.tile.type == TILE.right && (pin == 2 || pin == 3)));
    }

    decode(bitstream) {

      // bits is a list of [[bitstream x, bitstream y], [pin 1, pin 2]], where the bitstream coordinates are relative to the tile edge.
      if (this.tile.type == TILE.top && this.num == 1) {
        var bits = [[[0, 1], [3, 7]], [[1, 1], [5, 6]], [[3, 1], [2, 7]], [[4, 1], [2, 6]], [[5, 1], [2, 4]], [[0, 2], [5, 7]], [[1, 2], [3, 6]], [[2, 2], [3, 5]], [[4, 2], [4, 6]], [[5, 2], [3, 4]]];
      } else if (this.tile.type == TILE.top && this.num == 2) {
        var bits = [[[13, 2], [3, 7]], [[14, 2], [3, 6]], [[15, 2], [3, 5]], [[16, 2], [4, 6]], [[17, 2], [2, 4]], [[13, 1], [5, 7]], [[14, 1], [5, 6]], [[15, 1], [2, 7]], [[16, 1], [2, 6]], [[17, 1], [3, 4]]];
      } else if (this.tile.type == TILE.left && this.num == 1) {
        var bits = [[[1, 0], [0, 5]], [[2, 0], [3, 5]], [[3, 0], [1, 5]], [[4, 0], [0, 4]], [[5, 0], [1, 4]], [[6, 0], [1, 2]], [[7, 0], [2, 4]], [[8, 0], [3, 4]], [[9, 0], [1, 3]], [[3, 2], [0, 2]]];
      } else if (this.tile.type == TILE.left && this.num == 2) {
        var bits = [[[9, 2], [1, 3]], [[16, 2], [0, 4]], [[14, 0], [1, 5]], [[15, 0], [2, 4]], [[16, 0], [0, 5]], [[17, 0], [3, 5]], [[14, 1], [1, 2]], [[15, 1], [1, 4]], [[16, 1], [0, 2]], [[17, 1], [3, 4]]];
      } else if (this.tile.type == TILE.center && this.num == 1) {
        var bits = [[[0, 0], [0, 6]], [[1, 0], [0, 7]], [[2, 0], [2, 6]], [[3, 0], [2, 7]], [[4, 0], [0, 4]], [[5, 0], [1, 5]], [[6, 0], [1, 2]], [[7, 0], [3, 4]], [[8, 0], [3, 5]], [[0, 1], [5, 6]], [[1, 1], [3, 7]], [[2, 1], [3, 6]], [[3, 1], [1, 7]], [[4, 1], [4, 6]], [[5, 1], [1, 4]], [[6, 1], [1, 3]], [[7, 1], [2, 4]], [[8, 1], [0, 5]], [[0, 2], [5, 7]], [[8, 2], [0, 2]]];
      } else if (this.tile.type == TILE.center && this.num == 2) {
        var bits = [[[9, 0], [4, 6]], [[10, 0], [5, 6]], [[11, 0], [0, 7]], [[12, 0], [0, 4]], [[13, 0], [1, 5]], [[14, 0], [2, 7]], [[15, 0], [3, 7]], [[16, 0], [1, 2]], [[17, 0], [1, 3]], [[9, 1], [1, 4]], [[10, 1], [5, 7]], [[11, 1], [0, 6]], [[12, 1], [0, 5]], [[13, 1], [3, 5]], [[14, 1], [0, 2]], [[15, 1], [3, 6]], [[16, 1], [2, 6]], [[17, 1], [3, 4]], [[9, 2], [1, 7]], [[16, 2], [2, 4]]];
      } else if (this.tile.type == TILE.right && this.num == 1) {
        var bits = [[[5, 0], [1, 5]], [[6, 0], [0, 4]], [[7, 0], [1, 7]], [[8, 0], [4, 6]], [[5, 1], [0, 5]], [[6, 1], [1, 4]], [[7, 1], [0, 7]], [[8, 1], [0, 6]], [[5, 2], [5, 6]], [[6, 2], [5, 7]]];
      } else if (this.tile.type == TILE.right && this.num == 2) {
        var bits = [[[0, 0], [1, 7]], [[1, 0], [0, 4]], [[2, 0], [0, 7]], [[3, 0], [0, 5]], [[4, 0], [0, 6]], [[0, 1], [1, 4]], [[1, 1], [4, 6]], [[2, 1], [5, 7]], [[3, 1], [1, 5]], [[4, 1], [5, 6]]];
      } else if (this.tile.type == TILE.bottom && this.num == 1) {
        var bits = [[[0, 0], [0, 6]], [[1, 0], [2, 7]], [[2, 0], [0, 2]], [[4, 0], [1, 7]], [[5, 0], [1, 2]], [[0, 1], [2, 6]], [[1, 1], [0, 7]], [[3, 1], [3, 6]], [[4, 1], [3, 7]], [[5, 1], [1, 3]]];
      } else if (this.tile.type == TILE.bottom && this.num == 2) {
        var bits = [[[13, 0], [2, 6]], [[14, 0], [2, 7]], [[15, 0], [0, 2]], [[16, 0], [1, 7]], [[17, 0], [1, 3]], [[13, 1], [0, 6]], [[14, 1], [0, 7]], [[15, 1], [3, 6]], [[16, 1], [3, 7]], [[17, 1], [1, 2]]];
      } else {
        throw "Bad switch";
      }

      this.wires = [];
      let self = this;
      bits.forEach(function([[btX, btY], wire]) {
        if (bitstream[self.tile.bitPt[0] + btX][self.tile.bitPt[1] + btY] == 1) {
          self.wires.push(wire);
        }
      });
    }
  }

  /**
   * The RBT file is organized:
   * HH ... AH
   * .       .
   * HA ... AA
   * stored as rbtstream[line][char] of '0' and '1'.
   *
   * The die is organized:
   * AA ... AH
   * .       .
   * HA ... HH
   * This function flips the rbtstream to match the die, stored as bitstream[x][y].
   * bitstream also holds ints (not chars) and is inverted with respect to the bitstream, so 1 is active.
   * I'm using the term "bitstream" to describe the bitstream with the die's layout and "rbtstream" to describe the bitstream
   * with the .RBT file's layout.
   */
  function makeDiestream(rbtstream) {
    var bitstream = new Array(160);
    for (var x = 0; x < 160; x++) {
      bitstream[x] = new Array(71);
      for (var y = 0; y < 71; y++) {
        bitstream[x][y] = rbtstream[159 - x][70 - y] == '1' ? 0 : 1;
        
      }
    }
    return bitstream;
  }

  var bitstream = null;
  /**
   * Handles the upload of a .RBT file, storing it into the variable bitstream, which has 160 lines of 71 '0'/'1' characters,
   * the contents of the .RBT file.
   */
  function rbtParse(contents) {
    rbtstream = null;
    bitstream = null;
    var lines = contents.split(/[\r\n]+/);
    var contents = [];
    var mode = 'header';
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i]
      if (mode == 'header') {
        if (line.startsWith('0') && line.endsWith('111')) {
          mode = 'data';
        }
      }
      if (mode == 'data') {
        if (line.startsWith('1111')) {
          mode = 'done';
        } else if (line.startsWith('0') && line.endsWith('111')) {
          mode = 'data';
          var data = line.slice(1, -3);
          if (data.length != 71) {
            alert('Bad line length ' + data.length + ' in .RBT file');
            return;
          }
          contents.push(data);
        } else {
          alert('Bad data line in .RBT file');
          return;
        }
      }
    }
    if (contents.length != 160) {
      alert('Wrong number of data lines' + contents.length + ' in .RBT file');
      return;
    }
    return makeDiestream(contents);
  }

  /**
   * An I/O block.
   * Each I/O block is associated with its neighboring tile.
   * Some complications: I/O blocks are different on the top, bottom, left, and right.
   * There are typically two I/O blocks per tile, so the bits are different for these two. They are also drawn differently.
   * Tile AA has 3 I/O blocks. Tile EA has 1 I/O block; one is omitted.
   * 
   */
  class Iob {
    constructor(name, x0, y0, style) {
      this.name = name;
      this.x0 = x0;
      this.y0 = y0;
      this.style = style;
    }

    draw(ctx) {
      ctx.strokeStyle = "red";

      ctx.font = "10px arial";
      ctx.fillStyle = "green";
      ctx.beginPath();

      if (this.style == "a") { // top
        ctx.rect(this.x0, this.y0, 20, 12);
        ctx.moveTo(this.x0 + 8, this.y0);
        ctx.lineTo(this.x0 + 8, this.y0 - 2);

        ctx.moveTo(this.x0 + 8, this.y0+ 12);
        ctx.lineTo(this.x0 + 8, this.y0 + 15);
        ctx.moveTo(this.x0 + 12, this.y0+ 12);
        ctx.lineTo(this.x0 + 12, this.y0 + 15);
        ctx.moveTo(this.x0 + 16, this.y0+ 12);
        ctx.lineTo(this.x0 + 16, this.y0 + 15);
        ctx.stroke();
        fillText(ctx, this.name, this.x0 + 1, this.y0 + 8);
      } else if (this.style == "b") { // alternate top
        ctx.rect(this.x0, this.y0, 20, 12);
        ctx.moveTo(this.x0 + 4, this.y0);
        ctx.lineTo(this.x0 + 4, this.y0 - 2);

        ctx.moveTo(this.x0 + 4, this.y0+ 12);
        ctx.lineTo(this.x0 + 4, this.y0 + 15);
        ctx.moveTo(this.x0 + 8, this.y0+ 12);
        ctx.lineTo(this.x0 + 8, this.y0 + 15);
        ctx.moveTo(this.x0 + 12, this.y0+ 12);
        ctx.lineTo(this.x0 + 12, this.y0 + 15);
        ctx.stroke();
        fillText(ctx, this.name, this.x0 + 1, this.y0 + 8);
      } else if (this.style == "c") { // left
        ctx.rect(this.x0, this.y0, 12, 26);
        ctx.moveTo(this.x0 - 2, this.y0 + 12);
        ctx.lineTo(this.x0, this.y0 + 12);

        ctx.moveTo(this.x0+ 12, this.y0 + 12);
        ctx.lineTo(this.x0 + 15, this.y0 + 12);
        ctx.moveTo(this.x0+ 12, this.y0 + 16);
        ctx.lineTo(this.x0 + 15, this.y0 + 16);
        ctx.moveTo(this.x0+ 12, this.y0 + 20);
        ctx.lineTo(this.x0 + 15, this.y0 + 20);
        ctx.stroke();
        vtext(ctx, this.name, this.x0 + 1, this.y0 + 8);
      } else if (this.style == "d") { // right
        ctx.rect(this.x0, this.y0, 12, 26);
        ctx.moveTo(this.x0+ 12, this.y0 + 12);
        ctx.lineTo(this.x0 + 16,  this.y0 + 12);

        ctx.moveTo(this.x0 - 2, this.y0 + 12);
        ctx.lineTo(this.x0, this.y0 + 12);
        ctx.moveTo(this.x0 - 2, this.y0 + 16);
        ctx.lineTo(this.x0, this.y0 + 16);
        ctx.moveTo(this.x0 - 2, this.y0 + 20);
        ctx.lineTo(this.x0, this.y0 + 20);
        ctx.stroke();
        vtext(ctx, this.name, this.x0 + 1, this.y0 + 8);
      } else if (this.style == "e") { // bottom
        ctx.rect(this.x0, this.y0, 20, 12);
        ctx.moveTo(this.x0 + 8, this.y0 + 12);
        ctx.lineTo(this.x0 + 8, this.y0 + 14);

        ctx.moveTo(this.x0 + 8, this.y0 - 3);
        ctx.lineTo(this.x0 + 8, this.y0);
        ctx.moveTo(this.x0 + 12, this.y0 - 3);
        ctx.lineTo(this.x0 + 12, this.y0);
        ctx.moveTo(this.x0 + 16, this.y0 - 3);
        ctx.lineTo(this.x0 + 16, this.y0);
        ctx.stroke();
        fillText(ctx, this.name, this.x0 + 1, this.y0 + 8);
      } else if (this.style == "f") { // alternate bottom
        ctx.rect(this.x0, this.y0, 20, 12);
        ctx.moveTo(this.x0 + 4, this.y0 + 12);
        ctx.lineTo(this.x0 + 4, this.y0 + 14);

        ctx.moveTo(this.x0 + 4, this.y0 - 3);
        ctx.lineTo(this.x0 + 4, this.y0);
        ctx.moveTo(this.x0 + 8, this.y0 - 3);
        ctx.lineTo(this.x0 + 8, this.y0);
        ctx.moveTo(this.x0 + 12, this.y0 - 3);
        ctx.lineTo(this.x0 + 12, this.y0);
        ctx.stroke();
        fillText(ctx, this.name, this.x0 + 1, this.y0 + 8);
      }
    }

    decode(bitstream) {
     // TODO
     return [];
    }
  }

  var objects = [];
  function initIobs() {
    function createIob(a, b, c, d) {
      objects.push(new Iob(a, b, c, d));
    };

    createIob("P9", 62, 6, "a");
    createIob("P8", 90, 6, "b");
    createIob("P7", 138, 6, "a");
    createIob("P6", 162, 6, "b");
    createIob("P5", 210, 6, "a");
    createIob("P4", 234, 6, "b");
    createIob("P3", 282, 6, "a");
    createIob("P2", 306, 6, "b");
    createIob("P68", 354, 6, "a");
    createIob("P67", 378, 6, "b");
    createIob("P66", 426, 6, "a");
    createIob("P65", 450, 6, "b");
    createIob("P64", 498, 6, "a");
    createIob("P63", 522, 6, "b");
    createIob("P62", 570, 6, "a");
    createIob("P61", 594, 6, "b");

    createIob("P27", 62, 656, "e");
    createIob("P28", 90, 656, "f");
    createIob("P29", 138, 656, "e");
    createIob("P30", 162, 656, "f");
    createIob("P31", 210, 656, "e");
    createIob("P32", 234, 656, "f");
    createIob("P33", 282, 656, "e");
    createIob("P34", 306, 656, "f");
    createIob("P36", 354, 656, "e");
    createIob("P37", 378, 656, "f");
    createIob("P38", 426, 656, "e");
    createIob("P39", 450, 656, "f");
    createIob("P40", 498, 656, "e");
    createIob("P41", 522, 656, "f");
    createIob("P42", 570, 656, "e");
    createIob("P43", 594, 656, "f");

    for (var i = 0; i < 14; i++) {
      if (i == 7) continue;
      createIob("P" + (11 + i), 6, 88 + 36 * i, "c");
    }

    for (var i = 0; i < 14; i++) {
      if (i == 7) continue;
      createIob("P" + (59 - i), 656, 88 + 36 * i, "d");
    }
  }

  var tiles = new Array(9);
  function initTiles() {
    for (var x = 0; x < 9; x++) {
      tiles[x] = new Array(9);
      for (var y = 0; y < 9; y++) {
        var tile = new Tile(x, y);
        tiles[x][y] = tile;
        objects.push(tile);
      }
    }
  }

  function init() {
    initNames();
    initIobs();
    initTiles();
  }

  function fillText(ctx, text, x, y) {
    ctx.fillText(text, x + 0.5, y + 0.5);
  }

  function vtext(ctx, text, x, y) {
    for (var i = 0 ; i < text.length; i++) {
      fillText(ctx, text[i], x, y + 8 * i);
    }
  }

  // Processes a click on the Layout image
  function layoutClick(x, y) {
    if (bitstream == null) {
      // return;
    }
    const XOFF = 24;
    const YOFF = 30;
    const xmod = (x - XOFF) % 72;
    const ymod = (y - YOFF) % 72;
    let tilex = Math.floor((x - XOFF) / 72);
    let tiley = Math.floor((y - YOFF) / 72);
    tilex = Math.max(Math.min(tilex, 8), 0); // Clamp to range 0-8
    tiley = Math.max(Math.min(tiley, 8), 0); // Clamp to range 0-8
    const name = "ABCDEFGHI"[tiley] + "ABCDEFGHI"[tilex];
    let prefix = '';
    if (x < 20) {
       prefix = 'pin';
       // pins
    } else if (x > 654) {
       prefix = 'pin';
       // pins
    } else if (y < 20) {
       prefix = 'pin';
      // pins
    } else if (y > 654) {
       prefix = 'pin';
      // pins
    } else if (xmod > 54  && ymod >= 36 && tilex < 8 && tiley < 8 ) {
      // inside clb
      prefix = 'CLB: ';
      if (tiles[tilex][tiley].clb) {
        let text = tiles[tilex][tiley].clb.describe();
        if (text != '') {
          $("#info3").html(text);
          return;
          }
        }
    }
    $("#info3").html(prefix + name + ' ' + x + ' ' + y + '; ' + tilex + ' ' + xmod + ', ' + tiley + ' ' + ymod);
  }


  function drawLayout(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
    const HEIGHT = 680
    const WIDTH = 680;
    ctx.canvas.height = HEIGHT;
    ctx.canvas.width = WIDTH;
    $("#container").css('height', HEIGHT + 'px');
    $("#container").css('width', WIDTH + 'px');
    $("#info").css('margin-left', WIDTH + 'px');
    $("#info3").css('margin-left', WIDTH + 'px');
    $("#info3").css('clear', 'none');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.translate(0.5, 0.5); // Prevent antialiasing
    ctx.lineWidth = 1;
    ctx.lineCap = 'butt';
    objects.forEach(o => o.draw(ctx));
  }

  function decode(bitstream) {
     var result = [];
     objects.forEach(o => result.push(...o.decode(bitstream)));
     $("#info3").html(result.join('<br/>'));
  }
