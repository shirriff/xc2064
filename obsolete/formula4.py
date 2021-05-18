# Generate logic expressions for all 64K boolean functions of four variables A, B, C, D
# The idea is to start with simple expressions, then take all combinations of these to
# generate new expressions, then all combinations of the new expressions, etc. until
# everything has been generated.
#
# Formulas are built up as trees, e.g. ['+', 'A', 'B'] is "A or B"
#
# Tricky things:
#  Optimize formulas for shortest formula.
#  Put the variables in order if possible, e.g. A + B + C rather than C + A + B
#  Pretty-print the formula output.
#  XOR is a primitive
#  With 4 variables, the algorithm time blows up around step 5, checking 30K expressions agains 30K expressions, so there is a bit of trimming. This gets runtime down to about 30 sec.
#
# Entries are stored as [tree, the variables in order (for sorting), length of tree (to pick shortest)]

import re

BITS = 4
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
  s = re.sub('not ([^(])', r'(not \1)', s)

  result = 0
  for A in [0, 1]:
    for B in [0, 1]:
      for C in [0, 1]:
       for D in [0, 1]:
        if eval(s):
	  result += 2 ** (A + 2*B + 4*C + 8*D)
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
    #for i in newentries:
    #  print i, prettyprint(forms[i][0])
    count += 1
    currententries = newentries
    liveentries = liveentries.union(newentries)
    print count, len(liveentries), len(newentries)
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
      if count >= 4 and forms[i][2] >= 4: continue
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

  print 'final len', len(liveentries)
  with open('formula4.txt', 'w') as out:
    for i in range(0, ENTRIES):
      try:
        pp = prettyprint(forms[i][0])

        if validate(pp) != i:
	  print '****', i, pp, validate(pp),
	  exit(-1)
      except SyntaxError:
        print 'Parse problem', forms[i][0]
      print >>out, pp

if __name__ == "__main__":
    main()
