const { Telegraf } = require('telegraf');
require('dotenv').config();

// Ambil token bot dari environment variable
const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  console.error('Error: BOT_TOKEN tidak ditemukan di environment. Set dulu di Railway / .env');
  process.exit(1);
}

const bot = new Telegraf(botToken);

// Helper: format rupiah
function rupiah(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

// Parse blok teks key: value jadi object
function parseRekap(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const data = {};
  for (const line of lines) {
    const [key, ...rest] = line.split(':');
    if (!key || !rest.length) continue;
    const k = key.trim().toLowerCase();
    const v = rest.join(':').trim();
    data[k] = v;
  }
    return data;
}

bot.start((ctx) => {
  ctx.reply('Halo! Saya bot rekap kas Anisa Store.\n\n' +
            'Kirim data dengan format:\n' +
            '/rekap\n' +
            'tanggal: 2025-11-06\n' +
            'cash_awal: 200000\n' +
            'cash_akhir: 750000\n' +
            'pengeluaran: 50000\n' +
            'qris: 1300000\n' +
            'olsera: 1895000\n' +
            'catatan: kembalian banyak pakai permen');
});

bot.command('rekap', async (ctx) => {
  const fullText = ctx.message.text || '';
  const withoutCommand = fullText.replace('/rekap', '').trim();

  if (!withoutCommand) {
    return ctx.reply(
      'Format:\n' +
      '/rekap\n' +
      'tanggal: 2025-11-06\n' +
      'cash_awal: 200000\n' +
      'cash_akhir: 750000\n' +
      'pengeluaran: 50000\n' +
      'qris: 1300000\n' +
      'olsera: 1895000\n' +
      'catatan: ...'
    );
  }

  const data = parseRekap(withoutCommand);

  // Ambil dan konversi angka
  const cashAwal    = parseInt(data['cash_awal']    || '0', 10);
  const cashAkhir   = parseInt(data['cash_akhir']   || '0', 10);
  const pengeluaran = parseInt(data['pengeluaran']  || '0', 10);
  const qris        = parseInt(data['qris']         || '0', 10);
  const olsera      = parseInt(data['olsera']       || '0', 10);
  const tanggal     = data['tanggal'] || '(tanpa tanggal)';
  const catatan     = data['catatan'] || '-';

  if (Number.isNaN(cashAwal) || Number.isNaN(cashAkhir) ||
      Number.isNaN(pengeluaran) || Number.isNaN(qris) || Number.isNaN(olsera)) {
    return ctx.reply('Ada angka yang tidak valid. Pastikan semua nominal ditulis tanpa titik, misalnya 1300000 (bukan 1.300.000).');
  }

  // Hitung
  const penjualanCash = cashAkhir - cashAwal + pengeluaran;
  const totalManual   = penjualanCash + qris;
  const selisih       = totalManual - olsera;

  // Tentukan status selisih
  const batas = 10000;
  let status;
  if (Math.abs(selisih) <= batas) {
    status = `✅ Normal (selisih dalam batas ±${rupiah(batas)})`;
  } else if (selisih > 0) {
    status = `💰 Uang LEBIH ${rupiah(selisih)} – cek kemungkinan salah input / kembalian.`;
  } else {
    status = `⚠️ Uang KURANG ${rupiah(Math.abs(selisih))} – wajib dicek.`;
  }

  const reply =
    `🧴 Rekap Anisa Store – ${tanggal}\n\n` +
    `Penjualan cash : ${rupiah(penjualanCash)}\n` +
    `QRIS           : ${rupiah(qris)}\n` +
    `Total manual   : ${rupiah(totalManual)}\n` +
    `Total Olsera   : ${rupiah(olsera)}\n\n` +
    `Selisih: ${selisih >= 0 ? '+' : '-'}${rupiah(Math.abs(selisih))}\n` +
    `${status}\n\n` +
    `Catatan kasir: ${catatan}`;

  await ctx.reply(reply);
});

bot.launch()
  .then(() => {
    console.log('Bot rekap kas Anisa Store berjalan...');
  })
  .catch((err) => {
    console.error('Gagal menjalankan bot:', err);
    process.exit(1);
  });

// Graceful shutdown (Railway / hosting lain)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
