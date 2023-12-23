
HTMLElement.prototype.Style = function(styles){
    for(var key in styles){
        this.style[key] = styles[key]
    }
    return this
}

HTMLElement.prototype.Append = function(els){
    for(var el in els){
        this.append(els[el])
    }

    return this
}

HTMLElement.prototype.AddClass = function(className){
    this.classList.add(className)
    return this
}

HTMLElement.prototype.RemoveClass = function(className){
    this.classList.remove(className)
    return this
}

//modify constructor
HTMLElement.prototype.constructor = function(){
    //do all default behavior but return itself when done
    return this
}

export default HTMLElement