class KeyboardManager {
    constructor(){
        this.control_state = {};
        this.mouse_state = {};
        this.mouse_pos = {};
        this.keys_released = false;
        this.keybinds = [];
        this.init();
    }

    init(){
        window.addEventListener('keydown', (e) => {
            if(!this.keys_released){
                e.preventDefault();
            }
            this.control_state[e.key.toLowerCase()] = true;
            this.update()
        });

        window.addEventListener('keyup', (e) => {
            if(!this.keys_released){
                e.preventDefault();
            }
            this.control_state[e.key.toLowerCase()] = false;
            this.update()
        });

        window.addEventListener('mousedown', (e) => {
            this.mouse_state[e] = true;
            this.update()
        });

        window.addEventListener('mouseup', (e) => {
            this.mouse_state[e] = false;
            this.update()
        });

        window.addEventListener('mousemove', (e) => {
            e.preventDefault();
            this.mouse_pos = {
                x: e.clientX,
                y: e.clientY
            }
            this.update()
        });

        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.update()
        });
    }

    create_key_bind(keys, callback){
        keys = keys.map((key) => {
            return key.toLowerCase();
        })
        this.keybinds.push({keys:keys, callback:callback});
    }

    update(){
        this.keybinds.forEach((keybind) => {
            var keys = keybind.keys;
            var callback = keybind.callback;
            var all_keys_down = true;
            keys.forEach((key) => {
                key = key.toLowerCase();
                if(!this.control_state[key] || this.control_state[key] == undefined){
                    all_keys_down = false;
                }
            });
            if(all_keys_down){
                console.log('all keys down')
                callback();
            }
        });
    }
}

export default KeyboardManager;