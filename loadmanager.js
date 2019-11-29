function loadmanager() {
    // Setting section
    var _settings = {
        logging : {
            logPrefix: '[LoadManager]',
            logNewLoader: true,
            logLoadStart: true,
            logLoadFinish: true,
            logLoadError: true,
            logLoadFinishTime: true,
            logLoadErrorTime: true,
            logLoadFinishInitTime: true,
            logLoadErrorInitTime: true
        }
    }

    const _initTime = new Date();

    // LoadManager fields
    let _loaders = [];


    // create a new loader with all fields supplied
    function _makeLoader(name, descBeforeLoading, descLoading, descFinished, descError) {
        return {
            name: name,
            loading: false,
            error: false,
            descBeforeLoading: descBeforeLoading,
            descLoading: descLoading,
            descFinished: descFinished,
            descError: descError,
            startTime: null,
            endTime: null,
            tries: 0
        }
    }

    function _addLoader(loader) {
        if(_loaders.find(l => l.name == loader.name)) throw new NameAlreadyExistsException(loader.name);
        _loaders.push(loader);
        if(_settings.logging.logNewLoader) _log('The loader ' + loader.name + ' was added.');
        const i = _search(loader.name);
        if(i < 0) throw new NameNotFoundException(loader.name);
        return _loaders[i];
    }

    // Starts a loader
    // Sets time fields and resets error
    function _startLoader(name, descLoading) {
        const i = _search(name);
        if(i < 0) throw new NameNotFoundException(name);
        let loader = Object.assign({}, _loaders[i]);
        if(descLoading != undefined) loader.descLoading = descLoading;
        loader.loading = true;
        loader.error = false;
        _loaders.startTime = new Date();
        _loaders.splice(i, 1, loader);
        if(_settings.logging.logLoadStart) _log('The loader ' + name + ' started.'); 
        return _loaders[i];
    }

    // Finishes a loader
    // Resets error and sets new end timestamp
    function _finish(name, descFinished) {
        const i = _search(name);
        if(i < 0) throw new NameNotFoundException(name);
        let loader = Object.assign({}, _loaders[i]);
        if(descFinished != undefined) loader.descFinished = descFinished;
        loader.loading = false;
        loader.error = false;
        loader.endTime = new Date();
        _loaders.splice(i, 1, loader);
    
        if(_settings.logging.logLoadFinish) _log('The loader ' + name + ' finished.');
        if(_settings.logging.logLoadFinishTime) publicInterface.printLoadingTime(name);
        if(_settings.logging.logLoadFinishInitTime) publicInterface.printTimeSinceInit(name);
        return _loaders[i];
    }

    function _finishWithError(name, descError) {
        const i = _search(name);
        if(i < 0) throw new NameNotFoundException(name);
        if(descError != undefined) _loaders[i].descError = descError;
        _loaders[i].loading = false;
        _loaders[i].error = true;
        _loaders[i].endTime = new Date();
        if(_settings.logging.logLoadError) _log('The loader ' + name + ' encountered an error.');
        if(_settings.logging.logLoadErrorTime) publicInterface.printLoadingTime(name);
        if(_settings.logging.logLoadErrorInitTime) publicInterface.printTimeSinceInit(name);
        return _loaders[i];
    }

    // Calculates the time the loader spent loading (even if still loading)
    // Returns -1 if the loader hasnt started loading yet
    function _calcLoadingTime(name) {
        const i = _search(name);
        if(i < 0) throw NameNotFoundException(name);
        let time = -1;
        if(_loaders[i].loading) {
            const now = new Date();
            time = now - _loaders[i].startTime;
        } else if(!_loaders[i].loading && _loaders[i].endTime) {
            time = _loaders[i].endTime - _loaders[i].startTime;
        }
        return time;
    }

    // Calculates the time the loader existed until loading finished (even if still loading)
    function _calcInitTime(name) {
        const i = _search(name);
        if(i < 0) throw new NameNotFoundException(name);
        let time = -1;
        if(_loaders[i].loading) {
            const now = new Date();
            time = now - _initTime;
        } else {
            time = _loaders[i].endTime - _initTime;
        }
        return time;
    }

    function _search(name) {
        return _loaders.findIndex(l => l.name == name);
    }


    function _log(text) {
        console.log('%c' + _settings.logging.logPrefix + ' ' + text, 'background: #222; color: #bada55');
    }

    // Exceptions
    function NameAlreadyExistsException(name) {
        this.message = 'The name ' + name + ' already exists in this instance, please choose another identifier.';
    }
    NameAlreadyExistsException.prototype = Object.create(Error.prototype);
    NameAlreadyExistsException.prototype.name = 'NameAlreadyExistsException';
    NameAlreadyExistsException.prototype.constructor = NameAlreadyExistsException;

    function NameNotFoundException(name) {
        this.message = 'The name ' + name + ' was not found in the existing loaders.';
    }
    NameNotFoundException.prototype = Object.create(Error.prototype);
    NameNotFoundException.prototype.name = 'NameNotFoundException';
    NameNotFoundException.prototype.constructor = NameNotFoundException;

    var publicInterface = {
        add(name, descBeforeLoading, descLoading, descFinished, descError) {
           _addLoader(_makeLoader(name, descBeforeLoading, descLoading, descFinished, descError));
        },
        addSimple(name, descLoading) {
            _addLoader(_makeLoader(name, undefined, descLoading));
        },
        addAndStart(name, descLoading, descFinished, descError) {
            _addLoader(_makeLoader(name, undefined, descLoading, descFinished, descError));
            _startLoader(name);
        },
        start(name, descLoading) {
            _startLoader(name, descLoading);
        },
        finish(name, descFinished) {
            _finish(name, descFinished);
        },
        error(name, descError) {
            _finishWithError(name, descError);
        },
        getLoadingTime(name) {
            return _calcLoadingTime(name);
        },
        getTimeSinceInit(name) {
            return _calcInitTime(name);
        },
        printLoadingTime(name) {
            const i = _search(name);
            if(i < 0) {
                _log('The loader ' + name + ' was not found!');
                return;
            }
            const time = _calcLoadingTime(name);
            if(time < 0) {
                _log('The loader ' + name + ' has not started loading yet.');
            } else if(_loaders[i].loading) {
                _log('The loader ' + name + ' has already spent' + time + 'ms loading and is still loading.');  
            } else {
                _log('The loader ' + name + ' spent ' + time + 'ms loading.');
            }
            return time;
        },
        printTimeSinceInit(name) {
            const i = _search(name);
            if(i < 0) {
                _log('The loader ' + name + ' was not found!');
                return;
            }
            const time = _calcInitTime(name);
            if(_loaders[i].loading) {
                _log('The loader ' + name + ' has spent ' + time + 'ms loading since init and is still loading.');
            } else {
                _log('The loader ' + name + ' spent ' + time + 'ms since init until loading finished.');
            }
            return time;
        },
        getAllLoaders() {
            return _loaders;
        },
        getAllLoadingLoaders() {
            return [..._loaders.filter(l => l.loading)];
        }
    }
    return publicInterface;
}

exports.makeLoadManager = loadmanager;