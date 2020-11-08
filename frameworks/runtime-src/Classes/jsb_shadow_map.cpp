
#include <stdio.h>
#include <string>
#include <vector>
#include <iostream>
#include <fstream>
#include <algorithm>
#include <sstream>
using namespace std;

#include "scripting/js-bindings/manual/js_bindings_config.h"
#include "scripting/js-bindings/manual/js_bindings_core.h"
#include "scripting/js-bindings/manual/js_manual_conversions.h"
#include "scripting/js-bindings/manual/jsb_opengl_functions.h"
#include "platform/CCGL.h"
#include "jsb_shadow_map.h"

bool jsb_testLog(JSContext *cx, uint32_t argc, jsval *vp) {
	JSB_PRECONDITION2(argc == 3, cx, false, "Invalid number of arguments. Need 3 ints");

	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
	bool ok = true;
	uint32_t arg0; int32_t arg1; uint32_t arg2; 

	ok &= jsval_to_uint32(cx, args.get(0), &arg0);
	ok &= jsval_to_int32(cx, args.get(1), &arg1);
	ok &= jsval_to_uint32(cx, args.get(2), &arg2);
	JSB_PRECONDITION2(ok, cx, false, "Error processing arguments");
	return true;
}

bool jsb_initShadow(JSContext *cx, uint32_t argc, jsval *vp) {
	JSB_PRECONDITION2(argc == 4, cx, false, "Invalid number of arguments.");

	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
	bool ok = true;
	// Shader name
	const char* arg0; const char* arg1; const char* arg2; const char* arg3;
	ok &= jsval_to_charptr(cx, args.get(0), &arg0);
	ok &= jsval_to_charptr(cx, args.get(1), &arg1);
	ok &= jsval_to_charptr(cx, args.get(2), &arg2);
	ok &= jsval_to_charptr(cx, args.get(3), &arg3);

	// Init Shaders
	GLuint depthProgram = initProgram(arg0, arg1);
	//JSB_PRECONDITION2(depthProgram != 0, cx, false, "Can't open program.");


	// Get a handle for our "MVP" uniform
	GLuint depthMatrixID = glGetUniformLocation(depthProgram, "depthMVP");

	// The framebuffer, which regroups 0, 1, or more textures, and 0 or 1 depth buffer.
	GLuint FramebufferName = 0;
	glGenFramebuffers(1, &FramebufferName);
	glBindFramebuffer(GL_FRAMEBUFFER, FramebufferName);

	// Depth texture. Slower than a depth buffer, but you can sample it later in your shader
	GLuint depthTexture;
	glGenTextures(1, &depthTexture);
	glBindTexture(GL_TEXTURE_2D, depthTexture);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT16, 1024, 1024, 0, GL_DEPTH_COMPONENT, GL_FLOAT, 0);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_COMPARE_FUNC, GL_LEQUAL);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_COMPARE_MODE, GL_COMPARE_R_TO_TEXTURE);

	glFramebufferTexture(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, depthTexture, 0);

	// No color output in the bound framebuffer, only depth.
	glDrawBuffer(GL_NONE);

	// Always check that our framebuffer is ok
	if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE)
		return false;

	//// Create and compile our GLSL program from the shaders
	//GLuint programID = initProgram(arg2, arg3);

	//// Get a handle for our "myTextureSampler" uniform
	//GLuint TextureID = glGetUniformLocation(programID, "myTextureSampler");

	//// Get a handle for our "MVP" uniform
	//GLuint MatrixID = glGetUniformLocation(programID, "MVP");
	//GLuint DepthBiasID = glGetUniformLocation(programID, "DepthBiasMVP");
	//GLuint ShadowMapID = glGetUniformLocation(programID, "shadowMap");
	
	// Return framebuffer, programId, mvpMatrixLocation, depthTextureId
	jsval retval = JSVAL_VOID;

	JS::RootedObject obj(cx, JS_NewObject(cx, NULL, JS::NullPtr(), JS::NullPtr()));

	ok &= JS_DefineProperty(cx, obj, "frameBuffer", FramebufferName, JSPROP_ENUMERATE | JSPROP_PERMANENT) &&
		JS_DefineProperty(cx, obj, "depthProgram", depthProgram, JSPROP_ENUMERATE | JSPROP_PERMANENT) &&
		JS_DefineProperty(cx, obj, "mvpMatrixLocation", depthMatrixID, JSPROP_ENUMERATE | JSPROP_PERMANENT) &&
		JS_DefineProperty(cx, obj, "depthTextureId", depthTexture, JSPROP_ENUMERATE | JSPROP_PERMANENT);
	JSB_PRECONDITION2(ok, cx, false, "Error creating JS Object");

	retval = OBJECT_TO_JSVAL(obj);
	args.rval().set(retval);

	glBindFramebuffer(GL_FRAMEBUFFER, 0);
	glBindTexture(GL_TEXTURE_2D, 0);

	return true;
}

