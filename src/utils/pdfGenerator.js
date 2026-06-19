import { inyectarEstilosImpresion } from './templateLoader';

export function descargarPDF(html, nombreArchivo) {
  const htmlConPrint = inyectarEstilosImpresion(html);

  const iframe = document.createElement('iframe');
  iframe.title = nombreArchivo;
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(htmlConPrint);
  doc.close();

  const cleanup = () => {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  };

  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error('descargarPDF: error al imprimir', err);
        alert('No se pudo abrir el diálogo de impresión. Probá de nuevo.');
        cleanup();
      }
      setTimeout(cleanup, 1000);
    }, 250);
  };
}
