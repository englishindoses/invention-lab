// Local role-play access. Profiles and password digests stay in this browser.
Lab.access = (() => {
  const normaliseName = name => name.trim().toLocaleLowerCase();
  async function digest(password, salt) {
    const bytes = new TextEncoder().encode(`${salt}:${password}`);
    const result = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(result), byte => byte.toString(16).padStart(2, '0')).join('');
  }
  return {
    async register(data, name, password) {
      name = name.trim();
      if (!name || name.length > 40) throw new Error('Enter a name with 1–40 characters.');
      if (!password.trim() || password.length > 128) throw new Error('Enter a password with 1–128 characters.');
      let inventor = data.profiles.find(p => normaliseName(p.name) === normaliseName(name));
      if (inventor?.access) throw new Error('That inventor is already registered. Use the access pad.');
      const salt = crypto.randomUUID();
      const passwordDigest = await digest(password, salt);
      // Existing notebooks are registered in place without resetting progress.
      if (!inventor) { inventor = Lab.newProfile(name); data.profiles.push(inventor); }
      inventor.access = { salt, passwordDigest };
      if (!data.active) data.active = inventor.id;
      return inventor;
    },
    async match(data, name, password) {
      const inventor = data.profiles.find(p => normaliseName(p.name) === normaliseName(name));
      if (!inventor?.access) return null;
      return await digest(password, inventor.access.salt) === inventor.access.passwordDigest ? inventor : null;
    }
  };
})();
