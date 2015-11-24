import Ember from 'ember';

const { service } = Ember.inject;
const { isEmpty } = Ember;

export default Ember.Component.extend({
  classNames: ['app-login-form'],
  attributeBindings: ['isProcessing'],
  session: service('session'),
  isProcessing: false,
  hasMessage: Ember.computed('infoMessage', 'errorMessage', function() {
    return (this.get('infoMessage') || this.get('errorMessage'));
  }),
  showToken : false,
  actions: {

    authenticate() {
      let { identification, token, secret } = this.getProperties('identification', 'token', 'secret');
      if ( isEmpty(identification) ) {
        this.set('infoMessage', this.get('i18n').t('login.nodeId.required'));
        this.set('errorMessage', undefined);
        return;
      }
      this.set('infoMessage', undefined);
      this.set('errorMessage', undefined);
      this.set('isProcessing', true);
      this.get('session').authenticate('authenticator:solarnetwork', identification, token, secret).catch((reason) => {
        if ( isEmpty(token) || isEmpty(secret) ) {
          this.set('showToken', true);
        }
        this.set('isProcessing', false);
        this.set((isEmpty(token) || isEmpty(secret) ? 'infoMessage' : 'errorMessage'), reason.error);
      }).then(() => {
        this.set('isProcessing', false);
      });
    }
  }
});
