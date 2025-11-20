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

// 1. SET DSP NAME
// Change here to ("door") to match your wasm file name
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

// 2. INITIALIZE DSP
// We change 'brass.createDSP' to 'door.createDSP'
door.createDSP(audioContext, 1024).then((node) => {
  dspNode = node;
  dspNode.connect(audioContext.destination);
  console.log("params: ", dspNode.getParams());
  const jsonString = dspNode.getJSON();
  jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
  dspNodeParams = jsonParams;
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
  // Not used for this interaction
}

function rotationChange(rotx, roty, rotz) {
  // 3. CALCULATE VALUES HERE
  // We use 'roty' (Pitch/Roll axis) to control the door.
  // Map 0 degrees (flat) to 60 degrees (tilted) to the range 0.0 -> 0.5
  // The 'true' parameter clamps the value so it doesn't go below 0 or above 0.5
  let doorPosition = map(roty, 0, 60, 0, 0.5, true);

  // 4. CALL PLAYAUDIO
  // We pass the calculated value to the audio function
  playAudio(doorPosition);
}

function mousePressed() {
  // Debugging: simulate opening the door halfway with a mouse click
  playAudio(0.25);
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
}

function getMinMaxParam(address) {
  if (!dspNodeParams) return [0, 1];
  const exampleMinMaxParam = findByAddress(dspNodeParams, address);
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

function playAudio() {
  if (!dspNode) {
    return;
  }
  if (audioContext.state === "suspended") {
    return;
  }
  dspNode.setParamValue("/englishBell/gate", 1);
  setTimeout(() => {
    dspNode.setParamValue("/englishBell/gate", 0);
  }, 100);
}

//==========================================================================================
// END
//==========================================================================================
