import {
  getGenderColor,
  getPartyColor,
  getUniformColorScheme,
} from "../util/color-util";

const uniqueVals = (list) => Array.from(new Set(list));
const union = (listOfLists) => [
  ...listOfLists.reduce((setList, list) => new Set(...setList, list)),
];

const listFilter = (object, property, listOfValues) => {
  return union(
    listOfValues.map((value) =>
      Object.keys(object).filter((key) => object[key][property].includes(value))
    )
  );
};

const simpleFilter = (object, property, listOfValues) => {
  return union(
    listOfValues.map((value) =>
      Object.keys(object).filter((key) => object[key][property] === value)
    )
  );
};

const createFilterFunc = (property, value) => (object) => {
  let filterVal = Array.isArray(value) ? value : [value];
  let filteredObject = {};
  let filteredKeys;
  if (Array.isArray(Object.values(object)[0][property])) {
    filteredKeys = listFilter(object, property, filterVal);
  } else if (Object.values(object)[0][property]) {
    filteredKeys = simpleFilter(object, property, filterVal);
  } else {
    return object;
  }
  filteredKeys.forEach((key) => {
    filteredObject[key] = object[key];
  });
  return filteredObject;
};

const createUniqueValFunc = (property) => (object) => {
  if (Array.isArray(Object.values(object)[0][property])) {
    return []; //explicit because it might be needed in the future
  } else if (Object.values(object)[0][property]) {
    return uniqueVals(Object.values(object).map((val) => val[property]));
  } else {
    return [];
  }
};

const createColorFuncs = (property) => {
  let coloring;
  let colorFunc;
  switch (property) {
    case "party":
      colorFunc = getPartyColor;
      coloring = (mp) => colorFunc(mp[property]);
      break;
    case "gender":
      colorFunc = getGenderColor;
      coloring = (mp) => colorFunc(mp[property]);
      break;
    default:
      colorFunc = getUniformColorScheme;
      coloring = () => getUniformColorScheme();
  }
  return [(object) => Object.values(object).map(coloring), colorFunc];
};

export const Filter = (title, property, value) => {
  return {
    filterFunc: createFilterFunc(property, value),
    uniqueValFunc: createUniqueValFunc(property),
    title: title,
    value: value,
    property: property,
  };
};

export const ColorOverlay = (title, property, icon) => {
  const [colorFunc, colorFuncSingle] = createColorFuncs(property);
  return {
    uniqueValFunc: createUniqueValFunc(property),
    colorFunc: colorFunc,
    colorFuncSingle: colorFuncSingle,
    title: title,
    icon: icon,
  };
};
