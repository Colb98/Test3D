const PBRSphereLayer = cc.Layer.extend({
    resName: "gun",
    envName: "icelake",
    ctor: function(){
        this._super();
        // this.initShadow();
        this.initSphere();
        this.initShader();
        // this.initGrass();
        this.setCameraMask(cc.CameraFlag.USER1);

        this.initCameraListener();
        this.initScheduleMoveLights();

        // this.initShadow();
    },

    initScheduleMoveLights: function(){
        this._totalTime = 0;
        this.schedule(this.updateLightPos);
    },

    initCameraListener: function(){
        const camera = cc.director.getRunningScene().camera;
        camera.addCallback(this.onCameraChange.bind(this));
        cc.director.getRunningScene().setCameraLookAt(cc.math.vec3(0, 100, 0));
    },

    initGrass: function(){
        // const node3d = new jsb.Sprite3D();
        // this.addChild(node3d);

        // const grass = new cc.Sprite(res.grass);
        // node3d.addChild(grass);
        // grass.setRotation3D(cc.math.vec3(-90, 0, 0));
    },


    onCameraChange: function(position){
        // cc.log("set uniform vec3: " + JSON.stringify(position));
        if(this._state)
            this._state.setUniformVec3("u_cam_pos", position);
    },

    initShadow: function(){
        let shadowSphere = new jsb.Sprite3D(res[this.resName]);
        shadowSphere.setRotation3D(cc.math.vec3(-90, 0, 0));
        shadowSphere.setPosition3D(cc.math.vec3(14, 125, 0));
        this.addChild(shadowSphere);
        this._shadowSphere = shadowSphere;

        const camera = new cc.Camera(cc.Camera.Mode.PERSPECTIVE, 80, cc.winSize.width/cc.winSize.height, 0.01, 1000);
        camera.setPosition3D(cc.math.vec3(200, 200, 200));
        camera.lookAt(shadowSphere.getPosition3D());
        const shader = new cc.GLProgram("res/shader/DepthRTT.vert", "res/shader/DepthRTT.frag");
        const state = cc.GLProgramState.create(shader);
        shadowSphere.setGLProgramState(state);
        state.setUniformMat4("depthMVP", camera.getViewProjectionMatrix());
        state.setUniformFloat("u_farPlane", 1000);
    
        // shadowSphere.draw = function(a,b,c){
        //     shadowSphere.setVisible(true);
        //     this._sphere.setVisible(false);
        //     shadowSphere._super(a,b,c);
        // }.bind(this);
        

        // prepare the texture for screen capture
        const width = cc.winSize.width;
        const height = cc.winSize.height;
        const pixels = new Uint8Array(4*width*height);
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
        var squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        var vertices = [
            width/2,  height/2,
            0,    height/2,
            width/2,  0,
            0,    0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        var squareVertexTextureBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexTextureBuffer);
        var texcoords = [
            1, 1,
            0, 1,
            1, 0,
            0, 0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        let glNode = new cc.GLNode();
        cc.director.getRunningScene().addChild(glNode);
        this.glNode = glNode;
        const rectShader = cc.shaderCache.getProgram("ShaderPositionTexture");
        rectShader.retain();
        glNode.draw = function(){
            rectShader.use();
            rectShader.setUniformsForBuiltins();
            gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            gl.bindTexture( gl.TEXTURE_2D, texture );
    
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            
            gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
            gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_TEX_COORDS);

            // Draw fullscreen Square
            gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexTextureBuffer);
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            this._shadowSphere.setVisible(false);
            // this._sphere.setVisible(true);
        }.bind(this);
    },

    initSphere: function(){
        let sphere = new jsb.Sprite3D(res[this.resName]);
        sphere.setRotation3D(cc.math.vec3(-90, 0, 0));
        sphere.setPosition3D(cc.math.vec3(14, 125, 0));
        this.addChild(sphere);
        this._sphere = sphere;
    },

    initShader: function(){
        const shader = new cc.GLProgram("res/shader/pbr.vert", "res/shader/pbr.frag");
        // shader.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
        // shader.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
        // shader.addAttribute(cc.ATTRIBUTE_NAME_NORMAL, cc.VERTEX_ATTRIB_NORMAL);
    
        shader.retain();

        const state = cc.GLProgramState.create(shader);
        this._sphere.setGLProgramState(state);
        this._state = state;
        this._program = shader;
        
        state.setUniformTexture("u_brdf", cc.textureCache.addImage(res.brdf_lut));
        state.setUniformTexture("u_albedo_map", cc.textureCache.addImage(res[this.resName+"_albedo"]));
        state.setUniformTexture("u_metallic_map", cc.textureCache.addImage(res[this.resName+"_metallic"]));
        state.setUniformTexture("u_ao_map", cc.textureCache.addImage(res[this.resName+"_ao"]));
        state.setUniformTexture("u_roughness_map", cc.textureCache.addImage(res[this.resName+"_roughness"]));
        state.setUniformTexture("u_normal_map", cc.textureCache.addImage(res[this.resName+"_normal"]));


        let pPointLights = [0,0,0, 0,0,-50, 0,100,50];
        pPointLights = new Float32Array(pPointLights);

        var program = shader.getProgram();
        var loc = gl.getUniformLocation(program, "u_point_light");
        gl.uniform3fv(loc, 3, pPointLights);
        
        const path = "res/cubemaps/" + this.envName + "_env/";
        const env_map = jsb.TextureCube.create(path + "px.png", path + "nx.png", path + "py.png", path + "ny.png", path + "pz.png", path + "nz.png");
        env_map.setTexParameters(gl.LINEAR, gl.LINEAR, gl.MIRRORED_REPEAT, gl.MIRRORED_REPEAT);
        state.setUniformTexture("u_env_map", env_map);

        let dummyskybox = jsb.Skybox.create();
        dummyskybox.setTexture(env_map);
        this.addChild(dummyskybox);
        dummyskybox.setVisible(false);
        
        // for(let i=0;i<4;i++){
            const path_hdr = "res/cubemaps/" + this.envName + "_hdr_1/";
            const hdr_map = jsb.TextureCube.create(path_hdr + "px.png", path_hdr + "nx.png", path_hdr + "py.png", path_hdr + "ny.png", path_hdr + "pz.png", path_hdr + "nz.png");
            hdr_map.setTexParameters(gl.LINEAR, gl.LINEAR, gl.MIRRORED_REPEAT, gl.MIRRORED_REPEAT);
            state.setUniformTexture("u_hdr_map_0", hdr_map);

            let dummyskybox = jsb.Skybox.create();
            dummyskybox.setTexture(hdr_map);
            this.addChild(dummyskybox);
        // }
    },

    updateLightPos: function(dt){
        if(!this._state) return;
        this._totalTime += dt;
        let x = 0, y = (this._totalTime * 20)%200 < 100 ? 50 + (this._totalTime * 20)%100 : 150 - (this._totalTime * 20)%100, z = 50;
        let x2 = (this._totalTime * 20)%200 < 100 ? 50 + (this._totalTime * 20)%100 : 150 - (this._totalTime * 20)%100, y2 = 50, z2 = -50;
        
        this._program.use();
        let pPointLights = [0,0,0, x,y,z, x2, y2, z2];
        // cc.log("positions: " + JSON.stringify(pPointLights));
        pPointLights = new Float32Array(pPointLights);
        
        var loc = gl.getUniformLocation(this._program.getProgram(), "u_point_light");
        gl.uniform3fv(loc, 3, pPointLights);
    },

    // draw: function(){

    //     this._super();
    // }
});