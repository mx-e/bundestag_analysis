export const selectedColor = "#66d9ef";
export const activeColor = "#a6e22e";
export const neutralColor = "#cfcfc2";
export const inactiveColor = "#75715e";
export const textColorLight = "#f8f8f2";
export const textColorDark = "#3e3d32";
export const errorColor = "#f92672";
export const backgroundColor = "#272822";

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
};

export const subjectColorMap = {
  "government operations": "#f8f8f2",
  "social welfare": "#a6e22e",
  healthcare: "#fd5ff0",
  defense: "#75715e",
  "macroeconomics (including bugdet)": "#fd971f",
  "international affairs and foreign aid": "#a1efe4",
  "labor, employment, and immigration": "#f92672",
  energy: "#e6db74",
  education: "#ae81ff",
  "other, miscellaneous, and human interest": "#cfcfc2",
};

const genderColorMap = {
  male: selectedColor,
  female: errorColor,
};

export const getPartyColor = (party) =>
  partyColorMap[party] ? partyColorMap[party] : neutralColor;

export const getSubjectColor = (subject) =>
  subjectColorMap[subject] ? subjectColorMap[subject] : neutralColor;

export const getGenderColor = (gender) =>
  genderColorMap[gender] ? genderColorMap[gender] : neutralColor;

export const getUniformColorScheme = () => "#cfcfc2";
