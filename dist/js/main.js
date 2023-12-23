import API from './api.js';
import KM from './KeyboardManager.js';
import Map from './Map.js';
import BehaviorManager from './BehaviorManager.js';
import UTILS from './utils.js';
//run the code in Component.js
import Component from './components/Component.js';
import Controls from './components/Controls.js';
import LayersPanel from './components/LayersPanel.js';
import LayersList from './components/LayersList.js';
import StatusBar from './components/StatusBar.js';
import ToolsPanel from './components/ToolsPanel.js';
import ContextMenu from './components/ContextMenu.js';
import LayerManager from './LayerManager.js';

import MoveFeatures from './Behaviors/MoveFeatures.js';
import GetLineStats from './Behaviors/GetLineStatistics.js';
import IconHover from './Behaviors/IconHover.js';


class App{
    constructor(){
        window.API.get_user().then((user) => {
            window.MAP = new Map();
            window.KM = new KM();
            window.BM = new BehaviorManager();
            window.LM = new LayerManager();

            window.BM.register_behavior('move_features', MoveFeatures);
            window.BM.register_behavior('get_line_stats', GetLineStats);
            window.BM.register_behavior('icon_hover', IconHover);
            //window.BM.enable_behavior('icon_hover');
            
            window.UTILS = UTILS;
            window.LayerPanel = new LayersList();
            window.StatusBar = new StatusBar();
            window.ToolsPanel = new ToolsPanel();
            window.ContextMenu = new ContextMenu();
            window.User = user

            window.MAP.mapbox.getContainer().append(window.LayerPanel, window.StatusBar, window.ToolsPanel, window.ContextMenu);
            window.KM.create_key_bind(['Control', 'r'], (e) => {
                window.location.reload();
            })


            window.KM.create_key_bind(['Alt'], (e) => {
                window.UTILS.debounce(() => {
                    if(window.BM.isEnabled('get_line_stats')){
                        window.BM.disable_behavior('get_line_stats');
                    }else{
                        window.BM.enable_behavior('get_line_stats');
                    }
                }, 500)
            })
            
            window.KM.create_key_bind(['Tab'], (e) => {
                window.UTILS.debounce(() => {
                    if(window.BM.isEnabled('move_features')){
                        window.BM.disable_behavior('move_features');
                    }else{
                        window.BM.enable_behavior('move_features');
                    }
                }, 500)
            })

            window.KM.create_key_bind(['`'], (e) => {
                window.UTILS.debounce(() => {
                    alert('test')
                }, 500)
            })


            document.body.append(window.MAP)
            window.MAP.mapbox.resize();

        })
    }
}

window.onload = () => {
    document.body.Style({
        display:'block',
        margin:'0',
        height:'100vh',
        width:'100vw',
        userSelect:'none',
    })
    window.API = API;
    new App();
}

