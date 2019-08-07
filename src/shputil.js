import shp from 'shpjs';
import { readFileAsArraybuffer, readAsText } from './utils';

const dbfMimes = new Set(['application/dbase', 'application/x-dbase', 'application/dbf', 'application/x-dbf']);
const jsonMimes = new Set(['application/json', 'text/json', 'text/x-json']);

export default function parseFeaturesFromFiles(fileList) {
  let files;
  if (Array.isArray(fileList)) {
    files = fileList;
  } else {
    files = Array.from(fileList);
  }

  const zipFile = files.find(file => file.type === 'application/zip' || /\.zip$/i.test(file.name));
  const shpFile = files.find(file => /\.shp$/i.test(file.name)); // TODO: no mime?
  const dbfFile = files.find(file => dbfMimes.has(file.type) || /\.dbf$/i.test(file.name));
  const jsonFile = files.find(file => jsonMimes.has(file.type) || /\.json$/i.test(file.name));

  if (zipFile) {
    return readFileAsArraybuffer(zipFile)
      .then(data => shp(data).features);
  } else if (shpFile && dbfFile) {
    return Promise.all([readFileAsArraybuffer(shpFile), readFileAsArraybuffer(dbfFile)])
      .then(([shpBuffer, dbfBuffer]) => shp.combine([
        shp.parseShp(shpBuffer), shp.parseDbf(dbfBuffer)
      ]).features);
  } else if (shpFile) {
    return readFileAsArraybuffer(shpFile)
      .then(shpBuffer => (
        shp.parseShp(shpBuffer).map(geometry => ({ type: 'Feature', properties: {}, geometry }))
      ));
  } else if (jsonFile) {
    return readAsText(jsonFile)
      .then((text) => {
        const content = JSON.parse(text);
        if (content.type === 'Feature') {
          return [content];
        } else if (content.type === 'FeatureCollection') {
          return content.features;
        }
        throw new Error('File content is not valid GeoJSON');
      });
  }
  return Promise.reject(`Could not parse any features from the given file${files.length === 1 ? '' : 's'}.`);
}
