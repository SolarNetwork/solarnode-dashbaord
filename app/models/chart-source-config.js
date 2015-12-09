import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  profile: DS.belongsTo('user-profile', {inverse:'chartSources'}),
  nodeId: DS.attr('number'),
  source: DS.attr('string'),
  title: DS.attr('string'),

  displayName: Ember.computed('source', 'title', function() {
    const title = this.get('title');
    return (title && title !== '' ? title : this.get('source'));
  }),

});
