import Icon from "@/components/ui/icon";

interface Server {
  id: number;
  country: string;
  city: string;
  flag: string;
  ping: number;
  load: number;
  protocol: string;
}

interface HomeTabProps {
  connected: boolean;
  connecting: boolean;
  sessionTime: number;
  selectedServer: Server;
  handleConnect: () => void;
  getPingColor: (ping: number) => string;
  formatTime: (s: number) => string;
}

export default function HomeTab({
  connected,
  connecting,
  sessionTime,
  selectedServer,
  handleConnect,
  getPingColor,
  formatTime,
}: HomeTabProps) {
  return (
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
  );
}
