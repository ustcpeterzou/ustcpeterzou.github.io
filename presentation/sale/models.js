/* Closed-form mechanism illustrations; these are not experimental SALE runs. */
(() => {
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const interval = (verified, uncertainty) => {
    const center = 50 + 20 * verified;
    const allowance = 8 + 5 + uncertainty;
    const lower = Math.max(0, center - allowance);
    const upper = Math.min(100, center + allowance);
    return {center, lower, upper, width: upper - lower,
      feasibleLower: center - 13, feasibleUpper: center + 13,
      uniformWidth: Math.max(.1, Math.min(1, 2 * allowance / 100))};
  };
  const response = (cost, report) => {
    // On the displayed regular interval, uniform [-10,10] noise gives g(u)=(u+10)/2.
    const anticipated = (14 + 3 * report + 10) / 2;
    const manipulation = .5 * cost * (report - 1) ** 2;
    return {anticipated, manipulation, total: anticipated + manipulation,
      optimal: 1 - 1.5 / cost};
  };
  const schedule = (width, m) => {
    const ell = 20000;
    const lambda = 1 + Math.log(ell) + 6 * Math.log(51);
    const alpha = (2*m+3)/(4*m+1);
    const exponent = (2*m+8)/(4*m+1);
    const kappa = (6*m-6)/(4*m+1);
    const base = .1 * (ell * lambda) ** alpha;
    return {ell, blind: Math.min(ell, Math.ceil(base)), sale: Math.min(ell, Math.ceil(base * width ** -exponent)), gain: width ** kappa};
  };
  window.SaleModels = {clamp, interval, response, schedule};
})();
