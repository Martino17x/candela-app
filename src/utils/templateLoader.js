export async function cargarTemplate(nombreArchivo) {
  const url = `${import.meta.env.BASE_URL}templates/${nombreArchivo}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`No se pudo cargar ${nombreArchivo} (HTTP ${res.status})`);
  }
  return await res.text();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function aplicarReemplazosCV(html, datos) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const h1 = doc.querySelector('h1');
  if (h1 && datos.nombre) {
    h1.textContent = datos.nombre;
  }

  const titulo = doc.querySelector('.titulo-profesional');
  if (titulo && datos.tituloProfesional) {
    titulo.textContent = datos.tituloProfesional;
  }

  const contacto = doc.querySelector('.datos-contacto');
  if (contacto) {
    contacto.innerHTML = '';
    contacto.appendChild(doc.createTextNode(datos.zona || ''));
    contacto.appendChild(doc.createElement('br'));

    const sep1 = doc.createElement('span');
    sep1.className = 'sep';
    sep1.textContent = '|';
    contacto.appendChild(sep1);
    contacto.appendChild(doc.createTextNode(' ' + (datos.email || '')));
    contacto.appendChild(doc.createElement('br'));

    const sep2 = doc.createElement('span');
    sep2.className = 'sep';
    sep2.textContent = '|';
    contacto.appendChild(sep2);
    contacto.appendChild(doc.createTextNode(' ' + (datos.telefono || '')));

    if (datos.linkedin && datos.linkedin.trim()) {
      contacto.appendChild(doc.createElement('br'));
      const link = doc.createElement('a');
      link.href = datos.linkedin.startsWith('http') ? datos.linkedin : `https://${datos.linkedin}`;
      link.textContent = datos.linkedin;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      contacto.appendChild(link);
    }
  }

  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
}

export function aplicarReemplazosCarta(html, datosContacto, datosCarta) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  doc.querySelectorAll('.remitente, .firma').forEach((bloque) => {
    const strong = bloque.querySelector('strong');
    if (strong && datosContacto.nombre) {
      strong.textContent = datosContacto.nombre;
    }

    const children = Array.from(bloque.childNodes);
    for (const node of children) {
      if (node.nodeType === Node.TEXT_NODE) {
        const txt = node.textContent;
        if (txt.includes('@') || txt.includes('3549') || /Capital|General Paz/i.test(txt)) {
          const lines = [];
          if (datosContacto.zona) lines.push(datosContacto.zona);
          if (datosContacto.email) lines.push(datosContacto.email);
          if (datosContacto.telefono) lines.push(datosContacto.telefono);
          if (datosContacto.linkedin && datosContacto.linkedin.trim()) {
            lines.push(datosContacto.linkedin);
          }
          const frag = doc.createDocumentFragment();
          lines.forEach((line, idx) => {
            if (idx > 0) frag.appendChild(doc.createElement('br'));
            frag.appendChild(doc.createTextNode(line));
          });
          bloque.replaceChild(frag, node);
          break;
        }
      }
    }
  });

  let result = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;

  for (const [key, value] of Object.entries(datosCarta)) {
    if (value && String(value).trim()) {
      const safe = escapeHtml(value);
      const spanRegex = new RegExp(
        String.raw`<span class="placeholder">\{\{${escapeRegex(key)}\}\}</span>`,
        'g'
      );
      result = result.replace(spanRegex, safe);
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(escapeRegex(placeholder), 'g'), safe);
    }
  }

  return result;
}

export function inyectarEstilosImpresion(html) {
  const printCss = `@media print {
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff !important; }
  body { font-size: 10pt; }
  .guia { display: none !important; }
}`;
  if (html.includes('</head>')) {
    return html.replace('</head>', `<style>${printCss}</style></head>`);
  }
  if (html.includes('</style>')) {
    return html.replace('</style>', `</style><style>${printCss}</style>`);
  }
  return `<style>${printCss}</style>${html}`;
}

export async function generarHTMLActual(modo, selectedCV, datosContacto, datosCarta) {
  if (modo === 'cv') {
    const raw = await cargarTemplate(`${selectedCV}.html`);
    return aplicarReemplazosCV(raw, datosContacto);
  }
  const raw = await cargarTemplate('carta-presentacion.html');
  return aplicarReemplazosCarta(raw, datosContacto, datosCarta);
}

export function nombreArchivoSugerido(modo, selectedCV, datosCarta) {
  if (modo === 'carta') {
    const empresa = (datosCarta.empresa || 'empresa').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `carta-presentacion-${empresa}.pdf`;
  }
  const mapa = {
    'cv-administrativa-recepcionista': 'cv-administrativa-recepcionista',
    'cv-atencion-cliente-customer-service': 'cv-atencion-cliente',
    'cv-comercial-ventas-stock': 'cv-comercial-ventas-stock',
  };
  return `${mapa[selectedCV] || 'cv'}.pdf`;
}
