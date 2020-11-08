#include "scripting/js-bindings/manual/js_bindings_config.h"
#include "scripting/js-bindings/manual/js_bindings_core.h"
#include "jsfriendapi.h"
#include "scripting/js-bindings/manual/cocos2d_specifics.hpp"
#include "scripting/js-bindings/manual/jsb_opengl_manual.h"
#include "scripting/js-bindings/manual/js_bindings_opengl.h"

#include "jsb_shadow_map_registration.h"

void JSB_register_shadow_map(JSContext *_cx, JS::HandleObject object) {
	//
	// gl
	//
	JS::RootedObject opengl(_cx, JS_NewObject(_cx, NULL, JS::NullPtr(), JS::NullPtr()));

	JS::RootedValue openglVal(_cx);
	openglVal = OBJECT_TO_JSVAL(opengl);
	JS_SetProperty(_cx, object, "shadow", openglVal);

	//JS::RootedObject ccns(_cx);
	//get_or_create_js_obj(_cx, object, "cc", &ccns);

	//js_register_cocos2dx_GLNode(_cx, ccns);

	JS_DefineFunction(_cx, opengl, "testDebugLog", jsb_testLog, 3, JSPROP_READONLY | JSPROP_PERMANENT | JSPROP_ENUMERATE);
	JS_DefineFunction(_cx, opengl, "initShadow", jsb_initShadow, 4, JSPROP_READONLY | JSPROP_PERMANENT | JSPROP_ENUMERATE);
	JS_DefineFunction(_cx, opengl, "drawShadow", jsb_drawshadow, 5, JSPROP_READONLY | JSPROP_PERMANENT | JSPROP_ENUMERATE);
	JS_DefineFunction(_cx, opengl, "afterDrawShadow", jsb_after_draw_shadow, 2, JSPROP_READONLY | JSPROP_PERMANENT | JSPROP_ENUMERATE);
}