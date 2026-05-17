# Release Notes

## v0.1.3 — EA-4 Merchant Redeem Verifier

Status:

```text
EA-1 CA Token Explorer: working
EA-2 Wallet Entitlement Viewer: working
EA-3 Token Gate Demo: working from balance proof
EA-4 Merchant Redeem Verifier: added for testing
```

EA-4 adds:

```text
apps/merchant-redeem-verifier/web-js/
```

The operation proof endpoint was verified with:

```text
https://api.kasplex.org/v1/krc20/op/4293125140000
```

That endpoint returned a successful MMXXVI transfer with matching CA, amount, from address, to address, `txAccept: 1`, `opAccept: 1`, and empty `opError`.

EA-4 compares the operation proof against expected transfer details and returns:

```text
REDEEM VERIFIED
REDEEM REJECTED
```

EA-4 is a browser reference demo. Production integrations should repeat this verification server-side.

## v0.1.2 — EA-3 Token Gate Demo

EA-3 is a read-only browser token-gate demo:

```text
apps/token-gate-demo/web-js/
```

It checks a wallet balance against a required CA amount and returns:

```text
ACCESS GRANTED
ACCESS DENIED
```

## v0.1.1 — Runtime proof and address-path fix

EA-1 and EA-2 were runtime-tested successfully.

The Wallet Entitlement Viewer initially encoded Kaspa addresses inside the Kasplex URL path. That converted `kaspa:q...` into `kaspa%3Aq...`, which Kasplex rejected with HTTP 403.

The shared client now validates and preserves address path strings for:

```text
kaspa:<address>
kaspatest:<address>
```
