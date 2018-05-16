# stub-oidc-provider

A simple OpenID Connect identity provider with stubbed login (i.e. accepts all logins). Based on the great NodeJS module [oidc-provider](https://github.com/panva/node-oidc-provider).

The ID token returned from the provider mimics the ID token from [ID-Porten](https://difi.github.io/idporten-oidc-dokumentasjon/oidc_auth_codeflow.html), with the obvious exception of the signing key and issuer values.

Please note that this should only be used in test or local environments as the keys used to sign the token are readily available here in the source code.

## Usage

TODO



### 

