import Ember from 'ember';
import BaseIOChart, { ConfigurationAccessor } from './base-io-chart';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

export default BaseIOChart.extend({
  innerRadius: Ember.computed('chartConfiguration', 'width', 'height', ConfigurationAccessor),

  regenerateChartConfiguration() {
    const width = this.get('width');
    const height = this.get('height');
    const innerRadius = Math.ceil((width < height ? width : height) / 10);
    this.set('innerRadius', innerRadius);
    this._super(...arguments);
  },

  chart: Ember.computed('height', 'width', function() {
    var chartConfiguration = this.get('chartConfiguration');
    const container = this.$().get(0);
    const colorMap = this.get('colorMap');
    var chart = this.get('snChart');
    if ( !chart ) {
      chart = sn.chart.energyIOPieChart(container, chartConfiguration);
      this.set('snChart', chart);
    }
	  chart.colorCallback((groupId, sourceId) => {
        return (colorMap[groupId] ? colorMap[groupId].sourceColors[sourceId] : null);
      });
    return chart;
  }),

});
