import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),

	actions: {
	  selectChartSuggestion(suggestion) {
      const store  = this.get('store');
	    const profile = this.get('userProfile');
      const sampleConfiguration = suggestion.get('sampleConfiguration');
      profile.get('charts').then(function(charts) {
        var found = charts.any(function(chart) {
          return chart.get('sourceProperties').some(function(sProp) {
            return (sProp.source === sampleConfiguration.source && sProp.prop === sampleConfiguration.prop);
          });
        });
        if ( !found ) {
          var chartConfig = store.createRecord('chart-config', {
            type: suggestion.type,
            subtype: suggestion.subtype,
            flags: suggestion.flags,
            profile: profile,
            title: suggestion.get('title')
          });
          var sourceConfig = store.createRecord('chart-source-config', {
            chart: chartConfig,
            source : sampleConfiguration.source,
            props : [sampleConfiguration.prop]
          });
          sourceConfig.save();
          //chartConfig.get('sources').pushObject(sourceConfig);
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
	      return chart.get('sources').any(function(sourceProfile) {
	        const props = sourceProfile.get('props');
	        if ( sourceProfile.get('source') === sampleConfiguration.source && props && props.length === 1
	            && props[0] === sampleConfiguration.prop ) {
	          sourceProfile.destroyRecord();
	          chart.destroyRecord();
	          profile.save();
	          return true;
	        }
	        return false;
	      });
	    });
	  }
	}
});
