# Yaskawa Servo Motor Seçim ve Analiz Aracı

Modern ve kullanıcı dostu bir web arayüzü ile Yaskawa Sigma-X ve Sigma-7 serisi servo motorlarınızı seçin, ürün kodlarını oluşturun ve analiz edin.

## ✨ Özellikler

### 🎯 Çift Platform Desteği
- **Sigma-X Serisi**: Yaskawa'nın en yeni servo motor serisi
- **Sigma-7 Serisi**: Kanıtlanmış güvenilir servo motor serisi
- Modern navbar ile kolay platform geçişi

### 📝 Ürün Kod Oluşturucu
- Motor tipini seçin (SGMXA, SGMXJ, SGMXG, SGMXP veya SGM7A, SGM7J, SGM7G, SGM7P)
- Konfigürasyon tipini belirleyin
- Özellikleri seçerek tam ürün kodunu oluşturun
- Canlı önizleme ve tamamlanma göstergesi
- Tek tıkla panoya kopyalama

### 🔍 Kod Açıklayıcı
- Mevcut motor kodlarını yapıştırın
- Otomatik platform algılama (Sigma-X veya Sigma-7)
- Her segment detaylı açıklanır
- Wildcard (?) desteği ile kısmi kodları analiz edin

### 🎨 Modern Arayüz
- Sticky navbar ile her zaman erişilebilir navigasyon
- Responsive tasarım (mobil, tablet, desktop)
- Gradient tasarım ve smooth animasyonlar
- Bilgilendirici info box'lar

## 🚀 Kurulum ve Kullanım

### 1. HTTP Sunucusu Başlatın

Tarayıcı güvenlik politikaları nedeniyle JSON dosyalarını yüklemek için HTTP sunucusu gereklidir.

**Python ile:**
```bash
cd ServoSelection
python -m http.server 8080
```

**Node.js ile:**
```bash
npm install -g http-server
cd ServoSelection
http-server -p 8080
```

### 2. Tarayıcıda Açın

Tarayıcınızda şu adresi açın:
```
http://localhost:8080
```
veya
```
http://localhost:8080/index.html
```

## 📖 Kullanım Kılavuzu

### Ürün Kod Oluşturma

1. **Platform Seçin**: Navbar'dan Sigma-X veya Sigma-7 sekmesine tıklayın
2. **Motor Tipi Seçin**: Dropdown'dan motor tipini seçin
   - Sigma-X: SGMXA, SGMXJ, SGMXG, SGMXP
   - Sigma-7: SGM7A, SGM7J, SGM7G, SGM7P
3. **Konfigürasyon Tipi**: Standart, Dişli Sistemli, vb.
4. **Özellikleri Seçin**: 
   - Motor gücü
   - Encoder tipi
   - Şaft tipi
   - Opsiyonel özellikler (fren, seal, vb.)
5. **Kodu Kopyalayın**: Tamamlandığında "Kodu Kopyala" butonu aktif olur

### Kod Açıklama

1. **Kod Açıkla Sekmesine** geçin
2. Motor kodunu girin veya örnek kodlardan birini seçin
3. Her segment otomatik olarak açıklanır
4. **Wildcard Kullanımı**: Bilinmeyen karakterler için `?` kullanın
   - Örnek: `SGMXA-10?WA4CB1`
   - Örnek: `SGM7A-???C?A`

## 📊 Desteklenen Motor Serileri

### Sigma-X Serisi

| Model | Açıklama | Güç Aralığı |
|-------|----------|-------------|
| **SGMXA** | Genel Amaçlı | 50W - 7kW |
| **SGMXJ** | Düşük Kapasite | 50W - 750W |
| **SGMXG** | Yüksek Kapasite | 0.3kW - 15kW |
| **SGMXP** | Premium | 80W - 1.5kW |

### Sigma-7 Serisi

| Model | Açıklama | Güç Aralığı |
|-------|----------|-------------|
| **SGM7A** | Genel Amaçlı | 50W - 7kW |
| **SGM7J** | Düşük Kapasite | 50W - 750W |
| **SGM7G** | Yüksek Kapasite | 0.3kW - 15kW |
| **SGM7P** | Premium | 80W - 1.5kW |

## 🎯 Temel Özellikler

### Encoder Tipleri
- **Sigma-X**: 26bit Serial (Incremental, Absolute, Batteryless Absolute)
- **Sigma-7**: 17bit, 20bit, 24bit Serial (Incremental, Absolute, Safety, vb.)

### Şaft Tipleri
- Flange Type
- Straight (with/without keyway)
- Conical shaft ends
- Tapped hole
- Double flat key seat

### Opsiyonel Özellikler
- Fren sistemi (24V)
- Shaft seal / Oil seal
- Bölge seçimi (Japonya, Global, Çin)
- Network uyumluluğu (Σ-LINK II, Σ-7 uyumlu)
- Dişli sistemi ve redüksiyon oranları

