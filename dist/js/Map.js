class Map extends HTMLElement{
    constructor(){
        super()
        this.Style({
            position: "absolute",
            top: "0px",
            left: "0px",
            width: "100%",
            height: "100%",
        })
        this.mapbox = this.create_map();
        this.layers = {};
        this.l_uids = [];
        this._layers = [];
        this.layer_states = {};
        this.behaviors = {}
        this.loaded_images = [];

        this.bounds = {
            x: -95.774704,
            y: 40.61364,
            i: -89.098843,
            j: 35.995683
        }

        this.mapbox.on('style.load', () => {
            this.reload_layers();
        })

        this.mapbox.on('zoom', () => {
            window.StatusBar.update({zoom_level: this.mapbox.getZoom()})
            window.localStorage.setItem('zoom_level', this.mapbox.getZoom())
        })

        this.mapbox.on('moveend', () => {
            window.localStorage.setItem('center', JSON.stringify(this.mapbox.getCenter()))
        })

        return this;
    }

    create_layers(){
            this.mapbox.addSource('lines', {
                type: "geojson",
                data:{
                    type: "FeatureCollection",
                    features: []
                }
            })

            this.mapbox.addLayer({
                id: 'lines',
                type: 'line',
                source: 'lines',
                paint: {
                    'line-color': 'blue',
                    'line-width': 1
                }
            })

            this._layers.push('lines')

            this.loaded_images.forEach((image, index) => {
                this._layers.push(image);
                this.mapbox.addSource(image, {
                    type: "geojson",
                    data:{
                        type: "FeatureCollection",
                        features: []
                    }
                })

                this.mapbox.addSource(image+'_hovered', {
                    type: "geojson",
                    data:{
                        type: "FeatureCollection",
                        features: []
                    }
                })

                this.mapbox.addLayer({
                    id: image,
                    type: 'symbol',
                    source: image,
                    layout: {
                        'icon-image': image,
                        "icon-allow-overlap": true,
                        "text-allow-overlap": true,
                        "icon-size": .3,
                    }
                });

                this.mapbox.addLayer({
                    id: image+'_hovered',
                    type: 'symbol',
                    source: image+'_hovered',
                    layout: {
                        'icon-image': image,
                        "icon-allow-overlap": true,
                        "text-allow-overlap": true,
                        "icon-size": .5,
                    }
                });
            })
    }

    load_symbol_images(styles){
        return new Promise(resolve => {
            styles.styles.forEach((style, index) => {
                if(style.type == 'Point'){
                    if(!this.loaded_images.includes(style.s_uid)){
                        this.loaded_images.push(style.s_uid);
                        window.MAP.mapbox.loadImage(`/img/${style.data.split('/')[style.data.split('/').length -1]}`, (error, image) => {
                            window.MAP.mapbox.addImage(style.s_uid, image);
                        })
                    }
                }
            })
            resolve(true);
        })
    }

    reload_layers(){
        window.API.get_user_layers().then((layers) => {
            this.l_uids = layers.map((layer) => { return layer.l_uid });

            window.API.get_layers(this.bounds).then(geojson => {
                window.API.get_styles().then(styles => {
                    window.MAP.load_symbol_images(styles).then(() => {
                        this.create_layers();
                        for(var i in layers){
                            let layer = layers[i];
                            this.layers[layer.l_uid] = window.LM.create_layer({name: layer.name, l_uid: layer.l_uid, properties: layer.properties})
                        }
                        this.update(styles, geojson);
                        this.init_line_hover()
                    })
                })
            })
        })
    }

    update(styles, geojson){
        window.LM.clear_layers();
        geojson.features.forEach((feature, index) => {
            if(feature.geometry.type == 'LineString' || feature.geometry.type == 'Polygon'){
                window.MAP.mapbox.setFeatureState(
                    { source: 'lines', id: feature.id },
                    { [feature.properties.s_uid]: true, [feature.properties.l_uid]: true } // Update the state with the desired properties
                );
                this.mapbox.getSource('lines').setData({
                    type: "FeatureCollection",
                    features: [...this.mapbox.getSource('lines')._data.features, feature]
                })
            }else if(feature.geometry.type == 'Point'){   
                this.mapbox.getSource(feature.properties.s_uid).setData({
                    type: "FeatureCollection",
                    features: [...this.mapbox.getSource(feature.properties.s_uid)._data.features, feature]
                })
            }
            window.LM.update_layer_feature(feature.parent_layer, feature)
        })

        var s = [
            'case',
            ['boolean', ['feature-state', 'hover'], false],'green'
        ]

        var line_width_style = [
            'case',
            ['boolean', ['feature-state', 'hover'], false], 8,
            4
        ]

        styles.styles.forEach((style, index) => {
            if(style.type == 'LineString' || style.type == 'Polygon'){
                var ret = false;
                s.forEach((item, index) => {
                    if(item.length == 3 && item[1][1] == style.s_uid){
                        ret = true;
                    }
                })
                if(ret == false){
                    s.push(['boolean', ['feature-state', style.s_uid], false])
                    s.push(style.data)
                }
            }
        })
        s.push('blue')
        window.MAP.mapbox.setPaintProperty('lines', 'line-color', s)
        window.MAP.mapbox.setPaintProperty('lines', 'line-width', line_width_style)
    }

    init_line_hover(){
        var hoveredPolygonId = null;
        window.MAP.mapbox.on('mouseenter', 'lines', (e) => {
            if (e.features.length > 0) {
                if (hoveredPolygonId !== null) {
                    window.MAP.mapbox.setFeatureState(
                        { source: 'lines', id: hoveredPolygonId },
                        { hover: false }
                    );
                }
                hoveredPolygonId = e.features[0].id;
                window.StatusBar.update({feature_name: e.features[0].properties.description})
                window.MAP.mapbox.setFeatureState(
                    { source: 'lines', id: hoveredPolygonId },
                    { hover: true }
                );
            }
        })

        window.MAP.mapbox.on('mouseleave', 'lines', (e) => {
            if (hoveredPolygonId !== null) {
                window.MAP.mapbox.setFeatureState(
                    { source:'lines', id: hoveredPolygonId },
                    { hover: false }
                );
            }
            hoveredPolygonId = null;
        })
    }
    
    create_map(){
        mapboxgl.accessToken = 'pk.eyJ1IjoibmlnaHRjcmF3bGVyNDMiLCJhIjoiY2t0bzA0bGFwMDc1MTJvbzJzbjAxZWVqYiJ9.e6kJsLsqLOX9dEIFffspgA';
        return new mapboxgl.Map({
            container: this,
            style: 'mapbox://styles/mapbox/satellite-v9?optimize=true',
            center: (window.localStorage.getItem('center')) ? JSON.parse(window.localStorage.getItem('center')) : [-91.39727174681796, 36.69515319505075],
            zoom: (window.localStorage.getItem('zoom_level')) ? window.localStorage.getItem('zoom_level') : 13,
        });
    }
}

window.customElements.define('map-box', Map);

export default Map;
