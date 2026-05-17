import { normalizeCa, normalizeNetwork } from './ca-normalize.js';

export const API_BASES = Object.freeze({
  mainnet: 'https://api.kasplex.org/v1',
  tn10: 'https://tn10api.kasplex.org/v1'
});

export function getApiBase(network) {
  return API_BASES[normalizeNetwork(network)];
}

async function fetchJson(url) {
  const res = await fetch(url, { method: 'GET', headers: { accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}`);
  }
  const data = await res.json();
  if (data.message && data.message !== 'successful') {
    throw new Error(`API message was not successful: ${data.message}`);
  }
  return data;
}

export async function fetchTokenInfo(network, caInput) {
  const ca = normalizeCa(caInput);
  const url = `${getApiBase(network)}/krc20/token/${ca}`;
  const data = await fetchJson(url);
  return { url, data, token: Array.isArray(data.result) ? data.result[0] || null : null };
}

export async function fetchAddressTokenList(network, address) {
  const safeAddress = encodeURIComponent(String(address || '').trim());
  const url = `${getApiBase(network)}/krc20/address/${safeAddress}/tokenlist`;
  const data = await fetchJson(url);
  return { url, data, tokens: Array.isArray(data.result) ? data.result : [] };
}

export async function fetchAddressToken(network, address, caInput) {
  const ca = normalizeCa(caInput);
  const safeAddress = encodeURIComponent(String(address || '').trim());
  const url = `${getApiBase(network)}/krc20/address/${safeAddress}/token/${ca}`;
  const data = await fetchJson(url);
  return { url, data, holding: Array.isArray(data.result) ? data.result[0] || null : null };
}
