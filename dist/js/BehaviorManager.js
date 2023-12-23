class BehaviorManager {
    constructor(){
        this.behaviors = [];
        this.setup_listeners();
        this.down_actions = [];
        this.up_actions = [];
        this.move_actions = [];
        this.click_actions = [];
    }

    setup_listeners(){
        window.MAP.mapbox.on('mousedown', (e) => {
            this.down_actions.forEach((action) => {
                action.func(e);
            })
        })

        window.MAP.mapbox.on('mouseup', (e) => {
            this.up_actions.forEach((action) => {
                action.func(e);
            })
        })

        window.MAP.mapbox.on('mousemove', (e) => {
            this.move_actions.forEach((action) => {
                action.func(e);
            })
        })

        window.MAP.mapbox.on('click', (e) => {
            this.click_actions.forEach((action) => {
                action.func(e);
            })
        })
    }

    register_behavior(name, behavior){
        this.behaviors[name] = behavior;
    }

    enable_behavior(name){
        this.behaviors[name].enabled = true;
        this.behaviors[name].actions.forEach((action) => {
            switch(action.event_type){
                case 'mousedown':
                    this.down_actions.push({name: name, func: action.func})
                    break;
                case 'mouseup':
                    this.up_actions.push({name: name, func: action.func})
                    break;
                case 'mousemove':
                    this.move_actions.push({name: name, func: action.func})
                    break;
                case 'click':
                    this.click_actions.push({name: name, func: action.func})
                    break;
            }
        })
    }

    disable_behavior(name){
        this.behaviors[name].enabled = false;
        this.behaviors[name].actions.forEach((action) => {
            switch(action.event_type){
                case 'disable':
                    action.func();
                    break;
                case 'mousedown':
                    this.down_actions = this.down_actions.filter((action) => {
                        return action.name != name;
                    })
                    break;
                case 'mouseup':
                    this.up_actions = this.up_actions.filter((action) => {
                        return action.name != name;
                    })
                    break;
                case 'mousemove':
                    this.move_actions = this.move_actions.filter((action) => {
                        return action.name != name;
                    })
                    break;
                case 'click':
                    this.click_actions = this.click_actions.filter((action) => {
                        return action.name != name;
                    })
                    break;
            }
        })
    }

    isEnabled(name){
        return this.behaviors[name].enabled;        
    }

}

export default BehaviorManager;