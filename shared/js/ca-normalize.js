export function normalizeCa(input) {
  const raw = String(input || '').trim().toLowerCase();
  const withoutPrefix = raw.startsWith('ca:') ? raw.slice(3) : raw;
  if (!/^[0-9a-f]{64}$/.test(withoutPrefix)) {
    throw new Error('Invalid CA format. Expected a 64-character hex CA or CA:<hex>.');
  }
  return withoutPrefix;
}

export function shortCa(ca) {
  const normalized = normalizeCa(ca);
  return `CA:${normalized.slice(0, 8)}…${normalized.slice(-8)}`;
}

export function normalizeNetwork(value) {
  const network = String(value || '').trim().toLowerCase();
  if (network !== 'mainnet' && network !== 'tn10') {
    throw new Error('Unsupported network. Use mainnet or tn10.');
  }
  return network;
}

export function isKaspaAddressForNetwork(address, network) {
  const text = String(address || '').trim().toLowerCase();
  if (network === 'mainnet') return text.startsWith('kaspa:');
  if (network === 'tn10') return text.startsWith('kaspatest:');
  return false;
}
