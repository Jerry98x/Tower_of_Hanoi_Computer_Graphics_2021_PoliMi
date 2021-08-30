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
var initialDirLightTheta = 30;
var initialDirLightPhi = 60;

var initialLightPos = [10.0, 15.0, 30.0, 1.0];
var initialLightDecay = 0;
var initialLightTarget = 50;


var movingMouse;
var movingKey;

var floatingHeight = 20.0;
var floating;
var floatingDisc;
var startingRod;
var currentRod;

var outerX = 30;
var innerX = 7.575;

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

var dCustom = '<p><b style="font-size: medium;">Directional</b><br>θ = 0° <input autocomplete="off" type="range" id="theta_rot_dir" min="0" max="360" step="10" onchange="dynamicDirectLightChange(this)"> 360° <br>φ = -90° <input autocomplete="off" type="range" id="phi_rot_dir" min="-90" max="90" step="10" onchange="dynamicDirectLightChange(this)"> 90°</p>';
var pCustom = '<p><b style="font-size: medium;">Point</b><br>X = -25 <input autocomplete="off" type="range" id="x_tras_point" min="-25.0" max="25.0" step="5.0" onchange="dynamicPointLightChange(this)"> 25<br>Y = -25 <input autocomplete="off" type="range" id="y_tras_point" min="-25.0" max="25.0" step="5.0" onchange="dynamicPointLightChange(this)"> 25<br>Z = -25 <input autocomplete="off" type="range" id="z_tras_point" min="-25.0" max="25.0" step="5.0" onchange="dynamicPointLightChange(this)"> 25<br>Decay (β) = 0 <input autocomplete="off" type="range" id="decay" min="0" max="2" step="1" onchange="dynamicPointLightChange(this)"> 2<br>Target distance (g) = 0 <input autocomplete="off" type="range" id="targ_dist" min="0" max="50" step="1" onchange="dynamicPointLightChange(this)"> 50</p>';

