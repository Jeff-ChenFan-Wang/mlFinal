function createBrowserEnv() {
    var fetch = window['fetch'] || function () {
        throw new Error('fetch - missing fetch implementation for browser environment');
    };
    var readFile = function () {
        throw new Error('readFile - filesystem not available for browser environment');
    };
    return {
        Canvas: HTMLCanvasElement,
        CanvasRenderingContext2D: CanvasRenderingContext2D,
        Image: HTMLImageElement,
        ImageData: ImageData,
        Video: HTMLVideoElement,
        createCanvasElement: function () { return document.createElement('canvas'); },
        createImageElement: function () { return document.createElement('img'); },
        fetch: fetch,
        readFile: readFile
    };
}

var env = createBrowserEnv();

function createCanvasFromMedia(media, dims) {
    var ImageData = createBrowserEnv().ImageData;
    if (!(media instanceof ImageData) && !isMediaLoaded(media)) {
        throw new Error('createCanvasFromMedia - media has not finished loading yet');
    }
    var _a = dims || getMediaDimensions(media), width = _a.width, height = _a.height;
    var canvas = createCanvas({ width: width, height: height });
    if (media instanceof ImageData) {
        getContext2dOrThrow(canvas).putImageData(media, 0, 0);
    }
    else {
        getContext2dOrThrow(canvas).drawImage(media, 0, 0, width, height);
    }
    return canvas;
}

function isMediaLoaded(media) {
    var _a = env, Image = _a.Image, Video = _a.Video;
    return (media instanceof Image && media.complete)
        || (media instanceof Video && media.readyState >= 3);
}

function getMediaDimensions(input) {
    var _a = env, Image = _a.Image, Video = _a.Video;
    if (input instanceof Image) {
        return new Dimensions(input.naturalWidth, input.naturalHeight);
    }
    if (input instanceof Video) {
        return new Dimensions(input.videoWidth, input.videoHeight);
    }
    return new Dimensions(input.width, input.height);
}

var Dimensions = /** @class */ (function () {
    class Dimensions {
        constructor(width, height) {
            if (!isValidNumber(width) || !isValidNumber(height)) {
                throw new Error("Dimensions.constructor - expected width and height to be valid numbers, instead have " + JSON.stringify({ width: width, height: height }));
            }
            this._width = width;
            this._height = height;
        }
        reverse() {
            return new Dimensions(1 / this.width, 1 / this.height);
        }
    }
    Object.defineProperty(Dimensions.prototype, "width", {
        get: function () { return this._width; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Dimensions.prototype, "height", {
        get: function () { return this._height; },
        enumerable: true,
        configurable: true
    });
    return Dimensions;
}());

function isValidNumber(num) {
    return !!num && num !== Infinity && num !== -Infinity && !isNaN(num) || num === 0;
}

function createCanvas(_a) {
    var width = _a.width, height = _a.height;
    var createCanvasElement = env.createCanvasElement;
    var canvas = createCanvasElement();
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

function getContext2dOrThrow(canvasArg) {
    var _a = env, Canvas = _a.Canvas, CanvasRenderingContext2D = _a.CanvasRenderingContext2D;
    if (canvasArg instanceof CanvasRenderingContext2D) {
        return canvasArg;
    }
    var canvas = resolveInput(canvasArg);
    if (!(canvas instanceof Canvas)) {
        throw new Error('resolveContext2d - expected canvas to be of instance of Canvas');
    }
    var ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('resolveContext2d - canvas 2d context is null');
    }
    return ctx;
}

function resolveInput(arg) {
    if (typeof arg === 'string') {
        return document.getElementById(arg);
    }
    return arg;
}

function matchDimensions(input, reference, useMediaDimensions) {
    if (useMediaDimensions === void 0) { useMediaDimensions = false; }
    var _a = useMediaDimensions
        ? getMediaDimensions(reference)
        : reference, width = _a.width, height = _a.height;
    input.width = width;
    input.height = height;
    return { width: width, height: height };
}


// ####################

function drawDetections(canvasArg, detections) {
    var detectionsArray = Array.isArray(detections) ? detections : [detections];
    detectionsArray.forEach(function (det) {
        var score = det instanceof FaceDetection
            ? det.score
            : (isWithFaceDetection(det) ? det.detection.score : undefined);
        var box = det instanceof FaceDetection
            ? det.box
            : (isWithFaceDetection(det) ? det.detection.box : new Box(det));
        var label = score ? "" + round(score) : undefined;
        new DrawBox(box, { label: label }).draw(canvasArg);
    });
}

var DrawBox = /** @class */ (function () {
    class DrawBox {
        constructor(box, options) {
            if (options === void 0) { options = {}; }
            this.box = new Box(box);
            this.options = new DrawBoxOptions(options);
        }
        draw(canvasArg) {
            var ctx = getContext2dOrThrow(canvasArg);
            var _a = this.options, boxColor = _a.boxColor, lineWidth = _a.lineWidth;
            var _b = this.box, x = _b.x, y = _b.y, width = _b.width, height = _b.height;
            ctx.strokeStyle = boxColor;
            ctx.lineWidth = lineWidth;
            ctx.strokeRect(x, y, width, height);
            var label = this.options.label;
            if (label) {
                new DrawTextField([label], { x: x - (lineWidth / 2), y: y }, this.options.drawLabelOptions).draw(canvasArg);
            }
        }
    }
    return DrawBox;
}());