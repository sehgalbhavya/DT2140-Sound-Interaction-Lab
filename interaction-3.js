//==========================================================================================
// AUDIO SETUP
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit just where you're asked to!
//------------------------------------------------------------------------------------------
//
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;

// Change here to ("tuono") depending on your wasm file name
const dspName = "door";
const instance = new FaustWasm2ScriptProcessor(dspName);

// output to window or npm package module
if (typeof module === "undefined") {
  window[dspName] = instance;
} else {
  const exp = {};
  exp[dspName] = instance;
  module.exports = exp;
}

// The name should be the same as the WASM file, so change tuono with brass if you use brass.wasm
door.createDSP(audioContext, 1024).then((node) => {
  dspNode = node;
  dspNode.connect(audioContext.destination);
  console.log("params: ", dspNode.getParams());
  const jsonString = dspNode.getJSON();
  jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
  dspNodeParams = jsonParams;
  // const exampleMinMaxParam = findByAddress(dspNodeParams, "/thunder/rumble");
  // // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
  // const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
  // console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
});

//==========================================================================================
// INTERACTIONS
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit the next functions to create interactions
// Decide which parameters you're using and then use playAudio to play the Audio
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function accelerationChange(accx, accy, accz) {
  // playAudio()
}

let lastRotY = null;
let lastTime = null;

// Adjust if your device axis is different
const OPEN_THRESHOLD = 0.5; // degrees/s – minimum movement to trigger
const MAX_SPEED = 720; // deg/s → mapped to force=1
force = 1;

function rotationChange(rotx, roty, rotz) {
  if (!dspNode) return;

  const now = millis();

  if (lastRotY === null) {
    lastRotY = roty;
    lastTime = now;
    return;
  }

  let deltaY = roty - lastRotY;

  // Wrap-around fix
  if (deltaY > 180) deltaY -= 360;
  if (deltaY < -180) deltaY += 360;

  const dt = (now - lastTime) / 1000;
  if (dt <= 0) return;

  const angularSpeed = Math.abs(deltaY / dt);

  if (angularSpeed > OPEN_THRESHOLD) {
    // force = 0 → 1
    const force = Math.min(angularSpeed / MAX_SPEED, 1);

    // Map to DSP expected 0 → 0.5
    const pos = force * 0.5;

    dspNode.setParamValue("/door/door/position", pos);
    dspNode.setParamValue("/door/volume", 0.7);

    // Smooth decay back to 0 after movement
    setTimeout(() => {
      dspNode.setParamValue("/door/door/position", 0);
      dspNode.setParamValue("/door/volume", 0);
    }, 80);
  }

  lastRotY = roty;
  lastTime = now;
}

function mousePressed() {
  console.log("PARAMS:", dspNode.getParams());

  //playAudio()
  // Use this for debugging from the desktop!
}

function deviceMoved() {
  movetimer = millis();
  statusLabels[2].style("color", "pink");
}

function deviceTurned() {
  threshVals[1] = turnAxis;
}
function deviceShaken() {
  shaketimer = millis();
  statusLabels[0].style("color", "pink");
  playAudio();
}

function getMinMaxParam(address) {
  const exampleMinMaxParam = findByAddress(dspNodeParams, address);
  // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
  const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
  console.log("Min value:", exampleMinValue, "Max value:", exampleMaxValue);
  return [exampleMinValue, exampleMaxValue];
}

//==========================================================================================
// AUDIO INTERACTION
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit here to define your audio controls
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function playAudio(pressure) {
  if (!dspNode) {
    return;
  }
  if (audioContext.state === "suspended") {
    return;
  }
  dspNode.setParamValue("/door/volume", 0.9);
  setTimeout(() => {
    dspNode.setParamValue("/door/volume", 0);
  }, 100);
}

//==========================================================================================
// END
//==========================================================================================
