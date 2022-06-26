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
const colors = random.shuffle(palette);

const sketch = ({ width, height }) => {
  const margin = size * 0.05;
  const boxSize = size - margin * 2;

  const grid = 10;

  const itemSize = boxSize / grid;
  const boxStart = margin;
  const boxEnd = size - margin - itemSize;

  const rowCount = random.rangeFloor(2, 6);

  const getDither = (r = 0) => {
    let items = [];
    const dotsX = Math.floor(random.rangeFloor(300, 300) / rowCount);
    const dotsY = dotsX * rowCount;

    Array.from(new Array(dotsX)).forEach((_, dot, arr) => {
      const px = getP(dot, arr.length);

      Array.from(new Array(dotsY)).forEach((_, dot, arr) => {
        const py = getP(dot, arr.length);
        const isDot = random.chance(lerp(1, 0, py));
        const noise = random.noise3D(px, py, r);

        const textSet = [
          { value: ".", weight: lerp(1000, 100, py) },
          { value: "⁖", weight: lerp(-20, 100, py) },
          { value: "×", weight: lerp(-20, 300, py) },
          { value: "|", weight: lerp(-20, 900, py) },
        ];

        const text = random.weightedSet(textSet);

        items.push({
          px,
          py,
          isDot,
          text,
          noise,
        });
      });
    });

    return items;
  };

  const rows = Array.from(new Array(rowCount)).map((_, row, rows) => {
    const p = getP(row, rows.length);
    const rowWidth = boxSize / rowCount;
    const x = lerp(boxStart, size - boxStart - rowWidth, p);
    const dither = getDither(random.value());

    return {
      dither,
      ditherColor: colors[1],
      p,
      x,
      width: rowWidth,
    };
  });

  return ({ context, playhead }) => {
    context.fillStyle = colors[0];
    context.fillRect(0, 0, width, height);

    rows.forEach((row, index) => {
      context.save();

      context.translate(row.x, margin);

      context.lineWidth = 2;

      row.dither.forEach((d) => {
        if (d.isDot) {
          context.font = "50px monospace";
          context.fillStyle = row.ditherColor;
          context.fillText(
            d.text,
            lerp(50, row.width - 50, d.px),
            boxSize * d.py
          );
        }
      });

      context.stroke();
      context.fill();

      context.lineWidth = row.width * 0.1;
      context.strokeStyle = "#000";
      context.textAlign = "center";
      context.stroke();

      context.restore();
    });
  };
};

canvasSketch(sketch, settings);
