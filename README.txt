Anisa Store Telegram Bot – Rekap Kas Harian
===========================================

Bot ini dipakai kasir untuk menghitung rekap kas harian (cash + QRIS + total Olsera)
dan langsung menghitung selisihnya.

Format pemakaian di Telegram
----------------------------

Di chat dengan bot (atau di grup yang berisi bot), kirim pesan:

/rekap
tanggal: 2025-11-06
cash_awal: 200000
cash_akhir: 750000
pengeluaran: 50000
qris: 1300000
olsera: 1895000
catatan: kembalian banyak pakai permen

Catatan:
- Semua angka ditulis TANPA titik, misalnya 1300000 (bukan 1.300.000).
- `catatan` boleh dikosongkan.

Rumus yang dipakai:
- penjualan_cash = cash_akhir - cash_awal + pengeluaran
- total_manual   = penjualan_cash + qris
- selisih        = total_manual - olsera

Batas selisih wajar = ± Rp 10.000.

Deploy ke Railway (ringkas)
---------------------------

1. Buat bot di Telegram via @BotFather → catat token bot.
2. Login ke https://railway.app dan buat project Node.js kosong.
3. Upload file:
   - index.js
   - package.json
4. Di Railway, buka tab "Variables" / "Environment" dan tambah:
   - KEY: BOT_TOKEN
   - VALUE: (token bot Telegram kamu)
5. Pastikan command start-nya:
   node index.js
6. Deploy / Start service.
7. Di Telegram, buka bot kamu dan kirim /start lalu /rekap dengan format di atas.

Jika ingin jalan lokal:
-----------------------

1. Install Node.js.
2. Jalankan:

   npm install
   BOT_TOKEN=tokenmu node index.js

Jangan pernah membagikan BOT_TOKEN ke orang lain.
