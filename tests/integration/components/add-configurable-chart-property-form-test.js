import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('add-configurable-chart-property-form', 'Integration | Component | add configurable chart property form', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{add-configurable-chart-property-form}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#add-configurable-chart-property-form}}
      template block text
    {{/add-configurable-chart-property-form}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
