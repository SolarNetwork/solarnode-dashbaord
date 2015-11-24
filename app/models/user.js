import DS from 'ember-data';

export default DS.Model.extend({
  nodeId: DS.attr(),
  profile: DS.belongsTo('user-profile')
});
