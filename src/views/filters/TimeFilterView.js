import Marionette from 'backbone.marionette';
import moment from 'moment';
import 'moment-timezone';
import 'eonasdan-bootstrap-datetimepicker';
import 'eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css';

import template from './TimeFilterView.hbs';


const TimeFilterView = Marionette.ItemView.extend({
  template,
  className: 'panel panel-default',
  events: {
    'dp.change .datetime': 'onDateInputChange',
    'click .tool-show-time': 'onShowTimeClicked',
    'click .tool-clear-time': 'onClearTimeClicked',
  },

  initialize(options) {
    this.mapModel = options.mapModel;
    this.filtersModel = options.filtersModel;

    this.listenTo(this.mapModel, 'change:time', this.onMapTimeChanged);
    this.listenTo(this.filtersModel, 'change:time', this.onFiltersTimeChanged);
  },

  // Marionette event listeners

  onBeforeShow() {
    ['start', 'end'].forEach((label) => {
      const $elem = this.$(`.datetime.${label}`);
      $elem.datetimepicker({
        locale: 'en',
        format: 'YYYY-MM-DD HH:mm:ss',
        dayViewHeaderFormat: 'YYYY-MM',
        useCurrent: false,
        showTodayButton: true,
        showClose: true,
        timeZone: 'UTC',
        keyBinds: {
          enter() {
            const value = $elem.find('input').val();
            this.date(value);
            this.viewDate(value);
            this.hide();
          },
          left: null,
          right: null
        }
      });
    });
  },

  onAttach() {
    this.onFiltersTimeChanged(this.filtersModel);
    this.onMapTimeChanged();
  },

  // DOM event listeners

  onDateInputChange() {
    const start = this.$('.datetime.start').data('DateTimePicker').date();
    const end = this.$('.datetime.end').data('DateTimePicker').date();

    if (!this.updatingTime && start && end) {
      const startDate = start.toDate();
      const endDate = end.toDate();
      this.filtersModel.set('time',
        (startDate < endDate) ? [startDate, endDate] : [endDate, startDate]
      );
    }
  },

  onShowTimeClicked() {
    this.filtersModel.show(this.filtersModel.get('time'));
  },

  onClearTimeClicked() {
    this.filtersModel.unset('time');
  },

  // model event listeners

  onMapTimeChanged() {
    const time = this.mapModel.get('time');
    this.$('.map-time-start').val(moment.utc(time[0]).format('YYYY-MM-DD HH:mm:ss'));
    this.$('.map-time-end').val(moment.utc(time[1]).format('YYYY-MM-DD HH:mm:ss'));
  },

  onFiltersTimeChanged(filtersModel) {
    const time = filtersModel.get('time');
    this.updatingTime = true;
    if (time) {
      this.$('.datetime.start').data('DateTimePicker').date(moment.utc(time[0]));
      this.$('.datetime.end').data('DateTimePicker').date(moment.utc(time[1]));
      this.$('.datetime.start').data('DateTimePicker').viewDate(moment.utc(time[0]));
      this.$('.datetime.end').data('DateTimePicker').viewDate(moment.utc(time[1]));
      this.$('.time-buttons').slideDown();
      this.$('#map-time-wrapper').slideUp();
    } else {
      const mapTime = this.mapModel.get('time');
      this.$('.datetime.start').data('DateTimePicker').date(moment.utc(mapTime[0]));
      this.$('.datetime.end').data('DateTimePicker').date(moment.utc(mapTime[1]));
      this.$('.datetime.start').data('DateTimePicker').viewDate(moment.utc(mapTime[0]));
      this.$('.datetime.end').data('DateTimePicker').viewDate(moment.utc(mapTime[1]));
      this.$('.time-buttons').slideUp();
      this.$('#map-time-wrapper').slideDown();
    }
    this.updatingTime = false;
  },
});

export default TimeFilterView;
