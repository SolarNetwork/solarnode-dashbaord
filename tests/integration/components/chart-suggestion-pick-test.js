import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('chart-suggestion-pick', 'Integration | Component | chart suggestion pick', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{chart-suggestion-pick}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#chart-suggestion-pick}}
      template block text
    {{/chart-suggestion-pick}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
