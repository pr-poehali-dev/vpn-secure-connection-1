import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const STORAGE_URL = "https://functions.poehali.dev/31d3469d-c88d-41fd-a864-296a090d94c0";

const servers = [
  { id: 1, country: "Нидерланды", city: "Амстердам", flag: "🇳🇱", ping: 18, load: 32, protocol: "WireGuard" },
  { id: 2, country: "Германия", city: "Франкфурт", flag: "🇩🇪", ping: 24, load: 55, protocol: "WireGuard" },
  { id: 3, country: "США", city: "Нью-Йорк", flag: "🇺🇸", ping: 87, load: 41, protocol: "OpenVPN" },
  { id: 4, country: "Япония", city: "Токио", flag: "🇯🇵", ping: 142, load: 28, protocol: "WireGuard" },
  { id: 5, country: "Финляндия", city: "Хельсинки", flag: "🇫🇮", ping: 31, load: 19, protocol: "WireGuard" },
  { id: 6, country: "Великобритания", city: "Лондон", flag: "🇬🇧", ping: 45, load: 67, protocol: "OpenVPN" },
  { id: 7, country: "Сингапур", city: "Сингапур", flag: "🇸🇬", ping: 178, load: 44, protocol: "WireGuard" },
  { id: 8, country: "Канада", city: "Торонто", flag: "🇨🇦", ping: 102, load: 22, protocol: "OpenVPN" },
];

type Tab = "home" | "servers" | "security" | "storage";

interface StorageFile {
  key: string;
  name: string;
  size: number;
  last_modified: string;
  url: string;
}

