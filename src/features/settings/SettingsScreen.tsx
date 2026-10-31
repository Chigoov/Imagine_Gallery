import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  Lock,
  Download,
  Upload,
  RefreshCw,
  Clock,
  Eye,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Heart,
  Star,
  Bookmark,
  FolderHeart,
  Pin,
  Info,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { AppSettings } from '../../types/settings';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonContent: string) => void | Promise<void>;
  onResetApp: () => void;
  onOpenPinSetup: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onExportBackup,
  onImportBackup,
  onResetApp,
  onOpenPinSetup,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const content = ev.target?.result as string;
        await onImportBackup(content);
        setImportStatus('Cadangan berhasil dipulihkan.');
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err) {
        setImportStatus('Format berkas cadangan tidak valid.');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in pb-24 md:pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-app-primary">
          Pengaturan dan privasi
        </h1>
        <p className="text-sm text-app-muted mt-1">
          Pengaturan tersimpan di perangkat • Tanpa pelacakan • Mengutamakan privasi
        </p>
      </div>

      {/* PENGATURAN PEMUTAR */}
      <section className="bg-surface/90 border border-subtle rounded-2xl p-5 md:p-6 shadow-glass space-y-5">
        <div className="flex items-center gap-2 border-b border-subtle pb-3">
          <Sliders className="w-5 h-5 text-accent" />
          <h2 className="text-base font-semibold text-app-primary">Pengaturan awal pemutar</h2>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-app-primary">Jumlah foto awal</p>
              <p className="text-xs text-app-muted">Jumlah foto saat pemutar dibuka</p>
            </div>
            <SegmentedControl
              options={[
                { value: 1, label: '1' },
                { value: 2, label: '2' },
                { value: 3, label: '3' },
                { value: 4, label: '4' },
                { value: 5, label: '5' },
              ]}
              value={settings.default_photo_count}
              onChange={(val) => onUpdateSettings({ default_photo_count: val as number })}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-app-primary">Jeda pergantian foto</p>
              <p className="text-xs text-app-muted">Waktu sebelum foto berganti otomatis</p>
            </div>
            <SegmentedControl
              options={[
                { value: 5, label: '5 dtk' },
                { value: 7, label: '7 dtk' },
                { value: 10, label: '10 dtk' },
                { value: 15, label: '15 dtk' },
              ]}
              value={settings.default_interval}
              onChange={(val) => onUpdateSettings({ default_interval: val as number })}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-app-primary">Penyesuaian foto awal</p>
              <p className="text-xs text-app-muted">Penuhi bingkai atau tampilkan seluruh foto</p>
            </div>
            <SegmentedControl
              options={[
                { value: 'cover', label: 'Penuhi bingkai' },
                { value: 'contain', label: 'Muat seluruh foto' },
              ]}
              value={settings.default_fit_mode}
              onChange={(val) => onUpdateSettings({ default_fit_mode: val as 'cover' | 'contain' })}
            />
          </div>
        </div>
      </section>

      {/* SESI DAN WAKTU */}
      <section className="bg-surface/90 border border-subtle rounded-2xl p-5 md:p-6 shadow-glass space-y-5">
        <div className="flex items-center gap-2 border-b border-subtle pb-3">
          <Clock className="w-5 h-5 text-accent" />
          <h2 className="text-base font-semibold text-app-primary">Aturan sesi dan waktu</h2>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-app-primary">Waktu toleransi saat aplikasi di latar</p>
              <p className="text-xs text-app-muted">
                Lama sesi tetap dihitung sebelum berakhir saat aplikasi diminimalkan
              </p>
            </div>
            <SegmentedControl
              options={[
                { value: 0, label: 'Langsung' },
                { value: 120, label: '2 mnt (Awal)' },
                { value: 300, label: '5 mnt' },
              ]}
              value={settings.background_timeout_seconds}
              onChange={(val) => onUpdateSettings({ background_timeout_seconds: val as number })}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-app-primary">Riwayat tampilan</p>
              <p className="text-xs text-app-muted">Jumlah tampilan sebelumnya yang disimpan</p>
            </div>
            <span className="text-xs font-mono font-semibold text-accent px-3 py-1 bg-elevated rounded-lg border border-subtle">
              {settings.history_depth} tampilan
            </span>
          </div>
        </div>
      </section>

      {/* PRIVASI DAN KEAMANAN */}
      <section className="bg-surface/90 border border-subtle rounded-2xl p-5 md:p-6 shadow-glass space-y-5">
        <div className="flex items-center gap-2 border-b border-subtle pb-3">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-app-primary">Privasi dan keamanan ruang pribadi</h2>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-app-primary">Kunci aplikasi (PIN)</p>
              <p className="text-xs text-app-secondary mt-0.5">
                Kunci visual 4 digit untuk membuka tampilan aplikasi di layar
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenPinSetup}
              >
                Ubah PIN
              </Button>
              <input
                type="checkbox"
                aria-label="Aktifkan kunci PIN"
                checked={settings.app_lock_enabled}
                onChange={(e) => onUpdateSettings({ app_lock_enabled: e.target.checked })}
                className="w-5 h-5 rounded text-accent bg-elevated border-subtle focus:ring-accent cursor-pointer"
              />
            </div>
          </div>

          {/* Batas Proteksi PIN */}
          <div className="p-3.5 rounded-xl bg-elevated/60 border border-subtle text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-app-primary">
              <Info className="w-4 h-4 text-accent" />
              <span>Batas proteksi kunci PIN</span>
            </div>
            <p className="text-app-secondary leading-relaxed">
              Kunci PIN berfungsi sebagai pembatas visual pada antarmuka aplikasi agar layar galeri tidak langsung terlihat saat aplikasi dibuka. Proteksi ini <strong>bukan enkripsi berkas</strong> pada penyimpanan perangkat. Berkas foto di perangkat Anda tidak dienkripsi secara disk/filesystem oleh aplikasi ini.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-medium text-app-primary">Sinkronisasi cloud</p>
              <p className="text-xs text-app-secondary">Dinonaktifkan secara bawaan untuk menjaga privasi lokal</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-surface text-app-secondary border border-subtle font-medium">
              Mati (hanya lokal)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-app-primary">Pelacakan penggunaan</p>
              <p className="text-xs text-app-secondary">Tidak ada analitik atau pengiriman aktivitas ke luar</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-surface text-app-secondary border border-subtle font-medium">
              Nonaktif
            </span>
          </div>
        </div>
      </section>

      {/* ISTILAH PENGELOMPOKAN FOTO */}
      <section className="bg-surface/90 border border-subtle rounded-2xl p-5 md:p-6 shadow-glass space-y-4">
        <div className="flex items-center gap-2 border-b border-subtle pb-3">
          <Info className="w-5 h-5 text-accent" />
          <h2 className="text-base font-semibold text-app-primary">Istilah pengelompokan foto</h2>
        </div>

        <p className="text-xs text-app-secondary leading-relaxed">
          Berikut adalah penjelasan fungsi setiap istilah pengelompokan yang ada di aplikasi:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-elevated/50 border border-subtle">
            <span className="text-xs font-semibold text-heart flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-current" />
              Disukai
            </span>
            <p className="text-xs text-app-secondary mt-1 leading-relaxed">
              Tanda suka cepat untuk menyaring foto di galeri dan memutar sesi khusus foto yang disukai.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-elevated/50 border border-subtle">
            <span className="text-xs font-semibold text-fav flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-current" />
              Favorit
            </span>
            <p className="text-xs text-app-secondary mt-1 leading-relaxed">
              Tanda prioritas utama untuk akses cepat beranda dan pemutaran sesi khusus kumpulan foto favorit.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-elevated/50 border border-subtle">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              Tersimpan (Salinan tersimpan)
            </span>
            <p className="text-xs text-app-secondary mt-1 leading-relaxed">
              Salinan fisik berkas foto yang disimpan ke basis data aplikasi (IndexedDB) agar tidak perlu dipilih ulang setelah aplikasi dibuka kembali.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-elevated/50 border border-subtle">
            <span className="text-xs font-semibold text-accent flex items-center gap-1.5">
              <FolderHeart className="w-3.5 h-3.5" />
              Koleksi
            </span>
            <p className="text-xs text-app-secondary mt-1 leading-relaxed">
              Album bertema yang Anda buat untuk mengelompokkan sejumlah foto agar dapat diputar bersama.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-elevated/50 border border-subtle sm:col-span-2">
            <span className="text-xs font-semibold text-pin flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5 fill-current" />
              Sematkan (PIN)
            </span>
            <p className="text-xs text-app-secondary mt-1 leading-relaxed">
              Mengunci posisi foto pada slot layar pemutar. Foto yang disematkan tidak akan berganti saat foto lain berganti otomatis, manual, maupun diacak ulang.
            </p>
          </div>
        </div>
      </section>

      {/* CADANGAN DAN PEMULIHAN */}
      <section className="bg-surface/90 border border-subtle rounded-2xl p-5 md:p-6 shadow-glass space-y-5">
        <div className="flex items-center gap-2 border-b border-subtle pb-3">
          <FileText className="w-5 h-5 text-accent" />
          <h2 className="text-base font-semibold text-app-primary">Cadangkan dan pindahkan data</h2>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-app-secondary leading-relaxed">
            Berkas cadangan (.json) mencakup metadata galeri, album koleksi, catatan kalender dan riwayat sesi, komposisi tersimpan, thumbnail pratinjau, serta berkas foto penuh (khusus foto dengan status <strong>Salinan tersimpan</strong>). Foto lokal biasa yang belum disimpan salinannya memerlukan pemilihan ulang berkas saat cadangan dipulihkan.
          </p>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-accent">
              <AlertTriangle className="w-4 h-4 text-accent shrink-0" />
              <span>Keamanan berkas cadangan</span>
            </div>
            <p className="text-app-secondary leading-relaxed">
              Berkas cadangan diekspor dalam format teks JSON <strong>tanpa enkripsi</strong>. Karena dapat memuat salinan foto pribadi Anda, simpan berkas JSON ini di lokasi yang aman dan jangan disebarkan secara sembarangan.
            </p>
          </div>
        </div>

        {importStatus && (
          <div className="p-3 rounded-xl bg-accent/20 border border-accent/40 text-xs text-accent flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-1">
          <Button
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            onClick={onExportBackup}
          >
            Ekspor cadangan JSON
          </Button>

          <label className="cursor-pointer inline-flex items-center justify-center font-medium transition-all duration-140 rounded-xl bg-surface hover:bg-elevated text-app-primary border border-subtle hover:border-strong text-sm px-4 py-2.5 gap-2 min-h-[44px]">
            <Upload className="w-4 h-4 text-accent" />
            <span>Pulihkan cadangan JSON</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileImport}
            />
          </label>
        </div>
      </section>

      {/* RESET APLIKASI */}
      <section className="p-5 md:p-6 border border-red-500/20 rounded-2xl bg-red-500/5 space-y-3">
        <h3 className="text-sm font-semibold text-red-400">Hapus data lokal aplikasi</h3>
        <p className="text-xs text-app-muted">
          Menghapus metadata dan salinan foto yang disimpan aplikasi. Berkas foto asli di perangkat tidak diubah atau dihapus.
        </p>
        <Button
          variant="danger"
          size="sm"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={onResetApp}
        >
          Hapus data aplikasi
        </Button>
      </section>
    </div>
  );
};
