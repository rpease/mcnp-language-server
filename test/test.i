NE 506 Project: High Enrichment Uranium: Shipping Container
c
c
c ----------------- Cell Cards -----------------
c
c Forced Collision Cells
c
16 14 -2.831e-3 (-32 -27 28) imp:n=200 imp:p=1  $ BF3 active region
5 7 -18.724866 5 -6        imp:n=128 imp:p=2  $ HEU
14 13 -1.25e-4 (-26 -27 28)  imp:n=200 imp:p=1  $ He-3 active region
c
1 2 -7.850    -1 2                imp:n=1 imp:p=1  $ Shipping Container
2 3 -0.64  -3                     imp:n=1 imp:p=1  $ Plywood Floor
c 3 1 -1.205e-3 -2 3              imp:n=1 imp:p=1  $ Air Interior
3 0 -2 3 #4 #5 #6 #7 #8 #9 fill=1 imp:n=3 imp:p=1  $ Lattice Interior
c
     c Uranium Warhead
c
4 0 -5             imp:n=128 imp:p=1 $ Internal Void
6 8 -1.85 6 -7     imp:n=64 imp:p=2  $ Be Reflector
7 9 -19.25 7 -8    imp:n=32 imp:p=2  $ Tamper
8 10 -1.654 8 -9   imp:n=16 imp:p=2  $ High Explosive
9 11 -2.6989 9 -10 imp:n=8 imp:p=2   $ Aluminum Case
c
c Detector and Source 
c 
10 2 -7.850 -16 17 imp:n=1 imp:p=1 $ Source Case
11 2 -7.850 -23 24 imp:n=64 imp:p=4 $ Detector Case
c
12 12 -8 (-18 20 -21):(-19 21 -22) imp:n=1 imp:p=1 $ PNL Neutron Generator
c
13 12 -8 (26 -25 -27 28):(-25 27 -29):(-25 -28 30) imp:n=100 imp:p=5 $ He-3 vac-vessel
c
15 10 -8.0 (32 -31 -27 28):(-31 27 -29):(-31 -28 30) imp:n=100 imp:p=5 $ BF3-3 vac-vessel
c
c Shipping Container interior
c
c /lattice
100 0 -4 u=1 lat=1 fill= -6:6 -1:1 -1:1
      2 2 2 2 2 2 2 2 2 2 2 2 2 
      2 2 2 2 2 2 2 2 2 2 2 2 2
      2 2 2 2 2 2 2 2 2 2 2 2 2 
      2 2 2 2 2 2 2 2 2 2 2 2 2 
      2 2 2 2 2 2 2 2 2 2 2 2 2
      2 2 2 2 2 2 2 2 2 2 2 2 2 
      2 2 2 2 2 2 2 2 2 2 2 2 2 
      2 2 2 2 2 2 2 2 2 2 2 2 2
      2 2 2 2 2 2 2 2 2 2 2 2 2
     imp:n=1 imp:p=1
c
c Randomized Junk Universes
c
101 1 -1.205e-3 -1 u=2  imp:n=1 imp:p=1 $ Empty Air
c
102 3 -0.64 11 u=3      imp:n=3 imp:p=1 $ Wooden Crate
103 1 -1.205e-3 -11 u=3 imp:n=3 imp:p=1 $ Wooden Crate Inside Empty
c	
104 6 -1 -13 14 -15 u=4 imp:n=10 imp:p=1   $ Water Inside Barrel
105 16 -0.95 (-12 15):(-12 13 14 -15):(-12 -14) u=4 imp:n=3 imp:p=1 $ Plastic Barrel
106 1 -1.205e-3 12 u=4 imp:n=3 imp:p=1 $ Air
c
107 15 -0.97 -13 14 -15 u=5 imp:n=10 imp:p=1   $ Oil Inside Barrel
108 16 -0.95 (-12 15):(-12 13 14 -15):(-12 -14) u=5 imp:n=3 imp:p=1 $ Plastic Barrel
109 1 -1.205e-3 12 u=5 imp:n=3 imp:p=1 $ Air
c
c Enviornment
c
888 4 -1.3 -998 888 -999 imp:n=1 imp:p=1  $ Asphalt
889 5 -1.52 -888 -999    imp:n=1 imp:p=1  $ Dirt
c
900 1 -1.205e-3 -900                imp:n=4  imp:p=1  $ Air 1
901 1 -1.205e-3 -901                imp:n=8  imp:p=1  $ Air 2
902 1 -1.205e-3 -902                imp:n=16 imp:p=1  $ Air 3
903 1 -1.205e-3 -903                imp:n=32 imp:p=1  $ Air 4
904 1 -1.205e-3 -24 #13 #14 #15 #16 imp:n=64 imp:p=1  $ Air 5
c
998 1 -1.205e-3 1 #10 #11 #12 #13 #14 #15 #16 #900 #901 #902 #903 #904
      -999 998 imp:n=1 imp:p=1 $ Problem Boundary
