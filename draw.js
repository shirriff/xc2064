// From row name to [internal Y coordinate (G), screen Y coordinate]
var rowInfo = {
 "row.I.local.5": [0, 999],
 "row.I.long.2": [4, 646],
 "row.I.local.4": [6, 642],
 "row.I.local.3": [7, 638],
 "row.I.local.2": [9, 634],
 "row.I.local.1": [10, 630],
 "row.I.long.1": [12, 624],
 "row.I.local.0": [17, 604],

 // "row.A.io2": [188, 60], // My invention, I/O above CLB
 "row.A.local.0": [173, 2],
 "row.A.long.2": [169, 26],
 "row.A.local.1": [167, 30],
 "row.A.local.2": [166, 34],
 "row.A.local.3": [164, 38],
 "row.A.local.4": [163, 42],
 "row.A.long.3": [161, 48],
 "row.A.local.5": [160, 52], // Also I/O lines, would be io1
 "row.A.io2": [159, 56], // My invention, I/O above CLB
 "row.A.io3": [158, 60], // My invention, row near top of CLB
 "row.A.io4": [157, 64], // My invention, I/O above CLB
 "row.A.io5": [156, 68], // My invention, I/O aligned with top of CLB
 "row.A.io6": [155, 72], // My invention, I/O just below top of CLB
 "row.A.b": [154, 80], // My invention, input b to CLB
 "row.A.c": [153, 86], // My invention, input c to CLB
 "row.A.k": [152, 92], // My invention, input k to CLB
 "row.A.y": [151, 96], // My invention, input d to CLB
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
 "col.A.clk": [13, 52], // My invention
 "col.A.local.5": [14, 56],
 "col.A.io1": [15, 62], // My invention, three I/O verticals feeding to matrices
 "col.A.io2": [16, 66], // My invention
 "col.A.io3": [17, 70], // My invention
 "col.A.x": [18, 74], // My invention, x input to CLB
 "col.A.clbl1": [19, 78], // My invention, one column left of center of CLB.
 "col.A.clb": [21, 88], // My invention, through center of CLB.
 "col.A.clbr1": [22, 94], // My invention, one column right of center of CLB.
 "col.A.clbr2": [23, 98], // My invention, two columns right of center of CLB.
 "col.A.clbr3": [24, 102], // My invention, three columns right of center of CLB.

// Note: clbw1-3 are wrapped around clbr1-3 from the neighboring tile.
// E.g. AB.clbl3 is above AA
// This makes assigning iobs to columns easier.
 "col.I.clbw1": [162, 598],
 "col.I.clbw2": [163, 602],
 "col.I.clbw3": [164, 606],
 "col.I.local.0": [167, 618],
 "col.I.long.1": [169, 626],
 "col.I.long.2": [170, 630],
 "col.I.local.1": [172, 636],
 "col.I.local.2": [173, 640],
 "col.I.local.3": [175, 644],
 "col.I.local.4": [176, 648],
 "col.I.long.3": [178, 652],
 "col.I.local.5": [181, 999],
 "col.I.clb": [999, 999], // My invention
}

const rowFromG = {}; // Look up the row name from the G coordinate
const colFromG = {}; // Look up the column name from the G coordinate

