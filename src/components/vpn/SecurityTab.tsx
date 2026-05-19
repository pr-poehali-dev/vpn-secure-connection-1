import Icon from "@/components/ui/icon";

interface SecurityTabProps {
  dnsProtected: boolean;
  setDnsProtected: (v: boolean) => void;
  killSwitch: boolean;
  setKillSwitch: (v: boolean) => void;
  ipLeak: boolean;
  setIpLeak: (v: boolean) => void;
  protocol: string;
}

export default function SecurityTab({
  dnsProtected,
  setDnsProtected,
  killSwitch,
  setKillSwitch,
  ipLeak,
  setIpLeak,
  protocol,
}: SecurityTabProps) {
  return (
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
            { label: "Протокол", value: protocol },
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
  );
}
