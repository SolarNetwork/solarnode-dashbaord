import Ember from 'ember';

/**
 A selectable chart.
 */
export default Ember.Object.extend({
  chart: undefined, // a ChartConfig object
  chartId: Ember.computed.readOnly('chart.id'),
  selected: false
});
