import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import { DEFAULT_COORDS } from '@/constants/prayers';
import { useUserStore } from '@/stores/useUserStore';
import { getPrayerTimesFor, type PrayerTimesMap } from '@/utils/prayerTimes';

export interface UsePrayerTimesResult {
  times: PrayerTimesMap | null;
  loading: boolean;
  locationLabel: string | null;
  refresh: () => Promise<void>;
}

function formatLabel(location: Location.LocationObject | null): string | null {
  if (!location) return null;
  const { latitude, longitude } = location.coords;
  return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
}

export function usePrayerTimes(): UsePrayerTimesResult {
  const profile = useUserStore((state) => state.profile);
  const patchProfile = useUserStore((state) => state.patchProfile);
  const [times, setTimes] = useState<PrayerTimesMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  const settings = profile?.prayerSettings;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!settings) {
        setLoading(false);
        return;
      }
      setLoading(true);
      let resolved = settings.location ? settings.location : DEFAULT_COORDS;
      try {
        if (!settings.location) {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const current = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            const label = formatLabel(current);
            setLocationLabel(label);
            resolved = {
              latitude: current.coords.latitude,
              longitude: current.coords.longitude,
              label: label ?? undefined,
            };
            if (!cancelled) {
              await patchProfile({ prayerSettings: { ...settings, location: resolved } });
            }
          }
        } else {
          setLocationLabel(settings.location.label ?? null);
        }
        if (!cancelled) {
          setTimes(getPrayerTimesFor(resolved, new Date(), settings));
        }
      } catch (error) {
        console.error('Failed to compute prayer times', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [settings, patchProfile]);

  const refresh = async () => {
    if (!settings) return;
    const coords = settings.location ?? DEFAULT_COORDS;
    setTimes(getPrayerTimesFor(coords, new Date(), settings));
    setLoading(false);
  };

  return { times, loading, locationLabel, refresh };
}