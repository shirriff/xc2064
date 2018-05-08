""" Formats an RBT file."""

import re
import sys

def fmt(fname):
  buf = {}
  with open(fname) as f:
    cnt = 0
    for line in f.readlines():
      m = re.match('0([01]{71})111', line)
      if m:
        buf[cnt] = m.group(1)[::-1] # Reverse each line
	# Flip 1's and 0's
	buf[cnt] = ''.join(['1' if x == '0' else '0' for x in buf[cnt]])
	cnt += 1
    assert(cnt == 160)


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
  ylinecount = 0
  yregioncount = 0
  for y in range(0, 160):
    ylinecount += 1
    if y in ybreaks:
      ylinecount = 1
      yregioncount += 1
      print
      if labels[yregioncount]:
        print '     A%c       B%c       C%c         D%c       E%c       F%c         G%c       H%c' % tuple([labels[yregioncount]]*8)

    print '%2d ' % ylinecount,
    for x in range(0, 71):
      if x in xbreaks: sys.stdout.write(' ')
      sys.stdout.write(buf[y][x])

    print
      


def main():
  if len(sys.argv) != 2:
    exit("Usage: python fmtrbt.py FOO.RBT")
  fmt(sys.argv[1])

if __name__ == "__main__":
  main()
