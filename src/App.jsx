import React, { useEffect, useMemo, useRef, useState } from 'react';

const KEY = 'acl-service-hours-v1';

// Fictional volunteering programs for the self-contained UI/UX exercise.
// Staff names, partners and descriptions are examples, not real university records.
const PROGRAMS = {
  ENV110: {
    name: 'Campus Green Team',
    partner: 'University Sustainability Office',
    description: 'Weekly tree planting, recycling audits and awareness stands that help the campus reduce its waste and energy use.',
    history: [
      {year: '2025/26', supervisors: ['Dr. Heba Lotfy'], coordinators: ['Malak Ashraf', 'Ziad Hamdy']},
      {year: '2024/25', supervisors: ['Dr. Sherif Galal'], coordinators: ['Jana Wael', 'Seif Mostafa']},
    ],
  },
  EDU210: {
    name: 'Peer Tutoring Circle',
    partner: 'Student Learning Center',
    description: 'Senior students run small study groups for first-year courses, preparing worked examples and answering questions.',
    history: [
      {year: '2025/26', supervisors: ['Dr. Nermine Aly'], coordinators: ['Hana Kamal', 'Marwan Essam']},
      {year: '2024/25', supervisors: ['Dr. Waleed Fouad'], coordinators: ['Laila Samy', 'Kareem Ayman']},
    ],
  },
  HLT150: {
    name: 'Blood Drive Crew',
    partner: 'Regional Blood Bank',
    description: 'Volunteers organise campus donation days, register donors and support the medical team on site.',
    history: [
      {year: '2025/26', supervisors: ['Dr. Amr Zaki'], coordinators: ['Salma Reda', 'Omar Hesham']},
      {year: '2024/25', supervisors: ['Dr. Mona Sabry', 'Dr. Amr Zaki'], coordinators: ['Nadia Fikry', 'Tarek Adel']},
    ],
  },
  COM305: {
    name: 'Community Kitchen',
    partner: 'Neighbourhood Food Network',
    description: 'Preparing and packing meals for local families, managing donations and keeping the kitchen inventory up to date.',
    history: [
      {year: '2025/26', supervisors: ['Dr. Ghada Ibrahim'], coordinators: ['Yasmin Talaat', 'Hazem Farid']},
      {year: '2024/25', supervisors: ['Dr. Ghada Ibrahim'], coordinators: ['Rania Saleh', 'Mostafa Emad']},
    ],
  },
  TEC220: {
    name: 'Digital Skills for Seniors',
    partner: 'City Community Library',
    description: 'One-to-one sessions that help older adults use smartphones, video calls, online banking and e-government services safely.',
    history: [
      {year: '2025/26', supervisors: ['Dr. Khaled Mourad'], coordinators: ['Reem Atef', 'Ahmed Nabil']},
      {year: '2024/25', supervisors: ['Dr. Inas Farag'], coordinators: ['Mai Yehia', 'Bassem Hany']},
    ],
  },
};
const UNKNOWN_PROGRAM = {
  name: 'Program details not yet added',
  partner: '—',
  description: 'This program does not have a profile in the example directory.',
  history: [],
};
const isKnownProgram = code => Boolean(PROGRAMS[code?.trim().toUpperCase()]);
const getProgram = code => PROGRAMS[code?.trim().toUpperCase()] || UNKNOWN_PROGRAM;
const programHref = code => `#/programs/${encodeURIComponent(code.toUpperCase())}`;
const readRoute = () => {
  const match = window.location.hash.match(/^#\/programs\/([^/?#]+)$/);
  return match ? decodeURIComponent(match[1]).toUpperCase() : null;
};
const seed = [
  {id:'e1',programCode:'ENV110',hours:3,reflection:'Planting day was well organised and the team lead explained every step.',owner:'you',name:'You',date:'2026-10-11'},
  {id:'e2',programCode:'EDU210',hours:2,reflection:'If you prepare examples in advance the sessions run smoothly.',owner:'other',name:'Habiba',date:'2026-10-08'},
  {id:'e3',programCode:'HLT150',hours:6,reflection:'Long shift but very rewarding. Bring water and snacks.',owner:'other',name:'Omar',date:'2026-10-03'},
  {id:'e4',programCode:'COM305',hours:4,reflection:'Packing went quickly once roles were clear.',owner:'you',name:'You',date:'2026-09-29'},
  {id:'e5',programCode:'TEC220',hours:2,reflection:'Patience matters more than technical knowledge here.',owner:'other',name:'Lina',date:'2026-09-25'},
  {id:'e6',programCode:'ENV110',hours:5,reflection:'Recycling audit took longer than planned.',owner:'other',name:'Youssef',date:'2026-09-19'},
  {id:'e7',programCode:'EDU210',hours:3,reflection:'Students asked great questions about recursion.',owner:'other',name:'Mariam',date:'2026-09-12'},
  {id:'e8',programCode:'HLT150',hours:8,reflection:'',owner:'other',name:'Ali',date:'2026-09-05'},
  {id:'e9',programCode:'COM305',hours:1,reflection:'Short orientation session only.',owner:'other',name:'Nour',date:'2026-08-28'},
  {id:'e10',programCode:'ENV110',hours:2,reflection:'Good for a first volunteering experience.',owner:'other',name:'Farah',date:'2026-08-20'},
];
function loadEntries(){try{const s=JSON.parse(localStorage.getItem(KEY));return Array.isArray(s)?s:seed;}catch{return seed;}}

const HOUR_OPTIONS = [1,2,3,4,5,6,7,8];
const meanHours = a => a.length?(a.reduce((s,e)=>s+e.hours,0)/a.length).toFixed(1):'—';
const sumHours = a => a.reduce((s,e)=>s+e.hours,0);
const plural = (n, word, many = `${word}s`) => `${n} ${n===1?word:many}`;
const formatDate = d => {
  const date = new Date(`${d}T00:00:00`);
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
};
const entriesFor = (entries, code) => entries.filter(e=>e.programCode.toUpperCase()===code?.trim().toUpperCase());
function programStats(list){
  const hrs = list.map(e=>e.hours);
  return {
    count: list.length,
    avg: meanHours(list),
    total: sumHours(list),
    range: list.length ? (Math.min(...hrs)===Math.max(...hrs) ? `${hrs[0]} h` : `${Math.min(...hrs)}–${Math.max(...hrs)} h`) : '—',
  };
}

/* ---------- Small presentational pieces ---------- */

function HoursBadge({hours}){
  return <span className="hours-badge" title={`${plural(hours,'hour')} out of a maximum of 8`}>
    <span><b>{hours}</b> h</span>
    <span className="hours-bar" aria-hidden="true">{HOUR_OPTIONS.map(n=><i key={n} className={n<=hours?'on':''}/>)}</span>
  </span>;
}

function Stat({label, value, unit}){
  return <div className="stat"><span className="stat-label">{label}</span><b className="stat-value">{value}{unit&&value!=='—'&&<small> {unit}</small>}</b></div>;
}

function ProgramLink({code}){
  const known = isKnownProgram(code);
  return <a className="program-link" href={programHref(code)} title="Open the program details page">
    <span className="code">{code.toUpperCase()}</span>
    <span className="program-link-name">{known ? getProgram(code).name : 'Not in directory'}</span>
  </a>;
}

function EntryItem({entry, onEdit, showProgram = true}){
  const mine = entry.owner==='you';
  return <article className={`entry${mine?' mine':''}`}>
    <div className="entry-top">
      {showProgram ? <ProgramLink code={entry.programCode}/> : <span className="entry-name-big">{entry.name}</span>}
      <HoursBadge hours={entry.hours}/>
    </div>
    {entry.reflection
      ? <blockquote className="entry-note">“{entry.reflection}”</blockquote>
      : <p className="entry-note empty-note">No reflection added.</p>}
    <footer className="entry-foot">
      <span>
        {showProgram && <b className="volunteer">{entry.name}</b>}
        {mine && <span className="you-badge">Your entry</span>}
        <span className="date">{formatDate(entry.date)}</span>
      </span>
      {mine && <button type="button" className="btn btn-small" onClick={()=>onEdit(entry)} aria-label={`Edit your ${entry.programCode} entry`}>Edit</button>}
    </footer>
  </article>;
}

/* ---------- App ---------- */

export default function App(){
  const [entries,setEntries] = useState(loadEntries);
  const [query,setQuery] = useState('');
  const [effort,setEffort] = useState('all');
  const [mineOnly,setMineOnly] = useState(false);
  const [sort,setSort] = useState('directory');
  const [lookup,setLookup] = useState('ENV110');
  const [drawer,setDrawer] = useState(null);
  const [errors,setErrors] = useState({});
  const [toast,setToast] = useState('');
  const [view,setView] = useState('programs');
  const [programCode,setProgramCode] = useState(readRoute);
  const codeInput = useRef(null);
  const hoursInput = useRef(null);

  // Hash routing: #/programs/<CODE> is a shareable details page; anything else is the home page.
  useEffect(()=>{
    const onHash = () => {
      const code = readRoute();
      setProgramCode(code);
      if(code) window.scrollTo({top:0,behavior:'instant'});
    };
    window.addEventListener('hashchange',onHash);
    return ()=>window.removeEventListener('hashchange',onHash);
  },[]);
  useEffect(()=>localStorage.setItem(KEY,JSON.stringify(entries)),[entries]);
  useEffect(()=>{
    if(!toast) return;
    const t = setTimeout(()=>setToast(''),5000);
    return ()=>clearTimeout(t);
  },[toast]);
  useEffect(()=>{
    document.title = programCode ? `${programCode} · ${isKnownProgram(programCode)?getProgram(programCode).name:'Program'} | Service Hours Hub` : 'Service Hours Hub | ACL UI/UX';
  },[programCode]);
  // Dialog: close with Escape, focus the first useful field when it opens.
  useEffect(()=>{
    if(!drawer) return;
    const onKey = e => { if(e.key==='Escape') setDrawer(null); };
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[drawer]);
  const drawerOpen = Boolean(drawer);
  useEffect(()=>{
    if(!drawerOpen) return;
    requestAnimationFrame(()=>{ (drawer.programCode ? hoursInput : codeInput).current?.focus(); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[drawerOpen]);

  const openProgram = code => { window.location.hash = programHref(code); setProgramCode(code.toUpperCase()); window.scrollTo({top:0,behavior:'instant'}); };
  const goHome = (section, nextView) => {
    if(nextView) setView(nextView);
    if(readRoute()) window.location.hash = '#/';
    setProgramCode(null);
    setTimeout(()=>{
      const el = section && document.getElementById(section);
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
      else window.scrollTo({top:0,behavior:'smooth'});
    },40);
  };

  const myEntries = entries.filter(e=>e.owner==='you');
  const myEntryFor = code => myEntries.find(e=>e.programCode.toLowerCase()===code?.trim().toLowerCase());
  const shown = useMemo(()=>entries.filter(e=>
    (effort==='all'||e.hours===Number(effort)) &&
    (!mineOnly||e.owner==='you') &&
    `${e.programCode} ${e.reflection} ${e.name}`.toLowerCase().includes(query.trim().toLowerCase())
  ),[entries,query,effort,mineOnly]);
  const filtersActive = query.trim()!=='' || effort!=='all' || mineOnly;
  const looked = entriesFor(entries, lookup);
  const lookedStats = programStats(looked);
  const programsLogged = [...new Set(entries.map(e=>e.programCode.toUpperCase()))];
  const allCodes = [...new Set([...Object.keys(PROGRAMS), ...programsLogged])];
  const spread = HOUR_OPTIONS.map(h=>({h,count:entries.filter(e=>e.hours===h).length}));
  const peak = Math.max(...spread.map(s=>s.count),1);
  const programEntries = programCode ? entriesFor(entries, programCode) : [];

  const programCards = useMemo(()=>{
    const cards = allCodes.map((code,i)=>{ const list = entriesFor(entries, code); return {code, i, list, stats: programStats(list)}; });
    const avg = c => c.list.length ? sumHours(c.list)/c.list.length : null;
    if(sort==='avg-asc') cards.sort((a,b)=>(avg(a)??Infinity)-(avg(b)??Infinity));
    if(sort==='avg-desc') cards.sort((a,b)=>(avg(b)??-Infinity)-(avg(a)??-Infinity));
    if(sort==='entries') cards.sort((a,b)=>b.list.length-a.list.length||a.i-b.i);
    return cards;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[entries,sort]);

  function openDrawer(e, presetCode = ''){
    if(e&&e.owner!=='you') return;
    // Opening "log hours" for a program you've already logged goes straight to editing that entry.
    if(!e && presetCode){ const existing = myEntryFor(presetCode); if(existing) e = existing; }
    setErrors({});
    setDrawer({id:e?.id||null,programCode:e?.programCode||presetCode,hours:e?String(e.hours):'',reflection:e?.reflection||''});
  }
  function save(ev){
    ev.preventDefault();
    const code = drawer.programCode.trim();
    const next = {};
    if(!code) next.programCode = 'Enter a program code, for example TEC220.';
    else if(entries.some(e=>e.id!==drawer.id&&e.owner==='you'&&e.programCode.toLowerCase()===code.toLowerCase()))
      next.programCode = `You have already logged hours for ${code.toUpperCase()}. You can log only one entry per program — edit your existing entry instead.`;
    if(!/^[1-8]$/.test(drawer.hours.trim())) next.hours = 'Hours must be a whole number from 1 to 8.';
    setErrors(next);
    if(next.programCode){ codeInput.current?.focus(); return; }
    if(next.hours){ hoursInput.current?.focus(); return; }
    const data={programCode:code.toUpperCase(),hours:Number(drawer.hours.trim()),reflection:drawer.reflection.trim(),name:'You',owner:'you',date:new Date().toISOString().slice(0,10)};
    const label = `${data.programCode}${isKnownProgram(data.programCode)?` · ${getProgram(data.programCode).name}`:''}`;
    if(drawer.id){
      setEntries(entries.map(e=>e.id===drawer.id?{...e,...data}:e));
      setToast(`Saved changes to your ${label} entry (${plural(data.hours,'hour')}).`);
    } else {
      setEntries([{...data,id:'e-'+Date.now()},...entries]);
      setToast(`Logged ${plural(data.hours,'hour')} for ${label}.`);
    }
    setDrawer(null);
  }
  function editExistingInstead(){
    const existing = myEntryFor(drawer.programCode);
    if(existing) openDrawer(existing);
  }
  function resetAll(){
    if(!window.confirm('Reset data?\n\nThis replaces all entries with the original example records. Any hours you logged or edited will be lost.')) return;
    setEntries(seed);setQuery('');setEffort('all');setMineOnly(false);setSort('directory');setLookup('ENV110');setDrawer(null);setErrors({});
    setToast('Data reset — the example records have been restored.');
  }
  function clearFilters(){ setQuery(''); setEffort('all'); setMineOnly(false); }
  async function copyLink(){
    const url = window.location.href;
    try { await navigator.clipboard.writeText(url); setToast('Link copied — paste it anywhere to share this program.'); }
    catch { setToast(`Share this link: ${url}`); }
  }

  // Live feedback in the form (the same rules are enforced again in save()).
  const formCode = drawer?.programCode.trim() || '';
  const formDuplicate = drawer && formCode && entries.find(e=>e.id!==drawer.id&&e.owner==='you'&&e.programCode.toLowerCase()===formCode.toLowerCase());
  const formHoursInvalid = drawer && drawer.hours.trim()!=='' && !/^[1-8]$/.test(drawer.hours.trim());

  const navItems = [
    ['programs','Programs',()=>goHome('programs','programs')],
    ['activity','Activity',()=>{setMineOnly(false);goHome('activity','activity');}],
    ['mine','My entries',()=>{setMineOnly(true);setQuery('');setEffort('all');goHome('activity','mine');}],
  ];

  const program = programCode ? getProgram(programCode) : null;
  const programKnown = programCode ? isKnownProgram(programCode) : false;
  const programStatsNow = programStats(programEntries);
  const myProgramEntry = programCode ? myEntryFor(programCode) : null;

  return <div className="hub">
    <a className="skip-link" href="#main">Skip to content</a>
    <datalist id="program-codes">{Object.entries(PROGRAMS).map(([code,p])=><option key={code} value={code}>{p.name}</option>)}</datalist>

    <nav className="topbar" aria-label="Main">
      <button type="button" className="brand" onClick={()=>goHome(null,'programs')}><span className="brand-mark" aria-hidden="true">◆</span>Service Hours <b>Hub</b></button>
      <div className="tabs">
        {navItems.map(([id,label,go])=><button type="button" key={id} className={!programCode&&view===id?'on':''} aria-current={!programCode&&view===id?'page':undefined} onClick={go}>{label}</button>)}
      </div>
      <div className="topbar-end">
        <button type="button" className="btn btn-primary" onClick={()=>openDrawer(null, programCode && !myProgramEntry ? programCode : '')}>+ Log hours</button>
        <span className="avatar" title="Signed in as You">Y</span>
      </div>
    </nav>

    <main className="page" id="main">{programCode ? (
      /* ---------- Program details page (#/programs/<CODE>) ---------- */
      <article className="program-page">
        <button type="button" className="back-link" onClick={()=>goHome('programs','programs')}>← All programs</button>
        <header className="program-hero">
          <div>
            <span className="code code-lg">{programCode}</span>
            <h1>{programKnown ? program.name : programCode}</h1>
            <p className="partner">{programKnown ? <>In partnership with <b>{program.partner}</b></> : 'This code is not in the program directory.'}</p>
          </div>
          <div className="hero-actions">
            {myProgramEntry
              ? <button type="button" className="btn btn-primary" onClick={()=>openDrawer(myProgramEntry)}>Edit your entry ({myProgramEntry.hours} h)</button>
              : <button type="button" className="btn btn-primary" onClick={()=>openDrawer(null, programCode)}>+ Log hours for this program</button>}
            <button type="button" className="btn" onClick={copyLink}>Copy link</button>
          </div>
        </header>

        <section className="stats-row" aria-label="Effort at a glance">
          <Stat label="Average per entry" value={programStatsNow.avg} unit="h"/>
          <Stat label="Entries logged" value={programStatsNow.count}/>
          <Stat label="Total hours" value={programStatsNow.total} unit="h"/>
          <Stat label="Range" value={programStatsNow.range}/>
        </section>

        <div className="program-layout">
          <div className="program-main">
            <section className="card">
              <h2>About this program</h2>
              {!programKnown && <p className="notice"><b>Program details not yet added.</b> {UNKNOWN_PROGRAM.description}</p>}
              {programKnown && <p className="lead">{program.description}</p>}
              <dl className="facts">
                <div><dt>Program code</dt><dd>{programCode}</dd></div>
                <div><dt>Partner organisation</dt><dd>{program.partner}</dd></div>
              </dl>
            </section>

            <section className="card">
              <h2>What volunteers said <span className="count">({programEntries.length})</span></h2>
              {programEntries.length
                ? <div className="entry-list">{programEntries.map(e=><EntryItem key={e.id} entry={e} onEdit={openDrawer} showProgram={false}/>)}</div>
                : <p className="empty">No hours have been logged for this program yet. Be the first!</p>}
            </section>
          </div>

          <aside className="card team">
            <h2>Program team</h2>
            <p className="muted">Faculty supervisors and student coordinators.</p>
            {program.history.length
              ? ['2025/26','2024/25'].map(year=>{
                  const h = program.history.find(x=>x.year===year);
                  return <div className="team-year" key={year}>
                    <h3>{year}</h3>
                    {h ? <>
                      <span className="label">Faculty supervisor{h.supervisors.length===1?'':'s'}</span>
                      <ul>{h.supervisors.map(n=><li key={n}>{n}</li>)}</ul>
                      <span className="label">Student coordinators</span>
                      <ul>{h.coordinators.map(n=><li key={n}>{n}</li>)}</ul>
                    </> : <p className="muted">No record for this year.</p>}
                  </div>;
                })
              : <p className="muted">No team records for this program yet.</p>}
            <p className="fine-print">Illustrative program and staff records; all names are fictional.</p>
          </aside>
        </div>
      </article>
    ) : <>
      {/* ---------- Home page ---------- */}
      <header className="welcome">
        <div>
          <h1>Find a program. Log your hours.</h1>
          <p>Compare community service programs by the time volunteers put in and what they said, then log your own hours.</p>
        </div>
        <ol className="steps" aria-label="How it works">
          <li><b>1</b> Compare programs</li>
          <li><b>2</b> Read volunteer reflections</li>
          <li><b>3</b> Log your hours</li>
        </ol>
      </header>

      <section id="programs" className="section">
        <div className="section-head">
          <div>
            <h2>Programs</h2>
            <p className="muted">Effort is based on hours logged by previous volunteers (1–8 hours per entry).</p>
          </div>
          <label className="inline-field">Sort by
            <select value={sort} onChange={e=>setSort(e.target.value)}>
              <option value="directory">Directory order</option>
              <option value="avg-asc">Lowest average hours</option>
              <option value="avg-desc">Highest average hours</option>
              <option value="entries">Most entries</option>
            </select>
          </label>
        </div>
        <div className="program-grid">
          {programCards.map(({code,list,stats})=>{
            const known = isKnownProgram(code);
            const p = getProgram(code);
            const latest = list.find(e=>e.reflection);
            const mine = myEntryFor(code);
            return <article className="program-card" key={code}>
              <div className="program-card-top">
                <span className="code">{code}</span>
                {mine && <span className="you-badge">You logged {mine.hours} h</span>}
              </div>
              <h3><a href={programHref(code)}>{known ? p.name : 'Program details not yet added'}</a></h3>
              <p className="partner-small">{known ? p.partner : 'Not in the program directory'}</p>
              <dl className="mini-stats">
                <div><dt>Avg / entry</dt><dd>{stats.avg}{stats.count?' h':''}</dd></div>
                <div><dt>Entries</dt><dd>{stats.count}</dd></div>
                <div><dt>Total</dt><dd>{stats.total} h</dd></div>
              </dl>
              {latest
                ? <blockquote className="card-quote">“{latest.reflection}” <cite>— {latest.name}, {latest.hours} h</cite></blockquote>
                : <p className="card-quote muted">{list.length ? 'No written reflections yet.' : 'No hours logged yet.'}</p>}
              <a className="card-cta" href={programHref(code)}>View details, team & all reflections →</a>
            </article>;
          })}
        </div>
      </section>

      <section id="overview" className="section">
        <div className="section-head"><h2>Overview</h2></div>
        <div className="overview-grid">
          <div className="kpis">
            <Stat label="Total entries" value={entries.length}/>
            <Stat label="Average hours per entry" value={meanHours(entries)} unit="h"/>
            <Stat label="Programs with activity" value={programsLogged.length}/>
          </div>

          <section className="card chart" aria-labelledby="dist-title">
            <h3 id="dist-title">Hours distribution</h3>
            <p className="muted">How many entries logged each number of hours.</p>
            <div className="bars" role="img" aria-label={spread.map(s=>`${plural(s.h,'hour')}: ${plural(s.count,'entry','entries')}`).join(', ')}>
              {spread.map(s=><div className="bar" key={s.h}>
                <span className="bar-count">{s.count}</span>
                <div className="bar-track"><i style={{height:`${s.count/peak*100}%`}}/></div>
                <span className="bar-label">{s.h}h</span>
              </div>)}
            </div>
          </section>

          <section className="card lookup" aria-labelledby="check-title">
            <h3 id="check-title">Program check</h3>
            <label className="field">Program code
              <input value={lookup} onChange={e=>setLookup(e.target.value)} placeholder="e.g. TEC220" list="program-codes" autoComplete="off"/>
            </label>
            {lookup.trim() ? <>
              <p className="lookup-name">{isKnownProgram(lookup) ? getProgram(lookup).name : 'Not in the program directory'}</p>
              <dl className="mini-stats">
                <div><dt>Avg / entry</dt><dd>{lookedStats.avg}{looked.length?' h':''}</dd></div>
                <div><dt>Entries</dt><dd>{lookedStats.count}</dd></div>
                <div><dt>Total hours</dt><dd>{lookedStats.total} h</dd></div>
              </dl>
              <button type="button" className="btn btn-block" onClick={()=>openProgram(lookup.trim().toUpperCase())}>Open program page →</button>
            </> : <p className="muted">Type a program code to see its numbers.</p>}
          </section>
        </div>
      </section>

      <section id="activity" className="section">
        <div className="section-head">
          <div>
            <h2>{mineOnly ? 'My entries' : 'Volunteer activity'}</h2>
            <p className="muted" aria-live="polite">Showing {shown.length} of {plural(entries.length,'entry','entries')}</p>
          </div>
        </div>
        <div className="filters">
          <label className="field grow">Search
            <input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Program code, reflection or volunteer name"/>
          </label>
          <label className="field">Hours
            <select value={effort} onChange={e=>setEffort(e.target.value)}>
              <option value="all">Any number of hours</option>
              {HOUR_OPTIONS.map(h=><option key={h} value={h}>{plural(h,'hour')}</option>)}
            </select>
          </label>
          <label className="check"><input type="checkbox" checked={mineOnly} onChange={e=>{setMineOnly(e.target.checked);setView(e.target.checked?'mine':'activity');}}/> Only my entries</label>
          {filtersActive && <button type="button" className="btn btn-small" onClick={clearFilters}>Clear filters</button>}
        </div>
        {shown.length
          ? <div className="entry-grid">{shown.map(e=><EntryItem key={e.id} entry={e} onEdit={openDrawer}/>)}</div>
          : <div className="empty">
              <p>No entries match your filters.</p>
              {filtersActive && <button type="button" className="btn btn-small" onClick={clearFilters}>Clear filters</button>}
            </div>}
      </section>

      <footer className="page-foot">
        <p>Your changes are saved in this browser. <b>Reset data</b> replaces everything with the original example records.</p>
        <button type="button" className="btn btn-danger" onClick={resetAll}>Reset data</button>
      </footer>
    </>}
    </main>

    {toast && <div className="toast" role="status" aria-live="polite"><span>✓ {toast}</span><button type="button" onClick={()=>setToast('')} aria-label="Dismiss message">×</button></div>}

    {drawer && <div className="scrim" onMouseDown={e=>e.target===e.currentTarget&&setDrawer(null)}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer-head">
          <h2 id="drawer-title">{drawer.id ? 'Edit your entry' : 'Log volunteering hours'}</h2>
          <button type="button" className="close" onClick={()=>setDrawer(null)} aria-label="Close">×</button>
        </div>
        {!drawer.id && <p className="drawer-intro">
          You can log <b>one entry per program</b>.
          {myEntries.length>0 && <> You’ve already logged: {myEntries.map(e=>e.programCode).join(', ')}.</>}
        </p>}
        <form onSubmit={save} noValidate>
          <div className="form-field">
            <label htmlFor="f-code">Program code <span className="req">required</span></label>
            <input id="f-code" ref={codeInput} list="program-codes" autoComplete="off" value={drawer.programCode}
              onChange={e=>{const v=e.target.value;setDrawer(d=>({...d,programCode:v}));setErrors(x=>({...x,programCode:undefined}));}}
              placeholder="e.g. TEC220" aria-invalid={Boolean(errors.programCode||formDuplicate)} aria-describedby="f-code-help"/>
            <div id="f-code-help">
              {errors.programCode && !formDuplicate ? <p className="field-error">{errors.programCode}</p>
                : formDuplicate ? <div className="field-error">
                    You’ve already logged {formDuplicate.hours} h for {formCode.toUpperCase()}. You can log only one entry per program.
                    <button type="button" className="link-btn" onClick={editExistingInstead}>Edit that entry instead</button>
                  </div>
                : formCode ? <p className={`hint ${isKnownProgram(formCode)?'ok':''}`}>{isKnownProgram(formCode) ? <>✓ {getProgram(formCode).name} — {getProgram(formCode).partner}</> : 'Not in the program directory — you can still log it.'}</p>
                : <p className="hint">Pick from the list or type a code. Codes are saved in upper case.</p>}
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="f-hours">Hours <span className="req">required</span></label>
            <input id="f-hours" ref={hoursInput} type="number" inputMode="numeric" min="1" max="8" step="1" value={drawer.hours}
              onChange={e=>{const v=e.target.value;setDrawer(d=>({...d,hours:v}));setErrors(x=>({...x,hours:undefined}));}}
              placeholder="1–8" aria-invalid={Boolean(errors.hours||formHoursInvalid)} aria-describedby="f-hours-help"/>
            <div id="f-hours-help">{errors.hours||formHoursInvalid
              ? <p className="field-error">{errors.hours || 'Hours must be a whole number from 1 to 8.'}</p>
              : <p className="hint">A whole number from 1 to 8.</p>}</div>
          </div>
          <div className="form-field">
            <label htmlFor="f-ref">Reflection <span className="opt">optional</span></label>
            <textarea id="f-ref" value={drawer.reflection} rows={5} onChange={e=>{const v=e.target.value;setDrawer(d=>({...d,reflection:v}));}}
              placeholder="What did you do? Any tips for future volunteers?"/>
          </div>
          <div className="drawer-actions">
            <button type="submit" className="btn btn-primary">{drawer.id ? 'Save changes' : 'Save entry'}</button>
            <button type="button" className="btn" onClick={()=>setDrawer(null)}>Cancel</button>
          </div>
        </form>
      </aside>
    </div>}
  </div>;
}
