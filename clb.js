class ClbDecoder {
  constructor(tile) { // tile is e.g. AB
    this.tile = tile;
    let xCenter = colInfo['col.' + this.tile[1] + '.clb'][1];
    let yCenter = rowInfo['row.' + this.tile[0] + '.c'][1];
    this.W = 20;
    this.H = 32;
    this.screenPt = [xCenter - this.W / 2, yCenter - this.H / 2 - 1];
    this.clbInternal = new ClbInternal(tile);
  }

  /**
   * Create the specified pip.
   * The tile row and column are substituted into the pip.
   * Returns [G coordinate, screen X coordinate, screen Y, false]. (false is modified later to indicate the selected input.)
   * Also fills in ClbDecoders.gToName and ClbDecoders.nameToG XXX TODO
   *
   * The goal of all this is to generate the pips as conveniently as possible, taking advantage of patterns rather than
   * making a giant hard-coded list. There are many complications that make this difficult.
   * The idea is we define the location of each pip by its column and row.
   * To take advantage of repeating tiles, we put an = in the location, which is replaced with the current
   * row or column from the tile.
   *
   * Input syntax:
   * col.stuff:row.stuff or row.stuff:col.stuff
   * col.stuff:row.stuff:pipcol:piprow  In this clase, the first two parts specify the coordinate, while the second two parts are the name that is used
   * (The motivation is that most pips are simply named col.stuff:row.stuff but some pips have weird names so they get hardcoded in the long-form input.)
   * The syntax is that "=" is the specified row or column, "-" is the previous, and "+" is the next.
   * I.e. "=" in "stuff" is replaced with the column or row name
   * == is replaced with the current tile name. -= is replaced with the tile one row higher. += is replaced with the tile one row lower.
   */
  static processClbPip(pip, tile, pad) {
    let dir;
    let currRow = tile[0];
    let prevRow = String.fromCharCode(tile.charCodeAt(0) - 1);
    let nextRow = String.fromCharCode(tile.charCodeAt(0) + 1);

    let currCol = tile[1];
    let prevCol = String.fromCharCode(tile.charCodeAt(1) - 1);
    let nextCol = String.fromCharCode(tile.charCodeAt(1) + 1);
    pip = pip.replace("==", tile).replace("-=", prevRow + currCol).replace("+=", nextRow + tile[1]).replace("=-", currRow + prevRow).replace("=+", currRow + nextRow);
    let parts = pip.split(":");
    let pipname;
    let colName;
    let rowName;
    if (parts[0].startsWith("col") || parts[1].startsWith("row")) {
      colName = parts[0];
      rowName = parts[1];
    } else if (parts[0].startsWith("row") || parts[1].startsWith("col")) {
      rowName = parts[0];
      colName = parts[1];
    } else {
      throw "Unexpected pip " + pip;
    }
    rowName = rowName.replace('=', currRow).replace('+', nextRow);
    colName = colName.replace('=', currCol).replace('+', nextCol);
    if (parts.length == 4) {
      pipname = parts[2] + ":" + parts[3];
    } else {
      pipname = colName + ":" + rowName;
    }
    let col = colInfo[colName];
    let row = rowInfo[rowName];
    if (col == undefined) {
      console.log('Bad Clb', tile, pip, 'col', colName, "->", col, ";", rowName, "->", row);
      return [];
    }
    if (row == undefined) {
      console.log('Bad Clb', tile, pip, 'col', colName, "->", col, ";", rowMName, "->", row);
      return [];
    }
    let gCoord = col[0] + "G" + row[0];
    ClbDecoders.gToName[gCoord] = pipname;
    ClbDecoders.tileToG[pipname] = gCoord;
    return [gCoord, col[1], row[1], pipname, false];
  }

  // Process the input pips for the CLB: A, B, C, K, and D
  generateClbPips(tile) {
    let a = [];
    let b = [];
    let c = [];
    let d = [];
    let k = [];
    let amux = undefined;
    let bmux = undefined;
    let cmux = undefined;
    let dmux = undefined;
    let kmux = undefined;
    const row = tile[0];
    const col = tile[1];

    // Inputs to A
    if (tile[0] == "A") {
      // Top
      a = [ "row.A.long.2:col.=.clb:row.A.long.2:==.A", "row.A.local.1:col.=.clb:row.A.local.1:==.A",
        "row.A.local.2:col.=.clb:row.A.local.2:==.A", "row.A.local.3:col.=.clb:row.A.local.3:==.A",
        "row.A.local.4:col.=.clb:row.A.local.4:==.A", "row.A.long.3:col.=.clb:row.A.long.3:==.A"]
      // Connection to pad. Hardcoding seems the easiest way.
      const pad = {A: 1, B: 3, C: 5, D: 7, E: 9, F: 11, G: 13, H: 15}[tile[1]];
      a.push( "row.A.io2:col.=.clb::==.A:PAD" + pad + ".I");
      // Mux tree: 16-bit active 0, 8-bit active 0, 4-bit active 0, 2-bit active 1, 1-bit muxes between pairs.
      amux = {30: 0, 13: 1, 24: 2, 12: 3, 21: 4, 25: 5, 31: 6}[this.mux['A']];
    } else {
      // Not top
      a = [ "row.=.local.1:==.A", "row.=.local.3:==.A", "row.=.local.4:==.A", "row.=.local.5:==.A", "row.=.long.1:==.A",
         "==.A:row.=.io4"];
      // Mux tree: 4-bit active 1, 2-bit active 0, 1-bit active 0, 0-bit muxes between pair.
      amux = {3: 0, 15: 1, 4: 2, 2: 3, 14: 4, 5: 5}[this.mux['A']];
    }


    // Inputs to B
    if (tile[1] == "A") {
      // Left
      b = [ "col.=.long.2:==.B", "col.=.local.1:==.B", "col.=.local.2:==.B", "col.=.local.3:==.B", "col.=.local.4:==.B",
      "col.=.long.3:==.B", "col.=.long.4:==.B", "col.=.clk:==.B:CLK.AA.O:==.B"];
      // Pad connections
      const pad = {A: 58, B: 56, C: 54, D: 52, E: 51, F: 49, G: 47, H: 46}[tile[1]];
      b.push("col.=.io3:==.B:" + "PAD" + pad + ".I:==.B");
      if (tile == "AA") {
        // Special case for tile AA since there's no tile above.
        b.push("col.=.x:==.B:PAD1.I:==.B");
      } else {
        b.push("col.=.x:==.B:-=.X:==.B");
      }
      if (tile == "AA") {
        // Special case for top left :-(
        bmux = {15: 0, 22: 1, 26: 2, 28: 3, 63: 4, 23: 5, 27: 6, 29: 7, 14: 8, 62: 9}[this.mux['B']];
      } else {
        // Other left
        bmux = {22: 0, 15: 1, 28: 2, 63: 3, 23: 4, 26: 5, 27: 6, 29: 7, 14: 8, 62: 9}[this.mux['B']];
      }

    } else {
      // Not left

      b = [ "col.=.local.1:==.B", "col.=.local.2:==.B", "col.=.local.3:==.B", "col.=.local.4:==.B", "col.=.local.5:==.B",
      "col.=.local.6:==.B:=-.X:==.A",
      "col.=.long.1:==.B", "col.=.long.2:==.B", 
      "col.=.clk:==.B:CLK.AA.O:==.B", "col.=.x:==.B:-=.X:==.B"];
      if (tile[0] == "A") {
        // Top row is special case (top left AA is earlier)
        bmux = {22: 0, 26: 1, 28: 2, 63: 3, 15: 4, 14: 5, 23: 6, 27: 7, 29: 8, 62: 9}[this.mux['B']];
      } else {
        // Mux tree: 32-bit active 1, 16-bit active 0, 8-bit active 0, 4-bit active 0, 2-bit active 0, 1-bit muxs between pairs.
        bmux = {15: 0, 28: 1, 63: 2, 23: 3, 22: 4, 14: 5, 26: 6, 27: 7, 29: 8, 62: 9}[this.mux['B']];
      }
    }

    // Inputs to C

    if (tile[1] == "A") {
      // Left
      c = [ "col.=.long.2:==.C", "col.=.local.1:==.C", "col.=.local.2:==.C", "col.=.local.3:==.C", "col.=.local.4:==.C",
        "col.=.long.3:==.C", "col.=.long.4:==.C"];
      if (tile == "HA") {
        // Special case for tile HA since there's no tile below
        c.push("col.=.x:==.C:PAD45.I:==.C");
      } else {
        c.push("col.=.x:==.C:+=.X:==.C");
      }
      if (tile == "AA") {
        // Special case for top left
        cmux = {6: 0, 7: 1, 11: 2, 13: 3, 30: 4, 10: 5, 12: 6, 31: 7}[this.mux["C"]];
      } else {
        // Other left
        cmux = {7: 0, 12: 1, 13: 2, 30: 3, 6: 4, 11: 5, 10: 6, 31: 7}[this.mux["C"]];
      }
    } else {
      c = [ "col.=.local.1:==.C", "col.=.local.2:==.C", "col.=.local.3:==.C", "col.=.local.4:==.C", "col.=.local.5:==.C",
      "col.=.long.1:==.C", "col.=.long.2:==.C", "col.=.x:==.C:-=.X:==.C"];
      if (tile[0] == "A") {
        // Top (except AA)
        cmux = {7: 0, 11: 1, 13: 2, 30: 3, 6: 4, 10: 5, 12: 6, 31: 7}[this.mux["C"]];
      } else {
        cmux = {12: 0, 13: 1, 30: 2, 6: 3, 7: 4, 11: 5, 10: 6, 31: 7}[this.mux['C']];
      }
    }

    // Inputs to k
    if (tile[1] == "A") {
      // Left
      k = [ "col.=.long.4:==.K", "col.=.clk:==.K:CLK.AA.O:==.K"];
    } else {
      k = [ "col.=.long.2:==.K", "col.=.clk:==.K:CLK.AA.O:==.K"];
    }
    kmux = {2: 0, 1: 1, 3: undefined}[this.mux['K']]; // 3 is used for no-connection

    // Inputs to D
    d = [];
    if (tile[0] == "H") {
      // Bottom, has an extra input with different mux
      const pad = {A: 45, B: 43, C: 41, D: 39, E: 37, F: 35, G: 33, H: 31}[tile[1]];
      d = [ "row.+.io2:==.D:==.D:PAD" + pad + ".I",
        "row.+.long.1:==.D", "row.+.local.1:==.D", "row.+.local.2:==.D", "row.+.local.3:==.D", "row.+.local.4:==.D", "row.+.long.2:==.D"];
      dmux = {31: 0, 25: 1, 21: 2, 12: 3, 24: 4, 13: 5, 30: 6}[this.mux['D']];
    } else {
      // Not bottom
      d = [ "row.+.io3:==.D:==.D:+=.X",
        "row.+.local.1:==.D", "row.+.local.3:==.D", "row.+.local.4:==.D", "row.+.local.5:==.D", "row.+.long.1:==.D"];
      dmux = {5: 0, 3: 1, 15: 2, 4: 3, 2: 4, 14: 5}[this.mux['D']];
    }
    this.apips = [];
    this.bpips = [];
    this.cpips = [];
    this.kpips = [];
    this.dpips = [];
    // if (tile != 'AA' && tile != 'CA') return;
    a.forEach(p => this.apips.push(ClbDecoder.processClbPip(p, tile, tile + ".A")));
    b.forEach(p => this.bpips.push(ClbDecoder.processClbPip(p, tile, tile + ".B")));
    c.forEach(p => this.cpips.push(ClbDecoder.processClbPip(p, tile, tile + ".C")));
    k.forEach(p => this.kpips.push(ClbDecoder.processClbPip(p, tile, tile + ".K")));
    d.forEach(p => this.dpips.push(ClbDecoder.processClbPip(p, tile, tile + ".D")));
    this.dpips.forEach(x => console.log(x));
    if (amux != undefined && amux != null) {
      this.apips[amux][4] = true; // Select the appropriate pip
    }
    if (bmux != undefined && bmux != null) {
      this.bpips[bmux][4] = true; // Select the appropriate pip
    }
    if (cmux != undefined && cmux != null) {
      this.cpips[cmux][4] = true; // Select the appropriate pip
    }
    if (kmux != undefined && kmux != null) {
      this.kpips[kmux][4] = true; // Select the appropriate pip
    }
    if (dmux != undefined && dmux != null) {
      this.dpips[dmux][4] = true; // Select the appropriate pip
    }
  }

  startDecode() {
    this.mux = {'A': 0, 'B': 0, 'C': 0, 'K': 0, 'D': 0}; // Holds binary value for each input mux
  }

  add(str, bit) {
    const m = str.match(/\.([ABCDK]) MuxBit: (\d)/);
    if (m) {
      this.mux[m[1]] |= (bit << parseInt(m[2]));
    }
  }

  // Decoded the received data
  decode() {
    this.clbInternal.decode(bitstreamTable);
  }

  render(ctx) {
    this.generateClbPips(this.tile);
    ctx.strokeStyle = "#cff";
    // ctx.rect(this.screenPt[0], this.screenPt[1], this.W, this.H);
    ctx.stroke();
    ctx.font = "6px arial";
    ctx.fillStyle = "red";
    ctx.fillText("a" + this.mux["A"] + " b:" + this.mux["B"] + " " + this.mux["C"] + " k:" + this.mux["K"] + " " + this.mux["D"], this.screenPt[0], this.screenPt[1] + 10);
    drawPips(ctx, this.apips, "white");
    drawPips(ctx, this.kpips, "white");
    drawPips(ctx, this.dpips, "white");
    drawPips(ctx, this.bpips, "white");
    drawPips(ctx, this.cpips, "white");
  }

  info() {
    let result = [];
    result.push(this.clbInternal.describe());
    return "CLB: " + this.tile + " " + result.join(" ");
  }

  isInside(x, y) {
    if (this.tile[0] == "I" || this.tile[1] == "I") {
      return false;
    }
    return x >= this.screenPt[0] && x < this.screenPt[0] + this.W && y >= this.screenPt[1] && y < this.screenPt[1] + this.H;
  }
}

