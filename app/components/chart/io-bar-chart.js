import Ember from 'ember';
import BaseIOChart, { ConfigurationAccessor } from './base-io-chart';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

export default BaseIOChart.extend({
  isNorthernHemisphere: false,
  isShowSumLine: true,

  plotProperties: Ember.computed('chartConfiguration', ConfigurationAccessor),

  regenerateChartConfiguration() {
    this.set('plotProperties', {Hour : 'wattHours', Day : 'wattHours', Month : 'wattHours'});
    this._super(...arguments);
  },

  chart: Ember.computed(function() {
    const container = this.$().get(0);
    if ( !container ) {
      return undefined;
    }
    var chartConfiguration = this.get('chartConfiguration');
    const colorMap = this.get('colorMap');
    var chart = this.get('snChart');
    if ( !chart ) {
      chart = sn.chart.energyIOBarChart(container, chartConfiguration);
      this.set('snChart', chart);
    }
	  chart.showSumLine(this.get('isShowSumLine'))
	    .northernHemisphere(this.get('isNorthernHemisphere'))
	    .negativeGroupIds(this.get('negativeGroupIds'));/*
      .colorCallback((groupId, sourceId) => {
        return (colorMap[groupId] ? colorMap[groupId].sourceColors[sourceId] : null);
      });*/
    return chart;
  }),

  negativeGroupIdsChanged: Ember.observer('negativeGroupIds', function() {
    const chart = this.get('chart');
    chart.negativeGroupIds(this.get('negativeGroupIds'));
  }),

});
