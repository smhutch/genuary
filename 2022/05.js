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

const size = 1080;

const settings = {
  animate: true,
  duration: 4,
  suffix: Random.getSeed(),
  // pixelsPerInch: 300,
  dimensions: [size, size],
};

const palette = random.pick(palettes);

const sketch = ({ width, height }) => {
  const margin = size * 0.2;
  const boxSize = size - margin * 2;

  const grid = Math.floor(size / 8);
  const items = [];

  const itemSize = boxSize / grid;
  const boxStart = margin;
  const boxEnd = size - margin - itemSize;
  const outlineP = 0.08;
  const boxOutline = boxSize * outlineP;

  Array.from(new Array(grid)).forEach((_, rowIndex, rows) => {
    const px = getP(rowIndex, rows.length);

    Array.from(new Array(grid)).forEach((_, colIndex, cols) => {
      const py = getP(colIndex, cols.length);
      const noise = random.noise2D(px, py) * 2;

      items.push({
        color: random.pick(palette),
        noise,
        px,
        py,
        xStart:
          px < 0.5
            ? lerp(boxStart, boxStart + boxOutline, px)
            : lerp(boxEnd - boxOutline, boxEnd, px / 2),
        x: lerp(boxStart, boxEnd, px),
        y: lerp(boxStart, boxEnd, py),
        breakStart: [
          random.range(boxStart, boxStart + boxOutline),
          random.range(boxStart, boxEnd),
        ],
        breakEnd: [random.pick([0, size]), random.pick([0, size])],
        breakChance: random.value(),
      });
    });
  });

  const rv = random.value();

  /**
   * @param {{ context: CanvasRenderingContext2D }}
   */
  return ({ context, playhead }) => {
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    const loop = eases.expoIn(Math.sin(Math.PI * playhead * 2));

    items.forEach((item) => {
      const { px, py } = item;

      const normalX = getInvertedNormalDistribution(px);
      const normalY = getInvertedNormalDistribution(py);

      context.save();

      context.beginPath();
      context.translate(
        lerp(item.x, item.x + boxOutline * item.noise, loop),
        lerp(item.y, item.y + boxOutline * item.noise, loop)
      );
      // context.rotate(rotate);
      // context.scale(scaleX, scaleY);
      // context.scale(scaleX, 1);
      context.lineTo(0, 0);
      context.lineTo(itemSize * lerp(1, item.noise, loop), 0);
      context.lineTo(
        itemSize * lerp(1, item.noise, loop),
        itemSize * lerp(1, item.noise, loop)
      );
      context.lineTo(0, itemSize * lerp(1, item.noise * 10, loop));
      context.closePath();

      let alpha = 0;

      if (
        item.px < outlineP ||
        item.px > 1 - outlineP ||
        item.py < outlineP ||
        item.py > 1 - outlineP
      ) {
        alpha = 1;
      }

      alpha = lerp(
        alpha,
        alpha ? alpha * items.noise : 0.3 * Math.abs(item.noise),
        loop
      );
      // context.globalAlpha = lerp(px * py, Math.abs(item.noise), loop);
      context.globalAlpha = alpha;

      context.lineWidth = 0;

      context.fillStyle = "white";

      context.fill();
      context.restore();
    });
  };
};

canvasSketch(sketch, settings);
