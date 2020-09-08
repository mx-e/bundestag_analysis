import { useState, useLayoutEffect } from "react";

export const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
};

export const elecPeriodMap = {
  1: ["august 1949", "september 1953"],
  2: ["september 1953", "september 1957"],
  3: ["september 1957", "september 1961"],
  4: ["september 1961", "september 1965"],
  5: ["september 1965", "september 1969"],
  6: ["september 1969", "november 1972"],
  7: ["november 1972", "october 1976"],
  8: ["october 1976", "october 1980"],
  9: ["october 1980", "march 1983"],
  10: ["march 1983", "january 1987"],
  11: ["january 1987", "december 1990"],
  12: ["december 1990", "october 1994"],
  13: ["october 1994", "september 1998"],
  14: ["september 1998", "september 2002"],
  15: ["september 2002", "september 2005"],
  16: ["september 2005", "september 2009"],
  17: ["september 2009", "september 2013"],
};
