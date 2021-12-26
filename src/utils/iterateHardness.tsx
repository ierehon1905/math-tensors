import { Mineral } from "../minerals";
import { calculateHardness } from "./calculateHardness";

export const iterateHardness = (minerals: Mineral[]) => {
  const maxHardness = minerals
    .map((m) => m.hardness)
    .reduce((min, cur) => Math.max(min, cur), 0);

  let hardness = maxHardness;

  const someAreBigger = (_hardness: number) => minerals
    .map((m) => [m.hardness, calculateHardness(m, _hardness)])
    .some(([originalHardness, calculated]) => originalHardness > calculated);

  let leftBorder = 0;

  let safe = 0;
  while (someAreBigger(hardness) && safe < 1000) {
    safe++;
    leftBorder = hardness;
    hardness *= 2;
  }

  let rightBorder = hardness;
  let maxBinarySearchIterations = 12;
  let binarySearchIterations = 0;
  let midHardness = -1;
  let isHardnessSmall = false;
  while (leftBorder < rightBorder &&
    binarySearchIterations < maxBinarySearchIterations) {
    binarySearchIterations++;

    midHardness = leftBorder / 2 + rightBorder / 2;

    isHardnessSmall = someAreBigger(midHardness);

    if (isHardnessSmall) {
      leftBorder = midHardness;
    } else {
      rightBorder = midHardness;
    }
  }

  return isHardnessSmall ? rightBorder : midHardness;
};
