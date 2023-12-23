
import Prompt from './Prompt.js';
import {kml} from '/js/toGeoJSON.js';

class LayersList extends HTMLElement{
    constructor(){
        super();
        this.Style({
            position: "absolute",
            bottom: "calc(50% - 250px)",
            right: "20px",
            borderRadius: "5px",
            border:'none',
            backgroundColor: "rgba(61, 61, 61, 0.8)",
            height: "25px",
            width: "250px",
            height: "500px",
            borderRadius: "10px",
            overflow:'hidden',
        })

        Coloris({
            themeMode: 'dark',
            alpha: false,
            swatches: [
                'red',
                'orange',
                'yellow',
                'green',
                'blue',
                'indigo',
                'violet',
                'black',
                'cyan',
                'magenta',
                'darkorange',
                'darkgreen',
            ],
        });

        document.addEventListener('coloris:pick', event => {
            event.detail.currentEl.Style({
                backgroundColor: event.detail.color
            })
            event.detail.currentEl.setAttribute('data-color', event.detail.color);
            event.detail.currentEl.value = ''
        });

        window.API.get_styles().then((styles) => {
            this.styles = styles.styles;
            this.update('layers'); 
        })

        this.selected = []; //indexes of selected layers
        this.hidden_layers = []; //indexes of hidden layers
        this.layers = false;    
    }


    update(view, props){
        if(view == 'layers'){
            this.LayerView();
        }else if(view == 'add_layer'){
            this.AddLayerView();
        }else if(view == 'confirm_upload'){
            this.ConfirmUploadView(props);
        }else if(view == 'edit_styles'){
            this.EditStylesView();
        }
    }

    EditStylesView(){
        var close = this.MaterialIcon('close', '#e74c3c', 'right');
        var save = this.MaterialIcon('check', '#2ecc71', 'right');
        close.onclick = () => {
            this.update('layers')
        }

        save.onclick = () => {
            var styles_els = document.getElementsByClassName('style-item');
            var styles_to_save = [];

            for(var i = 0; i < styles_els.length; i++){
                var style = styles_els[i];
                var name = style.getElementsByTagName('input')[0].value;
                var type = style.getAttribute('data-type');
                if(type == 'LineString' || type == 'Polygon'){
                    var d = style.getElementsByTagName('input')[1].getAttribute('data-color');
                }else{
                    var d = style.getElementsByTagName('img')[0].src;
                }

                styles_to_save.push({name: name, data: d, type: type});
            }
            window.API.save_styles(styles_to_save).then((res) => {
                if(res.success){
                    for(var layer in window.MAP.layers){
                        var l = window.MAP.layers[layer]
                        if(l.type == 'line'){
                            l.update_line_styles();
                        }
                    }
                }
            })
        }

        var title = this.ViewTitle('Edit Styles','#3d9cd3', [close, save]);
        var content = this.ViewContentContainer();

        this.innerHTML = '';
        this.append(title, content);
        window.API.get_styles().then((styles) => {
            styles.styles = styles.styles.sort((a, b) => {
                if(a.type < b.type){
                    return -1;
                }else if(a.type > b.type){
                    return 1;
                }else{
                    return 0;
                }
            })

            styles.styles.forEach((style) => {
                var e = this.StyleItem(style.s_uid, style.data, style.type);
                content.append(e)
            })
        })
    }

    LayerView(){
        var add_layer = this.MaterialIcon('add', '#2ecc71', 'right');
        var edit_styles = this.MaterialIcon('edit', '#e67e22', 'right');

        add_layer.onclick = () => {
            this.update('add_layer')
        }

        edit_styles.onclick = () => {
            this.update('edit_styles')
        }

        var title = this.ViewTitle('Layers','#3d9cd3', [add_layer, edit_styles]);
        var content = this.ViewContentContainer();

        window.API.get_user_layers().then((layers) => {
            this.innerHTML = '';
            this.append(title, content)
            if(layers == false){
                var el = document.createElement('p');
                el.innerHTML = 'No layers found, create one by clicking the + button.';
                el.Style({
                    color:'white',
                    textAlign:'center',
                    width:'100%',
                    lineHeight:'40px',
                    margin:'0px',
                    marginTop:'50%',
                    fontSize:'15px',
                })
                content.append(el);
            }else{
                layers.forEach((layer, index) => {
                    var li = this.LayerItem(layer, !this.hidden_layers.includes(index));
                    content.append(li);
                })
                this.selected.forEach((index) => {
                    var els = this.getElementsByClassName('layer-item');
                    els[index].getElementsByTagName('p')[0].Style({
                        color:'#3d9cd3'
                    })
                })

            }
        })
    }

