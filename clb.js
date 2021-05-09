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
   * To take advantage of repeating tiles, we put a ? in the location, which is replaced with the current
   * row or column from the tile.
   *
   * This is similar to generateClbPips.
   */
  static processClbPip(pip, tile, pad) {
    let dir;
    let prevRow = String.fromCharCode(tile.charCodeAt(0) - 1);
    let prevCol = String.fromCharCode(tile.charCodeAt(1) - 1);
    pip = pip.replace("XX", tile).replace("WX", prevRow + tile[1]);
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
    rowName = rowName.replace('?', tile[0]);
    colName = colName.replace('?', tile[1]);
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
    if (tile[0] == "A") {
      // Top
      a = [ "row.A.long.2:col.?.clb:row.A.long.2:XX.A", "row.A.local.1:col.?.clb:row.A.local.1:XX.A",
        "row.A.local.2:col.?.clb:row.A.local.2:XX.A", "row.A.local.3:col.?.clb:row.A.local.3:XX.A",
        "row.A.local.4:col.?.clb:row.A.local.4:XX.A", "row.A.long.3:col.?.clb:row.A.long.3:XX.A"]
      // Connection to pad. Hardcoding seems the easiest way.
      const pad = {A: 1, B: 3, C: 5, D: 7, E: 9, F: 11, G: 13, H: 15}[tile[1]];
      a.push( "row.A.io2:col.?.clb::XX.A:PAD" + pad + ".I");
      // Mux tree: 16-bit active 0, 8-bit active 0, 4-bit active 0, 2-bit active 1, 1-bit muxes between pairs.
      amux = {30: 0, 13: 1, 24: 2, 12: 3, 21: 4, 25: 5, 31: 6}[this.mux['A']];
    } else {
      // Not top
      a = [ "row.?.local.1:XX.A", "row.?.local.3:XX.A", "row.?.local.4:XX.A", "row.?.local.5:XX.A", "row.?.long.1:XX.A",
         "XX.A:row.?.io4"];
      // Mux tree: 4-bit active 1, 2-bit active 0, 1-bit active 0, 0-bit muxes between pair.
      amux = {3: 0, 15: 1, 4: 2, 2: 3, 14: 4, 5: 5}[this.mux['A']];
    }
    if (tile[1] == "A") {
      // Left
    } else {
      // Not left
      b = [ "col.?.local.1:XX.B", "col.?.local.2:XX.B", "col.?.local.3:XX.B", "col.?.local.4:XX.B", "col.?.local.5:XX.B",
      "col.?.local.6:XX.B:XW.X:XX.A",
      "col.?.long.1:XX.B", "col.?.long.2:XX.B", 
      "col.?.clk:XX.B:CLK.AA.O:XX.B", "col.?.x:XX.B:WX.X:XX.B"];
      // Mux tree: 32-bit active 1, 16-bit active 0, 8-bit active 0, 4-bit active 0, 2-bit active 0, 1-bit muxs between pairs.
      bmux = {15: 0, 28: 1, 63: 2, 23: 3, 22: 4, 14: 5, 26: 6, 27: 7, 29: 8, 62: 9}[this.mux['B']];
    }
    if (tile[0] == "H") {
      // Bottom
    }  else {
      // Not bottom
      d = [ "col.?.clb:row.?.io3:WX.X:XX.A"];
    }
    this.apips = [];
    this.bpips = [];
    this.cpips = [];
    this.kpips = [];
    this.dpips = [];
    a.forEach(p => this.apips.push(ClbDecoder.processClbPip(p, tile, tile + ".A")));
    b.forEach(p => this.bpips.push(ClbDecoder.processClbPip(p, tile, tile + ".B")));
    c.forEach(p => this.cpips.push(ClbDecoder.processClbPip(p, tile, tile + ".C")));
    k.forEach(p => this.kpips.push(ClbDecoder.processClbPip(p, tile, tile + ".K")));
    d.forEach(p => this.dpips.push(ClbDecoder.processClbPip(p, tile, tile + ".D")));
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
    const m = str.match(/\.([A-H]) MuxBit: (\d)/);
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
    ctx.fillText("a" + this.mux["A"] + " " + this.mux["B"] + " " + this.mux["C"] + " " + this.mux["K"] + " " + this.mux["D"], this.screenPt[0], this.screenPt[1]);
    drawPips(ctx, this.apips, "blue");
    drawPips(ctx, this.bpips, "green");
    drawPips(ctx, this.cpips, "yellow");
    drawPips(ctx, this.kpips, "orange");
    drawPips(ctx, this.dpips, "pink");
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

const muxB = [
["col.X.local.2:XX.B", "CLK.AA.O:XX.B", "1"],
["col.X.long.1:XX.B", "col.X.long.2:XX.B", "2"],
["col.X.local.5:XX.B", "col.X.local.4:XX.B", "3"],
["XW.X:XX.B", "col.X.local.1:XX.B", "4"],
["WX.X:XX.B", "col.X.local.3:XX.B", "!5"],
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

