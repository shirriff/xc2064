""" Generate nice formulas for all Boolean functions of three variables."""

import re

BITS = 3
ROWS = 2 ** BITS
ENTRIES = 2 ** ROWS

def atom(tree):
  return len(tree) == 1 or tree[0] == '~'

def parens(s):
  return '(' + s + ')'

def prettyprint(tree):
  if len(tree) == 1:
    return tree[0]
  s1 = prettyprint(tree[1])
  if tree[0] == '~':
    if not atom(tree[1]):
      s1 = parens(s1)
    return '~' + s1
  else:
    s2 = prettyprint(tree[2])
    if not atom(tree[1]) and tree[1][0] != tree[0]:
      s1 = parens(s1)
    if not atom(tree[2]) and tree[2][0] != tree[0]:
      s2 = parens(s2)
    return s1 + ' ' + tree[0] + ' ' + s2

forms = [None] * ENTRIES

def validate(s):
  s = s.replace('@', '^').replace('+', 'or').replace('~', 'not ').replace('*', 'and')

  result = 0
  for A in [0, 1]:
    for B in [0, 1]:
      for C in [0, 1]:
        if eval(s):
	  result += 2 ** (A + 2*B + 4*C)
  return result
	  

# Entry = [tree, alpha, length]
def main():
  newentries = set()
  forms[0] = ['0', '0', 1]
  newentries.add(0)
  forms[ENTRIES-1] = ['1', '1', 1]
  newentries.add(ENTRIES-1)
  for var in range(0, BITS):
    mask = 0
    for i in range(0, ROWS):
      if i & (2 ** var):
        mask |= 2 ** i
    var = chr(ord('A') + var)
    forms[mask] = [var, var, 1]
    newentries.add(mask)


  liveentries = set(newentries)

  count = 0
  while newentries:
    count += 1
    print count, len(liveentries)
    if count == 10: break
    currententries = newentries
    liveentries = liveentries.union(newentries)
    newentries = set()

    # Handle NOT
    for i in currententries:
      newval = (ENTRIES-1) ^ i
      if not forms[newval] or forms[newval][2] > forms[i][2]:
	forms[newval] = [['~', forms[i][0]], forms[i][1], forms[i][2] + .5]
	newentries.add(newval)

    # Handle logic
    for i in currententries:
      if not forms[i]: continue
      for j in liveentries:
        if not forms[j]: continue
	newlen = forms[i][2] + forms[j][2]
	# Switch for alphabetical order of terms
	if forms[i][1] < forms[j][1]:
	  first = i
	  second = j
	else:
	  first = j
	  second = i
	newname = forms[first][1] + forms[second][1]
	andval = i & j
	def maybeUpdate(n, newtree, newname, newlen):
	  if not forms[n] or forms[n][2] > newlen or (forms[n][2] == newlen and forms[n][1] > newname):
	    forms[n] = [newtree, newname, newlen]
	    newentries.add(n)

	maybeUpdate(i & j, ['*', forms[first][0], forms[second][0]], newname, newlen)
	maybeUpdate(i | j, ['+', forms[first][0], forms[second][0]], newname, newlen)
	maybeUpdate(i ^ j, ['@', forms[first][0], forms[second][0]], newname, newlen)


  with open('formula3.txt', 'w') as out:
    for i in range(0, ENTRIES):
      pp = prettyprint(forms[i][0])

      if validate(pp) != i:
	print '****', i, pp, validate(pp),
	exit(-1)
      print >>out, pp

if __name__ == "__main__":
    main()
