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

var floatingHeight = 10.0;
var floating = false;
var floatingDisc;
var shiftingValue = 15.0;
var startingRod = 1;
var currentRod = 1;

var xPast = 0.0;

var worldMatrix = new Float32Array(16);
var viewMatrix = new Float32Array(16);
var projMatrix = new Float32Array(16);
var perspectiveMatrix;

var materialDiffColorHandle;
var lightColorHandle;
var lightPositionHandle;
var lights = [];

var scale = 1;
var dxBase = 0;
var dyBase = 0;
var dzBase = -10;
var xOffsetRod = 28;
var yOffsetRod = 10.75;
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
var discMinHeight = 8.97321428571*scale;
var discMaxHeight = 10.5803571428*scale;
var objects = [];
var modelsSrc = [];
modelsSrc[0] = 'models/base.obj';
modelsSrc[1] = 'models/disc1.obj';
modelsSrc[2] = 'models/disc2.obj';
modelsSrc[3] = 'models/disc3.obj';
modelsSrc[4] = 'models/disc4.obj';
modelsSrc[5] = 'models/disc5.obj';
modelsSrc[6] = 'models/disc6.obj';
modelsSrc[7] = 'models/disc7.obj';
var modelsSerialized = [];
var models = [];