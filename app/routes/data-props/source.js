import Ember from 'ember';

export default Ember.Route.extend({

  model(params) {
    return this.store.findRecord('chart-source-config', params.id).then(sourceConfig => {
      Ember.run.next(() => {
        this.eventBus.publish('data-props.source.SourceConfigLoaded', sourceConfig);
      });
      return sourceConfig;
    })
  },

});
