

// Configuration data
const config = new Array(160*71);
// Raw bitstream, sequence of 160*71 0/1 values
let rawBitstream = new Array(160*71);
// Bitstream in table format, matching die layout
var bitstreamTable = null;

/**
 * Parse configuration file
 * Store in array config, where config[n] = type and n = bit position
 */
function loadConfig(callback) {
  let defs = new Array(160);
  window.defs = defs;
  for (let x = 0; x < 160; x++) {
    defs[x] = new Array(71);
  }
  $.get('XC2064-def.txt', function(data) {
    const lines = data.match(/[^\r\n]+/g);
    lines.forEach(function(l) {
      const m = l.match(/Bit:\s+(\S+)\s+(.*)/);
      if (m) {
        const addr = parseInt(m[1], 16);
        const val = m[2];
        config[addr] =val;
      }
    });
    // Done, call callback to continue initialization
    callback();
  }, 'text');
}


/**
 * Handles the upload of a .RBT file, storing it into the variable rawBitstream, which has 160 lines of 71 '0'/'1' characters,
 * the contents of the .RBT file.
 */
function rbtParse(contents) {
  rawBitstream = parseRbtFile(contents);
  bitstreamTable = makeBitstreamTable(rawBitstream);
}

/**
 * Splits the RBT file into lines, removing headers.
 * erturns rawBitstream
 */
function parseRbtFile(contents) {
  let lines = contents.split(/[\r\n]+/);
  let mode = 'header';
  let idx = 0; // Index into rawBitstream
  for (let i = 0; i < lines.length; i++) {
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
        for (let i = 0; i < 71; i++) {
          rawBitstream[idx++] = data[i] == '1' ? 1 : 0;
        }
      } else {
        alert('Bad data line in .RBT file');
        return;
      }
    }
  }
  if (idx != 160 * 71) {
    alert('Wrong number of bits ' + idx + ' in .RBT file');
    return;
  }
  return rawBitstream;
}

/**
 * The RBT file is organized:
 * HH ... AH
 * .       .
 * HA ... AA
 * stored as rbtLines[line][char] of '0' and '1'.
 *
 * The die is organized:
 * AA ... AH
 * .       .
 * HA ... HH
 * This function flips the rbtLines to match the die, stored as bitstreamTable[x][y].
 * bitstreamTable also holds ints (not chars) and is inverted with respect to the bitstreamTable, so 1 is active.
 * I'm using the term "bitstreamTable" to describe the bitstreamTable with the die's layout and "rbtLines" to describe the bitstreamTable
 * with the .RBT file's layout.
 */
function makeBitstreamTable(rawBitstream) {
  var bitstreamTable = new Array(160);
  for (var x = 0; x < 160; x++) {
    bitstreamTable[x] = new Array(71);
    for (var y = 0; y < 71; y++) {
      bitstreamTable[x][y] = rawBitstream[(159 - x) * 71 + (70 - y)];
      
    }
  }
  return bitstreamTable;
}


let bitTypes;
function decode(rawBitstream, config) {
  bitTypes = new Array(160 * 71);
  decoders.forEach(d => d.startDecode());
  for (let i = 0; i < 160 * 71; i++) {
    let entry = config[i];
    if (entry == undefined || entry == "----- NOT USED -----") continue;
    let m = entry.match(/IOB (P\d+)(.*)/);
    if (m) {
      bitTypes[i] = BITTYPE.iob;
      iobDecoders.getFromPin(m[1]).add(m[2], rawBitstream[i]);
      continue;
    }
    m = entry.match(/PIP\s+(.*)/);
    if (m) {
      bitTypes[i] = BITTYPE.pip;
      pipDecoder.add(m[1], rawBitstream[i]);
      continue;
    }
    m = entry.match(/Bidi\s+(.*)/);
    if (m) {
      bitTypes[i] = BITTYPE.bidi;
      bidiDecoder.add(m[1], rawBitstream[i]);
      continue;
    }
    m = entry.match(/Magic @ (\S+) (\d) (\d)$/);
    if (m) {
      bitTypes[i] = BITTYPE.switch;
      switchDecoders.getFromG(m[1]).add(parseInt(m[2]), parseInt(m[3]), rawBitstream[i]);
      continue;
    }
    m = entry.match(/CLB ([A-H][A-H])\s*(.*)/);
    if (m) {
      bitTypes[i] = BITTYPE.clb;
      clbDecoders.get(m[1]).add(m[2], rawBitstream[i]);
      continue;
    }
    m = entry.match(/CLB (CLK.[AI][AI].I)\s*(.*)/);
    if (m) {
      bitTypes[i] = BITTYPE.clb;
      clbDecoders.get(m[1]).add(m[2], rawBitstream[i]);
      continue;
    }
    m = entry.match(/Other (.*)/);
    if (m) {
      bitTypes[i] = BITTYPE.other;
      otherDecoder.add(m[1], rawBitstream[i]);
      continue;
    }
    console.log('UNKNOWN:', entry);
  }
}

