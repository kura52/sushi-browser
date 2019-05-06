'use strict'

const path = require('path')
const Module = require('module')

// Clear Node's global search paths.
Module.globalPaths.length = 0

// Clear current and parent(init.js)'s search paths.
module.paths = []
module.parent.paths = []

// Prevent Node from adding paths outside this app to search paths.
const resourcesPathWithTrailingSlash = process.resourcesPath + path.sep
const originalNodeModulePaths = Module._nodeModulePaths
Module._nodeModulePaths = function (from) {
  const paths = originalNodeModulePaths(from)
  const fromPath = path.resolve(from) + path.sep
  // If "from" is outside the app then we do nothing.
  if (fromPath.startsWith(resourcesPathWithTrailingSlash)) {
    return paths.filter(function (candidate) {
      return candidate.startsWith(resourcesPathWithTrailingSlash)
    })
  } else {
    return paths
  }
}

const BASE_INTERNAL_PATH = path.resolve(__dirname, '..')
const INTERNAL_MODULE_PREFIX = '@electron/internal/'

// Patch Module._resolveFilename to always require the Electron API when
// require('electron') is done.
const electronPath = path.join(__dirname, '..', process.type, 'api', 'exports', 'electron.js')
const originalResolveFilename = Module._resolveFilename
Module._resolveFilename = function (request, parent, isMain) {
  if (request === 'electron') {
    return electronPath
  } else if (request.startsWith(INTERNAL_MODULE_PREFIX) && request.length > INTERNAL_MODULE_PREFIX.length) {
    const slicedRequest = request.slice(INTERNAL_MODULE_PREFIX.length)
    return path.resolve(BASE_INTERNAL_PATH, `${slicedRequest}${slicedRequest.endsWith('.js') ? '' : '.js'}`)
  } else {
    return originalResolveFilename(request, parent, isMain)
  }
}
