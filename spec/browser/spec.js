/*globals Agave*/
describe('Sanity Checks', function() {
  'use strict';

  var client;

  it('Creates an instance of the Agave object', function() {
    client = new Agave({url: 'https://api.example.com', spec: {}});
    expect(client instanceof Agave).toBe(true);
  });

  it('Agave auth methods available', function() {
    client = new Agave({url: 'https://api.example.com', spec: {}});
    expect(typeof client.generateClient).toBe('function');
  });

});
