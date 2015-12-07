import Ember from 'ember';

export default Ember.Component.extend({
  init() {
    this._super(...arguments);
    this.eventBus.subscribe('chartRoute.ChartLoaded', this, 'onChartLoaded');
  },

  destroy() {
    this.eventBus.unsubscribe('chartRoute.ChartLoaded');
    this._super(...arguments);
  },

  onChartLoaded(chart) {
    var selectedChart = this.get('chartGroup.selectedChart');
    if ( chart !== selectedChart ) {
      this.get('chartGroup').selectChart(chart);
    }
  },

  actions: {
    selectChart(chart) {
      var selectedChart = this.get('chartGroup').selectChart(chart.chart);
      if ( selectedChart ) {
        this.sendAction('selectChart', selectedChart);
      }
    }
  }
});