    AddLayerView(){
        var close = this.MaterialIcon('close', '#e74c3c', 'right');
        close.onclick = () => {
            this.update('layers')
        }
        var title = this.ViewTitle('Add Layer','#3d9cd3', [close]);
        var content = this.ViewContentContainer();
        var ic1 = this.ItemContainer();
        var ic2 = this.ItemContainer();
        var ic3 = this.ItemContainer();
        var ic4 = this.ItemContainer();
        var layer_name = this.Input('text', 'Layer Name', 'left', 'calc(100% - 20px)', '10px');
        var submit1 = this.Input('button', 'Create Layer', 'right', 'calc(100% - 20px)', '10px');
        var p = document.createElement('p');
        var upload_new_layer = this.Input('button', 'Choose File', 'left', 'calc(100% - 20px)', '10px');
        var upload_submit = this.Input('button', 'Upload', 'right', 'calc(100% - 20px)', '10px');
        var temp_el = document.createElement('input');
        temp_el.type = 'file';

        upload_new_layer.onclick = () => {
            temp_el.click();
        }

        temp_el.onchange = (e) => {
            upload_new_layer.value = temp_el.files[0].name;
            if(temp_el.files[0].name.split('.')[1] == 'json' || temp_el.files[0].name.split('.')[1] == 'kml' || temp_el.files[0].name.split('.')[1] == 'gpx' || temp_el.files[0].name.split('.')[1] == 'csv'){
                upload_submit.disabled = false;
            }else{
                new Prompt({
                    title:'Error',
                    text:'Invalid file type, please upload a .json, .kml, or .gpx file.',
                    button_text:'Ok',
                    callback:(res) => {
                        console.log(res)
                    }
                })
                upload_submit.disabled = true;
            }
        }

        upload_submit.onclick = (e) => {
            this.update('confirm_upload', {file: temp_el.files[0]})
        }

        p.innerHTML = 'Or';
        p.Style({
            color:'white',
            textAlign:'center',
            width:'100%',
            lineHeight:'40px',
            margin:'0px',
            marginTop:'10px',
            fontSize:'15px',
        })

        upload_new_layer.Style({
            backgroundColor:'#1abc9c',
        })

        ic1.append(layer_name);
        ic2.append(submit1);
        ic3.append(upload_new_layer);
        ic4.append(upload_submit);

        this.innerHTML = '';
        this.append(title, content);
        content.append(ic1, ic2, p, ic3, ic4);
    }

    ConfirmUploadView(props){
        var geo_json_data = null;
        var close = this.MaterialIcon('close', '#e74c3c', 'right');
        var confirm = this.MaterialIcon('check', '#2ecc71', 'right');
        var title = this.ViewTitle('Confirm Upload','#3d9cd3', [close, confirm]);
        var content = this.ViewContentContainer();
        var file = props.file;
        var reader = new FileReader();


        this.innerHTML = '';
        this.append(title, content);


        close.onclick = () => {
            this.update('layers')
        }

        confirm.onclick = () => {
            var styles_els = document.getElementsByClassName('style-item');
            var styles_to_save = [];

            for(var i = 0; i < styles_els.length; i++){
                var style = styles_els[i];
                var name = style.getElementsByTagName('input')[0].value;
                var type = style.getAttribute('data-type');
                if(type == 'LineString' || type == 'Polygon'){
                    var d = style.getElementsByTagName('input')[1].style.backgroundColor;
                }else{
                    var d = style.getElementsByTagName('img')[0].src;
                }

                styles_to_save.push({name: name, data: d, type: type});
            }

            
            window.API.upload_new_layer(file.name, styles_to_save, geo_json_data).then((res) => {
                return res;
            })
        }

        reader.onload = (e) => {
            var ext = file.name.split('.')[1];
            var text = reader.result;
            var styles = {};
            //check if geojson, kml, or gpx
            if(ext == 'json'){
                geo_json_data = JSON.parse(text);
            }else if(ext == 'kml'){
                geo_json_data = kml(new DOMParser().parseFromString(text, 'text/xml'));
            }else if(ext == 'gpx'){
                console.log('gpx')
            }else if(ext == 'csv'){

            }

            var st = this.ItemText('Styles to Upload', '#2980b9', false)
            st.Style({
                fontWeight:'bold',
                fontSize:'17px',
            })

            content.append(st);

            geo_json_data.features.forEach((feature) => {
                if(feature.properties.styleUrl){
                    var style = feature.properties.styleUrl.split('#')[1];  
                }else{
                    var style = 'default';
                }
                if(feature.properties.icon){
                    var d = feature.properties.icon;

                }else if(feature.properties.fill){
                    var d = feature.properties.fill;
                }else if(feature.properties.stroke){
                    var d = feature.properties.stroke;
                }
                
                if(!styles[style]){
                    styles[style] = d
                    var si = this.StyleItem(style, d, feature.geometry.type);
                    si.classList.add('style-item')
                    content.append(si);
                }
            })
        }

        reader.readAsText(file);
    
    }

