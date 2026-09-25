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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-app-primary">Kunci aplikasi</p>
              <p className="text-xs text-app-muted">Gunakan PIN 4 digit untuk membuka aplikasi</p>
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
                checked={settings.app_lock_enabled}
                onChange={(e) => onUpdateSettings({ app_lock_enabled: e.target.checked })}
                className="w-5 h-5 rounded text-accent bg-elevated border-subtle focus:ring-accent cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-app-primary">Sinkronisasi cloud</p>
              <p className="text-xs text-app-muted">Dinonaktifkan secara bawaan untuk menjaga privasi</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-surface text-app-muted border border-subtle font-medium">
              Mati (hanya di perangkat ini)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-app-primary">Pelacakan penggunaan</p>
              <p className="text-xs text-app-muted">Tidak ada analitik atau pelacakan aktivitas</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-surface text-app-muted border border-subtle font-medium">
              OFF
            </span>
          </div>
        </div>
      </section>

      {/* CADANGAN DAN PEMULIHAN */}
      <section className="bg-surface/90 border border-subtle rounded-2xl p-5 md:p-6 shadow-glass space-y-5">
        <div className="flex items-center gap-2 border-b border-subtle pb-3">
          <FileText className="w-5 h-5 text-accent" />
          <h2 className="text-base font-semibold text-app-primary">Cadangkan dan pindahkan data</h2>
        </div>

        <p className="text-xs text-app-muted">
          Cadangan menyertakan pratinjau galeri dan salinan foto yang disimpan lewat “Simpan salinan”. Foto lain perlu dipilih ulang; PIN tidak disertakan.
        </p>

        {importStatus && (
          <div className="p-3 rounded-xl bg-accent/20 border border-accent/40 text-xs text-accent flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
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