function initNames() {
  // Generate formulaic row and column names (B through H)
  for (var i = 1; i < 8; i++) {
    var cstart = 27 + 20 * (i-1);
    var name = "ABCDEFGHI"[i];

    // Note: clbw1-3 are wrapped around clbr1-3 from the neighboring tile.
    // E.g. AB.clbl3 is above AA
    // This makes assigning iobs to columns easier.
    colInfo['col.' + name + '.clbw1'] = [cstart - 5, 94 + 72 * (i-1)]; // My invention, one column right of center of CLB.
    colInfo['col.' + name + '.clbw2'] = [cstart - 4, 98 + 72 * (i-1)]; // My invention, two columns right of center of CLB.
    colInfo['col.' + name + '.clbw3'] = [cstart - 3, 102 + 72 * (i-1)]; // My invention, three columns right of center of CLB.
    colInfo['col.' + name + '.local.1'] = [cstart, 108 + 72 * (i-1)];
    colInfo['col.' + name + '.local.2'] = [cstart + 1, 112 + 72 * (i-1)];
    colInfo['col.' + name + '.local.3'] = [cstart + 3, 116 + 72 * (i-1)];
    colInfo['col.' + name + '.local.4'] = [cstart + 4, 120 + 72 * (i-1)];
    colInfo['col.' + name + '.local.5'] = [cstart + 6, 126 + 72 * (i-1)];
    colInfo['col.' + name + '.local.6'] = [cstart + 7, 130 + 72 * (i-1)]; // y connection
    colInfo['col.' + name + '.long.1'] = [cstart + 8, 134 + 72 * (i-1)];
    colInfo['col.' + name + '.long.2'] = [cstart + 9, 138 + 72 * (i-1)];
    colInfo['col.' + name + '.clk'] = [cstart + 10, 142 + 72 * (i-1)]; // my invention
    colInfo['col.' + name + '.x'] = [cstart + 11, 146 + 72 * (i-1)]; // my invention
    colInfo['col.' + name + '.clbl2'] = [cstart + 12, 150 + 72 * (i-1)]; // My invention, two columns left of center of CLB.
    colInfo['col.' + name + '.clbl1'] = [cstart + 13, 154 + 72 * (i-1)]; // My invention, one column left of center of CLB.
    // col.X.clb is my name for the column running through the middle of the CLB
    colInfo['col.' + name + '.clb'] = [cstart + 14, 160 + 72 * (i-1)];
    colInfo['col.' + name + '.clbr1'] = [cstart + 15, 166 + 72 * (i-1)]; // My invention, one column right of center of CLB.
    colInfo['col.' + name + '.clbr2'] = [cstart + 16, 170 + 72 * (i-1)]; // My invention, two columns right of center of CLB.
    colInfo['col.' + name + '.clbr3'] = [cstart + 17, 174 + 72 * (i-1)]; // My invention, three columns right of center of CLB.

    // Interpreting die file: row.B.local.1 = die file Y 28 = G 145, i.e. sum=173
    var rstart = 25 + 19 * (7 - i);
    // row.X.io1 is my name for the I/O row below the CLB
    rowInfo['row.' + name + '.io1'] = [rstart + 12, 100 + 72 * (i-1)];
    rowInfo['row.' + name + '.io2'] = [rstart + 11, 104 + 72 * (i-1)];
    rowInfo['row.' + name + '.io3'] = [rstart + 10, 108 + 72 * (i-1)];
    rowInfo['row.' + name + '.local.0'] = [rstart + 7, 112 + 72 * (i-1)];
    rowInfo['row.' + name + '.local.1'] = [rstart + 6, 114 + 72 * (i-1)];
    rowInfo['row.' + name + '.local.3'] = [rstart + 5, 118 + 72 * (i-1)];
    rowInfo['row.' + name + '.local.4'] = [rstart + 3, 122 + 72 * (i-1)];
    rowInfo['row.' + name + '.local.5'] = [rstart + 2, 126 + 72 * (i-1)];
    rowInfo['row.' + name + '.long.1'] = [rstart, 132 + 72 * (i-1)];
    // row.X.io6 is my name for the row near the top of the clb
    // row.X.b is my name for the row through input b
    // row.X.c is my name for the row running through the middle of the CLB, through input c, output y
    // row.X.k is my name for the row through input k
    // row.X.y is my name for the row through input b
    rowInfo['row.' + name + '.io4'] = [rstart - 1, 136 + 72 * (i-1)];
    rowInfo['row.' + name + '.io5'] = [rstart - 2, 140 + 72 * (i-1)];
    rowInfo['row.' + name + '.io6'] = [rstart - 3, 144 + 72 * (i-1)];
    rowInfo['row.' + name + '.b'] = [rstart - 4, 152 + 72 * (i-1)];
    rowInfo['row.' + name + '.c'] = [rstart - 5, 158 + 72 * (i-1)];
    rowInfo['row.' + name + '.k'] = [rstart - 6, 164 + 72 * (i-1)];
    rowInfo['row.' + name + '.y'] = [rstart - 7, 168 + 72 * (i-1)];
  }

  // Make reverse table
  Object.entries(rowInfo).forEach(([key, val]) => rowFromG[val[0]] = key);
  Object.entries(colInfo).forEach(([key, val]) => colFromG[val[0]] = key);
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
      this.gPt = gPt;
      this.bitPt = bitPt;
      this.configString = '';
    }

    draw(ctx) {
      ctx.strokeStyle = "red";
      ctx.beginPath();
      // Screen coordinate center of the CLB
      let xCenter = colInfo['col.' + this.name[1] + '.clb'][1];
      let yCenter = rowInfo['row.' + this.name[0] + '.c'][1];
      var x0 = xCenter - 10;
      var y0 = yCenter - 18;
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

      this.drawNetwork(ctx);
    }

    // Returns screen position for e.g. 'local.1'
    colPos(s) {
      const name = 'col.' + this.name[1] + '.' + s;
      try {
        return colInfo[name][1];
      } catch {
        throw "bad name " + name;
      }
    }

    // Returns screen position for e.g. 'local.1'
    rowPos(s) {
      const name = 'row.' + this.name[0] + '.' + s;
      try {
        return rowInfo[name][1];
      } catch {
        throw "bad name " + name;
      }
    }

    // Draw the PIPs and network lines.
    drawNetwork(ctx) {
      let xCenter = this.colPos('clb');
      let yCenter = this.rowPos('c');
      ctx.beginPath();
      ctx.strokeStyle = "black";
      ctx.moveTo(this.colPos('long.2'), this.rowPos('c'));
      ctx.lineTo(xCenter - 20, this.rowPos('c'));
      ctx.lineTo(xCenter - 20, this.rowPos('c'));
      ctx.stroke();
      let cols;

      if (this.name[1] == 'A') {
        cols = [];
      } else {
        cols = ["local.2", "local.4", "long.1"];
      }
      cols.forEach(s => ctx.fillRect(this.colPos(s) - 1, this.rowPos('io2') - 1, 2, 2));

      if (this.name[1] == 'A') {
        cols = ["long.2", "local.1", "local.2", "local.3", "local.4", "long.3", "long.4", "clk", "io3", "x"];
      } else {
        cols = ["local.1", "local.2", "local.3", "local.4", "local.5", "local.6", "long.1", "long.2", "clk", "x"];
      }
      cols.forEach(s => ctx.fillRect(this.colPos(s) - 1, this.rowPos('b') - 1, 2, 2));

      if (this.name[1] == 'A') {
        cols = ["long.2", "local.1", "local.2", "local.3", "local.4", "long.3", "long.4", "x"];
      } else {
        cols = ["local.1", "local.2", "local.3", "local.4", "local.5", "long.1", "long.2", "x"];
      }
      cols.forEach(s => ctx.fillRect(this.colPos(s) - 1, this.rowPos('c') - 1, 2, 2));

      if (this.name[1] == 'A') {
        cols = ["long.4", "clk"];
      } else {
        cols = ["long.2", "clk"];
      }
      cols.forEach(s => ctx.fillRect(this.colPos(s) - 1, this.rowPos('k') - 1, 2, 2));

      if (this.name[1] == 'A') {
        cols = [];
      } else {
        cols = ["local.1", "local.3", "local.5", "long.2"];
      }
      cols.forEach(s => ctx.fillRect(this.colPos(s) - 1, this.rowPos('y') - 1, 2, 2));

      // Segments above: D inputs
      let rows;
      if (this.name[0] == 'A') {
        rows = [];
      } else {
        rows = ["io3", "local.1", "local.3", "local.4", "local.5", "long.1"];
      }
      rows.forEach(s => ctx.fillRect(this.colPos("clb") - 1, this.rowPos(s) - 1, 2, 2));

      // A inputs
      if (this.name[0] == 'A') {
        rows = ["long.2", "local.1", "local.2", "local.3", "local.4", "long.3", "local.5"];
        rows.forEach(s => ctx.fillRect(this.colPos("clb") - 1, this.rowPos(s) - 1, 2, 2));
      } else {
        rows = ["local.1", "local.3", "local.4", "local.5", "long.1", "io4"];
        rows.forEach(s => ctx.fillRect(this.colPos("clbr1") - 1, this.rowPos(s) - 1, 2, 2));
      }

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
        this.switch1 = new Switch(this, 1);
        this.switch2 = new Switch(this, 2);
      } else if (this.type == TILE.ur) {
        this.switch1 = new Switch(this, 1);
        this.switch2 = new Switch(this, 2);
      } else if (this.type == TILE.center) {
        // Main part
        this.switch1 = new Switch(this, 1);
        this.switch2 = new Switch(this, 2);
      } else if (this.type == TILE.right) {
        this.switch1 = new Switch(this, 1);
        this.switch2 = new Switch(this, 2);
      } else if (this.type == TILE.ll) {
        // bottom left
        this.switch1 = new Switch(this, 1);
        this.switch2 = new Switch(this, 2);
      } else if (this.type == TILE.lr) {
        // bottom right
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

  /**
   * An I/O block.
   * Each I/O block is associated with its neighboring tile.
   * Some complications: I/O blocks are different on the top, bottom, left, and right.
   * There are typically two I/O blocks per tile, so the bits are different for these two. They are also drawn differently.
   * Tile AA has 3 I/O blocks. Tile EA has 1 I/O block; one is omitted.
   * 
   */
  class Iob {
    constructor(name, tilename, x0, y0, style) {
      this.name = name;
      this.tilename = tilename;
      this.x0 = x0;
      this.y0 = y0;
      this.style = style;
    }

    // Returns screen position for e.g. 'local.1'
    colPos(s) {
      const name = 'col.' + this.tilename[1] + '.' + s;
      try {
        return colInfo[name][1];
      } catch {
        throw "bad name " + name;
      }
    }

    // Returns screen position for e.g. 'local.1'
    rowPos(s) {
      const name = 'row.' + this.tilename[0] + '.' + s;
      try {
        return rowInfo[name][1];
      } catch {
        throw "bad name " + name;
      }
    }

    draw(ctx) {
      ctx.strokeStyle = "red";

      ctx.font = "10px arial";
      ctx.fillStyle = "green";
      ctx.beginPath();

      if (this.style == "topleft") { // top, left of pair
        ctx.beginPath();
        const W = 20;
        const H = 12;
        if (this.tilename[1] == "A") {
          this.x0 = this.colPos("io3") - 8; // Left edge of box
        } else {
          this.x0 = this.colPos("x") - 8; // Left edge of box
        }
        this.y0 = this.rowPos("local.0") + 4; // Top edge of box
        ctx.rect(this.x0, this.y0, W, H);
        ctx.stroke();

        // pin.O vertical
        let cols;
        // pin O
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        let row;
        let col;
        let col2;
        if (this.tilename[1] == "A") {
          row = "local.5";
          col = "io3";
          col2 = "long.2";
        } else {
          row = "io3";
          col = "x";
          col2 = "local.1";
        }
        ctx.moveTo(this.colPos(col), this.y0 + H);
        ctx.lineTo(this.colPos(col), this.y0 + H + 3);
        ctx.moveTo(this.colPos(col), this.y0 + 12);
        ctx.lineTo(this.colPos(col), this.rowPos(row));
        ctx.lineTo(this.colPos(col2), this.rowPos(row));

        // pin.I
        if (this.tilename[1] == "A") {
          col = "x";
          row = "io5";
          col2 = "long.2";
        } else {
          col = "clbl2";
          row = "io4";
          col2 = "local.2";
        }
        ctx.moveTo(this.colPos(col), this.y0 + 12);
        ctx.lineTo(this.colPos(col), this.y0 + 15);
        ctx.moveTo(this.colPos(col), this.y0 + 12);
        ctx.lineTo(this.colPos(col), this.rowPos(row));
        ctx.lineTo(this.colPos(col2), this.rowPos(row));

        // pin.T
        if (this.tilename[1] == "A") {
          col = 'clbl1';
        } else {
          col = 'clbl1';
        }
        ctx.moveTo(this.colPos(col), this.y0 + 12);
        ctx.lineTo(this.colPos(col), this.y0 + 15);
        ctx.lineTo(this.colPos(col), this.rowPos("long.3"));

        // K pin
        if (this.tilename[1] == "A") {
          col = "io3";
        } else {
          col = "x";
        }
        ctx.moveTo(this.colPos(col), this.y0);
        ctx.lineTo(this.colPos(col), this.y0 - 2);
        ctx.stroke();

        fillText(ctx, this.name, this.x0 + 1, this.y0 + 8);
      } else if (this.style == "topright") { // IOB on top, with wires to right
        ctx.beginPath();
        const W = 20;
        const H = 12;
        this.x0 = this.colPos("clbw1") - 4; // Left edge of box
        this.y0 = this.rowPos("local.0") + 4; // Top edge of box
        ctx.rect(this.x0, this.y0, W, H);
        ctx.stroke();

        // pin.O vertical
        let rows = ["local.1", "local.3", "long.3"];
        ctx.fillStyle = 'purple';
        rows.forEach(s => ctx.fillRect(this.colPos("clbw1") - 1, this.rowPos(s) - 1, 2, 2));
        let cols;
        // pin O
        ctx.beginPath();
        ctx.moveTo(this.colPos('clbw1'), this.y0 + H);
        ctx.lineTo(this.colPos('clbw1'), this.y0 + H + 3);
        let row;
        let col;
        if (this.tilename[1] == "I") {
          row = "io3";
          col = "long.3";
        } else {
          row = "io2";
          col = "long.2";
        }
        ctx.moveTo(this.colPos('clbw1'), this.y0 + 12);
        ctx.lineTo(this.colPos('clbw1'), this.rowPos(row));
        ctx.lineTo(this.colPos(col), this.rowPos(row));

        // pin.I
        ctx.moveTo(this.colPos('clbw2'), this.y0 + 12);
        ctx.lineTo(this.colPos('clbw2'), this.y0 + 15);

        ctx.fillStyle = 'yellow';
        rows = ["local.2", "local.4", "long.2"];
        rows.forEach(s => ctx.fillRect(this.colPos("clbw2") - 1, this.rowPos(s) - 1, 2, 2));
        // pin.I horizontal PIPs
        if (this.tilename[1] == "I") {
          cols = ["local.2", "local.4", "long.2", "long.3"];
          row = "io2";
        } else {
          cols = ["local.1", "local.3", "long.1"];
          row = "local.5";
        }
        cols.forEach(s => ctx.fillRect(this.colPos(s, 1) - 1, this.rowPos("local.5") - 1, 2, 2));
        ctx.moveTo(this.colPos("clbw2"), this.y0 + 12);
        ctx.lineTo(this.colPos("clbw2"), this.rowPos(row));
        ctx.lineTo(this.colPos(cols.pop()), this.rowPos(row));
        ctx.stroke();

        // pin.T
        if (this.tilename[1] == "I") {
          row = 'clbw3';
        } else {
          row = 'clbw3';
        }
        ctx.moveTo(this.colPos(row), this.y0 + 12);
        ctx.lineTo(this.colPos(row), this.y0 + 15);
        ctx.lineTo(this.colPos(row), this.rowPos('long.3'));
        ctx.fillStyle = 'brown';
        rows = ["long.2", "local.1", "local.3", "long.3"];
        rows.forEach(s => ctx.fillRect(this.colPos(row) - 1, this.rowPos(s) - 1, 2, 2));

        // K pin
        ctx.moveTo(this.x0 + 4, this.y0);
        ctx.lineTo(this.x0 + 4, this.y0 - 2);
        ctx.stroke();
        ctx.fillRect(this.colPos("clbw1") - 1, this.rowPos("local.0") - 1, 2, 2);

        fillText(ctx, this.name, this.x0 + 1, this.y0 + 8);
      } else if (this.style == "leftdown") { // left
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
      } else if (this.style == "leftup") { // left
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
      } else if (this.style == "rightdown") { // right
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
      } else if (this.style == "rightup") { // right
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
      } else if (this.style == "bottomleft") { // bottom
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
      } else if (this.style == "bottomright") { // alternate bottom
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
  }

  var objects = [];
  function initIobs() {
    function createIob(a, b, c, d, e, f) {
      objects.push(new Iob(a, b, c, d, e, f));
    };

    createIob("P9", "AA", 62, 6, "topleft", "PAD1");
    createIob("P8", "AB", 90, 6, "topright", "PAD2");
    createIob("P7", "AB", 138, 6, "topleft", "PAD3");
    createIob("P6", "AC", 162, 6, "topright", "PAD4");
    createIob("P5", "AC", 210, 6, "topleft", "PAD5");
    createIob("P4", "AD", 234, 6, "topright", "PAD6");
    createIob("P3", "AD", 282, 6, "topleft", "PAD7");
    createIob("P2", "AE", 306, 6, "topright", "PAD8");
    createIob("P68", "AE", 354, 6, "topleft", "PAD9");
    createIob("P67", "AF", 378, 6, "topright", "PAD10");
    createIob("P66", "AF", 426, 6, "topleft", "PAD11");
    createIob("P65", "AG", 450, 6, "topright", "PAD12");
    createIob("P64", "AG", 498, 6, "topleft", "PAD13");
    createIob("P63", "AH", 522, 6, "topright", "PAD14");
    createIob("P62", "AH", 570, 6, "topleft", "PAD15");
    createIob("P61", "AI", 594, 6, "topright", "PAD16");
    return;

    createIob("P27", "HA", 62, 656, "bottomleft");
    createIob("P28", "HB", 90, 656, "bottomright");
    createIob("P29", "HB", 138, 656, "bottomleft");
    createIob("P30", "HC", 162, 656, "bottomright");
    createIob("P31", "HC", 210, 656, "bottomleft");
    createIob("P32", "HD", 234, 656, "bottomright");
    createIob("P33", "HD", 282, 656, "bottomleft");
    createIob("P34", "HE", 306, 656, "bottomright");
    createIob("P36", "HE", 354, 656, "bottomleft");
    createIob("P37", "HF", 378, 656, "bottomright");
    createIob("P38", "HF", 426, 656, "bottomleft");
    createIob("P39", "HG", 450, 656, "bottomright");
    createIob("P40", "HG", 498, 656, "bottomleft");
    createIob("P41", "HH", 522, 656, "bottomright");
    createIob("P42", "HH", 570, 656, "bottomleft");
    createIob("P43", "HI", 594, 656, "bottomright");

    for (var i = 0; i < 14; i += 2) {
      if (i == 7) continue;
      createIob("P" + (11 + i), "ABCDEFGH"[i/2] + "A", 6, 88 + 36 * i, "leftdown");
    }
    for (var i = 1; i < 14; i += 2) {
      if (i == 7) continue;
      createIob("P" + (11 + i), "ABCDEFGH"[(i+1)/2] + "A", 6, 88 + 36 * i, "leftup");
    }

    for (var i = 0; i < 14; i += 2) {
      if (i == 7) continue;
      createIob("P" + (59 - i), "ABCDEFGH"[i/2] + "H", 656, 88 + 36 * i, "rightdown");
    }

    for (var i = 1; i < 14; i += 2) {
      if (i == 7) continue;
      createIob("P" + (59 - i), "ABCDEFGH"[(i+1)/2] + "H", 656, 88 + 36 * i, "rightup");
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

function pipRender(ctx, pipDecoder) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  $("#img").css("display", "none");
  for (const [name, bit] of Object.entries(pipDecoder.entries)) {
    const parts = name.split('G');
    const row = rowFromG[parts[1]];
    const col = colFromG[parts[0]];
    if (row == undefined) {
      console.log('Undefined row', name, parts[1]);
      continue;
    }
    if (col == undefined) {
      console.log('Undefined col', name, parts[0]);
      continue;
    }
    const x = colInfo[col][1];
    const y = rowInfo[row][1];
    if (bit) {
      ctx.fillStyle = "gray";
    } else {
      ctx.fillStyle = "red";
    }
    ctx.fillRect(x-1, y-1, 3, 3);
  }
}

function render(ctx) {
  decoders.forEach(d => d.render(ctx));
}