    FolderItem(folder){
        var c = this.ItemContainer();
        var title = this.ItemText(folder, 'white', false);
        var radio_button = document.createElement('input');
        var folder_icon = this.MaterialIcon('folder', '#3d9cd3', 'right');
        radio_button.type = 'radio';
        radio_button.checked = true;
        radio_button.setAttribute('checked', true);

        radio_button.Style({
            display:'block',
            float:'left',
            height:'15px',
            width:'15px',
            margin:'0px',
            marginTop:'12.5px',
            marginLeft:'10px',
        })

        radio_button.onclick = () => {
            if(radio_button.getAttribute('checked') == 'true'){
                radio_button.setAttribute('checked', false);
                radio_button.checked = false;
            }else{
                radio_button.setAttribute('checked', true);
                radio_button.checked = true;
            }

        }

        title.Style({
            fontSize:'15px',
            fontWeight:'bold',
        })
        c.append(radio_button, title, folder_icon);
        return c;
    }

    StyleItem(style, data, type){
        var c = this.ItemContainer();
        var title = this.Input('text', style, 'left', 'calc(100% - 60px)', '10px');
        title.value = style;
        title.Style({
            fontSize:'12px',
            marginTop:'5px',

        })
        var data_el = (type == 'Point') ? this.EditIcon(data) : this.EditColor(data);
        c.append(title, data_el);
        c.setAttribute('data-type', type);
        c.classList.add('style-item')
        return c;
    }

    LayerItem(layer, visible){
        var layer_container = this.ItemContainer();
        var toggle_dropdown_el = this.MaterialIcon('chevron_right', '#2980b9', 'left');
        var toggle_visibility = this.MaterialIcon(visible ? 'visibility' : 'visibility_off', 'white', 'right');
        var layer_name = this.ItemText(layer.name, 'white');

        var toggle_dropdown = () => {
            if(toggle_dropdown_el.innerHTML == 'chevron_right'){
                toggle_dropdown_el.innerHTML = 'expand_more';
                layer_container.innerHTML = '';
                layer_container.append(toggle_dropdown_el, layer_name, toggle_visibility)
                for(var key in this.styles){
                    var style = this.styles[key];
                    if(style.type == 'IconStyle'){
                        console.log(style)
                        var style_name = this.ItemText(style.s_uid.match(/[A-Z][a-z]+/g).join(' '), 'white');
                        console.log(visible ? 'visibility' : 'visibility_off')
                        var style_toggle = this.MaterialIcon(visible ? 'visibility' : 'visibility_off', 'white', 'right');
                        var style_img = this.ItemImage(style.data.split('"')[1], 'left');
                        var style_container = this.ItemContainer();
                        style_container.append(style_img, style_name, style_toggle);
                        layer_container.append(style_container);
                    }
                }

            }else{
                toggle_dropdown_el.innerHTML = 'chevron_right';
                layer_container.innerHTML = '';
                layer_container.append(toggle_dropdown_el, layer_name, toggle_visibility)
            }
        }

        var toggle_layer_visibility = (ev) => {
            var els = Array.prototype.slice.call(this.getElementsByClassName('layer-item'));
            var i = els.indexOf(ev.currentTarget.parentElement);
            if(this.hidden_layers.includes(i)){
                this.hidden_layers.splice(this.hidden_layers.indexOf(i), 1);
            }else{
                this.hidden_layers.push(i);
            }
            ev.stopPropagation();
            if(toggle_visibility.innerHTML == 'visibility'){
                toggle_visibility.innerHTML = 'visibility_off';
            }else{
                toggle_visibility.innerHTML = 'visibility';
            }
            window.MAP.layers[layer.l_uid].toggle();
        }

        layer_container.classList.add('layer-item');
        layer_container.append(toggle_dropdown_el, layer_name, toggle_visibility)

        layer_name.onclick = (ev) => {
            var els = Array.prototype.slice.call(this.getElementsByClassName('layer-item'));
            var i = els.indexOf(ev.currentTarget.parentElement);
            if(this.selected.includes(i)){
                if(window.KM.control_state['shift']){
                    this.selected.splice(this.selected.indexOf(i), 1);
                }else{
                    this.selected = [i];
                }
            }else{
                if(window.KM.control_state['shift']){ //item doesnt exist and shift is pressed
                    this.selected.push(i);
                }else{
                    this.selected = [i];
                }
            }
            this.update('layers')
        }

        toggle_dropdown_el.onclick = toggle_dropdown;
        toggle_visibility.onclick = toggle_layer_visibility;
        return layer_container;
    }

