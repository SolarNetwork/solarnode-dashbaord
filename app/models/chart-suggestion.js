import Ember from 'ember';

/**
 A suggestion for a style of chart.
 */
export default Ember.Object.extend({
  title: '',
  type: 'General',
  subtype: 'General',
  flags: {},
  metadata: {},
  sources: [],
  data: [],
  sampleConfiguration: {}
});