c
999 0 999 imp:n=0 imp:p=0                  $ Void

c
c ----------------- Surface Cards -----------------
c /container
1 1 rpp -606.46 606.46 -121.9 121.9 -129.55 129.55  $ Exterior Container
2 1 rpp -601.6 601.6   -117.6 117.6 -119.25 119.25  $ Interior Container
3 1 rpp -601.6 601.6   -117.6 117.6 -119.25 -117.98 $ Plywood Floor
c
4 1 rpp -50 50 -39.21 39.21 -40 40 $ Lattice Cell
c
c Uranium Warhead
c
5 2 so 5.77 $ Inner WgU Sphere
6 2 so 7.00 $ Outer WgU Sphere
7 2 so 9.00 $ Be Reflector
8 2 so 12.0 $ Tamper
9 2 so 22.0 $ High Explosive
c /warhead
10 2 so 23.0 $ Aluminum Case
c
c
11 1 rpp -47.46 47.46 -36.67 36.67 -37.46 37.46 $ Wood Crate
c
12 1 cz 30    $ Water Barrel
13 1 cz 29.4
14 1 pz -39.4
15 1 pz 39.4
c
c Source Shell
16 3 rpp -25 25 -60 60 0 300
17 3 rpp -20 20 -50 60 130 170
c
c Neutron Generator
18 3 c/y 0 150 17.5
19 3 c/y 0 150 2
20 3 py -40
21 3 py 55
22 3 py 60
c
c Detector Shell
23 4 rpp -25 25 -60 60 0 300
24 4 rpp -22 22 -59.5 -30 90 210
c
c -- Detectors --
c
c Helium-3
25 5 c/z -10 -50 5
26 5 c/z -10 -50 4.5
27 5 pz 50
28 5 pz -50
29 5 pz 52.6
30 5 pz -52.6
c
c BF3
31 5 c/z 10 -50 5
32 5 c/z 10 -50 4.5
c
888 pz -31.75  $ Asphalt
c
c Air Slabs
900 rpp -50 50 121.9 135 40 270
901 rpp -40 40 135 145 50 250
902 rpp -35 35 145 155 70 230
903 rpp -30 30 155 165 80 220
998 pz 0
999 rpp -800 800 -300 350 -120 600 $ Transport Zone

c
c ----------------- Data Cards -----------------
c
nps 50
mode n
c
SDEF PAR=1 ERG=2.5 VEC=0 1 0 DIR=D2 POS=0 -160 150 RAD=D1 TME=D3
SI1 0 2
SP1 -21 1
SI2 A 0.85 1
SP2 0   1
SI3  0 5e4
SP3 0 1
c
c Air (1.205e-3)
M1 7014 78.084 8016 20.946 18000 0.46 
c 
c Cor-ten Steel
M2     26000 96.975
        6000 0.12
       14000 0.5
       25055 0.35
       15031 0.1
       16000 0.03
       24000 0.875
       29000 0.4
       28000 0.65 $ Cor-ten Steel
c
c Wood (0.64)
M3 1001 0.462423 6000 0.323389 7014 0.002773 8016 0.208779 
     12000 0.000639 16000 0.001211 19000 0.001988 20000 0.000388
c
c Asphalt (1.3)
M4 1001 0.586755 6000 0.402588 7014 0.002463 8016 0.001443 16000 0.006704 
        23000 0.000044
