// Program
var gl;
var baseDir;
var shaderDir;
var program;

const eyeHeight = 10.0;
var lookRadius = 30.0;

var cx = 0.0;
var cy = eyeHeight;
var cz;
var elevation = 90.0;
var angle = 90.0;
const step = 2.0;
var yRotation;
var baseq;

var lx = 4.5;
var ly = 0.0;
var lz = 10.0;
var lightAngle = 30;
var lightElevation = 60;
var lightRadius = 50;


var movingMouse;
var movingKey;

var floatingHeight = 20.0;
var floating;
var floatingDisc;
var startingRod;
var currentRod;

var x11 = -22.15;
var x12 = -8.15;
var x21 = -7.0;
var x22 = 7.0;
var x31 = 8.15;
var x32 = 22.15;


var lastMouseX = -100;
var mouseWorldX;
var currentDiscX;

var deltaX;
var deltaY;
var stepY = 0.5;
var goingUp = false;
var goingDown = false;

var worldMatrix = new Float32Array(16);
var viewMatrix = new Float32Array(16);
var projMatrix = new Float32Array(16);
var perspectiveMatrix;

var materialDiffColorHandle;
var lightColorHandle;
var lightPositionHandle;
var lights = [];

var gameStarted = false;
var gameEnded;
var numberOfMoves;
var allowedMoves;
var win;
var dxBase = 0;
var dyBase = 0.0;
var dzBase = 0;
var dxRod = 15.15;
var dyRod = 1.0;
var discThickness = 1.5;
var minLevel = 1;
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