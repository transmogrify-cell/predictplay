import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Banknote,
  LogIn,
  LogOut,
  User,
  Wallet,
  TrendingUp,
  ShieldAlert,
  ReceiptText,
  Home as HomeIcon,
  ChevronRight,
  CreditCard,
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  Ticket,
  BadgeCheck,
  CheckCircle2,
  XCircle,
  Info,
  Bell,
  Settings
} from "lucide-react";

/**
 * PREDICTPLAY — Single-file React frontend
 * Features
 * - Mock auth (login/signup/logout)
 * - Sports markets (sample fixtures) & bet builder/slip
 * - Wallet with balance, deposits, withdrawals
 * - Transactions history
 * - Profile + KYC mock + Responsible gaming page
 * - LocalStorage persistence
 * - Clean Tailwind + shadcn-like components
 *
 * NOTE: This is a front-end only demo with mock APIs.
 */

/*************************
 * Minimal UI primitives *
 *************************/

function cn(...classes){
  return classes.filter(Boolean).join(" ");
}

function Container({children, className=""}){
  return <div className={cn("max-w-6xl mx-auto px-3 md:px-6", className)}>{children}</div>
}

function AppCard({children, className=""}){
  return (
    <div className={cn("rounded-2xl shadow-lg shadow-fuchsia-500/40 bg-white/80 dark:bg-zinc-900/70 backdrop-blur border border-zinc-200/50 dark:border-zinc-800", className)}>
      {children}
    </div>
  );
}

function AppHeader({title, subtitle, right}){
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

function AppButton({children, className="", variant="primary", ...props}){
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:opacity-90 shadow-fuchsia-500/60 shadow-md",
    secondary: "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700",
    outline: "border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800",
    ghost:"hover:bg-zinc-100 dark:hover:bg-zinc-800"
  };
  return <button className={cn(base, variants[variant], className)} {...props}>{children}</button>
}

function Input({className="", ...props}){
  return <input className={cn("w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 ring-black/10", className)} {...props}/>
}

function Select({className="", children, ...props}){
  return <select className={cn("w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm", className)} {...props}>{children}</select>
}

function Divider(){
  return <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-4"/>
}

function Stat({label, value, icon}){
  const Icon = icon;
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border bg-white/60 dark:bg-zinc-900/60">
      <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"><Icon className="w-5 h-5"/></div>
      <div>
        <div className="text-xs text-zinc-500">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  )
}

/****************
 * Mock backend *
 ****************/
const LS_KEYS = {
  user: "predictplay:user",
  wallet: "predictplay:wallet",
  tx: "predictplay:tx",
  slip: "predictplay:slip",
  kyc: "predictplay:kyc"
};

function loadLS(key, fallback){
  try{ const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; }catch{ return fallback; }
}
function saveLS(key, value){ localStorage.setItem(key, JSON.stringify(value)); }

const initialFixtures = [
  {
    id: "CRIC-1001",
    sport: "Cricket",
    league: "ICC T20",
    kickoff: new Date(Date.now() + 1000*60*60*6).toISOString(),
    teams: ["India", "Australia"],
    markets: {
      moneyline: [
        { key: "India", odds: 1.75 },
        { key: "Australia", odds: 2.05 }
      ],
      overunder: [
        { key: "Over 330.5", odds: 1.9 },
        { key: "Under 330.5", odds: 1.9 }
      ]
    }
  },
  {
    id: "FB-2025-PL-21",
    sport: "Football",
    league: "Premier League",
    kickoff: new Date(Date.now() + 1000*60*60*24).toISOString(),
    teams: ["Arsenal", "Liverpool"],
    markets: {
      moneyline: [
        { key: "Arsenal", odds: 2.4 },
        { key: "Draw", odds: 3.35 },
        { key: "Liverpool", odds: 2.85 }
      ],
      overunder: [
        { key: "Over 2.5", odds: 1.95 },
        { key: "Under 2.5", odds: 1.85 }
      ]
    }
  },
  {
    id: "NBA-8891",
    sport: "Basketball",
    league: "NBA",
    kickoff: new Date(Date.now() + 1000*60*60*12).toISOString(),
    teams: ["Lakers", "Celtics"],
    markets: {
      moneyline: [
        { key: "Lakers", odds: 1.9 },
        { key: "Celtics", odds: 1.95 }
      ],
      overunder: [
        { key: "Over 221.5", odds: 1.9 },
        { key: "Under 221.5", odds: 1.9 }
      ]
    }
  }
];

