(() => {
  // Shelf rectangles use the original artwork coordinates. The viewport-sized
  // stage scales and offsets them together with the full-page background.
  const displays = [
    ['1', 174, 170, 174, 330],
    ['2', 401, 156, 140, 90], ['3', 579, 156, 141, 90],
    ['4A', 756, 156, 64, 90], ['4B', 851, 156, 63, 90],
    ['5', 953, 156, 141, 90], ['6', 1140, 156, 130, 90],
    ['7', 1326, 170, 174, 330],
    ['8', 401, 287, 140, 218], ['9', 579, 287, 141, 90],
    ['10A', 756, 287, 64, 90], ['10B', 851, 287, 63, 90],
    ['11', 953, 287, 141, 90], ['12', 1140, 287, 130, 90],
    ['14', 579, 420, 141, 85],
    ['15A', 756, 420, 64, 85], ['15B', 851, 420, 63, 85],
    ['16', 953, 420, 141, 85], ['17', 1140, 420, 130, 85],
    // Four independent deeper counter bays, matching the new artwork.
    ['26', 183, 566, 290, 117], ['27', 532, 566, 273, 117],
    ['28', 873, 566, 263, 117], ['29', 1210, 566, 279, 117]
  ];
  let page = 1;
  let inventorName = null;
  let profileId = null;
  let items = [];
  let revision = 0;
  let loading = false;
  let pending = false;
  let storageReady = false;
  let loadToken = 0;
  let editingId = null;
  let operationToken = 0;
  const imageUrls = [];
  const fittedImages = new WeakMap();
  const $ = selector => document.querySelector(selector);
  const slotIdFor = number => `display-${number.toLowerCase().padStart(2, '0')}`;
  const validSlots = displays.map(([number]) => slotIdFor(number));
  const pageCount = () => Math.max(1, ...items.map(item => item.page || 1));
  const message = text => { $('#shop-status').textContent = text; };
  function updateControls() {
    $('#shop-add').disabled = !profileId || !storageReady || loading || pending;
    $('#shop-import').disabled = $('#shop-add').disabled;
    $('#shop-export').disabled = !profileId || loading || pending;
    $$('#shop-editor button, #shop-editor input, #shop-editor select, #shop-import-dialog button, #shop-import-dialog input').forEach(el => { el.disabled = pending; });
  }
  function $$(selector) { return [...document.querySelectorAll(selector)]; }
  function renderShop() {
    imageUrls.splice(0).forEach(url => URL.revokeObjectURL(url));
    page = Math.min(page, pageCount());
    const slots = document.querySelector('#shop-slots');
    slots.replaceChildren(...displays.map(([slotNumber, x, y, width, height]) => {
      const slotId = slotIdFor(slotNumber);
      const item = items.find(item => item.slot === slotId && (item.page || 1) === page);
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = 'shop-slot';
      if (Number(slotNumber) >= 26) slot.classList.add('shop-counter-slot');
      slot.dataset.slot = slotId;
      slot.style.cssText = `left:${x / 1672 * 100}%;top:${y / 941 * 100}%;width:${width / 1672 * 100}%;height:${height / 941 * 100}%;`;
      const placeholder = document.createElement('span');
      placeholder.className = 'shop-placeholder';
      placeholder.textContent = String(slotNumber);
      placeholder.setAttribute('aria-hidden', 'true');
      slot.setAttribute('aria-label', item ? `Edit ${item.name}, shelf ${slotNumber}` : `Add item to shelf ${slotNumber}`);
      slot.title = item ? `${item.name} — click to edit` : `Add item to shelf ${slotNumber}`;
      slot.addEventListener('click', () => openEditor(item, slotId));
      slot.append(placeholder);
      if (item) {
        const image = document.createElement('img');
        image.alt = item.name;
        image.addEventListener('load', () => { placeholder.hidden = true; slot.classList.add('has-item'); });
        image.addEventListener('error', () => { image.hidden = true; slot.title = `${item.name} — image unavailable`; });
        if (item.blob) { image.src = URL.createObjectURL(fittedImages.get(item.blob) || item.blob); imageUrls.push(image.src); }
        else image.src = item.image;
        slot.append(image);
      }
      return slot;
    }));
    document.querySelector('.shop-pagination').hidden = pageCount() <= 1;
    document.querySelector('#shop-page').textContent = `Shelves ${page} of ${pageCount()}`;
    document.querySelector('#shop-previous').disabled = page === 1;
    document.querySelector('#shop-next').disabled = page === pageCount();
    updateControls();
  }
  async function loadShop(id, name) {
    const token = ++loadToken;
    profileId = id; inventorName = name; revision = 0; page = 1;
    items = Lab.shopItems.filter(item => name && item.owner?.trim().toLowerCase() === name.trim().toLowerCase())
      .map((item, index) => ({ ...item, id: `supplied-${index}`, page: item.page || 1 }));
    storageReady = false; loading = Boolean(id);
    $('#shop-editor').close(); $('#shop-import-dialog').close();
    message(id ? 'Opening your shop…' : ''); renderShop();
    if (!id) return;
    try {
      const saved = await Lab.shopStorage.load(id);
      if (token !== loadToken) return;
      if (saved) {
        // Improve Fit for earlier uploads without rewriting their saved images.
        for (const item of saved.items) {
          if (token !== loadToken) return;
          if (item.blob) {
            try { fittedImages.set(item.blob, await Lab.shopStorage.prepareImage(item.blob)); }
            catch { /* Keep the original available if it cannot be processed. */ }
          }
        }
        if (token !== loadToken) return;
        items = saved.items; revision = saved.revision;
      }
      storageReady = true; message('Saved on this browser');
    } catch (error) { if (token === loadToken) message(error.message); }
    finally { if (token === loadToken) { loading = false; renderShop(); } }
  }
  function fillShelves(selectedSlot, selectedPage) {
    $('#shop-item-slot').replaceChildren(...displays.map(([number]) => {
      const option = document.createElement('option'); option.value = slotIdFor(number); option.textContent = number;
      option.disabled = items.some(item => item.id !== editingId && item.slot === option.value && item.page === selectedPage);
      return option;
    }));
    const available = [...$('#shop-item-slot').options].find(option => option.value === selectedSlot && !option.disabled) || [...$('#shop-item-slot').options].find(option => !option.disabled);
    $('#shop-item-slot').value = available?.value || '';
  }
  function openEditor(item, requestedSlot) {
    if (!profileId || !storageReady || loading || pending) return;
    editingId = item?.id || null;
    $('#shop-item-form').reset();
    $('#shop-editor-title').textContent = item ? 'Edit Item' : 'Add Item';
    $('#shop-item-name').value = item?.name || '';
    $('#shop-item-image').required = !item;
    $('#shop-item-page').value = item?.page || page;
    $('#shop-item-remove').hidden = !item;
    $('#shop-editor-status').textContent = '';
    fillShelves(item?.slot || requestedSlot, Number($('#shop-item-page').value));
    $('#shop-editor').showModal();
  }
  async function commit(nextItems, originalProfile) {
    if (profileId !== originalProfile || operationToken !== loadToken) throw new Error('The active inventor changed. Open their shop again.');
    const nextRevision = await Lab.shopStorage.save(originalProfile, nextItems, revision);
    if (profileId === originalProfile) { items = nextItems; revision = nextRevision; renderShop(); message('Saved on this browser'); }
  }
  async function perform(action, statusSelector) {
    if (pending || loading || !profileId) return;
    operationToken = loadToken;
    pending = true; updateControls();
    try { await action(); }
    catch (error) { $(statusSelector).textContent = error.message || 'This operation could not be completed.'; }
    finally { pending = false; updateControls(); }
  }
  $('#shop-add').addEventListener('click', () => openEditor());
  $('#shop-editor-close').addEventListener('click', () => $('#shop-editor').close());
  $('#shop-item-page').addEventListener('input', () => fillShelves($('#shop-item-slot').value, Number($('#shop-item-page').value)));
  $('#shop-item-form').addEventListener('submit', event => {
    event.preventDefault();
    const originalProfile = profileId;
    const existing = items.find(item => item.id === editingId);
    const name = $('#shop-item-name').value.trim();
    const slot = $('#shop-item-slot').value;
    const targetPage = Number($('#shop-item-page').value);
    const file = $('#shop-item-image').files[0];
    perform(async () => {
      if (!name || name.length > 80 || !validSlots.includes(slot) || !Number.isInteger(targetPage) || targetPage < 1 || targetPage > 100) throw new Error('Enter a name and choose an available shelf and page.');
      if (!existing && items.length >= 100) throw new Error('This shop has reached its limit of 100 items.');
      if (items.some(item => item.id !== existing?.id && item.slot === slot && item.page === targetPage)) throw new Error('That shelf already has an item. Choose another shelf.');
      const item = { ...existing, id: existing?.id || crypto.randomUUID(), name, slot, page: targetPage };
      if (file) { item.blob = await Lab.shopStorage.prepareImage(file); delete item.image; }
      else if (!existing) throw new Error('Choose an image for this invention.');
      await commit([...items.filter(other => other.id !== item.id), item], originalProfile);
      if (profileId === originalProfile) { page = targetPage; renderShop(); $('#shop-editor').close(); }
    }, '#shop-editor-status');
  });
  $('#shop-item-remove').addEventListener('click', () => {
    const originalProfile = profileId;
    const nextItems = items.filter(item => item.id !== editingId);
    perform(async () => { await commit(nextItems, originalProfile); if (profileId === originalProfile) $('#shop-editor').close(); }, '#shop-editor-status');
  });
  function download(blob, filename) {
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = filename; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  $('#shop-export').addEventListener('click', () => {
    const snapshot = [...items]; const name = inventorName;
    perform(async () => {
      message('Creating backup…');
      const blob = await Lab.shopStorage.exportBackup(snapshot, name);
      download(blob, `invention-shop-${name.replace(/[^a-z0-9]/gi, '') || 'inventor'}.json`);
      message('Shop backup downloaded');
    }, '#shop-status');
  });
  $('#shop-import').addEventListener('click', () => { $('#shop-import-form').reset(); $('#shop-import-status').textContent = ''; $('#shop-import-dialog').showModal(); });
  $('#shop-import-close').addEventListener('click', () => $('#shop-import-dialog').close());
  $('#shop-import-form').addEventListener('submit', event => {
    event.preventDefault(); const originalProfile = profileId; const file = $('#shop-backup-file').files[0];
    perform(async () => {
      $('#shop-import-status').textContent = 'Checking backup…';
      const imported = await Lab.shopStorage.importBackup(file, validSlots);
      await commit(imported, originalProfile);
      if (profileId === originalProfile) { page = 1; renderShop(); $('#shop-import-dialog').close(); message(`Imported ${imported.length} items`); }
    }, '#shop-import-status');
  });
  [$('#shop-editor'), $('#shop-import-dialog')].forEach(dialog => dialog.addEventListener('cancel', event => { if (pending) event.preventDefault(); }));
  document.querySelector('#shop-previous').addEventListener('click', () => { if (page > 1) { page--; renderShop(); } });
  document.querySelector('#shop-next').addEventListener('click', () => { if (page < pageCount()) { page++; renderShop(); } });
  document.addEventListener('lab:viewchange', event => {
    if (profileId !== event.detail.profileId) loadShop(event.detail.profileId, event.detail.inventorName);
    else if (event.detail.view === 'shop') renderShop();
  });
  // app.js initializes before this deferred script; reconnect a restored shop.
  if (document.body.dataset.view === 'shop') document.querySelector('nav [data-view="shop"]').click();
  renderShop();
})();
