import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { LayoutDashboard, History, LineChart, Wallet, Clock, TrendingUp, TrendingDown, Menu, X, DollarSign, Activity, List, ArrowUp, ArrowDown, Filter, ChevronUp, ChevronDown, Calendar, Globe, BarChart2, PieChart as PieChartIcon, AlertTriangle } from 'lucide-react';

// --- FIREBASE BAĞLANTISI ---
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA17vvOEjM0WolYoKJ8TwVqY-PH8XQUKdM",
  authDomain: "ceo-trader.firebaseapp.com",
  projectId: "ceo-trader",
  storageBucket: "ceo-trader.firebasestorage.app",
  messagingSenderId: "320227241522",
  appId: "1:320227241522:web:b6c2bc17ee2ceffcd4162b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- STİL & YARDIMCILAR ---
const globalStyles = `
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #475569; }
  
  .glass-card {
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
  }
  
  .neon-text { text-shadow: 0 0 10px rgba(255,255,255,0.5); }
  .neon-green { filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.6)); }
  .neon-red { filter: drop-shadow(0 0 4px rgba(244, 63, 94, 0.6)); }
  .neon-blue { filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.6)); }
`;

const fmtMoney = (num) => num ? `$${parseFloat(num).toFixed(2)}` : "$0.00";
const fmtDate = (timestamp) => {
  if(!timestamp) return "-";
  return new Date(timestamp * 1000).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' });
};

