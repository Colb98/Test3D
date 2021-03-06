#ifdef GL_ES
precision highp float;
#endif

varying vec3 v_normal;
varying vec2 v_uv;
varying vec4 v_world_position;
varying vec3 v_tangent;
varying vec3 v_binormal;

uniform vec4 u_color;
uniform vec3 u_cam_pos;

// 5 point lights
// 5 sphere lights
// 5 tube lights
// 5 rectangle lights
uniform vec3 u_point_light[6];
uniform vec3 u_sphere_light[6];
uniform vec3 u_tube_light[6];
uniform vec3 u_rect_light[6];

uniform sampler2D u_albedo_map;
uniform sampler2D u_ao_map;
uniform sampler2D u_metallic_map;
uniform sampler2D u_roughness_map;
uniform sampler2D u_normal_map;
uniform sampler2D u_opacity_map;
uniform sampler2D u_brdf;

// 4 levels of mipmaps
uniform samplerCube u_hdr_map_0;
uniform samplerCube u_hdr_map_1;
uniform samplerCube u_hdr_map_2;
uniform samplerCube u_hdr_map_3;
uniform samplerCube u_env_map;

const float PI = 3.14159265359;

// TODO: normal mapping with TBN Matrix (need one more buffer)
vec3 getNormal(){
    vec3 normal = texture2D(u_normal_map, v_uv).rgb;
    normal = normalize(normal * 2.0 - 1.0);
    // normal = normalize(v_tbn * normal);
    return normal;
}

vec3 FresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness){
    // return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(1.0 - cosTheta, 5.0);
}

vec3 FresnelSchlick(float cosTheta, vec3 F0){
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

float DistributionGGX(vec3 N, vec3 H, float roughness){
    float a = roughness * roughness;
    float a2 = a*a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;

    float num = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return num/denom;
}

float GeometrySchlickGGX(float NdotV, float roughness){
    float r = (roughness + 1.0);
    float k = (r*r)/8.0;
    float num = NdotV;
    float denom = NdotV * (1.0-k) + k;
    return num/denom;
}

float GeometrySmith(float NdotV, float NdotL, float roughness){
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}

vec4 textureCubeLod(vec3 uvw, float lod){
    // int minLod;
    // return textureCube(u_hdr_map_0, uvw);
    if(lod < 1.0){
        return textureCube(u_hdr_map_0, uvw);
    }
    else if(lod < 2.0){
        return mix(textureCube(u_hdr_map_0, uvw), textureCube(u_env_map, uvw), vec4(fract(lod)));
    }
    else{
        return textureCube(u_env_map, uvw);
    }
}

vec3 calcNormal(){
    vec3 normal = texture2D(u_normal_map, v_uv).rgb;
    normal = normal * 2.0 - 1.0;
    normal = normal.r * v_tangent + normal.g * v_binormal + normal.b * v_normal;
    return normal;
}

void main(){
    // vec3 normal = texture2D(u_normal_map, v_uv).rgb;
    float metallic = texture2D(u_metallic_map, v_uv).r;
    vec3 normal = calcNormal();
    float roughness = texture2D(u_roughness_map, v_uv).r;
    float ao = texture2D(u_ao_map, v_uv).r;
    vec3 albedo = texture2D(u_albedo_map, v_uv).rgb;
    albedo = pow(albedo, vec3(2.2));
    // metallic = 0.0;
    // roughness = 0.9;
    // ao = 1.0;
    // albedo = vec3(1.0);

    vec3 world_pos = v_world_position.xyz;
    // vec3 N = normalize(v_normal);
    vec3 N = normal;
    vec3 V = normalize(u_cam_pos - world_pos);
    vec3 r = reflect(-V, N);

    float NdotV = max(dot(N, V), 0.0001);

    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metallic);
    vec3 Lo = vec3(0.0);

    // POINT LIGHTS
    for(int i=1;i<3;i++){
        vec3 light = u_point_light[i];
        vec3 L = normalize(light - world_pos);
        vec3 H = normalize(V + L);
        float dist = length(light - world_pos)/100.0;
        float attenuation = 1.0/(dist*dist);
        vec3 radiance = vec3(1.0,1.0,1.0) * attenuation;

        float NdotL = max(dot(N, L), 0.0);

        float NDF  = DistributionGGX(N, H, roughness);
        float G = GeometrySmith(NdotV, NdotL, roughness);
        vec3 F  = FresnelSchlick(max(dot(H, V), 0.0), F0);

        vec3 kS = F;
        vec3 kD = vec3(1.0) - kS;
        kD *= 1.0 - metallic;

        vec3 num = NDF * G * F;
        float denom = 4.0 * NdotV * NdotL;
        vec3 specular = num / max(denom, 0.0001);
        Lo += (kD * albedo / PI + specular) * radiance * NdotL;
    }

    vec3 F = FresnelSchlickRoughness(NdotV, F0, roughness);
    vec3 kS = F;
    vec3 kD = 1.0 - kS;
    kD *= 1.0 - metallic;

    vec3 irradiance = textureCube(u_env_map, N).rgb;
    vec3 diffuse =  irradiance * albedo;

    const float MAX_LOD = 3.0;
    vec3 prefilteredColor = textureCubeLod(r, roughness * MAX_LOD).rgb;
    vec2 brdf = texture2D(u_brdf, vec2(NdotV, roughness)).rg;
    vec3 specular = prefilteredColor * (F * brdf.x + brdf.y);

    vec3 ambient = (kD * diffuse + specular)* ao;
    vec3 color = ambient + Lo;

    color = color/(color + vec3(1.0));
    color = pow(color, vec3(1.0/2.2));

    gl_FragColor = vec4(color, 1.0) * u_color;
}