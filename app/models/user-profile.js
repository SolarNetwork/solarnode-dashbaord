import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  user: DS.belongsTo('user'),
  isSetup: DS.attr('boolean'),
  isHideDataPropHelp: DS.attr('boolean'),

  charts: DS.hasMany('chart-config', {inverse:'profile'}),
  chartProperties: DS.hasMany('chart-property-config', {inverse:'profile'}),
  chartSources: DS.hasMany('chart-source-config', {inverse:'profile'}),
  nodes: DS.hasMany('node-config', {inverse:'profile'}),

  hasCharts: Ember.computed('charts.[]', function() {
    return (this.get('charts.length') > 0);
  }),

});
