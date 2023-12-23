class StatusBar extends HTMLElement{
    constructor(){
        super();
        this.Style({
            position: "absolute",
            top: "0px",
            left: "0px",
            borderRadius: "5px",
            border:'none',
            backgroundColor: "rgba(61, 61, 61, 1)",
            height: "25px",
            width: "100%",
            height: "40px",      
        })

        this.feature_name_el = document.createElement('p');
        this.mouse_position_el = document.createElement('p');
        this.zoom_level_el = document.createElement('p');
        this.search_bar_el = document.createElement('div');

        this.search_bar_el.Style({
            float:'right',
            height:'25px',
            marginRight:'20px',
            marginTop:'7.5px',
            fontSize:'25px',
            outline:'none',
            width:'300px',
            position:'absolute',
            left:'50%',
            transform:'translateX(-50%)',
            backgroundColor:'grey',
            border:'none',
            color: 'white',
            borderRadius:'5px',
        })

        this.search_bar_el.placeholder = 'Search for a place...';
        this.search_bar_el.classList.add('other-placeholder');

        this.feature_name_el.Style({
            color: "white",
            height:'40px',
            paddingLeft: "30px",
            lineHeight: "40px",
            margin:'0px',
            float:'left'
        })

        this.mouse_position_el.Style({
            color: "white",
            height:'40px',
            paddingLeft: "30px",
            lineHeight: "40px",
            margin:'0px',
            float:'left'
        })

        this.zoom_level_el.Style({
            color: "white",
            height:'40px',
            paddingLeft: "30px",
            lineHeight: "40px",
            margin:'0px',
            float:'left'
        })

        this.map_style_select = document.createElement('select');
        this.map_style_select.Style({
            float:'right',
            height:'30px',
            marginRight:'20px',
            marginTop:'5px',
            fontSize:'25px',
            outline:'none',
        })

        var style_ref = ['mapbox://styles/mapbox/streets-v12', 'mapbox://styles/mapbox/outdoors-v12', 'mapbox://styles/mapbox/light-v11', 'mapbox://styles/mapbox/dark-v11', 'mapbox://styles/mapbox/satellite-v9', 'mapbox://styles/mapbox/satellite-streets-v12', 'mapbox://styles/mapbox/navigation-day-v1', 'mapbox://styles/mapbox/navigation-night-v1']
        var items = ['Streets', 'Out Doors', 'Light', 'Dark', 'Satellite', 'Satellite Streets', 'Navigation Day', 'Navigation Night'];
        items.forEach((item) => {
            var option = document.createElement('option');
            option.innerHTML = item;
            this.map_style_select.append(option);
        })

        this.map_style_select.onchange = (e) => {
            window.MAP.mapbox.setStyle(style_ref[this.map_style_select.selectedIndex]);
        }

        this.append(this.feature_name_el, this.mouse_position_el, this.zoom_level_el, this.map_style_select, this.search_bar_el);

        // Add the control to the map.
        const geocoder = new MapboxGeocoder({
            accessToken: 'pk.eyJ1IjoibmlnaHRjcmF3bGVyNDMiLCJhIjoiY2t0bzA0bGFwMDc1MTJvbzJzbjAxZWVqYiJ9.e6kJsLsqLOX9dEIFffspgA',
            mapboxgl: window.MAP.mapbox,
            marker: false,
            countries: 'us',
        });

        var g = geocoder.onAdd(window.MAP.mapbox);
        g.getElementsByTagName('input')[0].onfocus = () => {
            window.KM.keys_released = true;
        }

        g.getElementsByTagName('input')[0].onblur = () => {
            window.KM.keys_released = false;
        }

       this.search_bar_el.appendChild(g);

    }

    update(props){
        if(props.feature_name){
            this.feature_name_el.innerHTML = props.feature_name;
        }

        if(props.mouse_position){
            this.mouse_position_el.innerHTML = props.mouse_position;
        }

        if(props.zoom_level){
            this.zoom_level_el.innerHTML = props.zoom_level;
        }
    }
}

window.customElements.define('status-bar', StatusBar)
export default StatusBar
