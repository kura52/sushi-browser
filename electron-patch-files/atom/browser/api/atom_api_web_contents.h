// Copyright (c) 2014 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_BROWSER_API_ATOM_API_WEB_CONTENTS_H_
#define ATOM_BROWSER_API_ATOM_API_WEB_CONTENTS_H_

#include <memory>
#include <string>
#include <vector>

#include "atom/browser/api/frame_subscriber.h"
#include "atom/browser/api/save_page_handler.h"
#include "atom/browser/api/trackable_object.h"
#include "atom/browser/common_web_contents_delegate.h"
#include "atom/browser/ui/autofill_popup.h"
#include "base/observer_list.h"
#include "content/common/cursors/webcursor.h"
#include "content/public/browser/keyboard_event_processing_result.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_observer.h"
#include "content/public/common/favicon_url.h"
#include "electron/buildflags/buildflags.h"
#include "native_mate/handle.h"
#include "printing/backend/print_backend.h"
#include "ui/gfx/image/image.h"

namespace blink {
struct WebDeviceEmulationParams;
}

namespace mate {
class Arguments;
class Dictionary;
}  // namespace mate

namespace network {
class ResourceRequestBody;
}

namespace atom {

class AtomBrowserContext;
class AtomJavaScriptDialogManager;
class InspectableWebContents;
class WebContentsZoomController;
class WebViewGuestDelegate;
class FrameSubscriber;

#if BUILDFLAG(ENABLE_OSR)
class OffScreenWebContentsView;
#endif

namespace api {

// Certain events are only in WebContentsDelegate, provide our own Observer to
// dispatch those events.
class ExtendedWebContentsObserver {
 public:
  virtual void OnCloseContents() {}
  virtual void OnRendererResponsive() {}
};

// Wrapper around the content::WebContents.
class WebContents : public mate::TrackableObject<WebContents>,
                    public CommonWebContentsDelegate,
                    public content::WebContentsObserver {
 public:
  enum Type {
    BACKGROUND_PAGE,  // A DevTools extension background page.
    BROWSER_WINDOW,   // Used by BrowserWindow.
    BROWSER_VIEW,     // Used by BrowserView.
    REMOTE,           // Thin wrap around an existing WebContents.
    WEB_VIEW,         // Used by <webview>.
    OFF_SCREEN,       // Used for offscreen rendering
  };

  // For node.js callback function type: function(error, buffer)
  using PrintToPDFCallback =
      base::Callback<void(v8::Local<v8::Value>, v8::Local<v8::Value>)>;

  // Create a new WebContents and return the V8 wrapper of it.
  static mate::Handle<WebContents> Create(v8::Isolate* isolate,
                                          const mate::Dictionary& options);

  // Create a new V8 wrapper for an existing |web_content|.
  //
  // The lifetime of |web_contents| will be managed by this class.
  static mate::Handle<WebContents> CreateAndTake(
      v8::Isolate* isolate,
      std::unique_ptr<content::WebContents> web_contents,
      Type type);

  // Get the V8 wrapper of |web_content|, return empty handle if not wrapped.
  static mate::Handle<WebContents> From(v8::Isolate* isolate,
                                        content::WebContents* web_content);

  // Get the V8 wrapper of the |web_contents|, or create one if not existed.
  //
  // The lifetime of |web_contents| is NOT managed by this class, and the type
  // of this wrapper is always REMOTE.
  static mate::Handle<WebContents> FromOrCreate(
      v8::Isolate* isolate,
      content::WebContents* web_contents);

  static void BuildPrototype(v8::Isolate* isolate,
                             v8::Local<v8::FunctionTemplate> prototype);

  // Notifies to destroy any guest web contents before destroying self.
  void DestroyWebContents(bool async);

  void SetBackgroundThrottling(bool allowed);
  int GetProcessID() const;
  base::ProcessId GetOSProcessID() const;
  Type GetType() const;
  bool Equal(const WebContents* web_contents) const;
  void LoadURL(const GURL& url, const mate::Dictionary& options);
  void DownloadURL(const GURL& url);
  GURL GetURL() const;
  base::string16 GetTitle() const;
  bool IsLoading() const;
  bool IsLoadingMainFrame() const;
  bool IsWaitingForResponse() const;
  void Stop();
  void Reload();
  void ReloadIgnoringCache();
  bool CanGoBack();
  bool CanGoForward();
  void GoBack();
  void GoForward();
  int GetEntryCount();
  const GURL& GetURLAtIndex(int index) const;
  const base::string16 GetTitleAtIndex(int index) const;
  int GetCurrentEntryIndex();
  int GetPendingEntryIndex();
  bool CanGoToOffset(int offset);
  void GoToOffset(int offset);
  void GoToIndex(int index);
  const std::string GetWebRTCIPHandlingPolicy() const;
  void SetWebRTCIPHandlingPolicy(const std::string& webrtc_ip_handling_policy);
  bool IsCrashed() const;
  void SetUserAgent(const std::string& user_agent, mate::Arguments* args);
  std::string GetUserAgent();
  void InsertCSS(const std::string& css);
  bool SavePage(const base::FilePath& full_file_path,
                const content::SavePageType& save_type,
                const SavePageHandler::SavePageCallback& callback);
  void OpenDevTools(mate::Arguments* args);
  void CloseDevTools();
  bool IsDevToolsOpened();
  bool IsDevToolsFocused();
  void ToggleDevTools();
  void EnableDeviceEmulation(const blink::WebDeviceEmulationParams& params);
  void DisableDeviceEmulation();
  void InspectElement(int x, int y);
  void InspectServiceWorker();
  void HasServiceWorker(const base::Callback<void(bool)>&);
  void UnregisterServiceWorker(const base::Callback<void(bool)>&);
  void SetIgnoreMenuShortcuts(bool ignore);
  void SetAudioMuted(bool muted);
  bool IsAudioMuted();
  bool IsCurrentlyAudible();
  void Print(mate::Arguments* args);
  std::vector<printing::PrinterBasicInfo> GetPrinterList();
  void SetEmbedder(const WebContents* embedder);
  void SetDevToolsWebContents(const WebContents* devtools);
  v8::Local<v8::Value> GetNativeView() const;

  // Print current page as PDF.
  void PrintToPDF(const base::DictionaryValue& setting,
                  const PrintToPDFCallback& callback);

  // DevTools workspace api.
  void AddWorkSpace(mate::Arguments* args, const base::FilePath& path);
  void RemoveWorkSpace(mate::Arguments* args, const base::FilePath& path);

  // Editing commands.
  void Undo();
  void Redo();
  void Cut();
  void Copy();
  void Paste();
  void PasteAndMatchStyle();
  void Delete();
  void SelectAll();
  void Unselect();
  void Replace(const base::string16& word);
  void ReplaceMisspelling(const base::string16& word);
  uint32_t FindInPage(mate::Arguments* args);
  void StopFindInPage(content::StopFindAction action);
  void ShowDefinitionForSelection();
  void CopyImageAt(int x, int y);

  // Focus.
  void Focus();
  bool IsFocused() const;
  void TabTraverse(bool reverse);

  // Send messages to browser.
  bool SendIPCMessage(bool internal,
                      bool send_to_all,
                      const std::string& channel,
                      const base::ListValue& args);

  bool SendIPCMessageWithSender(bool internal,
                                bool send_to_all,
                                const std::string& channel,
                                const base::ListValue& args,
                                int32_t sender_id = 0);

  // Send WebInputEvent to the page.
  void SendInputEvent(v8::Isolate* isolate, v8::Local<v8::Value> input_event);

  // Subscribe to the frame updates.
  void BeginFrameSubscription(mate::Arguments* args);
  void EndFrameSubscription();

  // Dragging native items.
  void StartDrag(const mate::Dictionary& item, mate::Arguments* args);

  // Captures the page with |rect|, |callback| would be called when capturing is
  // done.
  void CapturePage(mate::Arguments* args);

  // Methods for creating <webview>.
  bool IsGuest() const;
  void AttachToIframe(content::WebContents* embedder_web_contents,
                      int embedder_frame_id);

  // Methods for offscreen rendering
  bool IsOffScreen() const;
#if BUILDFLAG(ENABLE_OSR)
  void OnPaint(const gfx::Rect& dirty_rect, const SkBitmap& bitmap);
  void StartPainting();
  void StopPainting();
  bool IsPainting() const;
  void SetFrameRate(int frame_rate);
  int GetFrameRate() const;
#endif
  void Invalidate();
  gfx::Size GetSizeForNewRenderView(content::WebContents*) const override;

  // Methods for zoom handling.
  void SetZoomLevel(double level);
  double GetZoomLevel() const;
  void SetZoomFactor(double factor);
  double GetZoomFactor() const;

  // Callback triggered on permission response.
  void OnEnterFullscreenModeForTab(content::WebContents* source,
                                   const GURL& origin,
                                   const blink::WebFullscreenOptions& options,
                                   bool allowed);

  // Create window with the given disposition.
  void OnCreateWindow(const GURL& target_url,
                      const content::Referrer& referrer,
                      const std::string& frame_name,
                      WindowOpenDisposition disposition,
                      const std::vector<std::string>& features,
                      const scoped_refptr<network::ResourceRequestBody>& body);

  // Returns the preload script path of current WebContents.
  v8::Local<v8::Value> GetPreloadPath(v8::Isolate* isolate) const;

  // Returns the web preferences of current WebContents.
  v8::Local<v8::Value> GetWebPreferences(v8::Isolate* isolate) const;
  v8::Local<v8::Value> GetLastWebPreferences(v8::Isolate* isolate) const;

  bool IsRemoteModuleEnabled() const;

  // Returns the owner window.
  v8::Local<v8::Value> GetOwnerBrowserWindow() const;

  // Grants the child process the capability to access URLs with the origin of
  // the specified URL.
  void GrantOriginAccess(const GURL& url);

  bool TakeHeapSnapshot(const base::FilePath& file_path,
                        const std::string& channel);

  // Properties.
  int32_t ID() const;
  v8::Local<v8::Value> Session(v8::Isolate* isolate);
  content::WebContents* HostWebContents();
  v8::Local<v8::Value> DevToolsWebContents(v8::Isolate* isolate);
  v8::Local<v8::Value> Debugger(v8::Isolate* isolate);

  WebContentsZoomController* GetZoomController() { return zoom_controller_; }

  void AddObserver(ExtendedWebContentsObserver* obs) {
    observers_.AddObserver(obs);
  }
  void RemoveObserver(ExtendedWebContentsObserver* obs) {
    observers_.RemoveObserver(obs);
  }

  bool EmitNavigationEvent(const std::string& event,
                           content::NavigationHandle* navigation_handle);

 protected:
  // Does not manage lifetime of |web_contents|.
  WebContents(v8::Isolate* isolate, content::WebContents* web_contents);
  // Takes over ownership of |web_contents|.
  WebContents(v8::Isolate* isolate,
              std::unique_ptr<content::WebContents> web_contents,
              Type type);
  // Creates a new content::WebContents.
  WebContents(v8::Isolate* isolate, const mate::Dictionary& options);
  ~WebContents() override;

  void InitWithSessionAndOptions(
      v8::Isolate* isolate,
      std::unique_ptr<content::WebContents> web_contents,
      mate::Handle<class Session> session,
      const mate::Dictionary& options);

  // content::WebContentsDelegate:
  bool DidAddMessageToConsole(content::WebContents* source,
                              int32_t level,
                              const base::string16& message,
                              int32_t line_no,
                              const base::string16& source_id) override;
  void WebContentsCreated(content::WebContents* source_contents,
                          int opener_render_process_id,
                          int opener_render_frame_id,
                          const std::string& frame_name,
                          const GURL& target_url,
                          content::WebContents* new_contents) override;
  void AddNewContents(content::WebContents* source,
                      std::unique_ptr<content::WebContents> new_contents,
                      WindowOpenDisposition disposition,
                      const gfx::Rect& initial_rect,
                      bool user_gesture,
                      bool* was_blocked) override;
  content::WebContents* OpenURLFromTab(
      content::WebContents* source,
      const content::OpenURLParams& params) override;
  void BeforeUnloadFired(content::WebContents* tab,
                         bool proceed,
                         bool* proceed_to_fire_unload) override;
  void SetContentsBounds(content::WebContents* source,
                         const gfx::Rect& pos) override;
  void CloseContents(content::WebContents* source) override;
  void ActivateContents(content::WebContents* contents) override;
  void UpdateTargetURL(content::WebContents* source, const GURL& url) override;
  void HandleKeyboardEvent(
      content::WebContents* source,
      const content::NativeWebKeyboardEvent& event) override;
  content::KeyboardEventProcessingResult PreHandleKeyboardEvent(
      content::WebContents* source,
      const content::NativeWebKeyboardEvent& event) override;
  void EnterFullscreenModeForTab(
      content::WebContents* source,
      const GURL& origin,
      const blink::WebFullscreenOptions& options) override;
  void ExitFullscreenModeForTab(content::WebContents* source) override;
  void RendererUnresponsive(
      content::WebContents* source,
      content::RenderWidgetHost* render_widget_host,
      base::RepeatingClosure hang_monitor_restarter) override;
  void RendererResponsive(
      content::WebContents* source,
      content::RenderWidgetHost* render_widget_host) override;
  bool HandleContextMenu(const content::ContextMenuParams& params) override;
  bool OnGoToEntryOffset(int offset) override;
  void FindReply(content::WebContents* web_contents,
                 int request_id,
                 int number_of_matches,
                 const gfx::Rect& selection_rect,
                 int active_match_ordinal,
                 bool final_update) override;
  bool CheckMediaAccessPermission(content::RenderFrameHost* render_frame_host,
                                  const GURL& security_origin,
                                  content::MediaStreamType type) override;
  void RequestMediaAccessPermission(
      content::WebContents* web_contents,
      const content::MediaStreamRequest& request,
      content::MediaResponseCallback callback) override;
  void RequestToLockMouse(content::WebContents* web_contents,
                          bool user_gesture,
                          bool last_unlocked_by_target) override;
  std::unique_ptr<content::BluetoothChooser> RunBluetoothChooser(
      content::RenderFrameHost* frame,
      const content::BluetoothChooser::EventHandler& handler) override;
  content::JavaScriptDialogManager* GetJavaScriptDialogManager(
      content::WebContents* source) override;
  void OnAudioStateChanged(bool audible) override;

  // content::WebContentsObserver:
  void BeforeUnloadFired(const base::TimeTicks& proceed_time) override;
  void RenderViewCreated(content::RenderViewHost*) override;
  void RenderViewDeleted(content::RenderViewHost*) override;
  void RenderProcessGone(base::TerminationStatus status) override;
  void DocumentLoadedInFrame(
      content::RenderFrameHost* render_frame_host) override;
  void DidFinishLoad(content::RenderFrameHost* render_frame_host,
                     const GURL& validated_url) override;
  void DidFailLoad(content::RenderFrameHost* render_frame_host,
                   const GURL& validated_url,
                   int error_code,
                   const base::string16& error_description) override;
  void DidStartLoading() override;
  void DidStopLoading() override;
  void DidStartNavigation(
      content::NavigationHandle* navigation_handle) override;
  void DidRedirectNavigation(
      content::NavigationHandle* navigation_handle) override;
  void DidFinishNavigation(
      content::NavigationHandle* navigation_handle) override;
  bool OnMessageReceived(const IPC::Message& message) override;
  bool OnMessageReceived(const IPC::Message& message,
                         content::RenderFrameHost* frame_host) override;
  void WebContentsDestroyed() override;
  void NavigationEntryCommitted(
      const content::LoadCommittedDetails& load_details) override;
  void TitleWasSet(content::NavigationEntry* entry) override;
  void DidUpdateFaviconURL(
      const std::vector<content::FaviconURL>& urls) override;
  void PluginCrashed(const base::FilePath& plugin_path,
                     base::ProcessId plugin_pid) override;
  void MediaStartedPlaying(const MediaPlayerInfo& video_type,
                           const MediaPlayerId& id) override;
  void MediaStoppedPlaying(
      const MediaPlayerInfo& video_type,
      const MediaPlayerId& id,
      content::WebContentsObserver::MediaStoppedReason reason) override;
  void DidChangeThemeColor(SkColor theme_color) override;

  // InspectableWebContentsDelegate:
  void DevToolsReloadPage() override;

  // InspectableWebContentsViewDelegate:
  void DevToolsFocused() override;
  void DevToolsOpened() override;
  void DevToolsClosed() override;

#if defined(TOOLKIT_VIEWS)
  void ShowAutofillPopup(content::RenderFrameHost* frame_host,
                         const gfx::RectF& bounds,
                         const std::vector<base::string16>& values,
                         const std::vector<base::string16>& labels);
#endif

 private:
  struct FrameDispatchHelper;
  AtomBrowserContext* GetBrowserContext() const;

  uint32_t GetNextRequestId() { return ++request_id_; }

#if BUILDFLAG(ENABLE_OSR)
  OffScreenWebContentsView* GetOffScreenWebContentsView() const;
  OffScreenRenderWidgetHostView* GetOffScreenRenderWidgetHostView()
      const override;
#endif

  // Called when we receive a CursorChange message from chromium.
  void OnCursorChange(const content::WebCursor& cursor);

  // Called when received a message from renderer.
  void OnRendererMessage(content::RenderFrameHost* frame_host,
                         const std::string& channel,
                         const base::ListValue& args);

  // Called when received a synchronous message from renderer.
  void OnRendererMessageSync(content::RenderFrameHost* frame_host,
                             const std::string& channel,
                             const base::ListValue& args,
                             IPC::Message* message);

  // Called when received a message from renderer to be forwarded.
  void OnRendererMessageTo(content::RenderFrameHost* frame_host,
                           bool internal,
                           bool send_to_all,
                           int32_t web_contents_id,
                           const std::string& channel,
                           const base::ListValue& args);

  // Called when received a synchronous message from renderer to
  // set temporary zoom level.
  void OnSetTemporaryZoomLevel(content::RenderFrameHost* frame_host,
                               double level,
                               IPC::Message* reply_msg);

  // Called when received a synchronous message from renderer to
  // get the zoom level.
  void OnGetZoomLevel(content::RenderFrameHost* frame_host,
                      IPC::Message* reply_msg);

  void InitZoomController(content::WebContents* web_contents,
                          const mate::Dictionary& options);

  v8::Global<v8::Value> session_;
  v8::Global<v8::Value> devtools_web_contents_;
  v8::Global<v8::Value> debugger_;

  std::unique_ptr<AtomJavaScriptDialogManager> dialog_manager_;
  std::unique_ptr<WebViewGuestDelegate> guest_delegate_;

  std::unique_ptr<FrameSubscriber> frame_subscriber_;

  // The host webcontents that may contain this webcontents.
  WebContents* embedder_ = nullptr;

  // The zoom controller for this webContents.
  WebContentsZoomController* zoom_controller_ = nullptr;

  // The type of current WebContents.
  Type type_ = BROWSER_WINDOW;

  // Request id used for findInPage request.
  uint32_t request_id_ = 0;

  // Whether background throttling is disabled.
  bool background_throttling_ = true;

  // Whether to enable devtools.
  bool enable_devtools_ = true;

  // Observers of this WebContents.
  base::ObserverList<ExtendedWebContentsObserver> observers_;

  DISALLOW_COPY_AND_ASSIGN(WebContents);
};

}  // namespace api

}  // namespace atom

#endif  // ATOM_BROWSER_API_ATOM_API_WEB_CONTENTS_H_
