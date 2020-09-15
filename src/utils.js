var normalizeVector = function(v){
    if(v.z !== undefined){
        let length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        return cc.math.vec3(v.x/length, v.y/length, v.z/length);
    }
    let length = Math.sqrt(v.x * v.x + v.y * v.y);
    return cc.p(v.x/length, v.y/length);
}

var rotateVector2 = function(v, theta){
    return cc.p(v.x*Math.cos(theta) - v.y*Math.sin(theta), v.x*Math.sin(theta) + v.y*Math.cos(theta));
}

var lengthVector = function(v){
    if(v.z !== undefined){
        return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
    }
    return Math.sqrt(v.x*v.x + v.y*v.y);
}