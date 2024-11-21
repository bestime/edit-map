<style lang="css" scoped>
.MapEditor {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  padding: 20px;
  .top {
    display: flex;
    align-items: center;
    margin: 0 0 10px 0;
    gap: 10px;
  }
  
  .floor-o2 {
    flex: 1;
    display: flex;
    align-items: center;
  }
  .map-root {
    flex: 1;
    align-self: stretch;
    border: red solid 1px;
    box-sizing: border-box;
  }
  .f2-rig {
    background: #f8f8f8;
    align-self: stretch;
    width: 400px;
    padding: 20px;
  }
  ul.info {
    list-style: none;
    margin: 0 0 0 0;
    padding: 0;
    li {
      display: flex;
      margin: 10px 0 0 0;
      padding: 0;
      list-style: none;
      align-items: center;
      b {
        width: 80px;
        flex-shrink: 0;
        padding: 0;
        line-height: normal;
        font-weight: normal;
        text-align:right;
        margin: 0 10px 0 0;
      }
    }
  }
}
</style>

<template>
  <div class="MapEditor">
    <div class="top">
      <el-select :modelValue="state.typeId" :disabled="state.mode !== 'draw'" placeholder="绘制类型" style="width: 100px" @change="onTypeChange">
        <el-option v-for="item in state.typeList" :key="item.id" :label="item.label" :value="item.id"/>
      </el-select>
      <el-radio-group :modelValue="state.mode" @change="onModeChange">
        <el-radio-button label="编辑" value="edit" />
        <el-radio-button label="绘制" value="draw" />
      </el-radio-group>
      <el-button @click="toExportGeoJson">导出Geojson</el-button>
    </div>
    
    <div class="floor-o2">
      <div class="map-root" ref="map-ref"></div>
      <div class="f2-rig" >
        <div v-if="state.currentEditGeo">
          <el-button @click="onSaveGeometry" type="primary">保存</el-button>
          <el-button type="warning" @click="toExportCurrentItem">单体导出</el-button>
          <el-button @click="onDeleteGeometry" type="danger">删除</el-button>

        </div>
        
        <ul class="info" v-if="state.currentEditGeo">
          <li>
            <b>经纬度</b>
            <el-input :value="state.activeGeoInfo.coordinates" disabled/>
          </li>
          <li>
            <b>ID</b>
            <el-input v-model="state.activeGeoInfo.id" disabled/>
          </li>
          <li>
            <b>所属分组</b>
            <el-input v-model="state.activeGeoInfo.groupName"/>
          </li>
          <li>
            <b>名字</b>
            <el-input v-model="state.activeGeoInfo.name"/>
          </li>
          
        </ul>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { Map, TileLayer, DrawTool, ImageLayer,type HandlerFnResultType, VectorLayer, LineString, Marker, GeoJSON, type Geometries, Polygon } from 'maptalks'
import { onMounted, onUnmounted, reactive, useTemplateRef } from 'vue';
import type { TDrawTypeKeys } from './lib'
import { getDrawTypeList, loadOldData } from './lib'
import { trim } from '@bestime/utils_base';
import { requestLocalFile, serverURL } from '@/request'

interface IState {
  mode: 'draw' | 'edit',
  typeId: TDrawTypeKeys,
  typeList: ReturnType<typeof getDrawTypeList>,
  currentEditGeo?: TEditCbEvent['owner'],
  mapBackImageUrl: string,
  activeGeoInfo: {
    name: string,
    groupName: string,
    id: string
    coordinates: number[]
  }
}


type TEditCbEvent = {
  owner: LineString | Marker
}

const elMap = useTemplateRef('map-ref')
let iMap: Map | undefined;
let drawTool: DrawTool | undefined
let drawLayer: VectorLayer | undefined
let boundryLayer: VectorLayer | undefined
let imgLayer: ImageLayer | undefined


const state = reactive<IState>({
  mode: 'edit',
  typeId:'Point',
  mapBackImageUrl: serverURL('@local', '/static/images/guan_wang.png'),
  typeList: getDrawTypeList(),
  activeGeoInfo: {
    groupName: '',
    name: '',
    id: '',
    coordinates: []

  }
})



function onDrawEnd (param?: HandlerFnResultType) {
  if(!param || !drawLayer) return;

  const oGeometry = param.geometry
  
  console.log('绘制完毕', oGeometry);
  drawLayer.addGeometry(oGeometry);
  oGeometry.setProperties({
    editable: true,
    draggable: true,
  })  
}



