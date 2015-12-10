import Ember from 'ember';
import Base from 'ember-simple-auth/authenticators/base';
import CryptoJS from 'npm:crypto-js';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

const { RSVP, isEmpty } = Ember;

export default Base.extend({
  i18n: Ember.inject.service(),
  store: Ember.inject.service(),

  restore(data) {
    return this.resolveUserRecord(data.nodeId, data.token, data.secret);
  },

  resolveUserRecord(nodeId, token, secret) {
    return new RSVP.Promise((resolve, reject) => {
      if ( !nodeId ) {
        reject();
        return;
      }
      nodeId = +nodeId;
      var store = this.get('store');
      store.query('user', {nodeId}).then(function(users) {
        // user exists already, cool
        var userId = users.get('firstObject').get('id');
        resolve({userId, nodeId, token, secret});
      }, function() {
        // user does not exist, so create
        var user = store.createRecord('user', {nodeId: nodeId});
        user.save();
        var userId = user.get('id');
        var profile = store.createRecord('user-profile', {user: user});
        store.createRecord('node-config', {
          profile: profile,
          nodeId: nodeId,
          token: token,
          secret: secret
        }).save();
        profile.save();
        resolve({userId, nodeId, token, secret});
      });
    });
  },

  authenticate(nodeId, token, secret) {
    return new RSVP.Promise((resolve, reject) => {
      const urlHelper = sn.api.node.nodeUrlHelper(nodeId);
      var xhr;
      if ( !(isEmpty(token) || isEmpty(secret)) ) {
        // test auth with token
        sn.config.secureQuery = true;
        xhr = this.testPrivateQueryAccess(urlHelper, token, secret);
      } else if ( !isEmpty(nodeId) ) {
        // test public auth with node ID
        sn.config.secureQuery = false;
        xhr = this.testPublicQueryAccess(urlHelper);
      } else {
        reject();
      }
      if ( xhr ) {
        xhr.on('load', () => {
          if ( !(isEmpty(token) || isEmpty(secret)) ) {
            sn.net.sec.token(token);
            sn.net.sec.secret(secret);
          }
          this.resolveUserRecord(nodeId, token, secret).then(resolve, reject);
        }).on('error', (error) => {
          var msg;
          if ( isEmpty(token) || isEmpty(secret) ) {
            msg = this.get('i18n').t('login.needToken');
          } else {
            msg = this.get('i18n').t('login.forbidden');
          }
          reject({status : error.status, error : msg});
        }).get();
      } else {
        reject();
      }
    });
  },

  testPublicQueryAccess(urlHelper) {
    const url = urlHelper.availableSourcesURL();
    return d3.json(url);
  },

  testPrivateQueryAccess(urlHelper, token, secret) {
    const url = urlHelper.viewActiveInstructionsURL();
    return sn.net.securityHelper(token, secret).json(url);
  }
});
