# Prueba Técnica Mobile - Ionic To-Do App

Aplicación desarrollada con Ionic + Angular para gestionar tareas, extendida con categorías, filtrado y feature flags usando Firebase Remote Config.

## 1. Funcionalidades implementadas

- Agregar nuevas tareas.
- Marcar tareas como completadas.
- Eliminar tareas.
- Crear, editar y eliminar categorías.
- Asignar categoría al crear cada tarea.
- Filtrar tareas por categoría.
- Feature flag con Firebase Remote Config para mostrar/ocultar tareas completadas.

## 2. Stack técnico

- Ionic 8
- Angular 20
- Firebase Remote Config (AngularFire)
- Cordova (Android)
- Capacitor (iOS)

## 3. Requisitos locales

- Node.js 18+ (recomendado LTS)
- npm 9+
- Ionic CLI
- Angular CLI
- Android Studio (para Android)
- Xcode + macOS (para build iOS firmado)

## 4. Instalación y ejecución

```bash
npm install
npm run start
```

## 5. Comandos de calidad

```bash
npm run lint
npm run build
npm run test
```

## 6. Build Android (Cordova)

```bash
npm run build
# Ejecutar una vez si la plataforma aún no existe
cordova platform add android
cordova build android
```

Salida esperada (según modo de compilación):

- APK debug: `platforms/android/app/build/outputs/apk/debug/*.apk`

## 7. Build iOS - estado actual

### Contexto técnico

En este repositorio, Android se compila con Cordova y iOS se maneja con Capacitor.

No fue posible completar un flujo iOS firmado en el entorno local por falta de:

- Equipo macOS
- Cuenta Apple Developer Platform

Por esta razón, el archivo IPA se generó con flujo de Capacitor en modo sin firma para demostrar empaquetado técnico de la app.

### Nota importante

Un IPA sin firma no es instalable en dispositivos iOS reales y no sustituye una distribución oficial (TestFlight/App Store).

## 8. Firebase y Remote Config

- Proyecto Firebase configurado en `src/environments/environment.ts` y `src/environments/environment.prod.ts`.
- Provider de Remote Config registrado en `src/main.ts`.
- Servicio de Remote Config implementado en `src/app/services/remote-config.ts`.
- Flag utilizado: `show_completed_tasks`.

### Demostración del feature flag

1. En Firebase Remote Config, ajustar `show_completed_tasks`:
   - `true`: muestra tareas completadas.
   - `false`: oculta tareas completadas.
2. Publicar cambios en Remote Config.
3. Abrir la app.
4. La pantalla de tareas aplica el valor del flag al cargar la configuración.

## 9. Mejoras de calidad y optimización aplicadas

### Calidad de código

- Refactor de inyección de dependencias para usar `inject()` en lugar de constructor injection (alineado con regla de lint de Angular moderno).
- Eliminación de ciclo de vida vacio en tabs.
- Activación de `ChangeDetectionStrategy.OnPush` en vistas principales para mejorar rendimiento y evitar renders innecesarios.

### Rendimiento

- Precálculo de mapa de categorías (`Map`) para acceso O(1) por `categoryId` en listado de tareas.
- Uso de `track` en listas de Angular para reducir trabajo de render al actualizar tareas/categorías.
- Cálculo de `visibleTasks` derivado de filtros para evitar trabajo repetido en plantilla.