/****************
 * App Contexts *
 ****************/
const AppContext = React.createContext(null);

function AppProvider({children}){
  const [user, setUser] = useState(() => loadLS(LS_KEYS.user, null));
  const [wallet, setWallet] = useState(() => loadLS(LS_KEYS.wallet, { currency:"INR", balance: 0 }));
  const [tx, setTx] = useState(() => loadLS(LS_KEYS.tx, []));
  const [slip, setSlip] = useState(() => loadLS(LS_KEYS.slip, []));
  const [kyc, setKyc] = useState(() => loadLS(LS_KEYS.kyc, { status: "unverified", pan: "", name: "" }));

  useEffect(()=>saveLS(LS_KEYS.user, user),[user]);
  useEffect(()=>saveLS(LS_KEYS.wallet, wallet),[wallet]);
  useEffect(()=>saveLS(LS_KEYS.tx, tx),[tx]);
  useEffect(()=>saveLS(LS_KEYS.slip, slip),[slip]);
  useEffect(()=>saveLS(LS_KEYS.kyc, kyc),[kyc]);

  const value = {
    user, setUser,
    wallet, setWallet,
    tx, setTx,
    slip, setSlip,
    kyc, setKyc
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function useApp(){
  const ctx = React.useContext(AppContext);
  if(!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

/*******************
 * Helper functions *
 *******************/
function formatINR(amount){
  try{
    return new Intl.NumberFormat('en-IN',{ style:'currency', currency:'INR', maximumFractionDigits:2 }).format(amount);
  }catch{ return `₹${amount.toFixed(2)}` }
}

function prettyDate(iso){
  const d = new Date(iso);
  return d.toLocaleString();
}

/***********************
 * Layout & Navigation *
 ***********************/
function NavLink({to, icon:Icon, children}){
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link to={to} className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800", active && "bg-zinc-100 dark:bg-zinc-800 font-medium")}> 
      <Icon className="w-4 h-4"/>
      {children}
    </Link>
  )
}

function TopBar(){
  const { user, wallet } = useApp();
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur">
      <Container className="py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <motion.div initial={{scale:0.9}} animate={{scale:1}} transition={{type:'spring', stiffness:200}} className="h-9 w-9 rounded-xl bg-black text-white grid place-items-center font-bold">PP</motion.div>
          <div>
            <div className="text-lg font-bold -mb-1">PredictPlay</div>
            <div className="text-[10px] tracking-wider uppercase text-zinc-500">Bet smart. Play fair.</div>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/" icon={HomeIcon}>Home</NavLink>
          <NavLink to="/markets" icon={TrendingUp}>Markets</NavLink>
          <NavLink to="/wallet" icon={Wallet}>Wallet</NavLink>
          <NavLink to="/transactions" icon={ReceiptText}>Transactions</NavLink>
          <NavLink to="/responsible" icon={ShieldAlert}>Responsible</NavLink>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl border bg-white/60 dark:bg-zinc-900/60">
                <Wallet className="w-4 h-4"/>
                <span className="text-sm font-semibold">{formatINR(wallet.balance)}</span>
              </div>
              <AppButton variant="secondary" onClick={()=>navigate('/profile')}><User className="w-4 h-4"/> {user.name}</AppButton>
            </>
          ) : (
            <AppButton onClick={()=>navigate('/auth')}><LogIn className="w-4 h-4"/> Log in</AppButton>
          )}
        </div>
      </Container>
    </div>
  )
}

function Shell({children}){
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-50">
      <TopBar/>
      <Container className="py-6 md:py-10">
        {children}
      </Container>
      <Footer/>
    </div>
  )
}

function Footer(){
  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 py-10 mt-10 text-xs text-zinc-500">
      <Container className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-semibold text-zinc-700 dark:text-zinc-300">PredictPlay</div>
          <div className="mt-1">© {new Date().getFullYear()} PredictPlay. All rights reserved.</div>
        </div>
        <div className="space-x-4">
          <Link className="hover:underline" to="/terms">Terms</Link>
          <Link className="hover:underline" to="/privacy">Privacy</Link>
          <Link className="hover:underline" to="/responsible">Responsible Gaming</Link>
        </div>
      </Container>
    </div>
  )
}

