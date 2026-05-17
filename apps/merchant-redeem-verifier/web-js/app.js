import { fetchOperationInfo, fetchTokenInfo } from '../../../shared/js/kasplex-client.js';
import { isKaspaAddressForNetwork, normalizeCa } from '../../../shared/js/ca-normalize.js';
import { displayToRaw, normalizeAsset, rawToDisplay } from '../../../shared/js/entitlement-format.js';

const form = document.getElementById('verifyForm');
const networkEl = document.getElementById('network');
const proofIdEl = document.getElementById('proofIdInput');
const caEl = document.getElementById('caInput');
const amountEl = document.getElementById('amountInput');
const merchantEl = document.getElementById('merchantInput');
const customerEl = document.getElementById('customerInput');
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

function check(label, passed) {
  return `<li><span class="${passed ? 'pass' : 'fail'}">${passed ? 'PASS' : 'FAIL'}</span> — ${label}</li>`;
}

function renderDecision({ verified, checks, asset, operation, requiredRaw, requiredDisplay, opUrl, tokenUrl, raw }) {
  decisionEl.hidden = false;
  decisionEl.innerHTML = `
    <div class="decision ${verified ? 'verified' : 'rejected'}">
      ${verified ? 'REDEEM VERIFIED' : 'REDEEM REJECTED'}
    </div>
    <h2>Verification checks</h2>
    <ul>${checks.map((item) => check(item.label, item.passed)).join('')}</ul>
    <div class="grid">
      ${kv('Token', asset.name)}
      ${kv('CA', asset.ca)}
      ${kv('Expected Amount', requiredDisplay)}
      ${kv('Expected Raw', requiredRaw)}
      ${kv('Operation Amount Raw', operation.amt)}
      ${kv('Operation Amount', rawToDisplay(operation.amt, asset.decimals))}
      ${kv('From', operation.from)}
      ${kv('To', operation.to)}
      ${kv('opScore', operation.opScore)}
      ${kv('hashRev', operation.hashRev)}
    </div>
  `;

  proofEl.hidden = false;
  proofEl.innerHTML = `
    <h2>Raw proof</h2>
    ${kv('Token endpoint', tokenUrl)}
    ${kv('Operation endpoint', opUrl)}
    <pre>${JSON.stringify(raw, null, 2)}</pre>
  `;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  decisionEl.hidden = true;
  proofEl.hidden = true;
  setStatus('Verifying redeem proof...', '');

  try {
    const network = networkEl.value;
    const merchantAddress = merchantEl.value.trim().toLowerCase();
    const customerAddress = customerEl.value.trim().toLowerCase();
    if (!isKaspaAddressForNetwork(merchantAddress, network)) {
      throw new Error(`Merchant address prefix does not match selected ${network} network.`);
    }
    if (customerAddress && !isKaspaAddressForNetwork(customerAddress, network)) {
      throw new Error(`Customer address prefix does not match selected ${network} network.`);
    }

    const expectedCa = normalizeCa(caEl.value);
    const tokenResult = await fetchTokenInfo(network, expectedCa);
    if (!tokenResult.token) {
      throw new Error('Expected CA was not found.');
    }

    const asset = normalizeAsset(network, tokenResult.token, registry);
    const requiredRaw = displayToRaw(amountEl.value, asset.decimals);
    const opResult = await fetchOperationInfo(network, proofIdEl.value);
    if (!opResult.operation) {
      throw new Error('Operation proof was not found.');
    }

    const op = opResult.operation;
    const checks = [
      { label: 'operation type is transfer', passed: op.op === 'transfer' },
      { label: 'operation CA matches expected CA', passed: normalizeCa(op.ca) === expectedCa },
      { label: 'operation amount is at least expected amount', passed: BigInt(op.amt || '0') >= BigInt(requiredRaw || '0') },
      { label: 'operation to address matches merchant address', passed: String(op.to || '').toLowerCase() === merchantAddress },
      { label: 'operation from address matches customer address when supplied', passed: !customerAddress || String(op.from || '').toLowerCase() === customerAddress },
      { label: 'transaction accepted by indexer', passed: op.txAccept === '1' },
      { label: 'operation accepted by indexer', passed: op.opAccept === '1' },
      { label: 'operation error is empty', passed: String(op.opError || '') === '' }
    ];
    const verified = checks.every((item) => item.passed);

    renderDecision({
      verified,
      checks,
      asset,
      operation: op,
      requiredRaw,
      requiredDisplay: rawToDisplay(requiredRaw, asset.decimals),
      opUrl: opResult.url,
      tokenUrl: tokenResult.url,
      raw: opResult.data
    });

    setStatus(verified ? 'Redeem proof verified.' : 'Redeem proof rejected.', verified ? 'ok' : 'err');
  } catch (err) {
    setStatus(err.message || String(err), 'err');
  }
});

loadRegistry().catch((err) => setStatus(`Failed to load registry: ${err.message}`, 'err'));
