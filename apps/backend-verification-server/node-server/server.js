import http from 'node:http';
import { URL } from 'node:url';
import { normalizeCa } from '../../../shared/js/ca-normalize.js';
import { displayToRaw, rawToDisplay } from '../../../shared/js/entitlement-format.js';
import { fetchAddressToken, fetchOperationInfo, fetchTokenInfo, getApiBase } from '../../../shared/js/kasplex-client.js';

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number.parseInt(process.env.PORT || '8091', 10);

function sendJson(res, status, body) {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type'
  });
  res.end(payload);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8').trim();
  if (!text) return {};
  return JSON.parse(text);
}

function normalizeNetwork(value) {
  const network = String(value || 'mainnet').trim().toLowerCase();
  if (network !== 'mainnet' && network !== 'tn10') {
    throw new Error('Unsupported network. Use mainnet or tn10.');
  }
  return network;
}

function normalizeAddress(value, network, label) {
  const text = String(value || '').trim().toLowerCase();
  const expected = network === 'tn10' ? 'kaspatest:' : 'kaspa:';
  if (!text.startsWith(expected)) {
    throw new Error(`${label} must start with ${expected}`);
  }
  return text;
}

async function verifyHolding(body) {
  const network = normalizeNetwork(body.network);
  const walletAddress = normalizeAddress(body.walletAddress, network, 'walletAddress');
  const ca = normalizeCa(body.ca);
  const tokenResult = await fetchTokenInfo(network, ca);
  if (!tokenResult.token) throw new Error('CA was not found.');

  const decimals = String(tokenResult.token.dec ?? '0');
  const requiredRaw = displayToRaw(body.minimumAmount ?? '1', decimals);
  const balanceResult = await fetchAddressToken(network, walletAddress, ca);
  const balanceRaw = String(balanceResult.holding?.balance ?? '0');
  const granted = BigInt(balanceRaw || '0') >= BigInt(requiredRaw || '0');

  return {
    ok: true,
    verified: granted,
    decision: granted ? 'ACCESS_GRANTED' : 'ACCESS_DENIED',
    network,
    apiBase: getApiBase(network),
    walletAddress,
    ca,
    tokenName: tokenResult.token.name || '',
    decimals,
    requiredRaw,
    requiredDisplay: rawToDisplay(requiredRaw, decimals),
    balanceRaw,
    balanceDisplay: rawToDisplay(balanceRaw, decimals),
    proof: {
      tokenEndpoint: tokenResult.url,
      balanceEndpoint: balanceResult.url,
      balanceResponse: balanceResult.data
    }
  };
}

async function verifyRedeem(body) {
  const network = normalizeNetwork(body.network);
  const ca = normalizeCa(body.ca);
  const merchantAddress = normalizeAddress(body.merchantAddress, network, 'merchantAddress');
  const customerAddress = body.customerAddress ? normalizeAddress(body.customerAddress, network, 'customerAddress') : '';
  const tokenResult = await fetchTokenInfo(network, ca);
  if (!tokenResult.token) throw new Error('CA was not found.');

  const decimals = String(tokenResult.token.dec ?? '0');
  const requiredRaw = displayToRaw(body.expectedAmount ?? '1', decimals);
  const opResult = await fetchOperationInfo(network, body.proofId);
  if (!opResult.operation) throw new Error('Operation proof was not found.');

  const op = opResult.operation;
  const checks = [
    { key: 'op_is_transfer', passed: op.op === 'transfer' },
    { key: 'ca_matches', passed: normalizeCa(op.ca) === ca },
    { key: 'amount_sufficient', passed: BigInt(op.amt || '0') >= BigInt(requiredRaw || '0') },
    { key: 'merchant_matches', passed: String(op.to || '').toLowerCase() === merchantAddress },
    { key: 'customer_matches_when_supplied', passed: !customerAddress || String(op.from || '').toLowerCase() === customerAddress },
    { key: 'tx_accepted', passed: op.txAccept === '1' },
    { key: 'op_accepted', passed: op.opAccept === '1' },
    { key: 'op_error_empty', passed: String(op.opError || '') === '' }
  ];
  const verified = checks.every((item) => item.passed);

  return {
    ok: true,
    verified,
    decision: verified ? 'REDEEM_VERIFIED' : 'REDEEM_REJECTED',
    network,
    apiBase: getApiBase(network),
    ca,
    tokenName: tokenResult.token.name || '',
    decimals,
    requiredRaw,
    requiredDisplay: rawToDisplay(requiredRaw, decimals),
    merchantAddress,
    customerAddress: customerAddress || null,
    checks,
    operation: {
      op: op.op,
      amt: op.amt,
      amountDisplay: rawToDisplay(op.amt || '0', decimals),
      from: op.from,
      to: op.to,
      opScore: op.opScore,
      hashRev: op.hashRev,
      txAccept: op.txAccept,
      opAccept: op.opAccept,
      opError: op.opError
    },
    proof: {
      tokenEndpoint: tokenResult.url,
      operationEndpoint: opResult.url,
      operationResponse: opResult.data
    }
  };
}

function routeInfo() {
  return {
    ok: true,
    service: 'Token Depot Entitlement Apps — EA-5 Backend Verification Server',
    routes: {
      health: 'GET /health',
      verifyHolding: 'POST /verify/holding',
      verifyRedeem: 'POST /verify/redeem'
    },
    examples: {
      holding: {
        network: 'mainnet',
        walletAddress: 'kaspa:qpkxn24070npk7cx336vlfa6wcj8cvcgrwd482rxdeqn9qrsd6gkzkpt9sr94',
        ca: '2d6fc4377f2fb2a5d051e6c99b6d784960b45edc2f6d268bfc432b5ee5dee3dc',
        minimumAmount: '1'
      },
      redeem: {
        network: 'mainnet',
        proofId: '4293125140000',
        ca: '2d6fc4377f2fb2a5d051e6c99b6d784960b45edc2f6d268bfc432b5ee5dee3dc',
        expectedAmount: '1',
        merchantAddress: 'kaspa:qrp6qd9jx8tj3f0rsyqz04a9052dsf0u7dtf0emstjefccmucp4n5yxvz0mmw',
        customerAddress: 'kaspa:qpkxn24070npk7cx336vlfa6wcj8cvcgrwd482rxdeqn9qrsd6gkzkpt9sr94'
      }
    }
  };
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return sendJson(res, 204, {});
    const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
      return sendJson(res, 200, routeInfo());
    }

    if (req.method === 'POST' && url.pathname === '/verify/holding') {
      return sendJson(res, 200, await verifyHolding(await readJson(req)));
    }

    if (req.method === 'POST' && url.pathname === '/verify/redeem') {
      return sendJson(res, 200, await verifyRedeem(await readJson(req)));
    }

    return sendJson(res, 404, { ok: false, error: 'not_found' });
  } catch (err) {
    return sendJson(res, 400, { ok: false, error: err.message || String(err) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`EA-5 Backend Verification Server listening at http://${HOST}:${PORT}`);
});
