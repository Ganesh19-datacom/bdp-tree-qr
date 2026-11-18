(() => {
  const $ = id => document.getElementById(id);
  const plants = window.BDP_PLANTS || [];
  const base = new URL('.', location.href);
  const cacheName = 'bdp-offline-content-v1';
  const idFromUrl = value => {
    try {
      const u = new URL(value, location.href);
      const m = (u.pathname + ' ' + u.search).match(/bdp[-_](\\d{3})/i);
      return m ? 'BDP-' + m[1] : null;
    } catch { return null; }
  };
  const plantUrl = id => new URL('plants/' + id.toLowerCase() + '.html', base).href;
  const network = () => {
    const online = navigator.onLine;
    $('networkDot').classList.toggle('offline', !online);
    $('networkStatus').textContent = online ? 'Internet connection available' : 'No internet connection — offline mode';
  };
  const getCache = async () => ('caches' in window ? caches.open(cacheName) : null);
  const updateOfflineStatus = async () => {
    const cache = await getCache();
    let ready = false;
    if (cache) {
      const keys = await cache.keys();
      const required = ['index.html','styles.css','data.js','app.js'];
      const shellReady = required.every(p => keys.some(r => new URL(r.url).pathname.endsWith('/' + p)));
      const pageCount = plants.filter(p => keys.some(r => new URL(r.url).pathname.endsWith('/plants/' + p.id.toLowerCase() + '.html'))).length;
      ready = shellReady && plants.length > 0 && pageCount === plants.length;
    }
    $('offlineStatus').textContent = ready ? '✓ Offline data ready on this phone' : 'Offline data not downloaded';
    $('offlineStatus').classList.toggle('ready', ready);
    return ready;
  };
  const renderPlants = () => {
    $('plantCards').innerHTML = plants.map(p => `<a class="plant-card" href="plants/${p.id.toLowerCase()}.html"><img src="${p.image}" alt="${p.common}" loading="lazy"><div class="cardbody"><span class="id">${p.id}</span><h3>${p.common}</h3><div class="latin">${p.scientific}</div><p>${p.description.slice(0,112)}…</p><span class="read">View plant details →</span></div></a>`).join('');
  };
  const setProgress = (done,total,label) => {
    const pct = total ? Math.round(done / total * 100) : 0;
    $('progressBar').style.width = pct + '%';
    $('progressPercent').textContent = pct + '%';
    $('progressText').textContent = label || ('Saving ' + done + ' of ' + total);
  };
  const prepareOffline = async () => {
    if (!('serviceWorker' in navigator) || !('caches' in window)) {
      $('downloadMessage').textContent = 'This browser does not support offline storage required by BDP. Please use an updated Chrome, Edge or Safari browser.';
      return;
    }
    if (!navigator.onLine) {
      $('downloadMessage').textContent = 'Connect to the BDP entrance Wi-Fi with internet access before downloading the plant library.';
      return;
    }
    $('downloadBtn').disabled = true;
    $('progressWrap').hidden = false;
    $('downloadMessage').textContent = 'Please keep this page open while the app saves the plant library.';
    try {
      const registration = await navigator.serviceWorker.register(new URL('sw.js', base).href);
      await navigator.serviceWorker.ready;
      const cache = await caches.open(cacheName);
      const shell = ['index.html','styles.css','data.js','app.js','manifest.webmanifest','sw.js'];
      let done = 0; const total = shell.length + plants.length;
      for (const file of shell) {
        const url = new URL(file, base).href;
        const response = await fetch(url, {cache:'reload'});
        if (!response.ok) throw new Error('Could not download ' + file);
        await cache.put(url, response.clone()); done++; setProgress(done,total,'Saving app files');
      }
      for (const plant of plants) {
        const url = plantUrl(plant.id);
        const response = await fetch(url, {cache:'reload'});
        if (!response.ok) throw new Error('Plant page unavailable: ' + plant.id);
        await cache.put(url, response.clone()); done++; setProgress(done,total,'Saving plant profiles');
      }
      // Cache plant photographs when the image host permits it. Text profiles remain usable if a photo host blocks caching.
      let imagesSaved = 0;
      for (const plant of plants) {
        if (!plant.image) continue;
        try {
          const response = await fetch(plant.image, {mode:'no-cors',cache:'force-cache'});
          if (response && (response.type === 'opaque' || response.ok)) {
            await cache.put(plant.image, response.clone()); imagesSaved++;
          }
        } catch (e) { /* optional image cache; report below */ }
      }
      await updateOfflineStatus();
      setProgress(total,total,'Offline preparation complete');
      $('downloadMessage').textContent = 'Your phone has saved ' + plants.length + ' plant profiles. ' + imagesSaved + ' photographs were cached where the image host allowed it. You can now use the BDP app scanner without mobile data.';
      $('downloadBtn').textContent = '✓ Offline information saved';
    } catch (error) {
      $('downloadMessage').textContent = 'Download could not be completed: ' + error.message + '. Check the entrance Wi-Fi and try again.';
      $('progressText').textContent = 'Download incomplete';
    } finally { $('downloadBtn').disabled = false; }
  };
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); deferredPrompt = event; $('installBtn').hidden = false;
  });
  $('installBtn').addEventListener('click', async () => {
    if (!deferredPrompt) {
      $('downloadMessage').textContent = 'On iPhone: open this page in Safari, tap Share, then Add to Home Screen. On Android: use the browser menu and choose Install app or Add to Home screen.';
      return;
    }
    deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; $('installBtn').hidden = true;
  });
  $('downloadBtn').addEventListener('click', prepareOffline);
  renderPlants(); network(); updateOfflineStatus();
  window.addEventListener('online', network); window.addEventListener('offline', network);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register(new URL('sw.js', base).href).catch(()=>{});
  // QR camera: BarcodeDetector is supported by many Chromium browsers. If unavailable, the plant library remains available.
  let stream = null, scanLoop = false;
  $('scanBtn').addEventListener('click', async () => {
    if (!('BarcodeDetector' in window)) {
      $('scanMessage').textContent = 'QR camera scanning is not supported by this browser. Try Chrome on Android, or choose the plant from the library. An iPhone-compatible bundled scanner is required for full iOS support.';
      return;
    }
    try {
      const detector = new BarcodeDetector({formats:['qr_code']});
      stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
      $('cameraPreview').srcObject = stream; $('cameraPreview').hidden = false; await $('cameraPreview').play();
      $('scanBtn').hidden = true; $('stopScanBtn').hidden = false; $('scanMessage').textContent = 'Point the camera at a BDP tree QR code.';
      scanLoop = true;
      const scan = async () => {
        if (!scanLoop) return;
        try {
          const codes = await detector.detect($('cameraPreview'));
          if (codes.length) {
            const id = idFromUrl(codes[0].rawValue);
            const plant = plants.find(p => p.id === id);
            if (plant) { stopScanner(); location.href = plantUrl(id); return; }
            $('scanMessage').textContent = 'This QR code is not recognised in the current plant library.';
          }
        } catch (e) {}
        if (scanLoop) requestAnimationFrame(scan);
      };
      requestAnimationFrame(scan);
    } catch (error) { $('scanMessage').textContent = 'Could not start the camera: ' + error.message + '. Check camera permission and use HTTPS.'; }
  });
  const stopScanner = () => {
    scanLoop = false; if (stream) stream.getTracks().forEach(t=>t.stop()); stream = null;
    $('cameraPreview').hidden = true; $('scanBtn').hidden = false; $('stopScanBtn').hidden = true;
  };
  $('stopScanBtn').addEventListener('click', stopScanner);
  // A QR URL opened by the browser goes directly to its plant page. The service worker supplies the cached page offline.
  const id = idFromUrl(location.href);
  if (id && !navigator.onLine) $('downloadMessage').textContent = 'You are offline. BDP is using the saved plant information on this phone.';
})();