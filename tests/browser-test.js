/*
 * Service Hours Hub — automated feature test
 * ------------------------------------------
 * How to run:
 *   1. npm run dev   → open the printed URL (http://localhost:5173/)
 *   2. Open DevTools → Console (Mac: Cmd+Option+J in Chrome, Cmd+Option+C in Safari)
 *   3. Paste this whole file and press Enter.
 * It resets the data, clicks through every required feature, prints a PASS/FAIL table,
 * and resets the data again at the end.
 */
(async () => {
  const KEY = 'acl-service-hours-v1';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const text = s => ($(s)?.innerText || '');
  const button = label => $$('button').find(b => b.textContent.trim().includes(label));
  const stored = () => JSON.parse(localStorage.getItem(KEY));
  const results = [];
  const check = (name, ok, detail = '') => results.push({ result: ok ? '✅ PASS' : '❌ FAIL', test: name, detail });

  // Type into a React-controlled input/select/textarea.
  function setValue(el, value) {
    const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype
      : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  }
  async function click(el) { el.click(); await sleep(120); }
  async function type(sel, value) { setValue($(sel), value); await sleep(80); }
  async function go(hash) { location.hash = hash; await sleep(200); }
  async function reset() {
    await go('#/');
    await click($('button.btn-danger'));
  }
  const feedCount = () => $$('#activity .entry').length;

  const realConfirm = window.confirm;
  window.confirm = () => true; // auto-accept the "Reset data?" confirmation

  try {
    // ---------- Start from the example records ----------
    await reset();
    check('Reset data restores the 10 example records', stored()?.length === 10);

    // ---------- Browse entries ----------
    check('Activity feed lists all 10 entries', feedCount() === 10, `${feedCount()} shown`);
    const first = $('#activity .entry');
    check('Entry shows program code + name', /ENV110/.test(first.innerText) && /Campus Green Team/.test(first.innerText));
    check('Entry shows hours, reflection and volunteer', /3\s*h/.test(first.innerText) && /Planting day/.test(first.innerText) && /You/.test(first.innerText));
    check('Edit button only on your own entries',
      $$('#activity .entry.mine button').length === 2 && $$('#activity .entry:not(.mine) button').length === 0);

    // ---------- Search & filter ----------
    const search = '#activity input[type=search]';
    await type(search, 'env110');    check('Search by program code (ENV110 → 3)', feedCount() === 3, `${feedCount()} shown`);
    await type(search, 'recursion'); check('Search by reflection text (recursion → 1)', feedCount() === 1, `${feedCount()} shown`);
    await type(search, 'omar');      check('Search by volunteer name (Omar → 1)', feedCount() === 1, `${feedCount()} shown`);
    await type(search, '');
    await type('#activity select', '2'); check('Filter by hours (2 hours → 3)', feedCount() === 3, `${feedCount()} shown`);
    await type('#activity select', 'all');
    await click($('#activity .check input')); check('"Only my entries" (→ 2)', feedCount() === 2, `${feedCount()} shown`);
    await click($('#activity .check input'));
    check('Filters cleared (→ 10)', feedCount() === 10);

    // ---------- Overview stats ----------
    const kpis = $$('.kpis .stat-value').map(e => e.innerText.replace(/\s+/g, ' ').trim());
    check('Total entries = 10', kpis[0] === '10', kpis[0]);
    check('Average hours per entry = 3.6', kpis[1]?.startsWith('3.6'), kpis[1]);
    check('Programs with activity = 5', kpis[2] === '5', kpis[2]);
    const bars = $$('.bar-count').map(e => e.innerText).join(',');
    check('Hours distribution 1–8 = 1,3,2,1,1,1,0,1', bars === '1,3,2,1,1,1,0,1', bars);

    // ---------- Program check ----------
    await type('.lookup input', 'edu210');
    const look = $$('.lookup dd').map(e => e.innerText.trim()).join(' | ');
    check('Program check EDU210: 2.5 h avg | 2 entries | 5 h total', look === '2.5 h | 2 | 5 h', look);
    await click(button('Open program page'));
    check('Program check opens #/programs/EDU210', location.hash === '#/programs/EDU210', location.hash);

    // ---------- Program details page ----------
    await go('#/programs/TEC220');
    const page = text('main');
    check('Program page URL is shareable (#/programs/TEC220)', location.hash === '#/programs/TEC220');
    check('Shows program name', page.includes('Digital Skills for Seniors'));
    check('Shows partner organisation', page.includes('City Community Library'));
    check('Shows short description', page.includes('One-to-one sessions'));
    check('Shows 2025/26 team', page.includes('2025/26') && page.includes('Dr. Khaled Mourad') && page.includes('Reem Atef'));
    check('Shows 2024/25 team', page.includes('2024/25') && page.includes('Dr. Inas Farag') && page.includes('Mai Yehia'));
    check("Shows that program's entries", page.includes('Patience matters') && page.includes('Lina'));
    await go('#/programs/XYZ999');
    check('Unknown code shows "Program details not yet added"', text('main').includes('Program details not yet added'));

    // ---------- Log hours + validation ----------
    await go('#/programs/TEC220');
    await click(button('Log hours for this program'));
    check('Log form opens with program code pre-filled', $('#f-code')?.value === 'TEC220');
    const submit = () => click(button('Save entry'));
    const formOpen = () => Boolean($('.drawer'));

    await type('#f-hours', '');  await submit();
    check('Rejects empty hours', formOpen() && /whole number from 1 to 8/.test(text('.drawer')));
    await type('#f-hours', '0');   await submit(); check('Rejects 0 hours', formOpen());
    await type('#f-hours', '9');   await submit(); check('Rejects 9 hours', formOpen());
    await type('#f-hours', '2.5'); await submit(); check('Rejects 2.5 hours (must be whole)', formOpen());
    await type('#f-hours', '3');
    await type('#f-code', '');     await submit();
    check('Rejects empty program code', formOpen() && /Enter a program code/.test(text('.drawer')));
    await type('#f-code', 'env110'); await submit();
    check('Rejects a 2nd entry for a program you already logged', formOpen() && /already logged/.test(text('.drawer')));

    await type('#f-code', 'tec220');
    await type('#f-ref', 'Automated test entry');
    await submit();
    const saved = stored()[0];
    check('Valid entry saves and form closes', !formOpen());
    check('Saved with code in UPPER CASE, hours as number, owner "you"',
      saved.programCode === 'TEC220' && saved.hours === 3 && saved.owner === 'you' && saved.reflection === 'Automated test entry');
    check('Success message is shown', /Logged 3 hours for TEC220/.test(text('.toast')));
    check('New entry appears on the program page', $$('main .entry.mine').length === 1);

    // ---------- Edit only your own ----------
    await click(button('Edit your entry'));
    check('Edit form opens with your values', $('#f-hours')?.value === '3');
    await type('#f-hours', '5');
    await click(button('Save changes'));
    check('Edit is saved to localStorage', stored().find(e => e.programCode === 'TEC220' && e.owner === 'you')?.hours === 5);
    check("Other volunteers' entries have no Edit button", $$('main .entry:not(.mine) button').length === 0);

    // ---------- Persistence & reset ----------
    check('localStorage now holds 11 entries', stored().length === 11);
    await reset();
    check('Reset data restores 10 entries', stored().length === 10 && feedCount() === 10);
  } catch (err) {
    check('Test script crashed', false, String(err));
  } finally {
    window.confirm = realConfirm;
    await go('#/');
  }

  const failed = results.filter(r => r.result.includes('FAIL')).length;
  console.table(results);
  console.log(failed ? `%c${failed} of ${results.length} checks FAILED` : `%cAll ${results.length} checks passed 🎉`,
    `font-size:16px;font-weight:bold;color:${failed ? '#b2432c' : '#2f4a3a'}`);
  return { passed: results.length - failed, failed };
})();
