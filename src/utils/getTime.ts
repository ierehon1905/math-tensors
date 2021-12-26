import { sp, Sparse } from "./sparse";

export const getTime = (
  options: Record<"speed" | "depth", [number, number, number]>
): Sparse => {
  const speed = sp(...options.speed);
  const depth = sp(...options.depth);

  const res = depth.div(speed);

  return res;
};
