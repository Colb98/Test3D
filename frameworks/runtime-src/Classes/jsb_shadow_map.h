#ifndef __jsb_shadow_map__
#define __jsb_shadow_map__
#include "jsapi.h"
#include "jsfriendapi.h"

bool jsb_testLog(JSContext *cx, uint32_t argc, jsval *vp);
bool jsb_initShadow(JSContext *cx, uint32_t argc, jsval *vp);
bool jsb_after_draw_shadow(JSContext *cx, uint32_t argc, jsval *vp);
bool jsb_drawshadow(JSContext *cx, uint32_t argc, jsval *vp);
GLuint initProgram(const char* vert, const char* frag);


#endif