# Run tests with "python -m unittest discover"
import reverse

import os
import sys
import unittest

class ReverseTest(unittest.TestCase):
  def setUp(self):
    self.reverse = reverse.Reverse()
    self.reverse.initFormulas()

  def testTables(self):

    self.assertEqual(self.reverse.getFormula([0, 0, 0, 0, 0, 0, 0, 1], ['X', 'Y', 'Z']),
      "X*Y*Z")
    self.assertEqual(self.reverse.getFormula([0, 1, 1, 1, 0, 1, 1, 1], ['X', 'Y', 'Z']),
      "X+Y")
    self.assertEqual(self.reverse.getFormula([0, 1, 1, 0, 1, 0, 0, 1], ['X', 'Y', 'Z']),
      "X@Y@Z")

    self.assertEqual(self.reverse.getFormula([0, 1, 1, 0, 1, 0, 0, 1,  1, 1, 1, 1, 1, 1, 1, 1],
        ['W', 'X', 'Y', 'Z']),
	"(W@X@Y)+Z")

  def testDefault(self):
    self.assertTrue(self.reverse.isDefault('AG'))
    self.assertFalse(self.reverse.isDefault('BB'))

  def testClb(self):
    """ Tests processClb by running through all the entries in TEST1.RBT and
    verifying that the result matches TEST1.LCA.
    Note that this will work for most LCA entries, but not all. Some need to be carefully
    constructed since the LCA configuration is not unique. In particular, the same
    formula can be expressed in many ways, so the "right" expression must be used for
    the test to pass.
    """

    lcafilename = os.path.join(os.path.dirname(__file__), 'TEST1.LCA')
    rbtfilename = os.path.join(os.path.dirname(__file__), 'TEST1.RBT')
    self.reverse.readFile(rbtfilename)

    with open(lcafilename) as lca:
      name = None
      for line in lca.readlines():
	line = line.strip()
        if line.startswith('Editblk'):
	  name = line.split(' ')[1] # E.g. AB
          testcase = []
	if name:
	  if name.startswith('P'): continue # Skip pins
	  testcase.append(line)
	  if line.startswith('Endblk'):
	    # Inconveniently, the LCA file doesn't list options if they are left default
	    # So edit the config here to include defaults.
	    for i in range(0, len(testcase)):
	      if testcase[i].startswith('Config'):
		testcase[i] = testcase[i].replace('X: ', 'X:Q ')
		testcase[i] = testcase[i].replace('Y: ', 'Y:Q ')
		testcase[i] = testcase[i].replace('Q: ', 'Q:LATCH ')
		testcase[i] = testcase[i].replace('SET: ', 'SET: ')
		testcase[i] = testcase[i].replace('RES: ', 'RES: ')
		testcase[i] = testcase[i].replace('CLK: ', 'CLK: ')
		break
	    generated = self.reverse.processClb(name)
	    self.assertEqual(testcase, generated)