## 💡 Kullanım İpuçları

1. **Güç Seçimi**: İhtiyacınız olan tork ve hız değerlerine göre motor gücünü seçin
2. **Encoder Seçimi**: 
   - Pozisyon kaybı istemiyorsanız Absolute Encoder
   - Pil değiştirmek istemiyorsanız Batteryless Absolute
   - Yüksek hassasiyet için 24bit encoder (Sigma-7)
3. **Fren**: Dikey eksende veya güç kesintisinde pozisyon tutma gerekiyorsa frenli motor seçin
4. **Dişli Sistemi**: Yüksek tork, düşük hız gerekiyorsa dişli sistemli konfigürasyon seçin
5. **Wildcard**: Eldeki kodun bazı karakterlerini bilmiyorsanız `?` kullanarak diğer özellikleri görün

## 📝 Örnek Kullanım Senaryoları

### Senaryo 1: Yüksek Hassasiyet Uygulaması
```
Platform: Sigma-7
Motor: SGM7J
Güç: 400W
Encoder: 24bit Serial Absolute (7)
Şaft: Straight with keyway
Sonuç: SGM7J-04A7A4
```

### Senaryo 2: Yüksek Tork, Düşük Hız
```
Platform: Sigma-X
Motor: SGMXA
Güç: 1kW
Konfigürasyon: Dişli Sistemli
Dişli Oranı: 1/20
Encoder: Batteryless Absolute
Sonuç: SGMXA-10AWA-HN-4CB1
```

### Senaryo 3: Kod Analizi (Kısmi Bilgi)
```
Elimizdeki Kod: SGM7A-???C?A
Analiz Sonucu:
- Motor: SGM7A (Sigma-7 Genel Amaçlı)
- Güç: ❓ Belirtilmemiş
- Voltaj: ❓ Belirtilmemiş
- Encoder: C (17bit Serial Incremental)
- Revizyon: ❓ Belirtilmemiş
- Bölge: A (Japan)
```

## 🔧 Teknik Detaylar

### Dosya Yapısı
```
ServoSelection/
├── index.html                   # Ana HTML dosyası
├── servo_selector.js            # JavaScript logic
├── sigma_x_series_nomenclature.json  # Sigma-X veri
├── sigma_7_series_nomenclature.json  # Sigma-7 veri
├── vercel.json                  # Vercel deployment config
└── README.md                    # Bu dosya
```

### Teknolojiler
- **HTML5**: Yapı
- **CSS3**: Stil ve animasyonlar
- **Vanilla JavaScript**: Tüm logic (bağımlılık yok)
- **JSON**: Nomenclature veri yapısı

### Tarayıcı Desteği
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

### Özellikler
- Responsive tasarım
- Offline çalışma (HTTP sunucusu ile)
- Hızlı ve hafif (~100KB toplam)
- SEO uyumlu

## 🆘 Sorun Giderme

### "Veri dosyası yüklenemedi" Hatası
**Neden**: Tarayıcı güvenlik politikası, `file://` protokolü ile JSON yüklemeye izin vermez.

**Çözüm**: HTTP sunucusu kullanın
```bash
python -m http.server 8080
```

### Seçenekler Görünmüyor
1. Tarayıcı konsolunu açın (F12)
2. Hata mesajlarını kontrol edin
3. JSON dosyalarının geçerli olduğundan emin olun

### Kod Kopyalanamıyor
- Modern tarayıcı kullandığınızdan emin olun
- HTTPS veya localhost üzerinde çalıştığınızı kontrol edin
- Tüm alanları doldurduğunuza dikkat edin

## 🎓 Gelişmiş Kullanım

### Kendi JSON Verilerinizi Eklemek
1. JSON dosyasını `sigma_x_series_nomenclature.json` formatında oluşturun
2. `servo_selector.js` içinde JSON yolunu ekleyin
3. Navbar'a yeni sekme ekleyin

### Özelleştirme
- CSS'de renk değişkenleri ile tema özelleştirme
- JavaScript'te yeni platform desteği ekleme
- HTML'de layout düzenlemeleri

## 📄 Lisans

MIT License - Bu araç Yaskawa servo motorları için nomenclature sistemini kullanır.

## 🔗 İlgili Kaynaklar

- [Sigma-X Series Nomenclature PDF](sigma%20X%20series%20nomenclature.pdf)
- [Sigma-7 Series Nomenclature PDF](sigma%207%20series%20nomenclature.pdf)
- [Yaskawa Official Website](https://www.yaskawa.com)

## 📞 Destek

Sorunlar veya öneriler için issue açabilirsiniz.

---

**Not**: Bu araç Yaskawa Electric Corporation ile resmi olarak bağlantılı değildir. Servo motor seçiminde kolaylık sağlamak amacıyla geliştirilmiştir.
