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

interface ServersTabProps {
  servers: Server[];
  selectedServer: Server;
  setSelectedServer: (server: Server) => void;
  getPingColor: (ping: number) => string;
  getLoadColor: (load: number) => string;
}

export default function ServersTab({
  servers,
  selectedServer,
  setSelectedServer,
  getPingColor,
  getLoadColor,
}: ServersTabProps) {
  return (
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
  );
}
