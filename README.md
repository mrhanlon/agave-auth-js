# AgaveAPI-Auth.js

[![Build Status](https://travis-ci.org/mrhanlon/agaveapi-auth-js.svg)](https://travis-ci.org/mrhanlon/agaveapi-auth-js)

Authentication library for [AgaveAPI.js][1]. Supports client-side API Client management and Token Authorization.

## Usage

AgaveAPI-Auth currently only supports the browser environment. We plan Node.js
integration in the future. This will require replacing `XMLHttpRequest` with an
HTTP library compatible both with Node.js and the browser.

### Browser

Add the scripts to your page and then you can get a client and token in order
to make API requests from a fully client-side application.

```html
<form id="exampleForm">
  <label for="clientName">API Client Application Name</label>
  <input type="text" name="clientName" id="clientName">

  <label for="username">Username</label>
  <input type="text" name="username" id="username">

  <label for="password">Password</label>
  <input type="password" name="password" id="password">

  <button type="submit">Create Client and Authenticate</button>
</form>
<script src="scripts/vendor/es6-promise/dist/es6-promise.js"></script>
<script src="scripts/vendor/swagger-client/browser/swagger-client.js"></script>
<script src="scripts/vendor/agaveapi-js/dist/agaveapi.js"></script>
<script src="scripts/agaveapi-auth.js"></script>
<script>
  var submitHandler = function submitHandler(e) {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var clientName = document.getElementById('clientName').value;
    var agave = new Agave({url: 'https://agaveapi.iplantc.org'});

    agave.ready()
    .then(function() {
      return agave.generateClient({clientName: clientName, username: username, password: password})
    })
    .then(agave.setClient.bind(agave))
    .then(function() {
      return agave.newToken({username: username, password: password})
    })
    .then(agave.setToken.bind(agave))
    .then(function() {
      return new Promise(function(resolve, reject) {
        agave.api.profiles.me(null, resolve, reject);
      });
    })
    .then(function(profileResponse) {
      console.log(profileResponse.obj.result);
    })
    .then(null, function(error) {
      console.error(error);
    });

  };
  document.getElementById('exampleForm').addEventListener('submit', submitHandler);
</script>
```

## Development

You will need node.js, npm, and grunt installed on your system.

## Demo

Clone the repo, install the dependencies, and see how it works!

```bash
$> git clone https://github.com/mrhanlon/agaveapi-auth-js.git
$> cd agaveapi-auth-js
$> npm install
$> grunt serve
```



[1]: https://github.com/mrhanlon/agaveapi-js
