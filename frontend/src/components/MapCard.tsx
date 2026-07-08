import React, { useState, useCallback, useMemo, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, MarkerClusterer, HeatmapLayer, TrafficLayer } from "@react-google-maps/api";
import { Card } from "./Card";
import { Badge } from "./Badge";

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  category: string;
  title: string;
  severity: string;
  priority_score: number;
  ward: string;
  population: number;
  budget: string;
  department: string;
}

interface MapCardProps {
  totalIssuesCount: number;
  analyzedCount: number;
  markers: MapMarker[];
  hotspots: { id: string; label: string }[];
  focusCategory: string;
  selectedMarkerId?: string;
  className?: string;
  onMarkerHover?: (id: string | null) => void;
  onMarkerClick?: (id: string) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1.6rem'
};

const center = {
  lat: 17.3850,
  lng: 78.4867
};

// Define libraries outside to avoid infinite re-renders
const libraries: ("visualization")[] = ["visualization"];

// Extracted OSM Markers Overlay for Fallback
const OSMMarkersOverlay: React.FC<{
  markers: MapMarker[];
  targetLat: number;
  targetLng: number;
  zoomOffset: number;
  selectedMarkerId?: string;
  onMarkerClick?: (id: string) => void;
  onMarkerHover?: (id: string | null) => void;
}> = ({ markers, targetLat, targetLng, zoomOffset, selectedMarkerId, onMarkerClick, onMarkerHover }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const minLng = targetLng - zoomOffset;
  const maxLng = targetLng + zoomOffset;
  const minLat = targetLat - zoomOffset;
  const maxLat = targetLat + zoomOffset;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-[1.6rem]">
      {markers.map(marker => {
        if (marker.lng < minLng || marker.lng > maxLng || marker.lat < minLat || marker.lat > maxLat) return null;

        const leftPct = ((marker.lng - minLng) / (maxLng - minLng)) * 100;
        const topPct = 100 - (((marker.lat - minLat) / (maxLat - minLat)) * 100);

        const markerColor = 
          marker.severity === "Critical" ? "#ef4444" : 
          marker.severity === "High" ? "#f97316" : 
          marker.severity === "Medium" ? "#eab308" : "#22c55e";

        const isHovered = hoveredId === marker.id || selectedMarkerId === marker.id;

        return (
          <div 
            key={marker.id}
            className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-auto cursor-pointer"
            style={{ left: `${leftPct}%`, top: `${topPct}%` }}
            onMouseEnter={() => { setHoveredId(marker.id); if (onMarkerHover) onMarkerHover(marker.id); }}
            onMouseLeave={() => { setHoveredId(null); if (onMarkerHover) onMarkerHover(null); }}
            onClick={() => { if (onMarkerClick) onMarkerClick(marker.id); }}
          >
            <svg 
              width="36" 
              height="36" 
              viewBox="0 0 24 24" 
              className={`drop-shadow-md transition-transform origin-bottom ${isHovered ? 'scale-125' : 'scale-100'} ${selectedMarkerId === marker.id ? 'animate-bounce' : ''}`}
            >
              <path 
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" 
                fill={markerColor} 
                stroke="#ffffff" 
                strokeWidth="1.5"
              />
            </svg>

            {isHovered && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[240px] bg-white rounded-xl shadow-xl border border-brand-line/30 p-2.5 z-20 pointer-events-none">
                <h3 className="font-bold text-sm mb-1 text-brand-terracotta truncate">{marker.category}</h3>
                <p className="text-xs font-semibold mb-3 truncate text-brand-ink">{marker.title}</p>
                <div className="grid grid-cols-2 gap-2 text-[10px] bg-brand-cream/40 p-2.5 rounded-lg border border-brand-line/50">
                  <div>
                    <span className="text-brand-ink-light block uppercase tracking-wider mb-0.5">Ward</span>
                    <strong className="font-bold text-xs text-brand-ink">{marker.ward}</strong>
                  </div>
                  <div>
                    <span className="text-brand-ink-light block uppercase tracking-wider mb-0.5">Severity</span>
                    <strong className="font-bold text-xs" style={{ color: markerColor }}>{marker.severity}</strong>
                  </div>
                  <div>
                    <span className="text-brand-ink-light block uppercase tracking-wider mb-0.5">Population</span>
                    <strong className="font-bold text-xs text-brand-ink">{marker.population.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-brand-ink-light block uppercase tracking-wider mb-0.5">Est. Budget</span>
                    <strong className="font-bold text-xs text-brand-ink">{marker.budget}</strong>
                  </div>
                  <div className="col-span-2 border-t border-brand-line/30 pt-1.5 mt-1">
                    <span className="text-brand-ink-light block uppercase tracking-wider mb-0.5">Department</span>
                    <strong className="font-semibold text-xs text-brand-ink/90 leading-tight block">{marker.department}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Extracted GoogleMapRenderer to prevent useJsApiLoader from executing when the key is missing.
const GoogleMapRenderer: React.FC<MapCardProps & { apiKey: string }> = ({
  markers,
  selectedMarkerId = "",
  onMarkerClick,
  apiKey
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries
  });

  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && selectedMarkerId) {
      const marker = markers.find(m => m.id === selectedMarkerId);
      if (marker) {
        map.panTo({ lat: marker.lat, lng: marker.lng });
        map.setZoom(14);
      }
    }
  }, [selectedMarkerId, map, markers]);

  const heatmapData = useMemo(() => {
    if (!isLoaded || !window.google) return [];
    return markers.map(marker => new window.google.maps.LatLng(marker.lat, marker.lng));
  }, [markers, isLoaded]);

  const isBouncing = (id: string) => selectedMarkerId === id;

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center bg-red-50 text-red-600 p-6 text-center text-sm font-semibold">
        Google Maps failed to load. Please check your network connection or API key restrictions.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center text-brand-ink-light animate-pulse font-semibold">
        Loading Map Data...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        zoomControl: true,
        streetViewControl: true,
        mapTypeControl: true,
        fullscreenControl: true,
        styles: [
          { "elementType": "geometry", "stylers": [{"color": "#f5f5f5"}] },
          { "elementType": "labels.icon", "stylers": [{"visibility": "off"}] },
          { "elementType": "labels.text.fill", "stylers": [{"color": "#616161"}] },
          { "elementType": "labels.text.stroke", "stylers": [{"color": "#f5f5f5"}] },
          { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{"color": "#bdbdbd"}] },
          { "featureType": "poi", "elementType": "geometry", "stylers": [{"color": "#eeeeee"}] },
          { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{"color": "#757575"}] },
          { "featureType": "road", "elementType": "geometry", "stylers": [{"color": "#ffffff"}] },
          { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{"color": "#757575"}] },
          { "featureType": "road.highway", "elementType": "geometry", "stylers": [{"color": "#dadada"}] },
          { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{"color": "#616161"}] },
          { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{"color": "#9e9e9e"}] },
          { "featureType": "transit.line", "elementType": "geometry", "stylers": [{"color": "#e5e5e5"}] },
          { "featureType": "transit.station", "elementType": "geometry", "stylers": [{"color": "#eeeeee"}] },
          { "featureType": "water", "elementType": "geometry", "stylers": [{"color": "#c9c9c9"}] },
          { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{"color": "#9e9e9e"}] }
        ]
      }}
    >
      <TrafficLayer />
      <HeatmapLayer
        data={heatmapData}
        options={{
          radius: 45,
          opacity: 0.6,
          gradient: [
            "rgba(185, 122, 87, 0)",
            "rgba(185, 122, 87, 0.4)",
            "rgba(212, 163, 115, 0.7)",
            "rgba(255, 99, 71, 0.9)",
            "rgba(220, 20, 60, 1)",
            "rgba(139, 0, 0, 1)"
          ]
        }}
      />

      <MarkerClusterer>
        {(clusterer) => (
          <>
            {markers.map((marker) => {
              const markerColor = 
                marker.severity === "Critical" ? "#ef4444" : 
                marker.severity === "High" ? "#f97316" : 
                marker.severity === "Medium" ? "#eab308" : "#22c55e";

              return (
                <Marker
                  key={marker.id}
                  position={{ lat: marker.lat, lng: marker.lng }}
                  clusterer={clusterer}
                  animation={isBouncing(marker.id) ? window.google.maps.Animation.BOUNCE : undefined}
                  onMouseOver={() => setHoveredMarker(marker.id)}
                  onMouseOut={() => setHoveredMarker(null)}
                  onClick={() => {
                    if (onMarkerClick) onMarkerClick(marker.id);
                  }}
                  icon={{
                    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                    fillColor: markerColor,
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 1.5,
                    scale: 1.3,
                    anchor: new window.google.maps.Point(12, 24)
                  }}
                >
                  {(hoveredMarker === marker.id || selectedMarkerId === marker.id) && (
                    <InfoWindow
                      position={{ lat: marker.lat, lng: marker.lng }}
                      options={{ disableAutoPan: true }}
                    >
                      <div className="p-2 min-w-[220px] text-brand-ink">
                        <h3 className="font-bold text-sm mb-1 text-brand-terracotta truncate">{marker.category}</h3>
                        <p className="text-xs font-semibold mb-3 truncate">{marker.title}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-[10px] bg-brand-cream/40 p-2.5 rounded-lg border border-brand-line/50">
                          <div>
                            <span className="text-brand-ink-light block uppercase tracking-wider mb-0.5">Ward</span>
                            <strong className="font-bold text-xs">{marker.ward}</strong>
                          </div>
                          <div>
                            <span className="text-brand-ink-light block uppercase tracking-wider mb-0.5">Severity</span>
                            <strong className={`font-bold text-xs ${
                              marker.severity === 'Critical' ? 'text-red-600' : 
                              marker.severity === 'High' ? 'text-orange-600' : 
                              marker.severity === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {marker.severity}
                            </strong>
                          </div>
                          <div>
                            <span className="text-brand-ink-light block uppercase tracking-wider mb-0.5">Population</span>
                            <strong className="font-bold text-xs">{marker.population.toLocaleString()}</strong>
                          </div>
                          <div>
                            <span className="text-brand-ink-light block uppercase tracking-wider mb-0.5">Est. Budget</span>
                            <strong className="font-bold text-xs">{marker.budget}</strong>
                          </div>
                          <div className="col-span-2 border-t border-brand-line/30 pt-1.5 mt-1">
                            <span className="text-brand-ink-light block uppercase tracking-wider mb-0.5">Department</span>
                            <strong className="font-semibold text-xs text-brand-ink/90 leading-tight block">{marker.department}</strong>
                          </div>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              );
            })}
          </>
        )}
      </MarkerClusterer>
    </GoogleMap>
  );
};

export const MapCard: React.FC<MapCardProps> = (props) => {
  const {
    totalIssuesCount,
    analyzedCount,
    focusCategory,
    className = "",
  } = props;
  
  const rawKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const googleMapsApiKey = typeof rawKey === 'string' && rawKey !== 'undefined' && rawKey !== 'null' ? rawKey.trim() : "";
  const isKeyMissing = !googleMapsApiKey;

  let targetLat = 17.3850;
  let targetLng = 78.4867;
  let zoomOffset = 0.05;

  if (props.selectedMarkerId && props.markers) {
    const selected = props.markers.find(m => m.id === props.selectedMarkerId);
    if (selected) {
      targetLat = selected.lat;
      targetLng = selected.lng;
      zoomOffset = 0.015;
    }
  }

  const bbox = `${targetLng - zoomOffset},${targetLat - zoomOffset},${targetLng + zoomOffset},${targetLat + zoomOffset}`;
  const markerParam = `&marker=${targetLat},${targetLng}`;

  return (
    <Card glow className={`p-0 overflow-hidden ${className}`}>
      <div className="bg-gradient-to-b from-brand-terracotta/15 to-white/70 p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 className="text-sm font-bold text-brand-ink">Constituency Map (Live)</h4>
            <p className="text-xs text-brand-ink-light/90">
              Interactive geographic visualizer for semantic grievance clusters
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{totalIssuesCount} Total Reports</Badge>
            <Badge tone="success">{analyzedCount} Analyzed</Badge>
          </div>
        </div>

        {/* Outer map container: fills full available card space */}
        <div className="mt-5 h-[34rem] rounded-[2rem] border border-brand-line/50 p-0 overflow-hidden bg-white">
          <div className="relative h-full w-full overflow-hidden">
            {isKeyMissing ? (
              // OpenStreetMap Fallback Render
              <div className="relative w-full h-full">
                <iframe
                  width="100%"
                  height="100%"
                  title="OpenStreetMap"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${markerParam}`}
                  style={{ borderRadius: '1.6rem', border: 'none', backgroundColor: '#f5f5f5', pointerEvents: 'auto' }}
                ></iframe>
                
                {/* Disclaimer Overlay */}
                <div className="absolute top-4 left-4 z-20 bg-white/95 border border-brand-line/40 rounded-[1.2rem] p-3 shadow-md backdrop-blur-md text-xs pointer-events-auto">
                  <p className="font-bold text-brand-ink">Fallback Mode Active</p>
                  <p className="text-[10px] text-brand-ink-light mt-1 max-w-[200px] leading-relaxed">
                    Google Maps API key missing. Displaying interactive OpenStreetMap. Developer: Set <code className="bg-brand-line/30 px-1 rounded text-brand-ink">VITE_GOOGLE_MAPS_API_KEY</code>.
                  </p>
                </div>

                {/* CSS Absolute Positioned Markers Overlay */}
                <OSMMarkersOverlay 
                  markers={props.markers}
                  targetLat={targetLat}
                  targetLng={targetLng}
                  zoomOffset={zoomOffset}
                  selectedMarkerId={props.selectedMarkerId}
                  onMarkerClick={props.onMarkerClick}
                  onMarkerHover={props.onMarkerHover}
                />
              </div>
            ) : (
              <GoogleMapRenderer {...props} apiKey={googleMapsApiKey} />
            )}

            {/* Floating Legend explaining colors */}
            <div className="absolute top-4 right-4 z-10 bg-white/95 border border-brand-line/40 rounded-[1.2rem] p-3.5 shadow-md backdrop-blur-md text-[10px] space-y-1.5 min-w-[120px] pointer-events-auto">
              <p className="font-bold uppercase tracking-wider text-brand-ink-light border-b border-brand-line/20 pb-1">Severity Legend</p>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="font-semibold text-brand-ink">Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                <span className="font-semibold text-brand-ink">High</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <span className="font-semibold text-brand-ink">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="font-semibold text-brand-ink">Low</span>
              </div>
            </div>

            {/* Primary Sector Focus badge */}
            <div className="absolute bottom-4 left-4 z-10 pointer-events-none rounded-[1.2rem] border border-brand-line/40 bg-white/95 px-4 py-3 shadow-md backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-ink-light">
                Primary Sector Focus
              </p>
              <p className="mt-1 text-xs font-bold text-brand-ink">
                {focusCategory || "No data"} infrastructure belts
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