var iobDecoders;
var pipDecoder;
var clbDecoders;
var otherDecoder;
var switchDecoders;
var bidiDecoder;
let decoders = [];
function initDecoders() {
  iobDecoders = new IobDecoders();
  pipDecoder = new PipDecoder();
  bidiDecoder = new BidiDecoder();
  otherDecoder = new OtherDecoder();
  clbDecoders = new ClbDecoders;
  switchDecoders = new SwitchDecoders();
  decoders = [iobDecoders, pipDecoder, bidiDecoder, otherDecoder, clbDecoders, switchDecoders];
  decoders.forEach(d => d.startDecode());
}

class ClkDecoder {
  constructor(name) {
    this.name = name;
  }

  startDecode() {
  }

  add(str) {
  }

  render(ctx) {
  }
}

class IobDecoders {
  constructor() {
    this.iobs = {};
    this.iobsFromPin = {};
    const self = this;
    pads.forEach(function([pin, tile, style, pad]) {
      const iob = new Iob(pin, tile, style, pad);
      self.iobs[pad] = iob;
      self.iobsFromPin[pin] = iob;
    });
  }

  startDecode() {
    const self = this;
    pads.forEach(function([pin, tile, style, pad]) {
      self.iobs[pad].startDecode();
    });
  }

  getFromPin(pin) {
    return this.iobsFromPin[pin];
  }

  getFromXY(x, y) {
    for (const iob of Object.entries(this.iobs)) {
      if (iob[1].isInside(x, y)) {
        return iob[1];
      }
    }
    return undefined;
  }

  render(ctx) {
    Object.entries(this.iobs).forEach(([name, obj]) => obj.draw(ctx));
  }
}
IobDecoders.gToName = {};
IobDecoders.nameToG = {};

class PipDecoder {
  constructor() {
    this.entries = {};
  }

  startDecode() {
    this.entries = {};
  }

  add(str, bit) {
    this.entries[str] = bit;
  }

  // Is it better to separate the parsing code and the rendering code
  // or to fold it into one class?
  // For now, separate functions, but called from inside the class.
  render(ctx) {
    pipRender(ctx, this.entries);
  }
}

class BidiDecoder {
  constructor() {
    this.entries = {};
  }

  startDecode() {
    this.entries = {};
  }

  add(str, bit) {
    this.entries[str] = bit;
  }

  render(ctx) {
  }
}

class SwitchDecoders {
  constructor() {
    this.switches = {};
    this.switchesFromG = {};
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if ((i == 0) && (j == 0 || j == 8)) continue; // Top corners
        if ((i == 8) && (j == 0 || j == 8)) continue; // Bottom corners
        for (let num = 1; num <= 2; num++) {
          const name = "ABCDEFGHI"[i] + "ABCDEFGHI"[j] + ".8." + num;
          const sw = new Switch(name);
          this.switches[name] = sw;
          this.switchesFromG[sw.gPt[0] + "G" + sw.gPt[1]] = sw;
        }
      }
    }
  }

  startDecode() {
    Object.entries(this.switches).forEach(([k, s]) => s.startDecode());
  }

  getFromG(name) {
    return this.switchesFromG[name];
  }

  get(name) {
    return this.switches[name];
  }

  render(ctx) {
    Object.entries(this.switches).forEach(([name, obj]) => obj.render(ctx));
  }

}


class ClbDecoders {
  constructor() {
    this.clbDecoders = {};
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let name = "ABCDEFGH"[i] + "ABCDEFGH"[j];
        this.clbDecoders[name] = new ClbDecoder(name);
      }
    }
    // These are in the config as CLBs.
    this.clbDecoders["CLK.AA.I"] = new ClkDecoder("CLK.AA.I");
    this.clbDecoders["CLK.II.I"] = new ClkDecoder("CLK.II.I");
  }

  startDecode() {
    Object.entries(this.clbDecoders).forEach(([k, c]) => c.startDecode());
  }

  get(name) {
    return this.clbDecoders[name];
  }

  render(ctx) {
    Object.entries(this.clbDecoders).forEach(([name, obj]) => obj.render(ctx));
  }
}

