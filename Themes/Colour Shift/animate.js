const angle = 75;

const generateAnalogousFromHSL = (hsl) => {
  return [hsl, rotateHSL(hsl, 120), rotateHSL(rotateHSL(hsl, 120), 120)];
};

const rotateHSL = ([h, s, l], rotation) => {
  h = (h + rotation) % 360;
  h = h < 0 ? 360 + h : h;
  return [h, s, l];
};

const hexToRGB = (hex) => {
  let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const RGBToHSL = ({ r, g, b }) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
      ? 2 + (b - r) / s
      : 4 + (r - g) / s
    : 0;
  return [
    60 * h < 0 ? 60 * h + 360 : 60 * h,
    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    (100 * (2 * l - s)) / 2,
  ];
};

const HSLToRGB = ([h, s, l]) => {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: 255 * f(0), g: 255 * f(8), b: 255 * f(4) };
};

const getCSSRGBString = (color) => `rgb(${color.r}, ${color.g}, ${color.b})`;

const root = document.getElementById("root");
const before = document.getElementById("random");

const setNewColour = (colourInput) => {
  const rgbD = hexToRGB(colourInput);
  const hslF = RGBToHSL(rgbD);

  const [hsl1F, hsl2F, hsl3F] = generateAnalogousFromHSL(hslF);
  const finalHSL = [hsl2F, hsl1F, hsl3F];
  const analog = finalHSL.map((colourF) => HSLToRGB(colourF));

  if (before.style.opacity == 0) {
    before.style.background = `linear-gradient(45deg, ${getCSSRGBString(
      analog[0]
    )}, ${getCSSRGBString(analog[1])}, ${getCSSRGBString(analog[2])})`;
    before.style.opacity = "1";
  } else {
    root.style.background = `linear-gradient(45deg, ${getCSSRGBString(
      analog[0]
    )}, ${getCSSRGBString(analog[1])}, ${getCSSRGBString(analog[2])})`;
    before.style.opacity = "0";
  }
};

let sensorTitle = "No sensor selected";
let tempText = "0";

const deg = "\u00B0";

let sensorTitleElement = document.getElementById("sensorNameTex");
let tempTextElement = document.getElementById("tempTextH");

let colour1 = "#05a4ed";
let colour1Max = 20;
let colour2 = "#801aed";
let colour2Max = 50;
let colour3 = "#edaa1a";
let colour3Max = 70;
let colour4 = "#ed211a";

let oldSensorName = "";

const updateSensorValue = (sensors) => {
  if (oldSensorName != sensors.detail.mainSensor.sensor) {
    sensorTitleElement.textContent = sensors.detail.mainSensor.sensor;
    oldSensorName = sensors.detail.mainSensor.sensor;
  }

  if (
    parseFloat(tempTextElement.innerText) !=
    parseFloat(sensors.detail.mainSensor.value)
  ) {
    if (
      sensors.detail.mainSensor.value <= colour1Max &&
      tempTextElement.innerText >= colour1Max
    ) {
      setNewColour(colour1);
    } else if (
      sensors.detail.mainSensor.value <= colour2Max &&
      tempTextElement.innerText >= colour2Max
    ) {
      setNewColour(colour2);
    } else if (
      sensors.detail.mainSensor.value <= colour3Max &&
      tempTextElement.innerText >= colour3Max
    ) {
      setNewColour(colour3);
    } else if (
      sensors.detail.mainSensor.value > colour3Max &&
      tempTextElement.innerText < colour3Max
    ) {
      setNewColour(colour4);
    }

    tempTextElement.innerText = sensors.detail.mainSensor.value;
  }
};

const setDefaults = () => {
  const defaultColor = "#05a4ed";

  const rgb = hexToRGB(defaultColor);
  const hsl = RGBToHSL(rgb);

  const [hsl1, hsl2, hsl3] = generateAnalogousFromHSL(hsl);
  const finalHSL = [hsl2, hsl1, hsl3];
  const analog = finalHSL.map((colour) => HSLToRGB(colour));

  let generateGradient = `linear-gradient(${angle}deg, ${getCSSRGBString(
    analog[0]
  )}, ${getCSSRGBString(analog[1])}, ${getCSSRGBString(analog[2])})`;

  document.getElementById("root").style.background = generateGradient;

  currentGradient = analog;

  tempTextElement.textContent = tempText;

  sensorTitleElement.textContent = "No Sensor Selected";
};

document.addEventListener("DOMContentLoaded", () => {
  setDefaults();
});

document.addEventListener("sensorUpdate", (sensors) => {
  updateSensorValue(sensors);
});

document.addEventListener("configLoaded", (config) => {
  colour1 = config.detail.colourOne;
  colour2 = config.detail.colourTwo;
  colour3 = config.detail.colourThree;
  colour4 = config.detail.colourFour;

  colour1Max = config.detail.maxColourOne;
  colour2Max = config.detail.maxColourTwo;
  colour3Max = config.detail.maxColourThree;
});
