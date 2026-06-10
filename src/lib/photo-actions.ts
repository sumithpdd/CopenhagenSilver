/**
 * Client-side download and print helpers for booth photos.
 */

export async function downloadImage(
  imageSrc: string,
  filename: string
): Promise<void> {
  if (imageSrc.startsWith('data:')) {
    triggerDownload(imageSrc, filename);
    return;
  }

  const response = await fetch(imageSrc);
  if (!response.ok) {
    throw new Error('Failed to fetch image for download');
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    triggerDownload(objectUrl, filename);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function triggerDownload(href: string, filename: string) {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface PrintPhotoOptions {
  code?: string;
  subtitle?: string;
  /** Show photo code footer — off by default for full-bleed photo prints. */
  showFooter?: boolean;
  /** Canon SELPHY CP1300 default media — 4×6 in (10×15 cm). */
  paperWidthIn?: number;
  paperHeightIn?: number;
}

/**
 * Print a single photo sized for Canon SELPHY CP1300 (4×6 postcard).
 * Uses object-fit: contain so the full image is visible — no head/side cropping.
 */
export function printPhoto(imageSrc: string, options: PrintPhotoOptions = {}) {
  const {
    code,
    subtitle,
    showFooter = false,
    paperWidthIn = 4,
    paperHeightIn = 6,
  } = options;

  const printWindow = window.open('', '_blank', 'height=900,width=1200');
  if (!printWindow) return;

  const footerHtml =
    showFooter && (code || subtitle)
      ? `
        <div class="footer">
          ${code ? `<p class="code">${escapeHtml(code)}</p>` : ''}
          ${
            subtitle
              ? `<p>${escapeHtml(subtitle)}</p>`
              : '<p>Sitecore Silver • 25 Years of Innovation • Copenhagen 2026</p>'
          }
        </div>
      `
      : '';

  const safeSrc = JSON.stringify(imageSrc);
  const footerHeight = showFooter ? '0.35in' : '0in';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Sitecore Silver${code ? ` - ${escapeHtml(code)}` : ''}</title>
        <style id="base-style">
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body {
            overflow: hidden;
            background: #fff;
          }
          .print-page {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #fff;
          }
          .photo-wrap {
            flex: 1 1 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            background: #fff;
            padding: 0.06in;
          }
          img {
            display: block;
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain;
            object-position: center center;
          }
          .footer {
            flex: 0 0 auto;
            width: 100%;
            padding: 0.04in 0.08in;
            text-align: center;
            background: #fff;
            color: #808080;
            font-family: Arial, sans-serif;
            font-size: 9pt;
          }
          .code { font-weight: bold; color: #a0a0a0; margin-bottom: 2px; }
        </style>
        <style id="page-style"></style>
      </head>
      <body>
        <div class="print-page">
          <div class="photo-wrap">
            <img id="photo" alt="AI Enhanced photo" />
          </div>
          ${footerHtml}
        </div>
        <script>
          (function () {
            var imageSrc = ${safeSrc};
            var paperW = ${paperWidthIn};
            var paperH = ${paperHeightIn};
            var footerH = ${JSON.stringify(footerHeight)};
            var img = document.getElementById('photo');
            var pageStyle = document.getElementById('page-style');

            function applyLayout(naturalW, naturalH) {
              var landscape = naturalW >= naturalH;
              var pageWidth = landscape ? paperH + 'in' : paperW + 'in';
              var pageHeight = landscape ? paperW + 'in' : paperH + 'in';

              pageStyle.textContent =
                '@page { size: ' + pageWidth + ' ' + pageHeight + '; margin: 0; }' +
                'html, body, .print-page { width: ' + pageWidth + '; height: ' + pageHeight + '; }' +
                '.photo-wrap { height: calc(' + pageHeight + ' - ' + footerH + '); }';

              img.style.maxWidth = 'calc(' + pageWidth + ' - 0.12in)';
              img.style.maxHeight = 'calc(' + pageHeight + ' - ' + footerH + ' - 0.12in)';
            }

            function runPrint() {
              window.print();
              window.addEventListener('afterprint', function () { window.close(); });
            }

            function onReady() {
              applyLayout(img.naturalWidth, img.naturalHeight);
              requestAnimationFrame(function () {
                requestAnimationFrame(runPrint);
              });
            }

            img.onload = onReady;
            img.onerror = runPrint;
            img.src = imageSrc;

            if (img.complete && img.naturalWidth) {
              onReady();
            }
          })();
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/** @deprecated Prefer printPhoto for booth prints. Kept for multi-image layouts. */
export function printImages(
  images: { src: string; label: string }[],
  footer: { code?: string; subtitle?: string }
) {
  if (images.length === 1) {
    printPhoto(images[0].src, {
      code: footer.code,
      subtitle: footer.subtitle,
      showFooter: Boolean(footer.code || footer.subtitle),
    });
    return;
  }

  const printWindow = window.open('', '_blank', 'height=900,width=1200');
  if (!printWindow) return;

  const imageBlocks = images
    .map(
      (img) => `
        <figure class="photo-block">
          <p class="label">${escapeHtml(img.label)}</p>
          <img src="${img.src}" alt="${escapeHtml(img.label)}" />
        </figure>
      `
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sitecore Silver${footer.code ? ` - ${escapeHtml(footer.code)}` : ''}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; background: white; color: #333; }
          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            padding: 24px;
            gap: 20px;
          }
          .photos {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 24px;
            width: 100%;
          }
          .photo-block {
            flex: 1 1 280px;
            max-width: 48%;
            text-align: center;
          }
          .label {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #666;
          }
          img {
            max-width: 100%;
            max-height: 70vh;
            object-fit: contain;
            border: 2px solid #c0c0c0;
          }
          .footer {
            margin-top: 16px;
            text-align: center;
            color: #808080;
            font-size: 13px;
          }
          .code { font-weight: bold; color: #a0a0a0; margin-bottom: 4px; }
          @media print {
            .container { padding: 12px; }
            img { max-height: 85vh; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="photos">${imageBlocks}</div>
          <div class="footer">
            ${footer.code ? `<p class="code">${escapeHtml(footer.code)}</p>` : ''}
            <p>${escapeHtml(footer.subtitle ?? 'Sitecore Silver • 25 Years of Innovation • Copenhagen 2026')}</p>
          </div>
        </div>
        <script>
          window.onload = () => {
            window.print();
            window.addEventListener('afterprint', () => window.close());
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