function onTypeChange (id: TDrawTypeKeys) {
  state.typeId = id
  if(!iMap || !drawTool) return;
  if(state.mode === 'draw') {
    drawTool.enable()
  } else {
    drawTool.disable()
  }

  drawTool.setMode(id)
}

function stopAllEdit () {
  drawLayer?.forEach(function (item) {
    item?.endEdit()
  })
}

function onModeChange (ev: any) {
  const mode:IState['mode'] = ev
  state.mode = mode
  switch(mode) {
    case 'draw':
      disabledEditMode();
      drawTool?.setMode(state.typeId).enable()
      break;
    case 'edit':
      enableEditMode()
      break;
  }
}

function disabledEditMode () {
  drawLayer?.forEach(function (oGeometry) {
    oGeometry.removeMenu()
  })
}

function enableEditMode () {
  console.log("启用编辑")
  drawTool?.disable()
  drawLayer?.forEach(function (oGeometry) {
    function onEditItem (ev:TEditCbEvent) {
      stopAllEdit()
      ev.owner.startEdit()
      state.currentEditGeo = ev.owner
      state.activeGeoInfo.name = trim(ev.owner.properties.name)
      state.activeGeoInfo.id = trim(ev.owner.properties.id)
      state.activeGeoInfo.groupName = trim(ev.owner.properties.groupName)
      const ct = ev.owner.getCenter()
      state.activeGeoInfo.coordinates = [ct.x, ct.y]
    }
    

    oGeometry.setMenu({
      items: [
        {item: '编辑', click: onEditItem },
      ]
    } as any).closeMenu();
  })
}

function onDeleteGeometry () {
  if(state.currentEditGeo) {
    state.currentEditGeo.remove()
    state.currentEditGeo = undefined
  }
  
}

function onSaveGeometry () {
  if(state.currentEditGeo) {
    state.currentEditGeo.endEdit()
    Object.assign(state.currentEditGeo.properties, state.activeGeoInfo)
    state.currentEditGeo = undefined
  }
}

function toExportGeoJson () {
  const data = drawLayer?.toJSON()
  console.log("导出数据", data)
}

function initMap () {
  iMap = new Map(elMap.value!, {
    center: [118.5659864765625, 36.36900422089864],
    zoom: 8,
    attribution: false,
    control: false,
    doubleClickZoom: false,
    panAnimation: false,
    rotateAnimation: false,
    pitch: 0,
    dragPitch: true,
    // baseLayer: new TileLayer('base', {
    //   urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    //   subdomains: ['a','b','c','d'],
    //   attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>'
    // })
  })

  drawTool = new DrawTool({
    mode: state.typeId,
  }).addTo(iMap).disable()
  drawLayer = new VectorLayer('vector', [], {
    zIndex: 10,
    forceRenderOnMoving: true,
    forceRenderOnZooming: true,
    forceRenderOnRotating: true
  }).addTo(iMap);
  boundryLayer = new VectorLayer('boundry', [], {
    forceRenderOnMoving: true,
    forceRenderOnZooming: true,
    forceRenderOnRotating: true
  }).addTo(iMap);
  imgLayer = new ImageLayer('bg-img', [], {
    opacity: 0.5,
    forceRenderOnMoving: true,
    forceRenderOnZooming: true,
    forceRenderOnRotating: true
  }).addTo(iMap);
  drawTool.on('drawend', onDrawEnd);

  

  iMap.on('click', function (ev: any) {
    const center = [ev.coordinate.x, ev.coordinate.y]

    console.log("地图点击", center)
  })

  requestLocalFile('/static/json/370000_full.json').then(function (v) {
    const gmes = GeoJSON.toGeometry(v.data)
    gmes.forEach(function (item: Polygon) {
      item.updateSymbol({
        lineColor: 'red',
        lineWidth: 2
      })
    })
    boundryLayer?.addGeometry(gmes)
  })

  

  imgLayer.setImages([
    {
      url : state.mapBackImageUrl,
      // [左上角，右下角]
      extent: [
      114.5230378403939, 38.799170851883125,
      123.0492214375, 33.91946401318846
      ],
      opacity : 1
    }
  ])
}


function toExportCurrentItem () {
  if(!state.currentEditGeo) return;
  Object.assign(state.currentEditGeo.properties, state.activeGeoInfo)
  const v = state.currentEditGeo.toGeoJSON()
  console.log("单体导出", v)
}



onMounted(function () {
  initMap()
  loadOldData(drawLayer!).then(function () {
    onModeChange(state.mode)
  })
})

onUnmounted(function () {
  iMap?.remove()
})

</script>