import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpCircle, Activity, DollarSign, Clock, TrendingUp, Menu, X, Wallet, PieChart } from 'lucide-react';

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

// --- COMPONENTLER ---
const StatCard = ({ title, value, subValue, icon: Icon, trend }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col justify-between shadow-lg hover:border-blue-500/50 transition-colors">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-slate-700/50 rounded-lg">
        <Icon className="text-blue-400 w-6 h-6" />
      </div>
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
          <div className="text-xs text-slate-400">Lot: {pos.volume} • Giriş: {pos.open_price}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-lg font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isProfit ? '+' : ''}{parseFloat(pos.profit).toFixed(2)} $
        </div>
        <div className="text-xs text-slate-500">{pos.current_price}</div>
      </div>
    </div>
  );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [account, setAccount] = useState({ balance: 0, equity: 0, margin: 0, profit: 0 });
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);

  // Firebase'den Veri Dinleme
  useEffect(() => {
    // 1. Hesap Bilgilerini Dinle
    const unsubAccount = onSnapshot(doc(db, "dashboard", "account"), (doc) => {
      if (doc.exists()) {
        setAccount(doc.data());
      }
    });

    // 2. Açık İşlemleri Dinle
    const unsubPositions = onSnapshot(doc(db, "dashboard", "positions"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setPositions(data.active || []);
        
        // Geçmiş verisi simülasyonu (Veritabanına yazılınca oradan çekilecek)
        if(data.history) setHistory(data.history);
      }
    });

    return () => {
      unsubAccount();
      unsubPositions();
    };
  }, []);

  // Equity Grafiği için basit veri hazırlama
  const chartData = [
    { name: 'Start', equity: account.balance },
    { name: 'Now', equity: account.equity }
  ];

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
              <button className="text-sm font-medium text-white transition-colors">Dashboard</button>
            </nav>

            <div className="flex items-center gap-4">
               <div className="hidden sm:block text-right">
                <div className="text-xs text-slate-500">Durum</div>
                <div className="text-sm font-mono font-medium text-emerald-400">ONLINE</div>
              </div>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white">
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
          <StatCard title="BAKİYE (BALANCE)" value={`$${account.balance.toFixed(2)}`} subValue={`Equity: $${account.equity.toFixed(2)}`} icon={Wallet} />
          <StatCard title="TOPLAM KÂR" value={`$${(account.equity - account.balance).toFixed(2)}`} subValue="Anlık Durum" icon={DollarSign} />
          <StatCard title="AÇIK POZİSYON" value={positions.length} subValue="Adet İşlem" icon={PieChart} />
          <StatCard title="MARGIN LEVEL" value={`%${account.margin_level || 0}`} subValue="Risk Durumu" icon={TrendingUp} />
        </div>

        {/* CHARTS & POSITIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart */}
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Varlık Grafiği
              </h2>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis domain={['auto', 'auto']} stroke="#64748b" tickFormatter={(val) => `$${val}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                  <Area type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEquity)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-center items-center">
             <h2 className="text-lg font-bold text-white mb-6 w-full text-left">Özet</h2>
             <div className="w-full space-y-4">
                <div className="flex justify-between p-3 bg-slate-700/30 rounded">
                  <span className="text-slate-400">Serbest Marjin</span>
                  <span className="font-bold text-white">${account.free_margin ? account.free_margin.toFixed(2) : 0}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-700/30 rounded">
                  <span className="text-slate-400">Kullanılan Marjin</span>
                  <span className="font-bold text-white">${account.margin ? account.margin.toFixed(2) : 0}</span>
                </div>
             </div>
          </div>
        </div>

        {/* POSITIONS TABLE */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <h3 className="text-white font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-blue-400" /> Açık İşlemler</h3>
            </div>
            <div className="divide-y divide-slate-700">
              {positions.length > 0 ? (
                positions.map((pos, index) => <PositionRow key={index} pos={pos} />)
              ) : (
                <div className="p-8 text-center text-slate-500">Açık işlem yok.</div>
              )}
            </div>
          </div>

      </main>
    </div>
  );
}
