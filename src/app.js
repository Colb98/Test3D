/****************************************************************************
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
 
 http://www.cocos2d-x.org
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

const DEFAULT_CAMERA_DISTANCE = 250;

var HelloWorldScene = cc.Scene.extend({
    autoCamera: false,
    curLayerIdx: 0,
    _3dLayers: [],
    onEnter:function () {
        this._super();

        this.initCamera();

        let gameLayer = new GameLayer();
        this.addChild(gameLayer);
        this._gameLayer = gameLayer;
        this._3dLayers.push(gameLayer);

        let uiLayer = new UILayer();
        this.addChild(uiLayer);
        this._uiLayer = uiLayer;

        let sphereLayer = new PBRSphereLayer();
        sphereLayer.setVisible(false);
        this.addChild(sphereLayer);
        this._3dLayers.push(sphereLayer);
    },

    gotoNextLayer: function(){
        this._3dLayers[this.curLayerIdx].setVisible(false);
        this.curLayerIdx = (this.curLayerIdx + 1)%this._3dLayers.length;
        this._3dLayers[this.curLayerIdx].setVisible(true);
    },


    initCamera: function(){
        let camera = new cc.Camera(cc.Camera.Mode.PERSPECTIVE, 80, cc.winSize.width/cc.winSize.height, 0.01, 1000);
        camera.setCameraFlag(cc.CameraFlag.USER1);

        camera._totalTime = 0;
        camera.r = DEFAULT_CAMERA_DISTANCE;
        camera.p = 0;
        camera.t = Math.PI/4;
        camera.lookAtPos = cc.math.vec3(0,0,0);

        camera.setPosition3D(cc.math.vec3(0, camera.r * Math.sin(camera.t), camera.r));
        camera.lookAt(cc.math.vec3(0, 0, 0));

        let updateFunction = function(dt){
            const scene = cc.director.getRunningScene();
            if(!scene.autoCamera) return;
            this.p = this._totalTime;
            let x = this.lookAtPos.x + this.r * Math.sin(this.p);
            let y = this.lookAtPos.y + this.r * Math.sin(this.t);
            let z = this.lookAtPos.z + this.r * Math.cos(this.p);
            this.setPosition3D(cc.math.vec3(x, y, z));
            this.lookAt(this.lookAtPos);
            this._totalTime += dt;
        };
        camera.schedule(updateFunction.bind(camera));
        this.addChild(camera);
        this.camera = camera;
    },

    resetCamera: function(){
        const camera = this.camera;
        camera.r = DEFAULT_CAMERA_DISTANCE;
        camera.p = 0;
        let x = camera.lookAtPos.x + camera.r * Math.sin(camera.p);
        let y = camera.lookAtPos.y + camera.r * Math.sin(camera.t);
        let z = camera.lookAtPos.z + camera.r * Math.cos(camera.p);
        camera.setPosition3D(cc.math.vec3(x, y, z));
        camera.lookAt(camera.lookAtPos);
    },

    setAutoCamera: function(val){
        this.autoCamera = val;
    }
});

