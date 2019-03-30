#include "WinCtlWindow.h"

using v8::FunctionTemplate;

NAN_MODULE_INIT(InitAll) {
	Window::Init(target);

	Nan::Set(target, Nan::New("GetActiveWindow").ToLocalChecked(), Nan::GetFunction(Nan::New<FunctionTemplate>(Window::GetActiveWindow)).ToLocalChecked());
	Nan::Set(target, Nan::New("GetWindowByClassName").ToLocalChecked(), Nan::GetFunction(Nan::New<FunctionTemplate>(Window::GetWindowByClassName)).ToLocalChecked());
	Nan::Set(target, Nan::New("GetWindowByTitleExact").ToLocalChecked(), Nan::GetFunction(Nan::New<FunctionTemplate>(Window::GetWindowByTitleExact)).ToLocalChecked());
	Nan::Set(target, Nan::New("EnumerateWindows").ToLocalChecked(), Nan::GetFunction(Nan::New<FunctionTemplate>(Window::EnumerateWindows)).ToLocalChecked());
}

NODE_MODULE(NativeExtension, InitAll)