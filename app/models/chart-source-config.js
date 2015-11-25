import DS from 'ember-data';

export default DS.Model.extend({
  chart: DS.belongsTo('chart-config', {inverse:'sources'}),
  source: DS.attr('string'),
  title: DS.attr('string'),
  props: DS.attr(), // array of string
  propsMeta: DS.attr() // object like {prop:{unit:'W'}}
});
