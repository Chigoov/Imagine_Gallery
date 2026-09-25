import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Folder, UploadCloud, Shield, Loader2, AlertCircle, Link2 } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { parsePublicDrivePhotoLink, PublicDrivePhotoLink } from '../../../domain/photo/driveLinks';

type DriveCandidate = { value: string; link?: PublicDrivePhotoLink; error?: string };

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFiles: (files: FileList | File[]) => void;
  onAddDriveLinks: (links: string) => Promise<void>;
}

export const AddSourceModal: React.FC<AddSourceModalProps> = ({
  isOpen,
  onClose,
  onAddFiles,
  onAddDriveLinks,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCount, setScannedCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [driveLinks, setDriveLinks] = useState('');
  const [driveConsent, setDriveConsent] = useState(false);
  const [isAddingDriveLinks, setIsAddingDriveLinks] = useState(false);
  const [drivePreviewStatus, setDrivePreviewStatus] = useState<Record<string, 'ready' | 'failed'>>({});
  const driveCandidates = useMemo<DriveCandidate[]>(() => {
    const seen = new Set<string>();
    const candidates: DriveCandidate[] = [];
    for (const value of driveLinks.split(/[\r\n,]+/).map((line) => line.trim()).filter(Boolean)) {
      try {
        const link = parsePublicDrivePhotoLink(value);
        if (seen.has(link.fileId)) continue;
        seen.add(link.fileId);
        candidates.push({ value, link });
      } catch (error) {
        candidates.push({ value, error: error instanceof Error ? error.message : 'Tautan tidak valid.' });
      }
    }
    return candidates;
  }, [driveLinks]);
  const allDrivePreviewsReady = driveCandidates.length > 0 && driveCandidates.every((candidate) =>
    !!candidate.link && drivePreviewStatus[candidate.link.imageUrl] === 'ready'
  );

  useEffect(() => setDrivePreviewStatus({}), [driveLinks]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
      onClose();
    }
  };

  const handleDriveImport = async () => {
    if (!driveConsent || !allDrivePreviewsReady) return;
    setStatusMessage(null);
    setIsAddingDriveLinks(true);
    try {
      await onAddDriveLinks(driveLinks);
      setDriveLinks('');
      setDriveConsent(false);
      onClose();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Tautan Drive tidak dapat ditambahkan.');
    } finally {
      setIsAddingDriveLinks(false);
    }
  };

  const isImageFile = (file: File) => {
    return file.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|gif|bmp)$/i.test(file.name);
  };

  const scanDirectoryRecursive = async (
    dirHandle: any,
    depth: number = 0
  ): Promise<File[]> => {
    const files: File[] = [];
    if (depth > 3) return files;

    for await (const entry of dirHandle.values()) {
      try {
        if (entry.kind === 'file') {
          const file = await entry.getFile();
          if (isImageFile(file)) {
            files.push(file);
            if (files.length % 20 === 0) {
              setScannedCount(files.length);
            }
          }
        } else if (entry.kind === 'directory') {
          const subFiles = await scanDirectoryRecursive(entry, depth + 1);
          files.push(...subFiles);
          setScannedCount(files.length);
        }
      } catch (err) {
        // Continue on permission or unreadable entry
      }
    }
    return files;
  };

  const handleDirectoryPick = async () => {
    setStatusMessage(null);
    try {
      if ('showDirectoryPicker' in window) {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker();
        setIsScanning(true);
        setScannedCount(0);

        const files = await scanDirectoryRecursive(dirHandle);
        setIsScanning(false);

        if (files.length > 0) {
          onAddFiles(files);
          onClose();
        } else {
          setStatusMessage('Tidak ada berkas foto yang didukung di folder ini.');
        }
      } else {
        fileInputRef.current?.click();
      }
    } catch (err) {
      setIsScanning(false);
      // User cancelled directory picker
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah foto" maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="p-3 rounded-xl bg-elevated/60 border border-subtle flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-app-primary">Berkas foto di perangkat</p>
            <p className="text-app-muted">
              Foto dibaca di browser. Berkas asli tidak diubah, dipindahkan, atau dihapus.
            </p>
          </div>
        </div>

        {/* Scanning indicator */}
        {isScanning ? (
          <div className="p-8 rounded-xl bg-surface border border-accent/30 text-center space-y-3 animate-fade-in">
            <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
            <div>
            <p className="text-sm font-semibold text-app-primary">Memindai folder dan subfolder...</p>
              <p className="text-xs text-accent mt-1 font-mono">{scannedCount} foto ditemukan</p>
            </div>
            <p className="text-[11px] text-app-muted">Tunggu sebentar, foto sedang dicatat secara lokal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleDirectoryPick}
              className="p-4 rounded-xl bg-surface hover:bg-elevated border border-subtle hover:border-accent/40 flex flex-col items-center justify-center text-center group transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Folder className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-app-primary">Pilih folder</p>
              <p className="text-[11px] text-app-muted mt-1">Pindai folder dan subfolder</p>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-xl bg-surface hover:bg-elevated border border-subtle hover:border-accent/40 flex flex-col items-center justify-center text-center group transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-app-primary">Pilih berkas foto</p>
              <p className="text-[11px] text-app-muted mt-1">Bisa memilih beberapa berkas</p>
            </button>
          </div>
        )}

        {!isScanning && <section className="space-y-2.5 border-t border-subtle pt-4">
          <div className="flex items-center gap-2"><Link2 className="w-4 h-4 text-accent" /><h3 className="text-sm font-semibold">Tautan foto Google Drive publik</h3></div>
          <p className="text-xs text-app-muted">Tempel tautan berkas foto, satu per baris. Atur akses umum di Drive menjadi “Siapa saja yang memiliki link” dan peran “Pelihat”. Folder dan tautan privat belum didukung.</p>
          <textarea value={driveLinks} onChange={(event) => setDriveLinks(event.target.value)} rows={2}
            aria-label="Tautan foto publik Google Drive" placeholder="https://drive.google.com/file/d/.../view"
            className="w-full rounded-xl bg-elevated border border-subtle p-3 text-xs text-app-primary placeholder:text-app-muted focus:outline-none focus:border-accent" />
          <p className="text-[11px] text-amber-200/90">Foto ditampilkan langsung dari Google, bukan disalin ke perangkat. Google menerima permintaan gambar tersebut. Siapa pun yang memiliki tautan dapat mengakses berkasnya. Tautan tersimpan di perangkat dan dapat ikut masuk ke cadangan metadata JSON.</p>
          <label className="flex items-start gap-2 text-xs text-app-muted">
            <input type="checkbox" checked={driveConsent} onChange={(event) => setDriveConsent(event.target.checked)} className="mt-0.5 accent-amber-500" />
            <span>Saya paham tautan ini bersifat publik dan gambar dimuat dari Google.</span>
          </label>
          {driveCandidates.length > 0 && <div className="max-h-36 overflow-y-auto space-y-2">
            {driveCandidates.map((candidate) => candidate.link ? (
              <div key={candidate.link.imageUrl} className="flex items-center gap-3 rounded-lg border border-subtle bg-surface p-2">
                <img src={driveConsent ? candidate.link.imageUrl : undefined} alt="Pratinjau foto Drive" referrerPolicy="no-referrer" onLoad={() => setDrivePreviewStatus((prev) => ({ ...prev, [candidate.link!.imageUrl]: 'ready' }))} onError={() => setDrivePreviewStatus((prev) => ({ ...prev, [candidate.link!.imageUrl]: 'failed' }))} className="w-12 h-12 rounded-md object-cover bg-elevated" />
                <span className={`text-xs ${drivePreviewStatus[candidate.link.imageUrl] === 'failed' ? 'text-red-300' : drivePreviewStatus[candidate.link.imageUrl] === 'ready' ? 'text-emerald-300' : 'text-app-muted'}`}>
                  {drivePreviewStatus[candidate.link.imageUrl] === 'failed' ? 'Foto gagal dimuat. Periksa izin publik dan format berkas.' : drivePreviewStatus[candidate.link.imageUrl] === 'ready' ? 'Pratinjau berhasil dimuat.' : driveConsent ? 'Memeriksa akses foto…' : 'Setujui pemuatan gambar untuk memeriksa tautan.'}
                </span>
              </div>
            ) : <div key={candidate.value} className="text-xs text-red-300">{candidate.error}</div>)}
          </div>}
          <Button variant="secondary" onClick={handleDriveImport} disabled={!driveConsent || !allDrivePreviewsReady || isAddingDriveLinks}>
            {isAddingDriveLinks ? 'Menambahkan tautan…' : allDrivePreviewsReady ? 'Tambahkan tautan Drive' : 'Periksa tautan terlebih dahulu'}
          </Button>
        </section>}

        {statusMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Hidden Multi-file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.bmp"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isScanning}>
            Batal
          </Button>
        </div>
      </div>
    </Modal>
  );
};
