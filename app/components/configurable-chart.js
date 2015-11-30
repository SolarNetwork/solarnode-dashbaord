import Ember from 'ember';
import d3 from 'npm:d3';

var dateFormat = d3.time.format("%d.%m.%Y");
var datePropertyAccessor = {
    get(key) {
      var val = this.get('chart.'+key);
      return (val ? dateFormat(val) : null);
    },
    set(key, value) {
      var val = (value ? dateFormat.parse(value) : null);
      this.set('chart.'+key, val);
      return (val ? value : null);
    }
};

export default Ember.Component.extend({
  classNames: ['app-configurable-chart'],

  chartName: Ember.computed.alias('chart.title'),
  chartUnit: Ember.computed.alias('chart.unit'),
  chartWidth: 550,
  canSave: Ember.computed.readOnly('chart.hasDirtyAttributes'),
  startDate: Ember.computed('chart.startDate', datePropertyAccessor),
  endDate: Ember.computed('chart.endDate', datePropertyAccessor),
  period: Ember.computed.alias('chart.period'),
  periodType: Ember.computed.alias('chart.periodType'),
  isUsePeriod: Ember.computed.alias('chart.isUsePeriod'),
  isSettingsVisible: Ember.computed.alias('chart.isSettingsVisible'),

  periodTypes: ['hour', 'day', 'month', 'year'],
  periodChoices: Ember.computed('period', 'periodTypes', function() {
    const i18n = this.get('i18n');
    const count = this.get('period');
    return this.get('periodTypes').map(type => {
      return {key:type, label:i18n.t('chart.period.'+type, {count:count}).toString().capitalize()};
    });
  }),

  aggregate: Ember.computed.alias('chart.aggregate'),
  aggregateTypes: ['FiveMinute', 'Hour', 'Day', 'Month', 'Year'],
  aggregateChoices: Ember.computed('aggregate', 'aggregateTypes', function() {
    const i18n = this.get('i18n');
    return this.get('aggregateTypes').map(type => {
      return {key:type, label:i18n.t('chart.aggregate.'+type).toString().capitalize()};
    });
  }),

  /**
   Flag if the current chart style supports the display of grouped data sets.

   @return {boolean} true if the chart style supports grouped data sets
  */
  canGroupSources: Ember.computed('chart.style', function() {
    const style = this.get('chart.style');
    return (style !== 'line'); // TODO: set this to what styles are explicitly supported
  }),

  willDestroy: Ember.on('willDestroyElement', function() {
    this.get('resizeService').off('debouncedDidResize', this, this.didResize);
  }),

  inserted: Ember.on('didInsertElement', function() {
    this.get('resizeService').on('debouncedDidResize', this, this.didResize);
    Ember.run.next(this, 'didResize');
  }),

  didResize() {
    const w = this.$().find('.app-chart-container').width();
    var width = this.get('w');
    if ( w !== width ) {
      this.set('chartWidth', w);
      console.log(`width: ${window.innerWidth}, height: ${window.innerHeight}, chartWidth: ${w}`);
    }
  },

  actions: {
    toggleUsePeriod() {
      this.toggleProperty('isUsePeriod');
    },

    toggleSettingsVisibility() {
      this.toggleProperty('isSettingsVisible');
      this.get('chart').save();
      Ember.run.next(this, 'didResize');
    },

    save() {
      this.get('chart').save();
    }
  }
});
