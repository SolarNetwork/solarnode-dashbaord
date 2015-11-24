import Ember from 'ember';
export default Ember.Component.extend({
  chartName: Ember.computed.alias('chart.title'),
  canSave: Ember.computed.readOnly('chart.hasDirtyAttributes'),
  startDate: Ember.computed.alias('chart.startDate'),
  endDate: Ember.computed.alias('chart.endDate'),
  period: Ember.computed.alias('chart.period'),
  periodType: Ember.computed.alias('chart.periodType'),
  isUsePeriod: Ember.computed.alias('chart.isUsePeriod'),
  periodTypes: ['hour', 'day', 'month', 'year'],
  periodChoices: Ember.computed('period', 'periodTypes', function() {
    const i18n = this.get('i18n');
    const count = this.get('period');
    return this.get('periodTypes').map(type => {
      return {key:type, label:i18n.t('chart.period.'+type, {count:count}).toString().capitalize()};
    });
  }),
  actions: {
    save() {
      this.get('chart').save();
    }
  }
});
