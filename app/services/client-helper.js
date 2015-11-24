import Ember from 'ember';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

const { isEmpty } = Ember;

export default Ember.Service.extend({
  session: Ember.inject.service(),

  nodeUrlHelper: Ember.computed('session.data.authenticated.nodeId', function() {
    const nodeId = this.get('session.data.authenticated.nodeId');
    if ( !isEmpty(nodeId) ) {
      return sn.api.node.nodeUrlHelper(nodeId);
    }
  }),

  nodeClient: Ember.computed('session.data.authenticated.token', 'session.data.authenticated.secret', function() {
    const token = this.get('session.data.authenticated.token');
    const secret = this.get('session.data.authenticated.secret');
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
    return {
      json : function(url) {
        return new Ember.RSVP.Promise((resolve, reject) => {
          client.json(url).on('load', (data) => {
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
    };
  })
});