/****************
 * Auth screens *
 ****************/
function Auth(){
  const { user, setUser } = useApp();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(()=>{
    if(user) navigate('/');
  },[user]);

  function onSubmit(e){
    e.preventDefault();
    if(mode === 'signup'){
      const newUser = { id: crypto.randomUUID(), email, name: name || email.split('@')[0] };
      setUser(newUser);
    } else {
      // mock login: any email+password works
      const newUser = { id: crypto.randomUUID(), email, name: email.split('@')[0] };
      setUser(newUser);
    }
  }

  return (
    <Shell>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <motion.h2 initial={{y:10,opacity:0}} animate={{y:0,opacity:1}} className="text-3xl font-bold">Welcome to PredictPlay</motion.h2>
          <p className="text-zinc-500 mt-2">Securely sign {mode==='login'? 'in' : 'up'} to place bets, manage your wallet, and track your performance.</p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Two-step mock auth</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Instant deposits & withdrawals (demo)</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Responsible gaming tools</li>
          </ul>
        </div>
        <AppCard className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">{mode==='login'? 'Log in' : 'Create account'}</div>
            <button onClick={()=>setMode(mode==='login'?'signup':'login')} className="text-sm underline">Switch to {mode==='login'?'Sign up':'Log in'}</button>
          </div>
          <Divider/>
          <form onSubmit={onSubmit} className="space-y-4">
            {mode==='signup' && (
              <div>
                <label className="text-sm">Full Name</label>
                <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Himanshu Chandela" required/>
              </div>
            )}
            <div>
              <label className="text-sm">Email</label>
              <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/>
            </div>
            <div>
              <label className="text-sm">Password</label>
              <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/>
            </div>
            <AppButton className="w-full" type="submit">{mode==='login'? <><LogIn className="w-4 h-4"/> Log in</> : 'Create account'}</AppButton>
            <p className="text-[11px] text-zinc-500">By continuing you agree to our Terms & Privacy Policy.</p>
          </form>
        </AppCard>
      </div>
    </Shell>
  )
}

/****************
 * Home & Feed *
 ****************/
function Home(){
  const navigate = useNavigate();
  const { user, slip, setSlip } = useApp();
  const [query, setQuery] = useState("");

  const fixtures = useMemo(()=>{
    const q = query.toLowerCase();
    return initialFixtures.filter(f => f.teams.join(" ").toLowerCase().includes(q) || f.league.toLowerCase().includes(q) || f.sport.toLowerCase().includes(q));
  },[query]);

  function addToSlip(fixture, market, selection){
    setSlip(prev=>{
      const item = { id: crypto.randomUUID(), fixtureId: fixture.id, event: `${fixture.teams[0]} vs ${fixture.teams[1]}`, market, selection: selection.key, odds: selection.odds };
      return [...prev, item];
    });
  }

  return (
    <Shell>
      <AppHeader title="Today’s Highlights" subtitle="Top markets curated for you" right={<AppButton variant="secondary" onClick={()=>navigate('/markets')}><TrendingUp className="w-4 h-4"/> View all markets</AppButton>} />
      <div className="mt-6 grid lg:grid-cols-[1fr_420px] gap-6">
        <div className="space-y-6">
          <AppCard className="p-5">
            <div className="flex items-center gap-2"><Search className="w-4 h-4"/><Input placeholder="Search teams, leagues, sports" value={query} onChange={e=>setQuery(e.target.value)}/></div>
          </AppCard>

          {fixtures.map(f => (
            <AppCard key={f.id} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-zinc-500">{f.sport} • {f.league}</div>
                  <div className="text-xl font-semibold">{f.teams[0]} <span className="text-zinc-400">vs</span> {f.teams[1]}</div>
                  <div className="text-xs text-zinc-500">Kick-off: {prettyDate(f.kickoff)}</div>
                </div>
                <AppButton variant="outline" onClick={()=>navigate(`/markets/${f.id}`)}>Open <ChevronRight className="w-4 h-4"/></AppButton>
              </div>
              <Divider/>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs mb-2 text-zinc-500">Moneyline</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {f.markets.moneyline.map((m,idx) => (
                      <AppButton key={idx} variant="secondary" onClick={()=>addToSlip(f, 'Moneyline', m)} className="justify-between"><span>{m.key}</span><span className="text-xs font-mono">@ {m.odds}</span></AppButton>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-2 text-zinc-500">Total (Over/Under)</div>
                  <div className="grid grid-cols-2 gap-2">
                    {f.markets.overunder.map((m,idx) => (
                      <AppButton key={idx} variant="secondary" onClick={()=>addToSlip(f, 'Over/Under', m)} className="justify-between"><span>{m.key}</span><span className="text-xs font-mono">@ {m.odds}</span></AppButton>
                    ))}
                  </div>
                </div>
              </div>
            </AppCard>
          ))}
        </div>
        <BetSlipPanel/>
      </div>
    </Shell>
  )
}

