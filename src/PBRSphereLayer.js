const PBRSphereLayer = cc.Layer.extend({
    ctor: function(){
        this._super();
        this.initSphere();
        this.initShader();
        this.initMouseListener();
        this.setCameraMask(cc.CameraFlag.USER1);
    },

    initSphere: function(){
        let sphere = new jsb.Sprite3D(res.sphere);
        sphere.setPosition3D(cc.math.vec3(0, 0, 0));
        this.addChild(sphere);
    },

    initMouseListener: function(){
        if('mouse' in cc.sys.capabilities){
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseScroll: function(event){
                    const zoomDir = event.getScrollY();
                    this.zoom(zoomDir);
                }.bind(this)
            }, this);
        }
        else {
            cc.log("MOUSE Not supported");
        }
    },

    zoom: function(dir){
        const camera = cc.director.getRunningScene().camera;
        if(!camera) return;
        camera.r *= 1 + 0.2*dir;
        
        let x = camera.lookAtPos.x + camera.r * Math.sin(camera.p);
        let y = camera.lookAtPos.y + camera.r * Math.sin(camera.t);
        let z = camera.lookAtPos.z + camera.r * Math.cos(camera.p);
        camera.setPosition3D(cc.math.vec3(x, y, z));
        camera.lookAt(camera.lookAtPos);
    },

    initShader: function(){

    }
});