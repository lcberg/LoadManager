function loadmanager() {
    // Setting section
    var _settings = {
        logging : {
            logPrefix: '[LoadManager]',
            logNewLoader: true,
            logOnLoadChange: true,
            logOnFinish: true
        }
    }

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
            endTime: null
        }
    }

    


    function _log(text) {
        console.log('%c' + text, 'background: #222; color: #bada55');
    }


    var publicInterface = {
        add(name, descBeforeLoading, descLoading, descFinished, descError) {
            console.log('test');
        }
    }
    return publicInterface;
}

exports.makeLoadManager = loadmanager;