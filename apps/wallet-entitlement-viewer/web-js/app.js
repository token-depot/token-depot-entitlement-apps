import { fetchAddressTokenList, fetchTokenInfo } from '../../../shared/js/kasplex-client.js';
import { isKaspaAddressForNetwork } from '../../../shared/js/ca-normalize.js';
import { findKnownCa, normalizeAsset, normalizeHolding } from '../../../shared/js/entitlement-format.js';

const form = document.getElementById('lookupForm');
const networkEl = document.getElementById('network');
const addressEl = document.getElementById('addressInput');
const knownOnlyEl = document.getElementById('knownOnly');
const statusEl = document.getElementById('status');
const summaryEl = document.getElementById('summary');
const resultsEl = document.getElementById('results');
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

function renderHolding(holding) {
  const badge = holding.knownTokenDepotIssued
    ? '<span class="badge ok">Token Depot-known</span>'
    : '<span class="badge warn">Public CA</span>';

  return `
    <article class="entitlement">
      <h3>${holding.name} ${badge}</h3>
      <div class="grid">
        ${kv('CA', holding.ca)}
        ${kv('Balance', holding.balanceDisplay)}
        ${kv('Balance Raw', holding.balanceRaw)}
        ${kv('Locked', holding.lockedDisplay)}
        ${kv('Decimals', holding.decimals)}
        ${kv('Status', holding.entitlementStatus)}
        ${kv('Registry Purpose', holding.registryPurpose)}
        ${kv('opScoreMod', holding.opScoreMod)}
      </div>
    </article>
  `;
}

async function enrichTokenMetadata(network, rows) {
  const out = {};
  for (const row of rows) {
    if (!row.ca) continue;
    try {
      const { token } = await fetchTokenInfo(network, row.ca);
      if (token) {
        const asset = normalizeAsset(network, token, registry);
        out[asset.ca] = asset;
      }
    } catch (_err) {
      // Metadata enrich failure should not hide the balance row.
    }
  }
  return out;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  summaryEl.hidden = true;
  resultsEl.hidden = true;
  rawProofEl.hidden = true;
  setStatus('Looking up wallet entitlements...', '');

  try {
    const network = networkEl.value;
    const address = addressEl.value.trim();
    if (!isKaspaAddressForNetwork(address, network)) {
      throw new Error(`Address prefix does not match selected ${network} network.`);
    }

    const { url, data, tokens } = await fetchAddressTokenList(network, address);
    const issueModeRows = tokens.filter((row) => row.ca);
    const metaByCa = await enrichTokenMetadata(network, issueModeRows);
    let holdings = issueModeRows.map((row) => normalizeHolding(network, address, row, registry, metaByCa));

    if (knownOnlyEl.checked) {
      holdings = holdings.filter((row) => Boolean(findKnownCa(registry, network, row.ca)));
    }

    const knownCount = holdings.filter((row) => row.knownTokenDepotIssued).length;

    summaryEl.hidden = false;
    summaryEl.innerHTML = `
      <h2>Wallet summary</h2>
      <div class="grid">
        ${kv('Address', address)}
        ${kv('Network', network)}
        ${kv('CA rows shown', String(holdings.length))}
        ${kv('Token Depot-known shown', String(knownCount))}
        ${kv('Endpoint', url)}
      </div>
    `;

    resultsEl.hidden = false;
    resultsEl.innerHTML = `<h2>Entitlements</h2>${holdings.length ? holdings.map(renderHolding).join('') : '<p>No CA issue-mode entitlements found for this filter.</p>'}`;

    rawProofEl.hidden = false;
    rawProofEl.innerHTML = `
      <h2>Raw proof</h2>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    `;

    setStatus('Wallet entitlement lookup complete.', 'ok');
  } catch (err) {
    setStatus(err.message || String(err), 'err');
  }
});

loadRegistry().catch((err) => setStatus(`Failed to load registry: ${err.message}`, 'err'));
