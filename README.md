# 🎵 SpoPlayer Android

> Cliente móvil oficial de **SpoPlayer** para Android, impulsado por React, TypeScript y Capacitor.

<div align="center">
  <img src="src/assets/spoplayer-logo.png" width="120" alt="SpoPlayer Logo" />
  <p><strong>Tu reproductor de música libre y potente, ahora en tu bolsillo.</strong></p>
</div>

---

## ✨ Características

- 🎧 **Streaming sin interrupciones:** Integración con YouTube Music vía Innertube.
- 🌌 **Temas y Wallpapers Exclusivos:**
  - **Cosmos:** Vía Láctea y cielo estelar (Dorado/Ámbar `#F5A623`)
  - **Nébula:** Anillos planetarios y polvo cósmico (Rosa/Carmesí `#F43F5E`)
  - **Initial D:** AE86 Drifting Manga 1-Bit (Monocromo `#E8E2D8`)
  - **Neo Tokyo:** Atardecer Cyberpunk & Linternas (Rojo Neón `#FF3B30`)
- 🎚️ **Ecualizador de 10 bandas:** Ajuste personalizado del audio en tiempo real.
- ⚡ **Control de Velocidad:** Ajusta el tempo del playback a tu ritmo.
- 📱 **MediaSession en Segundo Plano:** Controla tu música desde la barra de notificaciones y la pantalla de bloqueo de Android.
- 🔒 **Sincronización:** Compatible con Supabase Auth o modo Invitado sin conexión.

---

## 🛠️ Desarrollo & Compilación

### Requisitos
- **Node.js** v20+
- **pnpm** v9+
- **Java JDK 17**
- **Android SDK** (API 24+)

### Comandos

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Compilar aplicación web
pnpm build

# Sincronizar con el proyecto Android nativo
pnpm exec cap sync android

# Generar APK en local (Debug)
cd android && ./gradlew assembleDebug
```

---

## 🚀 GitHub Actions CI/CD

El repositorio cuenta con compilación automatizada de APKs con cada tag de versión (`v*`). Cada release genera automáticamente el instalador `.apk` listo para descargar en tus dispositivos Android.
