// constructor
function Gallery() {

    // moving block X coordinate
    this.movingXPos = 0;

    // items data
    this.items = [];

    // length of items
    this.itemsLen = null;

    return this;
}

// configuration
Gallery.prototype.config = function (config) {

    // elements
    this.$ = {
        btnPrev: document.querySelector(config.prev),
        btnNext: document.querySelector(config.next),
        display: document.querySelector(config.display),
        moving: document.querySelector(config.moving)
    };

    // item width
    this.unit = config.unit || 200;

    // number of visible items
    this.visibleItemsLen = config.visibleItemsLen || 3;

    return this;
};

// get necessary gallery data
Gallery.prototype.getData = function (params) {
    var request = new XMLHttpRequest();

    request.open('GET', params.url, true);
    request.setRequestHeader('Authorization', params.headerVal);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var obj = JSON.parse(request.responseText);

            params.success(obj);
        } else {
            throw new Error('Reached server, but it returned an error!');
        }
    };

    request.onerror = function (evt) {
        console.log('Error occured:', evt);
    };

    request.send();
};

// create a new array of object with just the necessary properties
Gallery.prototype.filterMapGenre = function (arr, type) {
    var i = 0;
    var len = arr.length;
    var filteredObj;

    // walk through the outer arrays
    for (; i < len; i++) {

        // filter: by passed type
        // map: necessary properties
        filteredObj = arr[i].assets.filter(function (item) {
            return item.genre === type;
        })
            .map(function (item) {
                return {
                    imdb: item.imdb,
                    img: item.img,
                    title: item.title
                };
            });

        // concatenate to one array
        this.items = this.items.concat(filteredObj);
    }

    return this;
};

// sort descending by passed property
Gallery.prototype.sortDescending = function (prop) {
    this.items.sort(function (a, b) {
        if (a[prop] > b[prop]) {
            return -1;
        }

        if (a[prop] < b[prop]) {
            return 1;
        }

        return 0;
    });

    return this;
};

// display gallery items
Gallery.prototype.displayResults = function () {
    var self = this;
    var items = this.items;
    var len = items.length;
    var i = 0;
    var markup = '';

    // set the galleries display visible width
    self.$.display.style.width = self.unit * self.visibleItemsLen + 'px';

    // set the galleries moving block width
    self.$.moving.style.width = self.unit * len + 'px';

    // generate markup
    for (; i < len; i++) {
        markup += '<figure class="gallery__item">' +
        '<img height="270" src="' + items[i].img + '" width="186" />' +
        '<figcaption class="gallery__item__caption">' + items[i].title + ' (' + items[i].imdb + ')</figcaption>' +
        '</figure>';
    }

    // insert markup
    self.$.moving.innerHTML = markup;

    return this;
};

// cache the gallery items length
Gallery.prototype.cacheItemsLen = function () {
    this.itemsLen = this.items.length;

    return this;
};

// set moving blocks translateX() position
Gallery.prototype.movingTransition = function (pos) {
    var self = this;

    self.$.moving.style.webkitTransform = 'translateX(' + pos + 'px)';
    self.$.moving.style.transform = 'translateX(' + pos + 'px)';
};

// calculating the new position of the moving box (next)
Gallery.prototype.moveToNext = function (fixThis) {

    // refer to the constructor
    var self = fixThis;

    // -unit * (items length - (visible items number + 1))
    var turningPoint = -self.unit * (self.itemsLen - (self.visibleItemsLen + 1));

    self.movingXPos = (self.movingXPos >= turningPoint) ? self.movingXPos - self.unit : 0;

    self.movingTransition(gallery.movingXPos);

    return this;
};

// calculating the new position of the moving box (prev)
Gallery.prototype.moveToPrev = function (fixThis) {

    // refer to the constructor
    var self = fixThis;

    // every items width - visible items count * unit
    var turningPoint = -(self.itemsLen * self.unit - self.visibleItemsLen * self.unit);

    self.movingXPos = (self.movingXPos >= 0) ? turningPoint : self.movingXPos + self.unit;

    self.movingTransition(gallery.movingXPos);
};

// add event listeners
Gallery.prototype.addEvents = function () {
    var self = this;

    // click on the next button
    self.$.btnNext.addEventListener('click', function () {
        self.moveToNext(self);
    });

    // click on the prev button
    self.$.btnPrev.addEventListener('click', function () {
        self.moveToPrev(self);
    });

    // global keydown
    document.addEventListener('keydown', function (evt) {

        // right arrow
        if (evt.keyCode === 39) {
            self.moveToNext(self);
        }

        // left arrow
        if (evt.keyCode === 37) {
            self.moveToPrev(self);
        }
    });

    return this;
};



// invoke app
var gallery = new Gallery();

gallery.config({
    display: '.gallery__display',
    moving: '.gallery__display__moving',
    next: '.gallery__btn--next',
    prev: '.gallery__btn--prev'
});

gallery.getData({
    //url: '//something.com/data.json',
    url: '//lg-devtest.herokuapp.com/data.json',
    headerVal: 'Bearer u12A8f3Zg',
    success: function (obj) {
        var arr = obj.data;

        gallery
            .filterMapGenre(arr, 'Action')
            .sortDescending('imdb')
            .cacheItemsLen()
            .displayResults()
            .addEvents();
    }
});