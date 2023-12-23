

var last_hovered_point = null;

export default {
    actions:[
        {
            event_type:'mousemove',
            func: (e) => {
                var t = window.UTILS.get_clicked_point(e);
                if(t != null){
                    if(last_hovered_point == null){
                            last_hovered_point = t;
                            window.UTILS.toggle_point_highlight(t);
                    }
                }else{
                    if(last_hovered_point != null){
                        window.UTILS.toggle_point_highlight(last_hovered_point);
                        last_hovered_point = null;
                    }
                }
            }
        },
    ]
}