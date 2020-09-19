var UILayer = cc.Layer.extend({
    ctor: function(){
        this._super();
        this.initUI();
    },

    initUI: function(){
        let menu = new cc.Menu();
        menu.setPosition(0, cc.winSize.height);
        this.addChild(menu);

        let lbToggleAutoCamera = new cc.LabelTTF("Toggle auto camera", "Arial", 24);
        let itemToggleCamera = new cc.MenuItemLabel(lbToggleAutoCamera, this.toggleAutoCamera, this);
        itemToggleCamera.setAnchorPoint(0, 1);
        itemToggleCamera.setPosition(50, 0);
        menu.addChild(itemToggleCamera);

        let lbNextLayer = new cc.LabelTTF("Next Layer", "Arial", 24);
        let itemNextLayer = new cc.MenuItemLabel(lbNextLayer, this.nextLayer, this);
        itemNextLayer.setAnchorPoint(0, 1);
        itemNextLayer.setPosition(50, -40);
        menu.addChild(itemNextLayer);

        let lbResetCamera = new cc.LabelTTF("Reset Camera", "Arial", 24);
        let itemResetCamera = new cc.MenuItemLabel(lbResetCamera, this.resetCamera, this);
        itemResetCamera.setAnchorPoint(0, 1);
        itemResetCamera.setPosition(50, -80);
        menu.addChild(itemResetCamera);

        let lbToggleMouseMoveCamera = new cc.LabelTTF("Toggle mouse move camera on move", "Arial", 24);
        let itemToggleMouseMoveCamera = new cc.MenuItemLabel(lbToggleMouseMoveCamera, this.toggleAutoRotateCameraOnMouse, this);
        itemToggleMouseMoveCamera.setAnchorPoint(0, 1);
        itemToggleMouseMoveCamera.setPosition(50, -120);
        menu.addChild(itemToggleMouseMoveCamera);
    },

    toggleAutoCamera: function(){
        const scene = cc.director.getRunningScene();
        scene.setAutoCamera(!scene.autoCamera);
    },

    nextLayer: function(){
        const scene = cc.director.getRunningScene();
        scene.gotoNextLayer();
    },

    resetCamera: function(){
        const scene = cc.director.getRunningScene();
        scene.resetCamera();
    },

    toggleAutoRotateCameraOnMouse: function(){
        const scene = cc.director.getRunningScene();
        scene.toggleAutoRotateCameraOnMouse();
    }
});
