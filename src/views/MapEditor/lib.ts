import { requestLocalFile, serverURL } from "@/request"
import { _Array, forEachKvPair } from "@bestime/utils_base"
import { GeoJSON, Geometry, LineString, type VectorLayer } from "maptalks"

export type TDrawTypeKeys = 'LineString' | 'Point'


export function getDrawTypeList () {
  const list: {
    id: TDrawTypeKeys,
    label: string
  }[] = [
    {
      id: 'Point',
      label: '点'
    },
    {
      id: 'LineString',
      label: '线'
    }
  ]

  return list
}


export async function loadOldData (layer: VectorLayer) {
  const [lineRes, ponitRes] = await Promise.all([
    requestLocalFile<any>('/static/json/shand-lines.json'),
    requestLocalFile<any>('/static/json/shand-points.json'),
  ])
  const lineFeatures = lineRes.data.data.map(function (item: any) {
    const coordinates = _Array(item.pointsStr)      
    return {
      type: "Feature",
      geometry: {
        type: 'LineString',
        coordinates
      },
      properties: {
        name: item.name,
        id: item.id,
        groupName: item.type,
        editable: true,
        draggable: true
      }
    }
  })

  const pointFeatures: any[] = []
  forEachKvPair(ponitRes.data.data, function (list: any[]) {
    list.forEach(function (item) {
      if(!item.lng || !item.lat) {
        console.error(`点${item.name}没有经纬度`)
        return;
      }
      pointFeatures.push({
        type: "Feature",
        geometry: {
          type: 'Point',
          coordinates: [item.lng, item.lat]
        },
        properties: {
          name: item.name,
          id: item.id,
          groupName: item.type,
          editable: true,
          draggable: true
        }
      })
    })
  })



  const geojson = {
    features: [lineFeatures, pointFeatures].flat(),
    type: 'FeatureCollection'
  }
  console.log("res", geojson)
  const gmes = GeoJSON.toGeometry(geojson)
  gmes.forEach(function (item: Geometry) {
    console.log("item.type", item.type)
    if(item.type === 'LineString') {
      item.updateSymbol({
        lineColor: 'yellow',
        lineWidth: 2
      })
    } else if(item.type === 'Point') {
      item.updateSymbol({
        'markerFile'   : serverURL('@local', '/static/images/tobacco.png'),
        'markerWidth'  : 40,
        'markerHeight' : 40,
        'markerDx'     : 0,
        'markerDy'     : 0,
        markerHorizontalAlignment: 'middle',
        markerVerticalAlignment: 'middle',
      })
    }
    
  })
  layer.addGeometry(gmes)
}