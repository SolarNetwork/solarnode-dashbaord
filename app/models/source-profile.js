import DS from 'ember-data';

export default DS.Model.extend({
  profile: DS.belongsTo('user-profile', {inverse:'sources'}),
  source: DS.attr(),
  props: DS.attr() // array of string
});
