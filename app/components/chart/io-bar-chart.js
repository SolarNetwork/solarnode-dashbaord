import Ember from 'ember';
import BaseChart from './base-chart';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

export default BaseChart.extend({
  positiveSourceIds: null,
  negativeSourceIds: null,

  isNorthernHemisphere: false,
  isShowSumLine: true,

  chart: Ember.computed('height', 'width', 'aggregate', function() {
    var chartConfiguration = new sn.Configuration({
      width: this.get('width'),
      height : this.get('height'),
      aggregate : this.get('aggregate'),
      plotProperties : {Hour : 'wattHours', Day : 'wattHours', Month : 'wattHours'}
    });
    var container = this.$().get(0);
	  var chart = sn.chart.energyIOBarChart(container, chartConfiguration)
	    .showSumLine(this.get('isShowSumLine'))
	    .northernHemisphere(this.get('isNorthernHemisphere'));
      //.dataCallback(chartDataCallback)
      //.colorCallback(colorForDataTypeSource)
    return chart;
  }),

  draw() {
    const chartConfig = this.get('chartConfig');
    const data = this.get('data');
    const chart = this.get('chart');
    const prop = this.get('prop');
    var scale = 1;
    if ( data && chart ) {
      chart.reset();
      data.forEach(function(groupData) {
        chart.load(groupData.data, groupData.groupId);
      });
      chart.regenerate();
      scale = (chart.yScale ? chart.yScale() : chart.scale());
      if ( chartConfig ) {
        chartConfig.set('displayScale', scale);
      }
    }
  }

});
