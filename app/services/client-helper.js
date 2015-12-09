import Ember from 'ember';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';
import { nodeClientHelper } from '../models/node-config';

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
    return nodeClientHelper(token, secret);
  }),

});
