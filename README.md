# L’Heure Dorée

Demo conceptual de una cafetería francesa, construida con React, Vite, GSAP y Lenis.

## Desarrollo local

```bash
npm ci
npm run dev
```

## Producción

```bash
npm run build
```

La salida estática se genera en `dist/`. Netlify usa la configuración de `netlify.toml` y Node 22. Al conectar el repositorio, el sitio puede desplegarse sin configurar manualmente el comando de build ni la carpeta de publicación.

Los pedidos y las reservas son parte de la demo visual. No envían datos a un servicio externo.
