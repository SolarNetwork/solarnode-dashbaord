import Ember from 'ember';
import DataSourceConfig from '../../models/data-source-config';

export default Ember.Route.extend({
  userService: Ember.inject.service(),

  model(params) {
    return this.get('userService.activeUserProfile').then(profile => {
      return this.store.findRecord('chart-source-config', params.id).then(sourceConfig => {
        const nodeId = sourceConfig.get('nodeId');
        return Ember.RSVP.all([profile.get('nodes').findBy('nodeId', nodeId), profile.get('chartProperties')])
        .then(([nodeConfig, allPropConfigs]) => {
          const model = DataSourceConfig.create({
            profile: profile,
            nodeConfig: nodeConfig,
            sourceConfig: sourceConfig,
            allPropConfigs: allPropConfigs,
          });
          return model;
        });
      });
    });
  },

  redirect(model, transition) {
    var targetSourceConfigId = (transition && transition.params && transition.params['data-props.source']
      ? transition.params['data-props.source'].id : undefined);
    if ( targetSourceConfigId && model ) {
      Ember.run.next(() => {
        this.eventBus.publish('data-props.source.DataSourceConfigLoaded', model);
      });
    }
  },

  actions : {
    setPropertyColor(prop, color) {
      prop.set('color', color);
    },
  },

});
