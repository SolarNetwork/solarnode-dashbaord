import Ember from 'ember';
const { isEmpty } = Ember;

export default Ember.Component.extend({
  classNames: ['uk-width-small-1-1', 'uk-width-medium-1-2'],

  store: Ember.inject.service(),
  userService: Ember.inject.service(),

  actions: {
    addNode(props) {
      let { identification, token, secret } = props;
      if ( isEmpty(identification) ) {
        this.set('infoMessage', this.get('i18n').t('data-props.addNode.nodeId.required'));
        this.set('errorMessage', undefined);
        return;
      }

      const nodeId = +identification;

      this.set('infoMessage', undefined);
      this.set('errorMessage', undefined);
      this.set('isProcessing', true);

	    this.get('userService.activeUserProfile').then(profile => {
	      profile.get('nodes').then(nodeConfigs => {
	        const matchingNodeConfig = nodeConfigs.findBy('nodeId', nodeId);
	        if ( !matchingNodeConfig ) {
            const nodeConfig = this.get('store').createRecord('node-config', {
              profile: profile,
              nodeId: nodeId,
              token: (isEmpty(token) ? null : token),
              secret: (isEmpty(secret) ? null : secret),
            });

            nodeConfig.save().then(() => {
              profile.save();
              this.set('isProcessing', false);
              this.eventBus.publish('data-props.addNode.NodeAdded', nodeConfig);
            }).catch((reason) => {
              this.set('isProcessing', false);
            });
	        } else {
	          // node config already exists
            this.set('infoMessage', this.get('i18n').t('data-props.addNode.nodeId.exists'));
            this.set('isProcessing', false);
	        }
	      });
	    });
    }
  }

});
