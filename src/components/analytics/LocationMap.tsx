'use client';

// Bangladesh map with bubbles sized by job count per city — click to filter jobs.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsCardSkeleton } from '@/components/ui/content-skeletons';
import { ErrorState } from '@/components/ui/ErrorState';
import { useLocations } from '@/hooks/useAnalytics';

const GEO_URL = '/bd-geo.json';

/** Bubble radius scales with sqrt(count) so outliers don't dominate the map. */
function bubbleRadius(count: number): number {
  return Math.max(4, Math.min(24, Math.sqrt(count) * 3));
}

/**
 * Bangladesh location heat map — bubble size = job count; click a bubble to filter jobs.
 */
export function LocationMap() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useLocations();
  const [hovered, setHovered] = useState<string | null>(null);

  if (isLoading) {
    return <AnalyticsCardSkeleton chartClassName="h-72" />;
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jobs by location</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState message="Could not load location data" onRetry={() => void refetch()} />
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const hoveredLoc = data.find((d) => d.location === hovered);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jobs by location</CardTitle>
        <CardDescription>Bangladesh cities — bubble size reflects open roles</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No location data yet</p>
        ) : (
          <div className="relative">
            <div className="h-80 w-full overflow-hidden rounded-lg border bg-muted/30">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 5200, center: [90.35, 23.7] }}
                width={800}
                height={400}
                style={{ width: '100%', height: '100%' }}
              >
                <ZoomableGroup center={[90.35, 23.7]} zoom={1}>
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="var(--muted)"
                          stroke="var(--border)"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: 'none' },
                            hover: { outline: 'none', fill: 'var(--accent)' },
                            pressed: { outline: 'none' },
                          }}
                        />
                      ))
                    }
                  </Geographies>

                  {data.map((loc) => (
                    <Marker
                      key={loc.location}
                      coordinates={[loc.lng, loc.lat]}
                      onClick={() =>
                        router.push(`/jobs?location=${encodeURIComponent(loc.location)}&region=bangladesh`)
                      }
                      onMouseEnter={() => setHovered(loc.location)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <circle
                        r={bubbleRadius(loc.count)}
                        fill="#3b5bdb"
                        fillOpacity={0.35 + (loc.count / maxCount) * 0.45}
                        stroke="#3b5bdb"
                        strokeWidth={1.5}
                        className="cursor-pointer transition-all hover:fill-opacity-80"
                      />
                    </Marker>
                  ))}
                </ZoomableGroup>
              </ComposableMap>
            </div>

            {hoveredLoc && (
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border bg-card px-3 py-2 text-sm shadow-md">
                <p className="font-medium">{hoveredLoc.location}</p>
                <p className="text-muted-foreground">{hoveredLoc.count} jobs</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
