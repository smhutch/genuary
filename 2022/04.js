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

const [background, ...palette] = random.shuffle(random.pick(palettes));

const sketch = ({ width, height }) => {
  const margin = width * 0.1;
  const boxSize = width - margin * 2;

  const startX = 0 + margin;
  const endX = width - margin;
  const startY = 0 + margin;
  const endY = height - margin;

  //   const resolution = width * 0.004;
  const resolution = boxSize / 100;
  const grid = Math.ceil(width / resolution);

  const randomness = random.range(0.2, 1.4);

  let flowMap = [];

  for (let col = 0; col < grid; col++) {
    const pCol = getP(col, grid);
    flowMap[col] = [];
    for (let row = 0; row < grid; row++) {
      const pRow = getP(row, grid);
      const noise = random.noise2D(pCol, pRow);
      const angle = Math.PI * noise * randomness;
      flowMap[col][row] = angle;
    }
  }

  /**
   * @param {{ context: CanvasRenderingContext2D }}
   */
  return ({ context }) => {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    //  context.lineCap = "round";

    const lineCount = 1000;
    const stepCount = 1000;
    const stepLength = 10;

    for (let line = 0; line < lineCount; line++) {
      const p = getP(line, lineCount);
      const startPosition = [
        margin + lerp(0, boxSize, p),
        random.range(startY, endY),
      ];

      let x = startPosition[0];
      let y = startPosition[1];

      const color = random.pick(palette);

      context.save();
      context.beginPath();

      for (let step = 0; step < stepCount; step++) {
        const stepP = getP(step, stepCount);
        //   context.lineWidth = width * 0.0001 * step;
        context.lineTo(x, y);
        const xOffset = x - startX;
        const yOffset = y - startY;

        const colIndex = Math.max(Math.floor(xOffset / resolution), 0);
        const rowIndex = Math.max(Math.floor(yOffset / resolution), 0);

        const col = flowMap[colIndex];

        if (col === undefined) {
          console.error({
            col,
            colIndex,
            flowMap,
            x,
            xOffset,
          });
          throw new Error("No col angle found");
        }

        const angle = col[rowIndex];

        if (angle === undefined) {
          throw new Error("No angle found");
        }

        const xStep = stepLength * Math.cos(angle);
        const yStep = stepLength * Math.sin(angle);

        const xLineTo = x + xStep;
        const yLineTo = y + yStep;

        if (
          xLineTo < startX ||
          yLineTo < startY ||
          xLineTo > endX ||
          yLineTo > endY
        ) {
          break;
        }

        x = xLineTo;
        y = yLineTo;
      }

      context.lineWidth = lerp(10, 100, p);
      // context.lineWidth = random.range(10, 100);
      context.strokeStyle = color;
      context.stroke();
      context.restore();
    }

    context.lineWidth = 2;

    flowMap.forEach((col, colIndex, colArr) => {
      col.forEach((row, rowIndex, rowArr) => {
        const px = getP(colIndex, colArr.length);
        const py = getP(rowIndex, rowArr.length);

        const x = lerp(margin, width - margin, px);
        const y = lerp(margin, height - margin, py);

        context.save();
        context.translate(x, y);
        context.rotate(row);

        context.beginPath();
        context.lineTo(0, 0);
        context.lineTo(40, 0);
        context.lineWidth = 10;
        context.globalAlpha = 0.5;
        //   context.stroke();

        context.restore();
      });
    });
  };
};

canvasSketch(sketch, settings);
