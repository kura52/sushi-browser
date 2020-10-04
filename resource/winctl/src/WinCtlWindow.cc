#include "WinCtlWindow.h"
#include "windows.h"

#include <psapi.h>
#pragma comment(lib, "psapi.lib")

#pragma warning ( disable:4311 )
#pragma warning ( disable:4302 )


Nan::Persistent<v8::Function> Window::constructor;

NAN_MODULE_INIT(Window::Init) {
	v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
	tpl->SetClassName(Nan::New("Window").ToLocalChecked());
	tpl->InstanceTemplate()->SetInternalFieldCount(1);

	Nan::SetPrototypeMethod(tpl, "getTitle", getTitle);
	Nan::SetPrototypeMethod(tpl, "getHwnd", getHwnd);
	Nan::SetPrototypeMethod(tpl, "getClassName", getClassName);
	Nan::SetPrototypeMethod(tpl, "getWindowLongPtr", getWindowLongPtr);

	Nan::SetPrototypeMethod(tpl, "setForegroundWindow", setForegroundWindow);
	Nan::SetPrototypeMethod(tpl, "setForegroundWindowEx", setForegroundWindowEx);
	Nan::SetPrototypeMethod(tpl, "getWindowModuleFileName", getWindowModuleFileName);
	Nan::SetPrototypeMethod(tpl, "setActiveWindow", setActiveWindow);
	Nan::SetPrototypeMethod(tpl, "setWindowPos", setWindowPos);
	Nan::SetPrototypeMethod(tpl, "moveTop", moveTop);
	Nan::SetPrototypeMethod(tpl, "setWindowLongPtr", setWindowLongPtr);
	Nan::SetPrototypeMethod(tpl, "setWindowLongPtrRestore", setWindowLongPtrRestore);
	Nan::SetPrototypeMethod(tpl, "setWindowLongPtrParent", setWindowLongPtrParent);
	Nan::SetPrototypeMethod(tpl, "setWindowLongPtrParentRestore", setWindowLongPtrParentRestore);
	Nan::SetPrototypeMethod(tpl, "setWindowLongPtrEx", setWindowLongPtrEx);
	Nan::SetPrototypeMethod(tpl, "setWindowLongPtrExRestore", setWindowLongPtrExRestore);
	Nan::SetPrototypeMethod(tpl, "setParent", setParent);


	Nan::SetPrototypeMethod(tpl, "showWindow", showWindow);
	Nan::SetPrototypeMethod(tpl, "move", move);
//	Nan::SetPrototypeMethod(tpl, "move2", move2);
	Nan::SetPrototypeMethod(tpl, "moveRelative", moveRelative);
	Nan::SetPrototypeMethod(tpl, "dimensions", dimensions);

	Nan::SetPrototypeMethod(tpl, "createWindow", createWindow);
	Nan::SetPrototypeMethod(tpl, "destroyWindow", destroyWindow);

	constructor.Reset(Nan::GetFunction(tpl).ToLocalChecked());
	Nan::Set(target, Nan::New("Window").ToLocalChecked(), Nan::GetFunction(tpl).ToLocalChecked());
}

Window::Window(HWND handle) {
	this->windowHandle = handle;
}

Window::~Window() {}


NAN_METHOD(Window::New) {
	if (info.IsConstructCall()) {
		Window *obj = new Window((HWND)info[0]->IntegerValue(Nan::GetCurrentContext()).ToChecked());
		obj->Wrap(info.This());
		info.GetReturnValue().Set(info.This());
	} else {
		const int argc = 1;
		v8::Local<v8::Value> argv[argc] = {info[0]};
		v8::Local<v8::Function> cons = Nan::New(constructor);
		info.GetReturnValue().Set(Nan::NewInstance(cons, argc, argv).ToLocalChecked());
	}
}

//NAN_METHOD(Window::GetActiveWindow) {
//	v8::Local<v8::Function> cons = Nan::New(constructor);
//	const int argc = 1;
//	HWND fgWin = GetForegroundWindow();
//	v8::Local<v8::Value> argv[1] = {Nan::New((int)fgWin)};
//	info.GetReturnValue().Set(Nan::NewInstance(cons, argc, argv).ToLocalChecked());
//}

