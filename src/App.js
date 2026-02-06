import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { LayoutDashboard, History, LineChart, Wallet, ArrowUpRight, ArrowDownRight, Clock, Calendar, TrendingUp, TrendingDown, Menu, X, DollarSign, Activity } from 'lucide-react';

// --- FIREBASE ---
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

// --- YARDIMCI FONKSIYONLAR ---
const fmtMoney = (num) => num ? `$${parseFloat(num).toFixed(2)}` : "$0.00";
const fmtDate = (timestamp) => {
  if(!timestamp) return "-";
  return new Date(timestamp * 1000).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' });
};

// --- COMPONENTLER ---
const StatCard = ({ title, value, subValue, icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: "text-blue-400 bg-blue-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    rose: "text-rose-400 bg-rose-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    amber: "text-amber-400 bg-amber-500/10"
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col justify-between shadow-lg">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div>
        <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <div className="text-2xl font-bold text-white">{value}</div>
        {subValue && <div className="text-xs text-slate-500 mt-1">{subValue}</div>}
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Data States
  const [account, setAccount] = useState({ balance: 0, equity: 0, margin: 0, profit: 0 });
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  const [transfers, setTransfers] = useState([]);

  // Veri Çekme
  useEffect(() => {
    // 1. Hesap
    const unsubAccount = onSnapshot(doc(db, "dashboard", "account"), (doc) => doc.exists() && setAccount(doc.data()));
    // 2. Açık Pozisyonlar
    const unsubPositions = onSnapshot(doc(db, "dashboard", "positions"), (doc) => doc.exists() && setPositions(doc.data().active || []));
    // 3. Geçmiş & Transferler
    const unsubHistory = onSnapshot(doc(db, "dashboard", "history"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // Tarihe göre sırala (Yeniden eskiye)
        if(data.deals) setHistory(data.deals.sort((a,b) => b.close_time - a.close_time));
        if(data.transfers) setTransfers(data.transfers.sort((a,b) => b.time - a.time));
      }
    });

    return () => { unsubAccount(); unsubPositions(); unsubHistory(); };
  }, []);

  // --- ANALİZ HESAPLAMALARI ---
  const totalDeposit = transfers.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalWithdraw = transfers.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const totalTrades = history.length;
  const wins = history.filter(t => t.net_profit > 0);
  const losses = history.filter(t => t.net_profit <= 0);
  const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
  
  const totalProfitVal = wins.reduce((sum, t) => sum + t.net_profit, 0);
  const totalLossVal = Math.abs(losses.reduce((sum, t) => sum + t.net_profit, 0));
  const profitFactor = totalLossVal > 0 ? (totalProfitVal / totalLossVal).toFixed(2) : "∞";
  
  const avgWin = wins.length > 0 ? totalProfitVal / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalLossVal / losses.length : 0;

  // Grafik Verileri
  const pnlData = history.slice(0, 30).reverse().map(t => ({
    name: new Date(t.close_time * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    pnl: t.net_profit
  }));

  const pieData = [
    { name: 'Kazanç', value: wins.length, color: '#10b981' },
    { name: 'Kayıp', value: losses.length, color: '#f43f5e' },
  ];

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30 pb-20 md:pb-0">
      
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg"><Activity className="w-5 h-5 text-white" /></div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">CEO TRADER</h1>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-emerald-400 font-medium tracking-wider">LIVE V2.0</span>
                </div>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
              {['dashboard', 'history', 'analysis'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                 <div className="text-xs text-slate-500">Net Balance</div>
                 <div className="font-mono font-bold text-white">{fmtMoney(account.balance)}</div>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 z-50 flex justify-around p-3 pb-6">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-blue-400' : 'text-slate-500'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[10px]">Panel</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-blue-400' : 'text-slate-500'}`}>
          <History size={20} />
          <span className="text-[10px]">Geçmiş</span>
        </button>
        <button onClick={() => setActiveTab('analysis')} className={`flex flex-col items-center gap-1 ${activeTab === 'analysis' ? 'text-blue-400' : 'text-slate-500'}`}>
          <LineChart size={20} />
          <span className="text-[10px]">Analiz</span>
        </button>
      </div>

      {/* CONTENT AREA */}
      <main className="pt-24 px-4 max-w-7xl mx-auto space-y-6">

        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="VARLIK (EQUITY)" value={fmtMoney(account.equity)} subValue={`Bakiye: ${fmtMoney(account.balance)}`} icon={Wallet} color="blue" />
              <StatCard title="GÜNLÜK PNL" value={fmtMoney(account.profit)} subValue="Açık Pozisyonlar Dahil" icon={DollarSign} color={account.profit >= 0 ? "emerald" : "rose"} />
              <StatCard title="MARGIN LEVEL" value={`%${parseFloat(account.margin_level).toFixed(0)}`} subValue={`Free: ${fmtMoney(account.free_margin)}`} icon={Activity} color="purple" />
              <StatCard title="AÇIK İŞLEM" value={positions.length} subValue="Aktif Pozisyonlar" icon={Clock} color="amber" />
            </div>

            {/* Live Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2"><TrendingUp className="text-emerald-400" size={20} /> Canlı Büyüme (Son İşlemler)</h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer>
                  <AreaChart data={pnlData}>
                    <defs>
                      <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis stroke="#64748b" tickFormatter={(val) => `$${val}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                    <Area type="monotone" dataKey="pnl" stroke="#3b82f6" fill="url(#colorPnL)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Active Positions Table */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-700 bg-slate-800/50"><h3 className="text-white font-bold">Açık İşlemler</h3></div>
              <div className="divide-y divide-slate-700">
                {positions.length === 0 ? <div className="p-8 text-center text-slate-500">İşlem yok</div> : positions.map((pos, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-700/30">
                    <div className="flex items-center gap-3">
                       <div className={`w-1 h-8 rounded-full ${pos.type === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                       <div>
                         <div className="font-bold text-white flex gap-2 items-center">{pos.symbol} <span className={`text-[10px] px-1.5 rounded ${pos.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{pos.type}</span></div>
                         <div className="text-xs text-slate-400">{pos.volume} Lot • {pos.open_price}</div>
                       </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-bold ${pos.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{pos.profit >= 0 ? '+' : ''}{pos.profit.toFixed(2)} $</div>
                      <div className="text-xs text-slate-500">Swap: {pos.swap}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- HISTORY TAB --- */}
        {activeTab === 'history' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-300">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2"><History className="text-blue-400" size={20} /> İşlem Geçmişi</h3>
              <span className="text-xs text-slate-500">{history.length} Kayıt</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900/50 uppercase text-xs font-bold text-slate-300">
                  <tr>
                    <th className="p-4">Sembol</th>
                    <th className="p-4">Tarih</th>
                    <th className="p-4">Tip/Lot</th>
                    <th className="p-4 text-right">Fiyat</th>
                    <th className="p-4 text-right">Swap/Kom.</th>
                    <th className="p-4 text-right">NET PNL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {history.map((t, i) => (
                    <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-bold text-white">{t.symbol}</td>
                      <td className="p-4 text-xs whitespace-nowrap">{fmtDate(t.close_time)}</td>
                      <td className="p-4"><span className={`text-[10px] px-2 py-0.5 rounded ${t.type === 'BUY' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>{t.type}</span> <span className="text-xs ml-1">{t.volume}</span></td>
                      <td className="p-4 text-right">{t.price}</td>
                      <td className="p-4 text-right text-xs">{(t.swap + t.commission).toFixed(2)}</td>
                      <td className={`p-4 text-right font-mono font-bold ${t.net_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.net_profit >= 0 ? '+' : ''}{t.net_profit.toFixed(2)} $
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- ANALYSIS TAB --- */}
        {activeTab === 'analysis' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            
            {/* Money Flow */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                 <div className="text-emerald-400 text-xs font-bold uppercase mb-1">Toplam Yatırılan</div>
                 <div className="text-2xl font-bold text-white">{fmtMoney(totalDeposit)}</div>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
                 <div className="text-rose-400 text-xs font-bold uppercase mb-1">Toplam Çekilen</div>
                 <div className="text-2xl font-bold text-white">{fmtMoney(totalWithdraw)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Win Rate Circle */}
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
                <h3 className="text-slate-300 font-bold mb-4 w-full text-left">Başarı Oranı (Win Rate)</h3>
                <div className="relative w-48 h-48">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-3xl font-bold text-white">%{winRate.toFixed(1)}</span>
                     <span className="text-xs text-slate-500">Toplam {totalTrades} İşlem</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 w-full mt-6 gap-4 text-center">
                    <div className="bg-slate-700/30 p-2 rounded"><div className="text-emerald-400 font-bold">{wins.length}</div><div className="text-xs text-slate-500">Kazanç</div></div>
                    <div className="bg-slate-700/30 p-2 rounded"><div className="text-rose-400 font-bold">{losses.length}</div><div className="text-xs text-slate-500">Kayıp</div></div>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg flex flex-col justify-center">
                 <h3 className="text-slate-300 font-bold mb-6">Performans Metrikleri</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-700/20 rounded-lg">
                       <span className="text-slate-400 text-sm">Profit Factor</span>
                       <span className="text-white font-bold font-mono">{profitFactor}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/20 rounded-lg">
                       <span className="text-slate-400 text-sm">Ortalama Kazanç</span>
                       <span className="text-emerald-400 font-bold font-mono">+{avgWin.toFixed(2)} $</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/20 rounded-lg">
                       <span className="text-slate-400 text-sm">Ortalama Kayıp</span>
                       <span className="text-rose-400 font-bold font-mono">-{avgLoss.toFixed(2)} $</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/20 rounded-lg">
                       <span className="text-slate-400 text-sm">Risk / Ödül (R:R)</span>
                       <span className="text-blue-400 font-bold font-mono">1 : {(avgLoss > 0 ? avgWin/avgLoss : 0).toFixed(2)}</span>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

**Özet:**
Bu kodları uyguladığında, web siten sıradan bir göstergeden çıkıp, tam teşekküllü, mobil uyumlu, sekmeli ve analiz yeteneği olan profesyonel bir uygulamaya dönüşecek. Telefonunda "Geçmiş" sekmesine basıp anında tüm eski işlemlerini görebileceksin.
