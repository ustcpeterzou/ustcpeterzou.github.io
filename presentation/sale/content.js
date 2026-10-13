/* Presentation copy follows the current manuscript and Beamer. */
(() => {
  const S = String.raw;
  const math = (tex, display = false) => `<${display ? 'div' : 'span'} class="math ${display ? 'display' : 'inline'}">${tex.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</${display ? 'div' : 'span'}>`;
  const eq = (id) => { const e = RESEARCH.equations[id]; const numbers = e.labels.map(label => RESEARCH.equations[label].number).join(', '); return `<div class="equation" id="${id}">${math(e.tex, true)}<a class="equation-number" href="#${id}">(${numbers})</a></div>`; };
  const statement = id => {const s = RESEARCH.statements[id]; return `<article class="statement"><h3>${s.name} ${s.number}<span>${s.title}</span></h3><div class="statement-body">${s.html}</div></article>`;};
  const figure = (name, alt, cls = '') => `<button class="figure ${cls}" data-image="assets/${name}.png" data-title="${alt}" title="Enlarge figure" aria-label="Enlarge ${alt}"><img src="assets/${name}.png" alt="${alt}"></button>`;
  const ref = (id, label) => `<a class="ref" href="#${id}">${label || '(' + RESEARCH.equations[id].number + ')'}</a>`;
  const foot = text => `<p class="source">${text}</p>`;
  const take = text => `<p class="takeaway">${text}</p>`;
  const icon = name => `<i data-lucide="${name}"></i>`;
  const control = (id, label, min, max, step, value) => `<label class="slider-control" for="${id}"><span>${label}</span><output id="${id}-value">${value}</output><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
  const slides = [];
  const add = (id, section, title, body, cls = '') => slides.push({id, section, title, body, cls});
  add('cover', 'Source-Aware Dynamic Pricing', 'Source-Aware<br>Dynamic Pricing<br><span class="teal">with Strategic Buyers</span>', `
    <p class="cover-author">Jinjiang Zou <span>/</span> University of Science and Technology of China</p>
    <div class="cover-visual"><canvas id="cover-canvas" aria-label="Full pricing domain and personalized exploration intervals"></canvas></div>
    <div class="cover-bottom"><span>Verified information. Personalized exploration.</span><span>October 2026</span></div>`, 'cover');
  add('motivation', 'Motivation', 'Many features.<br>Different sources.', `
    <p class="lead">Effective personalized pricing depends on accurately learning how buyer features affect willingness to pay.</p>
    <div class="feature-columns"><div><span class="overline teal">Verified features</span><h3>Credit and repayment histories</h3><p>Account activity and information obtained from reliable records.</p><div class="feature-dictionary verified-dictionary" aria-hidden="true"></div></div>
    <div><span class="overline red">Reportable features</span><h3>Responses to a loan application</h3><p>Buyer-provided information that may be strategically misreported to seek a lower price.</p><div class="feature-dictionary reportable-dictionary" aria-hidden="true"></div></div></div>
    ${take('High-dimensional buyer information is not equally open to manipulation.')}
    ${foot('Javanmard and Nazerzadeh (2019); Wang et al. (2024); Liu et al. (2025).')}`);
  add('information', 'Motivation', 'Why feature source matters', `
    <p class="lead">Verified features remain reliable inputs. Buyers can alter reportable features in response to the pricing rule.</p>
    ${figure('source-information','Information structure in source-aware contextual pricing','large-figure')}
    ${take('Source-aware pricing uses verified information and adjusts for strategic reports.')}`);
  add('literature', 'Motivation', 'Two lines of research', `
    <div class="literature-grid"><article><span class="overline">Liu et al. (2025)</span><h3>Contextual Dynamic Pricing<br>with Strategic Buyers</h3><ul><li>Low-dimensional features and known market noise.</li><li>Feature-independent randomized exploration.</li><li>Strategic correction in exploitation.</li></ul></article>
    <article><span class="overline">Fan et al. (2024)</span><h3>Policy Optimization Using<br>Semiparametric Models</h3><ul><li>Unknown noise distribution and binary purchase feedback.</li><li>Nonparametric pricing-map learning.</li><li>A high-dimensional extension, without strategic reporting.</li></ul></article></div>
    ${take('SALE distinguishes feature sources in high-dimensional semiparametric pricing with strategic buyers.')}
    ${foot('Both papers appear in the Journal of the American Statistical Association. Fan et al. use variable selection followed by least-squares refitting in their high-dimensional extension.')}`);
  add('model', 'Problem Setting', 'Valuation and purchase feedback', `
    <p>At time ${math('t')}, the buyer has verified features ${math(S`\x_{t,\V}^0`)} and reportable features ${math(S`\x_{t,\R}^0`)}.</p>
    ${math(S`\x_t^0=\big((\x_{t,\V}^0)^\top,(\x_{t,\R}^0)^\top,1\big)^\top,\qquad v_t=\tht_0^\top\x_t^0+z_t`,true)}
    <div class="model-lines"><p><strong>High dimension.</strong> ${math(S`s_0=\|\tht_0\|_0\ll d`)}. Valuation depends on a sparse high-dimensional linear model.</p><p><strong>Unknown market noise.</strong> Mean-zero i.i.d. ${math('z_t')} has unknown cdf ${math('F')}, supported on ${math(S`(-\delta_z,\delta_z)`)}.</p><p><strong>Binary feedback.</strong> If ${math(S`p_t\le v_t`)}, a sale occurs and the seller receives ${math('p_t')}. The seller observes ${math(S`y_t=\mathbb I\{p_t\le v_t\}`)}.</p></div>
    ${foot(S`Valuations lie in \( [\delta_v,B-\delta_v] \). Feature arrivals may be dependent under predictable context stability. The horizon need not be known.`)}`);
  add('oracle', 'Problem Setting', 'Oracle pricing and regret', `
    <p>Let ${math(S`u_t=\tht_0^\top\x_t^0`)} denote valuation excluding market noise. Expected revenue at price ${math('p')} is</p>
    ${math(S`\operatorname{rev}_t(p)=p\{1-F(p-u_t)\}.`,true)}
    <p>The clairvoyant seller knows ${math(S`(\tht_0,F,\x_t^0)`)} and posts ${math(S`p_t^*=g(u_t)`)}, where</p>
    ${math(S`g(u)\in\argmax_{p\in[0,B]}p\{1-F(p-u)\}.`,true)}
    <p>We compare cumulative expected revenue with this oracle.</p>
    ${math(S`\Reg_\pi(T)=\E_\pi\sum_{t=1}^T\big\{\operatorname{rev}_t(p_t^*)-\operatorname{rev}_t(p_t)\big\}.`,true)}
    ${foot('If the maximum expected revenue is zero, set g(u) = 0.')}`);
  add('reporting', 'Strategic Buyers', 'Two pricing phases', `
    ${figure('reporting-modes','Buyer reporting under exploration and exploitation','mechanism-figure')}
    <p>The seller announces the pricing phase and the form of the pricing rule before the buyer reports.</p>
    ${foot('The buyer knows her valuation information and the true pricing function. The seller does not reveal the estimates used for exploitation.')}`);
  add('response', 'Strategic Buyers', 'The buyer balances price and cost', `
    <p class="compact">The buyer knows ${math(S`\tht_0,F`)} and hence ${math('g')}, but not the seller's estimates. Only reportable features enter the reporting decision.</p>
    <div class="interactive-layout"><div class="plot-region"><div class="plot-legend"><span class="teal">Anticipated price</span><span class="red">Manipulation cost</span><span>Total</span></div><canvas id="response-canvas" aria-label="Anticipated price, quadratic manipulation cost and total cost as functions of the report"></canvas><div class="metrics"><div><span>True feature</span><strong>1.00</strong></div><div><span>Optimal report</span><strong id="best-report">0.00</strong></div><div><span>Manipulation</span><strong id="report-change">0.00</strong></div></div></div><div class="controls-panel">
    ${control('cost-a','Manipulation cost A',0.8,4,0.1,1.2)}${control('reported-q','Reported feature',-1,2,0.01,1)}
    <button id="optimal-report" class="command">${icon('crosshair')} Optimal report</button>
    ${math(S`\argmin_{x_{\R}}\left\{g(\theta_0^\top x)+\tfrac A2(x_{\R}-x_{\R}^0)^2\right\}`,true)}
    <p class="small">Verified features remain fixed. Exploration prices do not depend on the current report.</p></div></div>
    ${foot('Mechanism illustration, not a simulation result. One reportable coordinate, bounded uniform mean-zero noise. The illustrated optimum is interior. Parameters and formulas are documented in README.md.')}`, 'interactive-slide');
  add('correction', 'Strategic Buyers', 'From reports to calibrated prices', `
    <p>Under the interior-response conditions, the buyer's first-order condition gives</p>${eq('eq:manipulation')}
    <p>The seller corrects the valuation computed from reported features before applying the pricing function.</p>${eq('eq:correction')}
    ${take(S`Implementing the correction requires estimates of \(\theta_0\), \(g\), and \(g'\).`)}`);
  add('cycle', 'SALE Policies', 'Learning updates the next exploration', `
    <p>Episodes double in length. Each episode contains exploration, followed by exploitation.</p>
    ${figure('sale-learning-cycle','SALE learning and exploration cycle','cycle-figure')}
    <div class="stage-selector" role="group" aria-label="Algorithm stage"><button class="active" data-stage="0">01 <span>Explore</span></button><button data-stage="1">02 <span>Estimate</span></button><button data-stage="2">03 <span>Calibrate</span></button><button data-stage="3">04 <span>Update intervals</span></button></div>
    <div class="stage-explanation"><h3 id="stage-heading"></h3><div id="stage-text"></div></div>
    <div class="stage-actions"><button id="cycle-play" class="icon-button" title="Play cycle" aria-label="Play cycle">${icon('play')}</button><span id="cycle-episode">Episode k</span></div>`);
  add('sale-k', 'SALE Policies', 'SALE-K: exploration', `
    <div class="algorithm"><h3>Algorithm 1 <span>Known manipulation cost</span></h3><ol>
    <li><strong>Input:</strong> ${math(S`B,\ell_0,\A`)}. Initialize ${math(S`L_1=0,\ U_1=B`)}.</li>
    <li>For episode ${math('k')}, set ${math(S`\ell_k=2^{k-1}\ell_0`)} and ${math(S`S_k=1+\sum_{j<k}\ell_j`)}.</li>
    <li>Choose exploration duration ${math('a_k')} by ${ref('eq:schedule')}. Set ${math(S`I_k=\{S_k,\ldots,S_k+a_k-1\}`)} and ${math(S`I_k'=\{S_k+a_k,\ldots,S_k+\ell_k-1\}`)}.</li>
    <li>For ${math(S`t\in I_k`)}, observe ${math(S`\x_{t,\V}^0`)} and the truthful report ${math(S`\x_{t,\R}=\x_{t,\R}^0`)}.</li>
    <li class="algorithm-emphasis">Draw ${math(S`p_t\sim\Unif\big(L_k(\x_{t,\V}^0),U_k(\x_{t,\V}^0)\big)`)} and observe ${math('y_t')}.</li>
    </ol></div>${take('Current verified features personalize the price distribution. Current reports do not enter it.')}`);
  add('sale-k-pricing', 'SALE Policies', 'SALE-K: estimation and exploitation', `
    <div class="algorithm"><h3>Algorithm 1 <span>Continue episode k</span></h3><ol>
    <li>Estimate ${math(S`\widehat\tht_k`)} by ${ref('eq:lasso')} and ${math(S`\widehat g_k,\widehat g_k'`)} by ${ref('eq:map')} from the exploration observations.</li>
    <li>Construct ${math(S`L_{k+1},U_{k+1}`)} using ${math(S`\widehat\tht_k`)} by ${ref('eq:intervals')}.</li>
    <li>For ${math(S`t\in I_k'`)}, observe ${math(S`\x_t`)} and post the calibrated price:</li></ol>${eq('eq:price-k')}<ol start="4"><li>Observe ${math('y_t')}. Continue with the next episode.</li></ol></div>
    ${foot('If a required pricing-map evaluation fails, post B/2.')}`);
  add('localization', 'SALE Policies', 'From a global domain to a personalized interval', `
    <div class="interactive-layout"><div class="plot-region"><canvas id="interval-canvas" aria-label="Global pricing domain, feasible valuations and personalized exploration interval"></canvas>
    <div class="metrics"><div><span>SALE interval</span><strong id="interval-bounds"></strong></div><div><span>Buyer-specific width</span><strong id="interval-width"></strong></div><div><span>Global domain</span><strong>[0, 100]</strong></div></div></div>
    <div class="controls-panel">${control('verified-x','Verified feature',-1,1,0.05,0.2)}${control('current-report','Current report',-1,1,0.05,0.4)}${control('uncertainty','Parameter uncertainty',0,35,0.5,12)}
    <div class="inline-command"><button id="draw-price" class="command">${icon('shuffle')} Draw a price</button><output id="sampled-price"></output></div>
    <div class="legend-stack"><span class="teal">Verified valuation component</span><span class="red">Unknown true reportable features</span><span class="blue">Parameter uncertainty and noise</span></div></div></div>
    ${take('Verified features move the interval. The current report does not change it.')}
    <details><summary>Interval construction ${ref('eq:intervals')}</summary>${eq('eq:allowance')}${eq('eq:intervals')}</details>
    ${foot('Illustrative interval calculation: B = 100, verified slope = 20, reportable slope = 8, intercept = 50, noise support (-5,5). The uncertainty slider represents the prescribed confidence allowance, not a new tuning rule.')}`, 'interactive-slide');
  add('width', 'SALE Policies', 'Narrower intervals. Longer exploration.', `
    <p>A narrower interval lowers the regret cost of each exploration price. SALE can explore longer to improve estimation.</p>
    <div class="interactive-layout"><div class="plot-region"><canvas id="schedule-canvas" aria-label="Exploration and exploitation duration for SALE and global-width exploration"></canvas><div class="metrics"><div><span>SALE exploration</span><strong id="sale-duration"></strong></div><div><span>Global-width exploration</span><strong id="blind-duration"></strong></div><div><span>Width-gain factor</span><strong id="width-gain"></strong></div></div></div><div class="controls-panel">${control('schedule-width','Uniform width bound',0.1,1,0.01,0.5)}<label class="select-control">Noise smoothness m<select id="smoothness"><option>3</option><option selected>4</option><option>5</option></select></label><p class="small">The schedule uses the largest normalized interval width, not the width of one arriving buyer.</p></div></div>
    ${eq('eq:schedule')}<details><summary>Definition of the uniform width bound</summary>${eq('eq:width')}</details>
    ${foot('Schedule illustration with fixed episode length 20,000, d = 50, s0 = 6 and c_a = 0.1. The width-gain factor is an upper-bound factor, not an observed regret ratio.')}`, 'interactive-slide');
  add('sparse-learning', 'SALE Policies', 'Binary feedback becomes a valuation signal', `
    <p>Uniform exploration gives an unbiased response when the interval covers all feasible valuations.</p>${eq('eq:response')}
    <p>SALE learns the sparse valuation parameter by regularized least squares.</p>${eq('eq:lasso')}
    <p class="small">${math(S`\lambda_k=c_\lambda\sqrt{\{1+\log\ell_k+\log(d+1)\}/a_k}`)}. The same estimate supports current pricing and the next episode's exploration.</p>`);
  add('map-learning', 'SALE Policies', 'Learning the unknown pricing function', `
    <p>For ${math(S`w_t(\tht)=p_t-\tht^\top\x_t^0`)}, SALE estimates the market-noise distribution from the same exploration observations.</p>${eq('eq:noise')}
    <p>The estimated virtual valuation gives the price and its slope.</p>${eq('eq:map')}
    ${take(S`\(\widehat g_k\) sets the price; \(\widehat g_k'\) enters the strategic correction.`)}
    ${foot('K is an order-m kernel. Estimating g\u2032 requires F\u2033. Inversion is safeguarded on the regular pricing interval; a failed required evaluation gives price B/2.')}`);
  add('sale-u', 'SALE Policies', 'Unknown costs: learn the strategic adjustment', `
    <p>SALE-U retains localized exploration and the estimators of SALE-K. Repeat buyers supply matched true and reported features.</p>${eq('eq:gamma-model')}${eq('eq:gamma')}
    ${take('Estimate the strategic adjustment, not the full cost matrix.')}
    ${foot('The archive stores one pair per buyer. The two visits may occur in either order and share the same true features. The slope estimates must exist and the denominator must be positive.')}`);
  add('sale-u-exploration', 'SALE Policies', 'SALE-U: exploration and matching', `
    <div class="algorithm"><h3>Algorithm 2 <span>Unknown manipulation cost</span></h3><ol>
    <li><strong>Input:</strong> ${math(S`B,\ell_0`)}. Initialize ${math(S`L_1=0,U_1=B`)} and ${math(S`\mathcal E_1,\mathcal E_2,\mathcal M=\varnothing`)}.</li>
    <li>Set episode times and exploration duration as in Algorithm 1.</li>
    <li>During exploration, observe ${math(S`\x_t^0,\mathrm{id}_t`)}, draw a uniform price from the personalized interval, and observe ${math('y_t')}.</li>
    <li>Store the first truthful observation of each ID in ${math(S`\mathcal E_1`)}. If the ID already appears in ${math(S`\mathcal E_2`)} and not in ${math(S`\mathcal M`)}, add the matched pair.</li>
    <li>Estimate ${math(S`\widehat\tht_k,\widehat g_k,\widehat g_k'`)} by ${ref('eq:lasso')} and ${ref('eq:map')}. Construct the next intervals by ${ref('eq:intervals')}.</li>
    </ol></div>${foot('E1 and E2 store the first exploration and exploitation records, respectively. Matching supports both arrival orders.')}`);
  add('sale-u-pricing', 'SALE Policies', 'SALE-U: exploitation and pricing', `
    <div class="algorithm"><h3>Algorithm 2 <span>Continue episode k</span></h3><ol>
    <li>Observe ${math(S`\x_t,\mathrm{id}_t`)}. Store the first reported observation in ${math(S`\mathcal E_2`)}. Match with ${math(S`\mathcal E_1`)} if possible and not already paired.</li>
    <li><strong>Matched buyer:</strong> price using the stored true features, ${math(S`p_t=\clip\{\widehat g_k(\widehat\tht_k^\top\x_t^0)\}`)}.</li>
    <li><strong>Otherwise, if available:</strong> estimate ${math(S`\widehat\gam_t`)} by ${ref('eq:gamma')} and post</li></ol>${eq('eq:price-u')}<ol start="4"><li><strong>Otherwise:</strong> post ${math(S`p_t=\clip\{\widehat g_k(\widehat\tht_k^\top\x_t)\}`)}. Observe ${math('y_t')}.</li></ol></div>
    ${foot('A failed required pricing-map evaluation gives price B/2. Clipping restricts prices to [0,B].')}`);
  add('analysis', 'Regret Analysis', 'Three parts of the argument', `
    <div class="argument-list"><article><span>01</span><div><h3>Sparse valuation estimation</h3><p>A population equation and martingale concentration support learning under non-i.i.d. arrivals.</p></div></article><article><span>02</span><div><h3>Nonparametric pricing-map estimation</h3><p>Localized empirical-process analysis controls the high-dimensional estimation error entering noise learning.</p></div></article><article><span>03</span><div><h3>Confidence recovery</h3><p>The recovery argument controls the expected cost of episodes affected by inaccurate exploration intervals.</p></div></article></div>
    ${take('Together, these results yield an unconditional expected regret bound.')}`);
  add('assumptions-features', 'Regret Analysis', 'Features and arrivals', statement('ass:features')+statement('ass:context')+foot('The coordinate bound accommodates high dimension. Predictable context stability permits dependence but restricts changes in the conditional second moment.'), 'formal');
  add('assumptions-noise', 'Regret Analysis', 'Market noise and pricing', statement('ass:noise')+statement('ass:pricing')+take('Smooth noise supports kernel estimation. A regular pricing equation permits stable inversion.'), 'formal');
  add('assumptions-response', 'Regret Analysis', 'Strategic response and the kernel', statement('ass:response')+statement('ass:kernel')+foot('The interior response keeps strategic correction in the regular pricing region. The kernel condition concerns the estimator chosen by the seller.'), 'formal');
  add('sample-conditions', 'Regret Analysis', 'Conditions for the estimation bounds', `<p>For sparse estimation, choose the penalty and exploration duration so that</p>${eq('eq:sparse-conditions')}<p>For noise and pricing-map estimation, respectively,</p>${eq('eq:noise-conditions')}<p class="small">Thresholds depend on fixed regularity, kernel and tuning constants. Take ${math(S`C_\theta\ge3/\lambda_{\min}`)}.</p>`, 'formal');
  add('sparse-result', 'Regret Analysis', 'Sparse estimation controls two errors', `<p class="small">${math(S`\mathcal H_{k-1}=\mathcal F_{S_k-1}`)} is the pre-episode history. On ${math(S`\mathcal G_k`)}, the exploration intervals cover all feasible valuations.</p>${statement('lem:sparse')}<div class="two-points"><p><strong class="teal">The L2 bound</strong> controls error passed to noise estimation.</p><p><strong class="blue">The L1 bound</strong> certifies the next exploration interval.</p></div>`, 'formal');
  add('noise-result', 'Regret Analysis', 'Learning F and its derivatives', `<p class="small">${math(S`q_k=a_k^{-1}\sum_{t\in I_k}W_k(\x_{t,\V}^0)^{-1}\ge1/(B\omega_k)`)}. The compact interval ${math('J')} contains the oracle residuals in its interior.</p>${statement('lem:noise')}${foot('Uniform control is established before substituting the random sparse estimate.')}`, 'formal dense');
  add('map-result', 'Regret Analysis', 'From noise learning to calibrated pricing', statement('lem:map')+take('The bound combines sparse estimation error, kernel bias and stochastic error.')+foot('A smaller uniform width increases the residual-design density. Localized empirical-process control allows reuse of the exploration observations.'), 'formal');
  add('contraction-result', 'Regret Analysis', 'Returning to valid confidence', `<p class="small">${math(S`\overline\Sigma_k=a_k^{-1}\sum_{t\in I_k}\Sigma_t,\qquad e_k=\|\widehat\tht_k-\tht_0\|_{\overline\Sigma_k}`)}.</p>${statement('lem:contraction')}<p class="small">${math(S`\mathcal C_k=\{\tht\in\Theta:\|\tht-\widehat\tht_k\|_2\le C_\theta\lambda_k\sqrt{s_0},\ \|\tht-\widehat\tht_k\|_1\le4C_\theta s_0\lambda_k\}`)}.</p>${foot('Constants may depend on the fixed noise distribution through its endpoint tails.')}`, 'formal dense');
  add('recovery-result', 'Regret Analysis', 'Failures have finite expected recovery cost', `<p>High-probability estimation alone does not guarantee permanent interval coverage.</p>${statement('lem:recovery')}${take('The regret guarantee includes recovery costs, rather than assuming failures never occur.')}${foot('C_rec does not depend on k_star, T, d or s0.')}`, 'formal');
  add('repeat-rate', 'Regret Analysis', 'Matched records and the effective repeat rate', `<p>Let ${math(S`N_k=\sum_{j\le k}a_j`)} and let ${math('n_t')} count distinct matched buyers. The effective rate is the largest ${math(S`\tau\in[0,1]`)} satisfying</p>${math(S`\max\{1,n_t\}\ge\tau N_k\quad\text{almost surely for all relevant }k,t.`,true)}<p class="small">The expected-regret analysis also permits ${math(S`\E\!\left[\frac{N_k}{\max\{1,n_t\}}\middle|\mathcal F_{S_k+a_k-1}\right]\le1/\tau`)}.</p><p>Lemma 6 uses ${math(S`B_\gamma\ge B_{\mathrm{map}}`)} and</p>${eq('eq:gamma-conditions')}${foot('B_gamma depends on fixed model, tuning and margin constants, not k,T,d,s0 or tau. Numerical return frequencies need not equal the effective matched-record rate.')}`, 'formal');
  add('gamma-result', 'Regret Analysis', 'Learning the strategic adjustment', `<p class="small">Write ${math(S`\rho_A=\max\{1,\|\A^{-1}\|_{\mathrm{op}}\}`)}.</p>${statement('lem:gamma')}${take('The factor 1 / tau records the cost of learning from a smaller matched sample.')}${foot('C_gamma does not absorb rho_A or tau.')}`, 'formal');
  add('effective-width', 'Regret Analysis', 'The effective width summarizes localization', `<p class="small">${math(S`\alpha_m=(2m+3)/(4m+1),\quad\kappa_m=(6m-6)/(4m+1),\quad\Lambda_T=1+\log T+s_0\log(d+1)`)}.</p><p>Let ${math('K_T')} be the last episode beginning by ${math('T')}. For ${math(S`\pi\in\{\mathrm K,\mathrm U\}`)},</p>${eq('eq:effective-width')}<div class="two-points"><div><p><strong>Global exploration</strong></p>${math(S`\omega_{\pi,T}=1`,true)}</div><div><p><strong class="teal">Localized exploration</strong></p>${math(S`\omega_{\min}\le\omega_{\pi,T}\le1`,true)}</div></div>${foot('This regret-weighted power mean summarizes the width gain. It is not a policy input.')}`);
  add('horizon-conditions', 'Regret Analysis', 'Horizon conditions for the leading bound', `<p>The leading regret bounds apply when</p>${eq('eq:horizon')}<ul><li>These conditions absorb initial estimation and recovery costs into the leading term.</li><li>They are conditions for the bound, not policy inputs.</li><li>For SALE-U, the fixed constant may be enlarged without depending on ${math(S`\tau`)}.</li></ul>`);
  add('regret-k', 'Regret Analysis', 'Sublinear regret with a localization gain', statement('thm:known')+`<div class="two-points"><p><strong>Learning rate</strong>Sublinear in the horizon, with dimension entering through ${math(S`\log(d+1)`)}.</p><p><strong class="teal">Source-aware gain</strong>${math(S`\omega_{\mathrm K,T}^{\kappa_m}`)} quantifies the improvement from narrower exploration intervals.</p></div>`+foot('This is a comparison of regret upper bounds, not a statement of pathwise dominance.'), 'formal result');
  add('regret-u', 'Regret Analysis', 'Unknown costs preserve the regret order', statement('thm:unknown')+take('Matched repeat-buyer observations retain the same dependence on horizon, dimension and smoothness.')+foot('The additional factor 1/tau is explicit. The effective repeat-buyer rate is not a policy input.'), 'formal result');
  add('experiments', 'Numerical Experiments', 'Evidence across pricing environments', `
    <div class="experiment-tabs" role="tablist" aria-label="Experiment"><button role="tab" class="active" data-experiment="0" aria-selected="true">Feature sources</button><button role="tab" data-experiment="1" aria-selected="false">High dimension</button><button role="tab" data-experiment="2" aria-selected="false">Unknown cost</button><button role="tab" data-experiment="3" aria-selected="false">Unknown noise</button><button role="tab" data-experiment="4" aria-selected="false">AutoLoan</button></div>
    <button id="experiment-image" class="figure experiment-figure" data-image="assets/source_composition_selected.png" title="Enlarge experiment figure" aria-label="Enlarge experiment figure"><img id="experiment-img" src="assets/source_composition_selected.png" alt="Source composition experiment"></button>
    <div class="experiment-caption"><p id="experiment-conclusion" class="takeaway"></p><p id="experiment-setting" class="source"></p></div>`, 'experiment-slide');
  add('conclusion', 'Conclusion', 'Information source<br>changes how we learn to price.', `
    <div class="conclusion-list"><p><span>01</span>Verified features localize randomized exploration.</p><p><span>02</span>Sparse and nonparametric learning support calibrated pricing.</p><p><span>03</span>Confidence recovery closes the expected regret guarantee.</p></div>
    <div class="closing"><strong>Thank you.</strong><span>Jinjiang Zou<br>University of Science and Technology of China</span></div>`,'conclusion');
  window.SLIDES = slides;
  window.TEX = math;
})();
