  /**
   * Displays the bitstream data.
   */
  function drawBitstream(ctx, bitstream) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (bitstream == null) {
      return;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
    var SIZE = 8; // Each digit is a SIZE x SIZE block.
    const HEIGHT = SIZE * 71 + 3;
    const WIDTH = SIZE * 160 + 3;
    ctx.canvas.height = HEIGHT;
    ctx.canvas.width = WIDTH;
    $("#container").css('height', HEIGHT + 'px');
    $("#container").css('width', WIDTH + 'px');
    $("#info").css('margin-left', WIDTH + 'px');
    $("#info3").css('margin-left', '0px');
    $("#info3").css('clear', 'both');

    // Draw labels
    ctx.font = "45pt arial";
    ctx.fillStyle = "#ddf";
    var xpos = 3; // 3 bits to first cell.
    ctx.strokeStyle = "#ccc";
    ctx.beginPath();
    ctx.rect(0, 0, 160 * SIZE, 71 * SIZE);
    ctx.stroke();
    ctx.strokeStyle = "#fbb";
    ctx.beginPath();
    for (var x = 0; x < 8; x++) {
      if (x == 3 || x == 6) {
        xpos += 2; // Skip buffer
      }
      var ypos = 1; // 1 bit to first cell
      for (var y = 0; y < 8; y++) {
        if (y == 3 || y == 6) {
          ypos += 1; // Skip buffer
        }
        fillText(ctx, "ABCDEFGH"[y] + "ABCDEFGH"[x], 30 + xpos * SIZE, 52 + ypos * SIZE);
        ctx.rect(xpos * SIZE, ypos * SIZE, 18 * SIZE, 8 * SIZE);
        ypos += 8; // 8 bits per tile
      }
      xpos += 18; // 18 bits per tile
    }
    ctx.stroke();

    // Draw data
    $("#img").css('opacity', 0);
    ctx.font = "9px arial";
    ctx.fillStyle = "black";
    for (var x = 0; x < 160; x++) {
      for (var y = 0; y < 71; y++) {
        if (getDefaultBit(x, y) == bitstream[x][y]) {
          ctx.fillStyle = '#ccc';
          fillText(ctx, bitstream[x][y] == 0 ? ' ' : '1', 1 + x * SIZE, 7 + y * SIZE);
        } else {
          ctx.fillStyle = 'black';
          fillText(ctx, bitstream[x][y], 1 + x * SIZE, 7 + y * SIZE);
        }
      }
    }
  }

  // Processes a click on the bitstream image
  function bitstreamClick(x, y) {
    if (bitstream == null) {
      return;
    }
    var xn = x / 8; // Convert to bit indices
    var yn = y / 8;
    var xinfo = findTileX(xn);
    var yinfo = findTileY(yn);
    if (xinfo[2] >= 0 && yinfo[2] >= 0) {
      $("#info3").html(tiles[xinfo[2]][yinfo[2]].decode(bitstream));
    } else {
      $("#info3").html(x + ' ' + y + ' ' + xinfo + ' ' + yinfo);
    }
  }

// Default bitstream for an empty configuration, encoded as 32-bit ints for compactness
const empty = [[2743085280, 3758263808, 10715176, 685769358, 41856, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [1082134562, 536936960, 4227088, 270532866, 16512, 0], [0, 0, 0, 0, 0, 0], [1073745922, 65536, 4194320, 268435712, 671105024, 0], [1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [2, 0, 0, 0, 0, 0], [1082134562, 536936960, 4227088, 270532866, 16512, 0], [0, 0, 0, 0, 3221225472, 0], [1073745922, 65536, 4194320, 268435712, 671105024, 0], [1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [2, 0, 0, 0, 0, 0], [1082134562, 536936960, 4227088, 270532866, 16512, 0], [0, 0, 0, 0, 3221225472, 0], [1073745922, 65536, 4194320, 268435712, 671105024, 0], [0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [2, 0, 0, 0, 0, 0], [1082134562, 536936960, 4227088, 270532866, 16512, 0], [0, 0, 0, 0, 3221225472, 0], [1073745922, 65536, 4194320, 268435712, 671105024, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [1082134562, 536936960, 4227088, 270532866, 16512, 0], [0, 0, 0, 0, 0, 0], [1073745922, 65536, 4194320, 268435712, 671105024, 0], [1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [2, 0, 0, 0, 0, 0], [1082134562, 536936960, 4227088, 270532866, 16512, 0], [0, 0, 0, 0, 3221225472, 0], [1073745922, 65536, 4194320, 268435712, 671105024, 0], [0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [2, 0, 0, 0, 0, 0], [1082134562, 536936960, 4227088, 270532866, 16512, 0], [0, 0, 0, 0, 3221225472, 0], [1073745922, 65536, 4194320, 268435712, 671105024, 0], [1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [2, 0, 0, 0, 0, 0], [1082134560, 536936960, 4227088, 270532866, 16512, 0], [0, 0, 0, 0, 3221225472, 0], [1073745920, 65536, 4194320, 268435712, 16384, 0], [0, 0, 0, 0, 2147483648, 0], [0, 0, 0, 0, 1073741824, 0], [0, 0, 0, 0, 0, 0], [2743085286, 3758263808, 10715176, 685769358, 41856, 0]];

function getDefaultBit(x, y) {
  return (empty[y][Math.floor(x / 32)] & (1 << (x % 32))) ? 1 : 0;
}
