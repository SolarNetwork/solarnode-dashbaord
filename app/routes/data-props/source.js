import Ember from 'ember';
import DataSourceConfig from '../../models/data-source-config';

export default Ember.Route.extend({
  userService: Ember.inject.service(),

  model(params) {
    return this.get('userService.activeUserProfile').then(profile => {
      return this.store.query('chart-source-config', {source:params.sourceId, profile:profile.get('id')}).then(sourceConfigs => {
        const sourceConfig = sourceConfigs.get('firstObject');
        return profile.get('chartProperties').then(allPropConfigs => {
          const model = DataSourceConfig.create({
            profile: profile,
            sourceConfig: sourceConfig,
            allPropConfigs: allPropConfigs,
          });
          return model;
        });
      });
    });
  },

  redirect(model, transition) {
    var targetSourceId = (transition && transition.params && transition.params['data-props.source']
      ? transition.params['data-props.source'].sourceId : undefined);
    var chart;
    if ( targetSourceId && model ) {
      Ember.run.next(() => {
        this.eventBus.publish('data-props.source.DataSourceConfigLoaded', model);
      });
    }
  },

});
