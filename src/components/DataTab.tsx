/**
 * components/DataTab.tsx — Manajemen data (F6 Backup/Restore).
 *
 * Jaminan (Lampiran A & D):
 *  - Ekspor semua event ke satu file .json berversi.
 *  - Impor memvalidasi skema, menampilkan ringkasan, baru minta konfirmasi.
 *  - Impor file rusak tidak mengubah data yang ada.
 */

import React, { useRef, useState } from 'react';
import { Download, Upload, FileWarning } from 'lucide-react';
import type { Workspace } from '../data/schema';
import { buildBackupJson, parseBackupFile, downloadFile, type ImportSummary } from '../data/backup';

export const DataTab: React.FC<{
  workspace: Workspace;
  onReplaceWorkspace: (ws: Workspace) => void;
}> = ({ workspace, onReplaceWorkspace }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<ImportSummary | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = () => {
    const json = buildBackupJson(workspace);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(`eo-dash-backup-${stamp}.json`, json);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const res = parseBackupFile(text);
      if (!res.ok) {
        setImportError(res.error ?? 'File tidak bisa dibaca');
        return;
      }
      setPendingImport(res);
    };
    reader.readAsText(file);
    // reset agar bisa pilih file yang sama lagi
    e.target.value = '';
  };

  const confirmImport = () => {
    if (pendingImport?.workspace) {
      onReplaceWorkspace(pendingImport.workspace);
    }
    setPendingImport(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
        <h2 className="text-xl font-bold mb-4">Cadangkan Data</h2>
        <p className="text-sm text-slate-400 mb-6">
          Ekspor semua data event ke satu file JSON. Simpan di tempat aman — ini satu-satunya cara memindahkan data ke HP atau domain lain.
        </p>
        <button
          onClick={handleExport}
          className="w-full bg-emerald-500 text-slate-950 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors"
        >
          <Download size={20} /> Ekspor Backup JSON
        </button>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
        <h2 className="text-xl font-bold mb-4">Pulihkan Data</h2>
        <p className="text-sm text-slate-400 mb-6">
          Impor file backup JSON. Data yang ada saat ini akan ditimpa — pastikan sudah membuat cadangan.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFile}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full bg-slate-800 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors border border-slate-700"
        >
          <Upload size={20} /> Pilih File JSON
        </button>

        {importError && (
          <div className="mt-4 bg-rose-950/40 border border-rose-900/60 p-4 rounded-2xl flex items-start gap-3">
            <FileWarning className="text-rose-400 shrink-0" size={20} />
            <div>
              <div className="font-semibold text-rose-300">Gagal mengimpor</div>
              <div className="text-sm text-rose-200/80 mt-1">{importError}</div>
              <div className="text-xs text-slate-500 mt-2">Data Anda tidak berubah.</div>
            </div>
          </div>
        )}

        {pendingImport && pendingImport.ok && (
          <div className="mt-4 bg-emerald-950/40 border border-emerald-900/60 p-4 rounded-2xl">
            <div className="font-semibold text-emerald-300 mb-2">Konfirmasi impor</div>
            <div className="text-sm text-slate-300 mb-4">
              {pendingImport.summary?.eventCount} event akan dimuat.
              Event pertama: <strong>{pendingImport.summary?.firstEventName}</strong>.
              Data saat ini akan diganti.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingImport(null)}
                className="flex-1 bg-slate-800 p-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmImport}
                className="flex-1 bg-rose-500 text-white p-3 rounded-xl font-bold hover:bg-rose-400 transition-colors"
              >
                Timpa Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
