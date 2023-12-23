class ContextMenu extends HTMLElement{
    constructor(){
        super();
        this.Style({
            position:'absolute',
            top:'0px',
            left:'0px',
            display:'none',
            backgroundColor:'rgba(61, 61, 61, 0.8)',
            color:'white',
            padding:'10px',
            borderRadius:'5px',
            width:'auto',
            minWidth:'100px',
            height:'auto',
            zIndex:'1000',
        })

        return this;
    }

    spawn(props){
        this.innerHTML = '';
        this.Style({
            top:props.y + 'px',
            left:props.x + 'px',
            display:'block',
        })

        props.items.forEach((item, index) => {
            console.log(item)
            let e = document.createElement('div');
            let icon = document.createElement('i');
            let text = document.createElement('span');
            
            text.innerHTML = item.name;
            icon.classList.add('material-icons');
            icon.innerHTML = item.icon;
            e.appendChild(icon);
            e.appendChild(text);

            text.Style({
                textAlign:'center',
                fontSize:'12px',
                width:'100%',
                position:'relative',
            })

            e.Style({
                display:'flex',
                flexDirection:'row',
                justifyContent:'flex-start',
                alignItems:'center',
                padding:'5px',
                cursor:'pointer',
            })

            e.addEventListener('click', (e) => {
                item.callback();
                this.kill();
            })

            this.appendChild(e);
        })


        this.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
        })

        document.body.addEventListener('click', (e) => {
            this.kill();
        })
    }

    kill(){
        this.Style({
            display:'none',
        })

    }
}

export default ContextMenu;
window.customElements.define('context-menu', ContextMenu);
