This is a simple example of a MCNP input file
c
c --------------- Cell Cards -----------------------------------------------
c This is a comment
 C This is a comment
  c This is a comment
    C This is a comment
c box
1 1 -10.0  -1 100 imp:n=1
2 2 5.0		-2 3 100 imp:n=2 $ Half-Sphere
c 
100 0  -666 100 imp:n=1 $ Void Enviornment
c
666 0 #1 #2 #100 imp:n=0 $Graveyard
55 6 -4.0 8 -19 0
        5 2 4 2 
        4 9423 49 
                $ random comment
        -10 4:2
c this is a full line comment  
        -4 50 2 

c --------------- Surface Cards -----------------------------------------------
1 RPP 1 2  -10 10  -8 8 $ Box 1
 2 sX 3 1 $ Sphere
  3 pz 0 $ Plane cutting sphere in half
c
   *100 Py 0 $ Reflective boundary
C Graveyard
666      rpp -1 20 $ X-bounds
     -15 15 $Y-bounds
	 -10 10 $    Z-bounds
c
c Doesn't Crash
4 RPP 1 2  -10 	
        9 3
        $ random comment
        -10 4 
        4 234 02 234 						               8
c Line too Long (over 80)
5 RPP 1 2  -10 							               88 70 5R10 $ not in the error
c
10 8 0 34 234 -10 4
                   
c --------------- Data Cards -----------------------------------------------
NPS 10
mOdE n p
c Isotropic 10.0 MeV Neutron Source
SDEF	ERG=10.0
		par 2
		PoS= 0 1 0
c 
f1:n 1.1
E1 1 10ilog 10
c
 *F4:p 100
fc4 Photon flux in enviornment
c
c Materials -------------------------
c
c	Water
c 	Density = 0.998207
M1		1001 2.0
		8016 1.0
c
c	Paraffin
c 	Density = 0.930
  m2	1001 -0.148605
		6000 -0.851395
