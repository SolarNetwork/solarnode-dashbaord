import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),

	actions: {
	  selectChartSuggestion(suggestion) {
      const store  = this.get('store');
	    const profile = this.get('userProfile');
      const sampleConfiguration = suggestion.get('sampleConfiguration');
      const source = suggestion.get('sources').findBy('source', sampleConfiguration.source);
      const prop = (source ? source.props.findBy('prop', sampleConfiguration.prop) : null);
      profile.get('charts').then(function(charts) {
        var found = charts.any(function(chart) {
          return chart.get('sourceProperties').any(function(sProp) {
            return (sProp.source === sampleConfiguration.source && sProp.prop && sProp.prop.prop === sampleConfiguration.prop);
          });
        });
        if ( !found ) {
          var chartConfig = store.createRecord('chart-config', {
            type: suggestion.get('type'),
            subtype: suggestion.get('subtype'),
            flags: suggestion.get('flags'),
            profile: profile,
            title: suggestion.get('title')
          });
          var sourceGroup = store.createRecord('chart-source-group', {
            chart: chartConfig,
            title : sampleConfiguration.source
          });
          var sourceConfig = store.createRecord('chart-source-config', {
            group: sourceGroup,
            source : sampleConfiguration.source,
          });
          var propConfig = store.createRecord('chart-property-config', prop);
          sourceConfig.get('props').pushObject(propConfig);
          propConfig.save();
          sourceConfig.save();
          sourceGroup.save();
          chartConfig.save();
          charts.pushObject(chartConfig);
          profile.save();
        }
      });
	  },

	  unselectChartSuggestion(suggestion) {
	    const profile = this.get('userProfile');
      const sampleConfiguration = suggestion.get('sampleConfiguration');
      profile.get('charts').any(function(chart) {
        return chart.get('sourceGroups').any(function(sourceGroup) {
          return sourceGroup.get('sources').any(function(sourceConfig) {
            const props = sourceConfig.get('properties');
            if ( sourceConfig.get('source') === sampleConfiguration.source && props && props.get('length') === 1
                && props.objectAt(0).prop === sampleConfiguration.prop ) {
              sourceConfig.destroyRecord();
              sourceGroup.destroyRecord();
              chart.destroyRecord();
              profile.save();
              return true;
            }
            return false;
          });
        });
	    });
	  }
	}
});
