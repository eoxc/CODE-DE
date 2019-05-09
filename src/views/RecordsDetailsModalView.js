import ModalView from 'eoxc/src/core/views/ModalView';
import OpenLayersMapView from 'eoxc/src/contrib/OpenLayers/OpenLayersMapView';
import RecordDetailsView from 'eoxc/src/search/views/RecordDetailsView';

import FiltersModel from 'eoxc/src/core/models/FiltersModel';
import HighlightModel from 'eoxc/src/core/models/HighlightModel';
import MapModel from 'eoxc/src/core/models/MapModel';
import LayersCollection from 'eoxc/src/core/models/LayersCollection';

import { isRecordDownloadable } from 'eoxc/src/download';

import template from './RecordsDetailsModalView.hbs';

const RecordsDetailsModalView = ModalView.extend({
  template,
  templateHelpers() {
    return {
      title: '',
      hasNext: this.currentRecordIndex < this.records.length - 1,
      hasPrev: this.currentRecordIndex > 0,
      hasMore: this.records.length > 1,
      keepZoom: this.keepZoom.enabled,
    };
  },

  events: {
    'click .records-next': 'onRecordsNextClicked',
    'click .records-prev': 'onRecordsPrevClicked',
    'click .layer-options': 'onLayerOptionsClicked',
    'shown.bs.modal': 'onModalShown',
    'change .is-selected': 'onDownloadSelectionChange',
    'click .keepZoom': 'onKeepZoomChanged',
  },

  initialize(options) {
    this.records = options.records;
    this.currentRecordIndex = 0;

    this.baseLayersCollection = options.baseLayersCollection;
    this.overlayLayersCollection = options.overlayLayersCollection;
    this.layersCollection = options.layersCollection;
    this.highlightFillColor = options.highlightFillColor;
    this.highlightStrokeColor = options.highlightStrokeColor;

    this.filterFillColor = options.filterFillColor;
    this.filterStrokeColor = options.filterStrokeColor;
    this.filterOutsideColor = options.filterOutsideColor;
    this.firstRecordShow = true;

    this.keepZoom = typeof options.keepZoom !== 'undefined' ? options.keepZoom : { enabled: false };
    this.mapModel = new MapModel({ center: [0, 0], zoom: 5, noclick: true });
    this.highlightModel = new HighlightModel();
    this.filtersModel = new FiltersModel();
  },

  onModalShown() {
    this.updateRecord(...this.records[this.currentRecordIndex]);
    this.firstRecordShow = false;
  },

  updateRecord(recordModel, searchModel) {
    let time = recordModel.get('properties').time;
    if (time instanceof Date) {
      time = [time, time];
    }
    const layerModel = searchModel.get('layerModel');
    const displayParams = layerModel.get('detailsDisplay') || layerModel.get('display');
    this.mapModel.set('time', time);
    this.mapView = new OpenLayersMapView({
      mapModel: this.mapModel,
      filtersModel: this.filtersModel,
      highlightModel: this.highlightModel,
      baseLayersCollection: this.baseLayersCollection,
      overlayLayersCollection: this.overlayLayersCollection,
      layersCollection: new LayersCollection([layerModel]),
      highlightFillColor: this.highlightFillColor,
      highlightStrokeColor: this.highlightStrokeColor,
      filterFillColor: this.filterFillColor,
      filterStrokeColor: this.filterStrokeColor,
      filterOutsideColor: this.filterOutsideColor,
      staticHighlight: true,
      useDetailsDisplay: true,
    });
    const detailsView = new RecordDetailsView({
      model: recordModel,
      mapModel: this.mapModel,
      mapView: this.mapView,
      descriptionTemplate: layerModel.get('search.descriptionTemplate'),
    });
    this.showChildView('content', detailsView);

    this.filtersModel.set('area', recordModel.attributes.geometry);

    if (this.firstRecordShow || !this.keepZoom.enabled) {
      // normal behavior - fit mapview to feature
      this.mapModel.show(recordModel.attributes);
    } else {
      // just update map center to center of record bbox, do not change zoom
      const centerLon = (recordModel.attributes.bbox[0] + recordModel.attributes.bbox[2]) / 2.0;
      const centerLat = (recordModel.attributes.bbox[1] + recordModel.attributes.bbox[3]) / 2.0;
      this.mapModel.set('center', [centerLon, centerLat]);
      this.mapModel.trigger('change:center', this.mapModel);
      this.mapModel.trigger('change:zoom', this.mapModel);
    }
    this.highlightModel.highlight(recordModel.attributes);

    this.$('.modal-title').text(`${layerModel.get('displayName')} - ${time[0].toISOString()}`);
    this.$('.records-prev').toggleClass('disabled', !(this.currentRecordIndex > 0));
    this.$('.records-next').toggleClass('disabled', !(this.currentRecordIndex < this.records.length - 1));
    this.$('.current-record').text(this.currentRecordIndex + 1);
    this.$('.record-count').text(this.records.length);

    this.$('.layer-options').toggle(!!displayParams.options);

    const downloadSelection = searchModel.get('downloadSelection');
    const isSelectedForDownload = downloadSelection.findIndex(model => (
      model.get('id') === recordModel.get('id')
    )) !== -1;
    this.$('.is-selected').prop('checked', isSelectedForDownload);
    this.$('.is-selected').parent().toggle(!!isRecordDownloadable(layerModel, recordModel));
  },

  onRecordsPrevClicked() {
    if (this.currentRecordIndex > 0) {
      this.currentRecordIndex -= 1;
      this.updateRecord(...this.records[this.currentRecordIndex]);
    }
  },

  onRecordsNextClicked() {
    if (this.currentRecordIndex < this.records.length - 1) {
      this.currentRecordIndex += 1;
      this.updateRecord(...this.records[this.currentRecordIndex]);
    }
  },

  onLayerOptionsClicked() {
    const searchModel = this.records[this.currentRecordIndex][1];
    const layerModel = searchModel.get('layerModel');
    layerModel.trigger('show-options', layerModel, true);
  },

  onDownloadSelectionChange() {
    const [recordModel, searchModel] = this.records[this.currentRecordIndex];
    const downloadSelection = searchModel.get('downloadSelection');
    if (this.$('.is-selected').is(':checked')) {
      downloadSelection.add(recordModel);
    } else {
      downloadSelection.remove(recordModel);
    }
  },

  onKeepZoomChanged() {
    this.keepZoom.enabled = this.$('.keepZoom').is(':checked');
  },
});

export default RecordsDetailsModalView;
