// Seed data export / import for portable distribution.
// Seed file lives next to yingling.exe as  yingling_seed.json.

import { invoke } from '@tauri-apps/api/core';
import { SpriteStore } from './spriteStore';
import { ALL_POSES } from './petActions';

const IMPORTED_FLAG = 'yingling_seed_imported';
const LS_PREFIX     = 'yingling_';

interface SeedData {
  version: 2;
  localStorage: Record<string, string>;
  sprites: Record<string, string>; // "charId::pose" → base64
}

// ── Export ────────────────────────────────────────────────────

export async function exportSeed(): Promise<boolean> {
  const lsData: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LS_PREFIX) && key !== IMPORTED_FLAG) {
      lsData[key] = localStorage.getItem(key) ?? '';
    }
  }

  const spriteData: Record<string, string> = {};
  let chars: Array<{ id: string; hasPixelSprites?: boolean }> = [];
  try { chars = JSON.parse(localStorage.getItem(LS_PREFIX + 'characters') ?? '[]'); } catch {}

  for (const char of chars) {
    if (char.hasPixelSprites) {
      const sprites = await SpriteStore.getAll(char.id, ALL_POSES);
      for (const pose of ALL_POSES) {
        if (sprites[pose]) spriteData[`${char.id}::${pose}`] = sprites[pose]!;
      }
    }
  }

  const seed: SeedData = { version: 2, localStorage: lsData, sprites: spriteData };
  try {
    return await invoke<boolean>('write_seed_file', { data: JSON.stringify(seed) });
  } catch {
    return false;
  }
}

// ── Import ────────────────────────────────────────────────────

async function importSeed(json: string): Promise<void> {
  const seed = JSON.parse(json) as SeedData;

  for (const [k, v] of Object.entries(seed.localStorage ?? {})) {
    localStorage.setItem(k, v);
  }

  for (const [key, b64] of Object.entries(seed.sprites ?? {})) {
    const sep = key.indexOf('::');
    if (sep > 0) {
      await SpriteStore.save(key.slice(0, sep), key.slice(sep + 2), b64);
    }
  }

  localStorage.setItem(IMPORTED_FLAG, '1');
}

// ── Startup check ─────────────────────────────────────────────

export async function checkAndImportSeed(): Promise<boolean> {
  if (localStorage.getItem(IMPORTED_FLAG)) return false;
  try {
    const json = await invoke<string | null>('read_seed_file');
    if (!json) return false;
    await importSeed(json);
    return true;
  } catch {
    return false;
  }
}
