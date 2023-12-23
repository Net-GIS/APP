import Prompt from './Prompt.js';
import LayersList from './LayersList.js';


class LayersPanel extends HTMLElement{
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

        this.p_style = {
            color: "white",
            height:'40px',
            fontSize:"15px",
            paddingLeft: "30px",
            lineHeight: "40px",
            float:'left',
        }

        this.hr_style = {
            width:'100%',
            float:'left',
            margin:'0px',
        }

        this.icons_styles = {
            float:'right',
            marginRight:'20px',
            marginTop:'20px',
            fontSize:'25px',
        }

        this.item_text_style = {
            color:"#48dbfb",
            height:'40px',
            paddingLeft: "30px",
            lineHeight: "40px",
            cursor: "pointer",
            float: "left",
            width:'auto',
            margin:'0px',
        }

        this.item_button_style = {
            float: "right",
            marginRight: "10px",
            fontSize: "20px",
            cursor: "pointer",
            lineHeight: "40px",
            color: "white",
        }

        this.container_style = {
            float:'left',
            width:'100%',
            height: 'calc(100% - 70px)',
            overflowY:'scroll'
        }

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

        this.title_el = document.createElement('p');
        this.exit_button = document.createElement('i');
        this.save_button = document.createElement('i');
        this.manage_styles_button = document.createElement('i');
        this.add_layer_button = document.createElement('i');
        this.hr = document.createElement('hr');
        this.layers_container = document.createElement('div');
        this.styles_container = document.createElement('div');

        this.exit_button.innerHTML = "close";
        this.save_button.innerHTML = "save";
        this.manage_styles_button.innerHTML = "palette";
        this.add_layer_button.innerHTML = "add";

        this.exit_button.classList.add('material-icons');
        this.save_button.classList.add('material-icons');
        this.manage_styles_button.classList.add('material-icons');
        this.add_layer_button.classList.add('material-icons');

        this.exit_button.Style({
            ...this.icons_styles,
            color:'#e74c3c'
        })
        this.save_button.Style({
            ...this.icons_styles,
            color:'#2ecc71'
        })
        this.manage_styles_button.Style({
            ...this.icons_styles,
            color:'#f1c40f'
        })
        this.add_layer_button.Style({
            ...this.icons_styles,
            color:'#3498db'
        })

        this.hr.Style(this.hr_style)
        this.title_el.Style(this.p_style)
        this.layers_container.Style(this.container_style)
        this.styles_container.Style(this.container_style)

        this.exit_button.onclick = () => {
            this.update('layers');
        }

        this.manage_styles_button.onclick = () => {
            this.update('styles');
        }

        this.add_layer_button.onclick = () => {
            new Prompt({
                title:'New Layer',
                fields:['name', 'type', 'description', 'file'],
                callback:(res) => {
                    var name = res[0];
                    var type = res[1];
                    var description = res[2];
                    var file = res[3];
                    if(file){
                        var reader = new FileReader();
                        reader.onload = (e) => {
                            window.API.upload_new_layer(name, type, description, e.target.result).then((res) => {
                                return res;
                            })
                        }
                        reader.readAsDataURL(file); // convert to base64 string
                    }else{
                        if(name == ''){
                            return;
                        }
                        window.API.create_new_layer(name, type, description).then((res) => {
                            console.log(res);
                        })   
                    }
                }
            })
        }

        this.save_button.onclick = () => {
            var els = this.styles_container.getElementsByTagName('div');
            var ret = []
            for(var input in els){
                if(!els[input].getElementsByTagName){continue;}
                var inpt = els[input].getElementsByTagName('input')[0];
                var hex = window.UTILS.rgb_to_hex(inpt.style.backgroundColor)
                var s_uid = els[input].getElementsByTagName('p')[0].innerHTML;
                ret[s_uid] = hex;
            }
            window.API.save_styles(ret).then((res) => {
                for(var layer in window.MAP.layers){
                    window.MAP.layers[layer].update_line_styles();
                }
                this.update('layers');
            })
        }

