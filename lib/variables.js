// Program
var gl;
var baseDir;
var shaderDir;
var program;

var cx;
var cy;
var cz;
var elevation = 90.0;
var angle = 90.0;
var lookRadius = 30.0;
const step = 2.0;
const eyeHeight = 10.0;

var lx = 4.5;
var ly = 0.0;
var lz = 10.0;
var lightAngle = 30;
var lightElevation = 60;
var lightRadius = 50;

var floatingHeight = 20.0;
var floating = false;
var floatingDisc;
var startingRod = 1;
var currentRod = 1;

var worldMatrix = new Float32Array(16);
var viewMatrix = new Float32Array(16);
var projMatrix = new Float32Array(16);
var perspectiveMatrix;

var materialDiffColorHandle;
var lightColorHandle;
var lightPositionHandle;
var lights = [];

var gameEnded = false;
var dxBase = 0;
var dyBase = 0.0;
var dzBase = -10;
var dxRod = 15.15;
var dyRod = 1.0;
var discThickness = 1.5;
var maxLevel = 7;
var baseName = 'base';
var basePositionName = 'basePosition';
var startRod;
var startRodName = 'startRod';
var middleRod;
var middleRodName = 'middleRod';
var endRod;
var endRodName = 'endRod';
var cameraPositionNode;
var basePositionNode;
var baseNode;
var objects = [];
var modelsSrc = [];
modelsSrc[0] = 'models/base.obj';
modelsSrc[1] = 'models/disc_1.obj';
modelsSrc[2] = 'models/disc_2.obj';
modelsSrc[3] = 'models/disc_3.obj';
modelsSrc[4] = 'models/disc_4.obj';
modelsSrc[5] = 'models/disc_5.obj';
modelsSrc[6] = 'models/disc_6.obj';
modelsSrc[7] = 'models/disc_7.obj';
var modelsSerialized = [];
var models = [];

var baseTextureSrc = 'models/textures/cycles_tower_of_hanoi_BaseColor.png';