const canvasSketch = require("canvas-sketch");
const palettes = require("nice-color-palettes");
const Random = require("canvas-sketch-util/random");
const { lerp } = require("canvas-sketch-util/math");
const eases = require("eases");

const {
  getP,
  getNormalDistribution,
  getInvertedNormalDistribution,
} = require("../utils/math.js");

Random.setSeed(Random.getRandomSeed());

const random = Random.createRandom();

const size = 3000;

const settings = {
  suffix: Random.getSeed(),
  pixelsPerInch: 300,
  dimensions: [size, size],
};

const palette = random.pick(palettes);

const sketch = ({ width, height }) => {
  const cols = 30;
  const items = [];

  const itemSize = size / cols;
  const boxEnd = size - itemSize;

  Array.from(new Array(cols)).forEach((_, index, cols) => {
    const p = getP(index, cols.length);

    const lines = Math.floor(lerp(50, 200, p));

    Array.from(new Array(lines)).forEach((_, lineIndex, lines) => {
      const pLine = getP(lineIndex, lines.length);
      const noise = random.noise2D(p, pLine);

      items.push({
        pLine,
        lines,
        color: random.pick(palette),
        noise,
        p,
        x: lerp(0, boxEnd, p),
        y: lerp(0, boxEnd, pLine),
      });
    });
  });

  /**
   * @param {{ context: CanvasRenderingContext2D }}
   */
  return ({ context, playhead }) => {
    const loop = Math.sin(Math.PI * eases.sineInOut(playhead));

    const startY = random.range(size * 0.25, size * 0.75);
    const endY = random.range(size * 0.25, size * 0.75);

    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    items.forEach((item) => {
      const { p } = item;

      const y = (size / 6) * item.noise;

      context.save();

      context.beginPath();
      context.translate(
        lerp(0, size - itemSize, item.p),
        lerp(startY, endY, item.p)
      );

      context.lineWidth = 4;
      context.strokeStyle = "white";

      for (let index = 1; index < 6; index++) {
        context.globalAlpha = 1 / index;
        context.beginPath();
        context.lineTo(0, y * index);
        context.lineTo(itemSize, y * index);
        context.stroke();
      }

      context.restore();

      lastP = p;
    });
  };
};

canvasSketch(sketch, settings);
