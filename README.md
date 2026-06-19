# Editor de CV — Candela González

Mini app web (React + Vite) para editar datos de contacto, elegir entre 3 variantes de CV (Administrativa, Atención al Cliente, Comercial) y la carta de presentación, y descargar el resultado como PDF en una página A4.

## Stack

- Vite 8
- React 19
- JavaScript (sin TypeScript)
- CSS plano (sin Tailwind, MUI, etc.)
- Sin `react-to-print`, sin `jsPDF` — se usa `window.print()` dentro de un iframe

## Setup local

```bash
npm install
npm run dev
```

La app queda servida en `http://localhost:5173`.

Otros scripts:

- `npm run build` — genera los archivos estáticos en `dist/`.
- `npm run preview` — sirve localmente la build de producción.
- `npm run lint` — corre ESLint.

## Deploy a Vercel

1. Subí el repo a GitHub.
2. Entrá a [vercel.com](https://vercel.com) → "Add New Project" → "Project".
3. Importá el repo.
4. Vercel detecta Vite automáticamente. No toques nada en la sección "Build and Output Settings".
5. Click "Deploy". En ~1 minuto tenés la URL pública.

Cada `git push` redeplega automáticamente.

## Estructura del proyecto

```
candela-app/
├── public/
│   └── templates/                # Source of truth: HTMLs de los CVs y la carta
│       ├── cv-administrativa-recepcionista.html
│       ├── cv-atencion-cliente-customer-service.html
│       ├── cv-comercial-ventas-stock.html
│       └── carta-presentacion.html
├── src/
│   ├── components/
│   │   ├── ContactForm.jsx       # Form con nombre, título, tel, email, zona, LinkedIn
│   │   ├── CVSelector.jsx        # Radio buttons para elegir variante de CV
│   │   ├── CoverLetterEditor.jsx # Editor de placeholders de la carta + preview en vivo
│   │   └── PreviewPane.jsx       # Render del CV o carta en un iframe (srcdoc)
│   ├── hooks/
│   │   └── useLocalStorage.js    # Hook genérico para persistir estado en localStorage
│   ├── utils/
│   │   ├── date.js               # Helper para formatear fecha en español
│   │   ├── pdfGenerator.js       # descargarPDF(): crea iframe oculto y llama print()
│   │   └── templateLoader.js     # fetch + reemplazos de placeholders + CSS de impresión
│   ├── App.jsx                   # Orquesta todo, estado global + botón flotante PDF
│   ├── App.css                   # Estilos de la app
│   ├── index.css                 # Reset + variables CSS
│   └── main.jsx                  # Entry point de React
├── index.html                    # Shell HTML
└── package.json
```

## Cómo actualizar los templates

Los CVs y la carta viven en `public/templates/`. Si querés cambiar un texto, una experiencia, una fecha, etc.:

1. Editá el archivo correspondiente (`cv-administrativa-recepcionista.html`, etc.).
2. Commiteá el cambio.

> **Importante:** los archivos de `public/` se sirven tal cual desde la raíz. Si renombrás o agregás uno nuevo, reiniciá `npm run dev` para que Vite lo levante. En Vercel se sirve directo, sin reinicio.

La app lee estos HTMLs con `fetch()` desde `/templates/{nombre}.html`. **No** los importa como módulos.

## Notas técnicas

### ¿Por qué no hay `react-router`?

La app es una sola vista: form a la izquierda, preview a la derecha, botón flotante. No hay navegación entre páginas, así que agregar router sumaría complejidad sin beneficio.

### ¿Por qué no hay `jsPDF` ni `react-to-print`?

`window.print()` dentro de un iframe con `srcdoc` es:

- **Más simple**: 0 dependencias extra, ~40 líneas en `pdfGenerator.js`.
- **Mejor resultado**: usa el motor de impresión nativo del navegador, que respeta `@media print` y produce PDFs con tipografía y colores idénticos a la pantalla.
- **Lo que el usuario espera**: el diálogo del sistema operativo (en Windows: "Microsoft Print to PDF") le da control sobre dónde guardar y en qué formato.

`jsPDF` reconstruye el PDF en JS y suele perder calidad tipográfica. `react-to-print` es un wrapper de `window.print()` pero con más dependencias y menos control.

### localStorage: cómo resetear

Los datos se guardan en 3 keys:

- `candela-contact-data`
- `candela-cover-letter-data`
- `candela-selected-cv`

Para volver a los defaults, abrí la consola del navegador y ejecutá:

```js
localStorage.removeItem('candela-contact-data');
localStorage.removeItem('candela-cover-letter-data');
localStorage.removeItem('candela-selected-cv');
location.reload();
```

O desde DevTools → Application → Local Storage → click derecho en cada key → Delete.

## Errores comunes

- **"No se pudo cargar el template"** — la app no está corriendo en un servidor. Vite usa `fetch()` para leer `/templates/...`, y eso solo funciona en `http://`, no abriendo el `index.html` directo con `file://`. Usá siempre `npm run dev` o deployá.
- **El preview no se actualiza al escribir** — revisá la consola del navegador. Probablemente un error de fetch o un problema con el HTML del template (tags mal cerrados).
