var cacheName = 'calc-pwa';
var filesToCache = [
  '/',
  '/index.html',

  // scripts
  '/static/dropzone.min.js',
  '/static/files.js',
  '/static/jquery-3.3.1.min.js',
  '/static/localforage.nopromises.min.js',
  '/static/staticCrypt.js',
  '/static/staticCrypt.wasm',
  '/static/sweetalert/sweetalert.css',
  '/static/sweetalert/sweetalert.min.js',
  '/static/bootstrap-3.3.7/dist/css/bootstrap.min.css',
  '/static/bootstrap-3.3.7/dist/css/bootstrap.min.css.map',
  '/static/bootstrap-3.3.7/dist/fonts/glyphicons-halflings-regular.eot',
  '/static/bootstrap-3.3.7/dist/fonts/glyphicons-halflings-regular.svg',
  '/static/bootstrap-3.3.7/dist/fonts/glyphicons-halflings-regular.ttf',
  '/static/bootstrap-3.3.7/dist/fonts/glyphicons-halflings-regular.woff',
  '/static/bootstrap-3.3.7/dist/fonts/glyphicons-halflings-regular.woff2',
  '/static/bootstrap-3.3.7/dist/js/bootstrap.min.js',
  '/static/bootstrap-3.3.7/dist/js/npm.js',
  '/static/loading.css',
  '/static/index.css',
  '/static/globals.js',
  '/static/index.js',
  '',
  
  // fonts
  '/static/fonts/SFNSDisplay-Light.otf',

  // themes
  '/static/themes/animals-fox.css',
  '/static/themes/animals-lepard.css',
  '/static/themes/animals-lion2.css',
  '/static/themes/animals-lion3.css',
  '/static/themes/animals-lion.css',
  '/static/themes/art-bike.css',
  '/static/themes/art-black-n-blue.css',
  '/static/themes/art-colors.css',
  '/static/themes/art-hearts.css',
  '/static/themes/art-monkey.css',
  '/static/themes/art-pingu.css',
  '/static/themes/base.css',
  '/static/themes/kali-black.css',
  '/static/themes/kali-grey.css',
  '/static/themes/kali-red.css',
  '/static/themes/nature-calm-water.css',
  '/static/themes/nature-clear-droplet.css',
  '/static/themes/nature-dark-tree.css',
  '/static/themes/nature-dna.css',
  '/static/themes/nature-droplets.css',
  '/static/themes/nature-mountain.css',
  '/static/themes/other-hitman.css',
  '/static/themes/space-astronaut.css',
  '/static/themes/space-dark-galaxy.css',


  // icons & assets
  '/static/icons/audio.png',
  '/static/icons/hearts.png',
  '/static/icons/camera.png',
  '/static/icons/gallery.png',
  '/static/icons/video.png',

  // emojis. these would be put in a loop butwe cant be sure if a number
  // is missing an emoji and is this were the case then our service 
  // worker cache would fail as its an all-or-nothing algorithm
  '/static/emoji/100.png',  '/static/emoji/101.png',  '/static/emoji/102.png',
  '/static/emoji/103.png',  '/static/emoji/104.png',  '/static/emoji/105.png',
  '/static/emoji/106.png',  '/static/emoji/107.png',  '/static/emoji/108.png',
  '/static/emoji/109.png',  '/static/emoji/10.png',  '/static/emoji/110.png',
  '/static/emoji/111.png',  '/static/emoji/112.png',  '/static/emoji/113.png',
  '/static/emoji/114.png',  '/static/emoji/115.png',  '/static/emoji/116.png',
  '/static/emoji/117.png',  '/static/emoji/118.png',  '/static/emoji/11.png',
  '/static/emoji/12.png',  '/static/emoji/13.png',  '/static/emoji/14.png',
  '/static/emoji/15.png',  '/static/emoji/16.png',  '/static/emoji/17.png',
  '/static/emoji/18.png',  '/static/emoji/19.png',  '/static/emoji/1.png',
  '/static/emoji/20.png',  '/static/emoji/21.png',  '/static/emoji/22.png',
  '/static/emoji/23.png',  '/static/emoji/24.png',  '/static/emoji/25.png',
  '/static/emoji/26.png',  '/static/emoji/27.png',  '/static/emoji/28.png',
  '/static/emoji/29.png',  '/static/emoji/2.png',  '/static/emoji/30.png',
  '/static/emoji/31.png',  '/static/emoji/32.png',  '/static/emoji/33.png',
  '/static/emoji/34.png',  '/static/emoji/35.png',  '/static/emoji/36.png',
  '/static/emoji/37.png',  '/static/emoji/38.png',  '/static/emoji/39.png',
  '/static/emoji/3.png',  '/static/emoji/40.png',  '/static/emoji/41.png',
  '/static/emoji/42.png',  '/static/emoji/43.png',  '/static/emoji/44.png',
  '/static/emoji/45.png',  '/static/emoji/46.png',  '/static/emoji/47.png',
  '/static/emoji/48.png',  '/static/emoji/49.png',  '/static/emoji/4.png',
  '/static/emoji/50.png',  '/static/emoji/51.png',  '/static/emoji/52.png',
  '/static/emoji/53.png',  '/static/emoji/54.png',  '/static/emoji/55.png',
  '/static/emoji/56.png',  '/static/emoji/57.png',  '/static/emoji/58.png',
  '/static/emoji/59.png',  '/static/emoji/5.png',  '/static/emoji/60.png',
  '/static/emoji/61.png',  '/static/emoji/62.png',  '/static/emoji/63.png',
  '/static/emoji/64.png',  '/static/emoji/65.png',  '/static/emoji/66.png',
  '/static/emoji/67.png',  '/static/emoji/68.png',  '/static/emoji/69.png',
  '/static/emoji/6.png',  '/static/emoji/70.png',  '/static/emoji/71.png',
  '/static/emoji/72.png',  '/static/emoji/73.png',  '/static/emoji/74.png',
  '/static/emoji/75.png',  '/static/emoji/76.png',  '/static/emoji/77.png',
  '/static/emoji/78.png',  '/static/emoji/79.png',  '/static/emoji/7.png',
  '/static/emoji/80.png',  '/static/emoji/81.png',  '/static/emoji/82.png',
  '/static/emoji/83.png',  '/static/emoji/84.png',  '/static/emoji/85.png',
  '/static/emoji/86.png',  '/static/emoji/87.png',  '/static/emoji/88.png',
  '/static/emoji/89.png',  '/static/emoji/8.png',  '/static/emoji/90.png',
  '/static/emoji/91.png',  '/static/emoji/92.png',  '/static/emoji/93.png',
  '/static/emoji/94.png',  '/static/emoji/95.png',  '/static/emoji/96.png',
  '/static/emoji/97.png',  '/static/emoji/98.png',  '/static/emoji/99.png',
  '/static/emoji/9.png',

  // backgrounds
  '/static/backgrounds/Animals/fox.jpg',
  '/static/backgrounds/Animals/leopard.jpg',
  '/static/backgrounds/Animals/lion2.jpg',
  '/static/backgrounds/Animals/lion3.jpg',
  '/static/backgrounds/Animals/lion.jpg',
  '/static/backgrounds/Art/art2.jpg',
  '/static/backgrounds/Art/art.jpg',
  '/static/backgrounds/Art/bg1.jpg',
  '/static/backgrounds/Art/black-n-blue.jpg',
  '/static/backgrounds/Art/colors.jpg',
  '/static/backgrounds/Art/hearts2.jpg',
  '/static/backgrounds/Art/pingu-art.jpg',
  '/static/backgrounds/Kali/kali1.png',
  '/static/backgrounds/Kali/kali3.png',
  '/static/backgrounds/Kali/kali4.jpg',
  '/static/backgrounds/Nature/calm-water.jpg',
  '/static/backgrounds/Nature/clear-droplets.jpg',
  '/static/backgrounds/Nature/dark-tree.jpg',
  '/static/backgrounds/Nature/dna.jpg',
  '/static/backgrounds/Nature/droplets.jpg',
  '/static/backgrounds/Nature/mountain.jpg',
  '/static/backgrounds/Other/hitman.jpg',
  '/static/backgrounds/Space/astronaut.jpg',
  '/static/backgrounds/Space/dark-galaxy.jpg',

];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
  self.skipWaiting();
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
