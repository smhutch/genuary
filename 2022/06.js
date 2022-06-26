/**
 * Genuary 2022
 * Day 6
 *
 * Wordle.
 */

const canvasSketch = require("canvas-sketch");
const palettes = require("nice-color-palettes");
const Random = require("canvas-sketch-util/random");
const { lerp } = require("canvas-sketch-util/math");

const { getP } = require("../utils/math.js");

Random.setSeed(Random.getRandomSeed());

const random = Random.createRandom();

const size = 3000;

const settings = {
  suffix: Random.getSeed(),
  pixelsPerInch: 300,
  dimensions: [size, size],
};

const palette = random.pick(palettes);

const WORDLE_ROWS = 6;
const WORDLE_COLS = 5;

const getWordle = () => {
  const wordle = [];
  Array.from(new Array(WORDLE_ROWS)).forEach((_, rowIndex, rows) => {
    const p = getP(rowIndex, rows.length);

    const lastRow = rowIndex > 0 ? wordle[rowIndex - 1] : undefined;

    const getColor = (colIndex) => {
      if (rowIndex > 0) {
        const lastGuess = lastRow[colIndex];
        if (lastGuess === "MATCH") {
          return "MATCH";
        } else if (lastGuess === "CLOSE") {
          return random.weightedSet([
            { value: "MATCH", weight: lerp(1, 1, p) },
            { value: "CLOSE", weight: lerp(1, 1, p) },
            { value: "MISS", weight: lerp(1, 0, p) },
          ]);
        }
      }

      return random.weightedSet([
        { value: "MATCH", weight: lerp(0.2, 1, p) },
        { value: "CLOSE", weight: lerp(0.8, 0.6, p) },
        { value: "MISS", weight: lerp(1, 0, p) },
      ]);
    };

    wordle.push([
      getColor(0),
      getColor(1),
      getColor(2),
      getColor(3),
      getColor(4),
      getColor(5),
    ]);
  });

  return wordle;
};

function roundRect(contex, x, y, width, height, radius = 5) {
  contex.lineTo(x + width - radius, y);
  contex.quadraticCurveTo(x + width, y, x + width, y + radius);
  contex.lineTo(x + width, y + height - radius);
  contex.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height
  );
  contex.lineTo(x + radius, y + height);
  contex.quadraticCurveTo(x, y + height, x, y + height - radius);
  contex.lineTo(x, y + radius);
  contex.quadraticCurveTo(x, y, x + radius, y);
  contex.closePath();
  contex.fill();
}

const sketch = ({ width, height }) => {
  const margin = size * 0.05;
  const boxSize = size - margin;

  // const grid = random.rangeFloor(2, 20);
  const grid = 10;
  const rowCount = grid;
  const colCount = grid;
  const items = [];

  const itemWidth = boxSize / rowCount;
  const itemHeight = boxSize / colCount;
  const xStart = margin;
  const xEnd = size - margin - itemWidth;
  const yStart = margin;
  const yEnd = size - margin - itemHeight;

  const itemGap = itemWidth * 0.2;
  const wordleWidth = itemWidth - itemGap - itemGap;
  const wordleHeight = itemWidth - itemGap - itemGap;
  const wordleBlockGap = wordleWidth * 0.4;

  const wordleBlockWidth = (wordleWidth - wordleBlockGap) / WORDLE_COLS;
  const wordleBlockHeight = (wordleHeight - wordleBlockGap) / WORDLE_ROWS;

  Array.from(new Array(colCount)).forEach((_, rowIndex, rows) => {
    const px = getP(rowIndex, rows.length);

    Array.from(new Array(rowCount)).forEach((_, colIndex, cols) => {
      const py = getP(colIndex, cols.length);
      const noise = random.noise2D(px, py);

      items.push({
        color: random.pick(palette),
        noise,
        px,
        py,
        x: lerp(xStart, xEnd, px),
        y: lerp(yStart, yEnd, py),
        wordle: getWordle(noise),
      });
    });
  });

  return ({ context }) => {
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);
    items.forEach((item) => {
      const { px, py } = item;

      context.save();
      context.beginPath();
      context.translate(item.x, item.y);

      item.wordle.forEach((row, rowIndex, rowArray) => {
        const pRow = getP(rowIndex, rowArray.length);

        row.forEach((col, colIndex, colArray) => {
          const pCol = getP(colIndex, colArray.length);

          context.beginPath();
          roundRect(
            context,
            lerp(itemGap, itemWidth - wordleBlockWidth - itemGap, pCol),
            lerp(itemGap, itemWidth - wordleBlockHeight - itemGap, pRow),
            wordleBlockWidth,
            wordleBlockHeight,
            5
          );

          switch (col) {
            case "MATCH":
              context.fillStyle = "#78b159";
              break;
            case "MISS":
              context.fillStyle = "rgb(253, 203, 88)";
              break;
            case "CLOSE":
              context.fillStyle = "#31373d";
              break;
          }
          context.fill();
        });
      });

      context.fillStyle = item.color;
      context.strokeStyle = "black";
      context.restore();
    });
  };
};

canvasSketch(sketch, settings);
