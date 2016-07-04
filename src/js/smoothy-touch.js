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
                width: '90%',
                maxOpacity: 0.5
            },
                timeout;

            if(customParams.width) {
                customParams.width = _toSize(customParams.width);
            }

            _injectCustomParams(allParams, customParams);

            _elem.changeTransform = function(coords, isEnd) {
                coords.posX = coords.posX || 0;
                coords.posY = coords.posY || 0;
                coords.posZ = coords.posZ || 0;
                var newVal = 'translate3d(' + coords.posX + ',' + coords.posY + ',' + coords.posZ + ')';

                if(isEnd) {
                    this.children[0].style.transition = 'transform 0.3s';
                } else {
                    this.children[0].style.transition = 'none';
                }
                return this.children[0].style.transform = newVal;
            };

            _elem.changeOpacity = function (val, isEnd) {
                if(val !== 0)  {
                    this.children[1].style.visibility = 'visible';
                    if(timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                }
                if(isEnd) {
                    this.children[1].style.transition = 'opacity 0.3s';
                    if(val === 0) {
                        var self = this;
                        timeout = setTimeout(function () {
                            self.children[1].style.visibility = 'hidden';
                        }, 300);
                    }
                } else {
                    this.children[1].style.transition = 'none';
                }
                return this.children[1].style.opacity = val;
            };

            doc.addEventListener('touchstart', touchstart);
            doc.addEventListener('touchmove', touchmove);

            var startTouch = null,
                startPos = 0,
                curPos = 0,
                curTouch = null,
                touchId = null;

            function touchstart(evt) {
                if(evt.touches.length !== 1 || touchId !== null) {
                    return;
                }
                if(evt.touches[0].clientX > 10) {
                    return;
                }

                touchId = evt.touches[0].identifier;
                startTouch = evt.touches[0].clientX;
            }

            function touchmove(evt) {
                var nmbOfTouches = evt.changedTouches.length;
                for(var i = 0; i < nmbOfTouches; i++) {
                    if(evt.changedTouches[i].identifier !== touchId) {
                        return;
                    }
                    var diff = evt.changedTouches[i].clientX - startTouch;
                    if(allParams.width.indexOf('%')) {
                        curPos = diff * 100 / (screen.width * parseInt(allParams.width, 10) / 100);
                    }
                    if(~allParams.width.indexOf('px')) {
                        curPos = diff * 100 / parseInt(allParams.width, 10);
                    }
                    console.log(curPos);
                    curPos = curPos - startPos - 100;
                    _elem.changeTransform({posX: curPos + '%'});
                    _elem.changeOpacity(curTouch * allParams.maxOpacity / 100);
                }
            }
        }

        function getElement(elem) {
            if(typeof elem === 'string') {
                _elem = document.querySelector(elem);
            } else {
                _elem = elem;
            }

            var content = _elem.innerHTML;

            _elem.innerHTML = '<div class="wrapper">' + content + '</div><div class="backflip"></div>';

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