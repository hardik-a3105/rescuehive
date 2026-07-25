import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from "react-leaflet";
import L from "leaflet";
import { Layers, Maximize2, Compass } from "lucide-react";
import { useRobotStore } from "@/stores/robotStore";
import { useDetectionStore } from "@/stores/detectionStore";
import { BASE_CENTER } from "@/utils/mockData";
import { Badge } from "@/components/ui/Badge";
import { formatCoords, formatRelativeTime } from "@/utils/format";

const robotIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 8px ${color}"></div>`,
    iconSize: [14, 14],
  });

const markerIcon = (color: string, symbol: string) =>
  L.divIcon({
    className: "",
    html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid white;"><span style="transform:rotate(45deg);font-size:11px;color:white;">${symbol}</span></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  });

export default function MapPage() {
  const robots = useRobotStore((s) => s.robots);
  const victims = useDetectionStore((s) => s.victims);
  const hazards = useDetectionStore((s) => s.hazards);
  const trailVisibility = useRobotStore((s) => s.trailVisibility);
  const [showHeat, setShowHeat] = useState(true);
  const [showTrails, setShowTrails] = useState(true);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <MapContainer center={BASE_CENTER} zoom={15} className="h-full w-full" zoomControl={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />

        {robots.map((r) => (
          <Marker
            key={r.id}
            position={[r.position.lat, r.position.lng]}
            icon={robotIcon(r.health === "offline" ? "#94A3B8" : r.health === "critical" ? "#EF4444" : "#2563EB")}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-semibold">{r.name} ({r.callsign})</p>
                <p>Battery: {Math.round(r.battery)}%</p>
                <p>{formatCoords(r.position.lat, r.position.lng)}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {showTrails &&
          robots
            .filter((r) => trailVisibility[r.id])
            .map((r) => (
              <Polyline
                key={`trail-${r.id}`}
                positions={r.trail.map((p) => [p.lat, p.lng])}
                pathOptions={{ color: "#06B6D4", weight: 2, opacity: 0.6, dashArray: "4 4" }}
              />
            ))}

        {victims
          .filter((v) => v.status !== "rejected")
          .map((v) => (
            <Marker key={v.id} position={[v.position.lat, v.position.lng]} icon={markerIcon("#EF4444", "V")}>
              <Popup>
                <div className="text-xs">
                  <p className="font-semibold">Victim detection</p>
                  <p>{v.confidence}% confidence · {v.status}</p>
                  <p>{formatRelativeTime(v.detectedAt)}</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {hazards
          .filter((h) => h.status !== "rejected")
          .map((h) => (
            <Marker key={h.id} position={[h.position.lat, h.position.lng]} icon={markerIcon("#F59E0B", "!")}>
              <Popup>
                <div className="text-xs">
                  <p className="font-semibold capitalize">{h.type.replace("_", " ")}</p>
                  <p className="capitalize">Severity: {h.severity}</p>
                  <p>{formatRelativeTime(h.detectedAt)}</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {showHeat &&
          victims.slice(0, 15).map((v) => (
            <CircleMarker
              key={`heat-${v.id}`}
              center={[v.position.lat, v.position.lng]}
              radius={26}
              pathOptions={{ color: "transparent", fillColor: "#EF4444", fillOpacity: 0.06 }}
            />
          ))}
      </MapContainer>

      {/* Layer / control panel */}
      <div className="absolute right-3 top-3 z-[500] flex flex-col gap-2">
        <div className="glass rounded-lg p-2 space-y-1.5 w-44">
          <p className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-muted"><Layers className="h-3 w-3" /> Layers</p>
          <label className="flex items-center justify-between px-1 py-1 text-xs text-slate-300">
            Robot Trails
            <input type="checkbox" checked={showTrails} onChange={() => setShowTrails((v) => !v)} />
          </label>
          <label className="flex items-center justify-between px-1 py-1 text-xs text-slate-300">
            Heat Map
            <input type="checkbox" checked={showHeat} onChange={() => setShowHeat((v) => !v)} />
          </label>
        </div>
        <button className="glass flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:text-primary" aria-label="Fullscreen">
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="glass absolute left-3 bottom-3 z-[500] rounded-lg p-3 text-xs space-y-1.5">
        <p className="mb-1 flex items-center gap-1.5 font-medium text-muted"><Compass className="h-3 w-3" /> Legend</p>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Robot</div>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-critical" /> Victim</div>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-warning" /> Hazard</div>
      </div>

      <div className="glass absolute left-3 top-3 z-[500] rounded-lg px-3 py-1.5">
        <Badge variant="live">Live tracking · {robots.filter((r) => r.connection === "live").length} robots</Badge>
      </div>
    </div>
  );
}
