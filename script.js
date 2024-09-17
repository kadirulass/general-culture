let toplamPuan = 0;
let kelimeUzunlugu = 4;
let kelimeSayisi = 0;
let gizliKelime = "";
let kelimeGorunumu = [];
let harfler = [];
let sure = 240; // 4 dakika
let sureInterval;
let sorulmusKelimeler = [];
let soruSayisi = 0;
const toplamSoruSayisi = 12;
let kalanHarfSayisi = 0; // Kalan harf sayısını takip edeceğiz
let oyunBaslangicZamani;
let oyunBitisZamani; // Oyun başlangıç zamanı
let kelimeler = {}; // JSON'dan gelecek veriyi tutmak için
let sureDurmaZamani; // Sürenin durduğu zamanı saklamak için
let sureDevamEttirildi;
const saniyeSayaci = 0; // Sayaç için saniye cinsinden değişken
let saniyeInterval; // Sürenin devam ettirilip ettirilmediğini kontrol etmek için

function oyunBaslat() {
    oyunBaslangicZamani = new Date(); // Oyun başlangıç zamanını kaydet
    sureyiBaslat(); // Zamanlayıcı başlatılır
    saniyeSayaci = 0; // Sayaç sıfırlanır
    saniyeInterval = setInterval(() => {
        saniyeSayaci++; // Her saniye sayaç 1 artar
    }, 1000);
}

// Veritabanından kelimeleri yükle
fetch('https://genelkulturoyunu.onrender.com/get-questions')
    .then(response => response.json())
    .then(data => {
        // Gelen veriyi kontrol etmek için log ekliyoruz
        console.log("Kelimeler verisi: ", data);

        // Kelimeleri kategoriye göre ayırıyoruz
        kelimeler = data.reduce((acc, item) => {
            const { kelime, soru, kategori } = item;
            if (!acc[kategori]) acc[kategori] = [];
            acc[kategori].push({ kelime, soru });
            return acc;
        }, {});

        kelimeSec(); // Oyun başladığında ilk kelime seçimi yapılır
        oyunBaslat();
    })
    .catch(error => {
        console.error('Kelimeler verisi yüklenirken hata oluştu:', error);
    });

function kelimeSec() {
    console.log("Kelime seçiliyor...");

    if (kelimeSayisi >= 2) {
        kelimeUzunlugu++;
        kelimeSayisi = 0;
    }

    // Eğer kelime uzunluğu maksimum sınırı geçtiyse oyun biter
    if (kelimeUzunlugu > 10) {
        alert(`Oyun Bitti! Toplam Puanınız: ${toplamPuan}`);
        oyunBitti();
        return;
    }

    // Seçilecek kelimeler kategorisini kontrol ediyoruz
    const kelimeListesi = kelimeler[kelimeUzunlugu];
    if (!kelimeListesi || kelimeListesi.length === 0) {
        alert(`Bu uzunlukta (${kelimeUzunlugu}) kelime bulunamadı!`);
        return;
    }

    let secilen;
    let denemeSayisi = 0;
    do {
        secilen = kelimeListesi[Math.floor(Math.random() * kelimeListesi.length)];
        denemeSayisi++;
    } while (sorulmusKelimeler.includes(secilen.kelime));

    // Seçilen kelimeyi sorulmuş kelimeler listesine ekliyoruz
    sorulmusKelimeler.push(secilen.kelime);
    gizliKelime = secilen.kelime;
    kelimeGorunumu = Array(gizliKelime.length).fill('_');
    harfler = [];
    kalanHarfSayisi = gizliKelime.length; // Başlangıçta tüm harfler gizli
    kelimeSayisi++;
    soruSayisi++;
    gosterKelime(secilen.soru);
    guncelleSoruSayisi();
}

function gosterKelime(soru) {
    const wordDisplay = document.getElementById("wordDisplay");

    if (soru) {
        wordDisplay.innerHTML = `<p>${soru}</p>`;
    }

    let hexContainer = document.querySelector(".hex-container");

    if (!hexContainer) {
        hexContainer = document.createElement("div");
        hexContainer.classList.add("hex-container");

        kelimeGorunumu.forEach((harf, i) => {
            const hex = document.createElement("div");
            hex.classList.add("hex", harf === '_' ? 'invisible' : '');
            hex.textContent = harf;
            hex.dataset.index = i; // Her kutucuğa indeks ekliyoruz
            hexContainer.appendChild(hex);
        });

        wordDisplay.appendChild(hexContainer);
    } else {
        kelimeGorunumu.forEach((harf, i) => {
            const hex = hexContainer.children[i];
            hex.textContent = harf;
            if (harf !== '_') {
                hex.classList.remove("invisible");
            }
        });
    }
}

function guncelleSoruSayisi() {
    document.getElementById("questionCounter").textContent = `Soru: ${soruSayisi} / ${toplamSoruSayisi}`;
}

function kelimeHarfAl() {
    let harf = '';
    let acilacakIndex = -1;
    do {
        acilacakIndex = Math.floor(Math.random() * gizliKelime.length);
        harf = gizliKelime[acilacakIndex];
    } while (kelimeGorunumu[acilacakIndex] !== '_');

    harfler.push(harf);
    kelimeGorunumu[acilacakIndex] = harf; // Rastgele kutucukta harf aç
    kalanHarfSayisi--; // Kalan harf sayısını bir azalt

    if (kalanHarfSayisi === 0) {
        gosterKelime();
        setTimeout(() => {
            kelimeSec(); // Diğer soruya geç
        }, 2000); // 2 saniye bekle
    } else {
        gosterKelime(""); // Harf eklendikten sonra kelimeyi tekrar göster
    }
}

