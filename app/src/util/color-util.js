export const selectedColor = "#66d9ef";
export const selectedColorLight = "#a1efe4";
export const activeColor = "#a6e22e";
export const neutralColor = "#cfcfc2";
export const inactiveColor = "#75715e";
export const textColorLight = "#f8f8f2";
export const textColorDark = "#3e3d32";
export const errorColor = "#f92672";
export const backgroundColor = "#272822";
export const accent1 = "#fd971f";
export const accent2 = "#e6db74";
export const accent3 = "#fd5ff0";

export const partyColorMap = {
  CDU: "#000000",
  SPD: "#EB001F",
  FDP: "#FFED00",
  CSU: "#008AC5",
  "Left Party/PDS": "#BE3075",
  Greens: "#64A12D",
  "CDU/CSU": "#000000",
  "Left/PDS": "#BE3075",
  Committee: "#f8f8f2",
  Bundesrat: "#75715e",
  KPD: "#8B0000",
  BP: "#98F5FF",
  DP: "#63B8FF",
  Z: "#0000CD",
  WAV: "#FFEC8B",
  SSW: "#003c8f",
  "NationalRight/DRP": "#8b4726",
  unaffiliated: neutralColor,
  "GB/BHE": "#C3C318",
  CVP: textColorLight,
};

export const subjectColorMap = {
  "international affairs, foreign trade and foreign aid": selectedColorLight,
  "environment, agriculture, energy and water": activeColor,
  "macroeconomics, budget, domestic commerce and finance": accent2,
  "civil rights, minorty and family issues and crime": accent1,
  "social welfare and housing": accent3,
  "government operations and constitutional amendments": textColorLight,
  defense: "#75715e",
  "social services (education, healthcare, transportation)": "#ae81ff",
  "labor, employment and immigration": errorColor,
  reunification: selectedColor,
  other: neutralColor,
};

export const positionColorMap = {
  opposition: errorColor,
  "ruling party": selectedColor,
  "part time in ruling coalition": selectedColorLight,
  "president of the Bundestag": activeColor,
  "party whip": accent1,
  "party leader": accent2,
  minister: accent3,
  "committee chair": textColorLight,
};

export const passageColorMap = {
  passed: activeColor,
  "not passed": errorColor,
  "multiple attempts": accent2,
};

const rgbToHex = (r, g, b) =>
  "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

const hexToRgb = (hex) => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const clipCVal = (cVal) => {
  return Math.round(Math.max(Math.min(cVal, 255), 0));
};

const shadeColor = (color, newBrightness) => {
  const { r, g, b } = hexToRgb(color);
  console.log(
    rgbToHex(
      clipCVal(r * newBrightness),
      clipCVal(g * newBrightness),
      clipCVal(b * newBrightness)
    )
  );
  return rgbToHex(
    clipCVal(r * newBrightness),
    clipCVal(g * newBrightness),
    clipCVal(b * newBrightness)
  );
};
export const ageColorMap = {
  "29 or under": shadeColor(activeColor, 1.6),
  "30-39": shadeColor(activeColor, 1.1),
  "40-49": shadeColor(activeColor, 0.6),
  "50-59": shadeColor(activeColor, 0.3),
  "60-69": shadeColor(activeColor, 0.15),
  "70-79": shadeColor(activeColor, 0.05),
  "80 or older": shadeColor(activeColor, 0),
};

export const isDark = (hex) => {
  const rgb = hexToRgb(hex);
  return (rgb.r + rgb.b + rgb.g) / (3 * 256) < 0.45;
};

export const genderColorMap = {
  male: selectedColor,
  female: errorColor,
};

export const getPartyColor = (party) =>
  partyColorMap[party] ? partyColorMap[party] : neutralColor;

export const getSubjectColor = (subject) =>
  subjectColorMap[subject] ? subjectColorMap[subject] : neutralColor;

export const getGenderColor = (gender) =>
  genderColorMap[gender] ? genderColorMap[gender] : neutralColor;

export const getPositionColor = (pos) =>
  positionColorMap[pos] ? positionColorMap[pos] : neutralColor;

export const getPassageColor = (pas) =>
  passageColorMap[pas] ? passageColorMap[pas] : neutralColor;

export const getAgeColor = (age) =>
  ageColorMap[age] ? ageColorMap[age] : neutralColor;

export const getUniformColorScheme = () => "#cfcfc2";
