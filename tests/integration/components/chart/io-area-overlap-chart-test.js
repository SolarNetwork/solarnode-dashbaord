import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('chart/io-area-overlap-chart', 'Integration | Component | chart/io area overlap chart', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{chart/io-area-overlap-chart}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#chart/io-area-overlap-chart}}
      template block text
    {{/chart/io-area-overlap-chart}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