        return this;
    }

    connectedCallback(){
        //this.update('layers');
        this.append(new LayersList())
    }

    update(type){
        this.innerHTML = "";

        var t = type;
        this.title_el.innerHTML = t.charAt(0).toUpperCase() + t.slice(1);

        if(type == 'styles'){
            this.append(this.title_el, this.exit_button, this.save_button, this.hr, this.styles_container);
            this.update_styles();
        }else if(type == 'layers'){
            this.append(this.title_el,  this.add_layer_button, this.manage_styles_button, this.hr, this.layers_container);
        }
    }

    update_layers(){
        this.layers_container.innerHTML = "";
        var style_items = []
        for(var layer_name in window.MAP.layers){
            let layer = window.MAP.layers[layer_name];           
            window.API.get_styles().then((res) => {
                res.styles.forEach((style) => {
                    if(style.type == 'IconStyle'){
                        style_items.push({name:style.s_uid.match(/[A-Z][a-z]+/g).join(' '), img:style.data});
                        console.log(style)
                    }
                })
            })

            if(layer.type != 'line'){continue;}
            let item_el = document.createElement('div');
            let text = document.createElement('p');
            let toggle_project = document.createElement('i');
            let settings_button = document.createElement('i');
            let dropdown_button = document.createElement('i');

            toggle_project.classList.add('material-icons');
            settings_button.classList.add('material-icons');
            dropdown_button.classList.add('material-icons');

            toggle_project.innerHTML = 'visibility';
            settings_button.innerHTML = 'settings';
            dropdown_button.innerHTML = 'chevron_right';

            text.innerHTML = layer.name;
            item_el.classList.add('active')

            item_el.Style({
                display: "block",
                width: "100%",
                height: "40px",
                float: "left",
            })

            text.Style(this.item_text_style)
            settings_button.Style(this.item_button_style)
            toggle_project.Style(this.item_button_style)
            dropdown_button.Style({
                float: "left",
                marginLeft: "10px",
                fontSize: "20px",
                cursor: "pointer",
                lineHeight: "40px",
                color: "white",
                
            })

            var toggle_dropdown = () => {
                if(item_el.getAttribute('data-open') == 'true'){
                    item_el.setAttribute('data-open', false);
                    item_el.innerHTML = "";
                    dropdown_button.innerHTML = 'chevron_right';
                    item_el.append(dropdown_button, text, settings_button, toggle_project);
                    item_el.Style({
                        height: "40px",
                    })
                }else{
                    item_el.setAttribute('data-open', true);
                    item_el.Style({
                        height: "auto",
                    })
                    dropdown_button.innerHTML = 'expand_more';
                    for(var i in style_items){
                        var temp_container = document.createElement('div');
                        var temp_item = document.createElement('p');
                        var temp_img = document.createElement('img');
                        temp_item.innerHTML = style_items[i].name;
                        console.log(style_items[i].img)
                        temp_img.src = style_items[i].img.split('"')[1];
                        temp_img.Style({
                            width:'30px',
                            height:'30px',
                            float:'left',
                            marginLeft:'10px',
                        })
                        temp_item.Style({
                            color:"#48dbfb",
                            height:'40px',
                            paddingLeft: "10px",
                            lineHeight: "40px",
                            cursor: "pointer",
                            float: "left",
                            width:'auto',
                            margin:'0px',
                        })

                        temp_container.Style(this.container_style)
                        temp_container.append(temp_img, temp_item);
                        item_el.append(temp_container);
                    }
                }

            }


            dropdown_button.onclick = toggle_dropdown;
            text.onclick = toggle_dropdown;

            toggle_project.onclick = () => {
                window.MAP.layers[layer.l_uid].toggle();
                this.toggle_item(item_el, toggle_project);
            }
            
            item_el.append(dropdown_button, text, settings_button, toggle_project);
            this.layers_container.append(item_el)
        }
    }

    update_styles(){
        this.styles_container.innerHTML = "";
        window.API.get_styles().then((res) => {
            let styles = res.styles;
            for(var style in styles){
                var s = styles[style];
                let item_el = document.createElement('div');
                let text = document.createElement('p');
                let style_attribute_element = document.createElement('span');
                let color_picker = document.createElement('input');
                color_picker.type = 'button'

        
                text.innerHTML = s.s_uid;
                item_el.Style({
                    display: "block",
                    width: "100%",
                    height: "40px",
                    float: "left",
                })

                text.Style(this.item_text_style)

                if(s.type == 'LineStyle'){
                    style_attribute_element.Style({
                        width: '50px',
                        height: '25px',
                        margin: '7.5px',
                        display: 'inline-block',
                    })
                    
                    color_picker.Style({
                        width: '100%',
                        height: '100%',
                        borderRadius: '5px',
                        border: 'none',
                        backgroundColor: `#${s.data.replace(/[^\w\s]/gi, '')}`,
                    })

                    document.addEventListener('coloris:pick', event => {
                        event.detail.currentEl.Style({
                            backgroundColor: event.detail.color
                        })
                        event.detail.currentEl.setAttribute('data-color', event.detail.color);
                        event.detail.currentEl.value = ''
                    });
    
                    color_picker.setAttribute('data-coloris', true);
                    style_attribute_element.append(color_picker);

                    item_el.append(text, style_attribute_element);
                    this.styles_container.append(item_el);
                }
            }
        })
    }

    toggle_item(el, icon){
        if(el.classList.contains('active')){
            el.classList.remove('active');
        }else{
            el.classList.add('active');
        }

        if(el.classList.contains('active')){
            icon.style.color = "white";
        }else{
            icon.style.color = "gray";
        }
    }
}
customElements.define('layers-panel', LayersPanel);
export default LayersPanel;