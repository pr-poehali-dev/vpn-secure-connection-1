import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import HomeTab from "@/components/vpn/HomeTab";
import ServersTab from "@/components/vpn/ServersTab";
import SecurityTab from "@/components/vpn/SecurityTab";
import StorageTab from "@/components/vpn/StorageTab";

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

export default function Index() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedServer, setSelectedServer] = useState(servers[0]);
  const [sessionTime, setSessionTime] = useState(0);
  const [dnsProtected, setDnsProtected] = useState(true);
  const [ipLeak, setIpLeak] = useState(false);
  const [killSwitch, setKillSwitch] = useState(true);

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
          {activeTab === "home" && (
            <HomeTab
              connected={connected}
              connecting={connecting}
              sessionTime={sessionTime}
              selectedServer={selectedServer}
              handleConnect={handleConnect}
              getPingColor={getPingColor}
              formatTime={formatTime}
            />
          )}

          {activeTab === "servers" && (
            <ServersTab
              servers={servers}
              selectedServer={selectedServer}
              setSelectedServer={setSelectedServer}
              getPingColor={getPingColor}
              getLoadColor={getLoadColor}
            />
          )}

          {activeTab === "security" && (
            <SecurityTab
              dnsProtected={dnsProtected}
              setDnsProtected={setDnsProtected}
              killSwitch={killSwitch}
              setKillSwitch={setKillSwitch}
              ipLeak={ipLeak}
              setIpLeak={setIpLeak}
              protocol={selectedServer.protocol}
            />
          )}

          {activeTab === "storage" && <StorageTab />}
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
