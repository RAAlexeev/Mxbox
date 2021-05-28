self.addEventListener('install', (event: ExtendableEvent) => {
    event.waitUntil(
      caches.open('v1').then((cache) => {
        return cache.addAll(
         
          [ '/',
            '/_redirects',
          '/service-worker.js',
            '/index.html',
          '/style.css',
          '/main.js',
          '/vendor.js',

        ].map(url => new Request(url, {credentials: 'same-origin'})));
      })
    );
  });