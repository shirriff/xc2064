""" Processes an RBT file.

The file format is somewhat described in the datsheet page 2-72.
The first line of bits is dummy 1's, 4-bit preamble (0010), 24-bit length count, dummy 1's
This is followed by 160 (196 on XC2018) frame lines, each with 71 (87) data bits.
Each frame line starts with 0, has the data bits, and ends with 111.
The file ends with a line of dummy 1's.

Once you strip out the data bits, the 160x71 (196x87) grid of bits exactly maps onto the
chip's SRAM bits. Thus, the data format is defined by the chip layout, rather than
by rational data structures.

Inconveniently, the RBT file, the documentation and the die photos have different orientations.
In the documentation, CLB cells are arranged with labels:
  AA .. AH
  ..     ..
  HA .. HH

In the RBT file, cells are flipped around a diagonal:
  HH .. AH
  ..    ..
  HA .. AA

In the siliconPr0n die photos (with XILINX logo upright in lower right), cells are arranged:
  AH .. HH
  ..    .. 
  AA .. HA
I.e. the die photos are rotated 90 degrees counter-clockwise compared to the documentation.
The die photos are flipped horizontally with respect to the RBT file.

Each CLB is defined by an 18x8 matrix of cells. (18 rows and 8 columns in the RBT file and die photos.) and The XC2064 has an 8x8 grid of CLBs,
while the XC2018 has a 10x10 grid.

Four buffer lines run through the chip, dividing it up like a tic-tac-toe board.
Due to this, the offsets of CLBs are not uniform.

Bits in the RBT file are active-low. That is, a 0 bit in the file turns on the
corresponding switch / function. Presumably there is inversion somewhere in the chip.

Note: the bit count numbers don't add up because of "extra" dummy bits.
For instance, the data configuration is 160*71 = 11360 bits.
The documentation says the configuration requires 12038 bits, which includes the extra
dummy / padding bits.
However, counting the bits required by the documentation yields a minimum of 12040 bits.
The length field in the RBT file says 12045 bits, while the file contains 12048 bits.
None of this really matters, but just don't expect the numbers to match.
"""

import re
import sys

# Buffer of bit data
buf = {}
formulas3 = {}
formulas4 = {}


# Field number to start each block.
# E.g.  buf[yidx['A']] is start of blocks xA
# These are separated by 18 except when interrupted by buffers.
yidx = {'io1':0, 'H':9, 'G':27, 'buf1': 45, 'F': 47, 'E': 65, 'D': 83, 'buf2': 101, 'C': 103, 'B': 121, 'A': 139, 'io2': 157}

# Bit index into row to start each block.
# E.g.  buf[..][xidx['A']] is start of blocks Ax
# These are separated by 8 except when interrupted by buffers.
xidx = {'io1':0, 'H':4, 'G': 12, 'buf1': 20, 'F': 21, 'E': 29, 'D': 37, 'buf2': 45, 'C': 46, 'B': 54, 'A': 62, 'io2': 70}

# The coordinate system we'll use in this file is:
#  buf[y] = row (configuration frame) y.
#  buf[y][x] = data bit x of row y
# I.e. buf holds the bits from the RBT file, with padding stripped off.