const muxB = [
["col.X.local.2:XX.B", "CLK.AA.O:XX.B", "1"],
["col.X.long.1:XX.B", "col.X.long.2:XX.B", "2"],
["col.X.local.5:XX.B", "col.X.local.4:XX.B", "3"],
["XW.X:XX.B", "col.X.local.1:XX.B", "4"],
["WX.X:XX.B", "col.X.local.3:XX.B", "!5"],
"0"];

// This implements a mux tree. The XC2064 uses a mux to select
// Controls: MuxBit: 0-N
// Input: [["pip0", "pip1", "0"], ["pip2", "pip3", "!1"], ["pip4", "pip5", "2"]], "3"
// The idea is that MuxBit 0 selects pip0 and pip1, MuxBit 1 low selects pip2 and pip3. Muxbit 3 selects the first (low) or second (high)
// of the selected pair.
// Output: list of Pips with correct one activated
class Mux {
  constructor(config) {
    this.selector = config.pop();
    this.inputs = config;
  }

  startDecode() {
    this.data = {};
    this.pips = [];
    this.selected = "";
  }

  add(bitnum, bit) {
    this.data[bitnum] = bit;
    this.data["!" + bitnum] = 1 - bit; // Inverted bit
  }

  decode() {
    this.pips = {};
    const self = this;
    this.inputs.forEach(function([entry0, entry1, muxbit]) {
      if (self.data[muxbit] == 0) { // This group of two is selected, active low.
        if (self.data[self.selector]) { // Select between the two
          // entry1 is active;
          self.pips[entry0] = 1;
          self.pips[entry1] = 0; // Active-low
          self.selected = entry1;
        } else {
          // entry0 is active
          self.pips[entry0] = 0; // Active-low
          self.pips[entry1] = 1;
          self.selected = entry0;
        }
      } else {
        // Neither is active
        self.pips[entry0] = 1;
        self.pips[entry1] = 1;
      }
    });
  }

  render(ctx) {
    pipRender(ctx, this.pips);
  }

  info() {
    return "Mux " + this.selected;
  }
}

  /**
   * Converts a symbolic name to G coordinates.
   */
  function nameToG(str) {
    if (str.includes("PAD")) {
      return IobDecoders.nameToG[str];
    }
    const m = str.match(/([A-I][A-I])\.8\.(\d)\.(\d)$/);
    if (str.match(/([A-I][A-I])\.8\.(\d)\.(\d)$/)) {
      return getSwitchCoords(str)[0];
    }
    const parts = str.split(':');
    const col = colInfo[parts[0]];
    const row = rowInfo[parts[1]];
    if (col == undefined || row == undefined) {
      console.log("Couldn't convert name", str);
      return;
    }
    return col[0] + "G" + row[0];
  }

  /**
   * Converts G coordinates to a symbolic name.
   */
  function gToName(str) {
    if (IobDecoders.gToName[str]) {
      return IobDecoders.gToName[str];
    }
    const parts = str.split('G');
    const col = colFromG[parts[0]];
    const row = rowFromG[parts[1]];
    if (col == undefined || row == undefined) {
      console.log("Couldn't convert name", str);
      return;
    }
    return col + ":" + row;
  }

  /**
   * Fills in the blanks in a mux entry.
   * The current tile is represented as XX so the tile to the left is XW and the tile above is WX.
   */
  function fillInMuxEntries(name, inputs) {
    const result = [];
    const col = 'col.' + name[0];
    const row = 'row.' + name[1];
    const xx = name;
    const xw = name[0] + String.fromCharCode(name.charCodeAt(1) - 1);
    const wx = String.fromCharCode(name.charCodeAt(0) - 1) + name[1];
    // Substitute one string.
    function fill(str) {
      // The string with the XX replaced by the current tile name
      return str.replace('col.X', col).replace('row.X', row).replace('XX', xx).replace('XW', xw).replace('WX', wx);
    }
    for (let i = 0; i < inputs.length - 1; i++) {
      result.push([nameToG(fill(inputs[i][0])), nameToG(fill(inputs[i][1])), inputs[i][2]]);
    }
    result.push(inputs[inputs.length - 1]); // Last entry is a bitNum, not wires.
    return result;
  }

class ClbDecoder {
  constructor(name) {
    this.name = name;
    this.muxs = {};
    this.muxs['B'] = new Mux(fillInMuxEntries(this.name, muxB));
    let xCenter = colInfo['col.' + this.name[1] + '.clb'][1];
    let yCenter = rowInfo['row.' + this.name[0] + '.c'][1];
    this.W = 20;
    this.H = 32;
    this.screenPt = [xCenter - this.W / 2, yCenter - this.H / 2 - 1];
  }

