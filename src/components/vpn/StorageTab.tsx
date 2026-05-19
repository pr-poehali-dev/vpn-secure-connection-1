import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const STORAGE_URL = "https://functions.poehali.dev/31d3469d-c88d-41fd-a864-296a090d94c0";

interface StorageFile {
  key: string;
  name: string;
  size: number;
  last_modified: string;
  url: string;
}

export default function StorageTab() {
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);
  const [storageLoading, setStorageLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = async () => {
    setStorageLoading(true);
    try {
      const res = await fetch(STORAGE_URL);
      const data = await res.json();
      setStorageFiles(data.files || []);
    } finally {
      setStorageLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(`Загрузка ${file.name}...`);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      await fetch(STORAGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, content_type: file.type, data: base64 }),
      });
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadFiles();
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (key: string) => {
    await fetch(STORAGE_URL, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    setStorageFiles((prev) => prev.filter((f) => f.key !== key));
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
  };

  return (
    <div className="pt-2 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="HardDrive" size={16} className="text-neon-cyan" />
          <h2 className="font-oswald text-lg font-bold tracking-wider text-white">ОБЛАЧНОЕ ХРАНИЛИЩЕ</h2>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={!!uploadProgress}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-oswald font-bold tracking-wider transition-all hover:scale-105 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #00f5ff, #00ff88)", color: "#0d1421" }}
        >
          <Icon name="Upload" size={12} />
          ЗАГРУЗИТЬ
        </button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
      </div>

      {uploadProgress && (
        <div className="glass rounded-xl p-3 flex items-center gap-3 animate-fade-in-up">
          <Icon name="Loader2" size={16} className="text-neon-cyan animate-spin" />
          <span className="text-sm text-vpn-muted">{uploadProgress}</span>
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden animate-fade-in-up">
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(30,45,71,0.8)" }}>
          <span className="text-xs font-oswald tracking-widest text-vpn-muted">ФАЙЛЫ</span>
          <button onClick={loadFiles} disabled={storageLoading} className="text-vpn-muted hover:text-white transition-colors">
            <Icon name={storageLoading ? "Loader2" : "RefreshCw"} size={14} className={storageLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {storageLoading ? (
          <div className="p-8 flex justify-center">
            <Icon name="Loader2" size={24} className="text-neon-cyan animate-spin" />
          </div>
        ) : storageFiles.length === 0 ? (
          <div className="p-8 flex flex-col items-center gap-3 text-center">
            <Icon name="CloudOff" size={32} className="text-vpn-muted opacity-50" />
            <p className="text-sm text-vpn-muted">Нет загруженных файлов</p>
            <p className="text-xs text-vpn-muted opacity-60">Нажми «Загрузить», чтобы добавить файл</p>
          </div>
        ) : (
          storageFiles.map((file, i) => (
            <div
              key={file.key}
              className={`p-4 flex items-center gap-3 ${i < storageFiles.length - 1 ? "border-b border-vpn-border" : ""}`}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.15)" }}>
                <Icon name="File" size={16} className="text-neon-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{file.name}</p>
                <p className="text-xs text-vpn-muted">{formatBytes(file.size)}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={file.url} target="_blank" rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Icon name="Download" size={14} className="text-vpn-muted hover:text-white" />
                </a>
                <button onClick={() => handleDelete(file.key)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-colors">
                  <Icon name="Trash2" size={14} className="text-vpn-muted hover:text-red-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="glass rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Lock" size={12} className="text-neon-green" />
          <span className="text-xs text-vpn-muted font-oswald tracking-widest">ШИФРОВАНИЕ</span>
        </div>
        <p className="text-xs text-vpn-muted">Файлы хранятся в зашифрованном S3-хранилище с AES-256</p>
      </div>
    </div>
  );
}
