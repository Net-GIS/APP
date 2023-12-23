import API from './api.js';
import KM from './KeyboardManager.js';
import {Map, Behavior} from './Map.js';
import BehaviorManager from './BehaviorManager.js';
import UTILS from './utils.js';
//run the code in Component.js
import Component from './components/Component.js';
import Controls from './components/Controls.js';
import LayersPanel from './components/LayersPanel.js';
import LayersList from './components/LayersList.js';
import StatusBar from './components/StatusBar.js';
import ToolsPanel from './components/ToolsPanel.js';
import ContextMenu from './components/ContextMenu.js';


class App{
    constructor(){
        window.API.get_user().then((user) => {
            window.MAP = new Map();
            window.KM = new KM();
            window.BM = new BehaviorManager();
            window.UTILS = UTILS;
            window.Behavior = Behavior;
            window.LayerPanel = new LayersList();
            window.StatusBar = new StatusBar();
            window.ToolsPanel = new ToolsPanel();
            window.ContextMenu = new ContextMenu();
            window.User = user
            //BuildBehaviors();
            window.MAP.mapbox.getContainer().append(window.LayerPanel, window.StatusBar, window.ToolsPanel, window.ContextMenu);
            window.KM.create_key_bind(['Control', 'r'], (e) => {
                window.location.reload();
            })
            document.body.append(window.MAP)
            window.MAP.mapbox.resize();

            var draw = new MapboxDraw({
                displayControlsDefault: false,
                defaultMode:'simple_select',
                keybindings: true,
                controls: {
                    simple_select: true,
                }
            });
            window.MAP.mapbox.addControl(draw);



            var editing_feature = null;
            var moving_features = false;
            var originalSource = null;
            var get_manipulated_coordinate_index_buffer = 15;
            var click_buffer = 5;
            var get_attached_lines_buffer = 15;
            var manipulated = null;
            var manipulated_sources_buffer_array = [];

            var get_attached_lines = (point) => {
                var buffer = get_attached_lines_buffer;
                return window.MAP.mapbox.queryRenderedFeatures([[point.x - buffer, point.y - buffer], [point.x + buffer, point.y + buffer]], {layers: Object.keys(window.MAP.layers)}).filter((feature) => {
                    return feature.geometry.type == 'LineString';
                })
            }

            var get_manipulated_coordinate_index = (attached_lines, point) => { //gets the index of the coordinates that is being manipulated in a LineString
                var buffer = get_manipulated_coordinate_index_buffer;
                var indexes = [];
                var poly = turf.polygon([[
                    [point.x - buffer, point.y - buffer],
                    [point.x + buffer, point.y - buffer],
                    [point.x + buffer, point.y + buffer],
                    [point.x - buffer, point.y + buffer],
                    [point.x - buffer, point.y - buffer]
                ]]);
                
                
                attached_lines.forEach((feature, i) => {
                    feature.geometry.coordinates.forEach((coordinate, j) => {
                        var converted = window.MAP.mapbox.project(coordinate);
                        var pt = turf.point([converted.x, converted.y]);
                        if(turf.booleanPointInPolygon(pt, poly)){
                            indexes.push({line_index:i, coordinate_index:j, source:window.MAP.mapbox.getSource(feature.source)})
                        }
                    })
                })
                return {indexes:indexes, lines:attached_lines};
            }

            var delete_feature = (sourceData, feature) => {
                return sourceData.features.filter((f) => {
                    return f.id !== feature.id;
                });
            }


            var update = (e) => {
                features_to_update.forEach((feature) => {
                    
                })
            }

            var add_point_behavior = {
                name:'add_point',
                actions:[
                    {
                        event_type:'click',
                        func: (e) => {
                            if(!moving_features){
                                var buffer = click_buffer;
                                window.MAP.mapbox.queryRenderedFeatures([[e.point.x - buffer, e.point.y - buffer], [e.point.x + buffer, e.point.y + buffer]], {layers: Object.keys(window.MAP.layers)}).forEach((feature, index) => {
                                    if(feature){
                                        if(feature.geometry.type == 'Point'){
                                            moving_features = true;
                                            editing_feature = feature;
                                            originalSource = window.MAP.mapbox.getSource(editing_feature.source)
                                            manipulated = get_manipulated_coordinate_index(get_attached_lines(e.point), e.point)
                                        }
                                    }
                                })
                            }else{
                                editing_feature = null;
                                manipulated = null;
                                manipulated_sources_buffer_array = [];
                                moving_features = false;
                            }
                        }
                    },
                    {
                        event_type:'mousemove',
                        func: (e) => {
                            if(moving_features){
                                editing_feature.geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];
                                originalSource._data.features = delete_feature(originalSource._data, editing_feature)
                                originalSource._data.features.push(editing_feature);
                                manipulated.lines.forEach((feature, i) => {
                                    if(manipulated.indexes[i] !== undefined){
                                        feature.geometry.coordinates[manipulated.indexes[i].coordinate_index] = [e.lngLat.lng, e.lngLat.lat];
                                        var __sourceData = manipulated.indexes[i].source._data
                                        __sourceData.features = delete_feature(__sourceData, feature)
                                        __sourceData.features.push(feature);
                                        manipulated.indexes[i].source.setData(__sourceData);
                                    }
                                })
                                originalSource.setData(originalSource._data);
                            }
                        }
                    }
                ]
            }
            window.BM.add_behavior(add_point_behavior)
        })
    }
}