class ClbDecoders {
  constructor() {
    this.clbDecoders = {};
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let tile = "ABCDEFGH"[i] + "ABCDEFGH"[j];
        this.clbDecoders[tile] = new ClbDecoder(tile);
      }
    }
    // These are in the config as CLBs.
    this.clbDecoders["CLK.AA.I"] = new ClkDecoder("CLK.AA.I");
    this.clbDecoders["CLK.II.I"] = new ClkDecoder("CLK.II.I");
  }

  startDecode() {
    Object.entries(this.clbDecoders).forEach(([k, c]) => c.startDecode());
  }

  get(tile) {
    return this.clbDecoders[tile];
  }

  decode() {
    Object.entries(this.clbDecoders).forEach(([k, c]) => c.decode());
  }

  render(ctx) {
    Object.entries(this.clbDecoders).forEach(([tile, obj]) => obj.render(ctx));
  }
}

ClbDecoders.gToName = {};
ClbDecoders.tileToG = {};

const XXXmuxB = [
["col.X.local.2:==.B", "CLK.AA.O:==.B", "1"],
["col.X.long.1:==.B", "col.X.long.2:==.B", "2"],
["col.X.local.5:==.B", "col.X.local.4:==.B", "3"],
["=-.X:==.B", "col.X.local.1:==.B", "4"],
["-=.X:==.B", "col.X.local.3:==.B", "!5"],
"0"];

