var startPoint = null;
var endPoint = null;

export default {
    actions:[
        {
            event_type:'click',
            func: (e) => {

                var is_connected = (line1, line2) => {
                    var line1Start = line1.geometry.coordinates[0];
                    var line1End = line1.geometry.coordinates[line1.geometry.coordinates.length - 1];
                    var line2Start = line2.geometry.coordinates[0];
                    var line2End = line2.geometry.coordinates[line2.geometry.coordinates.length - 1];
                
                    return (line1End[0] === line2Start[0] && line1End[1] === line2Start[1]) ||
                           (line1Start[0] === line2End[0] && line1Start[1] === line2End[1]);
                }

                if(window.UTILS.get_clicked_point(e) != null){
                    if(startPoint == null){
                        startPoint =  window.UTILS.get_clicked_point(e);
                    }else if(endPoint == null){
                        endPoint =  window.UTILS.get_clicked_point(e);
                    }
        
                    //query all lines in area//
                    if(endPoint != null && startPoint != null){
                        var matched_lines = [];

                        //create area from two points //
                        var render_area = window.UTILS.get_render_area();
                        var start = window.MAP.mapbox.project([render_area.x, render_area.y]);
                        var end = window.MAP.mapbox.project([render_area.i, render_area.j]);

                        matched_lines.push({id: startPoint.id, endpoints: [startPoint.geometry.coordinates, startPoint.geometry.coordinates], source: startPoint.source });
                        matched_lines.push({id: endPoint.id, endpoints: [endPoint.geometry.coordinates, endPoint.geometry.coordinates], source: endPoint.source});
                        window.MAP.mapbox.queryRenderedFeatures([start, end] , {layers: Object.keys(window.MAP.layers)}).forEach((feature, index) => {
                            //check if one of the lines endpoints = any of the endpoints in matched_lines
                            if(feature.geometry.type == 'LineString'){
                                var endpoints = [feature.geometry.coordinates[0], feature.geometry.coordinates[feature.geometry.coordinates.length - 1]];
                                matched_lines.forEach((line, i) => {
                                    line.endpoints.forEach((ep, j) => {
                                        //now turf.js check if the line are touching each other
                                        if(turf.booleanPointOnLine(turf.point(ep), turf.lineString(feature.geometry.coordinates))){
                                            matched_lines.push({id: feature.id, endpoints: endpoints, source: feature.source});
                                        }
                                    })
                                })
                            }
                        }) 

                        //iterate through matched lines and get there feature by id
                        var matched_lines_features = [];
                        matched_lines.forEach((feature, i) => {
                            window.UTILS.delete_feature(feature);
                        })
                    }  
                }
            }
        }
    ]
}