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

var res = {
    HelloWorld_png : "res/image/HelloWorld.png",
    girl : "res/3d/girl.c3b",
    sphere : "res/3d/sphere.c3b",
    grass : "res/image/grass.jpg",
    rifle : "res/3d/rifle/rifle.c3b",
    sword : "res/3d/sword/Scottish Sword.c3b",
    gun : "res/3d/gun/gun3.c3t",

    cobble_stone_albedo : "res/3d/cobblestone-curved_albedo.png",
    cobble_stone_ao : "res/3d/cobblestone-curved_ao.png",
    cobble_stone_metallic : "res/3d/cobblestone-curved_metallic.png",
    cobble_stone_roughness : "res/3d/cobblestone-curved_roughness.png",
    cobble_stone_normal : "res/3d/cobblestone-curved_normal-ogl.png",

    rust_iron_albedo : "res/3d/rustediron2_albedo.png",
    rust_iron_ao : "res/3d/white.png",
    rust_iron_metallic : "res/3d/rustediron2_metallic.png",
    rust_iron_roughness : "res/3d/rustediron2_roughness.png",

    rifle_albedo : "res/3d/rifle/Rifle_BaseColor.png",
    rifle_ao : "res/3d/rifle/Rifle__MRAO.png",
    rifle_metallic : "res/3d/rifle/Rifle__MRAO.png",
    rifle_roughness : "res/3d/rifle/Rifle__MRAO.png",

    sword_albedo : "res/3d/sword/PBR_Material _15_Base_Color.png",
    sword_ao : "res/3d/sword/PBR_Material _15_Mixed_AO.png",
    sword_metallic : "res/3d/sword/PBR_Material _15_Metallic.png",
    sword_roughness : "res/3d/sword/PBR_Material _15_Roughness.png",

    gun_albedo : "res/3d/gun/BC.jpg",
    gun_ao : "res/3d/gun/AO.jpg",
    gun_metallic : "res/3d/gun/M.jpg",
    gun_roughness : "res/3d/gun/R.jpg",
    gun_normal : "res/3d/gun/N.jpg",

    brdf_lut : "res/3d/ibl_brdf_lut.png"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}