NAN_METHOD(Window::GetActiveWindow2) {
	v8::Local<v8::Function> cons = Nan::New(constructor);
	const int argc = 1;
	HWND fgWin = GetForegroundWindow();
	if(fgWin == 0){
	  fgWin = GetActiveWindow();
	}
	v8::Local<v8::Value> argv[1] = {Nan::New((int)fgWin)};
	info.GetReturnValue().Set(Nan::NewInstance(cons, argc, argv).ToLocalChecked());
}

NAN_METHOD(Window::WindowFromPoint2) {
    HINSTANCE hInstance = GetModuleHandle( NULL );

    POINT pt;
	GetCursorPos(&pt);
    HWND hWnd = WindowFromPoint(pt);
    HWND parentHWnd;
	while((parentHWnd = GetParent(hWnd)) != NULL){
      hWnd = parentHWnd;
	}

	info.GetReturnValue().Set(Nan::New((int)hWnd));
}

NAN_METHOD(Window::NonActiveWindowFromPoint) {
    HINSTANCE hInstance = GetModuleHandle( NULL );

    POINT pt;
	GetCursorPos(&pt);
    HWND hWnd = WindowFromPoint(pt);
	HWND fgWin = GetForegroundWindow();

	if(hWnd != fgWin){
      HWND parentHWnd;
	  while((parentHWnd = GetParent(hWnd)) != NULL){
        hWnd = parentHWnd;
	  }
	}
	info.GetReturnValue().Set(Nan::New(hWnd == fgWin ? 0 : (int)hWnd));
}

v8::Local<v8::Function> enumCallback;
BOOL CALLBACK EnumWindowsProc(HWND hwnd, LPARAM lParam)
{
	const int constructorArgc = 1;
	v8::Local<v8::Value> constructorArgv[1] = {Nan::New((int)hwnd)};

	v8::Local<v8::Function> cons = Nan::New(Window::constructor);

	const int callbackArgc = 1;
	v8::Local<v8::Value> callbackArgv[1] = {Nan::NewInstance(cons, constructorArgc, constructorArgv).ToLocalChecked()};

    v8::Local<v8::Value> callbackResult = Nan::MakeCallback(Nan::GetCurrentContext()->Global(), enumCallback, callbackArgc, callbackArgv);

    v8::Isolate *isolate = v8::Isolate::GetCurrent();
    return callbackResult->BooleanValue(isolate);
}


NAN_METHOD(Window::EnumerateWindows) {
	enumCallback = info[0].As<v8::Function>();

	EnumWindows(EnumWindowsProc, 0);
}


NAN_METHOD(Window::getTitle) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());

	char wnd_title[256];
	GetWindowText(obj->windowHandle, wnd_title, sizeof(wnd_title));
	char wnd_title_utf8[512];

    wchar_t bufUnicode[512];
    int lenUnicode = MultiByteToWideChar(CP_ACP, 0, wnd_title, strlen(wnd_title)+1, bufUnicode, 512);
    WideCharToMultiByte(CP_UTF8, 0, bufUnicode, lenUnicode, wnd_title_utf8, 512, NULL, NULL);

	GetWindowText(obj->windowHandle, wnd_title, sizeof(wnd_title));

	info.GetReturnValue().Set(Nan::New(wnd_title_utf8).ToLocalChecked());
}

NAN_METHOD(Window::getHwnd) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());
	info.GetReturnValue().Set(Nan::New((int)obj->windowHandle));
}

NAN_METHOD(Window::getClassName) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());

	char wnd_cn[256];
	GetClassName(obj->windowHandle, wnd_cn, sizeof(wnd_cn));

	info.GetReturnValue().Set(Nan::New(wnd_cn).ToLocalChecked());
}


NAN_METHOD(Window::getWindowLongPtr) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());
	LONG_PTR windowLongPtrLONG = GetWindowLongPtr(obj->windowHandle, info[0]->Int32Value(Nan::GetCurrentContext()).ToChecked());
	if(windowLongPtrLONG != NULL) {
		info.GetReturnValue().Set(Nan::New((int)windowLongPtrLONG));
	}
}


NAN_METHOD(Window::setForegroundWindow) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());

	SetForegroundWindow(obj->windowHandle);
}