function kelimeBulundu() {
    let yeniPuan = kalanHarfSayisi * 100;
    toplamPuan += yeniPuan;
    document.getElementById("scoreDisplay").textContent = `${toplamPuan}`;

    const dogruTahminSes = new Audio('sound/true.mp3');
    dogruTahminSes.play();

    kelimeGorunumu = gizliKelime.split(''); // Harfleri güncelle
    gosterKelime(""); // Harfleri güncelle

    if (soruSayisi >= toplamSoruSayisi) {
        setTimeout(() => {
            oyunBitti();
        }, 2000); // 2 saniye bekle
    } else {
        setTimeout(() => {
            kelimeSec();
        }, 2000); // 2 saniye bekle
    }
}

function oyunBitti() {
    clearInterval(sureInterval);

    const formatliSure = milisaniyeyiFormataCevir(saniyeSayaci * 1000); // Saniyeleri milisaniyeye çevirir ve formatlar

    const kullaniciAdi = prompt('Oyun bitti! Kullanıcı adınızı girin:');
    if (kullaniciAdi) {
        fetch('https://genelkulturoyunu.onrender.com/add-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ kullanici_adi: kullaniciAdi, puan: toplamPuan, sure: formatliSure })
        })
        .then(response => response.text())
        .then(data => {
            console.log(data);
            alert("Skor başarıyla kaydedildi!");
            window.location.href = 'index.html';
        })
        .catch(error => console.error('Hata:', error));
    } else {
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let oyunBitti = false;

    document.getElementById("buyLetterBtn").addEventListener("click", () => {
        const harfSatinAlSes = new Audio('sound/tingting.mp3');
        harfSatinAlSes.play();
        if (oyunBitti) return;
        kelimeHarfAl();
    });

    document.getElementById("guessWordBtn").addEventListener("click", () => {
        if (oyunBitti) return;
        sureyiDurdur(); // Süreyi durdur
        document.getElementById("guessSection").style.display = "block";
        document.getElementById("guessInput").focus();
    });

    document.getElementById("submitGuessBtn").addEventListener("click", () => {
        if (oyunBitti) return;
        const tahmin = document.getElementById("guessInput").value.toLowerCase().trim();
        document.getElementById("guessSection").style.display = "none";
        document.getElementById("guessInput").value="";

        if (tahmin === gizliKelime.toLowerCase()) {
            kelimeBulundu();
        } else {
            const hataliSes = new Audio('sound/hatalises.mp3');
            hataliSes.play();
        }

        // Tahmin gönderildikten sonra süreyi devam ettir
        sureyiDevamEttir();
    });
});

function sureyiBaslat() {
    if (sureInterval) {
        clearInterval(sureInterval); // Daha önce başlatılan interval varsa temizle
    }

    sureInterval = setInterval(() => {
        if (sure > 0) {
            sure--;
            sureyiGuncelle();
        } else {
            clearInterval(sureInterval);
            alert("Süre doldu! Oyun bitti.");
            oyunBitti();
        }
    }, 1000);
}

function sureyiGuncelle() {
    const minutes = String(Math.floor(sure / 60)).padStart(2, '0');
    const seconds = String(sure % 60).padStart(2, '0');
    document.getElementById("timeDisplay").textContent = `Kalan Süre: ${minutes}:${seconds}`;
}

// Süreyi Durdur
function sureyiDurdur() {
    if (sureInterval) {
        clearInterval(sureInterval); // Mevcut intervali temizle
        sureInterval = null; // Intervali sıfırla
        sureDurmaZamani = new Date(); // Süre durdurulma zamanını kaydet
    }
}

// Süreyi Kaldığı Yerden Devam Ettir
function sureyiDevamEttir() {
    if (sureDurmaZamani) {
        // Süreyi durdurduğumuz zaman ile şu anki zaman arasındaki farkı hesaplayın
        const durmaSuresi = (new Date() - sureDurmaZamani) / 1000; // Durma süresi saniye cinsinden hesaplanır
        sureDurmaZamani = null; // Durdurulan zamanı sıfırla
    }

    // Süreyi devam ettirmek için bir interval zaten yoksa başlat
    if (!sureInterval) {
        sureyiBaslat(); // Süreyi tekrar başlat
    }
}

function milisaniyeyiFormataCevir(ms) {
    // Toplam saniyeyi hesapla
    const saniye = Math.floor(ms / 1000);
    // Toplam dakikayı ve saniyeyi hesapla
    const dakika = Math.floor(saniye / 60);
    const saniyeKalan = saniye % 60;
    // Dakikayı ve saniyeyi iki basamaklı formatta döndür
    return `${dakika.toString().padStart(2, '0')}:${saniyeKalan.toString().padStart(2, '0')}`;
}

function formatKalanSure(sure) {
    const saat = Math.floor(sure / 3600);
    const dakika = Math.floor((sure % 3600) / 60);
    const saniye = sure % 60;

    return `${String(saat).padStart(2, '0')}:${String(dakika).padStart(2, '0')}:${String(saniye).padStart(2, '0')}`;
}