// Indices into the bitmamp
var tileToBitmapX = {A: 3, B: 21, C: 39, D: 59, E: 77, F: 95, G: 115, H: 133, I: 151};
var tileToBitmapY = {A: 1, B: 9, C: 17, D: 26, E: 34, F: 42, G: 51, H: 59, I: 67};

class ClbInternal {
    // bitPt is the index into the config bitmap
    constructor(name) {
      this.bitPt = [tileToBitmapX[name[1]], tileToBitmapY[name[0]]];
    }

    /**
     * Decode this CLB from the bitstreamTable.
     */
    decode(bitstreamTable) {
      this.bitTypes = []; // Fill this in as we go
      var x = this.bitPt[0];
      var y = this.bitPt[1];
      var nf = 0;
      for (var bitnum = 0; bitnum < 8; bitnum++) {
        var bit = bitstreamTable[x + bitnum][y + 7];
        this.bitTypes.push([x + bitnum, y + 7, BITTYPE.lut]);
        if (bit) {
          nf |= 1 << [1, 0, 2, 3, 5, 4, 6, 7][bitnum]; // Ordering of LUT is irregular
        }
      }
      this.configNf = nf;
      var fin1 = bitstreamTable[x + 7][y + 6] ? 'A' : 'B';
      var fin2 = bitstreamTable[x + 6][y + 6] ? 'B' : 'C';
      var fin3 = 'Q';
      if (bitstreamTable[x + 1][y + 6]) {
        fin3 = 'C';
      } else if ( bitstreamTable[x + 0][y + 6]) {
        fin3 = 'D';
      }
      this.bitTypes.push([x + 7, y + 6, BITTYPE.clb], [x + 6, y + 6, BITTYPE.clb], [x + 1, y + 6, BITTYPE.clb], [x + 0, y + 6, BITTYPE.clb]);

      var ng = 0;
      for (var bitnum = 0; bitnum < 8; bitnum++) {
        bit = bitstreamTable[x + bitnum + 10][y + 7];
        this.bitTypes.push([x + bitnum + 10, y + 7, BITTYPE.lut]);
        if (bit) {
          ng |= 1 << [7, 6, 4, 5, 3, 2, 0, 1][bitnum]; // Ordering of LUT is irregular
        }
      }
      this.configNg = ng;
      var gin1 = bitstreamTable[x + 11][y + 6] ? 'A' : 'B';
      var gin2 = bitstreamTable[x + 12][y + 6] ? 'B' : 'C';
      this.bitTypes.push([x + 11, y + 6, BITTYPE.clb], [x + 12, y + 6, BITTYPE.clb]);
      var gin3 = 'Q';
      if ( bitstreamTable[x + 16][y + 6]) {
        gin3 = 'C';
      } else if ( bitstreamTable[x + 17][y + 6]) {
        gin3 = 'D';
      }

      var str;
      var fname = 'F'; // The F output used internally; renamed to M for Base FGM.
      var gname = 'G';
      this.bitTypes.push([x + 9, y + 7, BITTYPE.clb]);
      if (bitstreamTable[x + 9][y + 7] != 1) {
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
      this.configX = choose4(bitstreamTable[x + 11][y + 5], bitstreamTable[x + 10][y + 5], ['Q', fname, gname, 'UNDEF']);
      this.bitTypes.push([x + 11, y + 5, BITTYPE.clb], [x + 10, y + 5, BITTYPE.clb]);
      this.configY = choose4(bitstreamTable[x + 13][y + 5], bitstreamTable[x + 12][y + 5], ['Q', gname, fname, 'UNDEF']);
      this.bitTypes.push([x + 13, y + 5, BITTYPE.clb], [x + 12, y + 5, BITTYPE.clb]);
      this.configQ = bitstreamTable[x + 9][y + 5] ? 'LATCH': 'FF';
      this.bitTypes.push([x + 9, y + 5, BITTYPE.clb]);

      // Figure out flip flop type and clock source. This seems a bit messed up.
      let clkInvert = bitstreamTable[x + 5][y + 4]; // Invert flag
      this.bitTypes.push([x + 5, y + 4, BITTYPE.clb]);
      if (bitstreamTable[x + 9][y + 5]) {
        clkInvert = !clkInvert; // LATCH flips the clock
      }
      if (bitstreamTable[x + 6][y + 4] == 0) {
        // No clock
        this.configClk = '';
      } else {
        if (bitstreamTable[x + 4][y + 4] == 1) {
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
      this.bitTypes.push([x + 6, y + 4, BITTYPE.clb]);
      this.bitTypes.push([x + 4, y + 4, BITTYPE.clb]);
      if (clkInvert) { // Add NOT, maybe with colon separator.
        if (this.configClk != '') {
          this.configClk += ':NOT';
        } else {
          this.configClk += 'NOT';
        }
      }

      this.configSet = choose4(bitstreamTable[x + 3][y + 5], bitstreamTable[x + 2][y + 5], ['A', '', fname, 'BOTH?']);
      this.bitTypes.push([x + 3, y + 5, BITTYPE.clb], [x + 2, y + 5, BITTYPE.clb]);
      this.configRes = choose4(bitstreamTable[x + 1][y + 5], bitstreamTable[x + 0][y + 5], ['', 'G?', 'D', gname]);
      this.bitTypes.push([x + 1, y + 5, BITTYPE.clb], [x + 0, y + 5, BITTYPE.clb]);
      this.configString = 'X:' + this.configX + ' Y:' + this.configY + ' F:' + this.configF + ' G:' + this.configG + ' Q:' + this.configQ +
          ' SET:' + this.configSet + ' RES:' + this.configRes + ' CLK:' + this.configClk;
    }

    config() {
      return this.configString;
    }

    describe() {
      return this.configString;
    }

    /**
     * Returns the function of each (known) bit in the bitstreamTable.
     *
     * Format: [[x, y, type], ...]
     */
    getBitTypes() {
      return this.bitTypes;
    }
  }

let popup = undefined;
function clbDrawPopup(clb, x, y) {
  popup = $("<canvas/>", {class: "popup"}).width(300).height(300).css("left", x * SCALE).css("top", y * SCALE)[0];
  $('#container').append(popup);
  const context = popup.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function clbRemovePopup() {
  if (popup) {
    popup.remove();
    popup = undefined;
  }
}
