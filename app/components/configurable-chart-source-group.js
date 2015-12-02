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
      prop.toggleProperty('isHidden');
    },
  },

});
