import MetaTrader5 as mt5
import time
import firebase_admin
from firebase_admin import credentials, firestore

# --- AYARLAR ---
# serviceAccountKey.json dosyasının bu dosya ile AYNI klasörde olması şart!
KEY_DOSYASI = "serviceAccountKey.json"

def main():
    print("🌍 WEB PANEL BOTU BAŞLATILIYOR...")

    # 1. MT5 BAĞLANTISI
    if not mt5.initialize():
        print("❌ MT5'e bağlanılamadı! Lütfen MT5 terminalinin açık olduğundan emin olun.")
        mt5.shutdown()
        return
    else:
        print("✅ MT5 Bağlantısı Başarılı.")

    # 2. FIREBASE BAĞLANTISI
    try:
        cred = credentials.Certificate(KEY_DOSYASI)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✅ Firebase (Veritabanı) Bağlantısı Başarılı!")
    except Exception as e:
        print(f"❌ Firebase Hatası: {e}")
        print("Lütfen 'serviceAccountKey.json' dosyasının adını ve yerini kontrol et.")
        return

    print("🚀 SİSTEM AKTİF! Veriler web sitesine akıyor...")
    print("------------------------------------------------")

    # --- SONSUZ DÖNGÜ ---
    while True:
        try:
            # --- HESAP BİLGİLERİNİ ÇEK ---
            acc = mt5.account_info()
            if acc:
                margin_level = acc.margin_level if acc.margin_level else 0
                
                # Veriyi hazırla
                account_data = {
                    "balance": float(acc.balance),
                    "equity": float(acc.equity),
                    "margin": float(acc.margin),
                    "free_margin": float(acc.margin_free),
                    "margin_level": float(margin_level),
                    "profit": float(acc.profit),
                    "updated_at": firestore.SERVER_TIMESTAMP # Sunucu zamanı
                }
                # Veritabanına yaz (Hesap)
                db.collection("dashboard").document("account").set(account_data)

            # --- AÇIK POZİSYONLARI ÇEK ---
            positions = mt5.positions_get()
            pos_list = []
            
            if positions:
                for p in positions:
                    # Kar hesaplama (Swap ve Komisyon dahil)
                    net_profit = p.profit + p.swap + p.commission
                    
                    pos_list.append({
                        "ticket": p.ticket,
                        "symbol": p.symbol,
                        "type": "BUY" if p.type == 0 else "SELL",
                        "volume": float(p.volume),
                        "open_price": float(p.price_open),
                        "current_price": float(p.price_current),
                        "profit": float(net_profit),
                        "time": p.time
                    })
            
            # Veritabanına yaz (Pozisyonlar)
            db.collection("dashboard").document("positions").set({"active": pos_list})

            # Ekrana bilgi bas (Çalıştığını görelim)
            print(f"📡 Güncellendi | Equity: {acc.equity} | Açık İşlem: {len(pos_list)}")
            
            # 1 Saniye bekle
            time.sleep(1)

        except Exception as e:
            print(f"⚠️ Bir hata oluştu (Bot durmadı, devam ediyor): {e}")
            time.sleep(3)

if __name__ == "__main__":
    main()
