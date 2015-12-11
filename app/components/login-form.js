import Ember from 'ember';

const { service } = Ember.inject;
const { isEmpty } = Ember;

export default Ember.Component.extend({
  classNames: ['app-login-form', 'uk-width-1-2', 'uk-container-center'],
  session: service('session'),
  actions: {

    authenticate(props) {
      let { identification, token, secret } = props;
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
