var GameLayer = cc.Layer.extend({
    moving: false,
    direction: cc.p(0,0),
    ctor:function () {
        this._super();
        this.initController();
        
        this.initGirl();
        this.initAnchorSpheres();
        this.setCameraMask(cc.CameraFlag.USER1);
    },

    initAnchorSpheres: function(){
        let sphere = new jsb.Sprite3D(res.sphere);
        sphere.setPosition3D(cc.math.vec3(50, 0, 50));
        this.addChild(sphere);
        let sphere2 = new jsb.Sprite3D(res.sphere);
        sphere2.setPosition3D(cc.math.vec3(100, 0, 100));
        this.addChild(sphere2);
    },

    initGirl: function(){
        let girl = new jsb.Sprite3D(res.girl);
        girl.setPosition3D(cc.math.vec3(0, 0, 0));
        this.addChild(girl);

        let animation = new jsb.Animation3D(res.girl);
        if(animation){
            let animate = new jsb.Animate3D(animation);
            girl.runAction(cc.repeatForever(animate));
        }

        this.girl = girl;
        girl.setRotation3D(cc.math.vec3(0,-90,0));
    },

    initController: function(){
        // Keyboard
        this.initKeyboardListener();

        // Touch / Mouse
        this.initCameraChangeListener();
    },

    initKeyboardListener: function(){
        if ('keyboard' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (key, event) {
                    let direction = cc.p(0,0);
                    switch(key){
                        case cc.KEY["a"]:
                        case cc.KEY["left"]:
                            direction = cc.p(-1, 0);
                            break;
                        case cc.KEY["d"]:
                        case cc.KEY["right"]:
                            direction = cc.p(1, 0);
                            break;
                        case cc.KEY["s"]:
                        case cc.KEY["down"]:
                            direction = cc.p(0, -1);
                            break;
                        case cc.KEY["w"]:
                        case cc.KEY["up"]:
                            direction = cc.p(0, 1);
                            break;
                    }
                    this.addDirection(direction);
                }.bind(this),
                onKeyReleased: function (key, event) {
                    let direction = cc.p(0,0);
                    switch(key){
                        case cc.KEY["a"]:
                        case cc.KEY["left"]:
                            direction = cc.p(-1, 0);
                            break;
                        case cc.KEY["d"]:
                        case cc.KEY["right"]:
                            direction = cc.p(1, 0);
                            break;
                        case cc.KEY["s"]:
                        case cc.KEY["down"]:
                            direction = cc.p(0, -1);
                            break;
                        case cc.KEY["w"]:
                        case cc.KEY["up"]:
                            direction = cc.p(0, 1);
                            break;
                    }
                    this.removeDirection(direction);
                }.bind(this)
            }, this);
        } else {
            cc.log("KEYBOARD Not supported");
        }
    },

    initCameraChangeListener: function(){
        if(sys.isMobile){
            // Touch to move camera
            this.initTouchListener();
        }
        else{
            // Mouse move to move camera
            this.initMouseListener();
        }
    },

    initMouseListener: function(){
        if('mouse' in cc.sys.capabilities){
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseMove: function(event){
                    this.moveCameraWithDelta(event.getDelta());
                }.bind(this)
            }, this);
        }
        else {
            cc.log("MOUSE Not supported");
        }
    },

    initTouchListener: function(){
        if('touches' in cc.sys.capabilities){
            cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                onTouchBegan: function(touch, event){
                    return true;
                },
                onTouchMoved: function(touch, event){
                    this.moveCameraWithDelta(touch.getDelta());
                }.bind(this)
            }, this)
        }
        else{
            cc.log("TOUCHES Not supported");
        }
    },

    moveCameraWithDelta: function(delta){
        const camera = cc.director.getRunningScene().camera;
        if(!camera) return;
        camera.p += delta.x/cc.winSize.width*Math.PI;
        camera.t += delta.y/cc.winSize.width*Math.PI;
        camera.t = Math.max(Math.min(camera.t, Math.PI/2), 0);
        
        let x = camera.lookAtPos.x + camera.r * Math.sin(camera.p);
        let y = camera.lookAtPos.y + camera.r * Math.sin(camera.t);
        let z = camera.lookAtPos.z + camera.r * Math.cos(camera.p);
        camera.setPosition3D(cc.math.vec3(x, y, z));
        camera.lookAt(camera.lookAtPos);
    },

    addDirection: function(direction){
        this.direction.x += direction.x;
        this.direction.y += direction.y;
        if(!this.moving){
            this.moving = true;
            this.schedule(this.moveCharacter);
        }
    },

    removeDirection: function(direction){
        this.direction.x -= direction.x;
        this.direction.y -= direction.y;
        if(this.moving && this.direction.x === 0 && this.direction.y === 0){
            this.moving = false;
            this.unschedule(this.moveCharacter);
        }
    },

    moveCharacterOld: function(dt){
        // Naive moving using coord
        let pos = this.girl.getPosition3D();
        const SPEED = 100; // Move 100 unit per second
        pos.x += this.direction.x * SPEED * dt;
        pos.z += this.direction.y * SPEED * dt;
        this.girl.setPosition3D(pos);
    },

    moveCharacter: function(dt){
        if(!this.moving || (this.direction.x === 0 && this.direction.y === 0)) return;

        const camera = cc.director.getRunningScene().camera;
        if(!camera) return;

        // Find the forward vector of current viewport
        const cameraPos = camera.getPosition3D();
        let forwardVector = cc.p(camera.lookAtPos.x - cameraPos.x, camera.lookAtPos.z - cameraPos.z);
        forwardVector = normalizeVector(forwardVector);

        let rightVector = rotateVector2(forwardVector, Math.PI/2);

        const SPEED = 100;

        let forward = forwardVector;
        forward.x *= this.direction.y * SPEED * dt;
        forward.y *= this.direction.y * SPEED * dt;

        let side = rightVector;
        side.x *= this.direction.x * SPEED * dt;
        side.y *= this.direction.x * SPEED * dt;

        // Move by sum vector
        let moveDirection = cc.p(forward.x + side.x, forward.y + side.y);
        let pos = this.girl.getPosition3D();
        pos.x += moveDirection.x;
        pos.z += moveDirection.y;
        this.girl.setPosition3D(pos);

        // Rotation
        let angle =(180/Math.PI)*Math.acos(((moveDirection.x * -1)/(lengthVector(moveDirection))));
        if(moveDirection.y < -0.1) angle = -angle;
        // Model angle offset
        angle -= 50;
        this.girl.setRotation3D(cc.math.vec3(0, angle, 0));

        // Camera
        camera.lookAtPos = pos;
        camera.setPosition3D(cc.math.vec3(cameraPos.x + moveDirection.x, cameraPos.y, cameraPos.z + moveDirection.y));
        camera.lookAt(pos);
    }
});