    EditText(text){
        var el = document.createElement('input');
        el.type = 'text';
        el.value = text;
        el.Style({
            width:'calc(100% - 60px)',
            height:'30px',
            borderRadius:'5px',
            border:'none',
            backgroundColor:'rgba(255,255,255,0.2)',
            color:'white',
            margin:'5px',
            outline:'none',
            paddingLeft:'5px',
        })
        return el;
    }

    EditColor(color){
        var c = document.createElement('div');
        var el = document.createElement('input');
        el.type = 'button';
        el.setAttribute('data-coloris', true);
        el.setAttribute('data-color', color);
        c.Style({
            display:'block',
            float:'right',
            height:'30px',
            width:'30px',
            margin:'0px',
            marginTop:'5px',
            marginRight:'10px',
        })
        el.Style({
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: color,
            borderRadius:'5px',
        })
        c.append(el);
        return c;
    }

    EditIcon(icon){
        var el = this.ItemImage(icon, 'right')
        return el;
    }

    ViewTitle(text, color, controls){
        var c = this.ItemContainer();
        var title = this.ItemText(text, color, false);


        title.Style({
            fontSize:'17px',
            fontWeight:'bold',
        })

        c.append(title, ...controls);
        return c;
    }

    ViewContentContainer(){
        var c = document.createElement('div');
        c.Style({
            width:'100%',
            height:'calc(100% - 40px)',
            display:'block',
            float:'left',
            margin:'0px',
            overflowY:'scroll',
        })
        return c;
    }

    ItemContainer(){
        var container = document.createElement('div');
        container.Style({
            width:'100%',
            display:'block',
            float:'left',
            height:'auto',
            margin:'0px',
        })
        return container;
    }

    MaterialIcon(icon, color, align){
        var i = document.createElement('i');
        i.classList.add('material-icons');
        i.innerHTML = icon;
        i.Style({
            height: "40px",
            width:'40px',
            lineHeight: "40px",
            textAlign: "center",
            color: color,
            float: align,
            margin:'0px',
            marginRight:(align == 'left') ? '0px' : '7.5px',
            marginLeft:(align == 'right') ? '0px' : '7.5px',
        })
        return i;
    }

    ItemImage(image, align){
        var i = document.createElement('img');
        i.src = image;
        i.Style({
            height: "30px",
            width:'30px',
            lineHeight: "30px",
            textAlign: "center",
            float: align,
            margin:'5px',
            marginRight:(align == 'left') ? '0px' : '10px',
            marginLeft:(align == 'right') ? '0px' : '10px',
        })
        return i;
    }

    ItemText(text, color, indent){
        var el = document.createElement('p');
        el.innerHTML = text;
        el.Style({
            display:'block',
            float:'left',
            height:'40px',
            maxWidth:'calc(100% - 60px)',
            overflow:'ellipsis',
            wordWrap:'break-word',
            lineHeight:'40px',
            paddingLeft:'10px',
            margin:'0px',
            marginTop:'0px',
            marginLeft:(indent) ? '40px' : '0px',
            fontSize:'15px',
            color:color,   
        })
        return el;
    }

    Input(type, placeholder, align, width, margin){
        var i = document.createElement('input');
        i.type = type;
        i.Style({
            display:'block',
            height: "30px",
            width: width,
            lineHeight: "30px",
            textAlign: "center",
            float: align,
            padding:'0px',
            margin:margin,
            borderRadius:'5px',
            border:'none',
            outline:'none',
            backgroundColor:(type == 'button' || type == 'submit') ? '#3d9cd3' :'rgb(40, 40, 40)',
            //transition:'0.3s',
            color:'white',
        })


        if(type == 'text'){
            i.placeholder = placeholder;
            i.classList.add('other-placeholder')
            i.onfocus = () => {
                window.KM.keys_released = true;
                i.Style({
                    backgroundColor:'rgb(50, 50, 50)',
                    borderRadius:'0px',
                    height:'28px',
                    borderBottom:'2px solid #3d9cd3',

                })
            }

            i.onblur = () => {
                window.KM.keys_released = false;
                i.Style({
                    backgroundColor:'rgb(40, 40, 40)',
                    borderRadius:'5px',
                    height:'30px',
                    border:'none',
                })
            }
        }else{
            i.value = placeholder;
        }

        return i;
    }
}

customElements.define('layers-list', LayersList);
export default LayersList