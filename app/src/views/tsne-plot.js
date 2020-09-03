import { tsnejs } from "../tsne/tsne";
import { select, scaleLinear } from "d3";

const normalize = (X) => {
  const x = X.map((i) => i[0]);
  const y = X.map((i) => i[1]);
  const maxX = Math.max(...x);
  const minX = Math.min(...x);
  const maxY = Math.max(...y);
  const minY = Math.min(...y);
  const xRange = maxX - minX;
  const yRange = maxY - minY;
  return X.map((i) => {
    const [x, y] = i;
    return [(x - minX) / xRange, (y - minY) / yRange];
  });
};

export default class TsnePlot {
  constructor(dimensions, dataMatrix, ref, opts) {
    [this.width, this.height] = dimensions;
    this.data = dataMatrix;
    this.element = ref;
    this.opts = opts;
    this.initialize();
    this.step = this.step.bind(this);
    this.redraw = this.redraw.bind(this);
  }

  initialize() {
    this.tsne = new tsnejs.tSNE(this.opts);
    this.tsne.initDataRaw(this.data);
    this.tsne.step();
    this.Y = normalize(this.tsne.getSolution());
    this.draw();
  }

  run(steps) {
    console.log("runsss", steps, this);
    Array(steps)
      .fill()
      // eslint-disable-next-line no-undef
      .forEach((_, i) => {
        this.step(i);
      });
  }

  step(i) {
    this.tsne.step();

    if (i % 10 === 9) {
      this.Y = normalize(this.tsne.getSolution());
      this.redraw();
    }
  }

  draw() {
    this.svg = select(this.element.current)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    this.x = scaleLinear().domain([-1, 1]).range([0, this.width]);

    this.y = scaleLinear().domain([-1, 1]).range([0, this.height]);

    this.dots = this.svg.append("g").selectAll("dot").data(this.Y);

    this.dots
      .enter()
      .append("circle")
      .attr("cx", (d) => this.x(d[0]))
      .attr("cy", (d) => this.y(d[1]))
      .attr("r", 1.5)
      .style("fill", "#69b3a2");
  }

  redraw() {
    const dots = this.svg.select("g").selectAll("circle").data(this.Y);
    dots.exit().remove();
    console.log(this.svg.select("g").selectAll("circle").data(this.Y));
    dots
      .enter()
      .append("circle")
      .attr("cx", (d) => this.x(d[0]))
      .attr("cy", (d) => this.y(d[1]))
      .attr("r", 1.5)
      .style("fill", "#69b3a2");
    dots.attr("cx", (d) => this.x(d[0])).attr("cy", (d) => this.y(d[1]));
  }
}