export default function Index() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedServer, setSelectedServer] = useState(servers[0]);
  const [sessionTime, setSessionTime] = useState(0);
  const [dnsProtected, setDnsProtected] = useState(true);
  const [ipLeak, setIpLeak] = useState(false);
  const [killSwitch, setKillSwitch] = useState(true);

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
    if (activeTab === "storage") loadFiles();
  }, [activeTab]);

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

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (connected) {
      interval = setInterval(() => setSessionTime((t) => t + 1), 1000);
    } else {
      setSessionTime(0);
    }
    return () => clearInterval(interval);
  }, [connected]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const handleConnect = () => {
    if (connected) {
      setConnected(false);
      return;
    }
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 2200);
  };

  const getPingColor = (ping: number) => {
    if (ping < 50) return "text-neon-green";
    if (ping < 100) return "text-yellow-400";
    return "text-red-400";
  };

  const getLoadColor = (load: number) => {
    if (load < 40) return "#00ff88";
    if (load < 70) return "#fbbf24";
    return "#f87171";
  };

  return (
    <div className="min-h-screen bg-vpn-bg grid-bg font-golos text-vpn-text flex flex-col items-center">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #00f5ff 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(circle, #bf5fff 0%, transparent 70%)" }}
        />
        {connected && (
          <div
            className="absolute top-[30%] right-[10%] w-[300px] h-[300px] rounded-full opacity-[0.05] animate-neon-flicker"
            style={{ background: "radial-gradient(circle, #00ff88 0%, transparent 70%)" }}
          />
        )}
      </div>

      {/* App container */}
      <div className="relative z-10 w-full max-w-md min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 pt-8 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00f5ff, #00ff88)" }}>
              <Icon name="Shield" size={16} className="text-vpn-bg" />
            </div>
            <span className="font-oswald text-xl font-bold tracking-wider text-white">
              TUNNEL<span className="text-neon-cyan glow-text-cyan">X</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? "bg-neon-green animate-pulse" : "bg-vpn-muted"}`} />
            <span className="text-xs text-vpn-muted font-golos">{connected ? "ACTIVE" : "OFFLINE"}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 pb-28 overflow-y-auto">

          {/* HOME TAB */}
          {activeTab === "home" && (
            <div className="flex flex-col items-center gap-6 pt-4">
              {/* Connection button */}
              <div className="relative flex items-center justify-center mt-4">
                {connected && (
                  <>
                    <div className="absolute w-48 h-48 rounded-full border animate-pulse-ring"
                      style={{ borderColor: "rgba(0,255,136,0.3)" }} />
                    <div className="absolute w-48 h-48 rounded-full border animate-pulse-ring"
                      style={{ borderColor: "rgba(0,255,136,0.2)", animationDelay: "0.7s" }} />
                  </>
                )}
                {connecting && (
                  <div className="absolute w-48 h-48 rounded-full border-2 animate-spin"
                    style={{ borderColor: "rgba(0,245,255,0.3)", borderTopColor: "#00f5ff" }} />
                )}

                <button
                  onClick={handleConnect}
                  className="relative w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-500 cursor-pointer select-none hover:scale-105"
                  style={{
                    background: connected
                      ? "linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,255,136,0.05))"
                      : connecting
                      ? "linear-gradient(135deg, rgba(0,245,255,0.2), rgba(0,245,255,0.05))"
                      : "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                    border: connected
                      ? "2px solid rgba(0,255,136,0.6)"
                      : connecting
                      ? "2px solid rgba(0,245,255,0.6)"
                      : "2px solid rgba(255,255,255,0.1)",
                    boxShadow: connected
                      ? "0 0 40px rgba(0,255,136,0.2), 0 0 80px rgba(0,255,136,0.08)"
                      : "none",
                  }}
                >
                  <Icon
                    name={connecting ? "Loader2" : connected ? "ShieldCheck" : "Power"}
                    size={36}
                    className={`transition-all duration-300 ${
                      connected ? "text-neon-green" : connecting ? "text-neon-cyan animate-spin" : "text-vpn-muted"
                    }`}
                  />
                  <span className={`text-xs font-oswald tracking-widest mt-1 font-semibold ${
                    connected ? "text-neon-green" : connecting ? "text-neon-cyan" : "text-vpn-muted"
                  }`}>
                    {connecting ? "ПОДКЛ..." : connected ? "АКТИВЕН" : "СТАРТ"}
                  </span>
                </button>
              </div>

              {/* Status */}
              <div className="text-center">
                <p className={`text-3xl font-oswald font-bold tracking-wide ${
                  connected ? "text-neon-green glow-text-green" : "text-white"
                }`}>
                  {connecting ? "Подключение..." : connected ? "Защищён" : "Не защищён"}
                </p>
                {connected && (
                  <p className="text-vpn-muted text-sm mt-1 font-mono">{formatTime(sessionTime)}</p>
                )}
              </div>

              {/* Selected server card */}
              <div className="glass rounded-2xl p-4 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedServer.flag}</span>
                    <div>
                      <p className="font-semibold text-white">{selectedServer.city}</p>
                      <p className="text-xs text-vpn-muted">{selectedServer.country}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-sm font-mono font-bold ${getPingColor(selectedServer.ping)}`}>
                      {selectedServer.ping} мс
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                      style={{ background: "rgba(0,245,255,0.1)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.2)" }}>
                      {selectedServer.protocol}
                    </span>
                  </div>
                </div>
              </div>

              {/* IP Info */}
              <div className="glass rounded-2xl p-4 w-full">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="Globe" size={14} className="text-neon-cyan" />
                  <span className="text-xs font-oswald tracking-widest text-vpn-muted">ВАШИ ДАННЫЕ</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-vpn-muted">IP-адрес</span>
                    <span className={`text-sm font-mono ${connected ? "text-neon-green" : "text-white"}`}>
                      {connected ? "185.220.101.47" : "91.108.56.22"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-vpn-muted">Местоположение</span>
                    <span className="text-sm text-white">
                      {connected ? `${selectedServer.flag} ${selectedServer.city}` : "🇷🇺 Москва"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-vpn-muted">Протокол</span>
                    <span className="text-sm text-white">{selectedServer.protocol}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SERVERS TAB */}
          {activeTab === "servers" && (
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Server" size={16} className="text-neon-cyan" />
                <h2 className="font-oswald text-lg font-bold tracking-wider text-white">ВЫБОР СЕРВЕРА</h2>
              </div>

              <div className="glass rounded-xl flex items-center gap-3 px-4 py-3 mb-4">
                <Icon name="Search" size={14} className="text-vpn-muted" />
                <span className="text-vpn-muted text-sm">Поиск локации...</span>
              </div>

              <div className="space-y-2">
                {servers.map((server, i) => (
                  <button
                    key={server.id}
                    onClick={() => setSelectedServer(server)}
                    className="w-full rounded-xl p-4 flex items-center gap-3 transition-all duration-200 hover:scale-[1.01] text-left animate-fade-in-up"
                    style={{
                      animationDelay: `${i * 0.05}s`,
                      background: selectedServer.id === server.id
                        ? "rgba(0,245,255,0.05)"
                        : "rgba(13,20,33,0.7)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: selectedServer.id === server.id
                        ? "1px solid rgba(0,245,255,0.4)"
                        : "1px solid rgba(30,45,71,0.8)",
                    }}
                  >
                    <span className="text-2xl">{server.flag}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white text-sm">{server.city}</p>
                        {selectedServer.id === server.id && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-oswald"
                            style={{ background: "rgba(0,245,255,0.15)", color: "#00f5ff" }}>
                            ВЫБРАН
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(30,45,71,0.8)" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${server.load}%`, background: getLoadColor(server.load) }}
                          />
                        </div>
                        <span className="text-xs text-vpn-muted">{server.load}%</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-sm font-mono font-bold ${getPingColor(server.ping)}`}>
                        {server.ping}мс
                      </span>
                      <span className="text-xs text-vpn-muted">{server.protocol}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="pt-2 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="ShieldCheck" size={16} className="text-neon-green" />
                <h2 className="font-oswald text-lg font-bold tracking-wider text-white">ЗАЩИТА ПРИВАТНОСТИ</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-4 flex flex-col gap-2 animate-fade-in-up" style={{ animationDelay: "0s" }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.2)" }}>
                    <Icon name="ShieldCheck" size={20} className="text-neon-green" />
                  </div>
                  <p className="text-xs text-vpn-muted">DNS защита</p>
                  <p className="text-sm font-oswald font-bold text-neon-green">АКТИВНА</p>
                </div>
                <div className="glass rounded-xl p-4 flex flex-col gap-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.2)" }}>
                    <Icon name="Eye" size={20} className="text-neon-green" />
                  </div>
                  <p className="text-xs text-vpn-muted">Утечка IP</p>
                  <p className="text-sm font-oswald font-bold text-neon-green">НЕТ</p>
                </div>
              </div>

              <div className="glass rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                {[
                  { label: "DNS-шифрование", desc: "Блокировка утечек DNS", icon: "Wifi", state: dnsProtected, setter: setDnsProtected },
                  { label: "Kill Switch", desc: "Отключение при разрыве VPN", icon: "Zap", state: killSwitch, setter: setKillSwitch },
                  { label: "Мониторинг утечек", desc: "Проверка IP в реальном времени", icon: "AlertTriangle", state: ipLeak, setter: setIpLeak },
                ].map((item, i) => (
                  <div key={item.label} className={`p-4 flex items-center justify-between ${i < 2 ? "border-b border-vpn-border" : ""}`}>
                    <div className="flex items-center gap-3">
                      <Icon name={item.icon} size={18} className="text-neon-cyan" />
                      <div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="text-xs text-vpn-muted">{item.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => item.setter(!item.state)}
                      className="w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0"
                      style={{ background: item.state ? "linear-gradient(90deg, #00f5ff, #00ff88)" : "rgba(255,255,255,0.1)" }}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${item.state ? "left-7" : "left-1"}`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="glass rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="Lock" size={14} className="text-neon-cyan" />
                  <span className="text-xs font-oswald tracking-widest text-vpn-muted">ШИФРОВАНИЕ</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Шифр", value: "AES-256-GCM" },
                    { label: "Ключ", value: "2048-bit RSA" },
                    { label: "Протокол", value: selectedServer.protocol },
                    { label: "Туннель", value: "Двойной VPN" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-xs text-vpn-muted">{item.label}</span>
                      <span className="text-sm font-mono text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="w-full rounded-xl py-3 font-oswald font-bold tracking-wider text-sm transition-all hover:scale-[1.02] animate-fade-in-up"
                style={{
                  background: "linear-gradient(135deg, rgba(0,245,255,0.15), rgba(0,255,136,0.15))",
                  border: "1px solid rgba(0,245,255,0.3)",
                  color: "#00f5ff",
                  animationDelay: "0.4s",
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon name="Activity" size={16} />
                  ПРОВЕРИТЬ УТЕЧКИ
                </div>
              </button>
            </div>
          )}

          {/* STORAGE TAB */}
          {activeTab === "storage" && (
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
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-6">
          <div
            className="rounded-2xl px-2 py-2 flex justify-around"
            style={{
              background: "rgba(13,20,33,0.9)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(30,45,71,0.9)",
            }}
          >
            {([
              { id: "home", icon: "Home", label: "Главная" },
              { id: "servers", icon: "Globe", label: "Серверы" },
              { id: "security", icon: "Shield", label: "Защита" },
              { id: "storage", icon: "HardDrive", label: "Файлы" },
            ] as { id: Tab; icon: string; label: string }[]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200"
                style={{
                  background: activeTab === tab.id ? "rgba(0,245,255,0.08)" : "transparent",
                  transform: activeTab === tab.id ? "scale(1.05)" : "scale(1)",
                  opacity: activeTab === tab.id ? 1 : 0.5,
                }}
              >
                <Icon
                  name={tab.icon}
                  size={20}
                  className={activeTab === tab.id ? "text-neon-cyan" : "text-vpn-muted"}
                />
                <span className={`text-[10px] font-oswald tracking-wider ${
                  activeTab === tab.id ? "text-neon-cyan" : "text-vpn-muted"
                }`}>
                  {tab.label.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}