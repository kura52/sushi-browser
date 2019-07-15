#include "WinCtlWindow.h"

using v8::FunctionTemplate;

NAN_MODULE_INIT(InitAll) {
	Window::Init(target);

	Nan::Set(target, Nan::New("GetActiveWindow2").ToLocalChecked(), Nan::GetFunction(Nan::New<FunctionTemplate>(Window::GetActiveWindow2)).ToLocalChecked());
	Nan::Set(target, Nan::New("EnumerateWindows").ToLocalChecked(), Nan::GetFunction(Nan::New<FunctionTemplate>(Window::EnumerateWindows)).ToLocalChecked());
	Nan::Set(target, Nan::New("WindowFromPoint2").ToLocalChecked(), Nan::GetFunction(Nan::New<FunctionTemplate>(Window::WindowFromPoint2)).ToLocalChecked());
	Nan::Set(target, Nan::New("NonActiveWindowFromPoint").ToLocalChecked(), Nan::GetFunction(Nan::New<FunctionTemplate>(Window::NonActiveWindowFromPoint)).ToLocalChecked());
}

NODE_MODULE(NativeExtension, InitAll)