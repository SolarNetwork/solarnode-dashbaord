import Ember from 'ember';

export default Ember.Component.extend({
  chartName: Ember.computed.alias('chart.title'),
  canSave: Ember.computed.readOnly('chart.hasDirtyAttributes'),

  actions: {
    save() {
      this.get('chart').save();
    }
  }
});
