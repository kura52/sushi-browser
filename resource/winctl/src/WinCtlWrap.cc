#include "WinCtlWindow.h"

using v8::FunctionTemplate;

NAN_MODULE_INIT(InitAll) {
	Window::Init(target);

	Nan::Set(target, Nan::New("GetActiveWindow2").ToLocalChecked(), Nan::GetFunction(Nan::New<FunctionTemplate>(Window::GetActiveWindow2)).ToLocalChecked());
	Nan::Set(target, Nan::New("CreateWindow2").ToLocalChecked(), Nan::GetFunction(Nan::New<FunctionTemplate>(Window::CreateWindow2)).ToLocalChecked());
    Nan::Set(target, Nan::New("GetWindowByClassName").ToLocalChecked(), Nan::GetFunction(Nan::New<FunctionTemplate>(Window::GetWindowByClassName)).ToLocalChecked());
	Nan::Set(target, Nan::New("GetWindowByTitleExact").ToLocalChecked(), Nan::GetFunction(Nan::New<FunctionTemplate>(Window::GetWindowByTitleExact)).ToLocalChecked());
	Nan::Set(target, Nan::New("EnumerateWindows").ToLocalChecked(), Nan::GetFunction(Nan::New<FunctionTemplate>(Window::EnumerateWindows)).ToLocalChecked());
	Nan::Set(target, Nan::New("WindowFromPoint2").ToLocalChecked(), Nan::GetFunction(Nan::New<FunctionTemplate>(Window::WindowFromPoint2)).ToLocalChecked());
}

NODE_MODULE(NativeExtension, InitAll)