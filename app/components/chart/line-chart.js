import Ember from 'ember';
import BaseChart from './base-chart';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

export default BaseChart.extend({

  chart: Ember.computed('height', 'width', 'aggregate', function() {
    var chartConfiguration = new sn.Configuration({
      width: this.get('width'),
      height : this.get('height'),
      aggregate : this.get('aggregate')
    });
    var container = this.$().get(0);
    var chart = sn.chart.basicLineChart(container, chartConfiguration)
      .colors(['#f7c819']);
    return chart;
  }),

  colors: Ember.computed('chart', {
    get(key) {
      const chart = this.get('chart');
      return (chart ? chart.colors() : undefined);
    },
    set(key, value) {
      const chart = this.get('chart');
      if ( chart && Array.isArray(value) ) {
        chart.colors(value);
      }
      return (chart ? chart.colors() : undefined);
    }
  })

});
