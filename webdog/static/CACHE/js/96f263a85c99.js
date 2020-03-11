String.prototype.format = function (args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        } else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({[" + i + "]})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
};
String.prototype.replaceAll = function (args) {
    var result = this;
    for (var key in args) {
        var reg = new RegExp(key, 'g');
        result = result.replace(reg, args[key]);
    }
    return result
};
String.prototype.safe = function () {
    var result = '',
        pattern = new RegExp("[<>@#$&!/\*\'\.\"]");
    for (var i = 0; i < this.length; i++) {
        result += this.substr(i, 1).replace(pattern, '');
    }
    return result;
};
String.prototype.gbLength = function () {
    var i = 0,
        len = this.length,
        gbLength = 0;
    for (; i < len; i++) {
        var charCode = this.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) {
            gbLength += 0.5
        } else {
            gbLength++
        }
    }
    return gbLength;
};
String.prototype.truncateChars = function (maxLength) {
    if (this.gbLength() > maxLength) {
        var i = 0,
            len = this.length,
            gbLength = 0,
            result = "";
        for (; i < len; i++) {
            if (maxLength <= 0) {
                break
            }
            var charCode = this.charCodeAt(i);
            result += this[i];
            if (charCode >= 0 && charCode <= 128) {
                maxLength -= 0.5
            } else {
                maxLength -= 1
            }
        }
        return result + '...'
    } else {
        return this.toString()
    }
};
Array.prototype.remove = function (dx) {
    if (isNaN(dx) || dx > this.length) {
        return false;
    }
    for (var i = 0, n = 0; i < this.length; i++) {
        if (this[i] != this[dx]) {
            this[n++] = this[i]
        }
    }
    this.length -= 1
};
Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};
Math.uuid = function () {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return new Date().format("yyyyMMddhhmmss") + uuid
};
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};
(function ($) {
    "use strict";
    if ($.getScripts) {
        return;
    }
    $.getScripts = function (options) {
        var _options, _sync, _async, _response;
        _options = $.extend({
            'async': false,
            'cache': true,
            'condition': false
        }, options);
        if (typeof _options.source === 'string') {
            _options.script = [_options.source];
        } else if ($.isArray(_options.source) === true) {
            _options.script = _options.source
        } else if (typeof _options.source === 'object') {
            _options.script = typeof _options.source.script === 'string' ? [_options.source.script] : _options.source.script;
            _options.css = typeof _options.source.css === 'string' ? [_options.source.css] : _options.source.css;
        }
        if (_options.condition === true) {
            _options.success();
            return
        }
        if (_options.css) {
            _options.css.forEach(function (value) {
                $('head').append('<link rel="stylesheet" href="{link}"/>'.replace('{link}', value));
            });
        }
        _response = [];
        _sync = function () {
            $.ajax({
                url: _options.script.shift(),
                dataType: 'script',
                cache: _options.cache,
                success: function () {
                    _response.push(arguments);
                    if (_options.script.length > 0) {
                        _sync();
                    } else if (typeof options.success === 'function') {
                        options.success($.merge([], _response));
                    }
                }
            });
        };
        _async = function () {
            _response.push(arguments);
            if (_response.length === _options.script.length && typeof options.success === 'function') {
                options.success($.merge([], _response));
            }
        };
        if (_options.async === true) {
            for (var i = 0; i < _options.script.length; i++) {
                $.ajax({
                    url: _options.script[i],
                    dataType: 'script',
                    cache: _options.cache,
                    success: _async
                });
            }
        } else {
            _sync();
        }
    };
}(jQuery));
$(document).ready(function () {
    var users = {},
        popover = function (element, json) {
            $(element).popover({
                trigger: "manual",
                html: true,
                animation: false,
                container: 'body',
                title: '<div class="head-popover-username">{username} <span class="badge size12 not-bold">{level}级</span></div>'.format({
                    username: json.username,
                    level: json.level
                }),
                content: function () {
                    var map;
                    if (json.map == 0) {
                        map = '无';
                    } else {
                        map = '<a target="_blank" href="/search/?user={username}">{map}</a>'.format({
                            map: json.map,
                            username: json.username
                        });
                    }
                    return '<div>站龄：{age} &nbsp;&nbsp; 地图：{map}</div><div class="text-right" style="padding-top: 10px">\
                        <a class="btn btn-success btn-xs" target="_blank" href="/account/notifications/user/?action={username}">私信</a></div>'.format({
                        username: json.username,
                        age: json.age,
                        map: map
                    });
                }
            }).popover("show");
            $(".popover").on("mouseleave", function () {
                $(element).popover('hide');
            })
        };
    $("body").on('mouseenter', '.user-head', function () {
        var _this = this,
            userId = $(this).attr('data');
        if (users[userId]) {
            popover(_this, users[userId]);
        } else {
            $.getJSON('/account/user/' + userId, function (json) {
                popover(_this, json);
                users[userId] = json;
            });
        }
    }).on("mouseleave", '.user-head', function () {
        var _this = this;
        setTimeout(function () {
            if (!$(".popover:hover").length) {
                $(_this).popover("hide");
            }
        }, 300);
    });
});
var _bdhmProtocol = (("https:" == document.location.protocol) ? " https://" : " http://");
document.write(unescape("%3Cscript src='" + _bdhmProtocol + "hm.baidu.com/h.js%3F2581959402921059b6e2cab4359112a5' type='text/javascript'%3E%3C/script%3E"));
(function () {
    'use strict';

    function rbush(maxEntries, format) {
        if (!(this instanceof rbush)) return new rbush(maxEntries, format);
        this._maxEntries = Math.max(4, maxEntries || 9);
        this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4));
        if (format) {
            this._initFormat(format);
        }
        this.clear();
    }
    rbush.prototype = {
        all: function () {
            return this._all(this.data, []);
        },
        search: function (bbox) {
            var node = this.data,
                result = [],
                toBBox = this.toBBox;
            if (!intersects(bbox, node.bbox)) return result;
            var nodesToSearch = [],
                i, len, child, childBBox;
            while (node) {
                for (i = 0, len = node.children.length; i < len; i++) {
                    child = node.children[i];
                    childBBox = node.leaf ? toBBox(child) : child.bbox;
                    if (intersects(bbox, childBBox)) {
                        if (node.leaf) result.push(child);
                        else if (contains(bbox, childBBox)) this._all(child, result);
                        else nodesToSearch.push(child);
                    }
                }
                node = nodesToSearch.pop();
            }
            return result;
        },
        load: function (data) {
            if (!(data && data.length)) return this;
            if (data.length < this._minEntries) {
                for (var i = 0, len = data.length; i < len; i++) {
                    this.insert(data[i]);
                }
                return this;
            }
            var node = this._build(data.slice(), 0, data.length - 1, 0);
            if (!this.data.children.length) {
                this.data = node;
            } else if (this.data.height === node.height) {
                this._splitRoot(this.data, node);
            } else {
                if (this.data.height < node.height) {
                    var tmpNode = this.data;
                    this.data = node;
                    node = tmpNode;
                }
                this._insert(node, this.data.height - node.height - 1, true);
            }
            return this;
        },
        insert: function (item) {
            if (item) this._insert(item, this.data.height - 1);
            return this;
        },
        clear: function () {
            this.data = {
                children: [],
                height: 1,
                bbox: empty(),
                leaf: true
            };
            return this;
        },
        remove: function (item) {
            if (!item) return this;
            var node = this.data,
                bbox = this.toBBox(item),
                path = [],
                indexes = [],
                i, parent, index, goingUp;
            while (node || path.length) {
                if (!node) {
                    node = path.pop();
                    parent = path[path.length - 1];
                    i = indexes.pop();
                    goingUp = true;
                }
                if (node.leaf) {
                    index = node.children.indexOf(item);
                    if (index !== -1) {
                        node.children.splice(index, 1);
                        path.push(node);
                        this._condense(path);
                        return this;
                    }
                }
                if (!goingUp && !node.leaf && contains(node.bbox, bbox)) {
                    path.push(node);
                    indexes.push(i);
                    i = 0;
                    parent = node;
                    node = node.children[0];
                } else if (parent) {
                    i++;
                    node = parent.children[i];
                    goingUp = false;
                } else node = null;
            }
            return this;
        },
        toBBox: function (item) {
            return item;
        },
        compareMinX: function (a, b) {
            return a[0] - b[0];
        },
        compareMinY: function (a, b) {
            return a[1] - b[1];
        },
        toJSON: function () {
            return this.data;
        },
        fromJSON: function (data) {
            this.data = data;
            return this;
        },
        _all: function (node, result) {
            var nodesToSearch = [];
            while (node) {
                if (node.leaf) result.push.apply(result, node.children);
                else nodesToSearch.push.apply(nodesToSearch, node.children);
                node = nodesToSearch.pop();
            }
            return result;
        },
        _build: function (items, left, right, height) {
            var N = right - left + 1,
                M = this._maxEntries,
                node;
            if (N <= M) {
                node = {
                    children: items.slice(left, right + 1),
                    height: 1,
                    bbox: null,
                    leaf: true
                };
                calcBBox(node, this.toBBox);
                return node;
            }
            if (!height) {
                height = Math.ceil(Math.log(N) / Math.log(M));
                M = Math.ceil(N / Math.pow(M, height - 1));
            }
            node = {
                children: [],
                height: height,
                bbox: null
            };
            var N2 = Math.ceil(N / M),
                N1 = N2 * Math.ceil(Math.sqrt(M)),
                i, j, right2, right3;
            multiSelect(items, left, right, N1, this.compareMinX);
            for (i = left; i <= right; i += N1) {
                right2 = Math.min(i + N1 - 1, right);
                multiSelect(items, i, right2, N2, this.compareMinY);
                for (j = i; j <= right2; j += N2) {
                    right3 = Math.min(j + N2 - 1, right2);
                    node.children.push(this._build(items, j, right3, height - 1));
                }
            }
            calcBBox(node, this.toBBox);
            return node;
        },
        _chooseSubtree: function (bbox, node, level, path) {
            var i, len, child, targetNode, area, enlargement, minArea, minEnlargement;
            while (true) {
                path.push(node);
                if (node.leaf || path.length - 1 === level) break;
                minArea = minEnlargement = Infinity;
                for (i = 0, len = node.children.length; i < len; i++) {
                    child = node.children[i];
                    area = bboxArea(child.bbox);
                    enlargement = enlargedArea(bbox, child.bbox) - area;
                    if (enlargement < minEnlargement) {
                        minEnlargement = enlargement;
                        minArea = area < minArea ? area : minArea;
                        targetNode = child;
                    } else if (enlargement === minEnlargement) {
                        if (area < minArea) {
                            minArea = area;
                            targetNode = child;
                        }
                    }
                }
                node = targetNode;
            }
            return node;
        },
        _insert: function (item, level, isNode) {
            var toBBox = this.toBBox,
                bbox = isNode ? item.bbox : toBBox(item),
                insertPath = [];
            var node = this._chooseSubtree(bbox, this.data, level, insertPath);
            node.children.push(item);
            extend(node.bbox, bbox);
            while (level >= 0) {
                if (insertPath[level].children.length > this._maxEntries) {
                    this._split(insertPath, level);
                    level--;
                } else break;
            }
            this._adjustParentBBoxes(bbox, insertPath, level);
        },
        _split: function (insertPath, level) {
            var node = insertPath[level],
                M = node.children.length,
                m = this._minEntries;
            this._chooseSplitAxis(node, m, M);
            var newNode = {
                children: node.children.splice(this._chooseSplitIndex(node, m, M)),
                height: node.height
            };
            if (node.leaf) newNode.leaf = true;
            calcBBox(node, this.toBBox);
            calcBBox(newNode, this.toBBox);
            if (level) insertPath[level - 1].children.push(newNode);
            else this._splitRoot(node, newNode);
        },
        _splitRoot: function (node, newNode) {
            this.data = {
                children: [node, newNode],
                height: node.height + 1
            };
            calcBBox(this.data, this.toBBox);
        },
        _chooseSplitIndex: function (node, m, M) {
            var i, bbox1, bbox2, overlap, area, minOverlap, minArea, index;
            minOverlap = minArea = Infinity;
            for (i = m; i <= M - m; i++) {
                bbox1 = distBBox(node, 0, i, this.toBBox);
                bbox2 = distBBox(node, i, M, this.toBBox);
                overlap = intersectionArea(bbox1, bbox2);
                area = bboxArea(bbox1) + bboxArea(bbox2);
                if (overlap < minOverlap) {
                    minOverlap = overlap;
                    index = i;
                    minArea = area < minArea ? area : minArea;
                } else if (overlap === minOverlap) {
                    if (area < minArea) {
                        minArea = area;
                        index = i;
                    }
                }
            }
            return index;
        },
        _chooseSplitAxis: function (node, m, M) {
            var compareMinX = node.leaf ? this.compareMinX : compareNodeMinX,
                compareMinY = node.leaf ? this.compareMinY : compareNodeMinY,
                xMargin = this._allDistMargin(node, m, M, compareMinX),
                yMargin = this._allDistMargin(node, m, M, compareMinY);
            if (xMargin < yMargin) node.children.sort(compareMinX);
        },
        _allDistMargin: function (node, m, M, compare) {
            node.children.sort(compare);
            var toBBox = this.toBBox,
                leftBBox = distBBox(node, 0, m, toBBox),
                rightBBox = distBBox(node, M - m, M, toBBox),
                margin = bboxMargin(leftBBox) + bboxMargin(rightBBox),
                i, child;
            for (i = m; i < M - m; i++) {
                child = node.children[i];
                extend(leftBBox, node.leaf ? toBBox(child) : child.bbox);
                margin += bboxMargin(leftBBox);
            }
            for (i = M - m - 1; i >= m; i--) {
                child = node.children[i];
                extend(rightBBox, node.leaf ? toBBox(child) : child.bbox);
                margin += bboxMargin(rightBBox);
            }
            return margin;
        },
        _adjustParentBBoxes: function (bbox, path, level) {
            for (var i = level; i >= 0; i--) {
                extend(path[i].bbox, bbox);
            }
        },
        _condense: function (path) {
            for (var i = path.length - 1, siblings; i >= 0; i--) {
                if (path[i].children.length === 0) {
                    if (i > 0) {
                        siblings = path[i - 1].children;
                        siblings.splice(siblings.indexOf(path[i]), 1);
                    } else this.clear();
                } else calcBBox(path[i], this.toBBox);
            }
        },
        _initFormat: function (format) {
            var compareArr = ['return a', ' - b', ';'];
            this.compareMinX = new Function('a', 'b', compareArr.join(format[0]));
            this.compareMinY = new Function('a', 'b', compareArr.join(format[1]));
            this.toBBox = new Function('a', 'return [a' + format.join(', a') + '];');
        }
    };

    function calcBBox(node, toBBox) {
        node.bbox = distBBox(node, 0, node.children.length, toBBox);
    }

    function distBBox(node, k, p, toBBox) {
        var bbox = empty();
        for (var i = k, child; i < p; i++) {
            child = node.children[i];
            extend(bbox, node.leaf ? toBBox(child) : child.bbox);
        }
        return bbox;
    }

    function empty() {
        return [Infinity, Infinity, -Infinity, -Infinity];
    }

    function extend(a, b) {
        a[0] = Math.min(a[0], b[0]);
        a[1] = Math.min(a[1], b[1]);
        a[2] = Math.max(a[2], b[2]);
        a[3] = Math.max(a[3], b[3]);
        return a;
    }

    function compareNodeMinX(a, b) {
        return a.bbox[0] - b.bbox[0];
    }

    function compareNodeMinY(a, b) {
        return a.bbox[1] - b.bbox[1];
    }

    function bboxArea(a) {
        return (a[2] - a[0]) * (a[3] - a[1]);
    }

    function bboxMargin(a) {
        return (a[2] - a[0]) + (a[3] - a[1]);
    }

    function enlargedArea(a, b) {
        return (Math.max(b[2], a[2]) - Math.min(b[0], a[0])) * (Math.max(b[3], a[3]) - Math.min(b[1], a[1]));
    }

    function intersectionArea(a, b) {
        var minX = Math.max(a[0], b[0]),
            minY = Math.max(a[1], b[1]),
            maxX = Math.min(a[2], b[2]),
            maxY = Math.min(a[3], b[3]);
        return Math.max(0, maxX - minX) * Math.max(0, maxY - minY);
    }

    function contains(a, b) {
        return a[0] <= b[0] && a[1] <= b[1] && b[2] <= a[2] && b[3] <= a[3];
    }

    function intersects(a, b) {
        return b[0] <= a[2] && b[1] <= a[3] && b[2] >= a[0] && b[3] >= a[1];
    }

    function multiSelect(arr, left, right, n, compare) {
        var stack = [left, right],
            mid;
        while (stack.length) {
            right = stack.pop();
            left = stack.pop();
            if (right - left <= n) continue;
            mid = left + Math.ceil((right - left) / n / 2) * n;
            select(arr, left, right, mid, compare);
            stack.push(left, mid, mid, right);
        }
    }

    function select(arr, left, right, k, compare) {
        var n, i, z, s, sd, newLeft, newRight, t, j;
        while (right > left) {
            if (right - left > 600) {
                n = right - left + 1;
                i = k - left + 1;
                z = Math.log(n);
                s = 0.5 * Math.exp(2 * z / 3);
                sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (i - n / 2 < 0 ? -1 : 1);
                newLeft = Math.max(left, Math.floor(k - i * s / n + sd));
                newRight = Math.min(right, Math.floor(k + (n - i) * s / n + sd));
                select(arr, newLeft, newRight, k, compare);
            }
            t = arr[k];
            i = left;
            j = right;
            swap(arr, left, k);
            if (compare(arr[right], t) > 0) swap(arr, left, right);
            while (i < j) {
                swap(arr, i, j);
                i++;
                j--;
                while (compare(arr[i], t) < 0) i++;
                while (compare(arr[j], t) > 0) j--;
            }
            if (compare(arr[left], t) === 0) swap(arr, left, j);
            else {
                j++;
                swap(arr, j, right);
            }
            if (j <= k) left = j + 1;
            if (k <= j) right = j - 1;
        }
    }

    function swap(arr, i, j) {
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    if (typeof define === 'function' && define.amd) define('rbush', function () {
        return rbush;
    });
    else if (typeof module !== 'undefined') module.exports = rbush;
    else if (typeof self !== 'undefined') self.rbush = rbush;
    else window.rbush = rbush;
})();;
(function () {
    var block = {
        newline: /^\n+/,
        code: /^( {4}[^\n]+\n*)+/,
        fences: noop,
        hr: /^( *[-*_]){3,} *(?:\n+|$)/,
        heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
        nptable: noop,
        lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
        blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
        list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
        html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
        def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
        table: noop,
        paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
        text: /^[^\n]+/
    };
    block.bullet = /(?:[*+-]|\d+\.)/;
    block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
    block.item = replace(block.item, 'gm')
        (/bull/g, block.bullet)
        ();
    block.list = replace(block.list)
        (/bull/g, block.bullet)
        ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
        ('def', '\\n+(?=' + block.def.source + ')')
        ();
    block.blockquote = replace(block.blockquote)
        ('def', block.def)
        ();
    block._tag = '(?!(?:' + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code' + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo' + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';
    block.html = replace(block.html)
        ('comment', /<!--[\s\S]*?-->/)
        ('closed', /<(tag)[\s\S]+?<\/\1>/)
        ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
        (/tag/g, block._tag)
        ();
    block.paragraph = replace(block.paragraph)
        ('hr', block.hr)
        ('heading', block.heading)
        ('lheading', block.lheading)
        ('blockquote', block.blockquote)
        ('tag', '<' + block._tag)
        ('def', block.def)
        ();
    block.normal = merge({}, block);
    block.gfm = merge({}, block.normal, {
        fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
        paragraph: /^/,
        heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
    });
    block.gfm.paragraph = replace(block.paragraph)
        ('(?!', '(?!' + block.gfm.fences.source.replace('\\1', '\\2') + '|' + block.list.source.replace('\\1', '\\3') + '|')
        ();
    block.tables = merge({}, block.gfm, {
        nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
        table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
    });

    function Lexer(options) {
        this.tokens = [];
        this.tokens.links = {};
        this.options = options || marked.defaults;
        this.rules = block.normal;
        if (this.options.gfm) {
            if (this.options.tables) {
                this.rules = block.tables;
            } else {
                this.rules = block.gfm;
            }
        }
    }
    Lexer.rules = block;
    Lexer.lex = function (src, options) {
        var lexer = new Lexer(options);
        return lexer.lex(src);
    };
    Lexer.prototype.lex = function (src) {
        src = src.replace(/\r\n|\r/g, '\n').replace(/\t/g, '    ').replace(/\u00a0/g, ' ').replace(/\u2424/g, '\n');
        return this.token(src, true);
    };
    Lexer.prototype.token = function (src, top, bq) {
        var src = src.replace(/^ +$/gm, ''),
            next, loose, cap, bull, b, item, space, i, l;
        while (src) {
            if (cap = this.rules.newline.exec(src)) {
                src = src.substring(cap[0].length);
                if (cap[0].length > 1) {
                    this.tokens.push({
                        type: 'space'
                    });
                }
            }
            if (cap = this.rules.code.exec(src)) {
                src = src.substring(cap[0].length);
                cap = cap[0].replace(/^ {4}/gm, '');
                this.tokens.push({
                    type: 'code',
                    text: !this.options.pedantic ? cap.replace(/\n+$/, '') : cap
                });
                continue;
            }
            if (cap = this.rules.fences.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'code',
                    lang: cap[2],
                    text: cap[3] || ''
                });
                continue;
            }
            if (cap = this.rules.heading.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'heading',
                    depth: cap[1].length,
                    text: cap[2]
                });
                continue;
            }
            if (top && (cap = this.rules.nptable.exec(src))) {
                src = src.substring(cap[0].length);
                item = {
                    type: 'table',
                    header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
                    align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
                    cells: cap[3].replace(/\n$/, '').split('\n')
                };
                for (i = 0; i < item.align.length; i++) {
                    if (/^ *-+: *$/.test(item.align[i])) {
                        item.align[i] = 'right';
                    } else if (/^ *:-+: *$/.test(item.align[i])) {
                        item.align[i] = 'center';
                    } else if (/^ *:-+ *$/.test(item.align[i])) {
                        item.align[i] = 'left';
                    } else {
                        item.align[i] = null;
                    }
                }
                for (i = 0; i < item.cells.length; i++) {
                    item.cells[i] = item.cells[i].split(/ *\| */);
                }
                this.tokens.push(item);
                continue;
            }
            if (cap = this.rules.lheading.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'heading',
                    depth: cap[2] === '=' ? 1 : 2,
                    text: cap[1]
                });
                continue;
            }
            if (cap = this.rules.hr.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'hr'
                });
                continue;
            }
            if (cap = this.rules.blockquote.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'blockquote_start'
                });
                cap = cap[0].replace(/^ *> ?/gm, '');
                this.token(cap, top, true);
                this.tokens.push({
                    type: 'blockquote_end'
                });
                continue;
            }
            if (cap = this.rules.list.exec(src)) {
                src = src.substring(cap[0].length);
                bull = cap[2];
                this.tokens.push({
                    type: 'list_start',
                    ordered: bull.length > 1
                });
                cap = cap[0].match(this.rules.item);
                next = false;
                l = cap.length;
                i = 0;
                for (; i < l; i++) {
                    item = cap[i];
                    space = item.length;
                    item = item.replace(/^ *([*+-]|\d+\.) +/, '');
                    if (~item.indexOf('\n ')) {
                        space -= item.length;
                        item = !this.options.pedantic ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '') : item.replace(/^ {1,4}/gm, '');
                    }
                    if (this.options.smartLists && i !== l - 1) {
                        b = block.bullet.exec(cap[i + 1])[0];
                        if (bull !== b && !(bull.length > 1 && b.length > 1)) {
                            src = cap.slice(i + 1).join('\n') + src;
                            i = l - 1;
                        }
                    }
                    loose = next || /\n\n(?!\s*$)/.test(item);
                    if (i !== l - 1) {
                        next = item.charAt(item.length - 1) === '\n';
                        if (!loose) loose = next;
                    }
                    this.tokens.push({
                        type: loose ? 'loose_item_start' : 'list_item_start'
                    });
                    this.token(item, false, bq);
                    this.tokens.push({
                        type: 'list_item_end'
                    });
                }
                this.tokens.push({
                    type: 'list_end'
                });
                continue;
            }
            if (cap = this.rules.html.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: this.options.sanitize ? 'paragraph' : 'html',
                    pre: !this.options.sanitizer && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
                    text: cap[0]
                });
                continue;
            }
            if ((!bq && top) && (cap = this.rules.def.exec(src))) {
                src = src.substring(cap[0].length);
                this.tokens.links[cap[1].toLowerCase()] = {
                    href: cap[2],
                    title: cap[3]
                };
                continue;
            }
            if (top && (cap = this.rules.table.exec(src))) {
                src = src.substring(cap[0].length);
                item = {
                    type: 'table',
                    header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
                    align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
                    cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
                };
                for (i = 0; i < item.align.length; i++) {
                    if (/^ *-+: *$/.test(item.align[i])) {
                        item.align[i] = 'right';
                    } else if (/^ *:-+: *$/.test(item.align[i])) {
                        item.align[i] = 'center';
                    } else if (/^ *:-+ *$/.test(item.align[i])) {
                        item.align[i] = 'left';
                    } else {
                        item.align[i] = null;
                    }
                }
                for (i = 0; i < item.cells.length; i++) {
                    item.cells[i] = item.cells[i].replace(/^ *\| *| *\| *$/g, '').split(/ *\| */);
                }
                this.tokens.push(item);
                continue;
            }
            if (top && (cap = this.rules.paragraph.exec(src))) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'paragraph',
                    text: cap[1].charAt(cap[1].length - 1) === '\n' ? cap[1].slice(0, -1) : cap[1]
                });
                continue;
            }
            if (cap = this.rules.text.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'text',
                    text: cap[0]
                });
                continue;
            }
            if (src) {
                throw new
                Error('Infinite loop on byte: ' + src.charCodeAt(0));
            }
        }
        return this.tokens;
    };
    var inline = {
        escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
        autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
        url: noop,
        tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
        link: /^!?\[(inside)\]\(href\)/,
        reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
        nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
        strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
        em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
        code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
        br: /^ {2,}\n(?!\s*$)/,
        del: noop,
        text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
    };
    inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
    inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;
    inline.link = replace(inline.link)
        ('inside', inline._inside)
        ('href', inline._href)
        ();
    inline.reflink = replace(inline.reflink)
        ('inside', inline._inside)
        ();
    inline.normal = merge({}, inline);
    inline.pedantic = merge({}, inline.normal, {
        strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
        em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
    });
    inline.gfm = merge({}, inline.normal, {
        escape: replace(inline.escape)('])', '~|])')(),
        url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
        del: /^~~(?=\S)([\s\S]*?\S)~~/,
        text: replace(inline.text)
            (']|', '~]|')
            ('|', '|https?://|')
            ()
    });
    inline.breaks = merge({}, inline.gfm, {
        br: replace(inline.br)('{2,}', '*')(),
        text: replace(inline.gfm.text)('{2,}', '*')()
    });

    function InlineLexer(links, options) {
        this.options = options || marked.defaults;
        this.links = links;
        this.rules = inline.normal;
        this.renderer = this.options.renderer || new Renderer;
        this.renderer.options = this.options;
        if (!this.links) {
            throw new
            Error('Tokens array requires a `links` property.');
        }
        if (this.options.gfm) {
            if (this.options.breaks) {
                this.rules = inline.breaks;
            } else {
                this.rules = inline.gfm;
            }
        } else if (this.options.pedantic) {
            this.rules = inline.pedantic;
        }
    }
    InlineLexer.rules = inline;
    InlineLexer.output = function (src, links, options) {
        var inline = new InlineLexer(links, options);
        return inline.output(src);
    };
    InlineLexer.prototype.output = function (src) {
        var out = '',
            link, text, href, cap;
        while (src) {
            if (cap = this.rules.escape.exec(src)) {
                src = src.substring(cap[0].length);
                out += cap[1];
                continue;
            }
            if (cap = this.rules.autolink.exec(src)) {
                src = src.substring(cap[0].length);
                if (cap[2] === '@') {
                    text = cap[1].charAt(6) === ':' ? this.mangle(cap[1].substring(7)) : this.mangle(cap[1]);
                    href = this.mangle('mailto:') + text;
                } else {
                    text = escape(cap[1]);
                    href = text;
                }
                out += this.renderer.link(href, null, text);
                continue;
            }
            if (!this.inLink && (cap = this.rules.url.exec(src))) {
                src = src.substring(cap[0].length);
                text = escape(cap[1]);
                href = text;
                out += this.renderer.link(href, null, text);
                continue;
            }
            if (cap = this.rules.tag.exec(src)) {
                if (!this.inLink && /^<a /i.test(cap[0])) {
                    this.inLink = true;
                } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
                    this.inLink = false;
                }
                src = src.substring(cap[0].length);
                out += this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0]) : cap[0]
                continue;
            }
            if (cap = this.rules.link.exec(src)) {
                src = src.substring(cap[0].length);
                this.inLink = true;
                out += this.outputLink(cap, {
                    href: cap[2],
                    title: cap[3]
                });
                this.inLink = false;
                continue;
            }
            if ((cap = this.rules.reflink.exec(src)) || (cap = this.rules.nolink.exec(src))) {
                src = src.substring(cap[0].length);
                link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
                link = this.links[link.toLowerCase()];
                if (!link || !link.href) {
                    out += cap[0].charAt(0);
                    src = cap[0].substring(1) + src;
                    continue;
                }
                this.inLink = true;
                out += this.outputLink(cap, link);
                this.inLink = false;
                continue;
            }
            if (cap = this.rules.strong.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.strong(this.output(cap[2] || cap[1]));
                continue;
            }
            if (cap = this.rules.em.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.em(this.output(cap[2] || cap[1]));
                continue;
            }
            if (cap = this.rules.code.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.codespan(escape(cap[2], true));
                continue;
            }
            if (cap = this.rules.br.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.br();
                continue;
            }
            if (cap = this.rules.del.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.del(this.output(cap[1]));
                continue;
            }
            if (cap = this.rules.text.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.text(escape(this.smartypants(cap[0])));
                continue;
            }
            if (src) {
                throw new
                Error('Infinite loop on byte: ' + src.charCodeAt(0));
            }
        }
        return out;
    };
    InlineLexer.prototype.outputLink = function (cap, link) {
        var href = escape(link.href),
            title = link.title ? escape(link.title) : null;
        return cap[0].charAt(0) !== '!' ? this.renderer.link(href, title, this.output(cap[1])) : this.renderer.image(href, title, escape(cap[1]));
    };
    InlineLexer.prototype.smartypants = function (text) {
        if (!this.options.smartypants) return text;
        return text.replace(/---/g, '\u2014').replace(/--/g, '\u2013').replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018').replace(/'/g, '\u2019').replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c').replace(/"/g, '\u201d').replace(/\.{3}/g, '\u2026');
    };
    InlineLexer.prototype.mangle = function (text) {
        if (!this.options.mangle) return text;
        var out = '',
            l = text.length,
            i = 0,
            ch;
        for (; i < l; i++) {
            ch = text.charCodeAt(i);
            if (Math.random() > 0.5) {
                ch = 'x' + ch.toString(16);
            }
            out += '&#' + ch + ';';
        }
        return out;
    };

    function Renderer(options) {
        this.options = options || {};
    }
    Renderer.prototype.code = function (code, lang, escaped) {
        if (this.options.highlight) {
            var out = this.options.highlight(code, lang);
            if (out != null && out !== code) {
                escaped = true;
                code = out;
            }
        }
        if (!lang) {
            return '<pre><code>' + (escaped ? code : escape(code, true)) + '\n</code></pre>';
        }
        return '<pre><code class="' + this.options.langPrefix + escape(lang, true) + '">' + (escaped ? code : escape(code, true)) + '\n</code></pre>\n';
    };
    Renderer.prototype.blockquote = function (quote) {
        return '<blockquote>\n' + quote + '</blockquote>\n';
    };
    Renderer.prototype.html = function (html) {
        return html;
    };
    Renderer.prototype.heading = function (text, level, raw) {
        return '<h' + level + ' id="' + this.options.headerPrefix + raw.toLowerCase().replace(/[^\w]+/g, '-') + '">' + text + '</h' + level + '>\n';
    };
    Renderer.prototype.hr = function () {
        return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
    };
    Renderer.prototype.list = function (body, ordered) {
        var type = ordered ? 'ol' : 'ul';
        return '<' + type + '>\n' + body + '</' + type + '>\n';
    };
    Renderer.prototype.listitem = function (text) {
        return '<li>' + text + '</li>\n';
    };
    Renderer.prototype.paragraph = function (text) {
        return '<p>' + text + '</p>\n';
    };
    Renderer.prototype.table = function (header, body) {
        return '<table>\n' + '<thead>\n' + header + '</thead>\n' + '<tbody>\n' + body + '</tbody>\n' + '</table>\n';
    };
    Renderer.prototype.tablerow = function (content) {
        return '<tr>\n' + content + '</tr>\n';
    };
    Renderer.prototype.tablecell = function (content, flags) {
        var type = flags.header ? 'th' : 'td';
        var tag = flags.align ? '<' + type + ' style="text-align:' + flags.align + '">' : '<' + type + '>';
        return tag + content + '</' + type + '>\n';
    };
    Renderer.prototype.strong = function (text) {
        return '<strong>' + text + '</strong>';
    };
    Renderer.prototype.em = function (text) {
        return '<em>' + text + '</em>';
    };
    Renderer.prototype.codespan = function (text) {
        return '<code>' + text + '</code>';
    };
    Renderer.prototype.br = function () {
        return this.options.xhtml ? '<br/>' : '<br>';
    };
    Renderer.prototype.del = function (text) {
        return '<del>' + text + '</del>';
    };
    Renderer.prototype.link = function (href, title, text) {
        if (this.options.sanitize) {
            try {
                var prot = decodeURIComponent(unescape(href)).replace(/[^\w:]/g, '').toLowerCase();
            } catch (e) {
                return '';
            }
            if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
                return '';
            }
        }
        var out = '<a href="' + href + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += '>' + text + '</a>';
        return out;
    };
    Renderer.prototype.image = function (href, title, text) {
        var out = '<img src="' + href + '" alt="' + text + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += this.options.xhtml ? '/>' : '>';
        return out;
    };
    Renderer.prototype.text = function (text) {
        return text;
    };

    function Parser(options) {
        this.tokens = [];
        this.token = null;
        this.options = options || marked.defaults;
        this.options.renderer = this.options.renderer || new Renderer;
        this.renderer = this.options.renderer;
        this.renderer.options = this.options;
    }
    Parser.parse = function (src, options, renderer) {
        var parser = new Parser(options, renderer);
        return parser.parse(src);
    };
    Parser.prototype.parse = function (src) {
        this.inline = new InlineLexer(src.links, this.options, this.renderer);
        this.tokens = src.reverse();
        var out = '';
        while (this.next()) {
            out += this.tok();
        }
        return out;
    };
    Parser.prototype.next = function () {
        return this.token = this.tokens.pop();
    };
    Parser.prototype.peek = function () {
        return this.tokens[this.tokens.length - 1] || 0;
    };
    Parser.prototype.parseText = function () {
        var body = this.token.text;
        while (this.peek().type === 'text') {
            body += '\n' + this.next().text;
        }
        return this.inline.output(body);
    };
    Parser.prototype.tok = function () {
        switch (this.token.type) {
        case 'space':
            {
                return '';
            }
        case 'hr':
            {
                return this.renderer.hr();
            }
        case 'heading':
            {
                return this.renderer.heading(this.inline.output(this.token.text), this.token.depth, this.token.text);
            }
        case 'code':
            {
                return this.renderer.code(this.token.text, this.token.lang, this.token.escaped);
            }
        case 'table':
            {
                var header = '',
                    body = '',
                    i, row, cell, flags, j;
                cell = '';
                for (i = 0; i < this.token.header.length; i++) {
                    flags = {
                        header: true,
                        align: this.token.align[i]
                    };
                    cell += this.renderer.tablecell(this.inline.output(this.token.header[i]), {
                        header: true,
                        align: this.token.align[i]
                    });
                }
                header += this.renderer.tablerow(cell);
                for (i = 0; i < this.token.cells.length; i++) {
                    row = this.token.cells[i];
                    cell = '';
                    for (j = 0; j < row.length; j++) {
                        cell += this.renderer.tablecell(this.inline.output(row[j]), {
                            header: false,
                            align: this.token.align[j]
                        });
                    }
                    body += this.renderer.tablerow(cell);
                }
                return this.renderer.table(header, body);
            }
        case 'blockquote_start':
            {
                var body = '';
                while (this.next().type !== 'blockquote_end') {
                    body += this.tok();
                }
                return this.renderer.blockquote(body);
            }
        case 'list_start':
            {
                var body = '',
                    ordered = this.token.ordered;
                while (this.next().type !== 'list_end') {
                    body += this.tok();
                }
                return this.renderer.list(body, ordered);
            }
        case 'list_item_start':
            {
                var body = '';
                while (this.next().type !== 'list_item_end') {
                    body += this.token.type === 'text' ? this.parseText() : this.tok();
                }
                return this.renderer.listitem(body);
            }
        case 'loose_item_start':
            {
                var body = '';
                while (this.next().type !== 'list_item_end') {
                    body += this.tok();
                }
                return this.renderer.listitem(body);
            }
        case 'html':
            {
                var html = !this.token.pre && !this.options.pedantic ? this.inline.output(this.token.text) : this.token.text;
                return this.renderer.html(html);
            }
        case 'paragraph':
            {
                return this.renderer.paragraph(this.inline.output(this.token.text));
            }
        case 'text':
            {
                return this.renderer.paragraph(this.parseText());
            }
        }
    };

    function escape(html, encode) {
        return html.replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function unescape(html) {
        return html.replace(/&([#\w]+);/g, function (_, n) {
            n = n.toLowerCase();
            if (n === 'colon') return ':';
            if (n.charAt(0) === '#') {
                return n.charAt(1) === 'x' ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
            }
            return '';
        });
    }

    function replace(regex, opt) {
        regex = regex.source;
        opt = opt || '';
        return function self(name, val) {
            if (!name) return new RegExp(regex, opt);
            val = val.source || val;
            val = val.replace(/(^|[^\[])\^/g, '$1');
            regex = regex.replace(name, val);
            return self;
        };
    }

    function noop() {}
    noop.exec = noop;

    function merge(obj) {
        var i = 1,
            target, key;
        for (; i < arguments.length; i++) {
            target = arguments[i];
            for (key in target) {
                if (Object.prototype.hasOwnProperty.call(target, key)) {
                    obj[key] = target[key];
                }
            }
        }
        return obj;
    }

    function marked(src, opt, callback) {
        if (callback || typeof opt === 'function') {
            if (!callback) {
                callback = opt;
                opt = null;
            }
            opt = merge({}, marked.defaults, opt || {});
            var highlight = opt.highlight,
                tokens, pending, i = 0;
            try {
                tokens = Lexer.lex(src, opt)
            } catch (e) {
                return callback(e);
            }
            pending = tokens.length;
            var done = function (err) {
                if (err) {
                    opt.highlight = highlight;
                    return callback(err);
                }
                var out;
                try {
                    out = Parser.parse(tokens, opt);
                } catch (e) {
                    err = e;
                }
                opt.highlight = highlight;
                return err ? callback(err) : callback(null, out);
            };
            if (!highlight || highlight.length < 3) {
                return done();
            }
            delete opt.highlight;
            if (!pending) return done();
            for (; i < tokens.length; i++) {
                (function (token) {
                    if (token.type !== 'code') {
                        return --pending || done();
                    }
                    return highlight(token.text, token.lang, function (err, code) {
                        if (err) return done(err);
                        if (code == null || code === token.text) {
                            return --pending || done();
                        }
                        token.text = code;
                        token.escaped = true;
                        --pending || done();
                    });
                })(tokens[i]);
            }
            return;
        }
        try {
            if (opt) opt = merge({}, marked.defaults, opt);
            return Parser.parse(Lexer.lex(src, opt), opt);
        } catch (e) {
            e.message += '\nPlease report this to https://github.com/chjj/marked.';
            if ((opt || marked.defaults).silent) {
                return '<p>An error occured:</p><pre>' + escape(e.message + '', true) + '</pre>';
            }
            throw e;
        }
    }
    marked.options = marked.setOptions = function (opt) {
        merge(marked.defaults, opt);
        return marked;
    };
    marked.defaults = {
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        sanitizer: null,
        mangle: true,
        smartLists: false,
        silent: false,
        highlight: null,
        langPrefix: 'lang-',
        smartypants: false,
        headerPrefix: '',
        renderer: new Renderer,
        xhtml: false
    };
    marked.Parser = Parser;
    marked.parser = Parser.parse;
    marked.Renderer = Renderer;
    marked.Lexer = Lexer;
    marked.lexer = Lexer.lex;
    marked.InlineLexer = InlineLexer;
    marked.inlineLexer = InlineLexer.output;
    marked.parse = marked;
    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = marked;
    } else if (typeof define === 'function' && define.amd) {
        define(function () {
            return marked;
        });
    } else {
        this.marked = marked;
    }
}).call(function () {
    return this || (typeof window !== 'undefined' ? window : global);
}());
L.Control.Sidebar = L.Control.extend({
    includes: L.Mixin.Events,
    initialize: function (id, options) {
        var i, child;
        L.setOptions(this, options);
        this._sidebar = L.DomUtil.get(id);
        if (L.Browser.touch)
            L.DomUtil.addClass(this._sidebar, 'leaflet-touch');
        for (i = this._sidebar.children.length - 1; i >= 0; i--) {
            child = this._sidebar.children[i];
            if (child.tagName == 'UL' && L.DomUtil.hasClass(child, 'sidebar-tabs'))
                this._tabs = child;
            else if (child.tagName == 'DIV' && L.DomUtil.hasClass(child, 'sidebar-content'))
                this._container = child;
        }
        this._tabitems = [];
        for (i = this._tabs.children.length - 1; i >= 0; i--) {
            child = this._tabs.children[i];
            if (child.tagName == 'LI') {
                this._tabitems.push(child);
                child._sidebar = this;
            }
        }
        this._panes = [];
        for (i = this._container.children.length - 1; i >= 0; i--) {
            child = this._container.children[i];
            if (child.tagName == 'DIV' && L.DomUtil.hasClass(child, 'sidebar-pane'))
                this._panes.push(child);
        }
        this._hasTouchStart = L.Browser.touch && ('ontouchstart' in document.documentElement);
    },
    addTo: function (map) {
        this._map = map;
        var e = this._hasTouchStart ? 'touchstart' : 'click';
        for (var i = this._tabitems.length - 1; i >= 0; i--) {
            var child = this._tabitems[i];
            L.DomEvent.on(child.firstChild, e, this._onClick, child);
        }
        return this;
    },
    removeFrom: function (map) {
        this._map = null;
        var e = this._hasTouchStart ? 'touchstart' : 'click';
        for (var i = this._tabitems.length - 1; i >= 0; i--) {
            var child = this._tabitems[i];
            L.DomEvent.off(child.firstChild, e, this._onClick);
        }
        return this;
    },
    open: function (id) {
        var i, child;
        for (i = this._panes.length - 1; i >= 0; i--) {
            child = this._panes[i];
            if (child.id == id)
                L.DomUtil.addClass(child, 'active');
            else if (L.DomUtil.hasClass(child, 'active'))
                L.DomUtil.removeClass(child, 'active');
        }
        for (i = this._tabitems.length - 1; i >= 0; i--) {
            child = this._tabitems[i];
            if (child.firstChild.hash == '#' + id)
                L.DomUtil.addClass(child, 'active');
            else if (L.DomUtil.hasClass(child, 'active'))
                L.DomUtil.removeClass(child, 'active');
        }
        this.fire('content', {
            id: id
        });
        if (L.DomUtil.hasClass(this._sidebar, 'collapsed')) {
            this.fire('opening');
            L.DomUtil.removeClass(this._sidebar, 'collapsed');
        }
        this._sidebar.setAttribute('data', id);
        return this;
    },
    close: function (id) {
        for (var i = this._tabitems.length - 1; i >= 0; i--) {
            var child = this._tabitems[i];
            if (L.DomUtil.hasClass(child, 'active'))
                L.DomUtil.removeClass(child, 'active');
        }
        if (!L.DomUtil.hasClass(this._sidebar, 'collapsed')) {
            this.fire('closing');
            L.DomUtil.addClass(this._sidebar, 'collapsed');
        }
        this._sidebar.removeAttribute('data');
        return this;
    },
    _onClick: function (e) {
        e.preventDefault();
        var id = this.firstChild.hash.slice(1);
        if (L.DomUtil.hasClass(this, 'active')) {
            this._sidebar.close(id);
        } else {
            this._sidebar.open(id);
        }
    }
});
L.control.sidebar = function (sidebar, options) {
    return new L.Control.Sidebar(sidebar, options);
};
(function (factory) {
    var L;
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory);
    } else if (typeof module !== 'undefined') {
        L = require('leaflet');
        module.exports = factory(L);
    } else {
        if (typeof window.L === 'undefined') {
            throw new Error('Leaflet must be loaded first');
        }
        factory(window.L);
    }
})(function (L) {
    L.Map.mergeOptions({
        contextmenuItems: []
    });
    L.Map.ContextMenu = L.Handler.extend({
        _touchstart: L.Browser.msPointer ? 'MSPointerDown' : L.Browser.pointer ? 'pointerdown' : 'touchstart',
        statics: {
            BASE_CLS: 'leaflet-contextmenu'
        },
        initialize: function (map) {
            L.Handler.prototype.initialize.call(this, map);
            this._items = [];
            this._visible = false;
            var container = this._container = L.DomUtil.create('div', L.Map.ContextMenu.BASE_CLS, map._container);
            container.style.zIndex = 10000;
            container.style.position = 'absolute';
            if (map.options.contextmenuWidth) {
                container.style.width = map.options.contextmenuWidth + 'px';
            }
            this._createItems();
            L.DomEvent.on(container, 'click', L.DomEvent.stop).on(container, 'mousedown', L.DomEvent.stop).on(container, 'dblclick', L.DomEvent.stop).on(container, 'contextmenu', L.DomEvent.stop);
        },
        addHooks: function () {
            L.DomEvent.on(document, (L.Browser.touch ? this._touchstart : 'mousedown'), this._onMouseDown, this).on(document, 'keydown', this._onKeyDown, this);
            this._map.on({
                contextmenu: this._show,
                mouseout: this._hide,
                mousedown: this._hide,
                movestart: this._hide,
                zoomstart: this._hide
            }, this);
        },
        removeHooks: function () {
            L.DomEvent.off(document, (L.Browser.touch ? this._touchstart : 'mousedown'), this._onMouseDown, this).off(document, 'keydown', this._onKeyDown, this);
            this._map.off({
                contextmenu: this._show,
                mouseout: this._hide,
                mousedown: this._hide,
                movestart: this._hide,
                zoomstart: this._hide
            }, this);
        },
        showAt: function (point, data) {
            if (point instanceof L.LatLng) {
                point = this._map.latLngToContainerPoint(point);
            }
            this._showAtPoint(point, data);
        },
        hide: function () {
            this._hide();
        },
        addItem: function (options) {
            return this.insertItem(options);
        },
        insertItem: function (options, index, layer) {
            index = index !== undefined ? index : this._items.length;
            var item = this._createItem(this._container, options, index, layer);
            this._items.push(item);
            this._sizeChanged = true;
            this._map.fire('contextmenu.additem', {
                contextmenu: this,
                el: item.el,
                index: index
            });
            return item.el;
        },
        removeItem: function (item) {
            var container = this._container;
            if (!isNaN(item)) {
                item = container.children[item];
            }
            if (item) {
                this._removeItem(L.Util.stamp(item));
                this._sizeChanged = true;
                this._map.fire('contextmenu.removeitem', {
                    contextmenu: this,
                    el: item
                });
            }
        },
        removeAllItems: function () {
            var item;
            while (this._container.children.length) {
                item = this._container.children[0];
                this._removeItem(L.Util.stamp(item));
            }
        },
        hideAllItems: function () {
            var item, i, l;
            for (i = 0, l = this._items.length; i < l; i++) {
                item = this._items[i];
                item.el.style.display = 'none';
            }
        },
        showAllItems: function () {
            var item, i, l;
            for (i = 0, l = this._items.length; i < l; i++) {
                item = this._items[i];
                item.el.style.display = '';
            }
        },
        setDisabled: function (item, disabled) {
            var container = this._container,
                itemCls = L.Map.ContextMenu.BASE_CLS + '-item';
            if (!isNaN(item)) {
                item = container.children[item];
            }
            if (item && L.DomUtil.hasClass(item, itemCls)) {
                if (disabled) {
                    L.DomUtil.addClass(item, itemCls + '-disabled');
                    this._map.fire('contextmenu.disableitem', {
                        contextmenu: this,
                        el: item
                    });
                } else {
                    L.DomUtil.removeClass(item, itemCls + '-disabled');
                    this._map.fire('contextmenu.enableitem', {
                        contextmenu: this,
                        el: item
                    });
                }
            }
        },
        isVisible: function () {
            return this._visible;
        },
        _createItems: function () {
            var itemOptions = this._map.options.contextmenuItems,
                item, i, l;
            for (i = 0, l = itemOptions.length; i < l; i++) {
                this._items.push(this._createItem(this._container, itemOptions[i]));
            }
        },
        _createItem: function (container, options, index, layer) {
            if (options.separator || options === '-') {
                return this._createSeparator(container, index);
            }
            var itemCls = L.Map.ContextMenu.BASE_CLS + '-item',
                cls = options.disabled ? (itemCls + ' ' + itemCls + '-disabled') : itemCls,
                el = this._insertElementAt('a', cls, container, index),
                callback = this._createEventHandler(el, options.callback, options.context, options.hideOnSelect, layer),
                html = '';
            if (options.icon) {
                html = '<img class="' + L.Map.ContextMenu.BASE_CLS + '-icon" src="' + options.icon + '"/>';
            } else if (options.iconCls) {
                html = '<span class="' + L.Map.ContextMenu.BASE_CLS + '-icon ' + options.iconCls + '"></span>';
            }
            el.innerHTML = html + options.text;
            el.href = '#';
            L.DomEvent.on(el, 'mouseover', this._onItemMouseOver, this).on(el, 'mouseout', this._onItemMouseOut, this).on(el, 'mousedown', L.DomEvent.stopPropagation).on(el, 'click', callback);
            return {
                id: L.Util.stamp(el),
                el: el,
                callback: callback
            };
        },
        _removeItem: function (id) {
            var item, el, i, l;
            for (i = 0, l = this._items.length; i < l; i++) {
                item = this._items[i];
                if (item.id === id) {
                    el = item.el;
                    callback = item.callback;
                    if (callback) {
                        L.DomEvent.off(el, 'mouseover', this._onItemMouseOver, this).off(el, 'mouseover', this._onItemMouseOut, this).off(el, 'mousedown', L.DomEvent.stopPropagation).off(el, 'click', item.callback);
                    }
                    this._container.removeChild(el);
                    this._items.splice(i, 1);
                    return item;
                }
            }
            return null;
        },
        _createSeparator: function (container, index) {
            var el = this._insertElementAt('div', L.Map.ContextMenu.BASE_CLS + '-separator', container, index);
            return {
                id: L.Util.stamp(el),
                el: el
            };
        },
        _createEventHandler: function (el, func, context, hideOnSelect, layer) {
            var me = this,
                map = this._map,
                disabledCls = L.Map.ContextMenu.BASE_CLS + '-item-disabled',
                hideOnSelect = (hideOnSelect !== undefined) ? hideOnSelect : true;
            return function (e) {
                if (L.DomUtil.hasClass(el, disabledCls)) {
                    return;
                }
                if (hideOnSelect) {
                    me._hide();
                }
                if (func) {
                    func.call(context || map, me._showLocation, layer);
                }
                me._map.fire('contextmenu:select', {
                    contextmenu: me,
                    el: el
                });
            };
        },
        _insertElementAt: function (tagName, className, container, index) {
            var refEl, el = document.createElement(tagName);
            el.className = className;
            if (index !== undefined) {
                refEl = container.children[index];
            }
            if (refEl) {
                container.insertBefore(el, refEl);
            } else {
                container.appendChild(el);
            }
            return el;
        },
        _show: function (e) {
            this._showAtPoint(e.containerPoint);
        },
        _showAtPoint: function (pt, data) {
            if (this._items.length) {
                var map = this._map,
                    layerPoint = map.containerPointToLayerPoint(pt),
                    latlng = map.layerPointToLatLng(layerPoint),
                    event = {
                        contextmenu: this
                    };
                if (data) {
                    event = L.extend(data, event);
                }
                this._showLocation = {
                    latlng: latlng,
                    layerPoint: layerPoint,
                    containerPoint: pt
                };
                this._setPosition(pt);
                if (!this._visible) {
                    this._container.style.display = 'block';
                    this._visible = true;
                } else {
                    this._setPosition(pt);
                }
                this._map.fire('contextmenu.show', event);
            }
        },
        _hide: function () {
            if (this._visible) {
                this._visible = false;
                this._container.style.display = 'none';
                this._map.fire('contextmenu.hide', {
                    contextmenu: this
                });
            }
        },
        _setPosition: function (pt) {
            var mapSize = this._map.getSize(),
                container = this._container,
                containerSize = this._getElementSize(container),
                anchor;
            if (this._map.options.contextmenuAnchor) {
                anchor = L.point(this._map.options.contextmenuAnchor);
                pt = pt.add(anchor);
            }
            container._leaflet_pos = pt;
            if (pt.x + containerSize.x > mapSize.x) {
                container.style.left = 'auto';
                container.style.right = Math.max(mapSize.x - pt.x, 0) + 'px';
            } else {
                container.style.left = Math.max(pt.x, 0) + 'px';
                container.style.right = 'auto';
            }
            if (pt.y + containerSize.y > mapSize.y) {
                container.style.top = 'auto';
                container.style.bottom = Math.max(mapSize.y - pt.y, 0) + 'px';
            } else {
                container.style.top = Math.max(pt.y, 0) + 'px';
                container.style.bottom = 'auto';
            }
        },
        _getElementSize: function (el) {
            var size = this._size,
                initialDisplay = el.style.display;
            if (!size || this._sizeChanged) {
                size = {};
                el.style.left = '-999999px';
                el.style.right = 'auto';
                el.style.display = 'block';
                size.x = el.offsetWidth;
                size.y = el.offsetHeight;
                el.style.left = 'auto';
                el.style.display = initialDisplay;
                this._sizeChanged = false;
            }
            return size;
        },
        _onMouseDown: function (e) {
            this._hide();
        },
        _onKeyDown: function (e) {
            var key = e.keyCode;
            if (key === 27) {
                this._hide();
            }
        },
        _onItemMouseOver: function (e) {
            L.DomUtil.addClass(e.target || e.srcElement, 'over');
        },
        _onItemMouseOut: function (e) {
            L.DomUtil.removeClass(e.target || e.srcElement, 'over');
        }
    });
    L.Map.addInitHook('addHandler', 'contextmenu', L.Map.ContextMenu);
    L.Mixin.ContextMenu = {
        bindContextMenu: function (options) {
            L.setOptions(this, options);
            this._initContextMenu();
            return this;
        },
        unbindContextMenu: function () {
            this.off('contextmenu', this._showContextMenu, this);
            return this;
        },
        _initContextMenu: function () {
            this._items = [];
            this.on('contextmenu', this._showContextMenu, this);
        },
        _showContextMenu: function (e) {
            var itemOptions, pt, i, l;
            if (this._map.contextmenu) {
                pt = this._map.mouseEventToContainerPoint(e.originalEvent);
                if (!this.options.contextmenuInheritItems) {
                    this._map.contextmenu.hideAllItems();
                }
                for (i = 0, l = this.options.contextmenuItems.length; i < l; i++) {
                    itemOptions = this.options.contextmenuItems[i];
                    this._items.push(this._map.contextmenu.insertItem(itemOptions, itemOptions.index, this));
                }
                this._map.once('contextmenu.hide', this._hideContextMenu, this);
                this._map.contextmenu.showAt(pt, {
                    relatedTarget: this
                });
            }
        },
        _hideContextMenu: function () {
            var i, l;
            for (i = 0, l = this._items.length; i < l; i++) {
                this._map.contextmenu.removeItem(this._items[i]);
            }
            this._items.length = 0;
            if (!this.options.contextmenuInheritItems) {
                this._map.contextmenu.showAllItems();
            }
        }
    };
    var classes = [L.Marker, L.Path, L.GeoJSON],
        defaultOptions = {
            contextmenu: false,
            contextmenuItems: [],
            contextmenuInheritItems: true
        },
        cls, i, l;
    for (i = 0, l = classes.length; i < l; i++) {
        cls = classes[i];
        if (!cls.prototype.options) {
            cls.prototype.options = defaultOptions;
        } else {
            cls.mergeOptions(defaultOptions);
        }
        cls.addInitHook(function () {
            if (this.options.contextmenu) {
                this._initContextMenu();
            }
        });
        cls.include(L.Mixin.ContextMenu);
    }
    return L.Map.ContextMenu;
});
(function () {
    var __onAdd = L.Polyline.prototype.onAdd,
        __onRemove = L.Polyline.prototype.onRemove,
        __bringToFront = L.Polyline.prototype.bringToFront;
    var PolylineExtremities = {
        SYMBOLS: {
            stopM: {
                'viewBox': '0 0 2 8',
                'refX': '1',
                'refY': '4',
                'markerUnits': 'strokeWidth',
                'orient': 'auto',
                'path': 'M 0 0 L 0 8 L 2 8 L 2 0 z'
            },
            squareM: {
                'viewBox': '0 0 8 8',
                'refX': '4',
                'refY': '4',
                'markerUnits': 'strokeWidth',
                'orient': 'auto',
                'path': 'M 0 0 L 0 8 L 8 8 L 8 0 z'
            },
            dotM: {
                'viewBox': '0 0 20 20',
                'refX': '10',
                'refY': '10',
                'markerUnits': 'strokeWidth',
                'orient': 'auto',
                'path': 'M 10, 10 m -7.5, 0 a 7.5,7.5 0 1,0 15,0 a 7.5,7.5 0 1,0 -15,0'
            },
            dotL: {
                'viewBox': '0 0 45 45',
                'refX': '22.5',
                'refY': '22.5',
                'markerUnits': 'strokeWidth',
                'orient': 'auto',
                'path': 'M 22.5, 22.5 m -20, 0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0'
            },
            arrowM: {
                'viewBox': '0 0 15 15',
                'refX': '5',
                'refY': '5',
                'markerHeight': '8',
                'markerWidth': '8',
                'markerUnits': 'strokeWidth',
                'orient': 'auto',
                'path': 'M 0 0 L 15 5 L 0 10 L 5 5 z'
            },
        },
        onAdd: function (map) {
            __onAdd.call(this, map);
            this._drawExtremities();
        },
        onRemove: function (map) {
            map = map || this._map;
            __onRemove.call(this, map);
        },
        bringToFront: function () {
            __bringToFront.call(this);
            this._drawExtremities();
        },
        _drawExtremities: function () {
            var pattern = this._pattern;
            this.showExtremities(pattern);
        },
        showExtremities: function (pattern) {
            this._pattern = pattern;
            if (!L.Browser.svg || typeof this._map === 'undefined') {
                return this;
            }
            if (!pattern) {
                if (this._patternNode && this._patternNode.parentNode)
                    this._map._pathRoot.removeChild(this._patternNode);
                return this;
            }
            var svg = this._map._pathRoot;
            var defsNode;
            if (L.DomUtil.hasClass(svg, 'defs')) {
                defsNode = svg.getElementById('defs');
            } else {
                L.DomUtil.addClass(svg, 'defs');
                defsNode = L.Path.prototype._createElement('defs');
                defsNode.setAttribute('id', 'defs');
                svg.appendChild(defsNode);
            }
            var id = 'pathdef-' + L.Util.stamp(this);
            this._path.setAttribute('stroke-linecap', 'butt');
            this._path.setAttribute('id', id);
            this._path.setAttribute('marker-end', 'url(#' + id + ')');
            var markersNode = L.Path.prototype._createElement('marker'),
                markerPath = L.Path.prototype._createElement('path'),
                symbol = PolylineExtremities.SYMBOLS[pattern];
            markersNode.setAttribute('id', id);
            for (var attr in symbol) {
                if (attr != 'path') {
                    markersNode.setAttribute(attr, symbol[attr]);
                } else {
                    markerPath.setAttribute('d', symbol[attr]);
                }
            }
            var styleProperties = ['class', 'stroke', 'stroke-opacity'];
            for (var i = 0; i < styleProperties.length; i++) {
                var styleProperty = styleProperties[i];
                var pathProperty = this._path.getAttribute(styleProperty);
                markersNode.setAttribute(styleProperty, pathProperty);
            }
            markersNode.setAttribute('fill', markersNode.getAttribute('stroke'));
            markersNode.setAttribute('fill-opacity', markersNode.getAttribute('stroke-opacity'));
            markersNode.setAttribute('stroke-opacity', '0');
            markersNode.appendChild(markerPath);
            defsNode.appendChild(markersNode);
            return this;
        }
    };
    L.Polyline.include(PolylineExtremities);
    L.LayerGroup.include({
        showExtremities: function (pattern) {
            for (var layer in this._layers) {
                if (typeof this._layers[layer].showExtremities === 'function') {
                    this._layers[layer].showExtremities(pattern);
                }
            }
            return this;
        }
    });
})();
(function (window) {
    var HAS_HASHCHANGE = (function () {
        var doc_mode = window.documentMode;
        return ('onhashchange' in window) && (doc_mode === undefined || doc_mode > 7);
    })();
    L.Hash = function (map) {
        this.onHashChange = L.Util.bind(this.onHashChange, this);
        if (map) {
            this.init(map);
        }
    };
    L.Hash.parseHash = function (hash) {
        if (hash.indexOf('#') === 0) {
            hash = hash.substr(1);
        }
        var args = hash.split("/");
        if (args.length == 3) {
            var zoom = parseInt(args[0], 10),
                lat = parseFloat(args[1]),
                lon = parseFloat(args[2]);
            if (isNaN(zoom) || isNaN(lat) || isNaN(lon)) {
                return false;
            } else {
                return {
                    center: new L.LatLng(lat, lon),
                    zoom: zoom
                };
            }
        } else {
            return false;
        }
    };
    L.Hash.formatHash = function (map) {
        var center = map.getCenter(),
            zoom = map.getZoom(),
            precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));
        return "#" + [zoom, center.lat.toFixed(precision), center.lng.toFixed(precision)].join("/");
    }, L.Hash.prototype = {
        map: null,
        lastHash: null,
        parseHash: L.Hash.parseHash,
        formatHash: L.Hash.formatHash,
        init: function (map) {
            this.map = map;
            this.lastHash = null;
            this.onHashChange();
            if (!this.isListening) {
                this.startListening();
            }
        },
        removeFrom: function (map) {
            if (this.changeTimeout) {
                clearTimeout(this.changeTimeout);
            }
            if (this.isListening) {
                this.stopListening();
            }
            this.map = null;
        },
        onMapMove: function () {
            if (this.movingMap || !this.map._loaded) {
                return false;
            }
            var hash = this.formatHash(this.map);
            if (this.lastHash != hash) {
                location.replace(hash);
                this.lastHash = hash;
            }
        },
        movingMap: false,
        update: function () {
            var hash = location.hash;
            if (hash === this.lastHash) {
                return;
            }
            var parsed = this.parseHash(hash);
            if (parsed) {
                this.movingMap = true;
                this.map.setView(parsed.center, parsed.zoom);
                this.movingMap = false;
            } else {
                this.onMapMove(this.map);
            }
        },
        changeDefer: 100,
        changeTimeout: null,
        onHashChange: function () {
            if (!this.changeTimeout) {
                var that = this;
                this.changeTimeout = setTimeout(function () {
                    that.update();
                    that.changeTimeout = null;
                }, this.changeDefer);
            }
        },
        isListening: false,
        hashChangeInterval: null,
        startListening: function () {
            this.map.on("moveend", this.onMapMove, this);
            if (HAS_HASHCHANGE) {
                L.DomEvent.addListener(window, "hashchange", this.onHashChange);
            } else {
                clearInterval(this.hashChangeInterval);
                this.hashChangeInterval = setInterval(this.onHashChange, 50);
            }
            this.isListening = true;
        },
        stopListening: function () {
            this.map.off("moveend", this.onMapMove, this);
            if (HAS_HASHCHANGE) {
                L.DomEvent.removeListener(window, "hashchange", this.onHashChange);
            } else {
                clearInterval(this.hashChangeInterval);
            }
            this.isListening = false;
        }
    };
    L.hash = function (map) {
        return new L.Hash(map);
    };
    L.Map.prototype.addHash = function () {
        this._hash = L.hash(this);
    };
    L.Map.prototype.removeHash = function () {
        this._hash.removeFrom();
    };
})(window);
L.Control.MousePosition = L.Control.extend({
    options: {
        position: 'bottomleft',
        separator: ' : ',
        emptyString: 'Unavailable',
        lngFirst: false,
        numDigits: 5,
        lngFormatter: undefined,
        latFormatter: undefined,
        prefix: ""
    },
    onAdd: function (map) {
        this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
        L.DomEvent.disableClickPropagation(this._container);
        map.on('mousemove', this._onMouseMove, this);
        this._container.innerHTML = this.options.emptyString;
        return this._container;
    },
    onRemove: function (map) {
        map.off('mousemove', this._onMouseMove)
    },
    _onMouseMove: function (e) {
        var lng = this.options.lngFormatter ? this.options.lngFormatter(e.latlng.lng) : L.Util.formatNum(e.latlng.lng, this.options.numDigits);
        var lat = this.options.latFormatter ? this.options.latFormatter(e.latlng.lat) : L.Util.formatNum(e.latlng.lat, this.options.numDigits);
        var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
        var prefixAndValue = this.options.prefix + ' ' + value;
        this._container.innerHTML = prefixAndValue;
    }
});
L.Map.mergeOptions({
    positionControl: false
});
L.Map.addInitHook(function () {
    if (this.options.positionControl) {
        this.positionControl = new L.Control.MousePosition();
        this.addControl(this.positionControl);
    }
});
L.control.mousePosition = function (options) {
    return new L.Control.MousePosition(options);
};
L.ImageTransform = L.ImageOverlay.extend({
    initialize: function (url, anchors, options) {
        L.ImageOverlay.prototype.initialize.call(this, url, anchors, options);
        this.setAnchors(anchors);
    },
    setAnchors: function (anchors) {
        this._anchors = [];
        this._bounds = L.latLngBounds(anchors);
        for (var i = 0, len = anchors.length; i < len; i++) {
            var yx = anchors[i];
            this._anchors.push(L.latLng(yx));
        }
        if (this._map) {
            this._reset();
        }
    },
    _latLngToLayerPoint: function (latlng) {
        return this._map.project(latlng)._subtract(this._map.getPixelOrigin());
    },
    setClip: function (clipLatLngs) {
        var topLeft = this._latLngToLayerPoint(this._bounds.getNorthWest()),
            pixelClipPoints = [];
        this.options.clip = clipLatLngs;
        for (var p = 0; p < clipLatLngs.length; p++) {
            var mercPoint = this._latLngToLayerPoint(clipLatLngs[p]),
                pixel = L.ImageTransform.Utils.project(this._matrix3d_inverse, mercPoint.x - topLeft.x, mercPoint.y - topLeft.y);
            pixelClipPoints.push(L.point(pixel[0], pixel[1]));
        }
        this.setClipPixels(pixelClipPoints);
    },
    setClipPixels: function (pixelClipPoints) {
        this._clipDone = false;
        this._pixelClipPoints = pixelClipPoints;
        this._drawCanvas();
    },
    setUrl: function (url) {
        this._url = url;
        this._imgNode.src = this._url;
    },
    getClip: function () {
        return this.options.clip;
    },
    _imgLoaded: false,
    _initImage: function () {
        this._image = L.DomUtil.create('div', 'leaflet-image-layer');
        if (this._map.options.zoomAnimation && L.Browser.any3d) {
            L.DomUtil.addClass(this._image, 'leaflet-zoom-animated');
        } else {
            L.DomUtil.addClass(this._image, 'leaflet-zoom-hide');
        }
        this._imgNode = L.DomUtil.create('img');
        if (this.options.clip) {
            this._canvas = L.DomUtil.create('canvas', 'leaflet-canvas-transform');
            this._image.appendChild(this._canvas);
            this._canvas.style[L.DomUtil.TRANSFORM_ORIGIN] = '0 0';
            this._clipDone = false;
        } else {
            this._image.appendChild(this._imgNode);
            this._imgNode.style[L.DomUtil.TRANSFORM_ORIGIN] = '0 0';
            this._imgNode.style.display = 'none';
        }
        this._updateOpacity();
        this._imgLoaded = false;
        L.extend(this._imgNode, {
            galleryimg: 'no',
            onselectstart: L.Util.falseFn,
            onmousemove: L.Util.falseFn,
            onload: L.bind(this._onImageLoad, this),
            onerror: L.bind(this._onImageError, this),
            src: this._url
        });
    },
    _onImageError: function () {
        this.fire('error');
    },
    _onImageLoad: function () {
        if (this.options.clip) {
            this._canvas.width = this._imgNode.width;
            this._canvas.height = this._imgNode.height;
        } else {
            this._imgNode.style.display = 'inherit';
        }
        this._imgLoaded = true;
        this._reset();
        this.fire('load');
    },
    _reset: function () {
        if (this.options.clip && !this._imgLoaded) {
            return;
        }
        var div = this._image,
            imgNode = this.options.clip ? this._canvas : this._imgNode,
            topLeft = this._latLngToLayerPoint(this._bounds.getNorthWest()),
            size = this._latLngToLayerPoint(this._bounds.getSouthEast())._subtract(topLeft),
            anchors = this._anchors,
            w = imgNode.width,
            h = imgNode.height,
            pixels = [],
            i, len, p;
        for (i = 0, len = anchors.length; i < len; i++) {
            p = this._latLngToLayerPoint(anchors[i]);
            pixels.push(L.point(p.x - topLeft.x, p.y - topLeft.y));
        }
        L.DomUtil.setPosition(div, topLeft);
        div.style.width = size.x + 'px';
        div.style.height = size.y + 'px';
        var matrix3d = this._matrix3d = L.ImageTransform.Utils.general2DProjection(0, 0, pixels[0].x, pixels[0].y, w, 0, pixels[1].x, pixels[1].y, w, h, pixels[2].x, pixels[2].y, 0, h, pixels[3].x, pixels[3].y);
        if (!matrix3d[8]) {
            return;
        }
        for (i = 0; i !== 9; ++i) {
            matrix3d[i] = matrix3d[i] / matrix3d[8];
        }
        this._matrix3d_inverse = L.ImageTransform.Utils.adj(matrix3d);
        imgNode.style[L.DomUtil.TRANSFORM] = this._getMatrix3dCSS(this._matrix3d);
        if (this.options.clip) {
            if (this._pixelClipPoints) {
                this.options.clip = [];
                for (p = 0; p < this._pixelClipPoints.length; p++) {
                    var mercPoint = L.ImageTransform.Utils.project(matrix3d, this._pixelClipPoints[p].x, this._pixelClipPoints[p].y);
                    this.options.clip.push(this._map.layerPointToLatLng(L.point(mercPoint[0] + topLeft.x, mercPoint[1] + topLeft.y)));
                }
                this._drawCanvas();
            } else {
                this.setClip(this.options.clip);
            }
        }
    },
    _getMatrix3dCSS: function (arr) {
        var css = 'matrix3d(';
        css += arr[0].toFixed(9) + ',' + arr[3].toFixed(9) + ', 0,' + arr[6].toFixed(9);
        css += ',' + arr[1].toFixed(9) + ',' + arr[4].toFixed(9) + ', 0,' + arr[7].toFixed(9);
        css += ',0, 0, 1, 0';
        css += ',' + arr[2].toFixed(9) + ',' + arr[5].toFixed(9) + ', 0, ' + arr[8].toFixed(9) + ')';
        return css;
    },
    _clipDone: false,
    _drawCanvas: function () {
        if (!this._clipDone && this._imgNode) {
            var canvas = this._canvas,
                ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = ctx.createPattern(this._imgNode, 'no-repeat');
            ctx.beginPath();
            for (var i = 0, len = this._pixelClipPoints.length; i < len; i++) {
                var pix = this._pixelClipPoints[i];
                ctx[i ? 'lineTo' : 'moveTo'](pix.x, pix.y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = null;
            if (this.options.disableSetClip) {
                this._imgNode = null;
            }
            this._clipDone = true;
        }
    }
});
L.imageTransform = function (url, bounds, options) {
    return new L.ImageTransform(url, bounds, options);
};
L.DomUtil.TRANSFORM_ORIGIN = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'OTransformOrigin', 'MozTransformOrigin', 'msTransformOrigin']);
(function () {
    function adj(m) {
        return [m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4], m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5], m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]];
    }

    function multmm(a, b) {
        var c = Array(9);
        for (var i = 0; i !== 3; ++i) {
            for (var j = 0; j !== 3; ++j) {
                var cij = 0;
                for (var k = 0; k !== 3; ++k) {
                    cij += a[3 * i + k] * b[3 * k + j];
                }
                c[3 * i + j] = cij;
            }
        }
        return c;
    }

    function multmv(m, v) {
        return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
    }

    function basisToPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
        var m = [x1, x2, x3, y1, y2, y3, 1, 1, 1];
        var v = multmv(adj(m), [x4, y4, 1]);
        return multmm(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
    }
    L.ImageTransform.Utils = {
        general2DProjection: function (x1s, y1s, x1d, y1d, x2s, y2s, x2d, y2d, x3s, y3s, x3d, y3d, x4s, y4s, x4d, y4d) {
            var s = basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
            var d = basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
            return multmm(d, adj(s));
        },
        project: function (m, x, y) {
            var v = multmv(m, [x, y, 1]);
            return [v[0] / v[2], v[1] / v[2]];
        },
        adj: adj
    };
})();
(function (factory) {
    var L;
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory);
    } else if (typeof module !== 'undefined') {
        L = require('leaflet');
        module.exports = factory(L);
    } else {
        if (typeof window.L === 'undefined')
            throw 'Leaflet must be loaded first';
        factory(window.L);
    }
}(function (L) {
    "use strict";
    L.GeometryUtil = L.extend(L.GeometryUtil || {}, {
        distance: function (map, latlngA, latlngB) {
            return map.latLngToLayerPoint(latlngA).distanceTo(map.latLngToLayerPoint(latlngB));
        },
        distanceSegment: function (map, latlng, latlngA, latlngB) {
            var p = map.latLngToLayerPoint(latlng),
                p1 = map.latLngToLayerPoint(latlngA),
                p2 = map.latLngToLayerPoint(latlngB);
            return L.LineUtil.pointToSegmentDistance(p, p1, p2);
        },
        readableDistance: function (distance, unit) {
            var isMetric = (unit !== 'imperial'),
                distanceStr;
            if (isMetric) {
                if (distance > 1000) {
                    distanceStr = (distance / 1000).toFixed(2) + ' km';
                } else {
                    distanceStr = Math.ceil(distance) + ' m';
                }
            } else {
                distance *= 1.09361;
                if (distance > 1760) {
                    distanceStr = (distance / 1760).toFixed(2) + ' miles';
                } else {
                    distanceStr = Math.ceil(distance) + ' yd';
                }
            }
            return distanceStr;
        },
        belongsSegment: function (latlng, latlngA, latlngB, tolerance) {
            tolerance = tolerance === undefined ? 0.2 : tolerance;
            var hypotenuse = latlngA.distanceTo(latlngB),
                delta = latlngA.distanceTo(latlng) + latlng.distanceTo(latlngB) - hypotenuse;
            return delta / hypotenuse < tolerance;
        },
        length: function (coords) {
            var accumulated = L.GeometryUtil.accumulatedLengths(coords);
            return accumulated.length > 0 ? accumulated[accumulated.length - 1] : 0;
        },
        accumulatedLengths: function (coords) {
            if (typeof coords.getLatLngs == 'function') {
                coords = coords.getLatLngs();
            }
            if (coords.length === 0)
                return [];
            var total = 0,
                lengths = [0];
            for (var i = 0, n = coords.length - 1; i < n; i++) {
                total += coords[i].distanceTo(coords[i + 1]);
                lengths.push(total);
            }
            return lengths;
        },
        closestOnSegment: function (map, latlng, latlngA, latlngB) {
            var maxzoom = map.getMaxZoom();
            if (maxzoom === Infinity)
                maxzoom = map.getZoom();
            var p = map.project(latlng, maxzoom),
                p1 = map.project(latlngA, maxzoom),
                p2 = map.project(latlngB, maxzoom),
                closest = L.LineUtil.closestPointOnSegment(p, p1, p2);
            return map.unproject(closest, maxzoom);
        },
        closest: function (map, layer, latlng, vertices) {
            if (typeof layer.getLatLngs != 'function')
                layer = L.polyline(layer);
            var latlngs = layer.getLatLngs().slice(0),
                mindist = Infinity,
                result = null,
                i, n, distance;
            if (vertices) {
                for (i = 0, n = latlngs.length; i < n; i++) {
                    var ll = latlngs[i];
                    distance = L.GeometryUtil.distance(map, latlng, ll);
                    if (distance < mindist) {
                        mindist = distance;
                        result = ll;
                        result.distance = distance;
                    }
                }
                return result;
            }
            if (layer instanceof L.Polygon) {
                latlngs.push(latlngs[0]);
            }
            for (i = 0, n = latlngs.length; i < n - 1; i++) {
                var latlngA = latlngs[i],
                    latlngB = latlngs[i + 1];
                distance = L.GeometryUtil.distanceSegment(map, latlng, latlngA, latlngB);
                if (distance <= mindist) {
                    mindist = distance;
                    result = L.GeometryUtil.closestOnSegment(map, latlng, latlngA, latlngB);
                    result.distance = distance;
                }
            }
            return result;
        },
        closestLayer: function (map, layers, latlng) {
            var mindist = Infinity,
                result = null,
                ll = null,
                distance = Infinity;
            for (var i = 0, n = layers.length; i < n; i++) {
                var layer = layers[i];
                if (typeof layer.getLatLng == 'function') {
                    ll = layer.getLatLng();
                    distance = L.GeometryUtil.distance(map, latlng, ll);
                } else {
                    ll = L.GeometryUtil.closest(map, layer, latlng);
                    if (ll) distance = ll.distance;
                }
                if (distance < mindist) {
                    mindist = distance;
                    result = {
                        layer: layer,
                        latlng: ll,
                        distance: distance
                    };
                }
            }
            return result;
        },
        closestLayerSnap: function (map, layers, latlng, tolerance, withVertices) {
            tolerance = typeof tolerance == 'number' ? tolerance : Infinity;
            withVertices = typeof withVertices == 'boolean' ? withVertices : true;
            var result = L.GeometryUtil.closestLayer(map, layers, latlng);
            if (!result || result.distance > tolerance)
                return null;
            if (withVertices && typeof result.layer.getLatLngs == 'function') {
                var closest = L.GeometryUtil.closest(map, result.layer, result.latlng, true);
                if (closest.distance < tolerance) {
                    result.latlng = closest;
                    result.distance = L.GeometryUtil.distance(map, closest, latlng);
                }
            }
            return result;
        },
        interpolateOnPointSegment: function (pA, pB, ratio) {
            return L.point((pA.x * (1 - ratio)) + (ratio * pB.x), (pA.y * (1 - ratio)) + (ratio * pB.y));
        },
        interpolateOnLine: function (map, latLngs, ratio) {
            latLngs = (latLngs instanceof L.Polyline) ? latLngs.getLatLngs() : latLngs;
            var n = latLngs.length;
            if (n < 2) {
                return null;
            }
            if (ratio === 0) {
                return {
                    latLng: latLngs[0] instanceof L.LatLng ? latLngs[0] : L.latLng(latLngs[0]),
                    predecessor: -1
                };
            }
            if (ratio == 1) {
                return {
                    latLng: latLngs[latLngs.length - 1] instanceof L.LatLng ? latLngs[latLngs.length - 1] : L.latLng(latLngs[latLngs.length - 1]),
                    predecessor: latLngs.length - 2
                };
            }
            ratio = Math.max(Math.min(ratio, 1), 0);
            var maxzoom = map.getMaxZoom();
            if (maxzoom === Infinity)
                maxzoom = map.getZoom();
            var pts = [];
            var lineLength = 0;
            for (var i = 0; i < n; i++) {
                pts[i] = map.project(latLngs[i], maxzoom);
                if (i > 0)
                    lineLength += pts[i - 1].distanceTo(pts[i]);
            }
            var ratioDist = lineLength * ratio;
            var a = pts[0],
                b = pts[1],
                distA = 0,
                distB = a.distanceTo(b);
            var index = 1;
            for (; index < n && distB < ratioDist; index++) {
                a = b;
                distA = distB;
                b = pts[index];
                distB += a.distanceTo(b);
            }
            var segmentRatio = ((distB - distA) !== 0) ? ((ratioDist - distA) / (distB - distA)) : 0;
            var interpolatedPoint = L.GeometryUtil.interpolateOnPointSegment(a, b, segmentRatio);
            return {
                latLng: map.unproject(interpolatedPoint, maxzoom),
                predecessor: index - 2
            };
        },
        locateOnLine: function (map, polyline, latlng) {
            var latlngs = polyline.getLatLngs();
            if (latlng.equals(latlngs[0]))
                return 0.0;
            if (latlng.equals(latlngs[latlngs.length - 1]))
                return 1.0;
            var point = L.GeometryUtil.closest(map, polyline, latlng, false),
                lengths = L.GeometryUtil.accumulatedLengths(latlngs),
                total_length = lengths[lengths.length - 1],
                portion = 0,
                found = false;
            for (var i = 0, n = latlngs.length - 1; i < n; i++) {
                var l1 = latlngs[i],
                    l2 = latlngs[i + 1];
                portion = lengths[i];
                if (L.GeometryUtil.belongsSegment(point, l1, l2)) {
                    portion += l1.distanceTo(point);
                    found = true;
                    break;
                }
            }
            if (!found) {
                throw "Could not interpolate " + latlng.toString() + " within " + polyline.toString();
            }
            return portion / total_length;
        },
        reverse: function (polyline) {
            return L.polyline(polyline.getLatLngs().slice(0).reverse());
        },
        extract: function (map, polyline, start, end) {
            if (start > end) {
                return L.GeometryUtil.extract(map, L.GeometryUtil.reverse(polyline), 1.0 - start, 1.0 - end);
            }
            start = Math.max(Math.min(start, 1), 0);
            end = Math.max(Math.min(end, 1), 0);
            var latlngs = polyline.getLatLngs(),
                startpoint = L.GeometryUtil.interpolateOnLine(map, polyline, start),
                endpoint = L.GeometryUtil.interpolateOnLine(map, polyline, end);
            if (start == end) {
                var point = L.GeometryUtil.interpolateOnLine(map, polyline, end);
                return [point.latLng];
            }
            if (startpoint.predecessor == -1)
                startpoint.predecessor = 0;
            if (endpoint.predecessor == -1)
                endpoint.predecessor = 0;
            var result = latlngs.slice(startpoint.predecessor + 1, endpoint.predecessor + 1);
            result.unshift(startpoint.latLng);
            result.push(endpoint.latLng);
            return result;
        },
        isBefore: function (polyline, other) {
            if (!other) return false;
            var lla = polyline.getLatLngs(),
                llb = other.getLatLngs();
            return (lla[lla.length - 1]).equals(llb[0]);
        },
        isAfter: function (polyline, other) {
            if (!other) return false;
            var lla = polyline.getLatLngs(),
                llb = other.getLatLngs();
            return (lla[0]).equals(llb[llb.length - 1]);
        },
        startsAtExtremity: function (polyline, other) {
            if (!other) return false;
            var lla = polyline.getLatLngs(),
                llb = other.getLatLngs(),
                start = lla[0];
            return start.equals(llb[0]) || start.equals(llb[llb.length - 1]);
        },
        computeAngle: function (a, b) {
            return (Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI);
        },
        computeSlope: function (a, b) {
            var s = (b.y - a.y) / (b.x - a.x),
                o = a.y - (s * a.x);
            return {
                'a': s,
                'b': o
            };
        },
        rotatePoint: function (map, latlngPoint, angleDeg, latlngCenter) {
            var maxzoom = map.getMaxZoom();
            if (maxzoom === Infinity)
                maxzoom = map.getZoom();
            var angleRad = angleDeg * Math.PI / 180,
                pPoint = map.project(latlngPoint, maxzoom),
                pCenter = map.project(latlngCenter, maxzoom),
                x2 = Math.cos(angleRad) * (pPoint.x - pCenter.x) - Math.sin(angleRad) * (pPoint.y - pCenter.y) + pCenter.x,
                y2 = Math.sin(angleRad) * (pPoint.x - pCenter.x) + Math.cos(angleRad) * (pPoint.y - pCenter.y) + pCenter.y;
            return map.unproject(new L.Point(x2, y2), maxzoom);
        },
        bearing: function (latlng1, latlng2) {
            var rad = Math.PI / 180,
                lat1 = latlng1.lat * rad,
                lat2 = latlng2.lat * rad,
                lon1 = latlng1.lng * rad,
                lon2 = latlng2.lng * rad,
                y = Math.sin(lon2 - lon1) * Math.cos(lat2),
                x = Math.cos(lat1) * Math.sin(lat2) -
                Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
            var bearing = ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
            return bearing >= 180 ? bearing - 360 : bearing;
        },
        destination: function (latlng, heading, distance) {
            heading = (heading + 360) % 360;
            var rad = Math.PI / 180,
                radInv = 180 / Math.PI,
                R = 6378137,
                lon1 = latlng.lng * rad,
                lat1 = latlng.lat * rad,
                rheading = heading * rad,
                sinLat1 = Math.sin(lat1),
                cosLat1 = Math.cos(lat1),
                cosDistR = Math.cos(distance / R),
                sinDistR = Math.sin(distance / R),
                lat2 = Math.asin(sinLat1 * cosDistR + cosLat1 * sinDistR * Math.cos(rheading)),
                lon2 = lon1 + Math.atan2(Math.sin(rheading) * sinDistR * cosLat1, cosDistR - sinLat1 * Math.sin(lat2));
            lon2 = lon2 * radInv;
            lon2 = lon2 > 180 ? lon2 - 360 : lon2 < -180 ? lon2 + 360 : lon2;
            return L.latLng([lat2 * radInv, lon2]);
        }
    });
    return L.GeometryUtil;
}));

