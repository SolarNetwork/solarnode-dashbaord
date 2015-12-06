import Ember from 'ember';
import DataSourceConfig from '../../models/data-source-config';

export default Ember.Route.extend({

  model(params) {
    return this.store.query('chart-source-config', {source:params.sourceId}).then(sourceConfigs => {
      const sourceConfig = sourceConfigs.get('firstObject');
      return sourceConfig.get('profile').then(profile => {
        return profile.get('chartProperties').then(allPropConfigs => {
          const model = DataSourceConfig.create({
            sourceConfig: sourceConfig,
            allPropConfigs: allPropConfigs,
          });
          Ember.run.next(() => {
            this.eventBus.publish('data-props.source.DataSourceConfigLoaded', model);
          });
          return model;
        });
      });
    })
  },

});
