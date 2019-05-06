// Copyright (c) 2015 GitHub, Inc.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

#ifndef ATOM_BROWSER_NET_JS_ASKER2_H_
#define ATOM_BROWSER_NET_JS_ASKER2_H_


#include <memory>
#include <utility>

#include "atom/common/native_mate_converters/net_converter.h"
#include "base/callback.h"
#include "base/memory/ref_counted.h"
#include "base/memory/weak_ptr.h"
#include "base/values.h"
#include "content/public/browser/browser_thread.h"
#include "net/base/net_errors.h"
#include "net/http/http_response_headers.h"
#include "net/http/http_status_code.h"
#include "net/url_request/url_request_context_getter.h"
#include "net/url_request/url_request_job.h"
#include "v8/include/v8.h"


namespace atom {

using JavaScriptHandler =
    base::Callback<void(const base::DictionaryValue&, v8::Local<v8::Value>)>;

namespace internal {

using BeforeStartCallback =
    base::Callback<void(v8::Isolate*, v8::Local<v8::Value>)>;
using ResponseCallback =
    base::Callback<void(bool, std::unique_ptr<base::Value> options)>;

// Ask handler for options in UI thread.
void AskForOptions(v8::Isolate* isolate,
                   const JavaScriptHandler& handler,
                   std::unique_ptr<base::DictionaryValue> request_details,
                   const BeforeStartCallback& before_start,
                   const ResponseCallback& callback);

// Test whether the |options| means an error.
bool IsErrorOptions(base::Value* value, int* error);

}  // namespace internal

template <typename RequestJob>
class JsAsker2 : public RequestJob {
 public:
  JsAsker2(net::URLRequest* request, net::NetworkDelegate* network_delegate)
      : RequestJob(request, network_delegate), weak_factory_(this) {}

  // Called by |CustomProtocolHandler| to store handler related information.
  void SetHandlerInfo(v8::Isolate* isolate,
                      net::URLRequestContextGetter* request_context_getter,
                      const JavaScriptHandler& handler) {
    isolate_ = isolate;
    request_context_getter_ = request_context_getter;
    handler_ = handler;
  }

  // Subclass should do initailze work here.
  virtual void BeforeStartInUI(v8::Isolate*, v8::Local<v8::Value>) {}
  virtual void StartAsync(std::unique_ptr<base::Value> options) = 0;

  net::URLRequestContextGetter* request_context_getter() const {
    return request_context_getter_;
  }

 private:
  // RequestJob:
  void Start() override {
    auto request_details = std::make_unique<base::DictionaryValue>();
    request_start_time_ = base::TimeTicks::Now();
    FillRequestDetails(request_details.get(), RequestJob::request());
    content::BrowserThread::PostTask(
        content::BrowserThread::UI, FROM_HERE,
        base::BindOnce(
            &internal::AskForOptions, isolate_, handler_,
            std::move(request_details),
            base::Bind(&JsAsker2::BeforeStartInUI, weak_factory_.GetWeakPtr()),
            base::Bind(&JsAsker2::OnResponse, weak_factory_.GetWeakPtr())));
  }

  int GetResponseCode() const override { return net::HTTP_OK; }

  // NOTE: We have to implement this method or risk a crash in blink for
  // redirects!
  void GetLoadTimingInfo(net::LoadTimingInfo* load_timing_info) const override {
    load_timing_info->send_start = request_start_time_;
    load_timing_info->send_end = request_start_time_;
    load_timing_info->request_start = request_start_time_;
    load_timing_info->receive_headers_end = response_start_time_;
  }

  void GetResponseInfo(net::HttpResponseInfo* info) override {
    info->headers = new net::HttpResponseHeaders("");
  }

  // Called when the JS handler has sent the response, we need to decide whether
  // to start, or fail the job.
  void OnResponse(bool success, std::unique_ptr<base::Value> value) {
    response_start_time_ = base::TimeTicks::Now();
    int error = net::ERR_NOT_IMPLEMENTED;
    if (success && value && !internal::IsErrorOptions(value.get(), &error)) {
      StartAsync(std::move(value));
    } else {
      RequestJob::NotifyStartError(
          net::URLRequestStatus(net::URLRequestStatus::FAILED, error));
    }
  }

  v8::Isolate* isolate_;
  net::URLRequestContextGetter* request_context_getter_;
  JavaScriptHandler handler_;
  base::TimeTicks request_start_time_;
  base::TimeTicks response_start_time_;

  base::WeakPtrFactory<JsAsker2> weak_factory_;

  DISALLOW_COPY_AND_ASSIGN(JsAsker2);
};

}  // namespace atom


#endif  // ATOM_BROWSER_NET_JS_ASKER2_H_
