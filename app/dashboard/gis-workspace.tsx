"use client";
import React, { Component, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Polygon, Popup, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import {
  CheckCircle2,
  Compass,
  Download,
  Edit3,
  FileCheck2,
  Layers3,
  MapPinned,
  Plus,
  Printer,
  ShieldCheck,
  Upload,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

type Point = [number, number];
type Parcel = {
  id?: number;
  parcelId: string;
  farmerDfrId: string;
  farmerName: string;
  county: string;
  district: string;
  commodity: string;
  vertices: Point[];
  areaHectares: number;
  areaAcres: number;
  perimeterMeters: number;
  centroidLat: number;
  centroidLng: number;
  gpsAccuracy: number;
  geometryStatus: string;
  qualityFlags: string[];
  revision: number;
  verifiedBy: string;
  verifiedAt: string;
};

const LIBERIA_BOUNDS: L.LatLngBoundsExpression = [
  [4.15, -11.65],
  [8.75, -7.25],
];

const markerIcon = L.divIcon({
  className: "dfr-map-marker",
  html: "<span></span>",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function parseVertices(val: any): Point[] {
  if (Array.isArray(val)) {
    return val.filter(
      (p) => Array.isArray(p) && p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1])
    ) as Point[];
  }
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (p) => Array.isArray(p) && p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1])
        ) as Point[];
      }
    } catch {}
  }
  return [];
}

function parseQualityFlags(val: any): string[] {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {}
  }
  return [];
}

function toRad(x: number) {
  return (x * Math.PI) / 180;
}

function haversine(a: Point, b: Point) {
  const R = 6378137;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const q =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
}

function metrics(v: Point[]) {
  if (!Array.isArray(v) || v.length < 3) {
    return { areaHectares: 0, areaAcres: 0, perimeterMeters: 0, centroidLat: 6.42, centroidLng: -9.43 };
  }
  const R = 6378137;
  const avgLat = v.reduce((s, p) => s + p[0], 0) / v.length;
  const avgLng = v.reduce((s, p) => s + p[1], 0) / v.length;
  const lat0 = toRad(avgLat);
  const xy = v.map((p) => [R * toRad(p[1]) * Math.cos(lat0), R * toRad(p[0])]);
  let twice = 0;
  for (let i = 0; i < xy.length; i++) {
    const j = (i + 1) % xy.length;
    twice += xy[i][0] * xy[j][1] - xy[j][0] * xy[i][1];
  }
  const sqm = Math.abs(twice) / 2;
  let perimeter = 0;
  for (let i = 0; i < v.length; i++) {
    perimeter += haversine(v[i], v[(i + 1) % v.length]);
  }
  return {
    areaHectares: sqm / 10000,
    areaAcres: sqm / 4046.8564224,
    perimeterMeters: perimeter,
    centroidLat: avgLat,
    centroidLng: avgLng,
  };
}

