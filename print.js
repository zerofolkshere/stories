  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[print="trigger"]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const menuWrap = trigger.closest('.home_menu_wrap');
        if (!menuWrap) return;

        const logo = menuWrap.querySelector('[print="logo"]');
        if (logo) logo.style.display = 'block';

        const printContent = menuWrap.cloneNode(true);

        // Remove the trigger button from the print version
        const clonedTrigger = printContent.querySelector('[print="trigger"]');
        if (clonedTrigger) clonedTrigger.remove();

        // Wrap the content in a container with max-width
        const wrapper = document.createElement('div');
        wrapper.style.maxWidth = '32rem';
        wrapper.style.margin = '0 auto';
        wrapper.appendChild(printContent);

        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';
        document.body.appendChild(printFrame);

        const doc = printFrame.contentDocument || printFrame.contentWindow.document;

        const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
          .map(tag => tag.outerHTML)
          .join('\n');

        doc.open();
        doc.write(`
          <html>
            <head>
              <title>Print</title>
              ${styleTags}
              <style>
                @page {
                  size: A4 portrait;
                  margin: 4rem 0;
                }
                @media print {
                  body {
                    margin: 0;
                    padding: 0;
                    background: white;
                  }
                }
              </style>
            </head>
            <body>${wrapper.outerHTML}</body>
          </html>
        `);
        doc.close();

        printFrame.onload = () => {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();

          setTimeout(() => {
            document.body.removeChild(printFrame);
            if (logo) logo.style.display = 'none';
          }, 1000);
        };
      });
    });
  });