function BuildBehaviors(){
    var isSelecting = false;
    var selectionBox = null;
    var hoveredPolygonId = null;
    window.MAP.Behavior({
        name:'select',
        listeners:[
            'mousedown',
            'mouseup',
            'mousemove'
        ],
        callback: (e) => {
            e.originalEvent.preventDefault();
            window.MAP.mapbox.getCanvas().style.cursor = 'crosshair'
            if(e.type == 'mousemove'){
                if(isSelecting){
                    // Adjust width and xy position of the selection box div
                    selectionBox.style.width = Math.abs(e.originalEvent.clientX - selectionBox.getBoundingClientRect().left) + 'px';
                    selectionBox.style.height = Math.abs(e.originalEvent.clientY - selectionBox.getBoundingClientRect().top) + 'px';
                    selectionBox.style.left = (e.originalEvent.clientX < selectionBox.getBoundingClientRect().left) ? e.originalEvent.clientX + 'px' : selectionBox.getBoundingClientRect().left + 'px';
                    selectionBox.style.top = (e.originalEvent.clientY < selectionBox.getBoundingClientRect().top) ? e.originalEvent.clientY + 'px' : selectionBox.getBoundingClientRect().top + 'px';
                }
            }
            if(e.type == 'mousedown'){
                isSelecting = true;
                window.MAP.mapbox.dragPan.disable();
                window.MAP.mapbox.dragRotate.disable();

                // Create a div element for the selection box
                selectionBox = document.createElement('div');
                selectionBox.Style({
                    display:'block',
                    position: 'absolute',
                    background:"transparent",
                    outline:'1px dashed white',
                    width:'20px',
                    height:'20px',
                })

                selectionBox.className = 'selection-box';
                window.MAP.mapbox.getContainer().append(selectionBox);

                // Set the initial position of the selection box
                selectionBox.style.left = e.originalEvent.clientX + 'px';
                selectionBox.style.top =  e.originalEvent.clientY + 'px';
            }

            if(e.type == 'mouseup'){
                    isSelecting = false;
                    var sel_rect = selectionBox.getBoundingClientRect()
                    window.MAP.mapbox.getCanvas().style.cursor = '';
                    //window.MAP.behaviors['select'].stop();
                    window.MAP.handle_selected_area(sel_rect);
                    var md = (ev) => {
                        ev.preventDefault();
                        console.log(ev)
                        if(ev.button == 0){
                            var sel_boxs = document.getElementsByClassName('selection-box')
                            for(var i = 0; i < sel_boxs.length; i++){
                                sel_boxs[i].remove();
                            }
                            window.MAP.unhighlight_selection(window.MAP.mapbox.queryRenderedFeatures(sel_rect));
                            document.body.removeEventListener('mousedown', md)
                        }else if(ev.button == 2){
                            ev.preventDefault()
                            console.log('right click')
                            window.ContextMenu.spawn({items:[
                                {
                                    icon:'content_copy', 
                                    name:'Copy', 
                                    callback: (e) => {
                                        // window.Clipboard = queryRenderedFeatures(selectionBox.getBoundingClientRect());
                                    }
                                },
                                {
                                    icon:'delete',
                                    name:'Delete',
                                    callback: (e) => {
                                        var layers_to_query = Object.keys(window.MAP.layers).filter((layer) => {
                                            return !'roads,counties'.includes(layer)
                                        })
                                        var bounds = [[sel_rect.x, sel_rect.y], [sel_rect.x + sel_rect.width , sel_rect.y + sel_rect.height]]
                                        alert(`Deleted ${window.MAP.mapbox.queryRenderedFeatures(bounds, {layers: layers_to_query}).length} features}`)
                                    }
                                },
                                {
                                    icon:'info',
                                    name:'test3', 
                                    callback: (e) => {
                                        console.log('test3')
                                    }
                                }
                            ], x:ev.clientX, y:ev.clientY})
                        }
                    }
                    document.body.addEventListener('mousedown', md)
            }
        },
        cleanup: () => {
            window.MAP.mapbox.getCanvas().style.cursor = '';
            window.MAP.mapbox.dragPan.enable();
            window.MAP.mapbox.dragRotate.enable();
        }
    })

    window.MAP.Behavior({
        name:'point_add',
        listeners:[
            'mousedown',
            'mouseup',
            'mousemove'
        ],
        init:() => { //init is binded to the Behavior class itself so this references the Behavior class
            
        },
        callback: (e) => {
            console.log(this.test)
            if(e.type == 'mousedown'){}
        }
    })
}

function style_body(){
    document.body.style.display = "block";
    document.body.style.margin = "0";
    document.body.style.height = "100vh";
    document.body.style.width = "100vw";
    document.body.style.userSelect = "none";
}


window.onload = () => {
    style_body();
    window.API = API;
    new App();
}

