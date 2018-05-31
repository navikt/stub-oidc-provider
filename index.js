/* eslint-disable no-console */

const Provider = require('oidc-provider');
const path = require('path');
const { set } = require('lodash');
const bodyParser = require('koa-body');
const querystring = require('querystring');
const Router = require('koa-router');
const render = require('koa-ejs');

const port = process.env.PORT || 8080;

const Account = require('./account');



const { config, clients, certificates} = require('./settings');

const issuer = process.env.ISSUER || 'https://localhost:8080';

config.findById = Account.findById;

const provider = new Provider(issuer, config);
provider.defaultHttpOptions = { timeout: 15000 };


provider.initialize({
  clients,
  keystore: { keys: certificates },
}).then(() => {
  render(provider.app, {
    cache: false,
    layout: '_layout',
    root: path.join(__dirname, 'views'),
  });

  if (process.env.NODE_ENV === 'hosted') {
    provider.proxy = true;
    set(config, 'cookies.short.secure', true);
    set(config, 'cookies.long.secure', true);

    provider.use(async (ctx, next) => {
      if (ctx.secure) {
        await next();
      } else if (ctx.method === 'GET' || ctx.method === 'HEAD') {
        ctx.redirect(ctx.href.replace(/^http:\/\//i, 'https://'));
      } else {
        ctx.body = {
          error: 'invalid_request',
          error_description: 'only use https',
        };
        ctx.status = 400;
      }
    });
  }
 
  const router = new Router(); 
  
  
  
  router.get('/interaction/:grant', async (ctx, next) => {
	
    const details = await provider.interactionDetails(ctx.req);
    const client = await provider.Client.find(details.params.client_id);
    
    console.log('ctx:' + JSON.stringify(ctx));
	if (!ctx.get('x-ms-client-principal-id') /*&& process.env.WEBSITE_AUTH_ENABLED*/){
	   console.log('no principal id, found redirecting to /.auth/login/aad');
	   ctx.redirect('/.auth/login/aad?post_login_redirect_url=' + ctx.url);
	}  
    
    if (details.interaction.error === 'login_required') {
      await ctx.render('login', {
        client,
        details,
        title: 'Sign-in as:',
        aadPrincipalName: ctx.request.header['x-ms-client-principal-name'] || 'anonymous',
        debug: querystring.stringify(details.params, ',<br/>', ' = ', {
          encodeURIComponent: value => value,
        }),
        interaction: querystring.stringify(details.interaction, ',<br/>', ' = ', {
          encodeURIComponent: value => value,
        }),
      });
    } else {
      await ctx.render('interaction', {
        client,
        details,
        title: 'Authorize',
        debug: querystring.stringify(details.params, ',<br/>', ' = ', {
          encodeURIComponent: value => value,
        }),
        interaction: querystring.stringify(details.interaction, ',<br/>', ' = ', {
          encodeURIComponent: value => value,
        }),
      });
    }

    await next();
  });

  const body = bodyParser();

  router.post('/interaction/:grant/confirm', body, async (ctx, next) => {
    const result = { consent: {} };
    await provider.interactionFinished(ctx.req, ctx.res, result);
    await next();
  });

  router.post('/interaction/:grant/login', body, async (ctx, next) => {
	  
    const account = await Account.findByLogin(ctx.request.body.login);
    const details = await provider.interactionDetails(ctx.req);
    const result = {
      login: {
        account: account.accountId,
        acr: details.params.acr_values || 'Level3',
        amr: 'BankID',
        remember: !!ctx.request.body.remember,
        ts: Math.floor(Date.now() / 1000),
      },
      consent: {},
    };
    await provider.interactionFinished(ctx.req, ctx.res, result);
    await next();
  });
  
  router.get('/*', body, async (ctx, next) => {
	  console.log('req:' + JSON.stringify(ctx.request));
	  console.log('header: ' + ctx.request.header['x-ms-client-principal-id']);
      await next();
  });

  provider.use(router.routes());
})
  .then(() => provider.listen(port))
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