NAN_METHOD(Window::setForegroundWindowEx) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());

    int targetThread = GetWindowThreadProcessId(GetForegroundWindow(), NULL);
    int selfThread = GetCurrentThreadId();
    AttachThreadInput(selfThread, targetThread, TRUE );

    SetForegroundWindow(obj->windowHandle);

    AttachThreadInput(selfThread, targetThread, FALSE );
}

NAN_METHOD(Window::getWindowModuleFileName) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());

    char fileName[1024];
    DWORD processID;
    GetWindowThreadProcessId(obj->windowHandle, &processID);
    HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, processID);
    bool ret = false;
    if(hProcess){
        HMODULE hModule;
        DWORD cbReturned;
        if(EnumProcessModules(hProcess, &hModule, sizeof(hModule), &cbReturned)){
           ret = 0 != GetModuleFileNameEx(hProcess, hModule, fileName, sizeof(fileName));
        }
        CloseHandle(hProcess);
    }

	char fileName_utf8[2048];
    wchar_t bufUnicode[2048];
    int lenUnicode = MultiByteToWideChar(CP_ACP, 0, fileName, strlen(fileName)+1, bufUnicode, 2048);
    WideCharToMultiByte(CP_UTF8, 0, bufUnicode, lenUnicode, fileName_utf8, 2048, NULL, NULL);

    info.GetReturnValue().Set(Nan::New(fileName_utf8).ToLocalChecked());
}


NAN_METHOD(Window::setActiveWindow) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());

	SetActiveWindow(obj->windowHandle);
}

NAN_METHOD(Window::setWindowPos) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());

	HWND hWndInsertAfter = (HWND)info[0]->IntegerValue(Nan::GetCurrentContext()).ToChecked();
	int X = info[1]->Int32Value(Nan::GetCurrentContext()).ToChecked();
	int Y = info[2]->Int32Value(Nan::GetCurrentContext()).ToChecked();
	int cx = info[3]->Int32Value(Nan::GetCurrentContext()).ToChecked();
	int cy = info[4]->Int32Value(Nan::GetCurrentContext()).ToChecked();
	int uFlags = info[5]->Int32Value(Nan::GetCurrentContext()).ToChecked();

	SetWindowPos(obj->windowHandle, hWndInsertAfter, X, Y, cx, cy, uFlags);
}


NAN_METHOD(Window::moveTop) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());
	SetWindowPos(obj->windowHandle, (HWND)-1, 0, 0, 0, 0, 83);
	SetWindowPos(obj->windowHandle, (HWND)-2, 0, 0, 0, 0, 83);
}

NAN_METHOD(Window::setWindowLongPtr) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());

	LONG_PTR value = (LONG_PTR)info[0]->IntegerValue(Nan::GetCurrentContext()).ToChecked();

	SetWindowLongPtr(obj->windowHandle, GWL_STYLE, ((GetWindowLongPtr(obj->windowHandle, GWL_STYLE) | (value))));
}


NAN_METHOD(Window::setWindowLongPtrRestore) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());

	LONG_PTR value = (LONG_PTR)info[0]->IntegerValue(Nan::GetCurrentContext()).ToChecked();

	SetWindowLongPtr(obj->windowHandle, GWL_STYLE, ((GetWindowLongPtr(obj->windowHandle, GWL_STYLE) & (~value))));
}

NAN_METHOD(Window::setWindowLongPtrParent) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());

	LONG_PTR value = (LONG_PTR)info[0]->IntegerValue(Nan::GetCurrentContext()).ToChecked();

	SetWindowLongPtr(obj->windowHandle, -8, value);
}

NAN_METHOD(Window::setWindowLongPtrParentRestore) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());

	SetWindowLongPtr(obj->windowHandle, -8, NULL);
}

NAN_METHOD(Window::setWindowLongPtrEx) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());

	LONG_PTR value = (LONG_PTR)info[0]->IntegerValue(Nan::GetCurrentContext()).ToChecked();

	SetWindowLongPtr(obj->windowHandle, GWL_EXSTYLE, ((GetWindowLongPtr(obj->windowHandle, GWL_EXSTYLE) | (value))));
}


