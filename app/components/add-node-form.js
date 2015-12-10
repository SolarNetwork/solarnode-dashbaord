import Ember from 'ember';
const { isEmpty } = Ember;

export default Ember.Component.extend({
  classNames: ['uk-width-small-1-1', 'uk-width-medium-1-2'],

  actions: {
    addNode(props) {
      let { identification, token, secret } = props;
      if ( isEmpty(identification) ) {
        this.set('infoMessage', this.get('i18n').t('data-props.addNode.nodeId.required'));
        this.set('errorMessage', undefined);
        return;
      }
      this.set('infoMessage', undefined);
      this.set('errorMessage', undefined);
      this.set('isProcessing', true);

      // TODO
      /*
      this.get('session').authenticate('authenticator:solarnetwork', identification, token, secret).catch((reason) => {
        if ( isEmpty(token) || isEmpty(secret) ) {
          this.set('showToken', true);
        }
        this.set('isProcessing', false);
        this.set((isEmpty(token) || isEmpty(secret) ? 'infoMessage' : 'errorMessage'), reason.error);
      }).then(() => {
        this.set('isProcessing', false);
      });
      */
    }
  }

});
