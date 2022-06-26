const { lerp } = require("canvas-sketch-util/math");

/**
 * @param { number } index array index
 * @param { number } arrayLength array.length
 * @returns { number } percentage from 0...1 through the array
 */
function getP(index, arrayLength) {
  return arrayLength <= 1 ? 0 : index / (arrayLength - 1);
}

/**
 * Converts a decimal between 0..1 to a distribution of 0...1...0
 */
function getNormalDistribution(decimal) {
  return Math.abs(Math.cos(Math.PI * decimal));
}

/**
 * Converts a decimal between 0..1 to a distribution of 1...0...1
 */
function getInvertedNormalDistribution(decimal) {
  return lerp(1, 0, getNormalDistribution(decimal));
}

module.exports = {
  getP,
  getNormalDistribution,
  getInvertedNormalDistribution,
};
