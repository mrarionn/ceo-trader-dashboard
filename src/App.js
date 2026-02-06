import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Activity, DollarSign, Clock, TrendingUp, TrendingDown, Menu, X, Wallet, PieChart } from 'lucide-react';

// --- MOCK DATA (Şimdilik Demo Veri - Sonra Firebase Bağlanacak) ---
const INITIAL_BALANCE = 10000;
const MOCK_HISTORY = [
  { time: '09:00', equity: 10000, balance: 10000 },
  { time: '10:00', equity: 10050, balance: 10000 },
  { time: '11:00', equity: 10120, balance: 10120 },
  { time: '12:00', equity: 10080, balance: 10120 },
  { time: '13:00', equity: 10250, balance: 10250 },
  { time: '14:00', equity: 10210, balance: 10250 },
  { time: '15:00', equity: 10350, balance: 10350 },
];

const OPEN_POSITIONS = [
  { id: 123456, symbol: 'XAUUSD', type: 'BUY', volume: 0.10, entry: 2030.50, current: 2035.20, profit: 47.00, time: '14:30' },
  { id: 123457, symbol: 'EURUSD', type: 'SELL', volume: 0.50, entry: 1.0850, current: 1.0860, profit: -50.00, time: '15:10' },
  { id: 123458, symbol: 'BTCUSD', type: 'BUY', volume: 0.01, entry: 42000, current: 42500, profit: 5.00, time: '15:45' },
];

const RECENT_HISTORY = [
  { id: 998877, symbol: 'US30', type: 'BUY', profit: 120.50, date: 'Bugün 12:00' },
  { id: 998876, symbol: 'GBPUSD', type: 'SELL', profit: -45.00, date: 'Bugün 11:15' },
  { id: 998875, symbol: 'XAUUSD', type: 'SELL', profit: 85.00, date: 'Bugün 10:30' },
  { id: 998874, symbol: 'NAS100', type: 'BUY', profit: 210.00, date: 'Bugün 09:45' },
];

// --- COMPONENTLER ---

const StatCard = ({ title, value, subValue, icon: Icon, trend }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col justify-between shadow-lg hover:border-blue-500/50 transition-colors">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-slate-700/50 rounded-lg">
        <Icon className="text-blue-400 w-6 h-6" />
      </div>
      {trend && (
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {trend === 'up' ? '+2.4%' : '-0.5%'}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subValue && <div className="text-xs text-slate-500 mt-1">{subValue}</div>}
    </div>
  </div>
);

const PositionRow = ({ pos }) => {
  const isProfit = pos.profit >= 0;
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/50 border-b border-slate-700 last:border-0 hover:bg-slate-700/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-1 h-10 rounded-full ${pos.type === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
        <div>
          <div className="font-bold text-white text-lg flex items-center gap-2">
            {pos.symbol}
            <span className={`text-xs px-1.5 py-0.5 rounded ${pos.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {pos.type}
            </span>
          </div>
          <div className="text-xs text-slate-400">Lot: {pos.volume} • Giriş: {pos.entry}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-lg font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isProfit ? '+' : ''}{pos.profit.toFixed(2)} $
        </div>
        <div className="text-xs text-slate-500">{pos.current}</div>
      </div>
    </div>
  );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [equityData, setEquityData] = useState(MOCK_HISTORY);

  // Gerçek zamanlı veri simülasyonu
  useEffect(() => {
    const interval = setInterval(() => {
      const lastItem = equityData[equityData.length - 1];
      const randomFluctuation = (Math.random() - 0.5) * 10;
      const newEquity = lastItem.equity + randomFluctuation;
      
      const newData = [...equityData];
      newData[newData.length - 1] = { ...lastItem, equity: newEquity };
      setEquityData(newData);
    }, 1000);
    return () => clearInterval(interval);
  }, [equityData]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">CEO TRADER</h1>
                <p className="text-xs text-blue-400 font-medium tracking-wider">LIVE TERMINAL</p>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              {['Dashboard', 'Analiz', 'Ayarlar'].map((item) => (
                <button key={item} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  {item}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <div className="text-xs text-slate-500">Sunucu Saati</div>
                <div className="text-sm font-mono font-medium text-slate-300">14:32:45 UTC+3</div>
              </div>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white"
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* TOP STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="TOPLAM BAKİYE" value="$10,350.00" subValue="Equity: $10,352.00" icon={Wallet} trend="up" />
          <StatCard title="GÜNLÜK KÂR (PNL)" value="+$350.00" subValue="Hedef: $500.00" icon={DollarSign} trend="up" />
          <StatCard title="AÇIK POZİSYONLAR" value="3" subValue="Margin Level: %1500" icon={PieChart} />
          <StatCard title="WIN RATE (WR)" value="%68.5" subValue="Son 30 Gün" icon={TrendingUp} trend="down" />
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Büyüme Eğrisi (Equity Curve)
              </h2>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 12}} />
                  <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} itemStyle={{ color: '#60a5fa' }} />
                  <Area type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEquity)" />
                  <Line type="monotone" dataKey="balance" stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-center items-center">
            <h2 className="text-lg font-bold text-white mb-6 w-full text-left flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Performans
            </h2>
            <div className="relative w-48 h-48 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="96" cy="96" r="88" stroke="#334155" strokeWidth="12" fill="transparent" />
                 <circle cx="96" cy="96" r="88" stroke="#10b981" strokeWidth="12" fill="transparent" strokeDasharray="552" strokeDashoffset="150" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-4xl font-bold text-white">%72</span>
                 <span className="text-xs text-slate-400">Başarı Oranı</span>
               </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 w-full text-center">
              <div className="bg-slate-700/30 p-3 rounded-lg"><div className="text-emerald-400 font-bold text-xl">45</div><div className="text-xs text-slate-400">Kazanç</div></div>
              <div className="bg-slate-700/30 p-3 rounded-lg"><div className="text-rose-400 font-bold text-xl">18</div><div className="text-xs text-slate-400">Kayıp</div></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <h3 className="text-white font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-blue-400" /> Açık İşlemler</h3>
            </div>
            <div className="divide-y divide-slate-700">
              {OPEN_POSITIONS.map(pos => <PositionRow key={pos.id} pos={pos} />)}
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <h3 className="text-white font-bold flex items-center gap-2"><ArrowUpCircle className="w-5 h-5 text-slate-400" /> Son İşlemler</h3>
            </div>
            <div className="divide-y divide-slate-700">
              {RECENT_HISTORY.map(trade => (
                <div key={trade.id} className="flex items-center justify-between p-4 hover:bg-slate-700/30">
                   <div className="flex flex-col"><span className="font-bold text-slate-200 text-sm">{trade.symbol}</span><span className={`text-xs font-bold ${trade.type === 'BUY' ? 'text-blue-400' : 'text-orange-400'}`}>{trade.type}</span></div>
                   <div className="flex flex-col text-right"><span className={`font-mono font-bold ${trade.profit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{trade.profit > 0 ? '+' : ''}{trade.profit.toFixed(2)} $</span><span className="text-xs text-slate-500">{trade.date}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
