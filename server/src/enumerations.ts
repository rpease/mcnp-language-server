export enum FileBlock
{
	Cells,
	Surfaces,
	Data,
	NA
}

export enum Particle
{
	neutron,
	photon,
	electron,
	NONE
}

export enum SurfaceType
{
	Plane,
	Plane_X,
	Plane_Y,
	Plane_Z,
	Sphere_Origin,
	Sphere,
	Sphere_X,
	Sphere_Y,
	Sphere_Z,
	Cylinder_Par_X,
	Cylinder_Par_Y,
	Cylinder_Par_Z,
	Cylinder_X,
	Cylinder_Y,
	Cylinder_Z,
	Cone_Par_X,
	Cone_Par_Y,
	Cone_Par_Z,
	Cone_X,
	Cone_Y,
	Cone_Z,
	SQ,
	GQ,
	Torus_X,
	Torus_Y,
	Torus_Z,
	Points,
	Box,
	RectangularParallelepiped,
	RightCircularCylinder,
	HexagonalPrism,
	RightEllipitcalCylinder,
	TruncatedCone,
	Ellipsoid,
	Wedge,
	Polyhedron
}

export enum SurfaceModifier
{
	Reflective,
	WhiteBoundary
}
