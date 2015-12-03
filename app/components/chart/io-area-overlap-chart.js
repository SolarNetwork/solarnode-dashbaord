import Ember from 'ember';
import BaseIOChart, { ConfigurationAccessor } from './base-io-chart';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

export default BaseIOChart.extend({

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

  chart: Ember.computed('height', 'width', function() {
    var chartConfiguration = this.get('chartConfiguration');
    const container = this.$().get(0);
    const colorMap = this.get('colorMap');
    var chart = this.get('snChart');
    if ( !chart ) {
      chart = sn.chart.powerAreaOverlapChart(container, chartConfiguration);
      this.set('snChart', chart);
    }
    return chart;
  }),

});