  startDecode() {
    Object.entries(this.muxs).forEach(([k, m]) => m.startDecode());
  }

  add(str, bit) {
    const m = str.match(/\.([A-H]) MuxBit: (\d)/);
    if (m) {
      if (this.muxs[m[1]]) {
        this.muxs[m[1]].add(m[2], bit);
      } else {
        console.log('Need to create mux', m[1]);
      }
    }
  }

  // Decoded the received data
  decode() {
    Object.entries(this.muxs).forEach(([name, mux]) => mux.decode());
  }

  render(ctx) {
    Object.entries(this.muxs).forEach(([name, mux]) => mux.render(ctx));
    ctx.strokeStyle = "#cff";
    ctx.rect(this.screenPt[0], this.screenPt[1], this.W, this.H);
    ctx.stroke();
  }

  info() {
    let result = [];
    Object.entries(this.muxs).forEach(([name, mux]) => result.push(mux.info()));
    return "CLB: " + this.name + " " + result.join(" ");
  }

  isInside(x, y) {
    if (this.name[0] == "I" || this.name[1] == "I") {
      return false;
    }
    return x >= this.screenPt[0] && x < this.screenPt[0] + this.W && y >= this.screenPt[1] && y < this.screenPt[1] + this.H;
  }
}


class OtherDecoder {
  constructor() {
  }

  startDecode() {
    this.entries = {};
  }

  add(str, bit) {
    this.entries[str] = bit;
  }

  render(ctx) {
  }
}


