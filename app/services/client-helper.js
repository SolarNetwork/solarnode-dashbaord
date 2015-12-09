import Ember from 'ember';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';
import { jsonClient, nodeClientHelper, urlHelper } from '../models/node-config';

const { isEmpty } = Ember;

export default Ember.Service.extend({
  session: Ember.inject.service(),

  nodeUrlHelper: Ember.computed('session.data.authenticated.nodeId', 'session.data.authenticated.token', 'session.data.authenticated.secret', function() {
    const nodeId = this.get('session.data.authenticated.nodeId');
    const token = this.get('session.data.authenticated.token');
    const secret = this.get('session.data.authenticated.secret');
    return urlHelper(nodeId, (!isEmpty(token) && !isEmpty(secret)));
  }),

  nodeClient: Ember.computed('session.data.authenticated.token', 'session.data.authenticated.secret', function() {
    const token = this.get('session.data.authenticated.token');
    const secret = this.get('session.data.authenticated.secret');
    return nodeClientHelper(token, secret);
  }),

  jsonClient: Ember.computed('session.data.authenticated.token', 'session.data.authenticated.secret', function() {
    const token = this.get('session.data.authenticated.token');
    const secret = this.get('session.data.authenticated.secret');
    return jsonClient(token, secret);
  }),

});
