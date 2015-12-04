import Ember from 'ember';

export default Ember.Component.extend({
  sources: Ember.computed.mapBy('propConfigs', 'source'),
  uniqueSources: Ember.computed.uniq('sources'),
  uniqueSourceConfigs: Ember.computed('uniqueSources.[]', 'sourceConfigs.@each.source', function() {
    const sources = this.get('uniqueSources');
    return this.get('sourceConfigs').filter(sourceConfig => {
      return sources.indexOf(sourceConfig.get('source')) !== -1;
    }).sort((l, r) => {
      const lIndex = sources.indexOf(l.get('source'));
      const rIndex = sources.indexOf(r.get('source'));
      return (lIndex < rIndex ? -1 : lIndex > rIndex ? 1 : 0);
    });
  }),
});
