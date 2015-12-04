import Ember from 'ember';

export default Ember.Component.extend({
  sources: Ember.computed.mapBy('chartConfig.properties', 'source'),
  uniqueSources: Ember.computed.uniq('sources'),
  uniqueSourceConfigs: Ember.computed('uniqueSources.[]', 'allSourceConfigs.@each.source', function() {
    const sources = this.get('uniqueSources');
    const sourceConfigs = this.get('allSourceConfigs');
    if ( !sourceConfigs ) {
      return Ember.RSVP.resolve(new Ember.A());
    }
    return this.get('allSourceConfigs').filter(sourceConfig => {
      return sources.indexOf(sourceConfig.get('source')) !== -1;
    }).sort((l, r) => {
      const lIndex = sources.indexOf(l.get('source'));
      const rIndex = sources.indexOf(r.get('source'));
      return (lIndex < rIndex ? -1 : lIndex > rIndex ? 1 : 0);
    });
  }),
});
