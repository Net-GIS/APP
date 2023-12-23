class Layer{
    constructor(props){
        this.l_uid = props.l_uid;
        this.name = props.name;
        this.features = [];
        this.visible = true;
    }

    delete_feature(feature){
        if(this.features.includes(feature)){
            this.features = this.features.filter((f) => {
                return f !== feature;
            })
        }
    }

    add_feature(feature){
        this.features.push(feature);
    }

    update_feature(feature){
        if(!this.features.map(feature => {return feature.id}).includes(feature.id)){
            this.add_feature(feature);
        }else{
            this.features = this.features.map((f) => {
                if(f.id == feature.id){
                    return feature;
                }else{
                    return f;
                }
            })
        
        }
    }

    get_features(){

    }

    toggle(){
        this.visible = !this.visible;
        var source = window.MAP.mapbox.getSource('lines');
        if(this.visible){
            source._data.features = source._data.features.concat(this.features);
        }else{
            source._data.features = source._data.features.filter((feature) => {
                return !this.features.includes(feature);
            })
        }

        window.MAP.loaded_images.forEach((image) => {
            var source = window.MAP.mapbox.getSource(image);
            if(this.visible){
                source._data.features = source._data.features.concat(this.features.filter((feature) => {
                    return feature.properties.s_uid == image;
                }));
            }else{
                source._data.features = source._data.features.filter((feature) => {
                    return !this.features.includes(feature);
                })
            }

            source.setData(source._data);
        })

        source.setData(source._data);
    }

}

export default Layer;