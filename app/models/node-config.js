import Ember from 'ember';
import DS from 'ember-data';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

const { isEmpty } = Ember;

/**
 Get a client object that can be used to make JSON requests to SolarNetwork.

 The returned object can be called directly, or via a <code>json</code> property.

 @param {String} token - An optional security token.
 @param {String} secret - An optional token secret.
 @return A client object.
 */
export function nodeClientHelper(token, secret) {
  var client;
  if ( !(isEmpty(token) || isEmpty(secret)) ) {
    // token access
    client = sn.net.securityHelper();
    client.token(token);
    client.secret(secret);
    // TODO: need option on urlHelper to force sec
    // sn.config.secureQuery = true;
  } else {
    // public access
    client = d3;
  }
  function loadJSON(jsonURL) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      client.json(jsonURL).on('load', (data) => {
        if ( data && data.success === true ) {
          resolve(data.data ? data.data : data);
        } else {
          reject(new Error('Request failed: ' +data.message));
        }
      }).on('error', (error) => {
        reject(new Error(error.statusText));
      }).get();
    });
  }
  var that = loadJSON;
  that.json = that; // backwards compat
  return that;
}

export default DS.Model.extend({
  profile: DS.belongsTo('user-profile', {inverse:'nodes'}),
  nodeId: DS.attr('number'),
  token: DS.attr('string'),
  secret: DS.attr('string'),

  urlHelper: Ember.computed('nodeId', function() {
    const nodeId = this.get('nodeId');
    if ( !isEmpty(nodeId) ) {
      return sn.api.node.nodeUrlHelper(nodeId);
    }
  }),

  nodeClient: Ember.computed('token', 'secret', function() {
    const token = this.get('token');
    const secret = this.get('secret');
    return nodeClientHelper(token, secret);
  }),

});
