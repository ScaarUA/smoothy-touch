if (!window.smoothyTouch) {
    window.smoothyTouch = (function () {
        var doc = window.document;
        var _elem;

        function _injectCustomParams(dest, inp) {
            for(var key in dest) {
                if(dest.hasOwnProperty(key)) {
                    if(inp[key]) {
                        dest[key] = inp[key];
                    }
                }
            }
        }

        function _toSize(size) {
            if(/(px)|%$/.test(size)) {
                return size;
            }
            size = parseFloat(size);
            if(!size) {
                return false;
            }
            return size + '%';
        }

        function sidebar(customParams) {
            var allParams = {
                side: 'left',
                width: '90%'
            };

            if(customParams.size) {
                _toSize(customParams);
            }

            _injectCustomParams(allParams, customParams);

            doc.addEventListener('ontouchstart', touchstart);

            function touchstart(evt) {

            }
        }

        function getElement(elem) {
            if(typeof elem === 'string') {
                _elem = document.querySelector(elem);
            } else {
                _elem = elem;
            }

            return {
                sidebar: sidebar
            };
        }

        return getElement;
    })();
} else {
    console.log('SmoothyTouch already exist');
    window.smoothyTouch = {};
}