/****************
 * Markets page *
 ****************/
function Markets(){
  const navigate = useNavigate();
  return (
    <Shell>
      <AppHeader title="All Markets" subtitle="Browse fixtures and build your slip"/>
      <div className="mt-6 grid lg:grid-cols-[1fr_420px] gap-6">
        <div className="space-y-6">
          {initialFixtures.map(f => (
            <AppCard key={f.id} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-zinc-500">{f.sport} • {f.league}</div>
                  <div className="text-xl font-semibold">{f.teams[0]} <span className="text-zinc-400">vs</span> {f.teams[1]}</div>
                  <div className="text-xs text-zinc-500">Kick-off: {prettyDate(f.kickoff)}</div>
                </div>
                <AppButton variant="outline" onClick={()=>navigate(`/markets/${f.id}`)}>Open <ChevronRight className="w-4 h-4"/></AppButton>
              </div>
            </AppCard>
          ))}
        </div>
        <BetSlipPanel/>
      </div>
    </Shell>
  )
}

function FixtureDetail(){
  const { slip, setSlip } = useApp();
  const { pathname } = useLocation();
  const id = pathname.split('/').pop();
  const fixture = initialFixtures.find(f=>f.id===id);
  if(!fixture) return <Shell><div>Fixture not found.</div></Shell>

  function addToSlip(market, selection){
    setSlip(prev=>[...prev, { id: crypto.randomUUID(), fixtureId: fixture.id, event: `${fixture.teams[0]} vs ${fixture.teams[1]}` , market, selection: selection.key, odds: selection.odds }]);
  }

  return (
    <Shell>
      <AppHeader title={`${fixture.teams[0]} vs ${fixture.teams[1]}`} subtitle={`${fixture.sport} • ${fixture.league} • ${prettyDate(fixture.kickoff)}`}/>
      <div className="mt-6 grid lg:grid-cols-[1fr_420px] gap-6">
        <div className="space-y-6">
          <AppCard className="p-5">
            <div className="text-sm text-zinc-500 mb-2">Moneyline</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {fixture.markets.moneyline.map((m, idx)=> (
                <AppButton key={idx} variant="secondary" className="justify-between" onClick={()=>addToSlip('Moneyline', m)}>
                  <span>{m.key}</span>
                  <span className="text-xs font-mono">@ {m.odds}</span>
                </AppButton>
              ))}
            </div>
          </AppCard>
          <AppCard className="p-5">
            <div className="text-sm text-zinc-500 mb-2">Total (Over/Under)</div>
            <div className="grid grid-cols-2 gap-2">
              {fixture.markets.overunder.map((m, idx)=> (
                <AppButton key={idx} variant="secondary" className="justify-between" onClick={()=>addToSlip('Over/Under', m)}>
                  <span>{m.key}</span>
                  <span className="text-xs font-mono">@ {m.odds}</span>
                </AppButton>
              ))}
            </div>
          </AppCard>
        </div>
        <BetSlipPanel/>
      </div>
    </Shell>
  )
}

/****************
 * Bet slip      *
 ****************/
