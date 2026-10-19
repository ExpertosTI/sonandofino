import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const STREAM = 'https://www.sonandofino.net/live/';
const WEB = 'https://www.sonandofino.net/';
const LISTEN_KEY = 'sf.v1.listen';

type ListenData = {
  seconds?: number;
  streak?: number;
  days?: Record<string, number>;
  offline?: boolean;
};

export default function App() {
  const sound = useRef<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [listen, setListen] = useState<ListenData>({});
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      const raw = await AsyncStorage.getItem(LISTEN_KEY);
      if (raw) setListen(JSON.parse(raw));
    })();
    return () => {
      sound.current?.unloadAsync();
      if (tick.current) clearInterval(tick.current);
    };
  }, []);

  const today = () => new Date().toISOString().slice(0, 10);

  const persistListen = async (next: ListenData) => {
    setListen(next);
    await AsyncStorage.setItem(LISTEN_KEY, JSON.stringify(next));
  };

  const accumulate = async () => {
    const day = today();
    const next: ListenData = {
      ...listen,
      seconds: (listen.seconds || 0) + 15,
      days: { ...(listen.days || {}) },
    };
    next.days![day] = (next.days![day] || 0) + 15;
    const days = Object.keys(next.days!).sort();
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if ((next.days![days[i]] || 0) >= 600) streak += 1;
      else break;
    }
    next.streak = streak;
    const hours = (next.seconds || 0) / 3600;
    if (hours >= 72 || streak >= 3) next.offline = true;
    await persistListen(next);
  };

  const toggle = async () => {
    if (playing && sound.current) {
      await sound.current.pauseAsync();
      setPlaying(false);
      if (tick.current) clearInterval(tick.current);
      return;
    }
    if (!sound.current) {
      const { sound: s } = await Audio.Sound.createAsync(
        { uri: STREAM },
        { shouldPlay: true, volume: 0.5 }
      );
      sound.current = s;
    } else {
      await sound.current.playAsync();
    }
    setPlaying(true);
    tick.current = setInterval(accumulate, 15000);
  };

  const hours = ((listen.seconds || 0) / 3600).toFixed(1);
  const offline = !!listen.offline;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.brand}>Sonando Fino</Text>
        <Text style={styles.live}>EN VIVO</Text>

        <Pressable style={styles.play} onPress={toggle} accessibilityRole="button">
          <Text style={styles.playText}>{playing ? 'Pausar' : 'Escuchar'}</Text>
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.h}>Pedir canciones</Text>
          <Text style={styles.p}>Abre el catálogo real en la web (mismo backend).</Text>
          <Pressable onPress={() => Linking.openURL(WEB)}>
            <Text style={styles.link}>Abrir pedidos →</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.h}>Modo offline</Text>
          <Text style={styles.p}>
            {offline
              ? 'Desbloqueado. Ya puedes descargar música Devocional.'
              : `${hours} h · racha ${listen.streak || 0}/3 · meta 72 h o 3 días`}
          </Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.min(
                    100,
                    Math.max(
                      ((listen.seconds || 0) / (72 * 3600)) * 100,
                      ((listen.streak || 0) / 3) * 100
                    )
                  )}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.h}>Videos</Text>
          <Text style={styles.badge}>Coming soon</Text>
          <Text style={styles.p}>Integración de videos cuando la app esté lista.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0e0a0c' },
  pad: { padding: 20, gap: 14 },
  brand: { color: '#f7f0e8', fontSize: 28, fontWeight: '700' },
  live: { color: '#ff6a3d', letterSpacing: 2, fontWeight: '700', fontSize: 12 },
  play: {
    backgroundColor: '#ff6a3d',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  playText: { color: '#1a0a06', fontWeight: '800', fontSize: 18 },
  card: {
    backgroundColor: '#1a1218',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  h: { color: '#f7f0e8', fontWeight: '700', fontSize: 16 },
  p: { color: 'rgba(247,240,232,0.7)', fontSize: 14, lineHeight: 20 },
  link: { color: '#ff9a62', fontWeight: '700', marginTop: 4 },
  badge: {
    alignSelf: 'flex-start',
    color: '#ff9a62',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  barTrack: {
    height: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginTop: 6,
  },
  barFill: { height: '100%', backgroundColor: '#ff6a3d' },
});
