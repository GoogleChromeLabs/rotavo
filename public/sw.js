// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var cacheName = 'rotavo-v20190623a';

// Cache a very basic selection of resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll([
        '/',
        '/main.js',
        '/img/icons/android-chrome-192x192.png',
        '/img/icons/android-chrome-512x512.png',
        '/img/icons/favicon-16x16.png',
        '/img/icons/favicon-32x32.png',
        '/favicon.ico',
        '/index.html',
        '/main.css',
      ]);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Clean out old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((existingCacheNames) => {
      return Promise.all(
        existingCacheNames.map((existingCacheName) => {
          if (existingCacheName !== cacheName) {
            return caches.delete(existingCacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
