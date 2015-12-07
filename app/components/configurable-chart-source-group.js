import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'fieldset',
  classNameBindings: ['notFirst:uk-margin-top'],
  groupIndex: 0,
  notFirst: Ember.computed('groupIndex', function() {
    return (this.get('groupIndex') > 0);
  }),
  sourceGroup: null,
  isFixedGroupCount: true,
  fixedGroupCount: 2,

  actions : {
    togglePropertyVisibility(prop) {
      this.sendAction('togglePropertyVisibility', prop);
    },

    setPropertyColor(prop, color) {
      this.sendAction('setPropertyColor', prop, color);
    },

    removeProperty(propConfigId) {
      this.sendAction('removeProperty', propConfigId);
    },

    addNewSourceProperty(propConfigId) {
      const groupConfigId = this.get('sourceGroup.id');
      this.sendAction('addNewGroupedSourceProperty', groupConfigId, propConfigId);
      this.set('selectedNewSourcePropertyId', null);
      if ( !this.get('hasAvailablePropConfigs') ) {
        this.send('hideAddSourceConfigForm');
        this.set('selectedNewSourceId', null);
      }
    },


  },

});
