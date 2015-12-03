import Ember from 'ember';
import BaseIOChart, { ConfigurationAccessor } from './base-io-chart';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

export default BaseIOChart.extend({
  isNorthernHemisphere: false,
  isShowSumLine: true,

  plotProperties: Ember.computed('chartConfiguration', ConfigurationAccessor),

  regenerateChartConfiguration() {
    var plotProp;
    if ( this.get('chartConfig.groups.length') > 0 ) {
      plotProp = this.get('chartConfig.groups.firstObject.groupProp');
    }
    if ( !plotProp ) {
      plotProp = 'wattHours';
    }
    this.set('plotProperties', {FiveMinute: plotProp, Hour : plotProp, Day : plotProp, Month : plotProp});
    this._super(...arguments);
  },

  chart: Ember.computed(function() {
    const container = this.$().get(0);
    if ( !container ) {
      return undefined;
    }
    var chartConfiguration = this.get('chartConfiguration');
    var chart = this.get('snChart');
    if ( !chart ) {
      chart = sn.chart.energyIOBarChart(container, chartConfiguration);
      this.set('snChart', chart);
    }
	  chart.showSumLine(this.get('isShowSumLine'))
	    .northernHemisphere(this.get('isNorthernHemisphere'))
	    .negativeGroupIds(this.get('negativeGroupIds'));
    return chart;
  }),

  negativeGroupIdsChanged: Ember.observer('negativeGroupIds', function() {
    const chart = this.get('chart');
    chart.negativeGroupIds(this.get('negativeGroupIds'));
  }),

});
