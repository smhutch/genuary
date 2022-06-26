const canvasSketch = require("canvas-sketch");
const palettes = require("nice-color-palettes");
const Random = require("canvas-sketch-util/random");
const { lerp } = require("canvas-sketch-util/math");

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
  const margin = size * 0.05;
  const boxSize = size - margin;

  const grid = 100;
  const items = [];

  const itemSize = boxSize / grid;
  const boxStart = margin;
  const boxEnd = size - margin - itemSize;
  const half = itemSize / 2;

  Array.from(new Array(grid)).forEach((_, rowIndex, rows) => {
    const px = getP(rowIndex, rows.length);

    Array.from(new Array(grid)).forEach((_, colIndex, cols) => {
      const py = getP(colIndex, cols.length);
      const noise = random.noise2D(px, py);

      items.push({
        color: random.pick(palette),
        noise,
        px,
        py,
        x: lerp(boxStart, boxEnd, px),
        y: lerp(boxStart, boxEnd, py),
      });
    });
  });

  return ({ context }) => {
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);
    items.forEach((item) => {
      const { px, py } = item;

      const normalX = getInvertedNormalDistribution(px);
      const normalY = getInvertedNormalDistribution(py);

      const scaleX = 0.5 * lerp(1, 10 * Math.abs(item.noise), normalX);
      const scaleY = 0.5 * lerp(1, 10 * Math.abs(item.noise), normalY);
      const rotate = Math.sin(Math.PI * normalY * normalX) * item.noise;

      context.save();

      context.beginPath();
      context.translate(item.x + half, item.y + half);
      context.rotate(rotate);
      context.scale(scaleX, scaleY);
      context.lineTo(-half, -half);
      context.lineTo(-half, half);
      context.lineTo(half, half);
      context.closePath();

      context.lineWidth = itemSize * 0;
      context.fillStyle = item.color;
      context.strokeStyle = "black";

      context.fill();

      context.stroke();
      context.restore();
    });
  };
};

canvasSketch(sketch, settings);
