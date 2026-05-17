import { fetchTokenInfo } from '../../../shared/js/kasplex-client.js';
import { normalizeAsset } from '../../../shared/js/entitlement-format.js';

const form = document.getElementById('lookupForm');
const networkEl = document.getElementById('network');
const caEl = document.getElementById('caInput');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const rawProofEl = document.getElementById('rawProof');

let registry = {};

async function loadRegistry() {
  const res = await fetch('../../../fixtures/token-depot-known-cas.json');
  registry = await res.json();
}

function setStatus(text, kind = '') {
  statusEl.className = `status ${kind}`.trim();
  statusEl.textContent = text;
}

function kv(label, value) {
  return `<div class="kv"><span>${label}</span><strong>${value || '—'}</strong></div>`;
}

function renderAsset(asset, proofUrl, raw) {
  const registryBadge = asset.knownTokenDepotIssued
    ? '<span class="badge ok">Token Depot-known</span>'
    : '<span class="badge warn">Public CA, not in registry</span>';

  resultEl.hidden = false;
  resultEl.innerHTML = `
    <h2>${asset.name} ${registryBadge}</h2>
    <div class="grid">
      ${kv('CA', asset.ca)}
      ${kv('Display ID', asset.displayId)}
      ${kv('Mode', asset.mode)}
      ${kv('State', asset.state)}
      ${kv('Decimals', asset.decimals)}
      ${kv('Issuer / To', asset.issuerAddress)}
      ${kv('Minted Raw', asset.mintedRaw)}
      ${kv('Burned Raw', asset.burnedRaw)}
      ${kv('Total Supply Raw', asset.totalSupplyRaw)}
      ${kv('Holder Total', asset.holderTotal)}
      ${kv('Transfer Total', asset.transferTotal)}
      ${kv('Mint Total', asset.mintTotal)}
      ${kv('hashRev', asset.hashRev)}
      ${kv('opScoreAdd', asset.opScoreAdd)}
      ${kv('opScoreMod', asset.opScoreMod)}
      ${kv('Registry Purpose', asset.registryPurpose)}
    </div>
    <h3>Operation counts</h3>
    <pre>${asset.opCount.length ? asset.opCount.join('\n') : 'No opCount returned.'}</pre>
  `;

  rawProofEl.hidden = false;
  rawProofEl.innerHTML = `
    <h2>Raw proof</h2>
    ${kv('Endpoint', proofUrl)}
    <pre>${JSON.stringify(raw, null, 2)}</pre>
  `;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  resultEl.hidden = true;
  rawProofEl.hidden = true;
  setStatus('Looking up CA...', '');

  try {
    const network = networkEl.value;
    const ca = caEl.value;
    const { url, data, token } = await fetchTokenInfo(network, ca);
    if (!token) {
      setStatus('CA not found.', 'err');
      return;
    }
    const asset = normalizeAsset(network, token, registry);
    setStatus(asset.knownTokenDepotIssued ? 'Token found and registry matched.' : 'Public token found, not Token Depot-known.', asset.knownTokenDepotIssued ? 'ok' : 'warn');
    renderAsset(asset, url, data);
  } catch (err) {
    setStatus(err.message || String(err), 'err');
  }
});

loadRegistry().catch((err) => setStatus(`Failed to load registry: ${err.message}`, 'err'));