bool jsb_drawshadow(JSContext *cx, uint32_t argc, jsval *vp) {
	JSB_PRECONDITION2(argc == 5, cx, false, "Invalid number of arguments.");

	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
	bool ok = true;
	// buffer/program/matrixLocation/texture id
	int32_t arg0; int32_t arg1; int32_t arg2; int32_t arg3; void* arg4;

	
	ok &= jsval_to_int32(cx, args.get(0), &arg0);
	ok &= jsval_to_int32(cx, args.get(1), &arg1);
	ok &= jsval_to_int32(cx, args.get(2), &arg2);
	ok &= jsval_to_int32(cx, args.get(3), &arg3);
	GLsizei count;
	ok &= JSB_jsval_typedarray_to_dataptr(cx, args.get(4), &count, &arg4, js::Scalar::Float32);
	JSB_PRECONDITION2(ok, cx, false, "Invalid arguments type");
	// render to our framebuffer
	glBindFramebuffer(GL_FRAMEBUFFER, arg0);
	glViewport(0, 0, 1024, 1024); // render on the whole framebuffer, complete from the lower left corner to the upper right
	glEnable(GL_CULL_FACE);
	glCullFace(GL_BACK); // Cull back-facing triangles -> draw only front-facing triangles

	// Clear the screen
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glUseProgram(arg1);
	glUniformMatrix4fv(arg2, 1, GL_FALSE, (GLfloat*)arg4);

	// need to unbind the framebuffer after draw the scene (1st time)
	return true;
}

bool jsb_after_draw_shadow(JSContext *cx, uint32_t argc, jsval *vp) {

	JSB_PRECONDITION2(argc == 2, cx, false, "Invalid number of arguments.");

	JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
	bool ok = true;
	// buffer/program/matrixLocation/texture id
	int32_t arg0; int32_t arg1;


	ok &= jsval_to_int32(cx, args.get(0), &arg0);
	ok &= jsval_to_int32(cx, args.get(1), &arg1);
	JSB_PRECONDITION2(ok, cx, false, "Invalid arguments type");
	glBindFramebuffer(GL_FRAMEBUFFER, 0);
	glViewport(0, 0, arg0, arg1);

	return true;
}

GLuint initProgram(const char* vert, const char* frag) {
	// Create the shaders
	GLuint VertexShaderID = glCreateShader(GL_VERTEX_SHADER);
	GLuint FragmentShaderID = glCreateShader(GL_FRAGMENT_SHADER);

	std::string VertexShaderCode;
	std::ifstream VertexShaderStream(vert, std::ios::in);
	if (VertexShaderStream.is_open()) {
		std::stringstream sstr;
		sstr << VertexShaderStream.rdbuf();
		VertexShaderCode = sstr.str();
		VertexShaderStream.close();
	}
	else {
		printf("Impossible to open %s. Are you in the right directory ? Don't forget to read the FAQ !\n", vert);
		getchar();
		return 0;
	}

	// Read the Fragment Shader code from the file
	std::string FragmentShaderCode;
	std::ifstream FragmentShaderStream(frag, std::ios::in);
	if (FragmentShaderStream.is_open()) {
		std::stringstream sstr;
		sstr << FragmentShaderStream.rdbuf();
		FragmentShaderCode = sstr.str();
		FragmentShaderStream.close();
	}

	GLint Result = GL_FALSE;
	int InfoLogLength;


	// Compile Vertex Shader
	printf("Compiling shader : %s\n", vert);
	char const * VertexSourcePointer = VertexShaderCode.c_str();
	glShaderSource(VertexShaderID, 1, &VertexSourcePointer, NULL);
	glCompileShader(VertexShaderID);

	// Check Vertex Shader
	glGetShaderiv(VertexShaderID, GL_COMPILE_STATUS, &Result);
	glGetShaderiv(VertexShaderID, GL_INFO_LOG_LENGTH, &InfoLogLength);
	if (InfoLogLength > 0) {
		std::vector<char> VertexShaderErrorMessage(InfoLogLength + 1);
		glGetShaderInfoLog(VertexShaderID, InfoLogLength, NULL, &VertexShaderErrorMessage[0]);
		printf("%s\n", &VertexShaderErrorMessage[0]);
	}



	// Compile Fragment Shader
	printf("Compiling shader : %s\n", frag);
	char const * FragmentSourcePointer = FragmentShaderCode.c_str();
	glShaderSource(FragmentShaderID, 1, &FragmentSourcePointer, NULL);
	glCompileShader(FragmentShaderID);

	// Check Fragment Shader
	glGetShaderiv(FragmentShaderID, GL_COMPILE_STATUS, &Result);
	glGetShaderiv(FragmentShaderID, GL_INFO_LOG_LENGTH, &InfoLogLength);
	if (InfoLogLength > 0) {
		std::vector<char> FragmentShaderErrorMessage(InfoLogLength + 1);
		glGetShaderInfoLog(FragmentShaderID, InfoLogLength, NULL, &FragmentShaderErrorMessage[0]);
		printf("%s\n", &FragmentShaderErrorMessage[0]);
	}



	// Link the program
	printf("Linking program\n");
	GLuint ProgramID = glCreateProgram();
	glAttachShader(ProgramID, VertexShaderID);
	glAttachShader(ProgramID, FragmentShaderID);
	glLinkProgram(ProgramID);

	// Check the program
	glGetProgramiv(ProgramID, GL_LINK_STATUS, &Result);
	glGetProgramiv(ProgramID, GL_INFO_LOG_LENGTH, &InfoLogLength);
	if (InfoLogLength > 0) {
		std::vector<char> ProgramErrorMessage(InfoLogLength + 1);
		glGetProgramInfoLog(ProgramID, InfoLogLength, NULL, &ProgramErrorMessage[0]);
		printf("%s\n", &ProgramErrorMessage[0]);
	}


	glDetachShader(ProgramID, VertexShaderID);
	glDetachShader(ProgramID, FragmentShaderID);

	glDeleteShader(VertexShaderID);
	glDeleteShader(FragmentShaderID);

	return ProgramID;
}