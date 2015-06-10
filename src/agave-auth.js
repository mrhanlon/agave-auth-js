(function() {
'use strict';

var root = this;

var hasRequire = typeof require !== 'undefined';

var btoa = root.btoa;
if (typeof btoa === 'undefined') {
  if (hasRequire) {
    btoa = require('btoa');
  } else {
    throw new Error('agave-auth.js requires the btoa function');
  }
}

var Promise = root.Promise;
if (typeof Promise === 'undefined') {
  if (hasRequire) {
    Promise = require('es6-promise').Promise;
  } else {
    throw new Error('Agave.js requires Promise');
  }
}

var SwaggerClient = root.SwaggerClient;
if (typeof SwaggerClient === 'undefined') {
  if (hasRequire) {
    SwaggerClient = require('swagger-client');
  } else {
    throw new Error('Agave.js requires SwaggerClient');
  }
}

var Agave = root.Agave;
if (typeof Agave === 'undefined') {
  if (hasRequire) {
    Agave = require('agave');
  } else {
    throw new Error('agave-auth.js requires agave.js');
  }
}

Agave.prototype.setClient = function(client) {
  this.client = client;
  return Promise.resolve(this);
};

Agave.prototype.generateClient = function(options) {
  if (! (options.username && options.password && options.clientName)) {
    return Promise.reject('To generate a client provide "username" and "password" for Agave Tenant, as well as a "clientName".');
  }

  var self = this;
  var prevAuthZ = self.api.clientAuthorizations.authz.Authorization;
  /* store previous AuthZ, if set */
  function resetAuthZ() {
    if (prevAuthZ) {
      /* put previous AuthZ back */
      self.api.clientAuthorizations.add('Authorization', prevAuthZ);
    } else {
      self.api.clientAuthorizations.remove('Authorization');
    }
  }

  return new Promise(function(resolve, reject) {
    self.api.clientAuthorizations.add('Authorization', new SwaggerClient.PasswordAuthorization('Authorization', options.username, options.password, 'header'));
    self.api.clients.create(
      {body: {clientName: options.clientName}},
      function(response) {
        resetAuthZ();
        self.setClient(response.obj.result);
        resolve(response.obj);
      },
      function(error) {
        resetAuthZ();
        reject(error.obj);
      }
    );
  });
};

Agave.prototype.setToken = function(options) {
  if (options.token) {
    this.token = options.token;

    // normalize attribute names
    this.token.accessToken = this.token.access_token;
    this.token.refreshToken = this.token.refresh_token;
    this.token.expiresIn = this.token.expires_in;
    this.token.tokenType = this.token.token_type;

    this.api.clientAuthorizations.add('Authorization', new SwaggerClient.ApiKeyAuthorization('Authorization', 'Bearer ' + this.token.accessToken, 'header'));
  } else {
    this.token = null;
  }
  return Promise.resolve(this);
};

Agave.prototype.newToken = function(options) {
  if (! (this.client && options.username && options.password)) {
    return Promise.reject('To obtain a token you must have an API client and provide your "username" and "password" for the Agave Tenant.');
  }
  var data = [
    ['username', encodeURIComponent(options.username)],
    ['password', encodeURIComponent(options.password)],
    ['grant_type', 'password'],
    ['scope', 'PRODUCTION']
  ].map(function(el) { return el.join('='); }).join('&');
  return this.tokenRequest(data);
};

Agave.prototype.refreshToken = function() {
  if (! (this.client && this.token && this.refreshToken)) {
    return Promise.reject('To obtain a token you must have an API client and a Token with refresh_token set.');
  }
  var data = [
    ['refresh_token', encodeURIComponent(this.token.refreshToken)],
    ['grant_type', 'refresh_token'],
    ['scope', 'PRODUCTION']
  ].map(function(el) { return el.join('='); }).join('&');
  return this.tokenRequest(data);
};

Agave.prototype.tokenRequest = function(data) {
  var tokenEndpoint = this.api.scheme + '://' + this.api.host + '/token';
  var authorization = 'Basic ' + btoa(this.client.consumerKey + ':' + this.client.consumerSecret);
  return new Promise(function(resolve, reject) {
    var handler;
    var xhr;

    handler = function() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          resolve(JSON.parse(this.response));
        } else {
          reject(this.response);
        }
      }
    };

    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = handler;
    xhr.open('post', tokenEndpoint, true);
    xhr.setRequestHeader('Authorization', authorization);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
  });
};

}).call(this);
