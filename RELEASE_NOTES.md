# Release Notes

## v0.1.1 — Runtime proof and address-path fix

### Status

```text
EA-1 CA Token Explorer: working
EA-2 Wallet Entitlement Viewer: working
```

### Fixed

The Wallet Entitlement Viewer initially encoded Kaspa addresses inside the Kasplex URL path. That converted:

```text
kaspa:q...
```

into:

```text
kaspa%3Aq...
```

Kasplex rejected that path form with HTTP 403.

The shared client now validates and preserves address path strings for:

```text
kaspa:<address>
kaspatest:<address>
```

### Runtime proof

EA-1 successfully recovered MMXXVI metadata from:

```text
https://api.kasplex.org/v1/krc20/token/2d6fc4377f2fb2a5d051e6c99b6d784960b45edc2f6d268bfc432b5ee5dee3dc
```

EA-2 successfully read entitlement rows from:

```text
https://api.kasplex.org/v1/krc20/address/kaspa:qpkxn24070npk7cx336vlfa6wcj8cvcgrwd482rxdeqn9qrsd6gkzkpt9sr94/tokenlist
```

The wallet proof returned 15 token rows, including 5 CA issue-mode rows.

### Still deferred

EA-4 Merchant Redeem Verifier still needs a separate proof for:

```text
GET /krc20/op/{id}
```

The unresolved choice is whether the app should use `opScore`, `hashRev`, or reveal transaction id as its preferred proof identifier.