c
c Dirt (1.52)
M5 8016 0.670604 11023 0.005578 12000 0.011432 13027 0.053073
     14000 0.201665 19000 0.007653 20000 0.026664 22000 0.002009
     25055 0.000272 26000 0.021050 
c
c Water (1)
M6 1001 2 8016 1 
c
c Highly Enriched Uranium (18.724868)
M7 92234 0.010582 92235 0.932362 92236 0.002053 92238 0.055003  
c
c Beryium (1.85)
M8 4009 1 
c
c Tungsten Tamper (19.25)
M9 74000 1 
c
c High Explosive (TNT) (1.654)
M10 6000 7 1001 5 7014 3 8016 6 $ this is a comment
c
c Aluminum (2.6989)
M11 13027 1 
c
c Stainless Steel 304 (8)
M12 6000 0.001830 14000 0.009781 15031 0.0041 16000 0.00026 24000 0.200762
     25055 0.010001 26000 0.690375 28000 0.086587
c
c Helium-3 (1.25e-4)
M13 2003 1 $ He-3
c
c BF3 (0.002831 stp)
M14 5010 0.04975 5011 0.20025 9019 .75 
c
c Crude Oil [Middle-East] (0.97)
M15 1001 0.590046 6000 0.391765 7014 0.002914 16000 0.015275
c
c HDPE (0.95)
M16 1001 0.66666 6000 0.33333
c
c DOE 3013 Weapon Grade Plutonium (19.84)
M17 94238 0.000502 94239 0.935269 94240 0.059767 94241 0.003968 94242 0.000494 
c
c Depleted Uranium (18.951157)
M18 92234 0.000005 92235 0.002532 92238 0.997463
c
c /transform_container
TR1 0 0 155.9 $ Shipping Container
c /transform_warhead
TR2 0 0 150   $ Warhead
c
TR3 0 -225 0  $ Port Source
TR4 0 225 0 $ Port Detector
TR5 0 225 150 $ Detectors
c
c
T0  0 10I 5e4 20I 1.5e5 20I 3.5e5 10I 1e8 2I 3e8 30I 30e8 $ This is a comment
E0  .025e-6 300e-6 14
c
FM14 1e11
FM114 1e11
FM214 1e11
FM314 1e11
c
F14:n 14 16
FQ14 T E
c
FMESH114:n ORIGIN= -606.46 -121.9 -129.55 GEOM=xyz TR=1
      IMESH=606.46 JMESH=121.9 KMESH=129.55
      IINTS=100 JINTS=100 KINTS=100
FMESH214:n ORIGIN= 0 0 -23 GEOM=rzt TR=2
      IMESH=23 JMESH=46 KMESH=1
      IINTS=100 JINTS=50 KINTS=90
FMESH314:n ORIGIN= -40 -100 0 GEOM=xyz TR=4
      IMESH=40 JMESH=60 KMESH=300
      IINTS=50 JINTS=100 KINTS=100
FMESH414:n ORIGIN= -30 -170 0 GEOM=xyz
      IMESH=30 JMESH=300 KMESH=300
      IINTS=60 JINTS=200 KINTS=200
c
TOTNU
ACT FISSION=n DN=Both DG=none DNBIAS=10 
nps 7e6
c
c Varience Reduction
c
FCL:n 1 1 1 0 31R
EXT:n 0 0 0 0.75y 0.75y 0 0 0.25y 0.25y 0.25y
      0.25Y 0 0.75v2 0 0 0 0 0 0 0 
      0 0 0 0 0 0 0 0 0.85Y 0.85Y
      0.85Y 0.85Y 0.85Y 0 0    
VECT v2 0 -1 0 
TSPLT:n  1 5e4  2 1e5  2 1.5e5  2 2.5e5  2 3.0e5 2 3.5e5 2 5e5
c
c
F1:p 200.5 201.5 202.5 203.5 T 
FC1 Photon current on the topo of the detectors [g/source n]
c
 FMESH324:n geom=xyz ORIGIN= 0 0 0
          IMESH= 1  IINTS=2
FC324 PX0 Neutron Flux $ still a comment
c
FMESH334:n geom=xyz orign- -40 0
c

