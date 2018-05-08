## xc2064
This is an in-progress project to document the internals of the XC2064 FPGA.
The XC2064 was the first FPGA, introduced by Xilinx in 1985. This FPGA contained just 64 complex logic blocks
(CLBs), in an 8x8 grid. It was soon followed by the XC2018, which was essentially the same chip but with 100 CLBs in a 10x10 grid.

### The code

* reverse.py: Will (eventually) convert a raw bitstream file (RBT) into a LCA description file.
* fmtrbt.py: Formats a RBT file to match the die layout.
* formula3.txt and formula4.txt: mostly optimized lists of all Boolean functions of 3 and 4 variables.
* formula3.py and formula4.py: programs to generate the formula.txt files
* test/: Directory of unittests. Run with `python -m unittest discover`


### Links

* Die photos of the [XC2064](http://siliconpr0n.org/map/xilinx/xc2064/) and [XC2018](http://siliconpr0n.org/map/xilinx/xc2018/).

* [XC2000 family datasheet](http://www.itisravenna.gov.it/sheet/XC2000FM.PDF)
