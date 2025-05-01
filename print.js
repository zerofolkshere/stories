document.addEventListener('DOMContentLoaded', () => {
  const isIOS       = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isMacSafari = /^((?!chrome|crios|fxios|edgios|edg|firefox|fx).)*safari/i.test(navigator.userAgent);

  /* helper → convert rem to px for the current page */
  const remToPx = rem => {
    const fs = parseFloat(getComputedStyle(document.documentElement).fontSize); // root font size
    return rem * fs;
  };

  document.querySelectorAll('[print="trigger"]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const menuWrap = trigger.closest('.home_menu_wrap');
      if (!menuWrap) return;

      /* 1 ▸ reveal logo so its height is included in the measurement */
      const logo = menuWrap.querySelector('[print="logo"]');
      if (logo) logo.style.display = 'block';

      /* 2 ▸ measure live element */
      const rect  = menuWrap.getBoundingClientRect();
      const pageW = 794  - 128;                     // A4 portrait @96 dpi minus horiz. margins
      const pageH = 1123 - 128;                     //                minus vert.  margins
      const maxW  = Math.min(pageW, remToPx(40));   // 40 rem cap, but never wider than page

      /* 3 ▸ choose zoom
             – base on height to fill the sheet
             – clamp so the *scaled* width ≤ maxW                         */
      let zoom = pageH / rect.height;
      if (zoom * rect.width > maxW) {
        zoom = maxW / rect.width;                   // shrink to honour width cap
      }
      const zoomPct = (zoom * 100).toFixed(2) + '%';

      /* 4 ▸ clone markup */
      const printContent  = menuWrap.cloneNode(true);
      printContent.querySelector('[print="trigger"]')?.remove();

      const wrapper = document.createElement('div');
      wrapper.style.margin   = '0 auto';
      wrapper.style.maxWidth = '40rem';             // logical width limit
      wrapper.appendChild(printContent);

      const styleTags = Array
        .from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(tag => tag.outerHTML)
        .join('\n');

      const htmlForPrint = `
        <html>
          <head>
            <title>Print</title>
            ${styleTags}
            <style>
              @page { size: A4 portrait; margin: 4rem 0; }
              @media print { body { margin:0; padding:0; background:#fff; } }
            </style>
          </head>
          <body style="zoom:${zoomPct};">${wrapper.outerHTML}</body>
        </html>`;

      /* 5 ▸ launch print (popup for Safari, hidden iframe otherwise) */
      const openAndPrint = win => {
        win.document.open();
        win.document.write(htmlForPrint);
        win.document.close();
        win.onload = () => { win.focus(); win.print(); if ('close' in win) win.close(); };
      };

      if (isIOS || isMacSafari) {
        const pop = window.open('', '_blank');
        if (!pop) { alert('Please allow pop-ups to print'); return; }
        openAndPrint(pop);
      } else {
        const frame = Object.assign(document.createElement('iframe'), {
          style:'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'
        });
        document.body.appendChild(frame);
        openAndPrint(frame.contentWindow);
        setTimeout(() => document.body.removeChild(frame), 1500);
      }

      /* 6 ▸ hide logo back on the live page */
      if (logo) logo.style.display = 'none';
    });
  });
});