// --- ORTAK TOOLTIP STİLİ ---
const tooltipStyle = {
    contentStyle: { backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' },
    itemStyle: { color: '#f1f5f9' },
    labelStyle: { color: '#94a3b8', marginBottom: '0.25rem' }
};
const transparentCursor = { fill: 'rgba(255, 255, 255, 0.05)' }; 

// --- BİLEŞENLER ---

const MarketSessions = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  
  const utcHour = time.getUTCHours();
  const sessions = [
    { name: 'Sydney', start: 22, end: 7, active: utcHour >= 22 || utcHour < 7 },
    { name: 'Tokyo', start: 0, end: 9, active: utcHour >= 0 && utcHour < 9 },
    { name: 'London', start: 8, end: 17, active: utcHour >= 8 && utcHour < 17 },
    { name: 'New York', start: 13, end: 22, active: utcHour >= 13 && utcHour < 22 },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 mb-6">
      {sessions.map(s => (
        <div key={s.name} className={`relative overflow-hidden flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-500 ${s.active ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'glass-card border-slate-700/50 opacity-40'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${s.active ? 'text-emerald-400 neon-text' : 'text-slate-500'}`}>{s.name}</span>
          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${s.active ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,1)]' : 'bg-slate-600'}`}></div>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ title, value, subValue, icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
  };

  return (
    <div className="glass-card p-5 rounded-xl flex flex-col justify-between hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2.5 rounded-xl border transition-all duration-300 ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex gap-0.5 items-end h-6 opacity-30">
           {[...Array(5)].map((_,i) => <div key={i} className={`w-1 rounded-t-sm transition-all duration-500 ${colorClasses[color].split(' ')[0].replace('text','bg')}`} style={{height: `${Math.random()*100}%`}}></div>)}
        </div>
      </div>
      <div>
        <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1 opacity-80">{title}</h3>
        <div className="text-2xl font-bold text-white tracking-tight drop-shadow-md">{value}</div>
        {subValue && <div className="text-xs text-slate-500 mt-1 font-medium">{subValue}</div>}
      </div>
    </div>
  );
};

const LiveTicker = () => {
  const [prices, setPrices] = useState({
    XAUUSD: { val: 2035.00, dir: 0 }, 
    BTCUSD: { val: 0, dir: 0 },       
    ETHUSD: { val: 0, dir: 0 }        
  });

  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade/ethusdt@trade');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const symbol = data.s === 'BTCUSDT' ? 'BTCUSD' : 'ETHUSD';
      const price = parseFloat(data.p);
      setPrices(prev => ({...prev, [symbol]: { val: price, dir: price > prev[symbol].val ? 1 : -1 }}));
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "dashboard", "prices"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.XAUUSD) {
            setPrices(prev => ({...prev, XAUUSD: { val: data.XAUUSD, dir: data.XAUUSD > prev.XAUUSD.val ? 1 : -1 }}));
        }
      }
    });
    return () => unsub();
  }, []);

  const priceList = Object.entries(prices).map(([key, data]) => (
    <span key={key} className="flex items-center gap-2 mx-6">
      <span className="font-bold text-slate-300">{key}</span>
      <span className={`${data.dir > 0 ? 'text-emerald-400' : data.dir < 0 ? 'text-rose-400' : 'text-slate-400'} flex items-center font-mono`}>
        {data.val > 0 ? data.val.toFixed(2) : '---'}
        {data.dir > 0 ? <ArrowUp size={12} className="ml-1"/> : data.dir < 0 ? <ArrowDown size={12} className="ml-1"/> : null}
      </span>
    </span>
  ));

  return (
    <div className="fixed bottom-0 w-full bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-800 h-6 flex items-center overflow-hidden z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
       <div className="flex animate-marquee whitespace-nowrap">
          {priceList}
          {priceList}
          {priceList}
          {priceList}
       </div>
       <style>{`
        .animate-marquee { animation: marquee 35s linear infinite; display: flex; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
      `}</style>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [account, setAccount] = useState({ balance: 0, equity: 0, margin: 0, profit: 0 });
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'close_time', direction: 'desc' });

  useEffect(() => {
    const unsubAccount = onSnapshot(doc(db, "dashboard", "account"), (doc) => { if(doc.exists()) setAccount(doc.data()); });
    const unsubPositions = onSnapshot(doc(db, "dashboard", "positions"), (doc) => { if(doc.exists()) setPositions(doc.data().active || []); });
    const unsubHistory = onSnapshot(doc(db, "dashboard", "history"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setHistory(data.deals || []);
        setTransfers(data.transfers || []);
      }
    });
    return () => { unsubAccount(); unsubPositions(); unsubHistory(); };
  }, []);

  const equityData = useMemo(() => {
    const allEvents = [
        ...history.map(h => ({ time: h.close_time, amount: h.net_profit, type: 'trade' })),
        ...transfers.map(t => ({ time: t.time, amount: t.amount, type: 'transfer' }))
    ].sort((a, b) => a.time - b.time);

    if (allEvents.length === 0) return [];
    
    let runningBalance = 0;
    let startIndex = 0;

    if (allEvents.length > 0 && allEvents[0].type === 'transfer' && allEvents[0].amount > 0) {
        runningBalance = allEvents[0].amount;
        startIndex = 1;
    }

    const curve = [{ 
        name: 'Başlangıç', 
        balance: runningBalance,
        date: allEvents.length > 0 ? new Date(allEvents[0].time * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '' 
    }];
    
    for (let i = startIndex; i < allEvents.length; i++) {
        const event = allEvents[i];
        runningBalance += event.amount;
        curve.push({
            name: i,
            balance: runningBalance,
            date: new Date(event.time * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
        });
    }
    return curve;
  }, [history, transfers]);

  // YENİ GÜNLÜK PNL HESAPLAMASI (SMART PNL)
  // Bugün kapananların karı + Şu an açık olanların anlık karı
  const dailyPnL = useMemo(() => {
    if (!history) return account.profit;
    const now = new Date();
    // Bugünün başlangıcı (00:00:00)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
    
    // 1. Bugün kapanan (Realized)
    const realizedToday = history
      .filter(t => t.close_time >= startOfDay)
      .reduce((sum, t) => sum + t.net_profit, 0);
    
    // 2. Açık olan (Floating - Unrealized)
    const floating = account.profit || 0;

    return realizedToday + floating;
  }, [history, account.profit]);

  const analysisData = useMemo(() => {
      const wins = history.filter(t => t.net_profit > 0);
      const losses = history.filter(t => t.net_profit <= 0);
      const totalTrades = history.length;
      const totalDeposit = transfers.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      const totalWithdraw = transfers.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const totalProfitVal = wins.reduce((sum, t) => sum + t.net_profit, 0);
      const totalLossVal = Math.abs(losses.reduce((sum, t) => sum + t.net_profit, 0));
      
      const dayPerf = { 'Paz': 0, 'Pzt': 0, 'Sal': 0, 'Çar': 0, 'Per': 0, 'Cum': 0, 'Cmt': 0 };
      const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
      const hourPerf = new Array(24).fill(0);

      let longWins = 0, longTotal = 0, longPnl = 0;
      let shortWins = 0, shortTotal = 0, shortPnl = 0;

      history.forEach(t => {
          const d = new Date(t.close_time * 1000);
          dayPerf[dayNames[d.getDay()]] += t.net_profit;
          hourPerf[d.getHours()] += t.net_profit;

          if (t.type === 'BUY') { longTotal++; longPnl += t.net_profit; if (t.net_profit > 0) longWins++; } 
          else { shortTotal++; shortPnl += t.net_profit; if (t.net_profit > 0) shortWins++; }
      });

      const dayChartData = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum'].map(d => ({ name: d, value: dayPerf[d] }));
      const hourChartData = hourPerf.map((val, i) => ({ name: `${i}:00`, value: val }));

      return {
          wins, losses, totalTrades, totalDeposit, totalWithdraw, totalProfitVal, totalLossVal,
          winRate: totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0,
          profitFactor: totalLossVal > 0 ? (totalProfitVal / totalLossVal).toFixed(2) : "∞",
          avgWin: wins.length > 0 ? totalProfitVal / wins.length : 0,
          avgLoss: losses.length > 0 ? totalLossVal / losses.length : 0,
          directionData: {
              long: { pnl: longPnl, count: longTotal, wr: longTotal > 0 ? (longWins/longTotal)*100 : 0 },
              short: { pnl: shortPnl, count: shortTotal, wr: shortTotal > 0 ? (shortWins/shortTotal)*100 : 0 }
          },
          dayChartData, hourChartData
      };
  }, [history, transfers]);

  const sortedHistory = useMemo(() => {
    let items = [...history];
    if (sortConfig) {
      items.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [history, sortConfig]);

  const requestSort = (key) => setSortConfig({ key, direction: (sortConfig.key === key && sortConfig.direction === 'desc') ? 'asc' : 'desc' });
  const SortIcon = ({ colKey }) => sortConfig.key !== colKey ? <Filter size={14} className="opacity-20 ml-1" /> : sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-blue-400 ml-1" /> : <ChevronDown size={14} className="text-blue-400 ml-1" />;
  const pieData = [{ name: 'Kazanç', value: analysisData.wins.length, color: '#10b981' }, { name: 'Kayıp', value: analysisData.losses.length, color: '#f43f5e' }];

  const MobileNav = () => (
    <div className="md:hidden fixed bottom-0 w-full bg-slate-900/90 border-t border-slate-800 z-50 flex justify-around p-3 pb-6 safe-area-bottom backdrop-blur-lg">
      {['dashboard', 'history', 'analysis'].map(tab => (
        <button key={tab} onClick={() => setActiveTab(tab)} className={`flex flex-col items-center gap-1 ${activeTab === tab ? 'text-blue-400' : 'text-slate-500'}`}>
          {tab === 'dashboard' && <LayoutDashboard size={20} />}
          {tab === 'history' && <History size={20} />}
          {tab === 'analysis' && <LineChart size={20} />}
          <span className="text-[10px] capitalize">{tab === 'dashboard' ? 'Panel' : tab === 'history' ? 'Geçmiş' : 'Analiz'}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
    <style>{globalStyles}</style>
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans pb-24 md:pb-12 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
      
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] transform hover:rotate-3 transition-transform cursor-pointer"><Activity className="w-5 h-5 text-white" /></div>
              <div><h1 className="text-lg font-bold text-white tracking-tight leading-tight">TRADER DASH</h1><div className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span><span className="text-[10px] text-emerald-400 font-bold tracking-[0.2em] opacity-80">ARION MP.</span></div></div>
            </div>
            <div className="hidden md:flex bg-slate-900/50 p-1 rounded-xl border border-slate-700/50">
              {['dashboard', 'history', 'analysis'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-105' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
              ))}
            </div>
            <div className="w-10"></div>
          </div>
        </div>
      </header>
      <MobileNav />

      <main className="pt-24 px-4 max-w-7xl mx-auto space-y-6">
        
        {/* === DASHBOARD === */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <MarketSessions />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="VARLIK (EQUITY)" value={fmtMoney(account.equity)} subValue={`Bakiye: ${fmtMoney(account.balance)}`} icon={Wallet} color="blue" />
              {/* DÜZELTİLEN KISIM: GÜNLÜK PNL */}
              <StatCard title="GÜNLÜK PNL" value={fmtMoney(dailyPnL)} subValue="Gerçekleşen + Aktif Pozisyonlar" icon={DollarSign} color={dailyPnL >= 0 ? "emerald" : "rose"} />
              <StatCard title="MARGIN LEVEL" value={`%${parseFloat(account.margin_level).toFixed(0)}`} subValue={`Free: ${fmtMoney(account.free_margin)}`} icon={Activity} color="purple" />
              <StatCard title="AÇIK İŞLEM" value={positions.length} subValue="Aktif Pozisyonlar" icon={Clock} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Grafik */}
              <div className="lg:col-span-2 glass-card rounded-xl p-5 shadow-2xl relative overflow-hidden h-fit">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 opacity-70"></div>
                <div className="flex justify-between items-center mb-6"><h2 className="text-white font-bold flex items-center gap-2 text-lg"><TrendingUp className="text-emerald-400 neon-green" size={20} /> Büyüme Grafiği</h2></div>
                <div className="h-[320px] w-full">
                  {equityData.length > 0 ? (
                    <ResponsiveContainer>
                        <AreaChart data={equityData}>
                        <defs>
                            <linearGradient id="colorEq" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                            <filter id="glow" height="300%" width="300%" x="-100%" y="-100%">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                        <XAxis dataKey="date" hide />
                        <YAxis domain={['auto', 'auto']} stroke="#64748b" tickFormatter={(val) => `$${val}`} width={60} tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                        <Tooltip {...tooltipStyle} formatter={(value) => [`$${value.toFixed(2)}`, 'Bakiye']} cursor={transparentCursor} />
                        <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={3} fill="url(#colorEq)" filter="url(#glow)" activeDot={{r: 6, strokeWidth: 0, fill: '#60a5fa', stroke: '#fff'}} />
                        </AreaChart>
                    </ResponsiveContainer>
                  ) : <div className="h-full flex items-center justify-center text-slate-500 flex-col gap-2"><Activity size={32} className="opacity-50" /><span>Veri bekleniyor...</span></div>}
                </div>
              </div>
              
              {/* Sağ Kolon */}
              <div className="flex flex-col gap-6">
                
                {/* 1. AÇIK İŞLEMLER */}
                <div className={`glass-card rounded-xl overflow-hidden shadow-xl transition-all duration-500 ${positions.length === 0 ? 'p-3 flex items-center justify-between' : 'flex flex-col'}`}>
                  {positions.length === 0 ? (
                    <>
                      <h3 className="text-white font-bold flex items-center gap-2 text-sm"><Clock size={16} className="text-slate-500"/> Açık İşlem Yok</h3>
                      <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"></span><span className="text-[10px] text-slate-500">Beklemede</span></div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 flex justify-between items-center backdrop-blur-sm">
                          <h3 className="text-white font-bold flex items-center gap-2"><Clock size={18} className="text-amber-400 neon-text"/> Açık İşlemler</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">{positions.length} Aktif</span>
                      </div>
                      <div className="divide-y divide-slate-700/50 max-h-[250px] overflow-y-auto scrollbar-thin">
                        {positions.map((pos, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-700/30 transition-all">
                            <div className="flex items-center gap-3">
                               <div className={`w-1 h-8 rounded-full shadow-[0_0_8px_currentColor] ${pos.type === 'BUY' ? 'bg-emerald-500 text-emerald-500' : 'bg-rose-500 text-rose-500'}`}></div>
                               <div><div className="font-bold text-white flex gap-2 items-center text-sm">{pos.symbol} <span className={`text-[9px] px-1.5 rounded ${pos.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{pos.type}</span></div><div className="text-[10px] text-slate-400">{pos.volume} Lot • {pos.open_price}</div></div>
                            </div>
                            <div className="text-right"><div className={`font-mono font-bold text-sm ${pos.profit >= 0 ? 'text-emerald-400 neon-green' : 'text-rose-400 neon-red'}`}>{pos.profit >= 0 ? '+' : ''}{pos.profit.toFixed(2)} $</div></div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* 2. Son İşlemler */}
                <div className="glass-card rounded-xl overflow-hidden shadow-xl flex flex-col flex-1 max-h-[300px]">
                    <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm"><h3 className="text-white font-bold flex items-center gap-2"><List size={18} className="text-blue-400" /> Son Aktiviteler</h3></div>
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-700/50 scrollbar-thin">
                        {history.length === 0 && transfers.length === 0 ? <div className="p-6 text-center text-slate-500 text-sm">Hareket yok.</div> :
                        [...history, ...transfers].sort((a,b) => (b.time || b.close_time) - (a.time || a.close_time)).slice(0, 10).map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-700/30 transition-colors">
                                {item.symbol ? (
                                    <>
                                    <div className="flex flex-col"><span className="text-sm font-bold text-white">{item.symbol}</span><span className={`text-[10px] font-bold ${item.type === 'BUY' ? 'text-blue-400' : 'text-orange-400'}`}>{item.type}</span></div>
                                    <div className="text-right"><div className={`text-sm font-mono font-bold ${item.net_profit >= 0 ? 'text-emerald-400 neon-green' : 'text-rose-400 neon-red'}`}>{item.net_profit >= 0 ? '+' : ''}{item.net_profit.toFixed(2)} $</div><div className="text-[10px] text-slate-500">İşlem</div></div>
                                    </>
                                ) : (
                                    <>
                                    <div className="flex flex-col"><span className="text-sm font-bold text-white">{item.type === 'DEPOSIT' ? 'Giriş' : 'Çekim'}</span><span className="text-[10px] text-slate-500">Transfer</span></div>
                                    <div className="text-right"><div className={`text-sm font-mono font-bold ${item.amount >= 0 ? 'text-emerald-400 neon-green' : 'text-rose-400 neon-red'}`}>{item.amount >= 0 ? '+' : ''}{item.amount} $</div><div className="text-[10px] text-slate-500">{fmtDate(item.time).split(' ')[0]}</div></div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. EKONOMİK TAKVİM WIDGET */}
                <div className="glass-card rounded-xl overflow-hidden shadow-xl h-[200px] relative border-t-4 border-slate-700">
                    <div className="p-2 bg-slate-900/80 border-b border-slate-700 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1"><Calendar size={12}/> Ekonomik Takvim</span>
                        <span className="text-[10px] text-slate-500">USD</span>
                    </div>
                    <div className="w-full h-full bg-transparent">
                        <iframe scrolling="no" allowtransparency="true" frameBorder="0" src="https://s.tradingview.com/embed-widget/events/?locale=tr&colorTheme=dark&isTransparent=true&importanceFilter=-1,0,1&currencyFilter=USD" style={{width: '100%', height: '100%', backgroundColor: 'transparent'}}></iframe>
                    </div>
                </div>
              </div>
            </div>
            
          </div>
        )}

        {/* === HISTORY === */}
        {activeTab === 'history' && (
          <div className="glass-card rounded-xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-300">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center"><h3 className="text-white font-bold flex items-center gap-2"><History className="text-blue-400" size={20} /> İşlem Geçmişi</h3><span className="text-xs text-slate-500">{sortedHistory.length} Kayıt</span></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900/50 uppercase text-[10px] font-bold text-slate-300 tracking-wider">
                  <tr>
                    <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('symbol')}><div className="flex items-center">Sembol <SortIcon colKey="symbol"/></div></th>
                    <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('close_time')}><div className="flex items-center">Tarih <SortIcon colKey="close_time"/></div></th>
                    <th className="p-4">Tip/Lot</th>
                    <th className="p-4 text-right">Fiyat</th>
                    <th className="p-4 text-right">Komisyon</th>
                    <th className="p-4 text-right cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('net_profit')}><div className="flex items-center justify-end">NET PNL <SortIcon colKey="net_profit"/></div></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {sortedHistory.length === 0 ? <tr><td colSpan="6" className="p-10 text-center text-slate-500">Kayıt yok.</td></tr> : sortedHistory.map((t, i) => (
                    <tr key={i} className="hover:bg-slate-700/30 transition-colors group">
                      <td className="p-4 font-bold text-white group-hover:text-blue-400 transition-colors">{t.symbol}</td>
                      <td className="p-4 text-xs whitespace-nowrap text-slate-500 group-hover:text-slate-300">{fmtDate(t.close_time)}</td>
                      <td className="p-4"><span className={`text-[10px] px-2 py-0.5 rounded border ${t.type === 'BUY' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>{t.type}</span> <span className="text-xs ml-1 font-mono">{t.volume}</span></td>
                      <td className="p-4 text-right font-mono">{t.price}</td>
                      <td className="p-4 text-right text-xs text-slate-500">{(t.swap + t.commission).toFixed(2)}</td>
                      <td className={`p-4 text-right font-mono font-bold ${t.net_profit >= 0 ? 'text-emerald-400 neon-green' : 'text-rose-400 neon-red'}`}>{t.net_profit >= 0 ? '+' : ''}{t.net_profit.toFixed(2)} $</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === ANALYSIS (ULTIMATE) === */}
        {activeTab === 'analysis' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="glass-card p-4 rounded-xl border-l-4 border-blue-500"><div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Win Rate</div><div className="text-3xl font-bold text-white mt-1 neon-text">%{analysisData.winRate.toFixed(1)}</div></div>
               <div className="glass-card p-4 rounded-xl border-l-4 border-purple-500"><div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Profit Factor</div><div className="text-3xl font-bold text-white mt-1">{analysisData.profitFactor}</div></div>
               <div className="glass-card p-4 rounded-xl border-l-4 border-emerald-500"><div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Toplam Kâr</div><div className="text-3xl font-bold text-emerald-400 mt-1 neon-green">+{fmtMoney(analysisData.totalProfitVal)}</div></div>
               <div className="glass-card p-4 rounded-xl border-l-4 border-rose-500"><div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Toplam Zarar</div><div className="text-3xl font-bold text-rose-400 mt-1 neon-red">-{fmtMoney(analysisData.totalLossVal)}</div></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Win/Loss Halka Grafik (3D Efektli) */}
              <div className="glass-card p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
                <h3 className="text-slate-300 font-bold mb-4 w-full text-left flex items-center gap-2"><PieChartIcon size={18}/> İşlem Sonuç Dağılımı</h3>
                <div className="relative w-56 h-56">
                  <ResponsiveContainer>
                    <PieChart>
                      {/* Glow Filter Def */}
                      <defs>
                        <filter id="pieGlow" height="300%" width="300%" x="-100%" y="-100%">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <Pie data={pieData} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none"> 
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} filter="url(#pieGlow)" />)}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-4xl font-bold text-white drop-shadow-lg neon-text">%{analysisData.winRate.toFixed(0)}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Başarı</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 w-full mt-6 gap-4 text-center">
                    <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"><div className="text-emerald-400 font-bold text-xl">{analysisData.wins.length}</div><div className="text-[10px] text-emerald-500/70 uppercase">Kazançlı</div></div>
                    <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]"><div className="text-rose-400 font-bold text-xl">{analysisData.losses.length}</div><div className="text-[10px] text-rose-500/70 uppercase">Kayıplı</div></div>
                </div>
              </div>

              {/* Long vs Short Performans */}
              <div className="glass-card p-6 rounded-xl shadow-lg flex flex-col justify-center">
                 <h3 className="text-slate-300 font-bold mb-6 flex items-center gap-2"><BarChart2 size={18}/> Yön Performansı</h3>
                 <div className="space-y-6">
                    <div className="bg-blue-500/5 p-5 rounded-xl border border-blue-500/20 relative overflow-hidden group hover:border-blue-500/40 transition-all">
                       <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><ArrowUp size={60}/></div>
                       <div className="flex justify-between items-center mb-2"><span className="text-blue-400 font-bold flex items-center gap-2 text-sm">BUY (LONG)</span><span className="text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded">{analysisData.directionData.long.count} İşlem</span></div>
                       <div className="flex justify-between items-end"><div className={`text-3xl font-bold ${analysisData.directionData.long.pnl >= 0 ? 'text-emerald-400 neon-green' : 'text-rose-400 neon-red'}`}>{fmtMoney(analysisData.directionData.long.pnl)}</div><div className="text-sm text-slate-300 font-mono">WR: %{analysisData.directionData.long.wr.toFixed(1)}</div></div>
                    </div>
                    <div className="bg-orange-500/5 p-5 rounded-xl border border-orange-500/20 relative overflow-hidden group hover:border-orange-500/40 transition-all">
                       <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><ArrowDown size={60}/></div>
                       <div className="flex justify-between items-center mb-2"><span className="text-orange-400 font-bold flex items-center gap-2 text-sm">SELL (SHORT)</span><span className="text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded">{analysisData.directionData.short.count} İşlem</span></div>
                       <div className="flex justify-between items-end"><div className={`text-3xl font-bold ${analysisData.directionData.short.pnl >= 0 ? 'text-emerald-400 neon-green' : 'text-rose-400 neon-red'}`}>{fmtMoney(analysisData.directionData.short.pnl)}</div><div className="text-sm text-slate-300 font-mono">WR: %{analysisData.directionData.short.wr.toFixed(1)}</div></div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Günlük Performans Grafiği (YENİ EKLENDİ) */}
            <div className="glass-card p-6 rounded-xl shadow-lg">
                <h3 className="text-slate-300 font-bold mb-4">Günlere Göre PNL (Hafta İçi)</h3>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer>
                        <BarChart data={analysisData.dayChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3}/>
                            <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                            <YAxis stroke="#64748b" tick={{fontSize: 11}} axisLine={false} tickLine={false}/>
                            <Tooltip {...tooltipStyle} cursor={transparentCursor} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {analysisData.dayChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#f43f5e'} className="neon-bar" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Saatlik Performans Grafiği (YENİ EKLENDİ) */}
            <div className="glass-card p-6 rounded-xl shadow-lg">
                <h3 className="text-slate-300 font-bold mb-4">Saatlik Performans (Isı Haritası)</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer>
                        <BarChart data={analysisData.hourChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3}/>
                            <XAxis dataKey="name" stroke="#64748b" style={{fontSize: '10px'}} interval={2} />
                            <YAxis stroke="#64748b" tick={{fontSize: 11}} axisLine={false} tickLine={false}/>
                            <Tooltip {...tooltipStyle} cursor={transparentCursor} />
                            <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                                {analysisData.hourChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#3b82f6' : '#f43f5e'} className="neon-bar" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Metrikler Özeti */}
            <div className="glass-card p-6 rounded-xl shadow-lg">
                 <h3 className="text-slate-300 font-bold mb-4 flex items-center gap-2"><List size={18}/> Detaylı İstatistikler</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/50"><span className="text-slate-400 text-sm">Ortalama Kazanç</span><span className="text-emerald-400 font-bold font-mono text-lg neon-green">+{fmtMoney(analysisData.avgWin)}</span></div>
                    <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/50"><span className="text-slate-400 text-sm">Ortalama Kayıp</span><span className="text-rose-400 font-bold font-mono text-lg neon-red">-{fmtMoney(analysisData.avgLoss)}</span></div>
                    <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/50"><span className="text-slate-400 text-sm">Toplam Deposit</span><span className="text-blue-400 font-bold font-mono text-lg neon-blue">{fmtMoney(analysisData.totalDeposit)}</span></div>
                    <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/50"><span className="text-slate-400 text-sm">Toplam Çekim</span><span className="text-orange-400 font-bold font-mono text-lg">{fmtMoney(analysisData.totalWithdraw)}</span></div>
                 </div>
            </div>

          </div>
        )}
      </main>
      
      {/* CANLI TICKER */}
      <LiveTicker />
    </div>
    </>
  );
}
