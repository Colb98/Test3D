const PBRSphereLayer = cc.Layer.extend({
    ctor: function(){
        this._super();
        this.initSphere();
        this.initShader();
        this.initGrass();
        this.setCameraMask(cc.CameraFlag.USER1);

        this.initCameraListener();
        this.initScheduleMoveLights();
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
        const node3d = new jsb.Sprite3D();
        this.addChild(node3d);

        const grass = new cc.Sprite(res.grass);
        node3d.addChild(grass);
        grass.setRotation3D(cc.math.vec3(-90, 0, 0));
    },


    onCameraChange: function(position){
        this._state.setUniformVec3("u_cam_pos", position);
    },

    initSphere: function(){
        let sphere = new jsb.Sprite3D(res.sphere);
        sphere.setPosition3D(cc.math.vec3(0, 100, 0));
        this.addChild(sphere);
        this._sphere = sphere;
    },

    initShader: function(){
        const shader = new cc.GLProgram("res/shader/pbr.vert", "res/shader/pbr.frag");
        shader.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
        shader.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
        // shader.addAttribute(cc.ATTRIBUTE_NAME_NORMAL, cc.VERTEX_ATTRIB_NORMAL);
        
        shader.link();
        shader.updateUniforms();
        shader.use();

        shader.retain();

        const state = cc.GLProgramState.create(shader);
        this._sphere.setGLProgramState(state);
        this._state = state;
        this._program = shader;
        
        state.setUniformTexture("u_albedo_map", cc.textureCache.addImage(res.rust_iron_albedo));
        state.setUniformTexture("u_metallic_map", cc.textureCache.addImage(res.rust_iron_metallic));
        state.setUniformTexture("u_ao_map", cc.textureCache.addImage(res.rust_iron_ao));
        state.setUniformTexture("u_roughness_map", cc.textureCache.addImage(res.rust_iron_roughness));


        let pPointLights = [0,0,0, 0,0,-50, 0,100,50];
        pPointLights = new Float32Array(pPointLights);

        var program = shader.getProgram();
        var loc = gl.getUniformLocation(program, "u_point_light");
        gl.uniform3fv(loc, 3, pPointLights);

        // cc.glUseProgram(program);
        // shader.setUniformLocationWith4f(shader.getUniformLocationForName("u_input[3]"), 0, 1, 0, 0.25);
        // shader.setUniformLocationWith4f(shader.getUniformLocationForName("u_input[1]"), 1, 0, 0, 0.25);
        // shader.setUniformLocationWith4f(shader.getUniformLocationForName("u_input[2]"), 0, 0, 1, 0.25);
        // shader.setUniformLocationWith4f(shader.getUniformLocationForName("u_inputt"), 0, 0, 1, 1);
    },

    updateLightPos: function(dt){
        this._totalTime += dt;
        let x = 0, y = (this._totalTime * 20)%200 < 100 ? 50 + (this._totalTime * 20)%100 : 150 - (this._totalTime * 20)%100, z = 50;
        let x2 = (this._totalTime * 20)%200 < 100 ? 50 + (this._totalTime * 20)%100 : 150 - (this._totalTime * 20)%100, y2 = 50, z2 = -50;
        
        this._program.use();
        let pPointLights = [0,0,0, x,y,z, x2, y2, z2];
        // cc.log("positions: " + JSON.stringify(pPointLights));
        pPointLights = new Float32Array(pPointLights);
        
        var loc = gl.getUniformLocation(this._program.getProgram(), "u_point_light");
        gl.uniform3fv(loc, 3, pPointLights);
    }
});