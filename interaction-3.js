//==========================================================================================
// AUDIO SETUP
//------------------------------------------------------------------------------------------
// interaction-3.js: Creaking Door controlled by Y-axis Tilt
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;

// 1. SET DSP NAME
// This must match your .wasm filename (door.wasm)
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

// 2. LOAD DSP
// We use 'door.createDSP' assuming the global object matches the filename
door.createDSP(audioContext, 1024).then((node) => {
  dspNode = node;
  dspNode.connect(audioContext.destination);

  console.log("params: ", dspNode.getParams()); // Check console to verify /door/position

  const jsonString = dspNode.getJSON();
  jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
  dspNodeParams = jsonParams;
});

//==========================================================================================
// INTERACTIONS
//------------------------------------------------------------------------------------------
// Using Rotation (Y-axis) to control the Door
//==========================================================================================

function accelerationChange(accx, accy, accz) {
  // Not used for this interaction
}

function rotationChange(rotx, roty, rotz) {
  if (!dspNode) return;

  // 3. DEFINE PARAMETER
  // Based on your dsp code: hslider("v:door/position"...)
  const paramAddress = "/door/position";

  // 4. MAP ROTATION TO SOUND
  // roty (Roll) usually ranges from -90 to 90 (or -180 to 180 depending on device)
  // Let's assume 0 is flat, and tilting right (positive) opens the door.

  // map(value, inputMin, inputMax, outputMin, outputMax, [clamp])
  // We map 0 to 60 degrees of tilt -> to 0.0 to 0.5 (the DSP slider range)
  // 'true' clamps the value so it doesn't exceed the limits if you tilt further
  let doorValue = map(roty, 0, 60, 0, 0.5, true);

  // Filter out small accidental movements (deadzone)
  if (doorValue < 0.01) doorValue = 0;

  // Send value to Faust
  dspNode.setParamValue(paramAddress, doorValue);
}

function mousePressed() {
  // Debugging: print current values when you click mouse
  if (dspNode) {
    console.log("Current Params:", dspNode.getParams());
  }
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
//==========================================================================================

function playAudio(val) {
  // Audio is driven continuously by rotationChange, so this is empty
}

//==========================================================================================
// END
//==========================================================================================
