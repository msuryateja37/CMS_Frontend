import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Locate } from 'lucide-react';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapSelectorProps {
    latitude: string | number;
    longitude: string | number;
    onChange: (lat: number, lng: number) => void;
}

// Component to handle map pan/center when coordinates change externally
const ChangeView = ({ center }: { center: L.LatLngExpression }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

// Component to handle clicks on the map to place the marker
const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const MapSelector: React.FC<MapSelectorProps> = ({ latitude, longitude, onChange }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
    const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;

    // Default to a central location if no coordinates
    const center: L.LatLngExpression = useMemo(() => {
        return (lat && lng) ? [lat, lng] : [-25.7479, 28.2293]; // Default to Pretoria/Gauteng
    }, [lat, lng]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setError(null);

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                onChange(parseFloat(lat), parseFloat(lon));
            } else {
                setError('Location not found');
            }
        } catch (err) {
            setError('Search failed. Please try again.');
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleMyLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                onChange(position.coords.latitude, position.coords.longitude);
            },
            (err) => {
                setError('Unable to retrieve your location');
                console.error(err);
            }
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for a location..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BB8F53] focus:border-transparent outline-none transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#BB8F53] text-white text-xs font-bold rounded-lg hover:bg-[#865A2E] transition-colors disabled:opacity-50"
                    >
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                </form>

                <button
                    onClick={handleMyLocation}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap"
                >
                    <Locate size={18} className="text-[#BB8F53]" />
                    My Location
                </button>
            </div>

            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

            <div className="h-80 w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner relative z-0">
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ChangeView center={center} />
                    <MapEvents onMapClick={onChange} />
                    {lat && lng && (
                        <Marker
                            position={[lat, lng]}
                            draggable={true}
                            eventHandlers={{
                                dragend: (e) => {
                                    const marker = e.target;
                                    const position = marker.getLatLng();
                                    onChange(position.lat, position.lng);
                                }
                            }}
                        />
                    )}
                </MapContainer>
            </div>

            <p className="text-xs text-gray-500 italic">
                * Click on the map or drag the marker to refine the location.
            </p>
        </div>
    );
};

export default MapSelector;
