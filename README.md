[![Build Status](https://travis-ci.org/navikt/stub-oidc-provider.svg?branch=master)](https://travis-ci.org/navikt/stub-oidc-provider)

# stub-oidc-provider

A simple OpenID Connect identity provider with stubbed login (i.e. accepts all logins). Based on the great NodeJS module [oidc-provider](https://github.com/panva/node-oidc-provider).

The ID token returned from the provider mimics the ID token from [ID-Porten](https://difi.github.io/idporten-oidc-dokumentasjon/oidc_auth_codeflow.html), with the obvious exception of the signing key and issuer values.

Please note that this should only be used in test or local environments as the keys used to sign the token are readily available here in the source code.

## Usage

The stub-oidc-provider has been deployed as an Azure AppService (https://docs.microsoft.com/en-us/azure/app-service/containers/tutorial-custom-docker-image) and its metadata is available on:

- https://stub-oidc-provider.azurewebsites.net/.well-known/openid-configuration

For NAV IKT users the  stub-oidc-provider will never be used directly (with the exception of the actual user interaction). It has however been configured as an Identity Provider in test environments so that users can choose to use this provider for test purposes.

If you want to test the provider and see the contents of the ID token you can hit this link:

- https://stub-oidc-provider.azurewebsites.net/auth?client_id=test_implicit_app&redirect_uri=https://jwt.io&response_type=id_token&scope=openid&nonce=123&state=321&acr_values=Level4


### 

