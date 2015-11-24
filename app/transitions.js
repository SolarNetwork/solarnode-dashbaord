import Ember from "ember";

export default function() {
  const duration = (Ember.testing ? 0: 300);
  this.setDefault({
    duration: duration
  });

  // Login Form
  this.transition(
    this.hasClass('app-message'),
    this.toValue(true),
    this.use('toUp'),
    this.reverse('toDown')
  );
  this.transition(
    this.hasClass('show-token'),
    this.toValue(true),
    this.use('toDown'),
    this.reverse('toUp')
  );
  this.transition(
    this.toRoute('login'),
    this.useAndReverse('crossFade')
  );

  // Configurable chart
  this.transition(
    this.hasClass('show-period'),
    //this.toValue(true),
    this.useAndReverse('crossFade'),
  );

}
