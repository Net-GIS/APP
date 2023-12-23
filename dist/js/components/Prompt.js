class Prompt extends HTMLElement{
    constructor(props){
        super();
        props = props || {};

        var width = props.width || 275;
        var height = props.height || 'auto';
        var title = props.title || 'Prompt';
        var fields = props.fields || [];
        var text = props.text || '';
        var button_text = props.button_text || 'Submit';
        this.title_el = document.createElement('h3');
        this.blocker = document.createElement('div');
        this.submit_button = document.createElement('button');
        this.text = document.createElement('p');


        this.title_el.innerHTML = title;        
        this.submit_button.innerHTML = button_text;
        this.text.innerHTML = text;

        this.text.Style({
            textAlign:'center',
            margin:'0px',
            fontSize:'13px',
            color:(props.title == 'Error') ? '#e74c3c' : 'white',
            marginTop:'10px',
        })

        this.Style({
            position:'absolute',
            top:`calc(50% - ${width/2}px)`,
            left:`calc(50% - ${width/2}px)`,
            display:'none',
            backgroundColor:'rgba(61, 61, 61, 0.8)',
            color:'white',
            padding:'10px',
            borderRadius:'5px',
            width:`${width}px` || 'auto',
            height:`${height}px` || 'auto',
            minWidth:'100px',
            zIndex:'1000',
        })

        this.title_el.Style({
            textAlign:'center',
            margin:'0px',
            fontSize:'18px',
        })

        this.Append([
            this.title_el,
            this.text,
        ])

        fields.forEach((field) => {
            let input  = document.createElement('input');
            let fake_input = null;
            if(field == 'file'){
                fake_input = document.createElement('input');
                fake_input.type = 'file';
                input.onclick = () => {
                    fake_input.click();
                }
                input.setAttribute('type', 'button')
                input.setAttribute('value', 'Upload File')
                input.classList.add('file-input');
                input.fake_input = fake_input;
            }else{
                input.setAttribute('placeholder', field);
            }
            
            
           
            input.Style({
                width:'calc(100% - 5px)',
                height:'40px',
                borderRadius:'5px',
                border:'none',
                backgroundColor:(field == 'file') ? 'rgba(0, 188, 212, 0.4)' : 'rgba(255,255,255,0.2)',
                color:'white',
                marginTop:'10px',
                outline:'none',
                paddingLeft:'5px',
                textAlign: (field == 'file') ? 'center' : 'left',

            })
            this.Append([input])
        })

        this.submit_button.Style({
            width:'calc(100% )',
            height:'40px',
            borderRadius:'5px',
            border:'none',
            //blueish
            backgroundColor:'rgba(0, 188, 212, 0.8)',
            color:'white',
            marginTop:'10px',
            outline:'none',
        }).onclick = () => {
            var inputs = this.getElementsByTagName('input');
            var values = [];
            for(var i = 0; i < inputs.length; i++){
                if(inputs[i].classList.contains('file-input')){
                    values.push(inputs[i].fake_input.files[0]);
                    continue;
                }else{
                    values.push(inputs[i].value);
                }
            }
            props.callback(values);
            this.kill();
        }

        this.Append([
            this.submit_button,
        ])

        document.body.appendChild(this);
        this.init_blocker();
        this.show();
        


    }

    init_blocker(){
        this.blocker.Style({
            position:'absolute',
            top:'0px',
            left:'0px',
            width:'100%',
            height:'100%',
            zIndex:'999',
            backgroundColor:'rgba(0,0,0,0.5)',
        }).onclick = () => {
            this.kill();
        }
    }

    hide(){
        this.Style({
            display:'none',
        })
        document.body.removeChild(this.blocker)
    }

    show(){
        this.Style({
            display:'block',
        })
        document.body.appendChild(this.blocker)
    }

    kill(){
        this.hide();
        document.body.removeChild(this);
    }
}

customElements.define('prompt-box', Prompt);
export default Prompt;