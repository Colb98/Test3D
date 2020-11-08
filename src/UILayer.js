var UILayer = cc.Layer.extend({
    ctor: function(){
        this._super();
        this.initUI();
    },

    initUI: function(){
        let menu = new cc.Menu();
        menu.setPosition(0, cc.winSize.height);
        this.addChild(menu);
        this.menu = menu;

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

        let menu2 = new cc.Menu();
        menu2.setPosition(cc.winSize.width - 20, 20);
        this.addChild(menu2);
        let lbHideMenu = new cc.LabelTTF("Hide Menu", "Arial", 24);
        let itemHideMenu = new cc.MenuItemLabel(lbHideMenu, this.hideMenu, this);
        itemHideMenu.setAnchorPoint(1, 0);
        itemHideMenu.setPosition(0, 0);
        menu2.addChild(itemHideMenu);
        
        let lbZoomP = new cc.LabelTTF("Zoom Out", "Arial", 24);
        let itemZoomP = new cc.MenuItemLabel(lbZoomP, this.zoomP, this);
        itemZoomP.setAnchorPoint(1, 0);
        itemZoomP.setPosition(0, 80);
        menu2.addChild(itemZoomP);

        let lbZoomN = new cc.LabelTTF("Zoom In", "Arial", 24);
        let itemZoomN = new cc.MenuItemLabel(lbZoomN, this.zoomN, this);
        itemZoomN.setAnchorPoint(1, 0);
        itemZoomN.setPosition(0, 160);
        menu2.addChild(itemZoomN);
    },

    zoomP: function(){
        const scene = cc.director.getRunningScene();
        scene.zoom(1);
    },

    zoomN: function(){
        const scene = cc.director.getRunningScene();
        scene.zoom(-1);
    },

    hideMenu: function(){
        this.menu.setVisible(!this.menu.isVisible());
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