function crosses(a: Point, b: Point, c: Point, d: Point) {
  const o = (p: Point, q: Point, r: Point) =>
    (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
}

function selfIntersects(v: Point[]) {
  if (!Array.isArray(v) || v.length < 4) return false;
  for (let i = 0; i < v.length; i++) {
    for (let j = i + 1; j < v.length; j++) {
      if (Math.abs(i - j) <= 1 || (i === 0 && j === v.length - 1)) continue;
      if (crosses(v[i], v[(i + 1) % v.length], v[j], v[(j + 1) % v.length])) return true;
    }
  }
  return false;
}

function bbox(v: Point[]) {
  if (!Array.isArray(v) || v.length === 0) return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  const lats = v.map((p) => p[0]).filter(Number.isFinite);
  const lngs = v.map((p) => p[1]).filter(Number.isFinite);
  if (lats.length === 0 || lngs.length === 0) return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
}

function bboxOverlap(a: Point[], b: Point[]) {
  if (!Array.isArray(a) || a.length < 3 || !Array.isArray(b) || b.length < 3) return false;
  const x = bbox(a);
  const y = bbox(b);
  return x.minLat <= y.maxLat && x.maxLat >= y.minLat && x.minLng <= y.maxLng && x.maxLng >= y.minLng;
}

function MapClick({ drawing, add }: { drawing: boolean; add: (p: Point) => void }) {
  useMapEvents({
    click: (e) => {
      if (drawing && Number.isFinite(e.latlng.lat) && Number.isFinite(e.latlng.lng)) {
        add([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

class GISErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error?.message || "Spatial rendering error" };
  }
  componentDidCatch(error: Error) {
    console.error("GIS Workspace Error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", margin: 20 }}>
          <h3 style={{ color: "#0f172a", fontSize: 18, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle style={{ color: "#e11d48", width: 22, height: 22 }} />
            Cadastre Map Encountered an Initialization Glitch
          </h3>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 16 }}>
            {this.state.error}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: "" })}
            style={{
              background: "#087a54",
              color: "#fff",
              border: 0,
              padding: "8px 16px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <RefreshCw style={{ width: 14, height: 14 }} /> Reload Spatial Cadastre
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function GISWorkspaceInner({ notify }: { notify: (s: string) => void }) {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [draft, setDraft] = useState<Point[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [base, setBase] = useState<"satellite" | "street">("satellite");
  const [ndvi, setNdvi] = useState(false);
  const [filter, setFilter] = useState("All Parcels");
  const [selected, setSelected] = useState<Parcel | null>(null);
  const [form, setForm] = useState({
    farmerName: "",
    farmerDfrId: "",
    county: "Montserrado",
    district: "",
    commodity: "",
  });
  const [revision, setRevision] = useState<Parcel | null>(null);
  const [certificate, setCertificate] = useState<Parcel | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/parcels");
      const r = await res.json();
      if (Array.isArray(r)) {
        const normalized: Parcel[] = r.map((p: any) => ({
          id: p.id,
          parcelId: p.parcelId || `PCL-${Math.random().toString(36).slice(2, 8)}`,
          farmerDfrId: p.farmerDfrId || "",
          farmerName: p.farmerName || "Registered Farmer",
          county: p.county || "Montserrado",
          district: p.district || "",
          commodity: p.commodity || "Cassava",
          vertices: parseVertices(p.vertices),
          qualityFlags: parseQualityFlags(p.qualityFlags),
          areaHectares: Number(p.areaHectares) || 0,
          areaAcres: Number(p.areaAcres) || 0,
          perimeterMeters: Number(p.perimeterMeters) || 0,
          centroidLat: Number(p.centroidLat) || 6.42,
          centroidLng: Number(p.centroidLng) || -9.43,
          gpsAccuracy: Number(p.gpsAccuracy) || 0,
          geometryStatus: p.geometryStatus || "UNVERIFIED",
          revision: Number(p.revision) || 1,
          verifiedBy: p.verifiedBy || "",
          verifiedAt: p.verifiedAt || "",
        }));
        setParcels(normalized);
      } else {
        setParcels([]);
      }
    } catch (err) {
      console.error("Failed to load parcels", err);
      setParcels([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const m = useMemo(() => metrics(draft), [draft]);
  const draftFlags = useMemo(
    () => [
      ...(draft.length > 0 && draft.length < 3 ? ["INVALID_GEOMETRY"] : []),
      ...(draft.length >= 3 && selfIntersects(draft) ? ["SELF_INTERSECTION"] : []),
      ...(draft.length >= 3 && parcels.some((p) => bboxOverlap(draft, p.vertices))
        ? ["POSSIBLE_OVERLAP"]
        : []),
    ],
    [draft, parcels]
  );

  const quality = (p: Parcel) => [
    ...(Array.isArray(p.qualityFlags) ? p.qualityFlags : []),
    ...(Number(p.gpsAccuracy) > 15 ? ["GPS_DRIFT"] : []),
  ];

  const isVerified = (status: string) => status === "FIELD_VERIFIED" || status === "VERIFIED";

  const filtered = parcels.filter(
    (p) =>
      filter === "All Parcels" ||
      (filter === "Unverified Polygons" && !isVerified(p.geometryStatus)) ||
      (filter === "Invalid Geometry" &&
        quality(p).some((x) => x.includes("INVALID") || x.includes("SELF"))) ||
      (filter === "Overlaps & Conflicts" && quality(p).some((x) => x.includes("OVERLAP"))) ||
      (filter === "GPS Drift Warnings" && Number(p.gpsAccuracy) > 15)
  );

  const totals = useMemo(
    () => ({
      ha: parcels.reduce((s, p) => s + (p.areaHectares || 0), 0),
      unverified: parcels.filter((p) => !isVerified(p.geometryStatus)).length,
      invalid: parcels.filter((p) =>
        quality(p).some((x) => x.includes("INVALID") || x.includes("SELF"))
      ).length,
      overlaps: parcels.filter((p) => quality(p).some((x) => x.includes("OVERLAP"))).length,
      drift: parcels.filter((p) => Number(p.gpsAccuracy) > 15).length,
    }),
    [parcels]
  );

  async function save() {
    if (draft.length < 3 || selfIntersects(draft)) {
      notify("Correct the parcel geometry before saving (at least 3 vertices with no self-intersection).");
      return;
    }
    const payload = {
      ...form,
      vertices: draft,
      ...m,
      gpsAccuracy: 5.2,
      qualityFlags: draftFlags,
    };
    try {
      const r = await fetch("/api/parcels", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const b = await r.json();
      if (!r.ok) {
        notify(b.error || "Failed to save parcel.");
        return;
      }
      notify(`${b.parcelId || "Parcel"} saved to the spatial verification queue.`);
      setDraft([]);
      setDrawing(false);
      await load();
    } catch {
      notify("Network error saving parcel.");
    }
  }

  async function verify(p: Parcel) {
    try {
      await fetch("/api/parcels", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          parcelId: p.parcelId,
          geometryStatus: "FIELD_VERIFIED",
          verifiedBy: "Authorized GIS Officer",
        }),
      });
      notify(`${p.parcelId} geometry locked and field verified.`);
      setSelected(null);
      await load();
    } catch {
      notify("Failed to verify parcel.");
    }
  }

  async function importGeoJSON(file: File) {
    try {
      const json = JSON.parse(await file.text());
      const features = json.type === "FeatureCollection" ? json.features : [json];
      let count = 0;
      for (const f of features) {
        if (f.geometry?.type !== "Polygon" || !Array.isArray(f.geometry.coordinates?.[0])) continue;
        const v: Point[] = f.geometry.coordinates[0]
          .slice(0, -1)
          .map((x: number[]) => [x[1], x[0]] as Point)
          .filter((pt: Point) => Number.isFinite(pt[0]) && Number.isFinite(pt[1]));
        if (v.length < 3) continue;
        const mm = metrics(v);
        await fetch("/api/parcels", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            farmerName: f.properties?.farmerName || "Imported parcel",
            farmerDfrId: f.properties?.farmerDfrId || "",
            county: f.properties?.county || "Unassigned",
            district: f.properties?.district || "",
            commodity: f.properties?.commodity || "",
            vertices: v,
            ...mm,
            gpsAccuracy: Number(f.properties?.gpsAccuracy) || 0,
            qualityFlags: selfIntersects(v) ? ["SELF_INTERSECTION"] : [],
          }),
        });
        count++;
      }
      notify(`${count} GeoJSON parcel${count === 1 ? "" : "s"} imported and quality-screened.`);
      await load();
    } catch {
      notify("The selected file is not valid Polygon GeoJSON.");
    }
  }

  function exportGeoJSON() {
    const validParcels = parcels.filter((p) => p.vertices && p.vertices.length >= 3);
    const fc = {
      type: "FeatureCollection",
      name: "Liberia_DFR_Authorized_Parcels",
      crs: {
        type: "name",
        properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
      },
      features: validParcels.map((p) => ({
        type: "Feature",
        properties: {
          parcelId: p.parcelId,
          farmerDfrId: p.farmerDfrId,
          farmerName: p.farmerName,
          county: p.county,
          district: p.district,
          commodity: p.commodity,
          areaHectares: p.areaHectares,
          areaAcres: p.areaAcres,
          perimeterMeters: p.perimeterMeters,
          status: p.geometryStatus,
          revision: p.revision,
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              ...p.vertices.map((x) => [x[1], x[0]]),
              [p.vertices[0][1], p.vertices[0][0]],
            ],
          ],
        },
      })),
    };
    const blob = new Blob([JSON.stringify(fc, null, 2)], { type: "application/geo+json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Liberia-DFR-authorized-parcels.geojson";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function applyRevision() {
    if (!revision) return;
    try {
      const v = JSON.parse(
        (document.getElementById("revision-json") as HTMLTextAreaElement).value
      ) as Point[];
      if (!Array.isArray(v) || v.length < 3) {
        notify("Revision must contain at least 3 [latitude, longitude] vertices.");
        return;
      }
      const mm = metrics(v);
      await fetch("/api/parcels", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          parcelId: revision.parcelId,
          vertices: v,
          ...mm,
          qualityFlags: selfIntersects(v) ? ["SELF_INTERSECTION"] : [],
        }),
      });
      notify(`${revision.parcelId} revised; prior verified state revoked pending revalidation.`);
      setRevision(null);
      await load();
    } catch {
      notify("Revision JSON must be a valid array of [latitude, longitude] pairs.");
    }
  }

  return (
    <div className="gis-workspace">
      <section className="gis-kpis">
        <Kpi
          icon={<MapPinned />}
          label="Mapped cadastre"
          value={`${parcels.length} parcels`}
          sub={`${totals.ha.toFixed(2)} ha · ${(totals.ha * 2.47105).toFixed(2)} acres`}
        />
        <Kpi
          icon={<FileCheck2 />}
          label="Unverified polygons"
          value={String(totals.unverified)}
          sub="Awaiting GIS review"
        />
        <Kpi
          icon={<AlertTriangle />}
          label="Topology errors"
          value={String(totals.invalid)}
          sub="Invalid rings"
        />
        <Kpi
          icon={<Layers3 />}
          label="Overlap conflicts"
          value={String(totals.overlaps)}
          sub={`${totals.drift} GPS drift warnings`}
        />
      </section>

      <section className="gis-toolbar">
        <div>
          <Compass />
          <b>National Spatial Cadastre</b>
          <span>WGS 84 · EPSG:4326</span>
        </div>
        <div className="basemaps">
          <button
            className={base === "satellite" ? "active" : ""}
            onClick={() => setBase("satellite")}
          >
            Satellite
          </button>
          <button
            className={base === "street" ? "active" : ""}
            onClick={() => setBase("street")}
          >
            Street / topo
          </button>
          <button
            className={ndvi ? "active" : ""}
            onClick={() => setNdvi(!ndvi)}
          >
            NDVI
          </button>
        </div>
        <input
          ref={fileRef}
          hidden
          type="file"
          accept=".geojson,.json,application/geo+json"
          onChange={(e) => e.target.files?.[0] && importGeoJSON(e.target.files[0])}
        />
        <button onClick={() => fileRef.current?.click()}>
          <Upload /> Import GeoJSON
        </button>
        <button onClick={exportGeoJSON}>
          <Download /> Export GeoJSON
        </button>
        <button
          className="primary-map"
          onClick={() => {
            setDrawing(!drawing);
            setDraft([]);
          }}
        >
          <Plus /> {drawing ? "Cancel drawing" : "Draw parcel"}
        </button>
      </section>

      <section className="gis-stage">
        <div className="map-shell">
          <MapContainer
            center={[6.42, -9.43]}
            zoom={7}
            minZoom={6}
            maxZoom={19}
            maxBounds={LIBERIA_BOUNDS}
            className="leaflet-map"
          >
            <TileLayer
              attribution={base === "satellite" ? "Tiles © Esri" : "© OpenStreetMap contributors"}
              url={
                base === "satellite"
                  ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
            />
            {ndvi && (
              <TileLayer
                opacity={0.62}
                maxNativeZoom={9}
                attribution="NASA GIBS MODIS Terra NDVI"
                url="https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_16Day/default/2026-07-12/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png"
              />
            )}
            <MapClick drawing={drawing} add={(p) => setDraft((v) => [...v, p])} />
            {parcels
              .filter((p) => Array.isArray(p.vertices) && p.vertices.length >= 3)
              .map((p) => (
                <Polygon
                  key={p.parcelId}
                  positions={p.vertices}
                  pathOptions={{
                    color: isVerified(p.geometryStatus) ? "#22c55e" : "#f59e0b",
                    weight: 3,
                    fillOpacity: 0.24,
                  }}
                  eventHandlers={{ click: () => setSelected(p) }}
                >
                  <Popup>
                    <b>{p.parcelId}</b>
                    <br />
                    {p.farmerName}
                    <br />
                    {(p.areaHectares || 0).toFixed(3)} ha · {p.geometryStatus}
                  </Popup>
                </Polygon>
              ))}
            {draft.length >= 3 && (
              <Polygon
                positions={draft}
                pathOptions={{
                  color: draftFlags.length ? "#ef4444" : "#38bdf8",
                  dashArray: "7 6",
                  weight: 3,
                  fillOpacity: 0.25,
                }}
              />
            )}
            {draft.map((p, i) => (
              <Marker key={i} position={p} icon={markerIcon}>
                <Popup>
                  Vertex {i + 1}
                  <br />
                  {p[0].toFixed(6)}, {p[1].toFixed(6)}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          {drawing && (
            <div className="digitize-banner">
              <b>Digitizing mode</b>
              <span>Click satellite imagery to add WGS 84 vertices · {draft.length} vertices</span>
              <button onClick={() => setDraft((v) => v.slice(0, -1))}>Undo</button>
              <button onClick={() => setDraft([])}>Clear</button>
            </div>
          )}
          {ndvi && (
            <div className="ndvi-legend">
              <b>NDVI · MODIS Terra</b>
              <span>Observation: 12 Jul 2026</span>
              <i>Low vegetation</i>
              <em>High vegetation</em>
            </div>
          )}
        </div>

        <aside className="spatial-panel">
          <header>
            <span>Live parcel metrics</span>
            <h3>{draft.length ? "Boundary draft" : "Select or draw a parcel"}</h3>
          </header>
          <div className="metric-pairs">
            <p>
              <span>Area</span>
              <b>{(m.areaHectares || 0).toFixed(3)} ha</b>
              <small>{(m.areaAcres || 0).toFixed(3)} acres</small>
            </p>
            <p>
              <span>Perimeter</span>
              <b>{(m.perimeterMeters || 0).toFixed(1)} m</b>
              <small>{draft.length} vertices</small>
            </p>
            <p>
              <span>Centroid</span>
              <b>{m.centroidLat ? `${m.centroidLat.toFixed(6)}°N` : "—"}</b>
              <small>{m.centroidLng ? `${Math.abs(m.centroidLng).toFixed(6)}°W` : "—"}</small>
            </p>
            <p>
              <span>Topology</span>
              <b className={draftFlags.length ? "bad" : "good"}>
                {draft.length < 3 ? "Incomplete" : draftFlags.length ? "Review" : "Valid ring"}
              </b>
              <small>{draftFlags.join(", ") || "No current conflicts"}</small>
            </p>
          </div>
          {drawing && (
            <div className="parcel-form">
              <input
                placeholder="Farmer / organization name"
                value={form.farmerName}
                onChange={(e) => setForm({ ...form, farmerName: e.target.value })}
              />
              <input
                placeholder="DFR ID (optional)"
                value={form.farmerDfrId}
                onChange={(e) => setForm({ ...form, farmerDfrId: e.target.value })}
              />
              <select
                value={form.county}
                onChange={(e) => setForm({ ...form, county: e.target.value })}
              >
                {[
                  "Bomi",
                  "Bong",
                  "Gbarpolu",
                  "Grand Bassa",
                  "Grand Cape Mount",
                  "Grand Gedeh",
                  "Grand Kru",
                  "Lofa",
                  "Margibi",
                  "Maryland",
                  "Montserrado",
                  "Nimba",
                  "River Cess",
                  "River Gee",
                  "Sinoe",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <input
                placeholder="District"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
              />
              <input
                placeholder="Commodity"
                value={form.commodity}
                onChange={(e) => setForm({ ...form, commodity: e.target.value })}
              />
              <button
                disabled={draft.length < 3 || draftFlags.includes("SELF_INTERSECTION")}
                onClick={save}
              >
                <ShieldCheck /> Save for validation
              </button>
            </div>
          )}
        </aside>
      </section>

      <section className="qc-panel">
        <header>
          <div>
            <span>Spatial quality control queue</span>
            <h3>Parcel validation and exception management</h3>
          </div>
        </header>
        <nav>
          {[
            "All Parcels",
            "Unverified Polygons",
            "Invalid Geometry",
            "Overlaps & Conflicts",
            "GPS Drift Warnings",
          ].map((x) => (
            <button
              className={filter === x ? "active" : ""}
              onClick={() => setFilter(x)}
              key={x}
            >
              {x}
              <b>
                {x === "All Parcels"
                  ? parcels.length
                  : x === "Unverified Polygons"
                  ? totals.unverified
                  : x === "Invalid Geometry"
                  ? totals.invalid
                  : x === "Overlaps & Conflicts"
                  ? totals.overlaps
                  : totals.drift}
              </b>
            </button>
          ))}
        </nav>
        <div className="parcel-table">
          <table>
            <thead>
              <tr>
                <th>Parcel</th>
                <th>Registered subject</th>
                <th>Location</th>
                <th>Spatial metrics</th>
                <th>Quality</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.parcelId}>
                  <td>
                    <code>{p.parcelId}</code>
                    <small>Revision {p.revision}</small>
                  </td>
                  <td>
                    <b>{p.farmerName}</b>
                    <small>
                      {p.farmerDfrId || "Unlinked"} · {p.commodity}
                    </small>
                  </td>
                  <td>
                    {p.county}
                    <small>
                      {(p.centroidLat || 0).toFixed(5)}, {(p.centroidLng || 0).toFixed(5)}
                    </small>
                  </td>
                  <td>
                    {(p.areaHectares || 0).toFixed(3)} ha
                    <small>
                      {(p.perimeterMeters || 0).toFixed(1)} m · {p.vertices?.length || 0} vertices
                    </small>
                  </td>
                  <td>
                    {quality(p).length ? (
                      <span className="flag">{quality(p).join(", ")}</span>
                    ) : (
                      <span className="clear">Passed</span>
                    )}
                  </td>
                  <td>
                    <span className={isVerified(p.geometryStatus) ? "field-verified" : "unverified"}>
                      {(p.geometryStatus || "").replaceAll("_", " ")}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => setSelected(p)}>Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <div className="modal-wrap">
          <div className="gis-review">
            <header>
              <div>
                <span>Spatial record review</span>
                <h2>{selected.parcelId}</h2>
              </div>
              <button onClick={() => setSelected(null)}>×</button>
            </header>
            <div className="review-metrics">
              <Kpi
                icon={<MapPinned />}
                label="Area"
                value={`${(selected.areaHectares || 0).toFixed(3)} ha`}
                sub={`${(selected.areaAcres || 0).toFixed(3)} acres`}
              />
              <Kpi
                icon={<Compass />}
                label="Perimeter"
                value={`${(selected.perimeterMeters || 0).toFixed(1)} m`}
                sub={`${selected.vertices?.length || 0} vertices`}
              />
              <Kpi
                icon={<ShieldCheck />}
                label="Status"
                value={(selected.geometryStatus || "").replaceAll("_", " ")}
                sub={`Revision ${selected.revision}`}
              />
            </div>
            <pre>{JSON.stringify(selected.vertices, null, 2)}</pre>
            <footer>
              <button onClick={() => setRevision(selected)}>
                <Edit3 /> Controlled revision
              </button>
              <button onClick={() => setCertificate(selected)}>
                <Printer /> Map certificate
              </button>
              <button
                disabled={quality(selected).length > 0}
                onClick={() => verify(selected)}
              >
                <CheckCircle2 /> Validate & lock geometry
              </button>
            </footer>
          </div>
        </div>
      )}

      {revision && (
        <div className="modal-wrap">
          <div className="revision-modal">
            <header>
              <h3>Controlled Boundary Revision · {revision.parcelId}</h3>
              <button onClick={() => setRevision(null)}>×</button>
            </header>
            <p>
              Enter WGS 84 vertices as <code>[[latitude, longitude], …]</code>. Saving creates a
              new controlled revision and returns the parcel to the verification queue.
            </p>
            <textarea
              id="revision-json"
              defaultValue={JSON.stringify(revision.vertices, null, 2)}
            />
            <footer>
              <button onClick={() => setRevision(null)}>Cancel</button>
              <button onClick={applyRevision}>Save controlled revision</button>
            </footer>
          </div>
        </div>
      )}

      {certificate && (
        <div className="modal-wrap">
          <article className="map-certificate">
            <header>
              <img src="/assets/moa-logo.png" alt="MoA Logo" />
              <div>
                <span>Republic of Liberia · Ministry of Agriculture</span>
                <h2>Official Cadastral Map Certificate</h2>
                <p>Digital Farmer Registry · WGS 84 / EPSG:4326</p>
              </div>
              <img src="/assets/fao-logo.png" alt="FAO Logo" />
            </header>
            <h3>{certificate.parcelId}</h3>
            <dl>
              <div>
                <dt>Registered subject</dt>
                <dd>{certificate.farmerName}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>
                  {certificate.county}, {certificate.district}
                </dd>
              </div>
              <div>
                <dt>Area</dt>
                <dd>
                  {(certificate.areaHectares || 0).toFixed(4)} ha /{" "}
                  {(certificate.areaAcres || 0).toFixed(4)} acres
                </dd>
              </div>
              <div>
                <dt>Perimeter</dt>
                <dd>{(certificate.perimeterMeters || 0).toFixed(2)} metres</dd>
              </div>
              <div>
                <dt>Centroid</dt>
                <dd>
                  {(certificate.centroidLat || 0).toFixed(6)}°N,{" "}
                  {Math.abs(certificate.centroidLng || 0).toFixed(6)}°W
                </dd>
              </div>
              <div>
                <dt>Boundary</dt>
                <dd>
                  {certificate.vertices?.length || 0} controlled vertices · Revision{" "}
                  {certificate.revision}
                </dd>
              </div>
              <div>
                <dt>Verification</dt>
                <dd>
                  {(certificate.geometryStatus || "").replaceAll("_", " ")} ·{" "}
                  {certificate.verifiedBy || "Pending"}
                </dd>
              </div>
              <div>
                <dt>Standard</dt>
                <dd>LADM-aligned parcel reference · GeoJSON compatible</dd>
              </div>
            </dl>
            <div className="certificate-seal">
              <ShieldCheck />
              <b>Digitally traceable spatial record</b>
              <span>Certificate generated from the controlled DFR parcel database.</span>
            </div>
            <footer>
              <button onClick={() => setCertificate(null)}>Close</button>
              <button onClick={() => window.print()}>
                <Printer /> Print certificate
              </button>
            </footer>
          </article>
        </div>
      )}
    </div>
  );
}

export default function GISWorkspace({ notify }: { notify: (s: string) => void }) {
  return (
    <GISErrorBoundary>
      <GISWorkspaceInner notify={notify} />
    </GISErrorBoundary>
  );
}

function Kpi({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <article>
      <i>{icon}</i>
      <div>
        <span>{label}</span>
        <b>{value}</b>
        <small>{sub}</small>
      </div>
    </article>
  );
}
