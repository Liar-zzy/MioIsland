#!/usr/bin/env bun
// Compute Claude Code buddy bones dynamically.
// Reads the actual salt from the Claude Code binary (supports patched installs).
// Usage: bun buddy-bones.js
// Output: JSON with species, rarity, eye, hat, shiny, stats

const fs = require('fs');
const path = require('path');
const os = require('os');

// --- Read config ---
const configPath = path.join(os.homedir(), '.claude.json');
let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch {
  console.error(JSON.stringify({ error: 'Cannot read ~/.claude.json' }));
  process.exit(1);
}

const userId = config.oauthAccount?.accountUuid ?? config.userID ?? 'anon';

// --- Find Claude binary and extract salt ---
const ORIGINAL_SALT = 'friend-2026-401';
const SALT_LEN = ORIGINAL_SALT.length;

function findClaudeBinary() {
  const home = os.homedir();
  const candidates = [
    // Native install — versioned binaries
    ...(() => {
      const versionsDir = path.join(home, '.local', 'share', 'claude', 'versions');
      try {
        return fs.readdirSync(versionsDir)
          .filter(v => !v.includes('.bak') && !v.includes('.anybuddy'))
          .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
          .map(v => path.join(versionsDir, v));
      } catch { return []; }
    })(),
    path.join(home, '.local', 'bin', 'claude'),
    path.join(home, '.claude', 'local', 'claude'),
    '/opt/homebrew/bin/claude',
    '/usr/local/bin/claude',
  ];

  for (const p of candidates) {
    try {
      const stat = fs.statSync(p);
      if (stat.isFile() && stat.size > 1_000_000) return p;
    } catch {}
  }
  return null;
}

function extractSalt(binaryPath) {
  try {
    const buf = fs.readFileSync(binaryPath);
    // Search for the original salt first
    const origBuf = Buffer.from(ORIGINAL_SALT, 'utf-8');
    const idx = buf.indexOf(origBuf);
    if (idx !== -1) return ORIGINAL_SALT;

    // If not found, the binary was patched. Scan for 15-char ASCII strings
    // at known offset patterns. The salt appears 3 times in the binary.
    // Strategy: find any 15-byte ASCII string at the same offsets where
    // the original salt would be. We do this by searching around known
    // context bytes that surround the salt in the binary.
    //
    // Simpler approach: check the .anybuddy-bak for the original salt's
    // offset, then read the same offset from the current binary.
    // Check both backup naming conventions
    const bakCandidates = [binaryPath + '.anybuddy-bak', binaryPath + '.bak'];
    const bakPath = bakCandidates.find(p => fs.existsSync(p));
    if (bakPath) {
      const bakBuf = fs.readFileSync(bakPath);
      const bakIdx = bakBuf.indexOf(origBuf);
      if (bakIdx !== -1) {
        // Read the same position from current binary
        const patchedSalt = buf.slice(bakIdx, bakIdx + SALT_LEN).toString('utf-8');
        if (/^[\x20-\x7e]+$/.test(patchedSalt)) return patchedSalt;
      }
    }
  } catch {}
  return ORIGINAL_SALT; // fallback
}

const binaryPath = findClaudeBinary();
const SALT = binaryPath ? extractSalt(binaryPath) : ORIGINAL_SALT;

// --- Mulberry32 PRNG ---
const key = userId + SALT;
const h = Number(BigInt(Bun.hash(key)) & 0xffffffffn);

function mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(h);

// --- Constants ---
const SPECIES = ['duck','goose','blob','cat','dragon','octopus','owl','penguin','turtle','snail','ghost','axolotl','capybara','cactus','robot','rabbit','mushroom','chonk'];
const RARITIES = ['common','uncommon','rare','epic','legendary'];
const RARITY_WEIGHTS = {common:60,uncommon:25,rare:10,epic:4,legendary:1};
const EYES = ['·','✦','×','◉','@','°'];
const HATS = ['none','crown','tophat','propeller','halo','wizard','beanie','tinyduck'];
const STAT_NAMES = ['DEBUGGING','PATIENCE','CHAOS','WISDOM','SNARK'];
const RARITY_FLOOR = {common:5,uncommon:15,rare:25,epic:35,legendary:50};

function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

// --- Roll ---
const total = Object.values(RARITY_WEIGHTS).reduce((a,b)=>a+b,0);
let roll = rng() * total;
let rarity = 'common';
for (const r of RARITIES) { roll -= RARITY_WEIGHTS[r]; if (roll < 0) { rarity = r; break; } }

const species = pick(rng, SPECIES);
const eye = pick(rng, EYES);
const hat = rarity === 'common' ? 'none' : pick(rng, HATS);
const shiny = rng() < 0.01;

const floor = RARITY_FLOOR[rarity];
const peak = pick(rng, STAT_NAMES);
let dump = pick(rng, STAT_NAMES);
while (dump === peak) dump = pick(rng, STAT_NAMES);

const stats = {};
for (const name of STAT_NAMES) {
  if (name === peak) stats[name] = Math.min(100, floor + 50 + Math.floor(rng() * 30));
  else if (name === dump) stats[name] = Math.max(1, floor - 10 + Math.floor(rng() * 15));
  else stats[name] = floor + Math.floor(rng() * 40);
}

const companion = config.companion || {};

console.log(JSON.stringify({
  name: companion.name || 'Unknown',
  personality: companion.personality || '',
  species,
  rarity,
  eye,
  hat,
  shiny,
  stats,
  hatchedAt: companion.hatchedAt || null
}));
