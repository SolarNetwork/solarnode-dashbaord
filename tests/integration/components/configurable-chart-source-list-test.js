import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('configurable-chart-source-list', 'Integration | Component | configurable chart source list', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{configurable-chart-source-list}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#configurable-chart-source-list}}
      template block text
    {{/configurable-chart-source-list}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
