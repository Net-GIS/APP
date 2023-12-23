class Controls extends HTMLElement{
    constructor(){
        super()
        this.button_margin = 5;


        this.button_style = {
            position: "absolute",
            top: this.button_margin + "px",
            borderRadius: "5px",
            border:'none',
            backgroundColor: "white",
            height: "25px",
            width: "100px",
        }

        this.controls = [
            {
                type: "button", 
                text: "Layers", 
                style: this.button_style,
                dropdown_toggled: false,
                dropdown_items: [],
                onclick: () => {
                    if(this.controls[0].dropdown_toggled){
                        this.close_dropdown(0)
                    }else{
                        window.API.get_layers().then((layers) => {
                            var layers = layers.map((layer) => {
                                return {
                                    text: layer.name,
                                    onclick: () => {
                                        console.log(layer.name)
                                    }
                                }
                            })
                            layers.push({text:'Add Layer', onclick: () => {
                                this.close_dropdown(0);
                                window.API.new_layer(prompt("Enter Layer Name"));

                            }})
                            this.create_dropdown(0, layers)
                        })
                    }
                }
                
            },
            {
                type: "button",
                text: "Tools",
                style: this.button_style,
                dropdown_toggled: false,
                dropdown_items: [],
                onclick: () => {
                    var tools = ['Select', 'Draw', 'Edit', 'Delete'];
                    var tool_cursors = ['crosshair', 'crosshair', 'crosshair', 'crosshair']
                    if(this.controls[1].dropdown_toggled){
                        this.close_dropdown(1)
                    }else{
                        var t = tools.map((tool) => {
                            return {
                                text: tool,
                                onclick: () => {
                                    var cursor = tool_cursors[tools.indexOf(tool)]
                                    console.log(cursor)
                                    var c = document.body.getElementsByClassName("mapboxgl-canvas")[0]
                                    c.style.cursor = cursor
                                    console.log(document.body.getElementsByClassName("mapboxgl-canvas")[0])
                                }
                            }
                        })
                        this.create_dropdown(1, t)
                    }
                    
                }
            },

        ]
    }

    close_dropdown(index){
        this.controls[index].dropdown_toggled = false;
        this.controls[index].dropdown_items.forEach((item) => {
            item.remove()
        })
    }

    create_dropdown(index, items){
        var left = this.getElementsByTagName("button")[index].offsetLeft
        var vertical_buffer = 25 + this.button_margin;
        this.controls[index].dropdown_toggled = true;
        for(var x = 0; x < items.length; x++){
            var el = document.createElement("button").Style(this.button_style).Style({
                top: vertical_buffer + this.button_margin + "px",
                left: left + "px",
            })
            this.controls[index].dropdown_items.push(el)
            el.innerHTML = items[x].text
            el.onclick = items[x].onclick
            this.append(el)
            vertical_buffer += el.offsetHeight + this.button_margin
        }


    }


    connectedCallback(){
        var width_buffer = 0;
        this.controls.forEach((control) => {
            var el = document.createElement(control.type).Style(control.style)
            el.innerHTML = control.text
            el.style.left = width_buffer + this.button_margin + "px"
            el.onclick = control.onclick
            this.append(el)
            width_buffer += el.offsetWidth + this.button_margin
        })
    }


}

window.customElements.define("map-controls", Controls)
export default Controls