function BetSlipPanel(){
  const { slip, setSlip, wallet, setWallet, tx, setTx, user } = useApp();
  const [stake, setStake] = useState(100);
  const navigate = useNavigate();

  const combinedOdds = useMemo(()=> slip.reduce((acc, s) => acc * s.odds, 1), [slip]);
  const potentialReturn = useMemo(()=> Number(stake) * combinedOdds, [stake, combinedOdds]);

  function placeBet(){
    if(!user){
      navigate('/auth');
      return;
    }
    if(slip.length === 0) return;
    const amt = Number(stake);
    if(amt <= 0) return;
    if(wallet.balance < amt) {
      alert('Insufficient balance. Please deposit.');
      navigate('/wallet');
      return;
    }

    // Deduct and record bet transaction
    const newBal = wallet.balance - amt;
    setWallet({...wallet, balance: newBal});
    const betId = crypto.randomUUID();
    setTx([{ id: betId, type:'bet', direction:'debit', amount: amt, note: `Bet x${slip.length} selections @ ${combinedOdds.toFixed(2)}`, ts: new Date().toISOString()}, ...tx]);
    setSlip([]);
    alert('Bet placed! (demo)');
  }

  return (
    <AppCard className="p-5 h-fit sticky top-20">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold flex items-center gap-2"><Ticket className="w-5 h-5"/> Bet Slip</div>
        <button onClick={()=>setSlip([])} className="text-xs text-zinc-500 underline">Clear all</button>
      </div>
      <Divider/>
      {slip.length===0 ? (
        <div className="text-sm text-zinc-500">No selections yet. Add picks from markets.</div>
      ) : (
        <div className="space-y-3">
          {slip.map((s)=> (
            <div key={s.id} className="p-3 rounded-xl border">
              <div className="text-xs text-zinc-500">{s.market} • {s.event}</div>
              <div className="flex items-center justify-between mt-1">
                <div className="font-medium">{s.selection}</div>
                <div className="text-xs font-mono">@ {s.odds}</div>
              </div>
              <div className="mt-2 text-right"><button className="text-xs text-zinc-500 underline" onClick={()=>setSlip(prev=>prev.filter(x=>x.id!==s.id))}>Remove</button></div>
            </div>
          ))}
          <Divider/>
          <div className="space-y-2">
            <div>
              <label className="text-sm">Stake</label>
              <Input type="number" value={stake} onChange={e=>setStake(e.target.value)} min={0} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Combined odds</span><span className="font-mono">{combinedOdds.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Potential return</span><span className="font-semibold">{formatINR(potentialReturn)}</span>
            </div>
            <AppButton className="w-full" onClick={placeBet}><TrendingUp className="w-4 h-4"/> Place bet</AppButton>
          </div>
        </div>
      )}
    </AppCard>
  )
}

/****************
 * Wallet / Cash *
 ****************/
function WalletPage(){
  const { wallet, setWallet, tx, setTx, user } = useApp();
  const [tab, setTab] = useState('deposit');
  const [amount, setAmount] = useState(500);
  const [method, setMethod] = useState('upi');
  const navigate = useNavigate();

  useEffect(()=>{ if(!user) navigate('/auth'); },[user]);

  function doDeposit(e){
    e.preventDefault();
    const amt = Number(amount);
    if(amt<=0) return;
    const newBal = wallet.balance + amt;
    setWallet({...wallet, balance: newBal});
    setTx([{ id: crypto.randomUUID(), type:'deposit', direction:'credit', amount: amt, method, note:`Deposit via ${method.toUpperCase()}`, ts: new Date().toISOString()}, ...tx]);
    alert('Deposit successful (demo).');
  }

  function doWithdraw(e){
    e.preventDefault();
    const amt = Number(amount);
    if(amt<=0) return;
    if(wallet.balance < amt){ alert('Insufficient balance'); return; }
    const newBal = wallet.balance - amt;
    setWallet({...wallet, balance: newBal});
    setTx([{ id: crypto.randomUUID(), type:'withdraw', direction:'debit', amount: amt, method, note:`Withdraw to ${method.toUpperCase()}`, ts: new Date().toISOString()}, ...tx]);
    alert('Withdrawal requested (demo).');
  }

  return (
    <Shell>
      <AppHeader title="Wallet" subtitle="Add funds, withdraw, and manage payment methods" right={<Stat label="Current Balance" value={formatINR(wallet.balance)} icon={Banknote}/>}/>
      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <AppCard className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={()=>setTab('deposit')} className={cn("px-3 py-1.5 rounded-xl", tab==='deposit'? 'bg-black text-white':'bg-zinc-100 dark:bg-zinc-800')}>Deposit</button>
            <button onClick={()=>setTab('withdraw')} className={cn("px-3 py-1.5 rounded-xl", tab==='withdraw'? 'bg-black text-white':'bg-zinc-100 dark:bg-zinc-800')}>Withdraw</button>
          </div>
          <Divider/>
          {tab==='deposit' ? (
            <form onSubmit={doDeposit} className="space-y-4">
              <div>
                <label className="text-sm">Amount (INR)</label>
                <Input type="number" value={amount} onChange={e=>setAmount(e.target.value)} min={1}/>
              </div>
              <div>
                <label className="text-sm">Method</label>
                <Select value={method} onChange={e=>setMethod(e.target.value)}>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="netbanking">Netbanking</option>
                </Select>
              </div>
              <AppButton type="submit"><ArrowDownToLine className="w-4 h-4"/> Add funds</AppButton>
            </form>
          ) : (
            <form onSubmit={doWithdraw} className="space-y-4">
              <div>
                <label className="text-sm">Amount (INR)</label>
                <Input type="number" value={amount} onChange={e=>setAmount(e.target.value)} min={1}/>
              </div>
              <div>
                <label className="text-sm">Destination</label>
                <Select value={method} onChange={e=>setMethod(e.target.value)}>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer (IMPS)</option>
                </Select>
              </div>
              <AppButton type="submit" variant="outline"><ArrowUpFromLine className="w-4 h-4"/> Withdraw</AppButton>
            </form>
          )}
        </AppCard>
        <AppCard className="p-5">
          <div className="text-sm text-zinc-500 mb-2">Tips</div>
          <ul className="space-y-2 text-sm">
            <li>• Ensure your name matches your bank account for withdrawals.</li>
            <li>• Minimum withdrawal ₹100. Processing is instant in this demo.</li>
            <li>• Track all activity in Transactions.</li>
          </ul>
        </AppCard>
      </div>
    </Shell>
  )
}

/**********************
 * Transactions table *
 **********************/
function Transactions(){
  const { tx } = useApp();
  return (
    <Shell>
      <AppHeader title="Transactions" subtitle="Deposits, withdrawals, and bets"/>
      <AppCard className="p-5 mt-6 overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-zinc-500">
            <tr>
              <th className="py-2">Time</th>
              <th className="py-2">Type</th>
              <th className="py-2">Direction</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Method/Note</th>
              <th className="py-2">ID</th>
            </tr>
          </thead>
          <tbody>
            {tx.length===0 ? (
              <tr><td className="py-6 text-center text-zinc-500" colSpan={6}>No transactions yet.</td></tr>
            ) : tx.map(t => (
              <tr key={t.id} className="border-t">
                <td className="py-2">{prettyDate(t.ts)}</td>
                <td className="py-2 capitalize">{t.type}</td>
                <td className="py-2 capitalize">{t.direction}</td>
                <td className="py-2 font-medium">{formatINR(t.amount)}</td>
                <td className="py-2">{t.method ? String(t.method).toUpperCase(): ''} {t.note? `• ${t.note}`:''}</td>
                <td className="py-2 text-xs text-zinc-500">{t.id.slice(0,8)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AppCard>
    </Shell>
  )
}

/**********************
 * Profile & Settings *
 **********************/
function Profile(){
  const { user, setUser, kyc, setKyc } = useApp();
  const navigate = useNavigate();
  useEffect(()=>{ if(!user) navigate('/auth'); },[user]);

  function logout(){ setUser(null); }

  function submitKyc(e){
    e.preventDefault();
    if(kyc.pan && kyc.name) setKyc({...kyc, status:'pending'});
  }

  return (
    <Shell>
      <AppHeader title="Profile" subtitle="Account & verification" right={<AppButton variant="outline" onClick={logout}><LogOut className="w-4 h-4"/> Log out</AppButton>}/>
      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <AppCard className="p-5 lg:col-span-2">
          <div className="text-lg font-semibold">Account</div>
          <Divider/>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-zinc-500">Name</div>
              <div className="font-medium">{user?.name}</div>
            </div>
            <div>
              <div className="text-zinc-500">Email</div>
              <div className="font-medium">{user?.email}</div>
            </div>
          </div>
          <Divider/>
          <div className="text-lg font-semibold">KYC</div>
          <div className="mt-2 text-sm flex items-center gap-2">
            {kyc.status==='verified' && <><BadgeCheck className="w-4 h-4 text-emerald-500"/> <span className="text-emerald-600">Verified</span></>}
            {kyc.status==='pending' && <><Info className="w-4 h-4 text-amber-500"/> <span className="text-amber-600">Pending review (demo)</span></>}
            {kyc.status==='unverified' && <><XCircle className="w-4 h-4 text-zinc-400"/> <span className="text-zinc-500">Not submitted</span></>}
          </div>
          <form onSubmit={submitKyc} className="mt-4 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Full Name</label>
              <Input value={kyc.name} onChange={e=>setKyc({...kyc, name:e.target.value})} placeholder="Name as per PAN"/>
            </div>
            <div>
              <label className="text-sm">PAN</label>
              <Input value={kyc.pan} onChange={e=>setKyc({...kyc, pan:e.target.value.toUpperCase()})} placeholder="ABCDE1234F"/>
            </div>
            <div className="sm:col-span-2">
              <AppButton type="submit"><BadgeCheck className="w-4 h-4"/> Submit KYC</AppButton>
              {kyc.status==='pending' && (
                <AppButton className="ml-2" variant="secondary" onClick={(e)=>{e.preventDefault(); setKyc({...kyc, status:'verified'})}}>Mark Verified (demo)</AppButton>
              )}
            </div>
          </form>
        </AppCard>
        <AppCard className="p-5">
          <div className="text-sm text-zinc-500 mb-2">Notifications</div>
          <div className="flex items-center justify-between text-sm py-2">
            <span>Odds boost alerts</span>
            <input type="checkbox" defaultChecked/>
          </div>
          <div className="flex items-center justify-between text-sm py-2">
            <span>Bet settlement</span>
            <input type="checkbox" defaultChecked/>
          </div>
        </AppCard>
      </div>
    </Shell>
  )
}

/*************************
 * Responsible Gaming     *
 *************************/
function Responsible(){
  const { wallet, setWallet, tx, setTx } = useApp();
  const [dailyLimit, setDailyLimit] = useState(5000);
  const [cooloff, setCooloff] = useState(0); // hours
  return (
    <Shell>
      <AppHeader title="Responsible Gaming" subtitle="Tools to stay in control"/>
      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <AppCard className="p-5 lg:col-span-2">
          <div className="space-y-4 text-sm">
            <p>PredictPlay encourages safe play. Set limits and use cool-off when needed.</p>
            <div>
              <label className="text-sm">Daily Deposit Limit (INR)</label>
              <Input type="number" value={dailyLimit} onChange={e=>setDailyLimit(Number(e.target.value))}/>
            </div>
            <div>
              <label className="text-sm">Cool-off period (hours)</label>
              <Input type="number" value={cooloff} onChange={e=>setCooloff(Number(e.target.value))}/>
            </div>
            <div className="text-xs text-zinc-500">* These controls are simulated in this demo.</div>
          </div>
        </AppCard>
        <AppCard className="p-5">
          <div className="text-sm text-zinc-500 mb-2">Help</div>
          <p className="text-sm">If betting stops being fun, take a break. In emergencies, contact local helplines.</p>
        </AppCard>
      </div>
    </Shell>
  )
}

/****************
 * Legal pages   *
 ****************/
const SimplePage = ({title, body}) => (
  <Shell>
    <AppHeader title={title}/>
    <AppCard className="p-5 mt-6 text-sm text-zinc-600 whitespace-pre-wrap">{body}</AppCard>
  </Shell>
);

/****************
 * Root & Router *
 ****************/
function RequireAuth({children}){
  const { user } = useApp();
  return user ? children : <Navigate to="/auth" replace/>;
}

function AppRoutes(){
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/auth" element={<Auth/>}/>
      <Route path="/markets" element={<Markets/>}/>
      <Route path="/markets/:id" element={<FixtureDetail/>}/>
      <Route path="/wallet" element={<RequireAuth><WalletPage/></RequireAuth>}/>
      <Route path="/transactions" element={<RequireAuth><Transactions/></RequireAuth>}/>
      <Route path="/profile" element={<RequireAuth><Profile/></RequireAuth>}/>
      <Route path="/responsible" element={<Responsible/>}/>
      <Route path="/terms" element={<SimplePage title="Terms of Service" body={"This is a demo. No real money or bets.\nUse responsibly."}/>}/>
      <Route path="/privacy" element={<SimplePage title="Privacy Policy" body={"This demo stores data locally in your browser using localStorage.\nClear site data to reset."}/>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  )
}

export default function PredictPlay(){
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes/>
      </AppProvider>
    </BrowserRouter>
  );
}





