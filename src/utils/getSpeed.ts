import { sp, Sparse } from "./sparse";

export type GetSpeedOptions = Record<
  | "hitEnergy"
  | "hitFrequency"
  | "enterAngle"
  | "errAngle"
  | "hardness"
  | "diameter",
  [number, number, number]
>;

// Kз = 1,2–1,3
//  n – число перьев на коронке долота (n = 2 – для однодолотчатой и n = 4 – для крестовой
// -> метры в секунду
export const getSpeed = (options: GetSpeedOptions): Sparse => {
  const A = sp(...options.hitEnergy);
  const Zn = sp(...options.hitFrequency);
  const alpha = options.errAngle[0];
  const theta = options.enterAngle[0];
  const d = sp(...options.diameter);
  const sigma = sp(...options.hardness);

  console.log({ d, sigma });

  const res = sp(0.2 * 10 ** -5)
    .mult(A)
    .mult(Zn)
    .mult(4)
    .mult(Math.tan(theta / 2))
    .div(Math.PI)
    .div(d)
    .div(d)
    .div(Math.tan(alpha / 2) + 0.5)
    .div(sigma)
    .div(1.25);

  console.log(res);
  return res;
};