class Reverse:
  def __init__(self):
    self.initFormulas()
    self.initIndices()

  def initFormulas(self):
    global formulas3, formulas4
    with open('formula3.txt') as f:
      self.formulas3 = map(lambda x: x.strip(), f.readlines())
    with open('formula4.txt') as f:
      self.formulas4 = map(lambda x: x.strip(), f.readlines())

  def readFile(self, fname):
    with open(fname) as f:
      cnt = 0
      for line in f.readlines():
	m = re.match('0([01]{71})111', line)
	if m:
	  buf[cnt] = m.group(1)
	  cnt += 1
      assert(cnt == 160)


  def initIndices(self):
    # Put a space before the break index
    ybreaks = [9]
    for i in range(0, 10):
      ybreaks.append(ybreaks[-1] + 18)
      if i == 1 or i == 4: ybreaks.append(ybreaks[-1] + 2)
    xbreaks = [1]
    for i in range(0, 10):
      xbreaks.append(xbreaks[-1] + 8)
      if i == 2 or i == 5: xbreaks.append(xbreaks[-1] + 1)

    labels = ['', 'H', 'G', '', 'F', 'E', 'D', '', 'C', 'B', 'A', '']
    
  def fmt(self):
    for label1 in 'ABCDEFGH':
      for label2 in 'ABCDEFGH':
	self.processClb(label1 + label2)
	
  def truthTableToIndex(self, table):
    """ Convert a truth table into a single index value.
    E.g. if the truth table is:
      0
      1
      0
      1
    return 2**1 + 2**3   since entries 1 and 3 are set.
    """
    total = 0
    for i in range(0, len(table)):
      if table[i]:
	total += 2**i
    return total

  def getFormula(self, table, vars):
    """ Returns a semi-optimized formula on 3 or 4 variables.
      Inputs:
        table: 2**3 or 2**4 entries forming the truth table.
	vars: 3 or 4 variable names (list of strings). The first variable should be the
	  least-significant in the truth table.
    """

    if len(table) == 8:
      return (self.formulas3[self.truthTableToIndex(table)].lower().replace('a', vars[0])
	  .replace('b', vars[1]).replace('c', vars[2])).replace(' ', '')
    elif len(table) == 16:
      return (self.formulas4[self.truthTableToIndex(table)].lower().replace('a', vars[0])
	  .replace('b', vars[1]).replace('c', vars[2]).replace('d', vars[3])).replace(' ', '')
    else:
      sys.exit("Bad table for getFormula")

  def isDefault(self, name):
    xlabel, ylabel = list(name)
    x0 = xidx[xlabel]
    y0 = yidx[ylabel]
    for yoff in range(0, 18):
      for xoff in range(0, 8):
        if (yoff == 8 and xoff in [0, 2]) or (xoff == 2 and yoff == 15):
	  if buf[y0 + yoff][x0 + xoff] == '1':
	    return False
	else:
	  if buf[y0 + yoff][x0 + xoff] == '0':
	    return False
    return True


  def processClb(self, name):
    """ Process a CLB with a name such as AB. 
    See the notes at the top of the file for how names map to physical locations.
    """
    result = []
    xlabel, ylabel = list(name)
    result.append('Editblk %s' % name)
    x0 = xidx[xlabel]
    y0 = yidx[ylabel]

    def active(xoff, yoff):
      return 1 if buf[y0 + yoff][x0 + xoff] == '0' else 0

    def mux2(a, a0, a1):
      """ Return one of the two arguments depending on the value of a."""
      return a1 if a else a0

    def mux3(a, b, a0b0, a1b0, a0b1):
      """ Return one of the four arguments depending on the values of a and b.
      Raise an error if both select lines set.
      """
      assert not a or not b
      return [a0b0, a0b1, a1b0][a * 2 +  b]

    def mux4(a, b, a0b0, a1b0, a0b1, a1b1):
      """ Return one of the four arguments depending on the values of a and b.
      """
      return [a0b0, a0b1, a1b0, a1b1][a * 2 +  b]
    # Truth table for G
    gtab = [active(0, 1),
	    active(0, 0),
	    active(0, 2),
	    active(0, 3),
	    active(0, 5),
	    active(0, 4),
	    active(0, 6),
	    active(0, 7) 
	    ]
    # Truth table for F
    ftab = [active(0, 16),
	    active(0, 17),
	    active(0, 15),
	    active(0, 14),
	    active(0, 12),
	    active(0, 13),
	    active(0, 11),
	    active(0, 10) 
	    ]

    fmux = [mux2(active(1, 10), 'B', 'A'), mux2(active(1, 11), 'C', 'B'),
        mux3(active(1, 16), active(1, 17), 'Q', 'C', 'D')]
    gmux = [mux2(active(1, 6), 'B', 'A'), mux2(active(1, 5), 'C', 'B'),
        mux3(active(1, 1), active(1, 0), 'Q', 'C', 'D')]

    if active(0, 8):
      # FG: two functions of three variables
      base = 'FG'
    else:
      if fmux == gmux:
	# F: One four-variable function
	base = 'F'
	print 'F because', fmux, gmux
      else:
	# FGM: two three-variable functions multiplexed
	base = 'FGM'
	print 'FGM because', fmux, gmux
    result.append('Base %s' % base)
    equate = []
    if base == 'FG' or base == 'FGM':
      # Get equations, substituting variables according to multiplexers
      equationf = self.getFormula(ftab, fmux)
      equationg = self.getFormula(gtab, gmux)
      if equationf != '0':
	equate.append('Equate F = %s' % equationf)
      if equationg != '0':
	equate.append('Equate G = %s' % equationg)
    else:
      # Combine two truth tables
      gtab.extend(ftab)
      ftab = gtab
      fmux.append('B')
      # Get equation, substituting variables according to multiplexers
      equation = self.getFormula(ftab, fmux)
      print 'F', ftab, fmux, equation
      equate.append('Equate F = %s' % equation)


    config = 'Config X:'+ mux3(active(2, 7), active(2, 6), 'Q', 'F', 'G')

    config += ' Y:' + mux3(active(2, 4), active(2, 5), 'Q', 'F', 'G')

    def getValidEntries(entries, equation):
      """ Filter out entries that do not appear in equation or are duplicates."""
      result = []
      for i in range(0, len(entries)):
        if entries[i] in equation and entries[i] not in entries[:i]:
	  result.append(entries[i])
      return result

    if base == 'F':
      # Need to move B from end to second entry in variable list
      config += ' F:' + ':'.join(getValidEntries([fmux[0], fmux[3], fmux[1], fmux[2]], equation))
    else:
      config += ' F:'+ ':'.join(getValidEntries(fmux, equationf))
      config += ' G:'+ ':'.join(getValidEntries(gmux, equationg))

    config += ' Q:' + mux2(active(2, 8), 'FF', 'LATCH')

    config += ' SET:' + mux3(active(2, 14), active(2, 15), 'A', 'F', '')

    config += ' RES:' + mux4(active(2, 16), active(2, 17), '', 'D', 'undef', 'G')

    def k1(): return active(3, 14)
    def k2(): return active(3, 15)
    config += ' CLK:'
    if k1() or k2():
      config += 'K' # K used if k1 or k2 are routed
    elif active(3, 11): # enabled
      if active(3, 13):
        config += 'C'
      else:
        config += 'G'
      print 'NOT: %d, LATCH: %d' % (active(2, 8), active(3, 12))
      # Inconveniently, the NOT action is reversed for LATCH vs FF and input C
      if 1 ^ active(3, 12) ^ active(2, 8) ^ active(3, 13):
	config += ':NOT'

    result.append(config)

    result.extend(equate)

    result.append('Endblk')
    return result




def main():
  if len(sys.argv) != 2:
    exit("Usage: python fmtrbt.py FOO.RBT")
  initFormulas()
  fmt(sys.argv[1])

if __name__ == "__main__":
  main()
