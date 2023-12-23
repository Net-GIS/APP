var debounced = [];

const UTILS = {
    rgb_to_hex: (rgb) => {
        rgb = rgb.split('(')[1].split(')')[0].split(',')
        var r = parseInt(rgb[0]);
        var g = parseInt(rgb[1]);
        var b = parseInt(rgb[2]);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    hex_to_rgb: (hex) => {
        if(hex[0] == '#'){
            hex = hex.slice(1);
        }
        return `rgb(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)})`;
    },

    get_clicked_point: (e) => {
        var buffer = 5;
        var symbol_hover_layers = window.MAP.loaded_images.map((image) => { return image + '_hovered' });
        var feature = window.MAP.mapbox.queryRenderedFeatures([[e.point.x - buffer, e.point.y - buffer], [e.point.x + buffer, e.point.y + buffer]], {layers:[...window.MAP.loaded_images, ...symbol_hover_layers] })[0];

        if(feature && feature.geometry.type == 'Point'){
            return  feature
        }else{
            return null;
        }
    },

    get_render_area(){
        var bounds = window.MAP.mapbox.getBounds();
        var topLeft = bounds.getNorthWest();
        var bottomRight = bounds.getSouthEast();
        return {x: topLeft.lng, y: topLeft.lat, i: bottomRight.lng, j: bottomRight.lat}
    },

    get_render_area2(){
        var render_area = window.UTILS.get_render_area();
        var start = window.MAP.mapbox.project([render_area.x, render_area.y]);
        var end = window.MAP.mapbox.project([render_area.i, render_area.j]);
        return [start, end]
    },

    debounce(func, timeout){
        if(window.debounce_timeout){
            clearTimeout(window.debounce_timeout);
        }
        window.debounce_timeout = setTimeout(func, timeout)
    },

    delete_feature(feature){
        var source = window.MAP.mapbox.getSource(feature.source);
        source._data.features = source._data.features.filter((f) => {
            return f.id !== feature.id;
        });
        source.setData(source._data);
    },

    update_feature(feature){
        this.delete_feature(feature);
        var source = window.MAP.mapbox.getSource(feature.source);
        source._data.features.push(feature);
        source.setData(source._data);
    },

    toggle_point_highlight(feature){
        if(feature){
            if(feature.properties.hover){
                this.unhighlight_point(feature);
            }else{
                this.highlight_point(feature);
            }
        }
    },

    highlight_point(feature){
        if(feature.geometry.type == 'Point'){
            this.delete_feature(feature);
            feature.properties.hover = true;
            var s = window.MAP.mapbox.getSource(feature.source + '_hovered');
            feature.source = feature.source + '_hovered';
            s._data.features.push(feature);
            s.setData(s._data);
        }
    },

    unhighlight_point(feature){
        if(feature.geometry.type == 'Point'){
            this.delete_feature(feature);
            feature.properties.hover = false;
            var s = window.MAP.mapbox.getSource(feature.source.replace('_hovered', ''));
            feature.source = feature.source.replace('_hovered', '');
            s._data.features.push(feature);
            s.setData(s._data);
        }
    }
}

export default UTILS;