import React from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapboxMap({ events }) {
  const center = events.length ? [events[0].location.lng, events[0].location.lat] : [-71.15, 42.67];
  return (
    <div style={{ height: 320 }} className="rounded overflow-hidden">
      <Map
        initialViewState={{
          longitude: center[0],
          latitude: center[1],
          zoom: 12
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      >
        {events.map(ev => (
          <Marker key={ev.id} longitude={ev.location.lng} latitude={ev.location.lat}>
            <div className="bg-red-600 rounded-full w-3 h-3" title={ev.title}></div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
