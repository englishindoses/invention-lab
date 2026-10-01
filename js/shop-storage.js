// Separate from student progress: each profile owns one atomic shop snapshot.
Lab.shopStorage = (() => {
  const maxImageBytes = 8 * 1024 * 1024;
  const maxBackupBytes = 100 * 1024 * 1024;
  const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  let database;
  function open() {
    if (!database) database = new Promise((resolve, reject) => {
      const request = indexedDB.open('invention-lab-shops', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('shops', { keyPath: 'profileId' });
      request.onsuccess = () => {
        request.result.onversionchange = () => { request.result.close(); database = null; };
        resolve(request.result);
      };
      request.onerror = () => { database = null; reject(new Error('Shop storage could not be opened. Your existing progress is unchanged.')); };
      request.onblocked = () => reject(new Error('Close other game tabs and try again to open shop storage.'));
    });
    return database;
  }
  async function load(profileId) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const request = db.transaction('shops').objectStore('shops').get(profileId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('Your shop could not be read. Try reloading.'));
    });
  }
  async function save(profileId, items, revision = 0) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('shops', 'readwrite');
      const store = transaction.objectStore('shops');
      let conflict = false;
      const request = store.get(profileId);
      request.onsuccess = () => {
        if ((request.result?.revision || 0) !== revision) { conflict = true; transaction.abort(); return; }
        store.put({ profileId, items, revision: revision + 1 });
      };
      transaction.oncomplete = () => resolve(revision + 1);
      transaction.onabort = transaction.onerror = () => reject(new Error(conflict
        ? 'This shop changed in another tab. Reload before editing again.'
        : 'The shop could not be saved. Browser storage may be full or unavailable. Your previous shop is unchanged.'));
    });
  }
  async function validateImage(blob) {
    if (!imageTypes.includes(blob.type) || blob.size === 0 || blob.size > maxImageBytes) throw new Error('Choose a PNG, JPEG, WebP, or GIF image up to 8 MB.');
    const url = URL.createObjectURL(blob);
    try {
      const image = new Image(); image.src = url;
      await image.decode();
      if (image.naturalWidth * image.naturalHeight > 40000000) throw new Error('Image dimensions are too large. Use an image under 40 megapixels.');
    } catch (error) {
      throw new Error(error.message.includes('megapixels') ? error.message : 'This file could not be opened as an image.');
    } finally { URL.revokeObjectURL(url); }
    return blob;
  }
  const toDataUrl = blob => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Image could not be included in the backup.'));
    reader.readAsDataURL(blob);
  });
  async function prepareImage(blob) {
    await validateImage(blob);
    // Keep animated GIFs intact. All images use contain sizing in the shop.
    if (blob.type === 'image/gif') return blob;
    const url = URL.createObjectURL(blob);
    try {
      const image = new Image(); image.src = url; await image.decode();
      const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let left = canvas.width, top = canvas.height, right = -1, bottom = -1;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          if (pixels[(y * canvas.width + x) * 4 + 3] > 0) {
            left = Math.min(left, x); right = Math.max(right, x);
            top = Math.min(top, y); bottom = Math.max(bottom, y);
          }
        }
      }
      if (right < 0) throw new Error('This image is completely transparent. Choose an image with a visible invention.');
      if (left === 0 && top === 0 && right === canvas.width - 1 && bottom === canvas.height - 1) return blob;
      const cropped = document.createElement('canvas');
      cropped.width = right - left + 1; cropped.height = bottom - top + 1;
      cropped.getContext('2d').drawImage(canvas, left, top, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
      const result = await new Promise(resolve => cropped.toBlob(resolve, 'image/png'));
      if (!result || result.size > maxImageBytes) return blob;
      return result;
    } finally { URL.revokeObjectURL(url); }
  }
  async function exportBackup(items, inventorName) {
    const backup = { format: 'invention-lab-shop', version: 1, inventorName, items: [] };
    let estimatedBytes = 0;
    for (const item of items) {
      let blob = item.blob;
      if (!blob) {
        const response = await fetch(item.image);
        if (!response.ok) throw new Error(`Could not read ${item.name}. No backup was created.`);
        blob = await response.blob();
        // Older local servers may supply PNGs as text/plain. The supplied
        // catalog uses trusted local paths; normalize their known file types.
        if (!imageTypes.includes(blob.type)) {
          const extension = item.image.split('.').pop().toLowerCase();
          const type = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' }[extension];
          if (type) blob = new Blob([blob], { type });
        }
      }
      await validateImage(blob);
      estimatedBytes += Math.ceil(blob.size / 3) * 4 + 1024;
      if (estimatedBytes > maxBackupBytes) throw new Error('This shop is too large for one backup (maximum 100 MB).');
      backup.items.push({ name: item.name, slot: item.slot, page: item.page || 1, image: await toDataUrl(blob) });
    }
    const file = new Blob([JSON.stringify(backup)], { type: 'application/json' });
    if (file.size > maxBackupBytes) throw new Error('This shop is too large for one backup (maximum 100 MB).');
    return file;
  }
  async function importBackup(file, validSlots) {
    if (!file || file.size > maxBackupBytes) throw new Error('Choose a shop backup up to 100 MB.');
    let data;
    try { data = JSON.parse(await file.text()); } catch { throw new Error('This file is not a valid shop backup.'); }
    if (data?.format !== 'invention-lab-shop' || data.version !== 1 || !Array.isArray(data.items) || data.items.length > 100) throw new Error('This file is not a supported shop backup (maximum 100 items).');
    const items = [];
    const occupied = new Set();
    for (const item of data.items) {
      if (!item || typeof item.name !== 'string' || !item.name.trim() || item.name.length > 80 || !validSlots.includes(item.slot) ||
        !Number.isInteger(item.page) || item.page < 1 || item.page > 100 || typeof item.image !== 'string' ||
        !/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+=*$/.test(item.image)) throw new Error('The backup contains an invalid item, image, or shelf. Nothing was imported.');
      const position = `${item.page}:${item.slot}`;
      if (occupied.has(position)) throw new Error('The backup places two items on the same shelf. Nothing was imported.');
      occupied.add(position);
      const [header, encoded] = item.image.split(',');
      let bytes;
      try { bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0)); } catch { throw new Error('The backup contains an invalid image.'); }
      const blob = new Blob([bytes], { type: header.slice(5, header.indexOf(';')) });
      await validateImage(blob);
      items.push({ id: crypto.randomUUID(), name: item.name.trim(), slot: item.slot, page: item.page, blob });
    }
    return items;
  }
  return { load, save, validateImage, prepareImage, exportBackup, importBackup };
})();
