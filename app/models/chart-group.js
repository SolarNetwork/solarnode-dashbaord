import Ember from 'ember';

/**
 A group of selectable charts.
 */
export default Ember.Object.extend({
  charts: [], // SelectableChart objects, i.e. {chart:Chart, selected:true}

  selectedChart: Ember.computed('charts.@each.selected', function() {
    return this.get('charts').findBy('selected', true).get('chart');
  }),

  selectChart(chart) {
    var charts = this.get('charts');
    var selectableChart = charts.findBy('chart', chart);
    if ( selectableChart ) {
      charts.any(function(otherSelectableChart) {
        if ( selectableChart !== otherSelectableChart && otherSelectableChart.get('selected') ) {
          otherSelectableChart.set('selected', false);
          return true;
        }
        return false;
      });
      selectableChart.set('selected', true);
    }
    return selectableChart;
  }

});
