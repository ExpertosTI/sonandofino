# Sonando Fino

Radio online · peticiones · offline · apps

## Web
Tema WordPress en hosting (`sonandofino.net`): reproductor, pedidos mcvhost, Guía DJ, Devocional, notas de voz, SEO.

## Apps (Android / iOS)
`apps/mobile` — Expo (React Native):

- Escuchar radio en vivo
- Pedir canciones (catálogo)
- Tracking de escucha (72 h **o** 3 días seguidos)
- **Offline** se desbloquea al cumplir la meta
- Descargas Devocional (marca sonandofino.net)
- Notas de voz
- Videos: **Coming soon**

### Desarrollo
```bash
cd apps/mobile
npm install
npx expo start
```

### Builds
```bash
npx eas build --platform android
npx eas build --platform ios
```

## Marca en biblioteca
Archivos del Devocional y tags “Video Oficial / Official Video” renombrados a títulos limpios + `sonandofino.net`.
