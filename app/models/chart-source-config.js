import DS from 'ember-data';

export default DS.Model.extend({
  source: DS.attr('string'),
  title: DS.attr('string'),
  props: DS.attr(), // array of string
  propsMetadata: DS.attr(), // object like {prop:{unit:'W'}}
  group: DS.belongsTo('chart-source-group', {inverse:'sources'})
});
