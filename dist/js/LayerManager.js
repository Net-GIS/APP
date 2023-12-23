import Layer from './Layer.js';

class LayerManager{
    constructor(){
        this.layers = [];
    }

    create_layer(props){
        var layer = new Layer(props);
        this.layers[layer.l_uid] = layer;
        return layer;
    }

    update_layer_feature(l_uid, feature){
        this.layers[l_uid].update_feature(feature);
    }

    clear_layer(l_uid){
        this.layers[l_uid].features = [];
    }

    clear_layers(){
        this.layers.forEach((layer, i) => {
            layer.features = [];
        })
    }

    toggle_layer(l_uid){
        this.layers[l_uid].toggle();
    }
}

export default LayerManager;