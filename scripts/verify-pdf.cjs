#!/usr/bin/env node
// scripts/verify-pdf.cjs
// Verifica que los CVs renderizan a 1 sola pagina A4 con y sin foto.
//
// Salida: por cada template imprime cantidad de paginas y margen libre al fondo.

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { PDFParse } = require('pdf-parse');

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
];

function findChrome() {
  for (const p of CHROME_PATHS) {
    if (p && fs.existsSync(p)) return p;
  }
  throw new Error('No se encontro Chrome del sistema en los paths conocidos.');
}

// Imagen dummy 4:5 (proporcional al recorte 70pt x 87.5pt) inline.
// 300x375 JPG minimo valido (escala de grises).
const DUMMY_PHOTO_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AL+AAAAAAAAAAAH//Z';

const A4_HEIGHT_CM = 29.7;

const TEMPLATES = [
  { name: 'cv-administrativa-recepcionista', file: 'cv-administrativa-recepcionista.html' },
  { name: 'cv-atencion-cliente-customer-service', file: 'cv-atencion-cliente-customer-service.html' },
  { name: 'cv-comercial-ventas-stock', file: 'cv-comercial-ventas-stock.html' },
];

// Genera una variante del HTML con o sin foto hardcodeada.
function buildHtml(originalHtml, withPhoto) {
  let html = originalHtml;
  const fotoBlock = withPhoto
    ? `<img class="foto-perfil" src="${DUMMY_PHOTO_DATA_URL}" alt="Foto" />`
    : '';

  // Simulamos lo que hace el templateLoader real.
  const photoDivRegex = /<div class="cv-header-photo">[\s\S]*?<\/div>/;
  if (photoDivRegex.test(html)) {
    html = html.replace(photoDivRegex, `<div class="cv-header-photo">${fotoBlock}</div>`);
  } else {
    html = html.replace(/\{\{FOTO\}\}/g, fotoBlock);
  }
  return html;
}

async function measureContentHeight(page) {
  // Mide la altura del bloque .cv en pixeles CSS (96 DPI), incluyendo padding.
  return page.evaluate(() => {
    const cv = document.querySelector('.cv') || document.body;
    const rect = cv.getBoundingClientRect();
    return {
      contentHeightPx: rect.height,
    };
  });
}

function pxToCm(px) {
  // 96 DPI -> 1px = 0.75pt = 0.0264583 cm
  return px * 0.0264583;
}

async function renderOne(browser, template, withPhoto) {
  const htmlPath = path.resolve(__dirname, '..', 'public', 'templates', template.file);
  const originalHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = buildHtml(originalHtml, withPhoto);

  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const heightInfo = await measureContentHeight(page);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    });

    // Parsear PDF para contar paginas (pdf-parse v2 API)
    const parser = new PDFParse({ data: pdfBuffer });
    const info = await parser.getInfo();
    const pages = info.total;

    const contentCm = pxToCm(heightInfo.contentHeightPx);
    const freeCm = A4_HEIGHT_CM - contentCm;

    return {
      template: template.name,
      withPhoto,
      pages,
      contentHeightCm: contentCm.toFixed(2),
      freeMarginCm: freeCm.toFixed(2),
    };
  } finally {
    await page.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const onlyPhoto = args.includes('--with-photo');
  const onlyNoPhoto = args.includes('--no-photo');

  const chromePath = findChrome();
  console.log(`Usando Chrome: ${chromePath}\n`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files'],
  });

  const results = [];
  try {
    for (const template of TEMPLATES) {
      if (onlyNoPhoto || (!onlyPhoto && !onlyNoPhoto)) {
        const r = await renderOne(browser, template, false);
        results.push(r);
        console.log(
          `[SIN foto] ${r.template} -> ${r.pages} pag., ` +
          `altura contenido: ${r.contentHeightCm} cm, ` +
          `margen libre al fondo: ${r.freeMarginCm} cm`
        );
      }
      if (onlyPhoto || (!onlyPhoto && !onlyNoPhoto)) {
        const r = await renderOne(browser, template, true);
        results.push(r);
        console.log(
          `[CON foto] ${r.template} -> ${r.pages} pag., ` +
          `altura contenido: ${r.contentHeightCm} cm, ` +
          `margen libre al fondo: ${r.freeMarginCm} cm`
        );
      }
    }
  } finally {
    await browser.close();
  }

  console.log('\n=== RESUMEN ===');
  const fails = results.filter((r) => r.pages !== 1);
  if (fails.length === 0) {
    console.log('OK: Todos los casos entraron en 1 pagina A4.');
  } else {
    console.log('FALLO: Los siguientes casos ocupan mas de 1 pagina:');
    for (const f of fails) {
      console.log(`  - ${f.withPhoto ? 'CON foto' : 'SIN foto'} ${f.template}: ${f.pages} pag. (margen: ${f.freeMarginCm} cm)`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('ERROR:', err);
  process.exit(1);
});
