class ToolsPanel extends HTMLElement{
    constructor(){
        super();
        this.Style({position: "absolute", left: "20px", borderRadius: "5px", border:'none', backgroundColor: "rgba(61, 61, 61, 0.8)", height: "auto", width: "40px",})
        this.icons = [
            {icon:'crop_free', func: () => {
                //this.parentElement.querySelector('canvas').Style({cursor: 'crosshair'});
                window.MAP.behaviors['select'].start();
            }},
            {icon:'location_on', func: () => {
                window.MAP.behaviors['point_add'].start();
            }},
            {icon:'square_foot', func: () => {}},
            {icon:'undo', func: () => {}},
            {icon:'redo', func: () => {}},
            {icon:'place', func: () => {}},
        ]

    }

    IconButton(icon, func){
        let i = document.createElement('i');
        i.classList.add('material-icons');
        i.classList.add('material-symbols');
        i.classList.add('material-symbols-outlined');
        i.innerHTML = icon;
        i.addEventListener('click', func);
        i.Style({
            display: "block",
            width: "100%",
            height: "40px",
            lineHeight: "40px",
            textAlign: "center",
            color: "white",
        })
        return i;
    }

    connectedCallback(){
        this.icons.forEach((icon) => {
            let i = this.IconButton(icon.icon, icon.func);
            this.append(i);
        })

        this.Style({
            top: `calc(50% - ${this.offsetHeight/2}px)`,
        })
    }
}
export default ToolsPanel;
window.customElements.define('tools-panel', ToolsPanel);
