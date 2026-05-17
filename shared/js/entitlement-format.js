import { normalizeCa, shortCa } from './ca-normalize.js';

export function rawToDisplay(raw, decimals) {
  const rawText = String(raw ?? '0');
  const dec = Number.parseInt(String(decimals ?? '0'), 10);
  if (!Number.isFinite(dec) || dec <= 0) return rawText;

  const negative = rawText.startsWith('-');
  const digits = negative ? rawText.slice(1) : rawText;
  const padded = digits.padStart(dec + 1, '0');
  const whole = padded.slice(0, -dec);
  const fraction = padded.slice(-dec).replace(/0+$/, '');
  return `${negative ? '-' : ''}${whole}${fraction ? `.${fraction}` : ''}`;
}

export function findKnownCa(registry, network, ca) {
  const normalized = normalizeCa(ca);
  return registry?.[network]?.[normalized] || null;
}

export function normalizeAsset(network, apiToken, registry) {
  const ca = normalizeCa(apiToken.ca || apiToken.hashRev);
  const known = findKnownCa(registry, network, ca);
  return {
    network,
    ca,
    displayId: shortCa(ca),
    name: apiToken.name || known?.name || shortCa(ca),
    decimals: String(apiToken.dec ?? known?.decimals ?? '0'),
    mode: apiToken.mod || '',
    state: apiToken.state || '',
    issuerAddress: apiToken.to || known?.issuerAddress || '',
    maxRaw: String(apiToken.max ?? ''),
    limitRaw: String(apiToken.lim ?? ''),
    preRaw: String(apiToken.pre ?? ''),
    mintedRaw: String(apiToken.minted ?? ''),
    burnedRaw: String(apiToken.burned ?? ''),
    totalSupplyRaw: String(apiToken.totalSupply ?? ''),
    totalBurnedRaw: String(apiToken.totalBurned ?? ''),
    holderTotal: String(apiToken.holderTotal ?? ''),
    transferTotal: String(apiToken.transferTotal ?? ''),
    mintTotal: String(apiToken.mintTotal ?? ''),
    opScoreAdd: String(apiToken.opScoreAdd ?? ''),
    opScoreMod: String(apiToken.opScoreMod ?? ''),
    hashRev: apiToken.hashRev || '',
    opCount: Array.isArray(apiToken.opCount) ? apiToken.opCount : [],
    knownTokenDepotIssued: Boolean(known),
    registryPurpose: known?.purpose || ''
  };
}

export function normalizeHolding(network, walletAddress, apiHolding, registry, tokenMetaByCa = {}) {
  const ca = normalizeCa(apiHolding.ca);
  const known = findKnownCa(registry, network, ca);
  const meta = tokenMetaByCa[ca] || {};
  const decimals = String(meta.decimals ?? apiHolding.dec ?? known?.decimals ?? '0');
  const balanceRaw = String(apiHolding.balance ?? apiHolding.amount ?? '0');
  const lockedRaw = String(apiHolding.locked ?? '0');
  const active = BigInt(balanceRaw || '0') > 0n;
  const locked = BigInt(lockedRaw || '0') > 0n;

  return {
    network,
    walletAddress,
    ca,
    displayId: shortCa(ca),
    name: meta.name || apiHolding.name || known?.name || shortCa(ca),
    balanceRaw,
    balanceDisplay: rawToDisplay(balanceRaw, decimals),
    lockedRaw,
    lockedDisplay: rawToDisplay(lockedRaw, decimals),
    decimals,
    opScoreMod: String(apiHolding.opScoreMod ?? ''),
    knownTokenDepotIssued: Boolean(known),
    registryPurpose: known?.purpose || '',
    entitlementStatus: active ? 'active' : locked ? 'locked balance exists' : 'not held'
  };
}
