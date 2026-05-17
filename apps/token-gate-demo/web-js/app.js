import { fetchAddressToken, fetchTokenInfo } from '../../../shared/js/kasplex-client.js';
import { isKaspaAddressForNetwork } from '../../../shared/js/ca-normalize.js';
import { displayToRaw, normalizeAsset, rawToDisplay } from '../../../shared/js/entitlement-format.js';

const form = document.getElementById('gateForm');
const networkEl = document.getElementById('network');
const addressEl = document.getElementById('addressInput');
const caEl = document.getElementById('caInput');
const amountEl = document.getElementById('amountInput');
const statusEl = document.getElementById('status');
const decisionEl = document.getElementById('decision');
const proofEl = document.getElementById('proof');

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

function renderDecision({ granted, asset, address, requiredRaw, balanceRaw, balanceDisplay, requiredDisplay, tokenUrl, balanceUrl, balanceData }) {
  decisionEl.hidden = false;
  decisionEl.innerHTML = `
    <div class="decision ${granted ? 'granted' : 'denied'}">
      ${granted ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
    </div>
    <div class="grid" style="margin-top: 14px;">
      ${kv('Token', asset.name)}
      ${kv('CA', asset.ca)}
      ${kv('Wallet', address)}
      ${kv('Required', requiredDisplay)}
      ${kv('Wallet Balance', balanceDisplay)}
      ${kv('Required Raw', requiredRaw)}
      ${kv('Balance Raw', balanceRaw)}
      ${kv('Known Token Depot CA', asset.knownTokenDepotIssued ? 'yes' : 'no')}
      ${kv('Registry Purpose', asset.registryPurpose)}
    </div>
  `;

  proofEl.hidden = false;
  proofEl.innerHTML = `
    <h2>Raw proof</h2>
    ${kv('Token endpoint', tokenUrl)}
    ${kv('Balance endpoint', balanceUrl)}
    <pre>${JSON.stringify(balanceData, null, 2)}</pre>
  `;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  decisionEl.hidden = true;
  proofEl.hidden = true;
  setStatus('Checking token gate...', '');

  try {
    const network = networkEl.value;
    const address = addressEl.value.trim();
    const ca = caEl.value.trim();
    if (!isKaspaAddressForNetwork(address, network)) {
      throw new Error(`Address prefix does not match selected ${network} network.`);
    }

    const tokenResult = await fetchTokenInfo(network, ca);
    if (!tokenResult.token) {
      throw new Error('Required CA was not found.');
    }

    const asset = normalizeAsset(network, tokenResult.token, registry);
    const requiredRaw = displayToRaw(amountEl.value, asset.decimals);
    const balanceResult = await fetchAddressToken(network, address, asset.ca);
    const balanceRaw = String(balanceResult.holding?.balance ?? '0');
    const granted = BigInt(balanceRaw || '0') >= BigInt(requiredRaw || '0');

    renderDecision({
      granted,
      asset,
      address,
      requiredRaw,
      balanceRaw,
      balanceDisplay: rawToDisplay(balanceRaw, asset.decimals),
      requiredDisplay: rawToDisplay(requiredRaw, asset.decimals),
      tokenUrl: tokenResult.url,
      balanceUrl: balanceResult.url,
      balanceData: balanceResult.data
    });

    setStatus(granted ? 'Access granted by CA balance proof.' : 'Access denied by CA balance proof.', granted ? 'ok' : 'err');
  } catch (err) {
    setStatus(err.message || String(err), 'err');
  }
});

loadRegistry().catch((err) => setStatus(`Failed to load registry: ${err.message}`, 'err'));
