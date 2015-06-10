(function() {
'use strict';

var log = function() {
  if (console) {
    console.log(Array.prototype.slice.call(arguments)[0]);
  }
};

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
}

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
    this.api.clientAuthorizations.add('Authorization', new SwaggerClient.ApiKeyAuthorization('Authorization', 'Bearer ' + this.token.accessToken, 'header'));
  } else {
    this.token = null;
  }
  return Promise.resolve(this);
}

Agave.prototype.newToken = function(options) {
  var self = this;
  if (! (self.client && options.username && options.password)) {
    return Promise.reject('To obtain a token you must have an API client and provide "username" and "password" for Agave Tenant, as well as a "clientName".');
  }

  return new Promise(function(resolve, reject) {
    var data;
    var handler;
    var xhr;

    data = [
      ['username', encodeURIComponent(options.username)],
      ['password', encodeURIComponent(options.password)],
      ['grant_type', 'password'],
      ['scope', 'PRODUCTION']
    ].map(function(el) { return el.join('='); }).join('&');

    handler = function() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          resolve(this.response);
        } else {
          reject(this.response);
        }
      }
    };

    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = handler;
    xhr.open('post', self.api.scheme + '://' + self.api.host + '/token', true);
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(self.client.consumerKey + ':' + self.client.consumerSecret));
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
  });
};

Agave.prototype.refreshToken = function(options) {
  var self = this;
  if (! (self.client && options.username && options.password)) {
    return Promise.reject('To obtain a token you must have an API client and provide "username" and "password" for Agave Tenant, as well as a "clientName".');
  }

  return new Promise(function(resolve, reject) {
    var data;
    var handler;
    var xhr;

    data = [
      ['refresh_token', encodeURIComponent(self.token.refreshToken)],
      ['grant_type', 'refresh_token'],
      ['scope', 'PRODUCTION']
    ].map(function(el) { return el.join('='); }).join('&');

    handler = function() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          resolve(this.response);
        } else {
          reject(this.response);
        }
      }
    };

    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = handler;
    xhr.open('post', self.api.scheme + '://' + self.api.host + '/token', true);
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(self.client.consumerKey + ':' + self.client.consumerSecret));
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
  });
};

// Agave.prototype.tokenRequest = function() {
// };

}).call(this);
