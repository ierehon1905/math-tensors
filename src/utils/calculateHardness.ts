import { convert2Tensor } from "./convert2Matrix";
import { inverse } from "./inverse";
import { Mineral, minerals } from "../minerals";

export const calculateHardness = (
  mineral: Mineral,
  sigma33: number
): number => {
  const sigma = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, sigma33],
  ];

  // v_s = sqrt(mu / p)
  // v_s ** 2 = mu / p
  // mu = p * v_s ** 2

  // v_p = sqrt((lambda + 2mu) / p)
  // v_p ** 2 = (lamda + 2mu) / p
  // lamda + 2mu = p * v_p ** 2
  // lamda = p * v_p ** 2 - 2mu

  const mu = mineral.p * mineral.V_s ** 2;

  const lambda2mu = mineral.p * mineral.v_p ** 2;

  const lambda = lambda2mu - 2 * mu;

  const C = [
    [lambda2mu, lambda, lambda, 0, 0, 0],
    [lambda, lambda2mu, lambda, 0, 0, 0],
    [lambda, lambda, lambda2mu, 0, 0, 0],
    [0, 0, 0, mu, 0, 0],
    [0, 0, 0, 0, mu, 0],
    [0, 0, 0, 0, 0, mu],
  ];

  const f1 = mineral.share;
  const f2 = 1 - f1;

  const K1 = lambda + (2 / 3) * mu;
  const K2 = mineral.p;

  const mu1 = mu;
  const mu2 = 0;

  const K = K1 + f2 / ((K2 - K1) ** -1 + f1 * (K1 + (4 / 3) * mu1) ** -1);

  const mu_mwp =
    mu1 +
    f2 /
      ((mu2 - mu1) ** -1 +
        (2 * f1 * (K1 + 2 * mu1)) / (5 * mu1 * (K1 + (4 / 3) * mu1)));

  const lambda_mwp = K - (2 / 3) * mu_mwp;

  const lambda_mwp2mu = lambda_mwp + 2 * mu_mwp;

  const C_mwp = [
    [lambda_mwp2mu, lambda_mwp, lambda_mwp, 0, 0, 0],
    [lambda_mwp, lambda_mwp2mu, lambda_mwp, 0, 0, 0],
    [lambda_mwp, lambda_mwp, lambda_mwp2mu, 0, 0, 0],
    [0, 0, 0, mu_mwp, 0, 0],
    [0, 0, 0, 0, mu_mwp, 0],
    [0, 0, 0, 0, 0, mu_mwp],
  ];

  const S_mwp = inverse(C_mwp);

  const S_mwp2 = JSON.parse(JSON.stringify(S_mwp));

  const lastIndexes = [3, 4, 5];
  for (let row = 0; row < C_mwp.length; row++) {
    for (let column = 0; column < C_mwp[0].length; column++) {
      if (lastIndexes.includes(row) !== lastIndexes.includes(column)) {
        S_mwp2[row][column] *= 2;
      } else if (lastIndexes.includes(row) && lastIndexes.includes(column)) {
        S_mwp2[row][column] *= 4;
      }
    }
  }

  const C_t = convert2Tensor(C);
  const S_t = convert2Tensor(S_mwp);

  const valueInParens = S_t.map((value, indexes) => {
    const kl = indexes.slice(2);

    const row = kl[0];
    const column = kl[1];
    const sigmaAtIndex = sigma[row][column];

    const newValue = value * sigmaAtIndex;

    return newValue;
  }).contraction([2, 3]);

  const sigma_m = C_t.map((value, indexes) => {
    const kl = indexes.slice(2);

    const S = valueInParens.get(kl) as number;

    const newValue = value * S;

    return newValue;
  }).contraction([2, 3]);

  // console.log(JSON.stringify(sigma_m.data, null, 2));
  const sigma_m_33 = sigma_m.get([2, 2]) as number;

  console.log({
    lambda,
    lambda_mwp,
    mu,
    mu_mwp,
    mu1,
    mu2,
    C_t,
    C_mwp,
    S_t,
    sigma_m,
  });

  return sigma_m_33;
};