NAN_METHOD(Window::setWindowLongPtrExRestore) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());

	LONG_PTR value = (LONG_PTR)info[0]->IntegerValue(Nan::GetCurrentContext()).ToChecked();

	SetWindowLongPtr(obj->windowHandle, GWL_EXSTYLE, ((GetWindowLongPtr(obj->windowHandle, GWL_EXSTYLE) & (~value))));
}


NAN_METHOD(Window::setParent) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());

	HWND hWndNewParent = (HWND)info[0]->IntegerValue(Nan::GetCurrentContext()).ToChecked();

	SetParent(obj->windowHandle, hWndNewParent);
}

NAN_METHOD(Window::showWindow) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());

	const int nCmdShow = info[0]->Int32Value(Nan::GetCurrentContext()).ToChecked();
	ShowWindow(obj->windowHandle, nCmdShow);
}

NAN_METHOD(Window::move) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());

	const size_t x = info[0]->Int32Value(Nan::GetCurrentContext()).ToChecked();
	const size_t y = info[1]->Int32Value(Nan::GetCurrentContext()).ToChecked();
	const size_t w = info[2]->Int32Value(Nan::GetCurrentContext()).ToChecked();
	const size_t h = info[3]->Int32Value(Nan::GetCurrentContext()).ToChecked();

//	SetWindowPos(obj->windowHandle, NULL, x, y, w, h, 0x0004 | 0x0010);
//    SetWindowPos(obj->windowHandle, NULL, x, y, w, h, SWP_NOZORDER|SWP_NOOWNERZORDER|SWP_FRAMECHANGED);
	MoveWindow(obj->windowHandle, x, y, w, h, true);
}

//NAN_METHOD(Window::move2) {
//	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());
//
//	const size_t x = info[0]->Int32Value();
//	const size_t y = info[1]->Int32Value();
//	const size_t w = info[2]->Int32Value();
//	const size_t h = info[3]->Int32Value();
//
//	SetWindowPos(obj->windowHandle, NULL, x, y, w, h, 0x0004 | 0x0010);
//}

NAN_METHOD(Window::moveRelative) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());

	RECT dim;
	GetWindowRect(obj->windowHandle, &dim);

	const size_t dx = info[0]->Int32Value(Nan::GetCurrentContext()).ToChecked();
	const size_t dy = info[1]->Int32Value(Nan::GetCurrentContext()).ToChecked();
	const size_t dw = info[2]->Int32Value(Nan::GetCurrentContext()).ToChecked();
	const size_t dh = info[3]->Int32Value(Nan::GetCurrentContext()).ToChecked();

	const size_t x = dim.left + dx;
	const size_t y = dim.top + dy;
	const size_t w = (dim.right - dim.left) + dw;
	const size_t h = (dim.bottom - dim.top) + dh;

//    SetWindowPos(obj->windowHandle, NULL, x, y, w, h, SWP_NOZORDER|SWP_NOOWNERZORDER|SWP_FRAMECHANGED);
	MoveWindow(obj->windowHandle, x, y, w, h, true);
}


NAN_METHOD(Window::dimensions) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());
	RECT dim;
	GetWindowRect(obj->windowHandle, &dim);

	v8::Local<v8::Object> result = Nan::New<v8::Object>();
	Nan::Set(result, Nan::New("left").ToLocalChecked(), Nan::New(dim.left));
	Nan::Set(result, Nan::New("top").ToLocalChecked(), Nan::New(dim.top));
	Nan::Set(result, Nan::New("right").ToLocalChecked(), Nan::New(dim.right));
	Nan::Set(result, Nan::New("bottom").ToLocalChecked(), Nan::New(dim.bottom));
	info.GetReturnValue().Set(result);
}

NAN_METHOD(Window::createWindow) {
    HINSTANCE hInstance = GetModuleHandle( NULL );
    HWND hWnd = CreateWindowEx(
                   WS_EX_TOOLWINDOW, TEXT("STATIC"), TEXT(""),
                   WS_CLIPCHILDREN | WS_POPUP | WS_VISIBLE ,
                   0, 0, 0, 0,
                   NULL, NULL, hInstance, NULL
               );
	info.GetReturnValue().Set(Nan::New((int)hWnd));
 }


NAN_METHOD(Window::destroyWindow) {
	Window* obj = Nan::ObjectWrap::Unwrap<Window>(info.This());
	DestroyWindow(obj->windowHandle);
	PostQuitMessage(0);
 }