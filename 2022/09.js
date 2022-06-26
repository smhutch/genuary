const canvasSketch = require("canvas-sketch");
const palettes = require("nice-color-palettes");
const Random = require("canvas-sketch-util/random");
const Isomer = require("isomer");
const { lerp } = require("canvas-sketch-util/math");

const {
  getP,
  getNormalDistribution,
  getInvertedNormalDistribution,
} = require("../utils/math.js");

const { Color, Shape, Point } = Isomer;

Random.setSeed(Random.getRandomSeed());

const random = Random.createRandom();

const size = 3000;

const cityBounds = 10;
const elevationBounds = 10;

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

  const grid = random.rangeFloor(10, 20);

  const block = cityBounds / grid;

  let items = [];

  Array.from(new Array(grid)).forEach((_, dot, arr) => {
    const x = random.range(1, 10);
    const px = getP(dot, arr.length);
    const invX = getInvertedNormalDistribution(px);

    Array.from(new Array(grid)).forEach((_, dot, arr) => {
      const py = getP(dot, arr.length);
      const invY = getInvertedNormalDistribution(py);

      const floors = random.rangeFloor(5, 20);
      const floorHeight = elevationBounds / floors;
      const noiseGrid = random.noise2D(px, py);

      // const showY = random.chance(0.8);
      // if (!showX && !showY) {
      //   return;
      // }

      Array.from(new Array(floors)).forEach((_, floor, arr) => {
        const pz = getP(floor, arr.length);
        const invZ = getInvertedNormalDistribution(pz);
        const noiseFloor = random.noise2D(noiseGrid, pz);

        items.push({
          x,
          px,
          py,
          pz,
          invX,
          invY,
          invZ,
          noiseFloor,
          noiseGrid,
          floorHeight,
        });
      });
    });
  });

  return ({ canvas, context }) => {
    const iso = new Isomer(canvas);

    context.fillStyle = "#000";
    context.fillRect(0, 0, width, height);

    items.forEach((item, index) => {
      const { floorHeight, px, py, pz } = item;

      const x = lerp(cityBounds, 0, item.px);
      const y = lerp(cityBounds, 0, item.py);
      const z = lerp(0, floorHeight, item.pz);

      const shape = Shape.Prism(
        new Point(x, y, z),
        lerp(1, 1, item.pz),
        lerp(1, 1, item.pz),
        floorHeight
      );

      iso.add(
        shape.translate(
          lerp(cityBounds, 0, item.px),
          lerp(cityBounds, 0, item.py),
          0
        ),
        // .scale(
        //   { x: 0, y: 0, z: 0 },
        //   lerp(10, 1, item.py),
        //   lerp(1, 1, item.px),
        //   lerp(1, elevationBounds, item.invX * item.invY)
        // ),
        new Color(
          // R
          // 0,
          // 0,
          // lerp(1, 255, px * py),
          // G
          lerp(0, lerp(0, 255, pz), py),
          lerp(0, lerp(0, 255, pz), py),
          lerp(0, lerp(0, 255, pz), py)
          // B
        )
      );
    });
  };
};

canvasSketch(sketch, settings);
