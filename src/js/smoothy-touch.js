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
            var content = _elem.innerHTML;

            _elem.innerHTML = '<div class="wrapper" style="width:'+ allParams.width +'">' + content + '</div><div class="backflip" onclick="sideBar.toggleSidebar()"></div>';

            _elem.changeTransform = function(coords, isEnd) {
                coords.posX = coords.posX || 0;
                coords.posY = coords.posY || 0;
                coords.posZ = coords.posZ || 0;
                var newVal = 'translate3d(' + coords.posX + ',' + coords.posY + ',' + coords.posZ + ')';

                if(isEnd) {
                    this.children[0].style.transition = 'transform 0.2s';
                } else {
                    this.children[0].style.transition = 'none';
                }
                return this.children[0].style.webkitTransform = newVal;
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
                    this.children[1].style.transition = 'opacity 0.2s';
                    if(val === 0) {
                        var self = this;
                        timeout = setTimeout(function () {
                            self.children[1].style.visibility = 'hidden';
                        }, 200);
                    }
                } else {
                    this.children[1].style.transition = 'none';
                }
                return this.children[1].style.opacity = val;
            };

            _elem._getCurrentPosition = function() {
                var coords = this.children[0].style.transform.match(/-?\d(?!d)[\.\d]*/g);
                coords = coords || [];

                return {
                    x: parseFloat(coords[0]),
                    y: parseFloat(coords[1]),
                    z: parseFloat(coords[2])
                }
            };

            function _getMeasure() {
                if(~allParams.width.indexOf('%')) {
                    return screen.width * customWidth / 100;
                }
                else if(~allParams.width.indexOf('px')) {
                    return customWidth;
                }
            }

            //TODO: optimize for old browsers
            doc.addEventListener('touchstart', touchstart);
            doc.addEventListener('touchmove', touchmove);
            doc.addEventListener('touchend', touchend);
            doc.addEventListener('touchcancel', touchend);

            var startTouch = null,
                curPos = -100,
                newPos = 0,
                inc = 0,
                touchId = null,
                customWidth = parseInt(allParams.width, 10),
                measure = 0,
                isStarted = false;

            function touchstart(evt) {
                curPos = _elem._getCurrentPosition().x;
                if(isNaN(curPos)) curPos = -100;
                if(evt.touches.length !== 1 || touchId !== null) {
                    return;
                }
                if(evt.touches[0].clientX > 15 && curPos === -100) {
                    return;
                }
                isStarted = true;

                touchId = evt.touches[0].identifier;
                startTouch = evt.touches[0].clientX;
                measure = _getMeasure();
                newPos = curPos;
            }

            function touchmove(evt) {
                var nmbOfTouches = evt.changedTouches.length;
                for(var i = 0; i < nmbOfTouches; i++) {
                    if(evt.changedTouches[i].identifier !== touchId) {
                        return;
                    }
                    var diff = evt.changedTouches[i].clientX - startTouch;

                    inc = diff * 100 / measure;
                    newPos = inc + curPos;
                    if(newPos > 0 || newPos < -100) {
                        return;
                    }

                    _elem.changeTransform({posX: newPos + '%'});
                    _elem.changeOpacity(Math.abs(-100 - newPos) * allParams.maxOpacity / 100);
                }
            }
            function touchend() {
                if(!isStarted) {
                    return;
                }
                touchId = null;
                if(newPos > -50) {
                    newPos = 0;
                } else {
                    newPos = -100
                }
                _elem.changeTransform({posX: newPos + '%'}, true);
                _elem.changeOpacity(Math.abs(-100 - newPos) * allParams.maxOpacity / 100, true);
                curPos = newPos;
                isStarted = false;
            }

            function toggleSidebar() {
                var posX = _elem._getCurrentPosition().x,
                    pos;

                if(posX === 0) {
                    pos = -100;
                } else {
                    pos = 0;
                }
                _elem.changeTransform({posX: pos + '%'}, true);
                _elem.changeOpacity(Math.abs(-100 - pos) * allParams.maxOpacity / 100, true);
            }

            return {
                toggleSidebar: toggleSidebar
                //TODO: remove sidebar
            };
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
    console.log('SmoothyTouch variable already exist');
    window.smoothyTouch = {};
}