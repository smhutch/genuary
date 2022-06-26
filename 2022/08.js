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

const isOdd = (n) => n % 2;

const sketch = ({ width, height }) => {
  const margin = size * 0.2;
  const boxSize = size - margin;

  const grid = random.rangeFloor(10, 200);
  const items = [];

  const itemSize = boxSize / grid;
  const boxStart = margin;
  const boxEnd = size - margin;
  const half = itemSize / 2;

  const noiseDistance = (size / grid) * random.range(0, 15);
  const useNoise = random.chance() || true;

  Array.from(new Array(grid)).forEach((_, rowIndex, rows) => {
    const px = getP(rowIndex, rows.length);
    const direction = isOdd(rowIndex) ? "DOWN" : "UP";

    Array.from(new Array(grid)).forEach((_, colIndex, cols) => {
      const py = getP(colIndex, cols.length);
      const noise = random.noise2D(px, py);

      items.push({
        color: random.pick(palette),
        noise,
        px,
        py,
        x: lerp(boxStart, boxEnd, px),
        y:
          direction === "UP"
            ? lerp(boxStart, boxEnd, py)
            : lerp(boxEnd, boxStart, py),
      });
    });
  });

  return ({ context }) => {
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);
    context.lineWidth = 5;

    context.moveTo(margin, margin);
    items.forEach((item) => {
      const offset = useNoise ? item.noise * noiseDistance : 0;

      context.lineTo(item.x + offset, item.y + offset);
    });

    context.lineWidth = itemSize * 0;
    context.strokeStyle = "white";

    context.fill();

    context.stroke();
    context.restore();
  };
};

canvasSketch(sketch, settings);
