import { requestLocalFile } from "@/request"
import { _Array } from "@bestime/utils_base"
import { GeoJSON, LineString, type VectorLayer } from "maptalks"

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
  const res = await requestLocalFile<any>('/static/json/shand-lines.json')
  const data = res.data.data.map(function (item: any) {
    const coordinates = _Array(item.pointsStr)      
    return {
      type: "Feature",
      geometry: {
        type: 'MultiLineString',
        coordinates: [coordinates]
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

  const geojson = {
    features: data,
    type: 'FeatureCollection'
  }
  console.log("res", geojson)
  const gmes = GeoJSON.toGeometry(geojson)
  gmes.forEach(function (item: LineString) {
    item.updateSymbol({
      lineColor: 'blue',
      lineWidth: 2
    })
  })
  layer.addGeometry(gmes)
}