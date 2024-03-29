/** Inject and execute a single async function or promise in a tab, resolving with the result.
 * @author Keith Henry <keith.henry@evolutionjobs.co.uk>
 * @license MIT */
(function () {
  'use strict';

  /** Wrap the async function in an await and a runtime.sendMessage with the result
   * @param {function|string|object} action The async function to inject into the page.
   * @param {string} id Single use random ID.
   * @param {any[]} params Array of additional parameters to pass.
   * @returns {object} Execution details to pass to chrome.tabs.executeScript */
  function setupDetails(action, id) {
    // Wrap the async function in an await and a runtime.sendMessage with the result
    // This should always call runtime.sendMessage, even if an error is thrown
    const wrapAsyncSendMessage = action =>
      `(async function () {
    const getFrameIndex = () =>{
      if (window.top === window.self)
        return 0;
      for (var i=0; i<window.top.frames.length; i++) {
        if (window.top.frames[i] === window.self) {
          return i+1;
        }
      }
      return -1;
    }
    const result = { asyncFuncID: '${id}',frame: getFrameIndex() };
    try {
        result.content = await ${action};
    }
    catch(x) {
        // Make an explicit copy of the Error properties
        result.error = { 
            message: x.message, 
            arguments: x.arguments, 
            type: x.type, 
            name: x.name, 
            stack: x.stack 
        };
    }
    finally {
        // Always call sendMessage, as without it this might loop forever
        chrome.runtime.sendMessage(result);
    }
})()`;

    // Apply this wrapper to the code passed
    let execArgs = {};
    if (typeof action === 'function' || typeof action === 'string')
    // Passed a function or string, wrap it directly
      execArgs.code = wrapAsyncSendMessage(action);
    else if (action.code) {
      // Passed details object https://developer.chrome.com/extensions/tabs#method-executeScript
      execArgs = action;
      execArgs.code = wrapAsyncSendMessage(action.code);
    }
    else if (action.file)
      throw new Error(`Cannot execute ${action.file}. File based execute scripts are not supported.`);
    else
      throw new Error(`Cannot execute ${JSON.stringify(action)}, it must be a function, string, or have a code property.`);

    return execArgs;
  }

  /** Create a promise that resolves when chrome.runtime.onMessage fires with the id
   * @param {string} id ID for the message we're expecting.
   * Messages without the ID will not resolve this promise.
   * @returns {Promise} Promise that resolves when chrome.runtime.onMessage.addListener fires. */
  function promisifyRuntimeMessage(id,arr) {
    const results = []
    return new Promise(resolve => {
      const listener = async request => {
        // Check that the message sent is intended for this listener
        if (request && request.asyncFuncID === id) {
          if(arr.length == 0){
            await new Promise(r=>setTimeout(r,1))
            listener(request)
            return
          }
          results.push(request)
          if(results.length == arr.length){
            chrome.runtime.onMessage.removeListener(listener);
            results.sort((a,b) => a.frame - b.frame)
            resolve(results);
          }
        }
        // Return false as we don't want to keep this channel open https://developer.chrome.com/extensions/runtime#event-onMessage
        return false;
      };
      chrome.runtime.onMessage.addListener(listener);
    });
  }

  /** Execute an async function and return the result.
   * @param {number} tab Optional ID of the tab in which to run the script; defaults to the active tab of the current window.
   * @param {function|string|object} action The async function to inject into the page.
   * This must be marked as async or return a Promise.
   * This can be the details object expected by [executeScript]{@link https://developer.chrome.com/extensions/tabs#method-executeScript},
   * in which case the code property MUST be populated with a promise-returning function.
   * @param {any[]} params Parameters to serialise and pass to the action (using JSON.stringify)
   * @returns {Promise} Resolves when the injected async script has finished executing and holds the result of the script.
   * Rejects if an error is encountered setting up the function, if an error is thrown by the executing script, or if it times out. */
  chrome.tabs.executeAsyncFunction = async function (tab, action) {

    // Generate a random 4-char key to avoid clashes if called multiple times
    const id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);

    // Write the script and serialise the params
    const details = setupDetails(action, id);

    const arr = []
    // Add a listener so that we know when the async script finishes
    const message = promisifyRuntimeMessage(id,arr);

    // This will return a serialised promise, which will be broken (http://stackoverflow.com/questions/43144485)
    const sizeArr = await new Promise(r=>chrome.tabs.executeScript(tab, details,r));
    sizeArr.forEach(x=>arr.push(x))

    // Wait until we have the result message
    const results = await message;
    const contents = []

    for(let result of results){
      const { content, error } = result
      if (error){
        throw new Error(`Error thrown in execution script: ${error.message}.\nStack: ${error.stack}`)
      }
      contents.push(content)
    }
    return contents;
  }
})();