const BITTYPE = Object.freeze({lut: 1, clb: 2, pip: 3, mux: 4, switch: 5, iob: 6, other: 7});

  class XXXClbDecode {
    constructor(x, y, gPt, bitPt) {
      this.x = x;
      this.y = y;
      this.name = "ABCDEFGH"[y] + "ABCDEFGH"[x];
      this.gPt = gPt;
      this.bitPt = bitPt;
      this.configString = '';
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

  class PipDecode {
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
        alert('Out of bounds bitstreamTable index: ' + bitPt[0] + ',' + bitPt[1]);
      }
      this.state = 0;

    }

    decode(bitstreamTable) {
      if (this.bitPt[0] < 0) {
        this.state = -1;
      } else {
        this.state = bitstreamTable[this.bitPt[0]][this.bitPt[1]];
      }
    }

    /**
     * Returns the function of each (known) bit in the bitstreamTable.
     *
     * Format: [[x, y, type], ...]
     */
    getBitTypes() {
      return [[this.bitPt[0], this.bitPt[1], BITTYPE.pip]];
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

  class TileDecode {
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

    /**
     * Decode this tile from the bitstreamTable.
     * Returns string.
     */
    decode(bitstreamTable) {
      var result = ['tile info'];
      if (this.clb) {
        result.push(this.clb.decode(bitstreamTable));
      }
      if (this.switch1 != null) {
        result.push(this.switch1.decode(bitstreamTable));
        result.push(this.switch2.decode(bitstreamTable));
      }
      this.pips.forEach(pip => result.push(pip.decode(bitstreamTable)));
      this.pins.forEach(pin => result.push(pin.decode(bitstreamTable)));
      return result;
    }

    /**
     * Returns the function of each (known) bit in the bitstreamTable.
     *
     * Format: [[x, y, type], ...]
     */
    getBitTypes() {
      let result = [];
      if (this.clb) {
        result.push(...this.clb.getBitTypes(bitstreamTable));
      }
      if (this.switch1 != null) {
        result.push(...this.switch1.getBitTypes(bitstreamTable));
        result.push(...this.switch2.getBitTypes(bitstreamTable));
      }
      this.pips.forEach(pip => result.push(...pip.getBitTypes(bitstreamTable)));
      this.pins.forEach(pin => result.push(...pin.getBitTypes(bitstreamTable)));
      return result;
    }
  }

  /**
   * A switch matrix.
   * Coordinates: screenPt is the upper left corner of the box. gPt is the coordinate of pin 8.
   */
  class XXXSwitchDecode {
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

    isInside(x, y) {
      return x >= this.screenPt[0] && x < this.screenPt[0] + 8 && y >= this.screenPt[1] && y < this.screenPt[1] + 8;
    }

    // Helper to remove pins from switches along edges.
    skip(pin) {
      return ((this.tile.type == TILE.top && (pin == 0 || pin == 1)) || (this.tile.type == TILE.bottom && (pin == 4 || pin == 5)) ||
          (this.tile.type == TILE.left && (pin == 6 || pin == 7)) || (this.tile.type == TILE.right && (pin == 2 || pin == 3)));
    }

    decode(bitstreamTable) {

      // bits is a list of [[bitstreamTable x, bitstreamTable y], [pin 1, pin 2]], where the bitstreamTable coordinates are relative to the tile edge.
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
      const self = this;
      bits.forEach(function([[btX, btY], wire]) {
        if (bitstreamTable[self.tile.bitPt[0] + btX][self.tile.bitPt[1] + btY] == 1) {
          self.wires.push(wire);
        }
      });

      this.bitTypes = []
      bits.forEach(function([[btX, btY], wire]) {
        self.bitTypes.push([self.tile.bitPt[0] + btX, self.tile.bitPt[1] + btY, BITTYPE.switch]);
      });
    }

    /**
     * Returns the function of each (known) bit in the bitstreamTable.
     *
     * Format: [[x, y, type], ...]
     */
    getBitTypes() {
      return this.bitTypes;
    }

    info() {
      return "Switch " + this.state + " " + this.wires;
    }
  }


  /**
   * An I/O block.
   * Each I/O block is associated with its neighboring tile.
   * Some complications: I/O blocks are different on the top, bottom, left, and right.
   * There are typically two I/O blocks per tile, so the bits are different for these two. They are also drawn differently.
   * Tile AA has 3 I/O blocks. Tile EA has 1 I/O block; one is omitted.
   * 
   */
  class XXXIobDecode {
    constructor(name, tilename, x0, y0, style) {
      this.name = name;
      this.tilename = tilename;
      this.x0 = x0;
      this.y0 = y0;
      this.style = style;
    }

    // Returns screen position for e.g. 'local.1'
    colPos(s) {
      return colInfo['col.' + this.tilename[1] + '.' + s][1];
    }

    // Returns screen position for e.g. 'local.1'
    rowPos(s) {
      return rowInfo['row.' + this.tilename[0] + '.' + s][1];
    }

    decode(bitstreamTable) {
     // TODO
     return [];
    }

    /**
     * Returns the function of each (known) bit in the bitstreamTable.
     *
     * Format: [[x, y, type], ...]
     */
    getBitTypes() {
      return [];
    }

  }

  /*
  let objects = [];

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
  */

  function initParser() {
    initNames();
    initDecoders();
  }

  // Processes a click on the Layout image
  function layoutClick(x, y) {
    if (bitstreamTable == null) {
      // return;
    }
    x = Math.floor(x / SCALE);
    y = Math.floor(y / SCALE);
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
    $("#info2").html("&nbsp;");
    $("#info3").html(prefix + name + ' ' + x + ' ' + y + '; ' + tilex + ' ' + xmod + ', ' + tiley + ' ' + ymod);
    let sw = switchDecoders.get(name + ".8.1");
    if (sw && sw.isInside(x, y)) {
      $("#info2").html(sw.info());
      return;
    }
    sw = switchDecoders.get(name + ".8.2");
    if (sw && sw.isInside(x, y)) {
      $("#info2").html(sw.info());
      return;
    }
    let iob = iobDecoders.getFromXY(x, y);
    if (iob) {
      $("#info2").html(iob.info());
      return;
    }
    // inside clb
    const clb = clbDecoders.get(name);
    if (clb && clb.isInside(x, y)) {
      $("#info2").html(clb.info());
      return;
    }
  }

function layoutClickInfo(x, y) {
  x = Math.floor(x / SCALE);
  y = Math.floor(y / SCALE);
  let col;
  let row;
  let colv;
  let rowv;
  Object.entries(colInfo).forEach(function([k, v]) {
    if (Math.abs(v[1] - x) < 3) {
      col = k;
      colv = v;
    }
  });
  Object.entries(rowInfo).forEach(function([k, v]) {
    if (Math.abs(v[1] - y) < 3) {
      row = k;
      rowv = v;
    }
  });
  if (rowv == undefined || colv == undefined) {
    $("#info0").html("");
  } else {
    const gcoord = colv[0] + "G" + rowv[0];
    let pip = "";
    if (IobDecoders.gToName[gcoord]) {
      pip = IobDecoders.gToName[gcoord];
    }
    $("#info0").html(col + " " + row + " " + colv[0] + "G" + rowv[0] + "; " + colv[1] + "," + rowv[1] + " " + pip);
    console.log(col, row, colv[0] + "G" + rowv[0] + "; " + colv[1] + "," + rowv[1] + " " + pip);
  }
    let iob = iobDecoders.getFromXY(x, y);
    if (iob) {
      console.log(iob.info());
      return;
    }
}
