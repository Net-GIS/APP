var editing_feature = null;
var moving_features = false;
var get_manipulated_coordinate_index_buffer = 5;
var click_buffer = 5;
var get_attached_lines_buffer = 5;
var manipulated = null;
var manipulated_sources_buffer_array = [];

var get_attached_lines = (point_feature) => {
    var point = window.MAP.mapbox.project(point_feature.geometry.coordinates);
    var buffer = get_attached_lines_buffer;
    var b = [window.MAP.mapbox.project([window.MAP.bounds.x, window.MAP.bounds.y]), window.MAP.mapbox.project([window.MAP.bounds.i, window.MAP.bounds.j])];
    var features = [];

    window.MAP.mapbox.queryRenderedFeatures([[point.x - buffer, point.y - buffer], [point.x + buffer, point.y + buffer]], {layers: ['lines']}).forEach((feature) => {
        features[feature.id] = feature;
    })
   

    var at = window.MAP.mapbox.queryRenderedFeatures(b, {layers: ['lines']}).filter((feature) => {
        return features[feature.id] !== undefined;
    })
    console.log(at)
    return at
}

var get_manipulated_coordinate_index = (attached_lines, point_feature) => { //gets the index of the coordinates that is being manipulated in a LineString
    console.log(attached_lines)
    var point = window.MAP.mapbox.project(point_feature.geometry.coordinates);
    var buffer = get_manipulated_coordinate_index_buffer;
    var indexes = [];
    var pt1 = turf.polygon([[[point.x - buffer, point.y - buffer],[point.x + buffer, point.y - buffer],[point.x + buffer, point.y + buffer],[point.x - buffer, point.y + buffer],[point.x - buffer, point.y - buffer]]]);
    attached_lines.forEach((feature, i) => {
        feature.geometry.coordinates.forEach((coordinate, j) => {
            var converted = window.MAP.mapbox.project(coordinate);
            var pt = turf.point([converted.x, converted.y]);
            if(turf.booleanPointInPolygon(pt, pt1)){
                indexes.push({line_index:i, coordinate_index:j, source:window.MAP.mapbox.getSource(feature.source)})
            }
        })
    })
    return {indexes:indexes, lines:attached_lines};
}

export default {
    actions:[
        {
            event_type:'click',
            func: (e) => {
                var buffer = click_buffer;
                var feature = window.UTILS.get_clicked_point(e);
                window.UTILS.toggle_point_highlight(feature);
                if(!moving_features){
                    if(feature != null){
                        moving_features = true;
                        editing_feature = window.MAP.mapbox.getSource(feature.properties.s_uid + '_hovered')._data.features.filter((f) => { return f.id == feature.id })[0];
                        manipulated = get_manipulated_coordinate_index(get_attached_lines(editing_feature), editing_feature);
                    }
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
                    manipulated.lines.forEach((feature, i) => {
                        console.log(feature.geometry.coordinates)
                        var f = feature;
                        if(manipulated.indexes[i] !== undefined){
                            f.geometry.coordinates[manipulated.indexes[i].coordinate_index] = [e.lngLat.lng, e.lngLat.lat];
                        }
                        window.UTILS.update_feature(f);
                        
                    })
                    editing_feature.geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];
                    window.UTILS.update_feature(editing_feature);
                }
            }
        },
        {
            event_type:'disable',
            func: (e) => {
                window.UTILS.toggle_point_highlight(editing_feature);
                editing_feature = null;
                manipulated = null;
                manipulated_sources_buffer_array = [];
                moving_features = false;
            }
        }
    ]
}