function getTileUrl(arg) {
    var url = 'http://gis.sinica.edu.tw/ccts/file-exists.php?img={arg}-png-{z}-{x}-{y}';
    return url.replace('{arg}', arg)
}
var cctsUrl = 'http://gis.sinica.edu.tw',
    mapletUrl = 'http://wcs.osgeo.cn:8088/service?',
    mapletLink = 'http://www.maplet.org/';
L.webdogConfig = {
    tileLayers: {
        base: {
            'qqStreet': {
                'type': "腾讯地图",
                'company': "qq",
                'name': '街道',
                'link': "http://map.qq.com",
                'url': 'http://rt{s}.map.gtimg.com/realtimerender?z={z}&x={x}&y={y}&type=vector&style=0',
                'subdomains': '012',
                getUrlArgs: function (tilePoint) {
                    return {
                        z: tilePoint.z,
                        x: tilePoint.x,
                        y: Math.pow(2, tilePoint.z) - 1 - tilePoint.y
                    };
                }
            },
            'qqTerrainSimple': {
                'type': "腾讯地图",
                'company': "qq",
                'name': '地形',
                'link': "http://map.qq.com",
                'url': 'http://p{s}.map.gtimg.com/demTiles/{z}/{x16}/{y16}/{x}_{y}.jpg',
                getUrlArgs: function (tilePoint) {
                    var y = Math.pow(2, tilePoint.z) - 1 - tilePoint.y;
                    return {
                        z: tilePoint.z,
                        x: tilePoint.x,
                        y: y,
                        x16: parseInt(tilePoint.x / 16),
                        y16: parseInt(y / 16)
                    };
                }
            },
            'qqTerrainStreet': {
                'type': "腾讯地图",
                'company': "qq",
                'name': '地形街道',
                'link': "http://map.qq.com",
                'url': 'http://p{s}.map.gtimg.com/demTiles/{z}/{x16}/{y16}/{x}_{y}.jpg',
                'url2': 'http://rt{s}.map.gtimg.com/tile?z={z}&x={x}&y={y}&type=vector&styleid=3&version=110',
                getUrlArgs: function (tilePoint) {
                    var y = Math.pow(2, tilePoint.z) - 1 - tilePoint.y;
                    return {
                        z: tilePoint.z,
                        x: tilePoint.x,
                        y: y,
                        x16: parseInt(tilePoint.x / 16),
                        y16: parseInt(y / 16)
                    };
                }
            },
            'qqSatellite': {
                'type': "腾讯地图",
                'company': "qq",
                'name': '卫星',
                'link': "http://map.qq.com",
                'url': 'http://p{s}.map.gtimg.com/sateTiles/{z}/{x16}/{y16}/{x}_{y}.jpg',
                getUrlArgs: function (tilePoint) {
                    var y = Math.pow(2, tilePoint.z) - 1 - tilePoint.y;
                    return {
                        z: tilePoint.z,
                        x: tilePoint.x,
                        y: y,
                        x16: parseInt(tilePoint.x / 16),
                        y16: parseInt(y / 16)
                    };
                }
            },
            'googleTerrainSimple': {
                'type': "谷歌地图",
                'company': "google",
                'name': '地形',
                'link': "http://ditu.google.cn",
                'url': 'http://mt{s}.google.cn/vt?pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e4!2st!3i132!2m3!1e0!2sr!3i285205865!3m14!2szh-CN!3sCN!5e18!12m1!1e63!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcy50OjN8cC52Om9mZixzLnQ6MXxwLnY6b2ZmLHMudDoyfHAudjpvZmY!4e0',
            },
            'googleStreet': {
                'type': "谷歌地图",
                'company': "google",
                'name': '街道',
                'link': "http://ditu.google.cn",
                'url': 'http://mt{s}.google.cn/vt/lyrs=m@167000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galil'
            },
            'googleTerrainStreet': {
                'type': "谷歌地图",
                'company': "google",
                'name': '地形街道',
                'link': "http://ditu.google.cn",
                'url': 'http://mt{s}.google.cn/vt/lyrs=t@128,r@176000000&hl=zh-CN&src=app&x={x}&y={y}&z={z}&s=Galil'
            },
            'googleSimple': {
                'type': "谷歌地图",
                'company': "google",
                'name': '简单',
                'link': "http://ditu.google.cn",
                'url': 'http://mt{s}.google.cn/vt?pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i285000000!3m14!2szh-CN!3sCN!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcy50OjN8cC52Om9mZixzLnQ6MXxwLnY6b2ZmLHMudDoyfHAudjpvZmY!4e0'
            },
            'googleSatellite': {
                'type': "谷歌地图",
                'company': "google",
                'name': '卫星',
                'link': "http://ditu.google.cn",
                'url': 'http://www.google.cn/maps/vt?lyrs=s@197&gl=cn&x={x}&y={y}&z={z}'
            },
            'tianDiTuTerrain': {
                'type': "天地图",
                'company': "tianditu",
                'name': '地形',
                'link': "http://www.tianditu.com/",
                'url': 'http://t{s}.tianditu.cn/DataServer?T=ter_w&X={x}&Y={y}&L={z}'
            },
            'tianDiTuTerrainStreet': {
                'type': "天地图",
                'company': "tianditu",
                'name': '地形街道',
                'link': "http://www.tianditu.com/",
                'url': 'http://t{s}.tianditu.cn/DataServer?T=ter_w&X={x}&Y={y}&L={z}',
                'url2': "http://t{s}.tianditu.cn/DataServer?T=cta_w&X={x}&Y={y}&L={z}"
            },
            'webdogColorLightGrey': {
                'type': "发现中国",
                'company': "webdog",
                'name': '浅灰色',
                'link': "http://www.webdog.cn",
                'url': '/static/image/white-256x256.jpg'
            },
            'webdogColorDarkGrey': {
                'type': "发现中国",
                'company': "webdog",
                'name': '深灰色',
                'link': "http://www.webdog.cn",
                'url': '/static/image/black-256x256.jpg'
            },
            'webdogColorBlue': {
                'type': "发现中国",
                'company': "webdog",
                'name': '蓝色',
                'link': "http://www.webdog.cn",
                'url': '/static/image/blue-256x256.jpg'
            },
            'webdogColorBrown': {
                'type': "发现中国",
                'company': "webdog",
                'name': '棕色',
                'link': "http://www.webdog.cn",
                'url': '/static/image/brown-256x256.jpg'
            }
        },
        high: {
            'cctsXiHan': {
                'type': "台湾中央研究院",
                'company': "ccts",
                'name': '西汉 7年',
                'link': cctsUrl,
                'maxZoom': 12,
                'url': getTileUrl('bc0007')
            },
            'cctsDongHan': {
                'type': "台湾中央研究院",
                'company': "ccts",
                'name': '东汉 140年',
                'link': cctsUrl,
                'maxZoom': 12,
                'url': getTileUrl('ad0140')
            },
            'cctsSanGuo': {
                'type': "台湾中央研究院",
                'company': "ccts",
                'name': '三国 262年',
                'link': cctsUrl,
                'maxZoom': 12,
                'url': getTileUrl('ad0262')
            },
            'cctsXiJin': {
                'type': "台湾中央研究院",
                'company': "ccts",
                'name': '西晋 281年',
                'link': cctsUrl,
                'maxZoom': 12,
                'url': getTileUrl('ad0281')
            },
            'cctsDongJin': {
                'type': "台湾中央研究院",
                'company': "ccts",
                'name': '东晋 382年',
                'link': cctsUrl,
                'maxZoom': 12,
                'url': getTileUrl('ad0382')
            },
            'cctsNanBeiChao': {
                'type': "台湾中央研究院",
                'company': "ccts",
                'name': '南北朝 497年',
                'link': cctsUrl,
                'maxZoom': 12,
                'url': getTileUrl('ad0497')
            },
            'cctsSui': {
                'type': "台湾中央研究院",
                'company': "ccts",
                'name': '隋代 612年',
                'link': cctsUrl,
                'maxZoom': 12,
                'url': getTileUrl('ad0612')
            },
            'cctsTang': {
                'type': "台湾中央研究院",
                'company': "ccts",
                'name': '唐代 741年',
                'link': cctsUrl,
                'maxZoom': 12,
                'url': getTileUrl('ad0741')
            },
            'cctsTangJiaoTong': {
                'type': "台湾中央研究院",
                'company': "ccts",
                'name': '唐代交通路线',
                'link': cctsUrl,
                'url': 'http://gis.sinica.edu.tw/googlemap/tang_jpg_7-12/{z}/{x}/IMG_{x}_{y}_{z}.jpg',
                'minZoom': 5,
                'maxZoom': 10,
                getUrlArgs: function (tilePoint) {
                    return {
                        z: 17 - tilePoint.z,
                        x: tilePoint.x,
                        y: tilePoint.y
                    };
                }
            },
            'cctsBeiSong': {
                'type': "台湾中央研究院",
                'company': "ccts",
                'name': '北宋 1111年',
                'link': cctsUrl,
                'maxZoom': 12,
                'url': getTileUrl('ad1111')
            },
            'cctsNanSong': {
                'type': "台湾中央研究院",
                'company': "ccts",
                'name': '南宋 1208年',
                'link': cctsUrl,
                'maxZoom': 12,
                'url': getTileUrl('ad1208')
            },
            'cctsYuan': {
                'type': "台湾中央研究院",
                'company': "ccts",
                'name': '元代 1330年',
                'link': cctsUrl,
                'url': getTileUrl('ad1330')
            },
            'cctsMing': {
                'type': "台湾中央研究院",
                'company': "ccts",
                'name': '明代 1582年',
                'link': cctsUrl,
                'maxZoom': 12,
                'url': getTileUrl('ad1582')
            },
            'cctsQing': {
                'type': "台湾中央研究院",
                'company': "ccts",
                'name': '清代 1820年',
                'link': cctsUrl,
                'maxZoom': 12,
                'url': getTileUrl('ad1820')
            },
            'cctsQingMo': {
                'type': "台湾中央研究院",
                'company': "ccts",
                'name': '清末 1903年',
                'link': cctsUrl,
                'maxZoom': 12,
                'url': getTileUrl('China_Map_1903')
            },
            'cctsMinChu': {
                'type': "台湾中央研究院",
                'company': "ccts",
                'name': '民初',
                'link': cctsUrl,
                'maxZoom': 12,
                'url': getTileUrl('spaper')
            },
            'cctsMinGuo1934': {
                'type': "台湾中央研究院",
                'company': "ccts",
                'name': '民国 1934年',
                'link': cctsUrl,
                'maxZoom': 12,
                'url': getTileUrl('ShunPao_Human_Geo')
            },
            'cctsMinGuoAdmin': {
                'type': "台湾中央研究院",
                'company': "ccts",
                'name': '民国政治区划',
                'link': cctsUrl,
                'maxZoom': 6,
                'url': getTileUrl('tile_ChinaAdmin')
            },
            'mapletXia': {
                'type': "Maplet地图画板",
                'company': "maplet",
                'name': '夏',
                'link': mapletLink,
                'url': mapletUrl,
                'wms': '0305'
            },
            'mapletShang': {
                'type': "Maplet地图画板",
                'company': "maplet",
                'name': '商',
                'link': mapletLink,
                'url': mapletUrl,
                'wms': '0306'
            },
            'mapletXiZhou': {
                'type': "Maplet地图画板",
                'company': "maplet",
                'name': '西周',
                'link': mapletLink,
                'url': mapletUrl,
                'wms': '0308'
            },
            'mapletChunQiu': {
                'type': "Maplet地图画板",
                'company': "maplet",
                'name': '春秋',
                'link': mapletLink,
                'url': mapletUrl,
                'wms': '030b'
            },
            'mapletZhanGuo': {
                'type': "Maplet地图画板",
                'company': "maplet",
                'name': '战国',
                'link': mapletLink,
                'url': mapletUrl,
                'wms': '0311'
            },
            'mapletQin': {
                'type': "Maplet地图画板",
                'company': "maplet",
                'name': '秦代',
                'link': mapletLink,
                'url': mapletUrl,
                'wms': '031f'
            },
            'mapletNanBeiChao449': {
                'type': "Maplet地图画板",
                'company': "maplet",
                'name': '南北朝 449年',
                'link': mapletLink,
                'url': mapletUrl,
                'wms': '0391'
            },
            'mapletNanBeiChao546': {
                'type': "Maplet地图画板",
                'company': "maplet",
                'name': '南北朝 546年',
                'link': mapletLink,
                'url': mapletUrl,
                'wms': '0393'
            },
            'mapletNanBeiChao572': {
                'type': "Maplet地图画板",
                'company': "maplet",
                'name': '南北朝 572年',
                'link': mapletLink,
                'url': mapletUrl,
                'wms': '0394'
            },
            'mapletTang669': {
                'type': "Maplet地图画板",
                'company': "maplet",
                'name': '唐代 669年',
                'link': mapletLink,
                'url': mapletUrl,
                'wms': '03db'
            },
            'mapletWuDaiShiGuo': {
                'type': "Maplet地图画板",
                'company': "maplet",
                'name': '五代十国 943年',
                'link': mapletLink,
                'url': mapletUrl,
                'wms': '0500'
            },
            'mapletMin1443': {
                'type': "Maplet地图画板",
                'company': "maplet",
                'name': '明代 1433年',
                'link': mapletLink,
                'url': mapletUrl,
                'wms': '0589'
            },
            'mapletCustom': {
                'type': "Maplet地图画板",
                'custom': true,
                'company': "maplet",
                'name': '自定义地图',
                'link': mapletLink,
                'url': mapletUrl,
                'wms': '{id}'
            },
            'webdogNull': {
                'type': "发现中国",
                'company': "webdog",
                'name': '无高级底图',
                'link': null,
                'url': null
            }
        }
    },
    defaultTitle: "未命名地图",
    defaultZoom: 4,
    defaultCenter: [31, 104],
    defaultTileLayer: {
        base: {
            'name': 'qqTerrainSimple'
        },
        high: {
            'name': 'webdogNull',
            'opacity': 0.8,
            'custom': null
        }
    },
    maxTreeDepth: 4,
    maxNodeNameLength: 16,
    colors: [["#FFC0CB", "#D87093", "#800080", "#4169E1", "#87CEFA", "#7FFFD4", "#ADFF2F", "#FFFFFF", "#FFEBCD", "#808080"], ["#DC143C", "#A52A2A", "#9370D8", "#1E90FF", "#00BFFF", "#90EE90", "#228B22", "#FFD700", "#A0522D", "#000000"]],
    defaultStyle: {
        'color': "#1E90FF",
        'markerColor': "#A52A2A",
        'opacity': 0.9,
        'fillColor': "#1E90FF",
        'fillOpacity': 0.4,
        'weight': 2,
        "dashArray": "1",
        "icon": 'text',
        'marker': 'text',
        'size': 'auto',
        'arrow': 0
    },
    icons: [{
        "name": "基础",
        "icons": ['text', 'capital', 'capital-1', 'province', 'province-1', 'city', 'city-1', 'county', 'county-1', 'triangle', 'circle-square', 'square', 'mountain', 'mountain-1', 'river', 'flag', 'flag-1', 'flag-2', 'star', 'heart', 'record', 'info', 'share', 'help', 'pin', 'attention-alt', 'cancel']
    }, {
        "name": "军事",
        "icons": ['castle', 'castle-1', 'castle-2', 'ancient-soldier', 'archer', 'cavalryman', 'cavalryman-1', 'cavalryman-2', 'soldier', 'wall', 'mountain-gun', 'tank', 'fire', 'fire-1', 'war']
    }, {
        "name": "现代",
        "icons": ['harbor', 'pencil', 'commerical-building', 'college', 'cinema', 'cafe', 'bus', 'belowground-rail', 'bicycle', 'basketball', 'bar', 'airport', 'aboveground-rail', 'tree', 'swimming', 'rail', 'prison', 'fast-food', 'ferry', 'fuel', 'garden', 'giraffe', 'grocery-store', 'library', 'lodging', 'monument', 'museum', 'town-hall', 'toilet', 'pitch', 'shop', 'school', 'restaurant', 'warehouse']
    }],
    showLevel: [{
        "min": 3,
        "max": 18,
        "size": "l"
    }, {
        "min": 5,
        "max": 18,
        "size": "m"
    }, {
        "min": 7,
        "max": 18,
        "size": "s"
    }, {
        "min": 9,
        "max": 18,
        "size": "xs"
    }],
    size: {
        'auto': 16,
        'xs': 12,
        's': 14,
        'm': 16,
        'l': 18,
        'xl': 22
    },
    times: '-1045,4,0,西周,武王,姬發,武王,-1041,22,0,西周,成王,姬誦,成王,-1019,25,0,西周,康王,姬釗,康王,-994,19,0,西周,昭王,姬瑕,昭王,-975,54,0,西周,穆王,姬滿,穆王,-921,23,0,西周,共王,姬繄扈,共王,-898,8,0,西周,懿王,姬囏,懿王,-890,6,0,西周,孝王,姬辟方,孝王,-884,8,0,西周,夷王,姬燮,夷王,-876,36,0,西周,厲王,姬胡,厲王,' + '-840,14,0,西周,厲王,姬胡,共和,-826,46,0,西周,宣王,姬靜,宣王,-780,11,0,西周,幽王,姬宫湦,幽王,-769,51,0,東周,平王,姬宜臼,平王,-718,23,0,東周,桓王,姬林,桓王,-695,15,0,東周,莊王,姬佗,莊王,-680,5,0,東周,釐王,姬胡齊,釐王,-675,25,0,東周,惠王,姬閬,惠王,-650,33,0,東周,襄王,姬鄭,襄王,-617,6,0,東周,頃王,姬壬臣,頃王,-611,6,0,東周,匡王,姬班,匡王,-605,21,0,東周,定王,姬瑜,定王,-584,14,0,東周,簡王,姬夷,簡王,-570,27,0,東周,靈王,姬泄心,靈王,-543,24,0,東周,景王,姬貴,景王,' + '-519,1,0,東周,悼王,姬勐,悼王,-518,44,0,東周,敬王,姬匄,敬王,-474,7,0,東周,元王,姬仁,元王,-467,27,0,東周,貞定王,姬介,貞定王,-440,1,0,東周,哀王-思王,姬去疾-姬叔,哀王-思王,-439,15,0,東周,考王,姬嵬,考王,-424,24,0,東周,威烈王,姬午,威烈王,-400,26,0,東周,安王,姬驕,安王,-374,7,0,東周,烈王,姬喜,烈王,-367,48,0,東周,顯王,姬扁,顯王,-319,6,0,東周,慎靚王,姬定,慎靚王,-313,59,0,東周,赧王,姬延,赧王,-254,5,51,戰國-秦,昭襄王,嬴則,昭襄王,-249,1,0,戰國-秦,孝文王,嬴柱,孝文王,-248,3,0,戰國-秦,莊襄王,嬴子楚,莊襄王,' + '-245,25,0,秦,嬴政,嬴政,嬴政,-220,12,0,秦,始皇帝,嬴政,始皇,-208,3,0,秦,二世皇帝,嬴胡亥,二世,-205,12,0,西漢,高帝,劉邦,高帝,-193,7,0,西漢,惠帝,劉盈,惠帝,-186,8,0,西漢,高后,呂雉,高后,-178,16,0,西漢,文帝,劉恆,文帝,-162,7,0,西漢,文帝,劉恆,後元,-155,7,0,西漢,景帝,劉啓,景帝,-148,6,0,西漢,景帝,劉啓,中元,-142,3,0,西漢,景帝,劉啓,後元,-139,6,0,西漢,武帝,劉徹,建元,-133,6,0,西漢,武帝,劉徹,元光,-127,6,0,西漢,武帝,劉徹,元朔,-121,6,0,西漢,武帝,劉徹,元狩,' + '-115,6,0,西漢,武帝,劉徹,元鼎,-109,6,0,西漢,武帝,劉徹,元封,-103,4,0,西漢,武帝,劉徹,太初,-99,4,0,西漢,武帝,劉徹,天漢,-95,4,0,西漢,武帝,劉徹,太始,-91,4,0,西漢,武帝,劉徹,征和,-87,2,0,西漢,武帝,劉徹,後元,-85,6,0,西漢,昭帝,劉弗陵,始元,-79,6,0,西漢,昭帝,劉弗陵,元鳳,-73,1,0,西漢,昭帝,劉弗陵,元平,-72,4,0,西漢,宣帝,劉詢,本始,-68,4,0,西漢,宣帝,劉詢,地節,-64,4,0,西漢,宣帝,劉詢,元康,-60,4,0,西漢,宣帝,劉詢,神爵,-56,4,0,西漢,宣帝,劉詢,五鳳,' + '-52,4,0,西漢,宣帝,劉詢,甘露,-48,1,0,西漢,宣帝,劉詢,黃龍,-47,5,0,西漢,元帝,劉奭,初元,-42,5,0,西漢,元帝,劉奭,永光,-37,5,0,西漢,元帝,劉奭,建昭,-32,1,0,西漢,元帝,劉奭,竟寧,-31,4,0,西漢,成帝,劉驁,建始,-27,4,0,西漢,成帝,劉驁,河平,-23,4,0,西漢,成帝,劉驁,陽朔,-19,4,0,西漢,成帝,劉驁,鴻嘉,-15,4,0,西漢,成帝,劉驁,永始,-11,4,0,西漢,成帝,劉驁,元延,-7,2,0,西漢,成帝,劉驁,綏和,-5,4,0,西漢,哀帝,劉欣,建平,-1,2,0,西漢,哀帝,劉欣,元壽,' + '1,5,0,西漢,平帝,劉衍,元始,6,2,0,西漢,孺子嬰,王莽攝政,居攝,8,1,0,西漢,孺子嬰,王莽攝政,初始,9,5,0,新,,王莽,始建國,14,6,0,新,,王莽,天鳳,20,3,0,新,,王莽,地皇,23,2,0,西漢,更始帝,劉玄,更始,25,31,0,東漢,光武帝,劉秀,建武,56,2,0,東漢,光武帝,劉秀,建武中元,58,18,0,東漢,明帝,劉莊,永平,76,8,0,東漢,章帝,劉炟,建初,84,3,0,東漢,章帝,劉炟,元和,87,2,0,東漢,章帝,劉炟,章和,89,16,0,東漢,和帝,劉肇,永元,105,1,0,東漢,和帝,劉肇,元興,' + '106,1,0,東漢,殤帝,劉隆,延平,107,7,0,東漢,安帝,劉祜,永初,114,6,0,東漢,安帝,劉祜,元初,120,1,0,東漢,安帝,劉祜,永寧,121,1,0,東漢,安帝,劉祜,建光,122,4,0,東漢,安帝,劉祜,延光,126,6,0,東漢,順帝,劉保,永建,132,4,0,東漢,順帝,劉保,陽嘉,136,6,0,東漢,順帝,劉保,永和,142,2,0,東漢,順帝,劉保,漢安,144,1,0,東漢,順帝,劉保,建康,145,1,0,東漢,沖帝,劉炳,永嘉,146,1,0,東漢,質帝,劉纘,本初,147,3,0,東漢,桓帝,劉志,建和,150,1,0,東漢,桓帝,劉志,和平,' + '151,2,0,東漢,桓帝,劉志,元嘉,153,2,0,東漢,桓帝,劉志,永興,155,3,0,東漢,桓帝,劉志,永壽,158,9,0,東漢,桓帝,劉志,延熹,167,1,0,東漢,桓帝,劉志,永康,168,4,0,東漢,靈帝,劉宏,建寧,172,5,0,東漢,靈帝,劉宏,熹平,178,6,0,東漢,靈帝,劉宏,光和,184,6,0,東漢,靈帝,劉宏,中平,190,4,0,東漢,獻帝,劉協,初平,194,2,0,東漢,獻帝,劉協,興平,196,24,0,東漢,獻帝,劉協,建安,220,1,0,東漢,獻帝,劉協,延康,220,7,0,三國-魏,文帝,曹丕,黃初,221,3,0,蜀漢,昭烈帝,劉備,章武,227,6,0,三國-魏,明帝,曹叡,太和,233,4,0,三國-魏,明帝,曹叡,青龍,' + '237,3,0,三國-魏,明帝,曹叡,景初,240,9,0,三國-魏,齊王,曹芳,正始,249,5,0,三國-魏,齊王,曹芳,嘉平,254,2,0,三國-魏,高貴鄉公,曹髦,正元,256,4,0,三國-魏,高貴鄉公,曹髦,甘露,260,4,0,三國-魏,元帝,曹奐,景元,264,1,0,三國-魏,元帝,曹奐,咸熙,223,15,0,蜀漢,後主,劉禪,建興,238,20,0,蜀漢,後主,劉禪,延熙,258,6,0,蜀漢,後主,劉禪,景耀,263,1,0,蜀漢,後主,劉禪,炎興,229,3,0,東吳,大帝,孫權,黃龍,232,6,0,東吳,大帝,孫權,嘉禾,238,14,0,東吳,大帝,孫權,赤烏,251,2,0,東吳,大帝,孫權,太元,265,10,0,西晉,武帝,司馬炎,泰始,275,5,0,西晉,武帝,司馬炎,咸寧,280,10,0,西晉,武帝,司馬炎,太康,290,10,0,西晉,武帝,司馬炎,太熙,300,1,0,西晉,惠帝,司馬衷,永康,301,1,0,西晉,惠帝,司馬衷,永寧,302,2,0,西晉,惠帝,司馬衷,太安,304,2,0,西晉,惠帝,司馬衷,永安,' + '306,1,0,西晉,惠帝,司馬衷,光熙,307,6,0,西晉,懷帝,司馬熾,永嘉,313,4,0,西晉,愍帝,司馬鄴,建興,317,1,0,東晉,元帝,司馬睿,建武,318,4,0,東晉,元帝,司馬睿,大興,322,1,0,東晉,元帝,司馬睿,永昌,323,3,0,東晉,明帝,司馬紹,太寧,326,9,0,東晉,成帝,司馬衍,咸和,335,8,0,東晉,成帝,司馬衍,咸康,343,2,0,東晉,康帝,司馬岳,建元,345,12,0,東晉,穆帝,司馬聃,永和,357,5,0,東晉,穆帝,司馬聃,升平,362,1,0,東晉,哀帝,司馬丕,隆和,363,3,0,東晉,哀帝,司馬丕,興寧,366,5,0,東晉,海西公,司馬奕,太和,' + '371,2,0,東晉,簡文帝,司馬昱,咸安,373,3,0,東晉,孝武帝,司馬曜,甯康,376,21,0,東晉,孝武帝,司馬曜,太元,397,5,0,東晉,安帝,司馬德宗,隆安,402,3,0,東晉,安帝,司馬德宗,元興,405,14,0,東晉,安帝,司馬德宗,義熙,419,1,0,東晉,恭帝,司馬德文,元熙,420,3,0,南朝:宋,武帝,劉裕,永初,423,2,0,南朝:宋,少帝,劉義符,景平,424,30,0,南朝:宋,文帝,劉義隆,元嘉,454,3,0,南朝:宋,孝武帝,劉駿,孝建,457,8,0,南朝:宋,孝武帝,劉駿,大明,465,1,0,南朝:宋,前廢帝,劉子業,永光,465,1,0,南朝:宋,前廢帝,劉子業,景和,' + '465,7,0,南朝:宋,明帝,劉彧,泰始,472,1,0,南朝:宋,明帝,劉彧,泰豫,473,5,0,南朝:宋,後廢帝,劉昱,元徽,477,3,0,南朝:宋,順帝,劉準,昇明,479,4,0,南朝:齊,高帝,蕭道成,建元,483,11,0,南朝:齊,武帝,蕭賾,永明,494,1,0,南朝:齊,欎林王,蕭昭業,隆昌,494,1,0,南朝:齊,海陵王,蕭昭文,延興,494,5,0,南朝:齊,明帝,蕭鸞,建武,498,1,0,南朝:齊,明帝,蕭鸞,永泰,499,3,0,南朝:齊,東昏侯,蕭寶,中興,501,2,0,南朝:齊,和帝,蕭寶融,中興,502,18,0,南朝:梁,武帝,蕭衍,天監,520,8,0,南朝:梁,武帝,蕭衍,普通,527,3,0,南朝:梁,武帝,蕭衍,大通,' + '529,6,0,南朝:梁,武帝,蕭衍,中大通,535,12,0,南朝:梁,武帝,蕭衍,大同,546,2,0,南朝:梁,武帝,蕭衍,中大同,547,3,0,南朝:梁,武帝,蕭衍,太清,550,2,0,南朝:梁,簡文帝,蕭綱,大寶,551,2,0,南朝:梁,豫章王,蕭棟,天正,552,4,0,南朝:梁,元帝,蕭繹,承聖,555,1,0,南朝:梁,貞陽侯,蕭淵明,天成,555,2,0,南朝:梁,敬帝,蕭方智,紹泰,556,2,0,南朝:梁,敬帝,蕭方智,太平,557,3,0,南朝:陳,武帝,陳霸先,太平,560,7,0,南朝:陳,文帝,陳蒨,天嘉,566,1,0,南朝:陳,文帝,陳蒨,天康,567,2,0,南朝:陳,廢帝,陳伯宗,光大,569,14,0,南朝:陳,宣帝,陳頊,太建,' + '583,4,0,南朝:陳,後主,陳叔寶,至德,587,3,0,南朝:陳,後主,陳叔寶,禎明,555,8,0,南朝:後梁,宣帝,蕭詧,大定,562,24,0,南朝:後梁,明帝,蕭巋,天保,586,2,0,南朝:後梁,莒公,蕭琮,廣運,386,11,0,北朝:北魏,道武帝,拓跋圭,登國,396,3,0,北朝:北魏,道武帝,拓跋圭,皇始,398,7,0,北朝:北魏,道武帝,拓跋圭,天興,404,6,0,北朝:北魏,道武帝,拓跋圭,天賜,409,5,0,北朝:北魏,明元帝,拓跋嗣,永興,414,3,0,北朝:北魏,明元帝,拓跋嗣,神瑞,416,8,0,北朝:北魏,明元帝,拓跋嗣,泰常,424,5,0,北朝:北魏,太武帝,拓跋燾,始光,428,4,0,北朝:北魏,太武帝,拓跋燾,神麚,432,3,0,北朝:北魏,太武帝,拓跋燾,延和,' + '435,6,0,北朝:北魏,太武帝,拓跋燾,太延,440,12,0,北朝:北魏,太武帝,拓跋燾,太平真君,451,2,0,北朝:北魏,太武帝,拓跋燾,正平,452,1,0,北朝:北魏,南安王,拓跋餘,承平,452,3,0,北朝:北魏,文成帝,拓跋浚,興安,454,2,0,北朝:北魏,文成帝,拓跋浚,興光,455,5,0,北朝:北魏,文成帝,拓跋浚,太安,460,6,0,北朝:北魏,文成帝,拓跋浚,和平,466,2,0,北朝:北魏,獻文帝,拓跋弘,天安,467,5,0,北朝:北魏,獻文帝,拓跋弘,皇興,471,6,0,北朝:北魏,教文帝,拓跋宏,延興,476,1,0,北朝:北魏,孝文帝,拓跋宏,承明,477,23,0,北朝:北魏,孝文帝,拓跋宏,太和,500,4,0,北朝:北魏,宣武帝,元恪,景明,504,5,0,北朝:北魏,宣武帝,元恪,正始,' + '508,5,0,北朝:北魏,宣武帝,元恪,永平,512,4,0,北朝:北魏,宣武帝,元恪,延昌,516,3,0,北朝:北魏,孝明帝,元詡,熙平,518,3,0,北朝:北魏,孝明帝,元詡,神龜,520,6,0,北朝:北魏,孝明帝,元詡,正光,525,3,0,北朝:北魏,孝明帝,元詡,孝昌,528,1,0,北朝:北魏,孝明帝,元詡,武泰,528,1,0,北朝:北魏,孝莊帝,元子攸,建義,528,3,0,北朝:北魏,孝莊帝,元子攸,永安,530,2,0,北朝:北魏,東海王,元曄,建明,531,2,0,北朝:北魏,節閔帝,元恭,普泰,531,2,0,北朝:北魏,安定王,元朗,中興,532,1,0,北朝:北魏,孝武帝,元修,太昌,532,1,0,北朝:北魏,孝武帝,元修,永興,532,3,0,北朝:北魏,孝武帝,元修,永熙,' + '534,4,0,北朝:東魏,孝靜帝,元善見,天平,538,2,0,北朝:東魏,孝靜帝,元善見,元象,539,4,0,北朝:東魏,孝靜帝,元善見,興和,543,8,0,北朝:東魏,孝靜帝,元善見,武定,535,17,0,北朝:西魏,文帝,元寶炬,大統,552,3,0,北朝:西魏,廢帝,元欽,大統,554,3,0,北朝:西魏,恭帝,元廓,大統,550,10,0,北朝:北齊,文宣帝,高洋,天保,560,1,0,北朝:北齊,廢帝,高殷,乾明,560,2,0,北朝:北齊,孝昭帝,高演,皇建,561,2,0,北朝:北齊,武成帝,高湛,太寧,562,4,0,北朝:北齊,武成帝,高湛,河清,565,5,0,北朝:北齊,溫公,高緯,天統,570,7,0,北朝:北齊,溫公,高緯,武平,576,2,0,北朝:北齊,溫公,高緯,隆化,' + '576,1,0,北朝:北齊,安德王,高延宗,德昌,577,1,0,北朝:北齊,幼主,高恆,承光,557,1,0,北朝:北周,閔帝,宇文覺,空,557,2,0,北朝:北周,明帝,宇文毓,空,559,2,0,北朝:北周,明帝,宇文毓,武成,561,5,0,北朝:北周,武帝,宇文邕,保定,566,7,0,北朝:北周,武帝,宇文邕,天和,572,7,0,北朝:北周,武帝,宇文邕,建德,578,1,0,北朝:北周,武帝,宇文邕,宣政,579,1,0,北朝:北周,宣帝,宇文贇,大成,579,2,0,北朝:北周,靜帝,宇文衍,大象,581,1,0,北朝:北周,靜帝,宇文衍,大定,581,20,0,隋,文帝,楊堅,開皇,601,4,0,隋,文帝,楊堅,仁壽,605,13,0,隋,煬帝,楊廣,大業,' + '617,2,0,隋,恭帝,楊侑,義寧,618,9,0,唐,高祖,李淵,武德,627,23,0,唐,太宗,李世民,貞觀,650,6,0,唐,高宗,李治,永徽,656,6,0,唐,高宗,李治,顯慶,661,3,0,唐,高宗,李治,龍朔,664,2,0,唐,高宗,李治,麟德,666,3,0,唐,高宗,李治,乾封,668,3,0,唐,高宗,李治,總章,670,5,0,唐,高宗,李治,咸亨,674,3,0,唐,高宗,李治,上元,676,4,0,唐,高宗,李治,儀鳳,679,2,0,唐,高宗,李治,調露,680,2,0,唐,高宗,李治,永隆,681,2,0,唐,高宗,李治,開耀,' + '682,2,0,唐,高宗,李治,永淳,683,1,0,唐,高宗,李治,弘道,684,1,0,唐,中宗,李顯,嗣聖,684,1,0,唐,睿宗,李旦,文明,684,1,0,武周,則天后,武曌,光宅,685,4,0,武周,則天后,武曌,垂拱,689,1,0,武周,則天后,武曌,永昌,689,2,0,武周,則天后,武曌,載初,690,3,0,武周,則天后,武曌,天授,692,1,0,武周,則天后,武曌,如意,692,3,0,武周,則天后,武曌,長壽,694,1,0,武周,則天后,武曌,延載,695,1,0,武周,則天后,武曌,證聖,695,2,0,武周,則天后,武曌,天冊萬歲,696,1,0,武周,則天后,武曌,萬歲登封,' + '696,2,0,武周,則天后,武曌,萬歲通天,697,1,0,武周,則天后,武曌,神功,698,3,0,武周,則天后,武曌,聖曆,700,1,0,武周,則天后,武曌,久視,701,1,0,武周,則天后,武曌,大足,701,4,0,武周,則天后,武曌,長安,705,1,0,武周,則天后,李顯,神龍,705,2,0,唐,中宗,李顯,神龍,707,4,0,唐,中宗,李顯,景龍,710,1,0,唐,溫王,李重茂,唐隆,710,2,0,唐,睿宗,李旦,景雲,712,1,0,唐,睿宗,李旦,太極,712,1,0,唐,睿宗,李旦,延和,712,2,0,唐,玄宗,李隆基,先天,713,29,0,唐,玄宗,李隆基,開元,' + '742,15,0,唐,玄宗,李隆基,天寶,756,3,0,唐,肅宗,李亨,至德,758,3,0,唐,肅宗,李亨,乾元,760,3,0,唐,肅宗,李亨,上元,762,2,0,唐,肅宗,李亨,寶應,763,2,0,唐,代宗,李豫,廣德,765,2,0,唐,代宗,李豫,永泰,766,14,0,唐,代宗,李豫,大曆,780,4,0,唐,德宗,李适,建中,784,1,0,唐,德宗,李适,興元,785,21,0,唐,德宗,李适,貞元,805,1,0,唐,順宗,李誦,永貞,806,15,0,唐,憲宗,李純,元和,821,4,0,唐,穆宗,李恆,長慶,825,3,0,唐,敬宗,李湛,寶曆,' + '827,9,0,唐,文宗,李昂,大和,836,5,0,唐,文宗,李昂,開成,841,6,0,唐,武宗,李炎,會昌,847,14,0,唐,宣宗,李忱,大中,860,15,0,唐,宣宗,李忱,咸通,874,6,0,唐,僖宗,李儇,乾符,880,2,0,唐,僖宗,李儇,廣明,881,5,0,唐,僖宗,李儇,中和,885,4,0,唐,僖宗,李儇,光啓,888,1,0,唐,僖宗,李儇,文德,889,1,0,唐,昭宗,李曄,龍紀,890,2,0,唐,昭宗,李曄,大順,892,2,0,唐,昭宗,李曄,景福,894,5,0,唐,昭宗,李曄,乾寧,898,4,0,唐,昭宗,李曄,光化,' + '901,4,0,唐,昭宗,李曄,天復,904,1,0,唐,昭宗,李曄,天祐,905,3,1,唐,昭宣帝,李柷,天祐,907,5,0,五代:梁,太祖,朱溫,開平,911,2,0,五代:梁,太祖,朱溫,乾化,913,1,0,五代:梁,庶人,朱友圭,鳳曆,913,3,2,五代:梁,末帝,朱友貞,乾化,915,7,0,五代:梁,末帝,朱友貞,貞明,921,3,0,五代:梁,末帝,朱友貞,龍德,923,4,0,五代:唐,莊宗,李存勗,同光,926,5,0,五代:唐,明宗,李嗣源,天成,930,4,0,五代:唐,明宗,李嗣源,長興,934,1,0,五代:唐,閔帝,李從厚,應順,934,3,0,五代:唐,潞王,李從珂,清泰,936,6,0,五代:晉,高祖,石敬瑭,天福,' + '942,2,6,五代:晉,出帝,石重貴,天福,944,3,0,五代:晉,出帝,石重貴,開運,947,12,0,五代:漢,高祖,劉知遠,天福,948,1,0,五代:漢,隱帝,劉承祐,乾祐,948,3,0,五代:漢,隱帝,劉承祐,乾祐,951,3,0,五代:周,太祖,郭威,廣順,954,1,0,五代:周,太祖,郭威,顯德,954,6,0,五代:周,世宗,柴榮,顯德,959,2,5,五代:周,恭帝,郭宗訓,顯德,960,4,0,北宋,太祖,趙匡胤,建隆,963,6,0,北宋,太祖,趙匡胤,乾德,968,9,0,北宋,太祖,趙匡胤,開寶,976,9,0,北宋,太宗,趙炅,太平興國,984,4,0,北宋,太宗,趙炅,雍熙,988,2,0,北宋,太宗,趙炅,端拱,' + '990,5,0,北宋,太宗,趙炅,淳化,995,3,0,北宋,太宗,趙炅,至道,998,6,0,北宋,真宗,趙恆,咸平,1004,4,0,北宋,真宗,趙恆,景德,1008,9,0,北宋,真宗,趙恆,大中祥符,1017,5,0,北宋,真宗,趙恆,天禧,1022,1,0,北宋,真宗,趙恆,乾興,1023,10,0,北宋,仁宗,趙禎,天聖,1032,2,0,北宋,仁宗,趙禎,明道,1034,5,0,北宋,仁宗,趙禎,景祐,1038,3,0,北宋,仁宗,趙禎,寶元,1040,2,0,北宋,仁宗,趙禎,康定,1041,8,0,北宋,仁宗,趙禎,慶曆,1049,6,0,北宋,仁宗,趙禎,皇祐,1054,3,0,北宋,仁宗,趙禎,至和,' + '1056,8,0,北宋,仁宗,趙禎,嘉祐,1064,4,0,北宋,英宗,趙曙,治平,1068,10,0,北宋,神宗,趙頊,熙寧,1078,8,0,北宋,神宗,趙頊,元豐,1086,9,0,北宋,哲宗,趙煦,元祐,1094,5,0,北宋,哲宗,趙煦,紹聖,1098,3,0,北宋,哲宗,趙煦,元符,1101,1,0,北宋,徽宗,趙佶,建中靖國,1102,5,0,北宋,徽宗,趙佶,崇寧,1107,4,0,北宋,徽宗,趙佶,大觀,1111,8,0,北宋,徽宗,趙佶,政和,1118,2,0,北宋,徽宗,趙佶,重和,1119,7,0,北宋,徽宗,趙佶,宣和,1126,2,0,北宋,欽宗,趙桓,靖康,1127,4,0,南宋,高宗,趙構,建炎,' + '1131,32,0,南宋,高宗,趙構,紹興,1163,2,0,南宋,孝宗,趙眘,隆興,1165,9,0,南宋,孝宗,趙眘,乾道,1174,16,0,南宋,孝宗,趙眘,淳熙,1190,5,0,南宋,光宗,趙惇,紹熙,1195,6,0,南宋,寧宗,趙擴,慶元,1201,4,0,南宋,寧宗,趙擴,嘉泰,1205,3,0,南宋,寧宗,趙擴,開禧,1208,17,0,南宋,寧宗,趙擴,嘉定,1225,3,0,南宋,理宗,趙昀,寶慶,1228,6,0,南宋,理宗,趙昀,紹定,1234,3,0,南宋,理宗,趙昀,端平,1237,4,0,南宋,理宗,趙昀,嘉熙,1241,12,0,南宋,理宗,趙昀,淳祐,1253,6,0,南宋,理宗,趙昀,寶祐,' + '1259,1,0,南宋,理宗,趙昀,開慶,1260,5,0,南宋,理宗,趙昀,景定,1265,10,0,南宋,度宗,趙禥,咸淳,1275,2,0,南宋,恭帝,趙㬎,德祐 ,1276,3,0,南宋,端宗,趙昰,景炎,1278,2,0,南宋,帝昺,趙昺,祥興,1271,24,7,元,世祖,孛兒只斤•忽必烈,至元,1295,3,0,元,成宗,孛兒只斤•鐵穆耳,元貞,1297,11,0,元,成宗,孛兒只斤•鐵穆耳,大德,1308,4,0,元,武宗,孛兒只斤•海山,至大,1312,2,0,元,仁宗,孛兒只斤•愛育黎拔力八達,皇慶,1314,7,0,元,仁宗,孛兒只斤•愛育黎拔力八達,延祐,1321,3,0,元,英宗,孛兒只斤•宗碩德八剌,至治,1324,5,0,元,泰定帝,孛兒只斤•也孫鐵木耳,泰定,1328,1,0,元,泰定帝,孛兒只斤•也孫鐵木耳,至和,' + '1328,1,0,元,幼主,孛兒只斤•阿速吉八,天順,1328,3,0,元,文宗,孛兒只斤•圖貼睦爾,天曆,1330,3,0,元,文宗,孛兒只斤•圖貼睦爾,至順,1333,3,0,元,惠宗,孛兒只斤•妥鏷貼睦爾,元統,1335,6,0,元,惠宗,孛兒只斤•妥鏷貼睦爾,至元,1341,28,0,元,惠宗,孛兒只斤•妥鏷貼睦爾,至正,1368,31,0,明,太祖,朱元璋,洪武,1399,4,0,明,惠帝,朱允溫,建文,1403,22,0,明,成祖,朱棣,永樂,1425,1,0,明,仁宗,朱高熾,洪熙,1426,10,0,明,宣宗,朱瞻基,宣德,1436,14,0,明,英宗,朱祁鎮,正統,1450,7,0,明,代宗,朱祁鈺,景泰,1457,8,0,明,英宗,朱祁鎮,天順,1465,23,0,明,憲宗,朱見深,成化,' + '1488,18,0,明,孝宗,朱祐樘,弘治,1506,16,0,明,武宗,朱厚照,正德,1522,45,0,明,世宗,朱厚熜,嘉靖,1567,6,0,明,穆宗,朱載垕,隆慶,1573,48,0,明,神宗,朱翊鈞,萬曆,1620,1,0,明,光宗,朱常洛,泰昌,1621,7,0,明,熹宗,朱由校,天啓,1628,17,0,明,毅宗,朱由檢,崇禎,1645,1,0,南明,安宗,朱由嵩,弘光,1646,1,1,南明,紹宗,朱聿鍵,隆武,1647,18,0,南明,昭宗,朱由榔,永曆,1645,17,1,清,世祖,愛新覺羅福臨,順治,1662,61,0,清,聖祖,愛新覺羅玄燁,康熙,1665,19,18,南明,,,永曆,1723,13,0,清,世宗,愛新覺羅胤禛,雍正,1736,60,0,清,高宗,愛新覺羅弘曆,乾隆,1796,25,0,清,仁宗,愛新覺羅顒琰,嘉慶,1821,30,0,清,宣宗,愛新覺羅旻寧,道光,1851,11,0,清,文宗,愛新覺羅奕詝,咸豐,' + '1862,13,0,清,穆宗,愛新覺羅載淳,同治,1875,34,0,清,德宗,愛新覺羅載湉,光緒,1909,3,0,清,,愛新覺羅溥儀,宣統,1912,16,0,中華民國,北洋,,民國,1928,9,16,中華民國,訓政,蔣中正,民國,1937,9,25,中華民國,抗戰,蔣中正,民國,1946,4,34,中華民國,內戰,蔣中正,民國',
    ossImageUrl: "http://webdog-user-image.img-cn-hangzhou.aliyuncs.com/",
    ossStaticUrl: "http://static.webdog.cn/",
    maxUploadFileSize: 1024 * 1024,
    timeline: {
        playSpeed: {
            value: 3,
            unit: 'h'
        }
    }
};
L.geoType = {
    'point': '标记',
    'polygon': '边界',
    'polyline': '线条'
};
L.WebdogMap = L.Map.extend({
    defaultMapJson: {
        title: "未命名地图",
        defaultTileLayer: L.webdogConfig.defaultTileLayer,
        showLevel: L.webdogConfig.showLevel,
        data: []
    },
    initialize: function (id, options) {
        this.mapJson = L.extend({}, this.defaultMapJson, options.mapJson);
        this.tileLayer = {};
        if (options.mini) {
            L.extend(options, this.getDefaultCenterZoom(id, options), {
                zoomControl: false,
                attributionControl: false,
                boxZoom: false,
                scrollWheelZoom: false,
                minZoom: 3,
                maxZoom: 18,
                doubleClickZoom: false,
                dragging: false,
                tap: false
            });
            L.Map.prototype.initialize.call(this, id, options);
            var showLevel = this.mapJson.showLevel;
            for (var i = 0; i < showLevel.length; i++) {
                showLevel[i].min = parseInt(showLevel[i].min) - 2;
                showLevel[i].max = parseInt(showLevel[i].max) + 2;
            }
            this.layerGroup = L.layerGroup.webdogGroup().addTo(this);
            this.createMiniMap(options);
        } else {
            L.extend(options, this.getDefaultCenterZoom(id, options), {
                minZoom: 3,
                maxZoom: 18,
                zoomControl: false,
                doubleClickZoom: false,
                contextmenu: true,
                contextmenuWidth: 140,
                contextmenuItems: []
            }, L.Hash.parseHash(location.hash));
            this.setLoading(true);
            L.Map.prototype.initialize.call(this, id, options);
            this.setDefaultTileLayer(this.mapJson.defaultTileLayer);
            this.hash = new L.Hash(this);
            this._initContextmenu();
            if (this.options.editable) {
                this.editor = L.webdogMap.editor(this);
                this.nodePanel = L.control.nodePanel(this);
                this.notSave = false;
            } else {
                this.editTools = new L.Editable(this);
            }
            this.layerGroup = L.layerGroup.webdogGroup().addTo(this);
            this.toolbar = L.control.rightToolbar().addTo(this);
            this.sidebar = L.control.leftSidebar().addTo(this);
            this.times = this._getTimes();
            this.timeline = null;
            this.timelineHeight = null;
            this._bindEvent();
            this.setLoading(false);
            $('[data-toggle="tooltip"]').tooltip({
                container: 'body'
            });
            if (this.options.editable && this.mapJson.title == '未命名地图') {
                this.setMapTitle();
            }
            if (!this.options.editable && this.mapJson.timeline && this.mapJson.timeline.open == true) {
                this.createTimeline();
            }
        }
    },
    _initContextmenu: function () {
        var map = this,
            contextmenu = this.contextmenu,
            setMenu = function (options) {
                var classes = [L.Marker, L.Polygon, L.Polyline];
                for (var i = 0; i < classes.length; i++) {
                    var cls = classes[i];
                    cls.mergeOptions(options);
                }
            };
        if (map.options.editable == true) {
            contextmenu.addItem({
                text: '建立标记',
                callback: function (e) {
                    map.editor.newLayer('point')
                }
            });
            contextmenu.addItem({
                text: '建立边界',
                callback: function (e) {
                    map.editor.newLayer('polygon')
                }
            });
            contextmenu.addItem({
                text: '建立线条',
                callback: function (e) {
                    map.editor.newLayer('polyline')
                }
            });
            contextmenu.addItem({
                separator: true
            });
            contextmenu.addItem({
                text: '粘贴',
                callback: function (e) {
                    map.editor.pasteLayer()
                }
            });
            contextmenu.addItem({
                separator: true
            });
            setMenu({
                contextmenu: true,
                contextmenuItems: [{
                    text: "编辑",
                    callback: function (e, layer) {
                        layer.fire('click');
                    }
                }, {
                    text: "复制",
                    callback: function (e, layer) {
                        map.copyLayer(layer)
                    }
                }, {
                    text: "删除",
                    callback: function (e, layer) {
                        map.editor.removeLayer(layer)
                    }
                }],
                contextmenuInheritItems: false
            });
        } else {
            setMenu({
                contextmenu: true,
                contextmenuItems: [{
                    text: "复制",
                    callback: function (e, layer) {
                        map.copyLayer(layer)
                    }
                }],
                contextmenuInheritItems: false
            });
        }
        contextmenu.addItem({
            text: '移动到这里',
            callback: function (e) {
                map.panTo(e.latlng)
            }
        });
        contextmenu.addItem({
            text: '放大',
            callback: function (e) {
                map.zoomIn()
            }
        });
        contextmenu.addItem({
            text: '缩小',
            callback: function (e) {
                map.zoomOut()
            }
        });
    },
    createTimeline: function () {
        this.timeline = L.timeline(this);
    },
    _bindEvent: function () {
        if (this.options.editable) {
            $("#map-save").click(this, function (e) {
                e.preventDefault();
                e.data.saveMap();
            });
            $("#map-public").click(this, function (e) {
                e.data.shareMap(this);
            });
            $(window).on('beforeunload', this, this.onWindowsClose);
        } else {
            $("#map-like").click(this, function (e) {
                e.data.likeOrfavoriteMap(this, 'like');
            });
            $("#map-favorite").click(this, function (e) {
                e.data.likeOrfavoriteMap(this, 'favorite');
            });
        }
        this.on('contextmenu.show', function (e) {
            this.onContextmenu(e);
        }, this);
    },
    createMiniMap: function (options) {
        var mapJson = this.mapJson;
        if (options.version == '1.0.0') {
            var defaultTileLayer = {
                base: {
                    name: mapJson.defaultTileLayer
                },
                high: mapJson.highTileLayer ? {
                    name: mapJson.highTileLayer,
                    opacity: mapJson.highTileLayerOpacity || 1,
                    custom: mapJson.highTileLayerCustom
                } : null
            };
            this.setDefaultTileLayer(defaultTileLayer);
            this.iteratesJson({
                children: mapJson.data
            }, -1, this.createV1MiniMap)
        } else {
            this.setDefaultTileLayer(mapJson.defaultTileLayer);
            this.iteratesJson({
                children: mapJson.data
            }, -1, this.createV2MiniMap)
        }
    },
    createV1MiniMap: function (json, level, map) {
        var geo = json.geo;
        if (geo) {
            var geoTypes = ['point', 'polygon', 'polyline'],
                layer, i, len;
            for (i = 0, len = geoTypes.length; i < len; i++) {
                var geoType = geoTypes[i];
                if (geo[geoType]) {
                    var coordinates = geo[geoType].coord;
                    switch (geoType) {
                    case "point":
                        switch (level) {
                        case 1:
                            var icon = json.geo[geoType].icon,
                                style = {
                                    marker: icon ? 'icon' : 'text',
                                    color: '#A52A2A',
                                    text: json.label,
                                    size: 'm',
                                    icon: icon
                                };
                            layer = L.marker(coordinates, {
                                icon: L.icon.textIcon(style)
                            });
                            layer._level = level;
                            layer._geoType = 'point';
                            map.layerGroup.addLayer(layer);
                            break;
                        case 2:
                            var icon = json.geo[geoType].icon,
                                style = {
                                    marker: icon ? 'icon' : 'text',
                                    color: '#000000',
                                    text: json.label,
                                    size: 'xs',
                                    icon: icon
                                };
                            layer = L.marker(coordinates, {
                                icon: L.icon.textIcon(style)
                            });
                            layer._level = level;
                            layer._geoType = 'point';
                            map.layerGroup.addLayer(layer);
                            break;
                        case 3:
                            var options = {
                                stroke: false,
                                radius: 2,
                                fillColor: "#4169E1",
                                fillOpacity: 0.2
                            };
                            layer = L.circleMarker(coordinates, options);
                            layer._level = level;
                            layer._geoType = 'point';
                            map.layerGroup.addLayer(layer);
                            break;
                        }
                        break;
                    case "polygon":
                        layer = L.polygon(coordinates, json.style);
                        layer._level = level;
                        layer._geoType = 'polygon';
                        map.layerGroup.addLayer(layer);
                        break;
                    case "polyline":
                        layer = L.polyline(coordinates, json.style);
                        layer._level = level;
                        layer._geoType = 'polyline';
                        map.layerGroup.addLayer(layer);
                        break;
                    }
                }
            }
        }
    },
    createV2MiniMap: function (json, level, map) {
        var layer, style;
        switch (json.type) {
        case "point":
            switch (level) {
            case 1:
                style = L.extend({}, json.style, {
                    color: '#A52A2A',
                    text: json.name,
                    size: 's'
                });
                layer = L.marker(L.GeoJSON.coordsToLatLng(json.coord), {
                    icon: L.icon.textIcon(style)
                });
                layer._level = level;
                layer._geoType = 'point';
                map.layerGroup.addLayer(layer);
                break;
            case 2:
                style = L.extend({}, json.style, {
                    text: json.name,
                    color: '#000000',
                    size: 'xs'
                });
                layer = L.marker(L.GeoJSON.coordsToLatLng(json.coord), {
                    icon: L.icon.textIcon(style)
                });
                layer._level = level;
                layer._geoType = 'point';
                map.layerGroup.addLayer(layer);
                break;
            case 3:
                var options = {
                    stroke: false,
                    radius: 2,
                    fillColor: "#4169E1",
                    fillOpacity: 0.2
                };
                layer = L.circleMarker(L.GeoJSON.coordsToLatLng(json.coord), options);
                layer._level = level;
                layer._geoType = 'point';
                map.layerGroup.addLayer(layer);
                break;
            }
            break;
        case "polygon":
            layer = L.polygon(L.GeoJSON.coordsToLatLngs(json.coord, 1), json.style);
            layer._geoType = 'polygon';
            layer._level = level;
            map.layerGroup.addLayer(layer);
            break;
        case "polyline":
            layer = L.polyline(L.GeoJSON.coordsToLatLngs(json.coord, 0), json.style);
            layer._geoType = 'polyline';
            layer._level = level;
            map.layerGroup.addLayer(layer);
            break;
        }
    },
    removeTimeline: function () {
        if (this.timeline) {
            this.timelineHeight = this.timeline.height;
            this.timeline.close().destroy();
            this.nodePanel.closePanel();
            this.timeline = null;
            this.mapJson.timeline.open = false
        }
    },
    saveMapJson: function () {
        var mapJson = this.mapJson;
        L.extend(mapJson, {
            id: this.options.id,
            title: this.sidebar.descPanel.vm.title,
            desc: $('#map-markdown-editor').val(),
            defaultTileLayer: {
                base: this.sidebar.tilelayerPanel.vm.baseTileLayer,
                high: this.sidebar.tilelayerPanel.vm.highTileLayer
            },
            data: this.getNodesData() || [],
            bbox: this.layerGroup.getBbox()
        });
        var settings = this.sidebar.settingPanel.vm;
        if (settings.defaultView == 'custom') {
            mapJson.defaultCenter = settings.defaultCenter;
            mapJson.defaultZoom = settings.defaultZoom;
        } else {
            delete mapJson.defaultCenter;
            delete mapJson.defaultZoom;
        }
        if (settings.showLevel != L.webdogConfig.showLevel) {
            mapJson.showLevel = settings.showLevel
        } else {
            delete mapJson.showLevel;
        }
        return mapJson
    },
    saveMap: function () {
        this.saveMapJson();
        var map = this;
        csrf = $("input[name='csrfmiddlewaretoken']").val();
        var kwargs = {
            data: JSON.stringify(this.mapJson),
            pk: this.options.id,
            csrfmiddlewaretoken: csrf
        };
        $.post('/map/save/', kwargs, function (data) {
            data = JSON.parse(data);
            if (data.status == 'success') {
                map.notSave = false;
                alert("保存成功！");
            } else if (data.status == 'error') {
                alert("保存失败！");
            }
        });
    },
    shareMap: function (button) {
        $.get('/map/public/', {
            pk: this.options.id,
            action: 'true'
        }, function (data) {
            data = JSON.parse(data);
            if (data.status == 'success') {
                alert("发布成功！");
                $(button).remove();
            } else if (data.status == 'error') {
                alert("发布失败！" + data.info);
            }
        });
    },
    setMapTitle: function () {
        var map = this,
            vm = new Vue({
                el: '#input-map-title',
                data: {
                    title: ""
                }
            });
        vm.$watch('title', function (val) {
            if (!val) {
                this.title = "未命名地图";
                return
            }
            map.sidebar.descPanel.vm.title = val;
            map.notSave = false;
        });
        $("#input-map-title").modal({
            backdrop: 'static'
        });
    },
    setLoading: function (loading) {
        var target = $("#map-loading");
        if (loading) {
            target.show("fast");
        } else {
            target.hide("slow");
        }
        if (typeof loading == 'number') {
            setTimeout(function (target) {
                return function () {
                    target.hide("slow");
                }
            }(target), loading);
        }
    },
    likeOrfavoriteMap: function (button, type) {
        var url, icon, emptyIcon, text;
        if (type == "like") {
            url = '/map/like/';
            icon = 'glyphicon-star';
            text = '已赞'
        } else {
            url = '/map/favorite/';
            icon = 'glyphicon-heart';
            text = '已收藏'
        }
        emptyIcon = icon + '-empty';
        $.get(url, {
            pk: this.options.id,
            action: 'true'
        }, function (data) {
            data = JSON.parse(data);
            if (data.status == 'success') {
                $(button).children('.' + emptyIcon).removeClass(emptyIcon).addClass(icon);
                $(button).children().last().text(text + "({count})".replace("{count}", data.count))
            } else if (data.status == 'error') {
                alert("发生了错误");
            }
        });
    },
    _getTimes: function () {
        var times = {},
            array = L.webdogConfig.times.split(','),
            num2ch = function (num) {
                var map = {
                    0: '',
                    1: '一',
                    2: '二',
                    3: '三',
                    4: '四',
                    5: '五',
                    6: '六',
                    7: '七',
                    8: '八',
                    9: '九',
                    10: '十'
                };
                if (num == 1) {
                    return "元"
                } else if (num <= 10) {
                    return map[num]
                } else if (num < 20) {
                    return map[10] + map[num % 10]
                } else if (num < 100) {
                    return map[parseInt(num / 10)] + map[10] + map[num % 10]
                } else {
                    return num
                }
            };
        for (var n = 0; n < array.length; n += 7) {
            array[n] -= 0;
            array[n + 1] -= 0;
            array[n + 2] -= 0;
        }
        for (var year = -1046; year < 2017; year++) {
            var i, j, c, ns, result = '',
                ob = array;
            for (i = 0; i < ob.length; i += 7) {
                j = ob[i];
                if (year < j || year >= j + ob[i + 1]) continue;
                ns = year - j + 1 + ob[i + 2];
                c = ob[i + 6] + num2ch(ns) + '年';
                result += (result ? ';' : '') + '[' + ob[i + 3] + ']' + ob[i + 4] + ' ' + ob[i + 5] + ' ' + c;
            }
            times[year] = result
        }
        return times
    },
    getNodesData: function () {
        var rootNode = this.sidebar.nodePanel.getRootNode(),
            data = this.sidebar.nodePanel.getNodeData(rootNode);
        return data.children
    },
    getDefaultCenterZoom: function (id, options) {
        var mapJson = options.mapJson;
        if (!mapJson) {
            return {
                center: L.webdogConfig.defaultCenter,
                zoom: L.webdogConfig.defaultZoom
            };
        } else if (mapJson.defaultCenter || mapJson.defaultZoom) {
            return {
                center: mapJson.defaultCenter || L.webdogConfig.defaultCenter,
                zoom: mapJson.defaultZoom || L.webdogConfig.defaultZoom
            }
        } else {
            var bounds = L.latLngBounds(mapJson.bbox),
                container = L.DomUtil.get(id);
            this._size = new L.Point(container.clientWidth, container.clientHeight);
            return {
                center: bounds.getCenter(),
                zoom: this.getBoundsZoom(bounds)
            }
        }
    },
    getActiveLayer: function () {
        return this.layerGroup.getActiveLayer()
    },
    activeLayer: function (layer) {
        this.layerGroup.activeLayer(layer);
        return this
    },
    resetActiveLayer: function () {
        this.layerGroup.resetActiveLayer();
    },
    resetLayers: function () {
        this.layerGroup.resetLayers();
    },
    panToLayer: function (layer) {
        var openedPanel = this.sidebar.getOpened(),
            offset = $("#" + openedPanel).width();
        if (layer._geoType == 'point') {
            var latlng = layer.getLatLng();
            if (openedPanel == 'map-desc-panel') {
                var point = this.latLngToLayerPoint(latlng);
                point.x -= offset / 2;
                latlng = this.layerPointToLatLng(point)
            }
            this.panTo(latlng);
        } else {
            var options = {};
            if (openedPanel == 'map-desc-panel') {
                options.paddingTopLeft = [offset, 0]
            }
            this.fitBounds(layer.getBounds(), options);
        }
        return this
    },
    iteratesJson: function (json, level, method) {
        level += 1;
        if (level > 3) {
            return
        }
        method(json, level, this);
        var children = json.children;
        if (children) {
            var i, len;
            for (i = 0, len = children.length; i < len; i++) {
                var childrenNode = children[i];
                this.iteratesJson(childrenNode, level, method);
            }
        }
    },
    onWindowsClose: function (e) {
        var map = e.data;
        if (map.notSave == true) {
            return "你还没有保存地图，是否关闭当前窗口？"
        }
    },
    onContextmenu: function (e) {
        if (!this.options.editable) {
            return
        } else if (e.relatedTarget || L.Util.hasStorage('clipBoard')) {
            this.contextmenu.setDisabled(4, false);
        } else {
            this.contextmenu.setDisabled(4, true);
        }
    },
    copyLayer: function (layer) {
        L.Util.setLocalStorage('clipBoard', this.sidebar.nodePanel.getNodeData(layer._node, true));
        return this
    },
    upload: function (callback) {
        $.getScripts({
            source: ['/static/jquery/html5upload/jquery.html5_upload.js'],
            condition: typeof $.fn.html5_upload != 'undefined',
            success: function () {
                var uploaded = false,
                    imageUrl = "";
                $('#image-insert-button').off();
                $.getJSON('/map/token/', function (data) {
                    var name = Math.uuid() + '.jpg',
                        key = data.dir + name,
                        url = L.webdogConfig.ossImageUrl + key;
                    $('#image-insert-link-group').show();
                    $('#image-upload-button').show();
                    $('#link-field').val("");
                    $("#link-note").val("");
                    $('#image-insert-upload-group progress').attr('value', 0);
                    $('#image-insert-upload-group').hide();
                    $('#image-insert .image-show').html("");
                    $('#image-insert').modal();
                    $("#upload-field").off().html5_upload({
                        url: data.host,
                        fieldName: 'file',
                        extraFields: {
                            name: name,
                            key: key,
                            policy: data.policy,
                            OSSAccessKeyId: data.accessid,
                            success_action_status: 200,
                            signature: data.signature
                        },
                        sendBoundary: window.FormData || $.browser.mozilla,
                        onStart: function (event, total) {
                            var file = this.files[0],
                                size = file.size || file.fileSize;
                            $('#image-insert-upload-group').show();
                            if (size > L.webdogConfig.maxUploadFileSize) {
                                $('#image-insert-upload-group span').text("上传文件的大小不能超过" + parseInt(L.webdogConfig.maxUploadFileSize / 1024) + 'KB');
                                return false
                            }
                            $('#image-insert-link-group').hide();
                            $('#image-upload-button').hide();
                            $('#image-insert-upload-group span').text('开始上传...');
                            return true;
                        },
                        setProgress: function (val) {
                            var progress = Math.ceil(val * 100);
                            $('#image-insert-upload-group span').text('上传进度: ' + progress + "%");
                            $('#image-insert-upload-group progress').attr('value', progress);
                        },
                        onFinish: function (event, response, name, number, total) {
                            $('#image-insert-upload-group span').text("上传完成");
                            uploaded = true;
                            imageUrl = key;
                        },
                        onError: function (event, name, error) {
                            $('#image-insert-upload-group span').text('上传文件发生错误！');
                        }
                    });
                });
                $('#image-insert-button').one('click', function (e) {
                    var note = $("#link-note").val();
                    if (uploaded == true) {
                        callback(imageUrl, note);
                    } else {
                        var val = $("#link-field").val(),
                            urlRegex = new RegExp('^((http|https)://|(mailto:)|(//))[a-z0-9]', 'i');
                        if (val !== null && val !== '' && val !== 'http://' && urlRegex.test(val)) {
                            var sanitizedLink = $('<div>' + val + '</div>').text();
                            callback(sanitizedLink, note);
                        }
                    }
                });
            }
        });
    }
});
L.webdogMap = function (id, options) {
    if (options.file) {
        var mapJson = L.Util.getMapStorage(options);
        if (!mapJson) {
            $.getJSON('/map/json/', {
                'pk': options.id
            }, function (data) {
                options.mapJson = JSON.parse(data.mapJson);
                var webdogMap = new L.WebdogMap(id, options);
                if (options.mini != true) {
                    L.webdogmap = webdogMap;
                }
                try {
                    L.Util.setMapStorage(data.mapJson, options);
                } catch (oException) {
                    window.localStorage.clear();
                    L.Util.setMapStorage(data.mapJson, options);
                }
            });
            //return
        } else {
            options.mapJson = mapJson;
        }
    }
    L.webdogmap = new L.WebdogMap(id, options);
};
L.Control.LeftSidebar = L.Control.Sidebar.extend({
    initialize: function (id, options) {
        L.Control.Sidebar.prototype.initialize(id, options);
        this._opened = null;
    },
    addTo: function (map) {
        L.Control.Sidebar.prototype.addTo(map);
        this.nodePanel = new L.Control.LeftSidebar.NodePanel(this);
        this.tilelayerPanel = new L.Control.LeftSidebar.TilelayerPanel(this);
        this.descPanel = new L.Control.LeftSidebar.DescPanel(this);
        this.searchPanel = new L.Control.LeftSidebar.SearchPanel(this);
        if (!this._map.options.editable) {
            this.commentPanel = new L.Control.LeftSidebar.CommentPanel(this);
        } else {
            this.settingPanel = new L.Control.LeftSidebar.SettingPanel(this);
        }
        return this
    },
    getOpened: function () {
        return $("#sidebar .sidebar-content >.active").attr('id');
    }
});
L.control.leftSidebar = function (options) {
    return new L.Control.LeftSidebar('sidebar', options);
};
L.Control.LeftSidebar.NodePanel = L.Class.extend({
    initialize: function (sidebar, options) {
        var map = sidebar._map;
        this._map = map;
        this._sidebar = sidebar;
        this.$nodeTree = $("#node-tree");
        this.treeName = 'nodeTree';
        this.$nodeTree.tree({
            nodePanel: this,
            treeName: this.treeName,
            data: this._map.mapJson.data,
            autoOpen: false,
            keyboardSupport: false,
            dragAndDrop: map.options.editable,
            openedIcon: "-",
            closedIcon: "+",
            onCreateLi: function (node, $li) {
                this.nodePanel.onCreateTreeLi(node, $li, this);
            }
        });
        this._bindEvent();
        if (map.options.editable) {
            this.createContextMenu();
        }
    },
    _bindEvent: function () {
        var nodePanel = this;
        nodePanel.$nodeTree.bind('tree.contextmenu', this, function (e) {
            e.data.contextmenuNode = e.node;
        });
        this.$nodeTree.on('tree.move', this._map, function (e) {
            nodePanel.onNodeMove(e);
        });
        this.$nodeTree.on('tree.click', this._map, function (e) {
            nodePanel.onNodeClick(e);
        });
        this.$nodeTree.on('tree.select', this._map, function (e) {
            nodePanel.onNodeSelect(e);
        });
        this._map.on('layer:select', function (e) {
            this.onLayerSelect(e.layer);
        }, this);
        this._map.on('layer:deselect', function (e) {
            this.onLayerDeselect(e.layer);
        }, this);
        this._map.on({
            'editable:drawing:commit': function (e) {
                if (e.layer._toolbar == 'measure' || e.layer._node) {
                    return
                }
                nodePanel.onEditCommit(e);
            },
            'nodePanel:changeName': function (e) {
                nodePanel.onEditName(e)
            }
        });
    },
    createContextMenu: function () {
        var map = this._map,
            nodePanel = this;
        newItems = function () {
            var node = nodePanel.contextmenuNode,
                menu = [{
                    text: '同级图层',
                    action: function (e) {
                        e.preventDefault();
                        var name = nodePanel.getNodeName();
                        if (name) {
                            nodePanel.createNode({
                                name: name
                            }, nodePanel.contextmenuNode);
                        }
                    }
                }];
            if (node.getLevel() < L.webdogConfig.maxTreeDepth) {
                menu.push({
                    text: '子图层',
                    action: function (e) {
                        e.preventDefault();
                        var name = nodePanel.getNodeName();
                        if (name) {
                            nodePanel.createNode(name, nodePanel.contextmenuNode, true);
                        }
                    }
                })
            }
            return menu
        };
        context.init();
        context.attach('#node-tree', [{
            text: '新建',
            subMenu: [{
                menu_item_src: newItems
            }]
        }, {
            divider: true
        }, {
            text: '移动',
            subMenu: [{
                icon: "glyphicon-arrow-up",
                text: '向上移动',
                action: function (e) {
                    e.preventDefault();
                    nodePanel.moveNode('before');
                }
            }, {
                divider: true
            }, {
                icon: "glyphicon-arrow-down",
                text: '向下移动',
                action: function (e) {
                    e.preventDefault();
                    nodePanel.moveNode('after');
                }
            }]
        }, {
            text: '删除',
            action: function (e) {
                e.preventDefault();
                if (confirm("是否删除元素？")) {
                    nodePanel.removeNode();
                }
            }
        }]);
    },
    getNodeName: function () {
        var name = prompt("新的元素名：");
        if (name && L.Util.validator(name) && (1 <= name.length <= L.webdogConfig.maxNodeNameLength)) {
            return name
        } else {
            alert('含有非法字符，只能包含中文字符、字母、数字、-《》——：:，最大长度16')
        }
    },
    createNode: function (data, targetNode, isChildren) {
        var node, layer = data.layer;
        targetNode = targetNode || this.contextmenuNode || this.getSelectedNode();
        if (!targetNode) {
            node = this.$nodeTree.tree('appendNode', data, this._map.rootNode);
        } else {
            if (isChildren == true) {
                node = this.$nodeTree.tree('appendNode', data, targetNode);
            } else {
                node = this.$nodeTree.tree('addNodeAfter', data, targetNode);
            }
        }
        if (layer) {
            layer._node = node;
            this._map.activeLayer(layer);
            this._map.layerGroup.addLayer(layer);
        }
        this.selectNode(node);
        this._map.notSave = true;
        return node
    },
    removeNode: function (node) {
        node = node || this.contextmenuNode;
        this._map.editor.changeEdit();
        this._map.fire('node:remove', {
            node: node
        });
        this._map.notSave = true;
        this.iteratesNode(node, this.removeNodeLayers);
        this.$nodeTree.tree('removeNode', node);
        this.contextmenuNode = null;
    },
    removeLayer: function (node) {
        delete node.layer;
        $(node.element).find(">div >.tool-icon").remove();
    },
    removeNodeLayers: function (node, nodePanel) {
        var layer = node.layer;
        if (layer) {
            nodePanel._map.layerGroup.removeLayer(layer);
        }
    },
    moveNode: function (action) {
        var node = this.contextmenuNode,
            siblingNode;
        if (action == "after") {
            siblingNode = node.getNextSibling();
        } else {
            siblingNode = node.getPreviousSibling();
        }
        if (siblingNode) {
            this.$nodeTree.tree('moveNode', node, siblingNode, action);
            this._map.notSave = true;
        }
    },
    editNode: function (node) {
        node = node || this.contextmenuNode;
        if (node.layer) {}
        this.selectNode(node);
    },
    copyNode: function (node) {},
    selectNode: function (node) {
        var $nodeTree = this.$nodeTree;
        if ($nodeTree.tree("getSelectedNode") != node) {
            $nodeTree.tree("selectNode", node);
        }
    },
    deselectNode: function (node) {
        var $nodeTree = this.$nodeTree;
        if ($nodeTree.tree("getSelectedNode") == node) {
            $nodeTree.tree("selectNode");
        }
    },
    iteratesNode: function (node, method) {
        method(node, this);
        var children = node.children,
            i, len;
        for (i = 0, len = children.length; i < len; i++) {
            var childrenNode = children[i];
            this.iteratesNode(childrenNode, method);
        }
    },
    getSelectedNode: function () {
        return this.$nodeTree.tree("getSelectedNode");
    },
    getNodeMaxLevel: function (node) {
        var maxLevel = node.getLevel();
        this.iteratesNode(node, function (node) {
            var level = node.getLevel();
            if (level > maxLevel) {
                maxLevel = level;
            }
        });
        return maxLevel
    },
    getRootNode: function () {
        return this.$nodeTree.tree('getTree');
    },
    getNodeData: function (node, notContainChildren) {
        var data = {
                'name': node.name
            },
            layer = node.layer,
            children = node.children;
        if (node.note) {
            data.note = node.note;
        }
        if (layer) {
            data.type = layer._geoType;
            data.coord = layer.toGeoJSON().geometry.coordinates;
            if ($.isEmptyObject(node.style) == false) {
                data.style = node.style;
            }
        }
        if (node.timeline) {
            data.timeline = node.timeline;
        }
        if (node.images) {
            data.images = node.images;
        }
        if (!notContainChildren && children.length) {
            data.children = [];
            for (var i = 0; i < children.length; i++) {
                var childrenNode = children[i];
                data.children.push(this.getNodeData(childrenNode));
            }
        }
        return data
    },
    onCreateTreeLi: function (node, $li, $tree) {
        var layer = node.layer,
            $element = $li.find('.jqtree-element');
        node._treeName = $tree.treeName;
        $element.css('padding-left', (node.getLevel() - 1) * 15 + "px");
        if (node.name.gbLength() > 5) {
            $element.children('.jqtree-title').text(node.name.truncateChars(8));
        }
        if (!node.style) {
            node.style = {}
        }
        if (!layer && node.type) {
            layer = node.layer = this._map.layerGroup.loadLayer(node);
        }
        if (typeof this.bindLayerEvent == 'function') {
            this.bindLayerEvent(layer);
        }
        if (layer) {
            $element.append('<span class="tool-icon tool-icon-{geoType} created float-right"></span>'.replace("{geoType}", layer._geoType));
        }
    },
    onEditCommit: function (e) {
        this.createNode({
            name: '新' + L.geoType[e.layer._geoType],
            layer: e.layer
        }, this.getSelectedNode());
    },
    onEditName: function (node) {
        $(node.element).find('.jqtree-title').text(node.name.truncateChars(8));
    },
    onNodeClick: function (e) {
        var node = e.node,
            layer = node.layer,
            map = this._map;
        if (node != this.getSelectedNode()) {
            if (!layer) {
                map.resetActiveLayer();
                return
            } else {
                map.panToLayer(layer);
                map.activeLayer(layer);
                map.closePopup();
                if (map.editor) {
                    map.editor.changeEdit(layer);
                }
            }
        } else {
            map.resetActiveLayer();
            map.closePopup();
            if (map.editor) {
                map.editor.changeEdit();
            }
        }
    },
    onLayerSelect: function (layer) {
        if (layer._node._treeName != this.treeName) {
            return
        }
        if (this.getSelectedNode() != layer._node) {
            this.selectNode(layer._node);
        }
    },
    onLayerDeselect: function (layer) {
        if (layer._node._treeName != this.treeName) {
            return
        }
        this.deselectNode(layer._node);
    },
    onNodeSelect: function (e) {
        var node = e.node;
        if (node) {
            this._map.fire('node:select', {
                node: e.node
            });
        } else {
            this._map.fire('node:deselect');
        }
    },
    onNodeMove: function (e) {
        e.preventDefault();
        var moveInfo = e.move_info,
            position = moveInfo.position,
            targetNode = moveInfo.target_node,
            movedNode = moveInfo.moved_node;
        if (position == "inside" || position == 'after') {
            var targetNodeLevel = targetNode.getLevel(),
                moveNodeLevel = movedNode.getLevel(),
                maxLevel = this.getNodeMaxLevel(movedNode),
                maxTreeDepth = L.webdogConfig.maxTreeDepth,
                after = position == 'after' ? 1 : 0;
            if (maxLevel - moveNodeLevel - after + targetNodeLevel >= maxTreeDepth) {
                alert("移动失败，地图元素的最大层级不能超过" + maxTreeDepth + "级");
                return
            }
        }
        e.move_info.do_move();
        if (movedNode.layer && movedNode.layer._geoType == 'point') {
            movedNode.layer.setLayerStyle();
        }
        this._map.notSave = true;
    }
});
L.Control.LeftSidebar.TilelayerPanel = L.Class.extend({
    initialize: function (sidebar) {
        this._sidebar = sidebar;
        this._map = sidebar._map;
        this.tileLayers = L.webdogConfig.tileLayers;
        this.vm = this._initVue();
        this._bindEvent();
        this.setTileLayerModel();
    },
    _bindEvent: function () {
        $("#map-tile-panel .tile-layer").click(this.onTilePanelClick);
        $(".modal-tilelayer").on('click', '.thumbnail', this, this.onTileModalClick);
    },
    _initVue: function () {
        var tilePanel = this,
            defaultTileLayer = tilePanel._map.mapJson.defaultTileLayer,
            baseTileLayer = defaultTileLayer.base,
            highTileLayer = defaultTileLayer.high,
            vm = new Vue({
                el: "#map-tile-panel",
                data: {
                    base: baseTileLayer.name,
                    high: highTileLayer.name,
                    opacity: highTileLayer.opacity,
                    custom: highTileLayer.custom
                },
                computed: {
                    baseCN: function () {
                        var baseTileLayer = tilePanel.tileLayers.base[this.base];
                        return baseTileLayer.type + ' - ' + baseTileLayer.name
                    },
                    highCN: function () {
                        var highTileLayer = tilePanel.tileLayers.high[this.high],
                            name = highTileLayer.type + ' - ' + highTileLayer.name;
                        if (this.high == 'mapletCustom' && this.custom) {
                            return name + ' ' + this.custom
                        } else {
                            return name
                        }
                        return name
                    },
                    baseImage: function () {
                        return tilePanel.getTileImage(this.base)
                    },
                    highImage: function () {
                        return tilePanel.getTileImage(this.high)
                    },
                    baseTileLayer: function () {
                        return {
                            name: this.base
                        }
                    },
                    highTileLayer: function () {
                        return {
                            name: this.high,
                            opacity: this.opacity,
                            custom: this.custom
                        }
                    }
                }
            });
        vm.$watch('opacity', function (val) {
            var highTileLayer = tilePanel._map.tileLayer.high;
            if (highTileLayer) {
                highTileLayer.setOpacity(val);
                tilePanel._map.notSave = true;
            }
        });
        return vm
    },
    getTileImage: function (val) {
        return '/static/image/{val}.jpg'.replace('{val}', val);
    },
    changeHighTile: function (name) {
        this._map.removeTileLayer(this.vm.high);
        this._map.setTileLayer({
            name: 'mapletCustom',
            opacity: this.vm.opacity,
            custom: name
        }, 'high');
        if (!this._map.options.editable) {
            this.vm.high = 'mapletCustom';
            this.vm.custom = name;
            $("#input-high-tilelayer .tab-pane .active").removeClass('active');
            $(".modal-tilelayer .thumbnail[data='mapletCustom']").addClass('active').find('.caption').text(name);
        }
    },
    onTilePanelClick: function (e) {
        if ($(this).hasClass('base-tile')) {
            $('#input-base-tilelayer').modal();
        } else {
            $('#input-high-tilelayer').modal();
        }
    },
    onTileModalClick: function (e) {
        var $target = $(this),
            tilePanel = e.data,
            map = tilePanel._map,
            type = $target.attr('type'),
            tileLayerName = $target.attr('data'),
            oldTileLayerName = tilePanel.vm[type];
        if (tileLayerName != oldTileLayerName || tileLayerName == "mapletCustom") {
            if (tileLayerName == "mapletCustom") {
                var custom = tilePanel.setCustomTile();
                if (custom == false) {
                    return
                } else {
                    tilePanel.vm.custom = custom;
                }
            } else {
                tilePanel.vm.custom = null;
            }
            tilePanel.vm[type] = tileLayerName;
            map.setLoading(800);
            map.removeTileLayer(oldTileLayerName);
            if (tileLayerName != 'webdogNull') {
                map.setTileLayer(tilePanel.vm[type + 'TileLayer'], type);
            }
            $("#input-" + type + "-tilelayer .tab-pane .active").removeClass('active');
            $target.addClass("active");
            map.notSave = true;
        }
    },
    setCustomTile: function () {
        var mapletID = prompt("输入四位maplet地图ID，如000a:", this.vm.custom || "");
        if (!mapletID) {
            return false
        }
        if (mapletID.search(/^[a-z0-9]{4}$/) == -1) {
            alert("你输入的ID格式不正确！");
            return false
        } else {
            $(".modal-tilelayer .thumbnail[data='mapletCustom'] .caption").text(mapletID);
            return mapletID
        }
    },
    setTileLayerModel: function () {
        this.setTileLayerDiv(this.tileLayers.base, 'base');
        this.setTileLayerDiv(this.tileLayers.high, 'high');
    },
    setTileLayerDiv: function (tileLayers, tileType) {
        for (var key in tileLayers) {
            var tileLayer = tileLayers[key],
                active;
            if (tileType == 'base') {
                active = key == this.vm.base ? "active" : "";
            } else {
                active = key == this.vm.high ? "active" : "";
            }
            var tileLayersDiv = $("#{type}-tile-{company} .row".format({
                'type': tileType,
                'company': tileLayer.company
            }));
            tileLayersDiv.append('<div class="col-md-3 col-sm-4"><div class="thumbnail {active}" type="{type}" data="{tileLayer}">\
                        <img src="/static/image/{tileLayer}.jpg">\
                        <div class="caption">{name}</div>\
                        </div></div>'.format({
                'name': tileLayer.name,
                'type': tileType,
                'active': active,
                'tileLayer': key
            }))
        }
    }
});
L.Control.LeftSidebar.DescPanel = L.Class.extend({
    initialize: function (sidebar) {
        this._sidebar = sidebar;
        this._map = sidebar._map;
        var descPanel = this;
        this._bindEvent();
        var renderer = new marked.Renderer();
        renderer.link = function (href, title, text) {
            return '<a href="{href}" target="_blank" title="{title}">{text}</a>'.format({
                href: href,
                title: title || text,
                text: text
            })
        };
        if (!this._map.options.editable) {
            renderer.image = function (href, title, text) {
                return '<a href="{href}" class="image-link" title="{title}"><img src="{href}@!viewer_mini" target="_blank" title="{title}"></a>'.format({
                    href: L.Util.getImageUrl(href),
                    title: title || text == '在这里输入图片标题' ? "" : text
                })
            };
        } else {
            renderer.image = function (href, title, text) {
                return '<img src="{href}@!viewer_mini" target="_blank" title="{title}">'.format({
                    href: L.Util.getImageUrl(href),
                    title: title || text == '在这里输入图片标题' ? "" : text
                })
            };
        }
        if (this._map.options.editable) {
            this.vm = this._initVue();
            this.markdownEditor = $("#map-markdown-editor").markdown({
                descPanel: this,
                language: 'zh',
                width: "100%",
                height: "400px",
                resize: 'vertical',
                autofocus: false,
                savable: false,
                hiddenButtons: ['Code', 'Image'],
                parser: function (val) {
                    return marked(val, {
                        breaks: true,
                        sanitize: true,
                        renderer: renderer
                    });
                },
                additionalButtons: [[{
                    name: "groupMisc",
                    data: [{
                        name: "cmdCenter",
                        toggle: false,
                        title: "插入地图中心",
                        icon: "glyphicon glyphicon-record",
                        callback: function (e) {
                            descPanel._cmdMapCenter(e);
                        }
                    }]
                }, {
                    name: "groupLink",
                    data: [{
                        name: "cmdInsertPic",
                        toggle: false,
                        title: "插入图片",
                        icon: "glyphicon glyphicon-picture",
                        callback: function (e) {
                            descPanel._cmdInsertImage(e);
                        }
                    }]
                }]],
                onFullscreen: function (e) {
                    descPanel.onFullscreen(e)
                },
                onFullscreenExit: function (e) {
                    descPanel.onFullscreenExit(e)
                },
                onChange: function (e) {
                    descPanel.onChange(e)
                }
            });
        } else {
            this._layerNameIndex = null;
            var val = $("#map-markdown-view").html();
            if (val) {
                window.setTimeout(function () {
                    $("#map-markdown-view").html(marked(val, {
                        breaks: true,
                        sanitize: true,
                        renderer: renderer
                    }));
                    descPanel._layerNameIndex = descPanel._getLayerNameIndex();
                    $("#map-markdown-view p").each(function () {
                        descPanel._addLayerLink(this);
                    });
                    $('#map-markdown-view [data-toggle="popover"]').popover({
                        container: 'body'
                    });
                    $("#map-markdown-view .image-link").magnificPopup({
                        type: 'image',
                        gallery: {
                            enabled: true
                        }
                    });
                }, 50);
            }
        }
    },
    _bindEvent: function () {
        if (!this._map.options.editable) {
            $("#map-markdown-view").on('click', 'ins', this, function (e) {
                var descPanel = e.data,
                    year = $(this).attr('year'),
                    layer = descPanel._layerNameIndex[this.innerText],
                    map = descPanel._map;
                if (year) {
                    $(this).tooltip('toggle');
                    return
                }
                if (layer) {
                    if (map.getActiveLayer() != layer) {
                        map.panToLayer(layer).activeLayer(layer);
                        layer.openPopup()
                    } else {
                        map.resetActiveLayer();
                        layer.closePopup()
                    }
                }
            });
        }
        $("#map-desc-panel").on('click', 'a', this, function (e) {
            var descPanel = e.data,
                map = descPanel._map,
                href = $(this).attr('href');
            if (href && href.search(/^#maplet\/\w{4}$/) != -1) {
                e.preventDefault();
                map.sidebar.tilelayerPanel.changeHighTile(href.replace('#maplet/', ""));
            }
        })
    },
    _initVue: function () {
        var map = this._map,
            vm = new Vue({
                el: "#map-desc-panel",
                data: {
                    title: map.mapJson.title,
                    desc: map.mapJson.desc
                }
            });
        vm.$watch('title', function (val) {
            if (!val) {
                this.title = "未命名图层";
                return
            } else if (L.Util.validator(val) == false) {
                alert("含有非法字符，只能包含中文字符、字母、数字、-《》——：:");
                return
            }
            document.title = val + " | 发现中国";
            map.notSave = true;
        });
        vm.$watch('desc', function (val) {
            map.notSave = true;
        });
        return vm
    },
    _getLayerNameIndex: function () {
        var index = {},
            layers = this._map.layerGroup.getLayers();
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i],
                name = layer._node.name;
            if (name != "新标记" && name != "新图层" && name != "新线条" && name != "新边界") {
                index[name] = layer
            }
        }
        return index
    },
    _replaceAll: function (text) {
        var descPanel = this;
        for (var key in this._layerNameIndex) {
            if (isNaN(key) == false) {
                continue
            }
            var reg = new RegExp(key, 'g');
            text = text.replace(reg, '<ins>' + key + '</ins>');
        }
        text = text.replace(/前{0,1}\d{1,4}年/g, function (times) {
            var year = times.match(/\d+/)[0];
            if (times[0] == '前') {
                year = '-' + year
            }
            return '<a style="color: inherit;text-decoration: underline" tabindex="0" role="button" ' + 'data-placement="top" data-toggle="popover" data-trigger="focus" data-content="{content}">{times}</a>'.format({
                year: year,
                times: times,
                content: descPanel._map.times[parseInt(year)]
            });
        });
        return text
    },
    _addLayerLink: function (element) {
        var descPanel = this;
        $(element).contents().each(function () {
            if (this.nodeType == 3) {
                $(this).replaceWith(descPanel._replaceAll(this.textContent));
            }
        });
    },
    onFullscreen: function (e) {
        var $editor = e.$editor;
        if (e.$isPreview == false) {
            e.showPreview();
        }
        e.enableButtons('all');
        e.hideButtons('Preview');
        e.$textarea.addClass('fullscreen-left');
        $editor.find('.md-control-fullscreen').hide();
        $editor.find('.md-header').addClass('fullscreen-left');
        $editor.find('.md-preview').addClass('fullscreen-right').css('cssText', 'border-left:1px solid #ddd!important');
    },
    onFullscreenExit: function (e) {
        var $editor = e.$editor;
        e.showButtons('Preview');
        e.hidePreview();
        e.$textarea.removeClass('fullscreen-left');
        $editor.find('.md-control-fullscreen').show();
        $editor.find('.md-header').removeClass('fullscreen-left');
        $editor.find('.md-preview').removeClass('fullscreen-right').css('border-left', '');
    },
    onChange: function (e) {
        if (e.$isFullscreen == true) {
            e.$editor.find('.md-preview').html(e.parseContent());
        }
    },
    _cmdMapCenter: function (e) {
        var selected = e.getSelection(),
            content = selected.text || "输入说明文字",
            center = this._map.getCenter();
        e.replaceSelection('[{content}]({hash})'.format({
            content: content,
            hash: "#{zoom}/{lat}/{lng}".format({
                zoom: this._map.getZoom(),
                lat: center.lat.toFixed(3),
                lng: center.lng.toFixed(3)
            })
        }));
        e.setSelection(selected.start + 1, selected.start + 1 + content.length)
    },
    _cmdInsertImage: function (e) {
        this._map.upload(function (link, note) {
            var chunk, cursor, selected = e.getSelection(),
                content = e.getContent();
            if (selected.length === 0) {
                chunk = e.__localize('enter image description here');
            } else {
                chunk = selected.text;
            }
            e.replaceSelection('![' + chunk + '](' + link + ' "' + (note || e.__localize('enter image title here')) + '")');
            cursor = selected.start + 2;
            e.setNextTab(e.__localize(note || 'enter image title here'));
            e.setSelection(cursor, cursor + chunk.length);
        });
    }
});
L.Control.LeftSidebar.SearchPanel = L.Class.extend({
    initialize: function (sidebar) {
        this._sidebar = sidebar;
        this._map = sidebar._map;
        this.$searchTree = $("#search-tree");
        this.treeName = 'searchTree';
        this.searchArea = 'local';
        this.$searchTree.tree({
            _sidebar: this._sidebar,
            treeName: this.treeName,
            autoOpen: false,
            keyboardSupport: false,
            dragAndDrop: false,
            openedIcon: "-",
            closedIcon: "+",
            useContextMenu: false,
            onCreateLi: function (node, $li) {
                this._sidebar.nodePanel.onCreateTreeLi.call(this._sidebar.searchPanel, node, $li, this);
            }
        });
        this._bindEvent();
    },
    _bindEvent: function () {
        this.$searchTree.on('tree.select', this, function (e) {
            var searchPanel = e.data,
                node = e.node;
            if (node) {
                searchPanel._map.panToLayer(node.layer);
            }
        });
        $("#map-search-panel button").click(this, this.onClearSearchResult);
        $("#map-search-panel input").change(this, this.onSwitchSearchArea);
        $("#nav-search").submit(this, this.onSearch);
    },
    bindLayerEvent: function (layer) {
        if (this._map.options.editable) {
            var content = (layer._node.note || "") + '<a href="#" action="add" style="display: inline-block" data={id}>添加到地图</a>'.replace("{id}", layer._leaflet_id);
            layer.bindPopup(L.layerPopup(layer, {
                content: content,
                onClick: this.onPopupClick
            }));
        }
    },
    onPopupClick: function (e) {
        $a = $(e.target);
        if ($a.attr('action') == 'add') {
            var map = e.data._map;
            leafletId = $a.attr('data');
            var rootNode = map.sidebar.searchPanel.$searchTree.tree('getTree');
            if (rootNode) {
                $.each(rootNode.children, function (i, node) {
                    if (node.layer._leaflet_id == leafletId) {
                        var nodePanel = map.sidebar.nodePanel,
                            newNodeData = L.extend({}, node, {
                                layer: null,
                                searchType: null
                            }),
                            newNode = nodePanel.createNode(newNodeData, nodePanel.getSelectedNode());
                        newNode.layer._map = map;
                        map.activeLayer(newNode.layer);
                        map.layerGroup.removeLayer(node.layer);
                        node.relNode = newNode;
                        node.layer = newNode.layer;
                        return
                    }
                });
            }
        }
    },
    onClearSearchResult: function (e) {
        var searchPanel = e ? e.data : this;
        if (searchPanel.$searchTree.searchArea == 'global' || searchPanel.$searchTree.searchArea == 'online') {
            searchPanel.removeSearchLayers();
        }
        $("#map-search-panel .search-info").text('请在顶部搜索栏输入关键词');
        searchPanel.$searchTree.tree('loadData', []);
    },
    onSwitchSearchArea: function (e) {
        var action = $(this).attr('name'),
            searchPanel = e.data,
            navSearch = $("#nav-search"),
            noteText;
        searchPanel.searchArea = action;
        switch (action) {
        case "local":
            noteText = "在这幅地图内搜索...";
            break;
        case "global":
            noteText = "在全站搜索...";
            break;
        case "online":
            noteText = "在现代地图中搜索...";
            break;
        }
        navSearch.find("input[placeholder]").attr("placeholder", noteText);
        navSearch.find("button").trigger("click");
    },
    onSearch: function (e) {
        e.preventDefault();
        var key = $("#nav-search input[placeholder]").val(),
            searchPanel = e.data,
            $searchTree = searchPanel.$searchTree,
            searchArea = searchPanel.searchArea;
        searchPanel.onClearSearchResult();
        searchPanel._sidebar.open('map-search-panel');
        if (!key) {
            $searchTree.tree('loadData', []);
            $("#map-search-panel .search-info").text('请在顶部搜索栏输入关键词');
        } else {
            switch (searchArea) {
            case "local":
                searchPanel.searchLocal(key);
                break;
            case "global":
                searchPanel.searchGlobal(key);
                break;
            case "online":
                searchPanel.searchOnline(key);
                break;
            }
        }
    },
    searchLocal: function (key) {
        var map = this._map,
            nodesData = [];
        map.layerGroup.eachLayer(function (layer) {
            var node = layer._node;
            if (!node.searchType && node.name && node.name.indexOf(key) != -1) {
                nodesData.push({
                    name: node.name,
                    type: node.type,
                    layer: node.layer,
                    relNode: node,
                    searchType: 'local'
                });
            }
        });
        this.setSearchResult(nodesData);
    },
    searchOnline: function (key) {
        var searchPanel = this,
            nodesData = [],
            queryString = ("http://apis.map.qq.com/ws/place/v1/search?boundary=region(中国,1)&keyword={key}&page_size=10" + "&page_index=1&orderby=_distance&key=LSSBZ-4W434-EECUG-DX634-UOUPS-6SFVT&output=jsonp&callback=?").replace("{key}", key),
            setData = function (i, item) {
                var name = item.title || item.fullname;
                if (name) {
                    nodesData.push({
                        name: name,
                        coord: [item.location.lng, item.location.lat],
                        type: 'point',
                        searchType: 'online'
                    });
                } else {
                    return
                }
            };
        $.getJSON(queryString, function (json) {
            if (json.count) {
                var data = json.data;
                $.each(data, setData);
                searchPanel.setSearchResult(nodesData);
            } else {
                queryString = ("http://apis.map.qq.com/ws/district/v1/search?&keyword={key}&key=LSSBZ-4W434-EECUG-DX634-UOUPS-6SFVT&output=jsonp&callback=?").replace("{key}", key);
                $.getJSON(queryString, function (json) {
                    if (json.result != [[]]) {
                        var data = json.result[0].slice(0, 20);
                        $.each(data, setData);
                        searchPanel.setSearchResult(nodesData);
                    }
                })
            }
        });
    },
    searchGlobal: function (key) {
        var searchPanel = this,
            queryString = ("/map/element/?key={key}").replace("{key}", key);
        $.getJSON(queryString, function (json) {
            var nodesData = [];
            if (json.status == "success") {
                var data = json.data;
                $.each(data, function (i, item) {
                    var node = {
                        name: item.element_name,
                        coord: [item.lng, item.lat],
                        map: {
                            name: item.map_name,
                            id: item.map_id,
                            user: item.map_user
                        },
                        type: 'point',
                        note: item.summary,
                        searchType: 'global'
                    };
                    nodesData.push(node);
                });
                searchPanel.setSearchResult(nodesData);
            }
        });
    },
    setSearchResult: function (nodesData) {
        var length = nodesData.length;
        if (length > 0) {
            this.$searchTree.tree('loadData', nodesData);
            $("#map-search-panel .search-info").text('搜索到{length}条相关结果'.replace("{length}", length));
            if (length == 1) {
                var rootNode = this.$searchTree.tree('getTree'),
                    node = rootNode.children[0];
                this.$searchTree.tree('selectNode', node);
            }
        } else {
            this.$searchTree.tree('loadData', []);
            $("#map-search-panel .search-info").text('没有相关搜索结果！');
        }
        this.$searchTree.searchArea = this.searchArea;
    },
    removeSearchLayers: function () {
        var map = this._map,
            rootNode = this.$searchTree.tree('getTree');
        if (rootNode) {
            $.each(rootNode.children, function (i, node) {
                if (!node.relNode) {
                    map.layerGroup.removeLayer(node.layer);
                }
            });
        }
    }
});
L.Control.LeftSidebar.CommentPanel = L.Class.extend({
    initialize: function (sidebar) {
        this._sidebar = sidebar;
        this._map = sidebar._map;
        this._bindEvent();
        this.commentsNumber = 0;
        this.getComments();
    },
    _bindEvent: function () {
        var commentsPanel = $("#map-comment-panel");
        commentsPanel.on("click", ".comment-reply-link", this, this.onReplyComment);
        commentsPanel.find(".btn-block").click(this, this.onMoreComment);
        commentsPanel.on("click", ".comment-reply button", this, this.onSubmitComment);
    },
    setComments: function (json, submitBtn, isMyComment) {
        var commentPanel = this,
            comments = json.comments,
            $commentPanel = $("#map-comment-panel"),
            moreCommentsBtn = $commentPanel.find(".more-comments"),
            commentsHtml = "",
            textarea = submitBtn ? submitBtn.attr("target") : null;
        $.each(comments, function (i, comment) {
            commentPanel.commentsNumber += 1;
            var parent = comment.parent,
                parentDiv = "",
                number = "我的回复",
                style = "";
            if (parent) {
                parentDiv = '<div class="comment-parent">\
                    <div class="comment-parent-content"><span>{content}</span></div>\
                    <div class="comment-parent-info">---- {user} {date}</div>\
                </div>'.format({
                    user: parent.user.username,
                    date: parent.add_date,
                    content: parent.content.safe()
                })
            }
            if (!submitBtn) {
                number = commentPanel.commentsNumber + "楼";
            }
            if (isMyComment == true) {
                style = "my-comment"
            }
            var html = '<div class="panel panel-default{style}">\
                            <div class="panel-body">\
                                <div class="head"><img class="user-head" data="{userId}" src="{head}"><div class="text-center"><span class="badge size12 not-bold">{level}级</span></div></div>\
                                <div class="comment">\
                                    <div class="comment-top"><span class="comment-user">{user}</span></div>\
                                    {parent}\
                                    <div class="comment-content">{content}</div>\
                                    <div class="comment-bottom">\
                                        <span class="comment-number">{number}</span> {add_date}\
                                        <span class="comment-reply-link" data="{id}"><span class="glyphicon glyphicon-share-alt"></span> 回复</span>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>'.format({
                id: comment.id,
                userId: comment.user.id,
                user: comment.user.username,
                head: comment.user.head || "/static/image/head.jpg",
                level: comment.user.level,
                add_date: comment.add_date,
                number: number,
                content: comment.content.replace(/<\/?[^>]*>/g, ''),
                parent: parentDiv,
                style: " " + style
            });
            commentsHtml += html;
        });
        if (textarea == "#comment-reply-textarea") {
            submitBtn.parents(".panel").after(commentsHtml);
        } else {
            if (json.is_more == true) {
                moreCommentsBtn.css("display", "block");
            } else {
                moreCommentsBtn.css("display", "none");
            }
            if (comments.length > 0) {
                commentPanel.lastComment = comments[comments.length - 1].id;
                $commentPanel.children(".map-comments").append(commentsHtml);
            }
        }
    },
    getComments: function () {
        var commentPanel = this;
        $.ajax({
            type: "GET",
            url: "/map/comment/",
            data: {
                map: commentPanel._map.options.id,
                comment: this.lastComment
            },
            async: false,
            success: function (str) {
                var json = JSON.parse(str);
                if (json.success) {
                    commentPanel.setComments(json);
                }
            },
            error: function (e) {
                console.log("getComment error")
            }
        });
    },
    onReplyComment: function (e) {
        var commentPanel = e.data,
            parentID = $(this).attr('data'),
            html;
        if (commentPanel._map.options.auth) {
            $("#comment-reply-textarea").parent().remove();
            html = '<div class="comment-reply">\
                        <textarea id="comment-reply-textarea" class="form-control" rows="3"></textarea>\
                        <button class="btn btn-default float-right" target="#comment-reply-textarea" data="{id}">回复</button>\
                    </div>'.replace("{id}", parentID);
        } else {
            $(".map-comments .no-login").remove();
            html = '<div class="text-center no-login">\
                        <div style="margin-bottom: 15px">登录后可以发表评论</div>\
                        <div>\
                            <a class="btn btn-default" href="/account/login/">登录</a>\
                            <a class="btn btn-default" href="/account/register/">注册</a>\
                        </div>\
                    </div>';
        }
        $(this).parent().append(html);
    },
    onSubmitComment: function (e) {
        e.preventDefault();
        var commentPanel = e.data,
            map = commentPanel._map,
            submitBtn = $(this),
            textarea = submitBtn.attr("target"),
            parentID = submitBtn.attr("data"),
            comment = $(textarea).val();
        if (comment.length > 1) {
            var csrf = $("input[name='csrfmiddlewaretoken']").val();
            $.ajax({
                type: "POST",
                url: "/map/comment/",
                data: {
                    pk: map.options.id,
                    parent: parentID,
                    comment: comment,
                    csrfmiddlewaretoken: csrf
                },
                async: false,
                success: function (str) {
                    var json = JSON.parse(str);
                    commentPanel.setComments(json, submitBtn, true);
                    if (textarea == "#map-comment-textarea") {
                        $(textarea).val("");
                    } else {
                        submitBtn.parent().remove();
                    }
                },
                error: function (str) {
                    alert("发表评论时发生了错误");
                }
            });
        }
    },
    onMoreComment: function (e) {
        var commentPanel = e.data;
        commentPanel.getComments();
    },
});
L.Control.LeftSidebar.SettingPanel = L.Class.extend({
    initialize: function (sidebar) {
        this._sidebar = sidebar;
        this._map = sidebar._map;
        this.vm = this._initVue();
        this._bindEvent();
    },
    _bindEvent: function () {
        $("#map-settings-panel input").on('keypress', function (e) {
            if (event.keyCode == "13") {
                e.preventDefault()
            }
        });
    },
    _initVue: function () {
        var settingPanel = this,
            map = settingPanel._map,
            showLevel = map.mapJson.showLevel || L.webdogConfig.showLevel,
            vm = new Vue({
                el: "#map-settings-panel",
                data: {
                    sizeOptions: [{
                        value: 'xl',
                        text: '最大'
                    }, {
                        value: 'l',
                        text: '大'
                    }, {
                        value: 'm',
                        text: '中'
                    }, {
                        value: 's',
                        text: '小'
                    }, {
                        value: 'xs',
                        text: '最小'
                    }],
                    timeline: 0,
                    defaultView: 'auto',
                    defaultCenter: map.mapJson.defaultCenter || L.webdogConfig.defaultCenter,
                    defaultZoom: map.mapJson.defaultZoom || L.webdogConfig.defaultZoom,
                    level1min: showLevel[0].min,
                    level1max: showLevel[0].max,
                    level1size: showLevel[0].size,
                    level2min: showLevel[1].min,
                    level2max: showLevel[1].max,
                    level2size: showLevel[1].size,
                    level3min: showLevel[2].min,
                    level3max: showLevel[2].max,
                    level3size: showLevel[2].size,
                    level4min: showLevel[3].min,
                    level4max: showLevel[3].max,
                    level4size: showLevel[3].size
                },
                computed: {
                    showLevel: function () {
                        var showLevel = [];
                        for (var i = 1; i <= 4; i++) {
                            var min = 'level' + i + 'min',
                                max = 'level' + i + 'max',
                                size = 'level' + i + 'size';
                            showLevel.push({
                                min: this[min],
                                max: this[max],
                                size: this[size]
                            });
                        }
                        return showLevel
                    }
                },
                methods: {
                    setDefaultZoom: function (e) {
                        e.preventDefault();
                        this.defaultZoom = map.getZoom();
                    },
                    setDefaultCenter: function (e) {
                        e.preventDefault();
                        var center = map.getCenter();
                        this.defaultCenter = [parseFloat(center.lat.toFixed(6)), parseFloat(center.lng.toFixed(6))];
                    }
                },
                watch: {
                    timeline: function (val) {
                        L.Util.activeInput("setting-timeline", val);
                        if (val == 0) {
                            map.removeTimeline();
                        } else {
                            map.createTimeline();
                        }
                    },
                    defaultView: function (val) {
                        L.Util.activeInput("setting-view", val);
                        if (val == 'auto') {
                            $("#map-settings-panel .setting-view").hide();
                        } else {
                            $("#map-settings-panel .setting-view").show();
                        }
                    },
                    defaultZoom: function (val, oldVal) {
                        if (!settingPanel._validatorLevel(val)) {
                            this.defaultZoom = oldVal;
                        }
                    },
                    level1min: function (val, oldVal) {
                        settingPanel._onLevelChanged('level1min', val, oldVal)
                    },
                    level1max: function (val, oldVal) {
                        settingPanel._onLevelChanged('level1max', val, oldVal)
                    },
                    level2min: function (val, oldVal) {
                        settingPanel._onLevelChanged('level2min', val, oldVal)
                    },
                    level2max: function (val, oldVal) {
                        settingPanel._onLevelChanged('level2max', val, oldVal)
                    },
                    level3min: function (val, oldVal) {
                        settingPanel._onLevelChanged('level3min', val, oldVal)
                    },
                    level3max: function (val, oldVal) {
                        settingPanel._onLevelChanged('level3max', val, oldVal)
                    },
                    level4min: function (val, oldVal) {
                        settingPanel._onLevelChanged('level4min', val, oldVal)
                    },
                    level4max: function (val, oldVal) {
                        settingPanel._onLevelChanged('level4max', val, oldVal)
                    },
                    showLevel: function (val, oldVal) {
                        if (val != oldVal) {
                            settingPanel._map.layerGroup.setShowLevel(val);
                            settingPanel._onSizeChanged(val);
                        }
                    }
                }
            });
        vm.timeline = (map.mapJson.timeline && map.mapJson.timeline.open) ? 1 : 0;
        vm.defaultView = map.mapJson.defaultCenter ? 'custom' : 'auto';
        return vm
    },
    _onLevelChanged: function (type, val, oldVal) {
        if (!this._validatorLevel(val)) {
            this.vm[type] = oldVal;
            return
        }
        if (type.indexOf('min') != -1) {
            var name = type.replace('min', 'max');
            if (val > this.vm[name]) {
                this.vm[name] = val;
            }
        } else {
            var name = type.replace('max', 'min');
            if (val < this.vm[name]) {
                this.vm[name] = val;
            }
        }
    },
    _onSizeChanged: function (val) {
        this._map.layerGroup.eachLayer(function (layer) {
            if (layer._geoType == 'point') {
                layer.setLayerStyle();
            }
        });
    },
    _validatorLevel: function (val) {
        return 3 <= val && val <= 18
    }
});
L.Control.RightToolbar = L.Control.extend({
    options: {
        position: 'topright'
    },
    onAdd: function (map) {
        this._map = map;
        L.control.mousePosition({
            position: "bottomright"
        }).addTo(map);
        L.control.scale({
            position: "bottomright",
            imperial: false
        }).addTo(map);
        this.initZoom();
        this.initTileImage();
        this.initMeasure();
        this.bindEvent();
        if (map.options.editable) {
            this.initCreateLayer();
        }
        return $("#right-toolbar")[0];
    },
    bindEvent: function () {
        this._map.on('editor:create', this.onCreateLayer, this);
        this._map.on('editable:drawing:commit', this.onCreatedLayer, this);
    },
    initZoom: function () {
        $("#toolbar-zoom-control .zoom").on('click', this, function (e) {
            e.preventDefault();
            var map = e.data._map;
            if ($(this).attr('data') == "plus") {
                map.zoomIn();
            } else {
                map.zoomOut();
            }
        });
    },
    initCreateLayer: function () {
        var map = this._map,
            tooltip = L.DomUtil.get('editable-tooltip');
        $("#toolbar-create-control button").click(this._map, function (e) {
            var map = e.data;
            e.geoType = $(this).attr("data");
            map.fire('editor:create', e);
        })
    },
    onCreateLayer: function () {
        this.disableCreateControl()
    },
    onCreatedLayer: function () {
        this.enableCreateControl()
    },
    enableCreateControl: function () {
        $("#toolbar-create-control button").removeClass("disabled");
    },
    disableCreateControl: function () {
        $("#toolbar-create-control button").addClass("disabled");
    },
    initTileImage: function () {
        if (!window.FileReader) {
            $("#tile-image-btn").parent().remove();
            return
        }
        var map = this._map,
            rightToolbar = this,
            tileImageBtn = $("#tile-image-btn");
        tileImageBtn.click(function () {
            if (tileImageBtn.children().hasClass('glyphicon-picture')) {
                $("#tile-image-input").trigger("click");
            } else {
                var title = '添加一个图片底图';
                map.removeLayer(rightToolbar.tileImage);
                rightToolbar.tileImageAnchorMarkers.map(function (marker) {
                    map.removeLayer(marker);
                });
                tileImageBtn.attr({
                    'title': title,
                    'data-original-title': title
                }).children().attr('class', 'glyphicon glyphicon-picture');
            }
        });
        tileImageBtn.parent().on('change', '#tile-image-input', function (e) {
            var reader = new FileReader(),
                file = this.files[0];
            if (!file) {
                return
            }
            reader.readAsDataURL(file);
            reader.onload = function (e) {
                var bounds = map.getBounds();
                if (!map.mapJson.tileImageAnchors) {
                    var newBounds = bounds.contract(0.2),
                        nw = newBounds.getNorthWest(),
                        ne = newBounds.getNorthEast(),
                        se = newBounds.getSouthEast(),
                        sw = newBounds.getSouthWest();
                    map.mapJson.tileImageAnchors = [[nw.lat, nw.lng], [ne.lat, ne.lng], [se.lat, se.lng], [sw.lat, sw.lng]];
                    map.notSave = true;
                } else {
                    var sw = L.latLng(map.mapJson.tileImageAnchors[3]),
                        ne = L.latLng(map.mapJson.tileImageAnchors[1]),
                        newBounds = L.latLngBounds(sw, ne);
                    if (bounds.contains(newBounds) == false) {
                        map.fitBounds(newBounds);
                    }
                }
                var updateAnchors = function () {
                    map.mapJson.tileImageAnchors = rightToolbar.tileImageAnchorMarkers.map(function (marker) {
                        return marker.getLatLng();
                    });
                    map.notSave = true;
                    rightToolbar.tileImage.setAnchors(map.mapJson.tileImageAnchors);
                };
                rightToolbar.tileImage = L.imageTransform(this.result, map.mapJson.tileImageAnchors, {
                    opacity: 0.5
                }).addTo(map);
                rightToolbar.tileImageAnchorMarkers = map.mapJson.tileImageAnchors.map(function (anchor) {
                    return L.marker(anchor, {
                        draggable: true
                    }).addTo(map).on('drag', updateAnchors);
                });
                $("#tile-image-input").remove();
                tileImageBtn.after('<input type="file" id="tile-image-input" accept="image/png, image/jpeg" style="display: none">');
            };
            var title = '移除图片底图';
            tileImageBtn.attr({
                'title': title,
                'data-original-title': title
            }).children().attr('class', 'glyphicon glyphicon-refresh');
        })
    },
    initMeasure: function () {
        var $measureBtn = $("#measure-tool-btn"),
            toolbar = this,
            map = this._map,
            measuring = false,
            marker, polyline;

        function onMeasure(e) {
            if (e.layer && e.layer != polyline) {
                return
            }
            var latlng = e.latlng;
            if (latlng) {
                if (!marker) {
                    marker = L.marker(latlng).addTo(map);
                }
            } else {
                var latlngs = polyline.getLatLngs();
                latlng = latlngs[latlngs.length - 1];
            }
            marker.setLatLng(latlng);
            if (polyline._latlngs.length != 0) {
                var length = (L.GeometryUtil.length(polyline) / 1000 + L.GeometryUtil.length(map.editTools.forwardLineGuide) / 1000).toFixed(2);
                marker.setIcon(L.divIcon({
                    className: 'measure-tooltip',
                    html: '<div>' + length + '千米</div>'
                }));
            } else {
                marker.setIcon(L.divIcon({
                    className: 'measure-tooltip',
                    html: "<div>点击起始地点</div>"
                }));
            }
        }

        function onCommit(e) {
            if (e.layer == polyline) {
                map.editTools.newClickHandler.off('move', onMeasure);
            }
        }
        $measureBtn.click(function () {
            if (measuring == false) {
                map.editTools.newClickHandler.on('move', onMeasure);
                map.on('editable:editing', onMeasure);
                map.on('editable:drawing:commit', onCommit);
                polyline = map.editTools.startPolyline();
                polyline.setStyle({
                    dashArray: 6,
                    color: '#DC143C'
                });
                polyline._toolbar = 'measure';
                toolbar.disableCreateControl();
                $measureBtn.attr({
                    'title': '移除测量工具',
                    'data-original-title': '移除测量工具'
                }).children().attr('class', 'glyphicon glyphicon-refresh');
                measuring = true;
            } else {
                if (polyline) {
                    map.removeLayer(polyline);
                    polyline = null;
                }
                if (marker) {
                    map.removeLayer(marker);
                    marker = null;
                }
                map.editTools.newClickHandler.off('move', onMeasure);
                map.off('editable:editing', onMeasure);
                map.off('editable:drawing:commit', onCommit);
                toolbar.enableCreateControl();
                measuring = false;
                $measureBtn.attr({
                    'title': '测量距离',
                    'data-original-title': '测量距离'
                }).children().attr('class', 'icon icon-ruler');
            }
        });
    }
});
L.control.rightToolbar = function (options) {
    return new L.Control.RightToolbar(options);
};
L.Icon.TextIcon = L.DivIcon.extend({
    sizeMap: L.webdogConfig.size,
    defaultIcon: L.webdogConfig.defaultStyle.icon,
    options: {
        marker: L.webdogConfig.defaultStyle.marker,
        color: L.webdogConfig.defaultStyle.markerColor,
        size: 16,
        icon: null,
        borderRadius: null,
        text: null,
        textMaxSize: 6,
        active: false,
        borderWidth: 2,
        padding: 3
    },
    initialize: function (options) {
        L.setOptions(this, options);
        options = this.options;
        var text = options.text || "",
            icon = options.icon || "",
            size = this.sizeMap[options.size],
            text = options.text || "",
            color = options.color,
            width, height, background, lineHeight, marginLeft, marginTop, borderRadius, boxShadow;
        switch (options.marker) {
        case "text":
            icon = "";
            break;
        case "icon":
            text = "";
            break;
        case "mix":
            icon = options.icon || this.defaultIcon;
            break;
        }
        if (text == "" && icon == "") {
            icon = 'star';
        }
        if (text) {
            text = text.truncateChars(options.textMaxSize);
            width = size * text.gbLength();
            height = lineHeight = size;
            marginTop = -height / 2 + 6;
            background = '';
            boxShadow = '';
            if (icon) {
                width = size * (options.text.gbLength() + 1);
                marginLeft = -size / 2 + 6;
                icon = '<i class="text-and-icon icon-' + options.icon + '"></i>'
            } else {
                marginLeft = -width / 2 + 6;
            }
        } else {
            var i = parseInt(size * 1.5);
            i = i % 2 == 0 ? i : i + 1;
            borderRadius = size;
            lineHeight = width = height = i;
            background = color;
            color = L.Util.contrastColor(color);
            icon = '<i class=" icon-' + icon + '"></i>';
            marginTop = marginLeft = -(width / 2 - 6);
            boxShadow = '1px 1px 1px #666666';
        }
        var css = {
            'width': width + 'px',
            'height': height + 'px',
            'color': color,
            'font-size': size + 'px',
            'line-height': lineHeight + 'px',
            'margin-left': marginLeft + 'px',
            'margin-top': marginTop + 'px',
            'background-color': background,
            'border-radius': borderRadius,
            'box-shadow': boxShadow,
            'text-shadow': text ? '1px 1px 1px {color}'.format({
                color: L.Util.contrastColor(color)
            }) : ""
        };
        if (options.active == true) {
            var offset = options.borderWidth * 2 + options.padding * 2;
            L.extend(css, {
                'width': width += offset,
                'height': height += offset,
                'margin-left': marginLeft -= offset / 2,
                'margin-top': marginTop -= offset / 2,
                'padding': options.padding + 'px',
                'border': options.borderWidth + 'px dashed ' + color,
                'border-radius': height
            });
        }
        options.html = $('<div>').css(css).append(icon + text).prop('outerHTML');
        options.className = 'leaflet-text-icon';
        options.popupAnchor = [0, -size / 2];
        L.DivIcon.prototype.initialize.call(this, options);
    },
    onAdd: function (map) {
        L.DivIcon.prototype.onAdd.call(this, map);
    }
});
L.icon.textIcon = function (options) {
    return new L.Icon.TextIcon(options);
};
L.TileLayer.WebDogTileLayer = L.TileLayer.extend({
    getTileUrl: function (tilePoint) {
        var urlArgs, getUrlArgs = this.options.getUrlArgs;
        if (getUrlArgs) {
            var urlArgs = getUrlArgs(tilePoint);
        } else {
            urlArgs = {
                z: tilePoint.z,
                x: tilePoint.x,
                y: tilePoint.y
            };
        }
        return L.Util.template(this._url, L.extend(urlArgs, this.options, {
            s: this._getSubdomain(tilePoint)
        }));
    }
});
L.tileLayer.webdogTileLayer = function (url, options) {
    return new L.TileLayer.WebDogTileLayer(url, options);
};
L.WebdogMap.include({
    setDefaultTileLayer: function (defaultTileLayer) {
        if (defaultTileLayer.base) {
            this.setTileLayer(defaultTileLayer.base, 'base')
        }
        if (defaultTileLayer.high && defaultTileLayer.high.name != 'webdogNull') {
            this.setTileLayer(defaultTileLayer.high, 'high');
        }
    },
    setTileLayer: function (tileLayerConfig, type) {
        var tileLayer = L.webdogConfig.tileLayers[type][tileLayerConfig.name],
            options = L.extend({
                subdomains: '012',
                attribution: '&copy; <a href="{link}">{type}</a>'.format({
                    link: tileLayer.link,
                    type: tileLayer.type
                })
            }, tileLayer);
        if (type == "high") {
            options.zIndex = 1;
            options = L.extend(options, tileLayerConfig);
            if (tileLayerConfig.custom) {
                tileLayer.wms = tileLayerConfig.custom;
            }
        }
        if (tileLayer.wms) {
            options = {
                layers: 'maplet_' + tileLayer.wms,
                format: "image/png",
                transparent: true,
                zIndex: 1,
                attribution: '&copy; <a href="{link}">{type}</a>'.format({
                    link: tileLayer.link,
                    type: tileLayer.type
                })
            };
            options = L.extend(options, tileLayerConfig);
            this.tileLayer[type] = L.tileLayer.wms(tileLayer.url, options).addTo(this);
        } else {
            this.tileLayer[type] = L.tileLayer.webdogTileLayer(tileLayer.url, options).addTo(this);
        }
        if (tileLayer.url2) {
            this.tileLayer[type].extraTile = L.tileLayer.webdogTileLayer(tileLayer.url2, options).addTo(this);
        }
    },
    removeTileLayer: function (tileLayerName) {
        var tileLayer;
        if (tileLayerName in L.webdogConfig.tileLayers.base) {
            tileLayer = this.tileLayer.base;
        } else {
            tileLayer = this.tileLayer.high;
        }
        if (tileLayer) {
            if (tileLayer.extraTile) {
                this.removeLayer(tileLayer.extraTile);
            }
            this.removeLayer(tileLayer);
        }
    }
});
L.LayerPopup = L.Popup.extend({
    sizeMap: L.webdogConfig.size,
    defaultSize: L.webdogConfig.defaultStyle.size,
    options: L.extend({}, L.Popup.options, {
        maxWidth: 280,
        maxHeight: 240
    }),
    initialize: function (layer, options, source) {
        L.Popup.prototype.initialize.call(this, options, source);
        if (layer._geoType == 'point') {
            this.options.offset = [0, 0]
        }
        if (this.options.latlng) {
            this.setLatLng(this.options.latlng)
        }
        this._layer = layer;
        this._ajaxFinish = false;
    },
    bindEvent: function () {
        $('.leaflet-popup-pane').on('click', '.leaflet-popup-content a', this, this.onClick);
    },
    setLayerContent: function () {
        var node = this._layer._node,
            name = node.name;
        if (name == "新标记" || name == "新图层" || name == "新线条" || name == "新边界") {
            this.setContent(name);
            return
        }
        var note = node.note ? node.note.safe().replace(/\n/g, '<br/>') : "",
            baikeLink = ' <img class="layer-ajax" src="/static/image/ajax-loader.gif" width="12px" style="margin-bottom: 2px">',
            popup = this,
            content;
        if (node.baike) {
            baikeLink = '<a href="#" action="tab" data = "baike" style="margin-left: 5px">百科</a>'
        }
        if (node.layer._geoType != 'point' || (node.style.marker && node.style.marker == 'icon')) {
            content = this.getFullContent();
        } else if (note) {
            content = this.getImagesContent() + note + baikeLink
        } else if (node.baike) {
            content = this.getImagesContent() + this.getBaikeContent();
        } else {
            content = name + baikeLink
        }
        this.setContent(content);
        this.update();
        if (this._ajaxFinish == false) {
            $.getJSON('/map/baike/', {
                name: name
            }, function (json) {
                popup.onAjaxFinish(json);
            })
        }
    },
    getFullContent: function (active) {
        var node = this._layer._node;
        active = active || ((node.note || node.images) ? 'note' : 'baike');
        if (!node.note && !node.baike) {
            return node.name.truncateChars(8);
        }
        var popupDiv = $('<div class="leaflet-popup-layer-name"><span class="layer-name">{name}</span></div>'.replace('{name}', node.name)),
            content;
        if (node.baike) {
            var baikeLink = $('<a data="baike" action="tab" href="#">百科</a>');
            if (active == 'baike') {
                baikeLink.addClass('active');
                content = this.getBaikeContent();
            }
            popupDiv.append(baikeLink);
        }
        if (node.note || node.images) {
            var noteLink = $('<a data="note" action="tab" href="#">笔记</a>');
            if (active == 'note') {
                noteLink.addClass('active');
                content = this.getImagesContent() + (node.note ? node.note.safe().replace(/\n/g, '<br/>') : "");
            }
            popupDiv.append(noteLink);
        }
        return popupDiv.prop('outerHTML') + '<div class="leaflet-popup-layer-note">{content}</div>'.replace("{content}", content);
    },
    getBaikeContent: function () {
        var node = this._layer._node;
        return '<img src="/static/image/baidu_24x24.png" width="14px" style="margin-right: 3px">' + node.baike.summary + '<a class="layer-baike" target="_blank" href="{url}" style="margin-left: 5px;display: inline-block">详细</a>'.replace('{url}', node.baike.url)
    },
    getImagesContent: function () {
        var node = this._layer._node;
        if (node.images) {
            var link = typeof node.images[0] == 'string' ? node.images[0] : node.images[0].link;
            return '<div style="text-align: center;width: 280px;position: relative">\
                <a href="#" action="light-box" data="{id}"><img src="{url}" style="max-width: 100%!important;"></a>{tip}</div>'.format({
                url: L.Util.getImageUrl(link, 'popup_mini'),
                id: this._layer._leaflet_id,
                tip: node.images.length == 1 ? "" : '<span style="position: absolute;top: 0;right: 0;' + 'padding:2px 4px;opacity:0.7;background-color: #666;color: white">共' + node.images.length + '张</span>'
            })
        } else {
            return ""
        }
    },
    onAdd: function (map) {
        this.bindEvent();
        L.Popup.prototype.onAdd.call(this, map);
        if (this.options.content) {
            this.setContent(this.options.content);
        } else {
            this.setLayerContent();
        }
    },
    onAjaxFinish: function (json) {
        var node = this._layer._node;
        if (json.success) {
            node.baike = {};
            node.baike.id = json.id;
            node.baike.url = json.url;
            node.baike.summary = json.summary.truncateChars(80);
            this._ajaxFinish = true;
            this.setLayerContent();
        } else {
            $(this._contentNode).find('.layer-ajax').remove();
        }
    },
    onRemove: function (map) {
        L.Popup.prototype.onRemove.call(this, map);
        $('.leaflet-popup-pane').off('click', '.leaflet-popup-content a');
    },
    onClick: function (e) {
        var popup = e.data,
            $a = $(this);
        if (!$a.attr('action')) {
            return
        } else {
            e.preventDefault()
        }
        if ($a.attr('action') == 'tab' && $a.hasClass('active') == false) {
            popup.setContent(popup.getFullContent($a.attr('data')));
            popup.update();
        }
        if ($a.attr('action') == 'light-box') {
            var id = $(this).attr('data'),
                node = popup._map.layerGroup.getLayer(id)._node,
                items = node.images.map(function (value) {
                    return {
                        src: L.Util.getImageUrl(typeof value == 'string' ? value : value.link),
                        title: value.title
                    }
                });
            $.magnificPopup.open({
                items: items,
                type: 'image',
                gallery: {
                    enabled: true
                }
            });
        }
        if (popup.options.onClick) {
            popup.options.onClick(e)
        }
    }
});
L.layerPopup = function (layer, options, source) {
    return new L.LayerPopup(layer, options, source);
};
L.Polygon.include({
    options: L.extend(L.Polygon.prototype.options, {
        weight: 2,
        color: 'DodgerBlue',
        opacity: 0.9,
        fillOpacity: 0.4
    })
});
L.Polyline.include({
    options: L.extend(L.Polyline.prototype.options, {
        weight: 2,
        color: 'DodgerBlue',
        opacity: 0.9
    }),
    hideExtremities: function () {
        if (!this._map) {
            return
        }
        var svg = this._map._pathRoot,
            defsNode = svg.getElementById('defs'),
            id = this._path.getAttribute('id'),
            path = this._path,
            markersNode;
        path.setAttribute('stroke-linecap', 'round');
        path.removeAttribute('id');
        path.removeAttribute('marker-end');
        markersNode = $(defsNode).children("#" + id).remove();
        return this
    }
});
L.extend(L.Util, {
    contrastColor: function (color) {
        var r = parseInt(color.slice(1, 3), 16),
            g = parseInt(color.slice(3, 5), 16),
            b = parseInt(color.slice(5, 7), 16);
        if (r + g + b > 475 || r + g > 400 || r + b > 400 || g + b > 450) {
            return '#000000'
        } else {
            return '#ffffff'
        }
    },
    validator: function (str) {
        return /^[\u4e00-\u9fa5A-z0-9-——《》：:]+$/.test(str)
    },
    getMapStorage: function (options) {
        var file = this.getLocalStorage(options.id);
        if (file && file == options.file) {
            return JSON.parse(this.getLocalStorage(file));
        } else if (file) {
            this.removeLocalStorage(file);
        }
    },
    setMapStorage: function (data, options) {
        this.setLocalStorage(options.id, options.file).setLocalStorage(options.file, data);
    },
    getLocalStorage: function (key) {
        var storage = window.localStorage;
        if (storage) {
            return storage.getItem(key);
        }
    },
    setLocalStorage: function (key, data) {
        try {
            window.localStorage.setItem(key, typeof data == 'string' ? data : JSON.stringify(data));
            return this
        } catch (oException) {
            window.localStorage.clear();
            window.localStorage.setItem(key, typeof data == 'string' ? data : JSON.stringify(data));
            return this
        }
    },
    removeLocalStorage: function (key) {
        window.localStorage.removeItem(key);
    },
    hasStorage: function (key) {
        return window.localStorage.hasOwnProperty(key)
    },
    validatorDate: function (val) {
        return typeof moment == 'function' ? moment(val, 'YYYY-MM-DD').isValid() : null
    },
    activeInput: function (type, val) {
        $("#{type} label[value='{val}']".format({
            val: val,
            type: type
        })).addClass('active').siblings().removeClass('active');
    },
    getImageUrl: function (link, type) {
        if (link.indexOf(L.webdogConfig.ossImageUrl) == 0) {
            return link + (type ? "@!" + type : "")
        } else {
            return link.indexOf('http://') == '0' ? link : L.webdogConfig.ossImageUrl + link + (type ? "@!" + type : "")
        }
    }
});
L.extend(L.LatLngBounds.prototype, {
    contract: function (bufferRatio) {
        var sw = this._southWest,
            ne = this._northEast,
            heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
            widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;
        var b = new L.LatLngBounds(new L.LatLng(sw.lat + heightBuffer, sw.lng + widthBuffer), new L.LatLng(ne.lat - heightBuffer, ne.lng - widthBuffer));
        return b
    }
});
L.Control.NodePanel = L.Class.extend({
    options: {
        'point': ['color', 'icon', 'marker', 'size'],
        'polygon': ['color', 'opacity', 'fillColor', 'fillOpacity', 'weight', 'dashArray'],
        'polyline': ['color', 'opacity', 'weight', 'dashArray', 'arrow']
    },
    initialize: function (map) {
        this._map = map;
        this.node = null;
        this.opening = false;
        this.initPanel();
        this.bindEvent();
        this.vm = this.initVue();
    },
    bindEvent: function () {
        var nodePanel = this;
        this._map.on({
            'node:select': function (e) {
                nodePanel.openPanel(e.node);
            },
            'node:deselect': function (e) {
                nodePanel.closePanel();
            },
            'layer:deselect': function (e) {
                nodePanel.closePanel();
            },
            'node:remove': function (e) {
                if (e.node == nodePanel.node) {
                    nodePanel.closePanel();
                }
            }
        });
        $("#node-panel-close").click(function (e) {
            e.preventDefault();
            nodePanel.closePanel();
        });
        $('#node-panel a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            nodePanel.onTabShown(e);
        });
        $("#layerImages").on('click', 'td', this, function (e) {
            var nodePanel = e.data,
                index = parseInt($(e.target).attr('data')),
                action = $(e.target).attr('action');
            if (action == 'remove-image') {
                nodePanel.vm.images.splice(index, 1);
            } else {
                var image = nodePanel.node.images[index];
                $.magnificPopup.open({
                    items: {
                        src: L.Util.getImageUrl(typeof image == 'string' ? image : image.link)
                    },
                    type: 'image'
                });
            }
        });
    },
    initPanel: function () {
        this.initColorSettingDiv('color');
        this.initColorSettingDiv('fillColor');
        this.initIconSettingDiv();
    },
    initVue: function () {
        var nodePanel = this;
        Vue.filter('validName', {
            write: function (val, oldVal) {
                if (val) {
                    if (L.Util.validator(val)) {
                        return val
                    } else {
                        return oldVal
                    }
                } else {
                    return val
                }
            }
        });
        Vue.filter('validDate', {
            write: function (val, oldVal, type) {
                if (val) {
                    var timeline = nodePanel._map.timeline;
                    if (timeline.validString(val) == false) {
                        return oldVal
                    }
                    var startDate = timeline.stringToDate(type == 'start' ? val : this.start),
                        endDate = timeline.stringToDate(type == 'end' ? val : this.end);
                    if (endDate && endDate.isBefore(startDate)) {
                        alert('开始日期不能在结束日期之后');
                        return oldVal
                    } else {
                        return val
                    }
                } else {
                    return val
                }
            }
        });
        var defaultStyle = L.webdogConfig.defaultStyle,
            vm = new Vue({
                el: "#node-panel",
                data: {
                    layerName: "新图层",
                    images: [],
                    layerNote: defaultStyle.layerNote,
                    start: "",
                    end: "",
                    color: defaultStyle.color,
                    opacity: defaultStyle.opacity,
                    fillColor: defaultStyle.fillColor,
                    fillOpacity: defaultStyle.fillOpacity,
                    weight: defaultStyle.weight,
                    dashArray: defaultStyle.dashArray,
                    marker: defaultStyle.marker,
                    size: defaultStyle.size,
                    icon: defaultStyle.icon,
                    arrow: defaultStyle.arrow
                },
                computed: {
                    timeline: {
                        get: function () {
                            if (!this.start && !this.end) {
                                return null
                            }
                            return {
                                start: this.start,
                                end: this.end
                            }
                        },
                        set: function (val) {
                            this.start = val.start;
                            this.end = val.end;
                        }
                    }
                },
                methods: {
                    insertImage: function (e) {
                        var vm = this;
                        nodePanel._map.upload(function (link, note) {
                            vm.images.push(note ? {
                                link: link,
                                title: note
                            } : link);
                        });
                    }
                }
            });
        vm.$watch('layerName', function (val) {
            var layer = nodePanel.node.layer;
            if (!val) {
                val = layer ? "新" + L.geoType[layer._geoType] : "新图层"
            } else if (L.Util.validator(val) == false) {
                alert("含有非法字符，只能包含中文字符、字母、数字、-《》——：:");
                return
            }
            nodePanel.node.name = val;
            nodePanel._map.notSave = true;
            if (nodePanel.opening == false) {
                if (layer && layer._geoType == 'point') {
                    layer.setLayerStyle();
                }
                if (nodePanel._map.timeline && nodePanel.node.timeline && nodePanel.node.layer) {
                    nodePanel._map.timeline.update({
                        id: nodePanel.node.layer._leaflet_id,
                        content: val
                    })
                }
                nodePanel._map.fire('nodePanel:changeName', nodePanel.node);
            }
        });
        vm.$watch('images', function (val) {
            if (val.length == 0) {
                delete nodePanel.node.images;
                $("#layerImages").html("");
                $('#layerImageInsert').removeClass('disabled');
            } else {
                nodePanel.node.images = val;
                if (val.length >= 5) {
                    $('#layerImageInsert').addClass('disabled');
                } else {
                    $('#layerImageInsert').removeClass('disabled');
                }
                var html = "";
                for (var i = 0; i < 5; i++) {
                    if (val[i]) {
                        var link = typeof val[i] == 'string' ? val[i] : val[i].link;
                        html += '<td><div data="{number}" action="lightbox" style="background-image: url(\{url\})"><div><span action="remove-image" data="{number}" class="size12 glyphicon glyphicon-remove"></span></div></div></td>'.format({
                            url: link.indexOf('http://') != -1 ? link : L.webdogConfig.ossImageUrl + link + '@!editor_mini',
                            number: i
                        });
                    } else {
                        html += '<td></td>'
                    }
                }
                $("#layerImages").html('<table><tr>{html}</tr></table>'.replace('{html}', html));
            }
            nodePanel._map.notSave = true;
        });
        vm.$watch('layerNote', function (val) {
            nodePanel.node.note = val;
            nodePanel._map.notSave = true;
        });
        vm.$watch('start', function (val, oldVal) {
            if (val) {
                $("#nodeEnd").removeAttr('disabled');
            } else {
                $("#nodeEnd").attr('disabled', 'disabled');
                this.end = ''
            }
        });
        vm.$watch('timeline', function (val) {
            nodePanel.node.timeline = val;
            var layer = nodePanel.node.layer;
            if (!layer || !nodePanel._map.timeline) {
                return
            }
            if (val == null) {
                nodePanel._map.timeline.remove(layer._leaflet_id);
                return
            }
            var timeline = nodePanel._map.timeline,
                startDate = timeline.stringToDate(val.start),
                endDate = timeline.stringToDate(val.end);
            var data = {
                id: nodePanel.node.layer._leaflet_id,
                content: nodePanel.node.name,
                node: nodePanel.node,
                start: startDate,
                end: endDate
            };
            nodePanel._map.timeline.update(data);
        });
        vm.$watch('arrow', function (val) {
            L.Util.activeInput('arrow', val);
            nodePanel.setLayerStyle('arrow', val);
        });
        vm.$watch('color', function (val) {
            L.Util.activeInput('color', val);
            nodePanel.setLayerStyle('color', val);
        });
        vm.$watch('opacity', function (val) {
            nodePanel.setLayerStyle('opacity', val);
        });
        vm.$watch('fillColor', function (val) {
            L.Util.activeInput('fillColor', val);
            nodePanel.setLayerStyle('fillColor', val);
        });
        vm.$watch('fillOpacity', function (val) {
            nodePanel.setLayerStyle('fillOpacity', val);
        });
        vm.$watch('weight', function (val) {
            nodePanel.setLayerStyle('weight', val);
            nodePanel.setLayerStyle('dashArray', nodePanel.node.style.dashArray || defaultStyle.dashArray);
        });
        vm.$watch('dashArray', function (val) {
            L.Util.activeInput('dashArray', val);
            nodePanel.setLayerStyle('dashArray', val);
        });
        vm.$watch('marker', function (val) {
            if (val == 'text') {
                this.icon = 'text';
            } else if ((val == 'icon' || val == "mix") && this.icon == 'text') {
                this.icon = 'star';
            }
            L.Util.activeInput('marker', val);
            nodePanel.setLayerStyle('marker', val);
        });
        vm.$watch('icon', function (val) {
            if (val == 'text') {
                this.marker = 'text';
            } else if (this.marker != 'mix') {
                this.marker = 'icon';
            }
            $("#icon .active").removeClass('active');
            L.Util.activeInput('icon', val);
            nodePanel.setLayerStyle('icon', val);
        });
        vm.$watch('size', function (val) {
            L.Util.activeInput('size', val);
            nodePanel.setLayerStyle('size', val);
        });
        vm.$watch('arrow', function (val) {
            L.Util.activeInput('arrow', val);
            nodePanel.setLayerStyle('arrow', val);
        });
        return vm
    },
    initColorSettingDiv: function (target) {
        var colors = L.webdogConfig.colors,
            html = "",
            defaultColor = L.webdogConfig.defaultStyle.color;
        for (var i = 0; i < colors.length; i++) {
            var width = parseInt(100 / colors[i].length) + "%";
            $.each(colors[i], function (j, color) {
                var input = '<label class="btn{active}" value="{color}" style="background-color: {color};width: {width};">\
                <input v-model="{target}" type="radio" name="{target}" value="{color}" autocomplete="off">&nbsp;</label>'.format({
                    active: color == defaultColor ? " active" : "",
                    width: width,
                    target: target,
                    color: color
                });
                html += input;
            });
        }
        $("#" + target).find('.btn-group').append(html);
    },
    initIconSettingDiv: function () {
        var $target = $("#icon"),
            icons = L.webdogConfig.icons,
            defaultIcon = L.webdogConfig.defaultStyle.icon;
        for (var i = 0; i < icons.length; i++) {
            var html = "";
            $.each(icons[i]['icons'], function (j, icon) {
                var input = '<label class="btn{active}" value="{icon}">\
                <i class="icon-{icon}"></i><input v-model="icon" type="radio" name="icon" value="{icon}" autocomplete="off"></label>'.format({
                    active: icon == defaultIcon ? " active" : "",
                    icon: icon
                });
                html += input;
            });
            html = "<div>" + icons[i]['name'] + '</div><div class="btn-group">' + html + '</div>';
            $target.append(html);
        }
    },
    resetPanel: function (node) {
        if (node.layer) {
            $("#node-panel-style .form-group").hide();
            $("#node-panel-style ." + node.layer._geoType).show();
            $("#node-panel .nav-tabs a[href='#node-panel-style']").show();
            if (node.name == '新图层' || node.name == "新标记" || node.name == "新边界" == "新线条") {
                $("#node-panel .nav-tabs a[href='#node-panel-name']").tab('show');
            }
        } else {
            $("#node-panel .nav-tabs a[href='#node-panel-name']").tab('show');
            $("#node-panel .nav-tabs a[href='#node-panel-style']").hide();
        }
        if (this._map.timeline) {
            $("#node-timeline").show();
        } else {
            $("#node-timeline").hide();
        }
    },
    openPanel: function (node) {
        var $nodePanel = $("#node-panel"),
            width = $nodePanel.width() + 15,
            layer = node.layer;
        $nodePanel.show(100, 'linear');
        window.setTimeout(function () {
            $(".leaflet-right").animate({
                'margin-right': width
            }, 100);
        }, 1);
        this.getLayerName(node);
        this.resetPanel(node);
        this.node = node;
        if (layer) {
            this.getLayerStyles(layer);
        }
        this.opening = true;
        window.setTimeout(function (layPanel) {
            return function () {
                layPanel.opening = false;
                $("#layerName").select();
            }
        }(this), 100);
    },
    closePanel: function () {
        var $nodePanel = $("#node-panel");
        $nodePanel.hide(100, 'linear');
        window.setTimeout(function () {
            $(".leaflet-right").animate({
                'margin-right': 0
            }, 100);
        }, 1);
        this.opening = false;
        this.node = null;
    },
    activeInput: function (type, val) {
        $("#{type} label[value='{val}']".format({
            val: val,
            type: type
        })).addClass('active').siblings().removeClass('active');
    },
    setLayerStyle: function (style, val) {
        if (this.opening == true) {
            return
        }
        var layer = this.node.layer,
            layerStyle = layer._node.style,
            defaultStyles = L.webdogConfig.defaultStyle,
            defaultStyle = defaultStyles[style];
        if (layer._geoType == 'point' && style == "color") {
            defaultStyle = defaultStyles.markerColor;
        }
        if (val == defaultStyle) {
            delete layerStyle[style];
        } else {
            layerStyle[style] = val;
        }
        layer.setLayerStyle();
        this._map.notSave = true;
    },
    getDashArray: function (val, weight) {
        switch (val) {
        case "1":
            return null;
        case "2":
            return weight * 2;
        case "3":
            return [weight * 3, weight * 2, 1, weight * 2];
        case "4":
            return [weight * 4, weight * 2, 1, weight * 2, 1, weight * 2]
        }
    },
    getLayerStyles: function (layer) {
        var defaultStyles = L.webdogConfig.defaultStyle,
            styles = this.options[layer._geoType],
            layerStyle = layer._node.style;
        for (var i = 0; i < styles.length; i++) {
            var style = styles[i];
            if (style == 'color' && layer._geoType == "point") {
                this.vm.color = layerStyle.color || defaultStyles.markerColor;
            } else {
                this.vm[style] = layerStyle[style] || defaultStyles[style];
            }
        }
    },
    getLayerName: function (node) {
        var vm = this.vm;
        vm.layerName = node.name;
        vm.layerNote = node.note;
        vm.images = node.images || [];
        vm.timeline = node.timeline || {}
    },
    onTabShown: function (e) {
        if ($(e.target).text() == '名称') {
            $("#layerName").select();
        }
    }
});
L.control.nodePanel = function (options) {
    return new L.Control.NodePanel(options);
};
L.LayerGroup.WebdogGroup = L.LayerGroup.extend({
    initialize: function (options) {
        L.GeoJSON.prototype.initialize.call(this, options);
        this._pointBush = rbush();
        this._cacheBbox = {};
        this._cacheMarker = {};
        this._showLayers = {};
        this._layerNameIndex = {};
        this._activeLayer = null;
        this._layerSizeConfig = L.webdogConfig.size;
        this._layerDefaultSize = this._layerSizeConfig[L.webdogConfig.defaultStyle.size];
        this._showLevel = null;
        this._circleMarkerStyle = null;
        this._mini = false;
        this._boxExpand = 1.2;
    },
    bindEvent: function () {
        this._map.on('moveend', function () {
            this.onViewChange();
        }, this);
    },
    onAdd: function (map) {
        this._map = map;
        this._showLevel = map.mapJson.showLevel || L.webdogConfig.showLevel;
        this.eachLayer(map.addLayer, map);
        if (!map.options.mini) {
            this.bindEvent();
            this._circleMarkerStyle = {
                radius: 2,
                fillColor: 'Crimson',
                fillOpacity: 0.5,
                weight: 1,
                opacity: 0.3
            }
        } else {
            this._mini = true;
            this._circleMarkerStyle = {
                radius: 2,
                fillColor: 'Crimson',
                fillOpacity: 0.2,
                weight: 1,
                opacity: 0.1
            }
        }
    },
    onViewChange: function () {
        this.resetLayers()
    },
    onLayerDragEnd: function () {
        this.resetLayers();
    },
    onLayerClick: function (layer) {
        if (this._activeLayer === layer) {
            this._map.closePopup();
            this.resetActiveLayer();
            this._map.fire('layer:deselect', {
                layer: layer
            });
        } else {
            this.activeLayer(layer);
            this._map.fire('layer:select', {
                layer: layer
            });
        }
    },
    activeLayer: function (layer) {
        if (this._activeLayer) {
            try {
                this._activeLayer.setLayerStyle();
            } catch (e) {}
        }
        this._activeLayer = layer;
        this.resetLayers();
        layer.setLayerStyle({
            active: true
        });
    },
    addLayer: function (layer) {
        var id = this.getLayerId(layer);
        this._layers[id] = layer;
        if (!this._mini) {
            layer.on('click', function (e) {
                this.onLayerClick(e.target);
            }, this);
            layer.on('dragend', function (e) {
                this.onLayerDragEnd(e.target);
            }, this);
            if (!this._map.options.editable) {
                layer.bindPopup(L.layerPopup(layer));
            }
        }
        if (this._map) {
            this.viewOrHideLayer(layer);
        }
        return this;
    },
    resetActiveLayer: function () {
        if (this._activeLayer) {
            this._activeLayer.setLayerStyle();
            this._activeLayer = null;
            this.resetLayers();
        }
    },
    resetLayers: function () {
        var layers = this._layers;
        this._pointBush = rbush();
        this._cacheBbox = {};
        for (var leafletId in layers) {
            this.viewOrHideLayer(layers[leafletId]);
        }
    },
    isViewLayer: function (layer) {
        if (layer == this._activeLayer) {
            if (layer._geoType == 'point') {
                return 'collision'
            } else {
                return 'show'
            }
        }
        var map = this._map,
            layerLevel = layer._level || layer._node.getLevel(),
            zoom = map.getZoom(),
            showLevel = this._showLevel[layerLevel - 1],
            maxShowLevel = showLevel.max,
            minShowLevel = showLevel.min;
        if (minShowLevel > zoom || maxShowLevel < zoom) {
            return 'hide'
        }
        if (map.timeline && layer._node.timeline) {
            var time = map.timeline.getTime(),
                item = map.timeline.getItem(layer._leaflet_id);
            if (time < item.start || (item.end && time > item.end)) {
                return 'hide'
            }
        }
        if (layer._geoType == 'point') {
            var bounds = map.getBounds();
            if (bounds.contains(layer.getLatLng())) {
                return 'collision'
            } else {
                return 'hide'
            }
        } else {
            return 'show'
        }
    },
    collisionHandle: function (layer) {
        var bbox = this.getLayerPointBbox(layer),
            result = this._pointBush.search(bbox),
            isShow = false;
        if (result.length > 0) {
            if (layer == this._activeLayer) {
                isShow = true;
                this.bulkRemoveBushLayer(result, layer);
            } else {
                var show = true;
                for (var i = 0; i < result.length; i++) {
                    if (result[i][4].leafletId == layer._leaflet_id) {
                        continue
                    }
                    if (result[i][4].leafletId in this._showLayers) {
                        show = false;
                        break
                    }
                }
                isShow = show;
            }
        } else {
            isShow = true;
        }
        if (isShow == true) {
            this.showLayer(layer);
        } else {
            this.hideLayer(layer);
        }
        this._pointBush.insert(bbox);
        this._cacheBbox[layer._leaflet_id] = bbox;
    },
    bulkRemoveBushLayer: function (bboxArray, layer) {
        for (var i = 0; i < bboxArray.length; i++) {
            var leafletId = bboxArray[i][4].leafletId;
            if (leafletId != layer._leaflet_id) {
                this.hideLayer(this._layers[leafletId]);
            }
        }
    },
    hideLayer: function (layer) {
        this._map.removeLayer(layer);
        this.createCircleMarker(layer);
        delete this._showLayers[layer._leaflet_id]
    },
    showLayer: function (layer) {
        this._map.addLayer(layer);
        this.removeCircleMarker(layer);
        this._showLayers[layer._leaflet_id] = layer;
    },
    viewOrHideLayer: function (layer) {
        var map = this._map;
        switch (this.isViewLayer(layer)) {
        case 'show':
            map.addLayer(layer);
            this.removeCircleMarker(layer);
            break;
        case 'collision':
            this.collisionHandle(layer);
            break;
        case 'hide':
            map.removeLayer(layer);
            this.removeCircleMarker(layer);
            break;
        }
    },
    removeCircleMarker: function (layer) {
        var marker = this._cacheMarker[layer._leaflet_id];
        if (marker) {
            this._map.removeLayer(marker);
            delete this._cacheMarker[layer._leaflet_id];
        }
    },
    createCircleMarker: function (layer) {
        if (!this._cacheMarker[layer._leaflet_id]) {
            var marker = L.circleMarker(layer.getLatLng(), this._circleMarkerStyle).addTo(this._map);
            this._cacheMarker[layer._leaflet_id] = marker;
        }
    },
    removeLayer: function (layer) {
        this.removeCircleMarker(layer);
        delete this._cacheMarker[layer._leaflet_id];
        delete this._cacheBbox[layer._leaflet_id];
        if (layer == this._activeLayer) {
            this._activeLayer = null;
        }
        return L.LayerGroup.prototype.removeLayer.call(this, layer);
    },
    getBbox: function () {
        if (this.getLayers().length == 0) {
            return [L.webdogConfig.defaultCenter, L.webdogConfig.defaultCenter]
        }
        var bounds = this.getBounds(),
            se = bounds.getSouthEast(),
            nw = bounds.getNorthWest();
        return [[se.lat, se.lng], [nw.lat, nw.lng]]
    },
    getBounds: function () {
        return L.FeatureGroup.prototype.getBounds.call(this);
    },
    getLayerPointBbox: function (layer) {
        var bounds;
        if (layer._geoType == 'point') {
            var point = this._map.latLngToLayerPoint(layer.getLatLng()),
                style = layer.style,
                width, height;
            if (style && style.point) {
                var size = style.size ? this._layerSizeConfig[style.size] : this._layerDefaultSize;
                if (style.point == 'text') {
                    height = size;
                    width = size * (layer._node.name.gbLength() || 1)
                } else if (style.point == 'icon') {
                    width = height = size * 1.5;
                } else {
                    height = size;
                    width = size * (layer._node.name.gbLength() + 1)
                }
            } else {
                width = 48;
                height = 16;
            }
            width *= this._boxExpand;
            height *= this._boxExpand;
            bounds = [point.x - width / 2, point.y - height / 2, point.x + width / 2, point.y + height / 2]
        } else {
            var latLngBounds = layer.getBounds(),
                leftBottom = this._map.latLngToLayerPoint(latLngBounds._southWest),
                rightTop = this._map.latLngToLayerPoint(latLngBounds._northEast);
            bounds = [leftBottom.x, rightTop.y, rightTop.x, leftBottom.y]
        }
        bounds.push({
            leafletId: layer._leaflet_id
        });
        return bounds
    },
    getActiveLayer: function () {
        return this._activeLayer
    },
    loadLayer: function (node) {
        var layer;
        switch (node.type) {
        case "point":
            layer = L.marker(L.GeoJSON.coordsToLatLng(node.coord));
            break;
        case "polygon":
            layer = L.polygon(L.GeoJSON.coordsToLatLngs(node.coord, 1));
            break;
        case "polyline":
            layer = L.polyline(L.GeoJSON.coordsToLatLngs(node.coord, 0));
            break;
        }
        layer._geoType = node.type;
        layer._node = node;
        this.addLayer(layer);
        layer.setLayerStyle({
            map: this._map
        });
        if (this._map.editor) {
            this._map.editor._snap.addGuideLayer(layer);
        }
        return layer;
    },
    setShowLevel: function (val) {
        this._showLevel = val;
        this.resetLayers();
    }
});
L.layerGroup.webdogGroup = function (options) {
    return new L.LayerGroup.WebdogGroup(options);
};
L.extend(L.GeoJSON, {
    latLngToCoords: function (latlng) {
        var coords = [parseFloat(latlng.lng.toFixed(6)), parseFloat(latlng.lat.toFixed(6))];
        if (latlng.alt !== undefined) {
            coords.push(latlng.alt);
        }
        return coords;
    }
});
L.Marker.include({
    setLayerStyle: function (options) {
        options = options || {};
        var style = L.extend({}, this._node.style);
        style.text = this._node.name;
        if (options.active == true) {
            style.active = true;
        }
        if (!style.size) {
            var map = this._map || options.map || L.webdogmap;
            style.size = map.mapJson.showLevel[this._node.getLevel() - 1].size;
        }
        this.setIcon(L.icon.textIcon(style));
    }
});
L.Path.include({
    defaultDashArray: L.webdogConfig.defaultStyle.dashArray,
    defaultWeight: L.webdogConfig.defaultStyle.weight,
    getDashArray: function (value, weight) {
        switch (value) {
        case "1":
            return null;
        case "2":
            return weight * 2;
        case "3":
            return [weight * 3, weight * 2, 1, weight * 2];
        case "4":
            return [weight * 4, weight * 2, 1, weight * 2, 1, weight * 2]
        }
    }
});
L.Polygon.include({
    setLayerStyle: function () {
        var style = L.extend({}, this._node.style);
        style.dashArray = this.getDashArray(style.dashArray || this.defaultDashArray, style.weight || this.defaultWeight);
        this.setStyle(style)
    }
});
L.Polyline.include({
    setLayerStyle: function () {
        var style = L.extend({}, this._node.style);
        style.dashArray = this.getDashArray(style.dashArray || this.defaultDashArray, style.weight || this.defaultWeight);
        this.setStyle(style);
        this.hideExtremities();
        if (style.arrow == 1) {
            window.setTimeout(function (layer) {
                return function () {
                    layer.showExtremities('arrowM');
                }
            }(this), 10);
        }
    }
});
L.Timeline = L.Class.extend({
    initialize: function (map, options) {
        this._map = map;
        this._loadedSource = false;
        this._timeline = null;
        this.height = map.timelineHeight || 85;
        this._playing = false;
        this._initTimeline();
        this._bindEvent();
    },
    _bindEvent: function () {
        var timelinePanel = this;
        $("#timeline-slider").on({
            mousedown: function (e) {
                $(document).on('mousemove.drag', function (e) {
                    var height = document.body.scrollHeight - e.pageY;
                    $("#map-timeline").height(height);
                    $("#map-canvas").css('bottom', height);
                    $("#sidebar").css('bottom', height + 10);
                    $("#node-panel").css('bottom', height + 10);
                    timelinePanel._timeline.setOptions({
                        height: height
                    });
                    timelinePanel.height = height;
                });
            },
            mouseup: function (e) {
                $(document).off('mousemove.drag');
            }
        });
        $("#map-timeline-play").click(function (e) {
            var action = $(this).attr('data'),
                btn = $(this);
            if (action == 'stop') {
                btn.text("停止");
                btn.attr('data', 'play');
                timelinePanel.playing = setInterval(function () {
                    timelinePanel.play();
                }, 125);
            } else {
                btn.text("播放");
                btn.attr('data', 'stop');
                clearInterval(timelinePanel.playing);
                timelinePanel.playing = undefined;
            }
        });
        $("#map-timeline .timeline-menu .dropdown-menu li").click(function () {
            var li = $(this),
                value = parseFloat(li.attr('value')),
                unit = li.attr('unit');
            if (!li.hasClass('active')) {
                timelinePanel._map.mapJson.timeline.playSpeed = {
                    value: value,
                    unit: unit
                };
                li.addClass('active').siblings().removeClass('active');
            }
        });
    },
    _unbindEvent: function () {
        $("#timeline-slider").off();
        $("#map-timeline-play").off();
    },
    _initTimeline: function () {
        var map = this._map,
            mapJson = map.mapJson;
        mapJson.timeline = L.extend({}, L.webdogConfig.timeline, {
            open: true
        });
        if (map.nodePanel) {
            map.nodePanel.closePanel();
        }
        this._initSource();
    },
    _initSource: function () {
        var timelinePanel = this;
        $('head').append('<link rel="stylesheet" href="http://cdn.bootcss.com/vis/4.16.1/vis.min.css"/>');
        $.getScript('http://cdn.bootcss.com/moment.js/2.14.1/moment-with-locales.min.js', function () {
            $.getScript('http://cdn.bootcss.com/moment.js/2.14.1/locale/zh-cn.js', function () {
                $.getScript('http://cdn.bootcss.com/vis/4.16.1/vis-timeline-graph2d.min.js', function () {
                    timelinePanel._timeline = timelinePanel._createTimeline();
                    timelinePanel.open();
                    timelinePanel.load();
                    var minItem = timelinePanel._getMin();
                    if (minItem) {
                        timelinePanel.setTime(minItem.start);
                    }
                });
            });
        });
    },
    _createTimeline: function () {
        var timelinePanel = this,
            container = document.getElementById('map-timeline'),
            options = {
                locale: 'zh-cn',
                clickToUse: true,
                height: this.height,
                zoomMin: 2500000000,
                zoomMax: 100000000000000,
                showCurrentTime: false,
                editable: {
                    add: false,
                    updateTime: false,
                    updateGroup: false,
                    remove: false
                }
            },
            timeline = new vis.Timeline(container, {}, options);
        timeline.addCustomTime(new Date(), 'default-date');
        $("#map-timeline .timeline-menu .dropdown-menu li").each(function (item) {
            var li = $(this),
                config = timelinePanel._map.mapJson.timeline.playSpeed,
                value = parseFloat(li.attr('value')),
                unit = li.attr('unit');
            if (config.value == value && config.unit == unit) {
                li.addClass('active');
            }
        });
        timeline.on('timechange', function (e) {
            if (e.id == 'default-date') {
                var time = moment(e.time);
                timelinePanel._setDateTip(time);
                if (timelinePanel.playing) {
                    clearInterval(timelinePanel.playing);
                }
            }
        });
        timeline.on('timechanged', function (e) {
            if (e.id == 'default-date') {
                var time = timeline.getCustomTime('default-date');
                if (timelinePanel.playing) {
                    timelinePanel.playing = setInterval(function () {
                        timelinePanel.play();
                    }, 125);
                } else {
                    timelinePanel.play(time);
                }
            }
        });
        return timeline
    },
    _getMin: function () {
        return this._timeline.itemsData.min('start');
    },
    _setDateTip: function (time) {
        $("#map-timeline .timeline-date span").text(time.format('l') + "  " + (this._map.times[time.year()] || ""));
    },
    open: function () {
        $("#map-canvas").css('bottom', this.height);
        $("#map-timeline").removeClass('hidden');
        $("#sidebar").css('bottom', this.height + 10);
        this._timeline.setOptions({
            height: this.height
        });
        return this
    },
    close: function () {
        $("#map-timeline").css('display', 'inherit');
        $("#map-timeline").addClass('hidden');
        $("#map-canvas").css('bottom', '0');
        $("#sidebar").css('bottom', '10px');
        $("#node-panel").css('bottom', '10px');
        return this
    },
    destroy: function () {
        this._unbindEvent();
        $("#map-timeline-play").text("播放").attr('data', 'stop');
        clearInterval(this.playing);
        this._timeline.destroy();
    },
    remove: function (id) {
        this._timeline.itemsData.remove(id)
    },
    load: function () {
        var timeline = this,
            nodePanel = this._map.sidebar.nodePanel,
            rootNode = nodePanel.getRootNode();
        nodePanel.iteratesNode(rootNode, function (node) {
            if (node.layer && node.timeline) {
                timeline.update({
                    id: node.layer._leaflet_id,
                    content: node.name,
                    start: timeline.stringToDate(node.timeline.start),
                    end: timeline.stringToDate(node.timeline.end),
                    node: node
                })
            }
        });
    },
    update: function (data) {
        this._timeline.itemsData.update(data)
    },
    play: function (newTime) {
        var map = this._map,
            config = map.mapJson.timeline,
            timeline = this._timeline,
            customId = 'default-date',
            time = timeline.getCustomTime(customId);
        timeline.itemsData.map(function (item) {
            if (item.type == 'point') {
                return
            }
            map.layerGroup.viewOrHideLayer(item.node.layer);
        });
        newTime = newTime || moment(time).add(config.playSpeed.value, config.playSpeed.unit);
        this.setTime(newTime);
    },
    getTime: function (format) {
        return this._timeline.getCustomTime('default-date');
    },
    getItem: function (id) {
        return this._timeline.itemsData.get(id);
    },
    setTime: function (newTime) {
        this._timeline.setCustomTime(newTime, 'default-date');
        this._timeline.moveTo(newTime, false);
    },
    validString: function (string) {
        var re = [/^-{0,1}\d{1,4}-\d{1,2}-\d{1,2}/g, /^-{0,1}\d{1,4}-\d{1,2}/g, /^-{0,1}\d{1,4}/g, ];
        for (var i = 0; i < re.length; i++) {
            if (string.match(re[i]) && moment(string).isValid()) {
                return true
            }
        }
        return false
    },
    stringToDate: function (string) {
        if (!string) {
            return null
        }
        var array = this.stringToArray(string);
        if (array[1]) {
            array[1] -= 1
        }
        return moment(array);
    },
    stringToArray: function (string) {
        var array = string.match(/\w+/g);
        if (string[0] == '-') {
            array[0] = '-' + array[0];
        }
        return array.map(function (i) {
            return parseInt(i)
        });
    }
});
L.timeline = function (map, options) {
    return new L.Timeline(map, options);
};
context = (function () {
    var options = {
        fadeSpeed: 100,
        filter: function ($obj) {},
        above: 'auto',
        left: 'auto',
        preventDoubleContext: true,
        compress: false
    };

    function initialize(opts) {
        options = $.extend({}, options, opts);
        $(document).on('click', function () {
            $('.dropdown-context').fadeOut(options.fadeSpeed, function () {
                $('.dropdown-context').css({
                    display: ''
                }).find('.drop-left').removeClass('drop-left');
            });
        });
        if (options.preventDoubleContext) {
            $(document).on('contextmenu', '.dropdown-context', function (e) {
                e.preventDefault();
            });
        }
        $(document).on('mouseenter', '.dropdown-submenu', function () {
            var $sub = $(this).find('.dropdown-context-sub:first'),
                subWidth = $sub.width(),
                offset = $sub.offset(),
                subLeft = offset ? offset.left : 0,
                collision = (subWidth + subLeft) > window.innerWidth;
            if (collision) {
                $sub.addClass('drop-left');
            }
        });
    }

    function updateOptions(opts) {
        options = $.extend({}, options, opts);
    }

    function buildMenu(data, id, subMenu) {
        var subClass = (subMenu) ? ' dropdown-context-sub' : '',
            compressed = options.compress ? ' compressed-context' : '',
            $menu = $('<ul class="dropdown-menu dropdown-context' + subClass + compressed + '" id="dropdown-' + id + '"></ul>');
        return buildMenuItems($menu, data, id, subMenu);
    }

    function buildMenuItems($menu, data, id, subMenu, addDynamicTag) {
        var linkTarget = '';
        for (var i = 0; i < data.length; i++) {
            if (typeof data[i].divider !== 'undefined') {
                var divider = '<li class="divider';
                divider += (addDynamicTag) ? ' dynamic-menu-item' : '';
                divider += '"></li>';
                $menu.append(divider);
            } else if (typeof data[i].header !== 'undefined') {
                var header = '<li class="nav-header';
                header += (addDynamicTag) ? ' dynamic-menu-item' : '';
                header += '">' + data[i].header + '</li>';
                $menu.append(header);
            } else if (typeof data[i].menu_item_src !== 'undefined') {
                var funcName;
                if (typeof data[i].menu_item_src === 'function') {
                    if (data[i].menu_item_src.name === "") {
                        for (var globalVar in window) {
                            if (data[i].menu_item_src == window[globalVar]) {
                                funcName = globalVar;
                                break;
                            }
                        }
                    } else {
                        funcName = data[i].menu_item_src.name;
                    }
                } else {
                    funcName = data[i].menu_item_src;
                }
                $menu.append('<li class="dynamic-menu-src" data-src="' + funcName + '"></li>');
            } else {
                if (typeof data[i].href == 'undefined') {
                    data[i].href = '#';
                }
                if (typeof data[i].target !== 'undefined') {
                    linkTarget = ' target="' + data[i].target + '"';
                }
                if (typeof data[i].subMenu !== 'undefined') {
                    var sub_menu = '<li class="dropdown-submenu';
                    sub_menu += (addDynamicTag) ? ' dynamic-menu-item' : '';
                    sub_menu += '"><a tabindex="-1" href="' + data[i].href + '">' + data[i].text + '</a></li>'
                    $sub = (sub_menu);
                } else {
                    var element = '<li';
                    element += (addDynamicTag) ? ' class="dynamic-menu-item"' : '';
                    element += '><a tabindex="-1" href="' + data[i].href + '"' + linkTarget + '>';
                    if (typeof data[i].icon !== 'undefined')
                        element += '<span class="glyphicon ' + data[i].icon + '"></span> ';
                    element += data[i].text + '</a></li>';
                    $sub = $(element);
                }
                if (typeof data[i].action !== 'undefined') {
                    $action = data[i].action;
                    $sub.find('a').addClass('context-event').on('click', createCallback($action));
                }
                $menu.append($sub);
                if (typeof data[i].subMenu != 'undefined') {
                    var subMenuData = buildMenu(data[i].subMenu, id, true);
                    $menu.find('li:last').append(subMenuData);
                }
            }
            if (typeof options.filter == 'function') {
                options.filter($menu.find('li:last'));
            }
        }
        return $menu;
    }

    function addContext(selector, data) {
        if (typeof data.id !== 'undefined' && typeof data.data !== 'undefined') {
            var id = data.id;
            $menu = $('body').find('#dropdown-' + id)[0];
            if (typeof $menu === 'undefined') {
                $menu = buildMenu(data.data, id);
                $('body').append($menu);
            }
        } else {
            var d = new Date(),
                id = d.getTime(),
                $menu = buildMenu(data, id);
            $('body').append($menu);
        }
        $(selector).on('contextmenu', function (e) {
            e.preventDefault();
            e.stopPropagation();
            currentContextSelector = $(this);
            $('.dropdown-context:not(.dropdown-context-sub)').hide();
            $dd = $('#dropdown-' + id);
            $dd.find('.dynamic-menu-item').remove();
            $dd.find('.dynamic-menu-src').each(function (idx, element) {
                var menuItems = window[$(element).data('src')](currentContextSelector);
                $parentMenu = $(element).closest('.dropdown-menu.dropdown-context');
                $parentMenu = buildMenuItems($parentMenu, menuItems, id, undefined, true);
            });
            if (typeof options.above == 'boolean' && options.above) {
                $dd.addClass('dropdown-context-up').css({
                    top: e.pageY - 20 - $('#dropdown-' + id).height(),
                    left: e.pageX - 13
                }).fadeIn(options.fadeSpeed);
            } else if (typeof options.above == 'string' && options.above == 'auto') {
                $dd.removeClass('dropdown-context-up');
                var autoH = $dd.height() + 12;
                if ((e.pageY + autoH) > $(window).height()) {
                    $dd.addClass('dropdown-context-up').css({
                        top: e.pageY - 20 - autoH,
                        left: e.pageX - 13
                    }).fadeIn(options.fadeSpeed);
                } else {
                    $dd.css({
                        top: e.pageY + 10,
                        left: e.pageX - 13
                    }).fadeIn(options.fadeSpeed);
                }
            }
            if (typeof options.left == 'boolean' && options.left) {
                $dd.addClass('dropdown-context-left').css({
                    left: e.pageX - $dd.width()
                }).fadeIn(options.fadeSpeed);
            } else if (typeof options.left == 'string' && options.left == 'auto') {
                $dd.removeClass('dropdown-context-left');
                var autoL = $dd.width() - 12;
                if ((e.pageX + autoL) > $('html').width()) {
                    $dd.addClass('dropdown-context-left').css({
                        left: e.pageX - $dd.width() + 13
                    });
                }
            }
        });
    }

    function destroyContext(selector) {
        $(document).off('contextmenu', selector).off('click', '.context-event');
    }
    return {
        init: initialize,
        settings: updateOptions,
        attach: addContext,
        destroy: destroyContext
    };
})();
var createCallback = function (func) {
    return function (event) {
        func(event, currentContextSelector)
    };
}
currentContextSelector = undefined;
(function () {
    L.Handler.MarkerSnap = L.Handler.extend({
        options: {
            snapDistance: 15,
            snapVertices: true
        },
        initialize: function (map, marker, options) {
            L.Handler.prototype.initialize.call(this, map);
            this._markers = [];
            this._guides = [];
            if (arguments.length == 2) {
                if (!(marker instanceof L.Class)) {
                    options = marker;
                    marker = null;
                }
            }
            L.Util.setOptions(this, options || {});
            if (marker) {
                if (!marker.dragging) marker.dragging = new L.Handler.MarkerDrag(marker);
                marker.dragging.enable();
                this.watchMarker(marker);
            }

            function computeBuffer() {
                this._buffer = map.layerPointToLatLng(new L.Point(0, 0)).lat -
                    map.layerPointToLatLng(new L.Point(this.options.snapDistance, 0)).lat;
            }
            map.on('zoomend', computeBuffer, this);
            map.whenReady(computeBuffer, this);
            computeBuffer.call(this);
        },
        enable: function () {
            this.disable();
            for (var i = 0; i < this._markers.length; i++) {
                this.watchMarker(this._markers[i]);
            }
        },
        disable: function () {
            for (var i = 0; i < this._markers.length; i++) {
                this.unwatchMarker(this._markers[i]);
            }
        },
        watchMarker: function (marker) {
            if (this._markers.indexOf(marker) == -1)
                this._markers.push(marker);
            marker.on('move', this._snapMarker, this);
        },
        unwatchMarker: function (marker) {
            marker.off('move', this._snapMarker, this);
            delete marker['snap'];
        },
        addGuideLayer: function (layer) {
            for (var i = 0, n = this._guides.length; i < n; i++)
                if (L.stamp(layer) === L.stamp(this._guides[i]))
                    return;
            this._guides.push(layer);
        },
        _snapMarker: function (e) {
            var marker = e.target,
                latlng = marker.getLatLng(),
                snaplist = [];

            function processGuide(guide) {
                if ((guide._layers !== undefined) && (typeof guide.searchBuffer !== 'function')) {
                    for (var id in guide._layers) {
                        processGuide(guide._layers[id]);
                    }
                } else if (typeof guide.searchBuffer === 'function') {
                    snaplist = snaplist.concat(guide.searchBuffer(latlng, this._buffer));
                } else {
                    snaplist.push(guide);
                }
            }
            for (var i = 0, n = this._guides.length; i < n; i++) {
                var guide = this._guides[i];
                processGuide.call(this, guide);
            }
            var closest = this._findClosestLayerSnap(this._map, snaplist, latlng, this.options.snapDistance, this.options.snapVertices);
            closest = closest || {
                layer: null,
                latlng: null
            };
            this._updateSnap(marker, closest.layer, closest.latlng);
        },
        _findClosestLayerSnap: function (map, layers, latlng, tolerance, withVertices) {
            return L.GeometryUtil.closestLayerSnap(map, layers, latlng, tolerance, withVertices);
        },
        _updateSnap: function (marker, layer, latlng) {
            if (layer && latlng) {
                marker._latlng = L.latLng(latlng);
                marker.update();
                if (marker.snap != layer) {
                    marker.snap = layer;
                    if (marker._icon) L.DomUtil.addClass(marker._icon, 'marker-snapped');
                    marker.fire('snap', {
                        layer: layer,
                        latlng: latlng
                    });
                }
            } else {
                if (marker.snap) {
                    if (marker._icon) L.DomUtil.removeClass(marker._icon, 'marker-snapped');
                    marker.fire('unsnap', {
                        layer: marker.snap
                    });
                }
                delete marker['snap'];
            }
        }
    });
    if (!L.Edit) {
        return;
    }
    L.Handler.PolylineSnap = L.Edit.Poly.extend({
        initialize: function (map, poly, options) {
            var that = this;
            L.Edit.Poly.prototype.initialize.call(this, poly, options);
            this._snapper = new L.Handler.MarkerSnap(map, options);
            poly.on('remove', function () {
                that.disable();
            })
        },
        addGuideLayer: function (layer) {
            this._snapper.addGuideLayer(layer);
        },
        _createMarker: function (latlng, index) {
            var marker = L.Edit.Poly.prototype._createMarker.call(this, latlng, index);
            var isMiddle = index === undefined;
            if (isMiddle) {
                marker.on('dragstart', function () {
                    this._snapper.watchMarker(marker);
                }, this);
            } else {
                this._snapper.watchMarker(marker);
            }
            return marker;
        }
    });
    L.Draw.Feature.SnapMixin = {
        _snap_initialize: function () {
            this.on('enabled', this._snap_on_enabled, this);
            this.on('disabled', this._snap_on_disabled, this);
        },
        _snap_on_enabled: function () {
            if (!this.options.guideLayers) {
                return;
            }
            if (!this._mouseMarker) {
                this._map.on('layeradd', this._snap_on_enabled, this);
                return;
            } else {
                this._map.off('layeradd', this._snap_on_enabled, this);
            }
            if (!this._snapper) {
                this._snapper = new L.Handler.MarkerSnap(this._map);
                if (this.options.snapDistance) {
                    this._snapper.options.snapDistance = this.options.snapDistance;
                }
                if (this.options.snapVertices) {
                    this._snapper.options.snapVertices = this.options.snapVertices;
                }
            }
            for (var i = 0, n = this.options.guideLayers.length; i < n; i++)
                this._snapper.addGuideLayer(this.options.guideLayers[i]);
            var marker = this._mouseMarker;
            this._snapper.watchMarker(marker);
            var icon = marker.options.icon;
            marker.on('snap', function (e) {
                marker.setIcon(this.options.icon);
                marker.setOpacity(1);
            }, this).on('unsnap', function (e) {
                marker.setIcon(icon);
                marker.setOpacity(0);
            }, this);
            marker.on('click', this._snap_on_click, this);
        },
        _snap_on_click: function (e) {
            if (this._markers) {
                var markerCount = this._markers.length,
                    marker = this._markers[markerCount - 1];
                if (this._mouseMarker.snap) {
                    if (e) {
                        marker.setLatLng(e.target._latlng);
                        if (this._poly) {
                            var polyPointsCount = this._poly._latlngs.length;
                            this._poly._latlngs[polyPointsCount - 1] = e.target._latlng;
                            this._poly.redraw();
                        }
                    }
                    L.DomUtil.addClass(marker._icon, 'marker-snapped');
                }
            }
        },
        _snap_on_disabled: function () {
            delete this._snapper;
        },
    };
    L.Draw.Feature.include(L.Draw.Feature.SnapMixin);
    L.Draw.Feature.addInitHook('_snap_initialize');
})();
L.WebdogMap.Editor = L.Class.extend({
    initialize: function (map, options) {
        this._map = map;
        this.editTools = map.editTools;
        this.editingLayer = null;
        this._snap = new L.Handler.MarkerSnap(map, {
            snapVertices: 6,
            snapDistance: 6
        });
        this._snap.watchMarker(map.editTools.newClickHandler);
        this.bindEvent();
    },
    bindEvent: function () {
        var map = this._map,
            editor = this;
        map.on({
            'editor:create': function (e) {
                editor.createLayer(e.geoType);
            },
            'editable:drawing:commit': function (e) {
                if (e.layer._toolbar == 'measure') {
                    return
                }
                editor.onCreatedLayer(e);
            },
            'editable:vertex:ctrlclick': function (e) {
                var index = e.vertex.getIndex();
                if (index === 0) e.layer.editor.continueBackward(e.vertex.latlngs);
                else if (index === e.vertex.getLastIndex()) e.layer.editor.continueForward(e.vertex.latlngs);
            },
            'editable:vertex:dragstart': function (e) {
                editor._snap.watchMarker(e.vertex);
            },
            'editable:vertex:dragend': function (e) {
                editor._snap.unwatchMarker(e.vertex);
            },
            'layer:select': function (e) {
                editor.changeEdit(e.layer);
            },
            'layer:deselect': function (e) {
                editor.changeEdit();
            }
        });
    },
    newLayer: function (type) {
        this._map.fire('editor:create', {
            geoType: type
        });
    },
    createLayer: function (geoType) {
        var layer;
        this._map.nodePanel.closePanel();
        this._map.resetActiveLayer();
        this.changeEdit();
        switch (geoType) {
        case "point":
            layer = this.createPoint(geoType);
            break;
        case "polygon":
            layer = this.createPolygon(geoType);
            break;
        case "polyline":
            layer = this.createPolyline(geoType);
            break;
        }
        layer._geoType = geoType;
        layer.style = {};
    },
    createPoint: function (geoType) {
        var icon = L.icon.textIcon({
            marker: 'text',
            text: '+',
            size: 'xl'
        });
        var layer = this.editTools.startMarker();
        layer.setIcon(icon);
        return layer;
    },
    createPolygon: function (geoType) {
        var layer = this.editTools.startPolygon();
        return layer
    },
    createPolyline: function (geoType) {
        var layer = this.editTools.startPolyline();
        return layer
    },
    changeEdit: function (layer) {
        if (this.editingLayer) {
            this.disableEdit(this.editingLayer);
        }
        if (layer) {
            this.enableEdit(layer);
        }
    },
    enableEdit: function (layer, created) {
        if (this.editingLayer) {
            this.editingLayer.disableEdit();
        }
        this.editingLayer = layer;
        layer.enableEdit();
        layer.enableEdit();
    },
    disableEdit: function (layer) {
        layer.disableEdit();
        if (layer._geoType == 'point') {
            try {
                layer.dragging.enable();
                layer.dragging.disable();
            } catch (error) {}
        }
        this.editingLayer = null;
    },
    onCreatedLayer: function (e) {
        var layer = e.layer;
        this.enableEdit(layer);
        this._snap.addGuideLayer(layer);
        this.enableEdit(layer);
    },
    removeLayer: function (layer) {
        var node = layer._node;
        if (node.children.length == 0) {
            this._map.sidebar.nodePanel.removeNode(node);
        } else {
            this.changeEdit();
            this._map.sidebar.nodePanel.removeLayer(layer._node);
            this._map.layerGroup.removeLayer(layer);
            this._map.nodePanel.closePanel();
        }
    },
    pasteLayer: function () {
        var data = JSON.parse(L.Util.getLocalStorage('clipBoard')),
            nodePanel = this._map.sidebar.nodePanel,
            newNode = nodePanel.createNode(data, nodePanel.getSelectedNode());
        newNode.layer._map = this._map;
        this._map.activeLayer(newNode.layer).panToLayer(newNode.layer);
        this.changeEdit(newNode.layer);
        L.Util.removeLocalStorage('clipBoard');
    }
});
L.webdogMap.editor = function (map, options) {
    return new L.WebdogMap.Editor(map, options);
};
(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'));
    } else {
        factory(jQuery);
    }
}(function ($) {
    "use strict";
    var Markdown = function (element, options) {
        var opts = ['autofocus', 'savable', 'hideable', 'width', 'height', 'resize', 'iconlibrary', 'language', 'footer', 'fullscreen', 'hiddenButtons', 'disabledButtons'];
        $.each(opts, function (_, opt) {
            if (typeof $(element).data(opt) !== 'undefined') {
                options = typeof options == 'object' ? options : {}
                options[opt] = $(element).data(opt)
            }
        });
        this.$ns = 'bootstrap-markdown';
        this.$element = $(element);
        this.$editable = {
            el: null,
            type: null,
            attrKeys: [],
            attrValues: [],
            content: null
        };
        this.$options = $.extend(true, {}, $.fn.markdown.defaults, options, this.$element.data('options'));
        this.$oldContent = null;
        this.$isPreview = false;
        this.$isFullscreen = false;
        this.$editor = null;
        this.$textarea = null;
        this.$handler = [];
        this.$callback = [];
        this.$nextTab = [];
        this.showEditor();
    };
    Markdown.prototype = {
        constructor: Markdown,
        __alterButtons: function (name, alter) {
            var handler = this.$handler,
                isAll = (name == 'all'),
                that = this;
            $.each(handler, function (k, v) {
                var halt = true;
                if (isAll) {
                    halt = false;
                } else {
                    halt = v.indexOf(name) < 0;
                }
                if (halt === false) {
                    alter(that.$editor.find('button[data-handler="' + v + '"]'));
                }
            });
        },
        __buildButtons: function (buttonsArray, container) {
            var i, ns = this.$ns,
                handler = this.$handler,
                callback = this.$callback;
            for (i = 0; i < buttonsArray.length; i++) {
                var y, btnGroups = buttonsArray[i];
                for (y = 0; y < btnGroups.length; y++) {
                    var z, buttons = btnGroups[y].data,
                        btnGroupContainer = $('<div/>', {
                            'class': 'btn-group'
                        });
                    for (z = 0; z < buttons.length; z++) {
                        var button = buttons[z],
                            buttonContainer, buttonIconContainer, buttonHandler = ns + '-' + button.name,
                            buttonIcon = this.__getIcon(button.icon),
                            btnText = button.btnText ? button.btnText : '',
                            btnClass = button.btnClass ? button.btnClass : 'btn',
                            tabIndex = button.tabIndex ? button.tabIndex : '-1',
                            hotkey = typeof button.hotkey !== 'undefined' ? button.hotkey : '',
                            hotkeyCaption = typeof jQuery.hotkeys !== 'undefined' && hotkey !== '' ? ' (' + hotkey + ')' : '';
                        buttonContainer = $('<button></button>');
                        buttonContainer.text(' ' + this.__localize(btnText)).addClass('btn-default btn-sm').addClass(btnClass);
                        if (btnClass.match(/btn\-(primary|success|info|warning|danger|link)/)) {
                            buttonContainer.removeClass('btn-default');
                        }
                        buttonContainer.attr({
                            'type': 'button',
                            'title': this.__localize(button.title) + hotkeyCaption,
                            'tabindex': tabIndex,
                            'data-provider': ns,
                            'data-handler': buttonHandler,
                            'data-hotkey': hotkey
                        });
                        if (button.toggle === true) {
                            buttonContainer.attr('data-toggle', 'button');
                        }
                        buttonIconContainer = $('<span/>');
                        buttonIconContainer.addClass(buttonIcon);
                        buttonIconContainer.prependTo(buttonContainer);
                        btnGroupContainer.append(buttonContainer);
                        handler.push(buttonHandler);
                        callback.push(button.callback);
                    }
                    container.append(btnGroupContainer);
                }
            }
            return container;
        },
        __setListener: function () {
            var hasRows = typeof this.$textarea.attr('rows') !== 'undefined',
                maxRows = this.$textarea.val().split("\n").length > 5 ? this.$textarea.val().split("\n").length : '5',
                rowsVal = hasRows ? this.$textarea.attr('rows') : maxRows;
            this.$textarea.attr('rows', rowsVal);
            if (this.$options.resize) {
                this.$textarea.css('resize', this.$options.resize);
            }
            this.$textarea.on({
                'focus': $.proxy(this.focus, this),
                'keyup': $.proxy(this.keyup, this),
                'change': $.proxy(this.change, this),
                'select': $.proxy(this.select, this)
            });
            if (this.eventSupported('keydown')) {
                this.$textarea.on('keydown', $.proxy(this.keydown, this));
            }
            if (this.eventSupported('keypress')) {
                this.$textarea.on('keypress', $.proxy(this.keypress, this))
            }
            this.$textarea.data('markdown', this);
        },
        __handle: function (e) {
            var target = $(e.currentTarget),
                handler = this.$handler,
                callback = this.$callback,
                handlerName = target.attr('data-handler'),
                callbackIndex = handler.indexOf(handlerName),
                callbackHandler = callback[callbackIndex];
            $(e.currentTarget).focus();
            callbackHandler(this);
            this.change(this);
            if (handlerName.indexOf('cmdSave') < 0) {
                this.$textarea.focus();
            }
            e.preventDefault();
        },
        __localize: function (string) {
            var messages = $.fn.markdown.messages,
                language = this.$options.language;
            if (typeof messages !== 'undefined' && typeof messages[language] !== 'undefined' && typeof messages[language][string] !== 'undefined') {
                return messages[language][string];
            }
            return string;
        },
        __getIcon: function (src) {
            return typeof src == 'object' ? src[this.$options.iconlibrary] : src;
        },
        setFullscreen: function (mode) {
            var $editor = this.$editor,
                $textarea = this.$textarea;
            if (mode === true) {
                $editor.addClass('md-fullscreen-mode');
                $('body').addClass('md-nooverflow');
                this.$options.onFullscreen(this);
            } else {
                $editor.removeClass('md-fullscreen-mode');
                $('body').removeClass('md-nooverflow');
                this.$options.onFullscreenExit(this);
                if (this.$isPreview == true) this.hidePreview().showPreview()
            }
            this.$isFullscreen = mode;
            $textarea.focus();
        },
        showEditor: function () {
            var instance = this,
                textarea, ns = this.$ns,
                container = this.$element,
                originalHeigth = container.css('height'),
                originalWidth = container.css('width'),
                editable = this.$editable,
                handler = this.$handler,
                callback = this.$callback,
                options = this.$options,
                editor = $('<div/>', {
                    'class': 'md-editor',
                    click: function () {
                        instance.focus();
                    }
                });
            if (this.$editor === null) {
                var editorHeader = $('<div/>', {
                    'class': 'md-header btn-toolbar'
                });
                var allBtnGroups = [];
                if (options.buttons.length > 0) allBtnGroups = allBtnGroups.concat(options.buttons[0]);
                if (options.additionalButtons.length > 0) {
                    $.each(options.additionalButtons[0], function (idx, buttonGroup) {
                        var matchingGroups = $.grep(allBtnGroups, function (allButtonGroup, allIdx) {
                            return allButtonGroup.name === buttonGroup.name;
                        });
                        if (matchingGroups.length > 0) {
                            matchingGroups[0].data = matchingGroups[0].data.concat(buttonGroup.data);
                        } else {
                            allBtnGroups.push(options.additionalButtons[0][idx]);
                        }
                    });
                }
                if (options.reorderButtonGroups.length > 0) {
                    allBtnGroups = allBtnGroups.filter(function (btnGroup) {
                        return options.reorderButtonGroups.indexOf(btnGroup.name) > -1;
                    }).sort(function (a, b) {
                        if (options.reorderButtonGroups.indexOf(a.name) < options.reorderButtonGroups.indexOf(b.name)) return -1;
                        if (options.reorderButtonGroups.indexOf(a.name) > options.reorderButtonGroups.indexOf(b.name)) return 1;
                        return 0;
                    });
                }
                if (allBtnGroups.length > 0) {
                    editorHeader = this.__buildButtons([allBtnGroups], editorHeader);
                }
                if (options.fullscreen.enable) {
                    editorHeader.append('<div class="md-controls"><a class="md-control md-control-fullscreen" href="#"><span class="' + this.__getIcon(options.fullscreen.icons.fullscreenOn) + '"></span></a></div>').on('click', '.md-control-fullscreen', function (e) {
                        e.preventDefault();
                        instance.setFullscreen(true);
                    });
                }
                editor.append(editorHeader);
                if (container.is('textarea')) {
                    container.before(editor);
                    textarea = container;
                    textarea.addClass('md-input');
                    editor.append(textarea);
                } else {
                    var rawContent = (typeof toMarkdown == 'function') ? toMarkdown(container.html()) : container.html(),
                        currentContent = $.trim(rawContent);
                    textarea = $('<textarea/>', {
                        'class': 'md-input',
                        'val': currentContent
                    });
                    editor.append(textarea);
                    editable.el = container;
                    editable.type = container.prop('tagName').toLowerCase();
                    editable.content = container.html();
                    $(container[0].attributes).each(function () {
                        editable.attrKeys.push(this.nodeName);
                        editable.attrValues.push(this.nodeValue);
                    });
                    container.replaceWith(editor);
                }
                var editorFooter = $('<div/>', {
                        'class': 'md-footer'
                    }),
                    createFooter = false,
                    footer = '';
                if (options.savable) {
                    createFooter = true;
                    var saveHandler = 'cmdSave';
                    handler.push(saveHandler);
                    callback.push(options.onSave);
                    editorFooter.append('<button class="btn btn-success" data-provider="' + ns + '" data-handler="' + saveHandler + '"><i class="icon icon-white icon-ok"></i> ' + this.__localize('Save') + '</button>');
                }
                footer = typeof options.footer === 'function' ? options.footer(this) : options.footer;
                if ($.trim(footer) !== '') {
                    createFooter = true;
                    editorFooter.append(footer);
                }
                if (createFooter) editor.append(editorFooter);
                if (options.width && options.width !== 'inherit') {
                    if (jQuery.isNumeric(options.width)) {
                        editor.css('display', 'table');
                        textarea.css('width', options.width + 'px');
                    } else {
                        editor.addClass(options.width);
                    }
                }
                if (options.height && options.height !== 'inherit') {
                    if (jQuery.isNumeric(options.height)) {
                        var height = options.height;
                        if (editorHeader) height = Math.max(0, height - editorHeader.outerHeight());
                        if (editorFooter) height = Math.max(0, height - editorFooter.outerHeight());
                        textarea.css('height', height + 'px');
                    } else {
                        editor.addClass(options.height);
                    }
                }
                this.$editor = editor;
                this.$textarea = textarea;
                this.$editable = editable;
                this.$oldContent = this.getContent();
                this.__setListener();
                this.$editor.attr('id', (new Date()).getTime());
                this.$editor.on('click', '[data-provider="bootstrap-markdown"]', $.proxy(this.__handle, this));
                if (this.$element.is(':disabled') || this.$element.is('[readonly]')) {
                    this.$editor.addClass('md-editor-disabled');
                    this.disableButtons('all');
                }
                if (this.eventSupported('keydown') && typeof jQuery.hotkeys === 'object') {
                    editorHeader.find('[data-provider="bootstrap-markdown"]').each(function () {
                        var $button = $(this),
                            hotkey = $button.attr('data-hotkey');
                        if (hotkey.toLowerCase() !== '') {
                            textarea.bind('keydown', hotkey, function () {
                                $button.trigger('click');
                                return false;
                            });
                        }
                    });
                }
                if (options.initialstate === 'preview') {
                    this.showPreview();
                } else if (options.initialstate === 'fullscreen' && options.fullscreen.enable) {
                    this.setFullscreen(true);
                }
            } else {
                this.$editor.show();
            }
            if (options.autofocus) {
                this.$textarea.focus();
                this.$editor.addClass('active');
            }
            if (options.fullscreen.enable && options.fullscreen !== false) {
                this.$editor.append('<div class="md-fullscreen-controls">' + '<a href="#" class="exit-fullscreen" title="Exit fullscreen"><span class="' + this.__getIcon(options.fullscreen.icons.fullscreenOff) + '">' + '</span></a>' + '</div>');
                this.$editor.on('click', '.exit-fullscreen', function (e) {
                    e.preventDefault();
                    instance.setFullscreen(false);
                });
            }
            this.hideButtons(options.hiddenButtons);
            this.disableButtons(options.disabledButtons);
            if (options.dropZoneOptions) {
                if (this.$editor.dropzone) {
                    options.dropZoneOptions.init = function () {
                        var caretPos = 0;
                        this.on('drop', function (e) {
                            caretPos = textarea.prop('selectionStart');
                        });
                        this.on('success', function (file, path) {
                            var text = textarea.val();
                            textarea.val(text.substring(0, caretPos) + '\n![description](' + path + ')\n' + text.substring(caretPos));
                        });
                        this.on('error', function (file, error, xhr) {
                            console.log('Error:', error);
                        });
                    }
                    this.$textarea.addClass('dropzone');
                    this.$editor.dropzone(options.dropZoneOptions);
                } else {
                    console.log('dropZoneOptions was configured, but DropZone was not detected.');
                }
            }
            options.onShow(this);
            return this;
        },
        parseContent: function (val) {
            var content;
            var val = val || this.$textarea.val();
            if (this.$options.parser) {
                content = this.$options.parser(val);
            } else if (typeof markdown == 'object') {
                content = markdown.toHTML(val);
            } else if (typeof marked == 'function') {
                content = marked(val);
            } else {
                content = val;
            }
            return content;
        },
        showPreview: function () {
            var options = this.$options,
                container = this.$textarea,
                afterContainer = container.next(),
                replacementContainer = $('<div/>', {
                    'class': 'md-preview',
                    'data-provider': 'markdown-preview'
                }),
                content, callbackContent;
            if (this.$isPreview == true) {
                return this;
            }
            this.$isPreview = true;
            this.disableButtons('all').enableButtons('cmdPreview');
            callbackContent = options.onPreview(this);
            content = typeof callbackContent == 'string' ? callbackContent : this.parseContent();
            replacementContainer.html(content);
            if (afterContainer && afterContainer.attr('class') == 'md-footer') {
                replacementContainer.insertBefore(afterContainer);
            } else {
                container.parent().append(replacementContainer);
            }
            replacementContainer.css({
                width: container.outerWidth() + 'px',
                height: container.outerHeight() + 'px'
            });
            if (this.$options.resize) {
                replacementContainer.css('resize', this.$options.resize);
            }
            container.hide();
            replacementContainer.data('markdown', this);
            if (this.$element.is(':disabled') || this.$element.is('[readonly]')) {
                this.$editor.addClass('md-editor-disabled');
                this.disableButtons('all');
            }
            return this;
        },
        hidePreview: function () {
            this.$isPreview = false;
            var container = this.$editor.find('div[data-provider="markdown-preview"]');
            container.remove();
            this.enableButtons('all');
            this.disableButtons(this.$options.disabledButtons);
            this.$textarea.show();
            this.__setListener();
            return this;
        },
        isDirty: function () {
            return this.$oldContent != this.getContent();
        },
        getContent: function () {
            return this.$textarea.val();
        },
        setContent: function (content) {
            this.$textarea.val(content);
            return this;
        },
        findSelection: function (chunk) {
            var content = this.getContent(),
                startChunkPosition;
            if (startChunkPosition = content.indexOf(chunk), startChunkPosition >= 0 && chunk.length > 0) {
                var oldSelection = this.getSelection(),
                    selection;
                this.setSelection(startChunkPosition, startChunkPosition + chunk.length);
                selection = this.getSelection();
                this.setSelection(oldSelection.start, oldSelection.end);
                return selection;
            } else {
                return null;
            }
        },
        getSelection: function () {
            var e = this.$textarea[0];
            return (('selectionStart' in e && function () {
                var l = e.selectionEnd - e.selectionStart;
                return {
                    start: e.selectionStart,
                    end: e.selectionEnd,
                    length: l,
                    text: e.value.substr(e.selectionStart, l)
                };
            }) || function () {
                return null;
            })();
        },
        setSelection: function (start, end) {
            var e = this.$textarea[0];
            return (('selectionStart' in e && function () {
                e.selectionStart = start;
                e.selectionEnd = end;
                return;
            }) || function () {
                return null;
            })();
        },
        replaceSelection: function (text) {
            var e = this.$textarea[0];
            return (('selectionStart' in e && function () {
                e.value = e.value.substr(0, e.selectionStart) + text + e.value.substr(e.selectionEnd, e.value.length);
                e.selectionStart = e.value.length;
                return this;
            }) || function () {
                e.value += text;
                return jQuery(e);
            })();
        },
        getNextTab: function () {
            if (this.$nextTab.length === 0) {
                return null;
            } else {
                var nextTab, tab = this.$nextTab.shift();
                if (typeof tab == 'function') {
                    nextTab = tab();
                } else if (typeof tab == 'object' && tab.length > 0) {
                    nextTab = tab;
                }
                return nextTab;
            }
        },
        setNextTab: function (start, end) {
            if (typeof start == 'string') {
                var that = this;
                this.$nextTab.push(function () {
                    return that.findSelection(start);
                });
            } else if (typeof start == 'number' && typeof end == 'number') {
                var oldSelection = this.getSelection();
                this.setSelection(start, end);
                this.$nextTab.push(this.getSelection());
                this.setSelection(oldSelection.start, oldSelection.end);
            }
            return;
        },
        __parseButtonNameParam: function (names) {
            return typeof names == 'string' ? names.split(' ') : names;
        },
        enableButtons: function (name) {
            var buttons = this.__parseButtonNameParam(name),
                that = this;
            $.each(buttons, function (i, v) {
                that.__alterButtons(buttons[i], function (el) {
                    el.removeAttr('disabled');
                });
            });
            return this;
        },
        disableButtons: function (name) {
            var buttons = this.__parseButtonNameParam(name),
                that = this;
            $.each(buttons, function (i, v) {
                that.__alterButtons(buttons[i], function (el) {
                    el.attr('disabled', 'disabled');
                });
            });
            return this;
        },
        hideButtons: function (name) {
            var buttons = this.__parseButtonNameParam(name),
                that = this;
            $.each(buttons, function (i, v) {
                that.__alterButtons(buttons[i], function (el) {
                    el.addClass('hidden');
                });
            });
            return this;
        },
        showButtons: function (name) {
            var buttons = this.__parseButtonNameParam(name),
                that = this;
            $.each(buttons, function (i, v) {
                that.__alterButtons(buttons[i], function (el) {
                    el.removeClass('hidden');
                });
            });
            return this;
        },
        eventSupported: function (eventName) {
            var isSupported = eventName in this.$element;
            if (!isSupported) {
                this.$element.setAttribute(eventName, 'return;');
                isSupported = typeof this.$element[eventName] === 'function';
            }
            return isSupported;
        },
        keyup: function (e) {
            var blocked = false;
            switch (e.keyCode) {
            case 40:
            case 38:
            case 16:
            case 17:
            case 18:
                break;
            case 9:
                var nextTab;
                if (nextTab = this.getNextTab(), nextTab !== null) {
                    var that = this;
                    setTimeout(function () {
                        that.setSelection(nextTab.start, nextTab.end);
                    }, 500);
                    blocked = true;
                } else {
                    var cursor = this.getSelection();
                    if (cursor.start == cursor.end && cursor.end == this.getContent().length) {
                        blocked = false;
                    } else {
                        this.setSelection(this.getContent().length, this.getContent().length);
                        blocked = true;
                    }
                }
                break;
            case 13:
                blocked = false;
                break;
            case 27:
                if (this.$isFullscreen) this.setFullscreen(false);
                blocked = false;
                break;
            default:
                blocked = false;
            }
            if (blocked) {
                e.stopPropagation();
                e.preventDefault();
            }
            this.$options.onChange(this);
        },
        change: function (e) {
            this.$options.onChange(this);
            return this;
        },
        select: function (e) {
            this.$options.onSelect(this);
            return this;
        },
        focus: function (e) {
            var options = this.$options,
                isHideable = options.hideable,
                editor = this.$editor;
            editor.addClass('active');
            $(document).find('.md-editor').each(function () {
                if ($(this).attr('id') !== editor.attr('id')) {
                    var attachedMarkdown;
                    if (attachedMarkdown = $(this).find('textarea').data('markdown'), attachedMarkdown === null) {
                        attachedMarkdown = $(this).find('div[data-provider="markdown-preview"]').data('markdown');
                    }
                    if (attachedMarkdown) {
                        attachedMarkdown.blur();
                    }
                }
            });
            options.onFocus(this);
            return this;
        },
        blur: function (e) {
            var options = this.$options,
                isHideable = options.hideable,
                editor = this.$editor,
                editable = this.$editable;
            if (editor.hasClass('active') || this.$element.parent().length === 0) {
                editor.removeClass('active');
                if (isHideable) {
                    if (editable.el !== null) {
                        var oldElement = $('<' + editable.type + '/>'),
                            content = this.getContent(),
                            currentContent = this.parseContent(content);
                        $(editable.attrKeys).each(function (k, v) {
                            oldElement.attr(editable.attrKeys[k], editable.attrValues[k]);
                        });
                        oldElement.html(currentContent);
                        editor.replaceWith(oldElement);
                    } else {
                        editor.hide();
                    }
                }
                options.onBlur(this);
            }
            return this;
        }
    };
    var old = $.fn.markdown;
    $.fn.markdown = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('markdown'),
                options = typeof option == 'object' && option;
            if (!data) $this.data('markdown', (data = new Markdown(this, options)))
        })
    };
    $.fn.markdown.messages = {};
    $.fn.markdown.defaults = {
        autofocus: false,
        hideable: false,
        savable: false,
        width: 'inherit',
        height: 'inherit',
        resize: 'none',
        iconlibrary: 'glyph',
        language: 'en',
        initialstate: 'editor',
        parser: null,
        dropZoneOptions: null,
        buttons: [[{
            name: 'groupFont',
            data: [{
                name: 'cmdBold',
                hotkey: 'Ctrl+B',
                title: 'Bold',
                icon: {
                    glyph: 'glyphicon glyphicon-bold',
                    fa: 'fa fa-bold',
                    'fa-3': 'icon-bold',
                    octicons: 'octicon octicon-bold'
                },
                callback: function (e) {
                    var chunk, cursor, selected = e.getSelection(),
                        content = e.getContent();
                    if (selected.length === 0) {
                        chunk = e.__localize('strong text');
                    } else {
                        chunk = selected.text;
                    }
                    if (content.substr(selected.start - 2, 2) === '**' && content.substr(selected.end, 2) === '**') {
                        e.setSelection(selected.start - 2, selected.end + 2);
                        e.replaceSelection(chunk);
                        cursor = selected.start - 2;
                    } else {
                        e.replaceSelection('**' + chunk + '**');
                        cursor = selected.start + 2;
                    }
                    e.setSelection(cursor, cursor + chunk.length);
                }
            }, {
                name: 'cmdItalic',
                title: 'Italic',
                hotkey: 'Ctrl+I',
                icon: {
                    glyph: 'glyphicon glyphicon-italic',
                    fa: 'fa fa-italic',
                    'fa-3': 'icon-italic',
                    octicons: 'octicon octicon-italic'
                },
                callback: function (e) {
                    var chunk, cursor, selected = e.getSelection(),
                        content = e.getContent();
                    if (selected.length === 0) {
                        chunk = e.__localize('emphasized text');
                    } else {
                        chunk = selected.text;
                    }
                    if (content.substr(selected.start - 1, 1) === '_' && content.substr(selected.end, 1) === '_') {
                        e.setSelection(selected.start - 1, selected.end + 1);
                        e.replaceSelection(chunk);
                        cursor = selected.start - 1;
                    } else {
                        e.replaceSelection('_' + chunk + '_');
                        cursor = selected.start + 1;
                    }
                    e.setSelection(cursor, cursor + chunk.length);
                }
            }, {
                name: 'cmdHeading',
                title: 'Heading',
                hotkey: 'Ctrl+H',
                icon: {
                    glyph: 'glyphicon glyphicon-header',
                    fa: 'fa fa-header',
                    'fa-3': 'icon-font',
                    octicons: 'octicon octicon-text-size'
                },
                callback: function (e) {
                    var chunk, cursor, selected = e.getSelection(),
                        content = e.getContent(),
                        pointer, prevChar;
                    if (selected.length === 0) {
                        chunk = e.__localize('heading text');
                    } else {
                        chunk = selected.text + '\n';
                    }
                    if ((pointer = 4, content.substr(selected.start - pointer, pointer) === '### ') || (pointer = 3, content.substr(selected.start - pointer, pointer) === '###')) {
                        e.setSelection(selected.start - pointer, selected.end);
                        e.replaceSelection(chunk);
                        cursor = selected.start - pointer;
                    } else if (selected.start > 0 && (prevChar = content.substr(selected.start - 1, 1), !!prevChar && prevChar != '\n')) {
                        e.replaceSelection('\n\n### ' + chunk);
                        cursor = selected.start + 6;
                    } else {
                        e.replaceSelection('# ' + chunk);
                        cursor = selected.start + 2;
                    }
                    e.setSelection(cursor, cursor + chunk.length);
                }
            }]
        }, {
            name: 'groupLink',
            data: [{
                name: 'cmdUrl',
                title: 'URL/Link',
                hotkey: 'Ctrl+L',
                icon: {
                    glyph: 'glyphicon glyphicon-link',
                    fa: 'fa fa-link',
                    'fa-3': 'icon-link',
                    octicons: 'octicon octicon-link'
                },
                callback: function (e) {
                    var chunk, cursor, selected = e.getSelection(),
                        content = e.getContent(),
                        link;
                    if (selected.length === 0) {
                        chunk = e.__localize('enter link description here');
                    } else {
                        chunk = selected.text;
                    }
                    link = prompt(e.__localize('Insert Hyperlink'), 'http://');
                    var urlRegex = new RegExp('^((http|https)://|(mailto:)|(//))[a-z0-9]', 'i');
                    if (link !== null && link !== '' && link !== 'http://' && urlRegex.test(link)) {
                        var sanitizedLink = $('<div>' + link + '</div>').text();
                        e.replaceSelection('[' + chunk + '](' + sanitizedLink + ')');
                        cursor = selected.start + 1;
                        e.setSelection(cursor, cursor + chunk.length);
                    }
                }
            }, {
                name: 'cmdImage',
                title: 'Image',
                hotkey: 'Ctrl+G',
                icon: {
                    glyph: 'glyphicon glyphicon-picture',
                    fa: 'fa fa-picture-o',
                    'fa-3': 'icon-picture',
                    octicons: 'octicon octicon-file-media'
                },
                callback: function (e) {
                    var chunk, cursor, selected = e.getSelection(),
                        content = e.getContent(),
                        link;
                    if (selected.length === 0) {
                        chunk = e.__localize('enter image description here');
                    } else {
                        chunk = selected.text;
                    }
                    link = prompt(e.__localize('Insert Image Hyperlink'), 'http://');
                    var urlRegex = new RegExp('^((http|https)://|(//))[a-z0-9]', 'i');
                    if (link !== null && link !== '' && link !== 'http://' && urlRegex.test(link)) {
                        var sanitizedLink = $('<div>' + link + '</div>').text();
                        e.replaceSelection('![' + chunk + '](' + sanitizedLink + ' "' + e.__localize('enter image title here') + '")');
                        cursor = selected.start + 2;
                        e.setNextTab(e.__localize('enter image title here'));
                        e.setSelection(cursor, cursor + chunk.length);
                    }
                }
            }]
        }, {
            name: 'groupMisc',
            data: [{
                name: 'cmdList',
                hotkey: 'Ctrl+U',
                title: 'Unordered List',
                icon: {
                    glyph: 'glyphicon glyphicon-list',
                    fa: 'fa fa-list',
                    'fa-3': 'icon-list-ul',
                    octicons: 'octicon octicon-list-unordered'
                },
                callback: function (e) {
                    var chunk, cursor, selected = e.getSelection(),
                        content = e.getContent();
                    if (selected.length === 0) {
                        chunk = e.__localize('list text here');
                        e.replaceSelection('- ' + chunk);
                        cursor = selected.start + 2;
                    } else {
                        if (selected.text.indexOf('\n') < 0) {
                            chunk = selected.text;
                            e.replaceSelection('- ' + chunk);
                            cursor = selected.start + 2;
                        } else {
                            var list = [];
                            list = selected.text.split('\n');
                            chunk = list[0];
                            $.each(list, function (k, v) {
                                list[k] = '- ' + v;
                            });
                            e.replaceSelection('\n\n' + list.join('\n'));
                            cursor = selected.start + 4;
                        }
                    }
                    e.setSelection(cursor, cursor + chunk.length);
                }
            }, {
                name: 'cmdListO',
                hotkey: 'Ctrl+O',
                title: 'Ordered List',
                icon: {
                    glyph: 'glyphicon glyphicon-th-list',
                    fa: 'fa fa-list-ol',
                    'fa-3': 'icon-list-ol',
                    octicons: 'octicon octicon-list-ordered'
                },
                callback: function (e) {
                    var chunk, cursor, selected = e.getSelection(),
                        content = e.getContent();
                    if (selected.length === 0) {
                        chunk = e.__localize('list text here');
                        e.replaceSelection('1. ' + chunk);
                        cursor = selected.start + 3;
                    } else {
                        if (selected.text.indexOf('\n') < 0) {
                            chunk = selected.text;
                            e.replaceSelection('1. ' + chunk);
                            cursor = selected.start + 3;
                        } else {
                            var list = [];
                            list = selected.text.split('\n');
                            chunk = list[0];
                            $.each(list, function (k, v) {
                                list[k] = '1. ' + v;
                            });
                            e.replaceSelection('\n\n' + list.join('\n'));
                            cursor = selected.start + 5;
                        }
                    }
                    e.setSelection(cursor, cursor + chunk.length);
                }
            }, {
                name: 'cmdCode',
                hotkey: 'Ctrl+K',
                title: 'Code',
                icon: {
                    glyph: 'glyphicon glyphicon-asterisk',
                    fa: 'fa fa-code',
                    'fa-3': 'icon-code',
                    octicons: 'octicon octicon-code'
                },
                callback: function (e) {
                    var chunk, cursor, selected = e.getSelection(),
                        content = e.getContent();
                    if (selected.length === 0) {
                        chunk = e.__localize('code text here');
                    } else {
                        chunk = selected.text;
                    }
                    if (content.substr(selected.start - 4, 4) === '```\n' && content.substr(selected.end, 4) === '\n```') {
                        e.setSelection(selected.start - 4, selected.end + 4);
                        e.replaceSelection(chunk);
                        cursor = selected.start - 4;
                    } else if (content.substr(selected.start - 1, 1) === '`' && content.substr(selected.end, 1) === '`') {
                        e.setSelection(selected.start - 1, selected.end + 1);
                        e.replaceSelection(chunk);
                        cursor = selected.start - 1;
                    } else if (content.indexOf('\n') > -1) {
                        e.replaceSelection('```\n' + chunk + '\n```');
                        cursor = selected.start + 4;
                    } else {
                        e.replaceSelection('`' + chunk + '`');
                        cursor = selected.start + 1;
                    }
                    e.setSelection(cursor, cursor + chunk.length);
                }
            }, {
                name: 'cmdQuote',
                hotkey: 'Ctrl+Q',
                title: 'Quote',
                icon: {
                    glyph: 'glyphicon glyphicon-comment',
                    fa: 'fa fa-quote-left',
                    'fa-3': 'icon-quote-left',
                    octicons: 'octicon octicon-quote'
                },
                callback: function (e) {
                    var chunk, cursor, selected = e.getSelection(),
                        content = e.getContent();
                    if (selected.length === 0) {
                        chunk = e.__localize('quote here');
                        e.replaceSelection('> ' + chunk);
                        cursor = selected.start + 2;
                    } else {
                        if (selected.text.indexOf('\n') < 0) {
                            chunk = selected.text;
                            e.replaceSelection('> ' + chunk);
                            cursor = selected.start + 2;
                        } else {
                            var list = [];
                            list = selected.text.split('\n');
                            chunk = list[0];
                            $.each(list, function (k, v) {
                                list[k] = '> ' + v;
                            });
                            e.replaceSelection('\n\n' + list.join('\n'));
                            cursor = selected.start + 4;
                        }
                    }
                    e.setSelection(cursor, cursor + chunk.length);
                }
            }]
        }, {
            name: 'groupUtil',
            data: [{
                name: 'cmdPreview',
                toggle: true,
                hotkey: 'Ctrl+P',
                title: 'Preview',
                btnText: 'Preview',
                btnClass: 'btn btn-default btn-sm',
                icon: {
                    glyph: 'glyphicon glyphicon-search',
                    fa: 'fa fa-search',
                    'fa-3': 'icon-search',
                    octicons: 'octicon octicon-search'
                },
                callback: function (e) {
                    var isPreview = e.$isPreview,
                        content;
                    if (isPreview === false) {
                        e.showPreview();
                    } else {
                        e.hidePreview();
                    }
                }
            }]
        }]],
        additionalButtons: [],
        reorderButtonGroups: [],
        hiddenButtons: [],
        disabledButtons: [],
        footer: '',
        fullscreen: {
            enable: true,
            icons: {
                fullscreenOn: {
                    fa: 'fa fa-expand',
                    glyph: 'glyphicon glyphicon-fullscreen',
                    'fa-3': 'icon-resize-full',
                    octicons: 'octicon octicon-link-external'
                },
                fullscreenOff: {
                    fa: 'fa fa-compress',
                    glyph: 'glyphicon glyphicon-fullscreen',
                    'fa-3': 'icon-resize-small',
                    octicons: 'octicon octicon-browser'
                }
            }
        },
        onShow: function (e) {},
        onPreview: function (e) {},
        onSave: function (e) {},
        onBlur: function (e) {},
        onFocus: function (e) {},
        onChange: function (e) {},
        onFullscreen: function (e) {},
        onFullscreenExit: function (e) {},
        onSelect: function (e) {}
    };
    $.fn.markdown.Constructor = Markdown;
    $.fn.markdown.noConflict = function () {
        $.fn.markdown = old;
        return this;
    };
    var initMarkdown = function (el) {
        var $this = el;
        if ($this.data('markdown')) {
            $this.data('markdown').showEditor();
            return;
        }
        $this.markdown()
    };
    var blurNonFocused = function (e) {
        var $activeElement = $(document.activeElement);
        $(document).find('.md-editor').each(function () {
            var $this = $(this),
                focused = $activeElement.closest('.md-editor')[0] === this,
                attachedMarkdown = $this.find('textarea').data('markdown') || $this.find('div[data-provider="markdown-preview"]').data('markdown');
            if (attachedMarkdown && !focused) {
                attachedMarkdown.blur();
            }
        })
    };
    $(document).on('click.markdown.data-api', '[data-provide="markdown-editable"]', function (e) {
        initMarkdown($(this));
        e.preventDefault();
    }).on('click focusin', function (e) {
        blurNonFocused(e);
    }).ready(function () {
        $('textarea[data-provide="markdown"]').each(function () {
            initMarkdown($(this));
        })
    });
}));
(function ($) {
    $.fn.markdown.messages.zh = {
        'Bold': "粗体",
        'Italic': "斜体",
        'Heading': "标题",
        'URL/Link': "链接",
        'Image': "图片",
        'List': "列表",
        'Unordered List': "无序列表",
        'Ordered List': "有序列表",
        'Code': "代码",
        'Quote': "引用",
        'Preview': "预览",
        'strong text': "粗体",
        'emphasized text': "强调",
        'heading text': "标题",
        'enter link description here': "输入链接说明",
        'Insert Hyperlink': "URL地址",
        'enter image description here': "输入图片说明",
        'Insert Image Hyperlink': "图片URL地址",
        'enter image title here': "在这里输入图片标题",
        'list text here': "这里是列表文本",
        'code text here': "这里输入代码",
        'quote here': "这里输入引用文本"
    };
}(jQuery));
var map = L.webdogMap('map-canvas', {
    id: 7035,
    file: '161124161832454.json',
    mini: false,
    auth: true,
    editable: true
});