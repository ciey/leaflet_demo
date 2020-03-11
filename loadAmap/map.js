var CONFIG = {};


CONFIG.baseLayers = {
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
    'amapStreet': {
                'type': "高德地图",
                'company': "autonavi",
                'name': '街道',
                'link': "http://ditu.amap.com",
                'url': 'http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
            },
    
    'googleStreet': {
                'type': "谷歌地图",
                'company': "google",
                'name': '街道',
                'link': "http://ditu.google.cn",
                'url': 'http://mt{s}.google.cn/vt/lyrs=m@167000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galil'
            }
  
};

CONFIG.defaultZoom = 4;
CONFIG.defaultCenter= [31, 104];
CONFIG.defaultTileLayer = "amapStreet";



L.TileLayer.GISTileLayer = L.TileLayer.extend({
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
L.tileLayer.GISTileLayer = function (url, options) {
    return new L.TileLayer.GISTileLayer(url, options);
};



var map = L.map('map-canvas', {
            //zoomControl: false,
            attributionControl: false
        }).setView([31.183, 121.485], 16);


L.tileLayer.GISTileLayer(CONFIG.baseLayers[CONFIG.defaultTileLayer].url,CONFIG.baseLayers[CONFIG.defaultTileLayer]).addTo(map);


//插件

//显示坐标
//https://github.com/ardhi/Leaflet.MousePosition/blob/master/src/L.Control.MousePosition.js
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

new L.Control.MousePosition({
            position: "bottomleft"
        }).addTo(map);

new L.control.scale({
            position: "bottomleft",
            imperial: false
        }).addTo(map);

var editableLayers = new L.FeatureGroup();
    map.addLayer(editableLayers);


var MyCustomMarker = L.Icon.extend({
        options: {
            shadowUrl: null,
            iconAnchor: new L.Point(12, 12),
            iconSize: new L.Point(24, 24),
            iconUrl: 'link/to/image.png'
        }
    });

    var options = {
        position: 'topleft',
        draw: {
            polyline: {
                shapeOptions: {
                    color: '#f357a1',
                    weight: 10
                }
            },
            polygon: {
                allowIntersection: false, // Restricts shapes to simple polygons
                drawError: {
                    color: '#e1e100', // Color the shape will turn when intersects
                    message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                },
                shapeOptions: {
                    color: '#bada55'
                }
            },
            circle: false, // Turns off this drawing tool
            rectangle: false,
            marker: {
                icon: new MyCustomMarker()
            }
        },
        edit: {
            featureGroup: editableLayers, //REQUIRED!!
            remove: false
        }
    };

    var drawControl = new L.Control.Draw(options);
    map.addControl(drawControl);

    function data_popup(layer) {
            //var layer = e.target;
            var shape_for_db = JSON.stringify(layer.toGeoJSON());
            L.popup({
                    maxWidth: 650
                })
                .setLatLng(layer.getBounds().getCenter())
                .setContent("<label for='name'>热区数据：" + "</label>" +
                    "<textarea style='width: 600px;height: 300px;'>" + shape_for_db + "</textarea>")
                .openOn(map);
        }

    map.on(L.Draw.Event.CREATED, function (e) {
        var type = e.layerType,
            layer = e.layer;
        if (type === 'marker') {
            layer.bindPopup(JSON.stringify(layer.toGeoJSON()));
        }
        else{
            layer.on('click', function () {
                    data_popup(e.layer);
                });
        }
        
        

        editableLayers.addLayer(layer);
        data_popup(layer);
    });

