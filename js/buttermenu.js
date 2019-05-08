function ButterMenu(t) {
    let e = this;
    this.windowWidth = 0;
    this.container = document.querySelector(t);

    if (null === this.container) {
        return;
    }

    this.root = this.container.querySelector('.bm-wrapper');
    this.primaryNav = this.root.querySelector('.level_1');
    this.primaryNavItem = this.root.querySelector('.bm-nav-root > .bm-item > .bm-has-dropdown');
    this.secondaryNavItem = this.root.querySelector('.bm-nav-root > .bm-item > :not(.bm-has-dropdown)');
    this.parentsMuted = this.container.getAttribute('data-bm-parent-muted');
    this.checkCollision();
    window.addEventListener('load', this.checkCollision.bind(this));
    window.addEventListener('resize', this.checkCollision.bind(this));
    this.container.classList.add('bm-no-dropdown-transition');
    this.dropdownBackground = this.container.querySelector('.bm-dropdown-bg');
    this.dropdownContainer = this.container.querySelector('.bm-dropdown-container');
    this.dropdownArrow = this.container.querySelector('.bm-dropdown-arrow');
    this.dropdownRoots = this.queryArray('.bm-has-dropdown', this.root);
    this.dropdownSections = this.queryArray('.bm-dropdown-section', this.container).map(function(t) {
        return {
            el: t,
            name: t.getAttribute('data-bm-dropdown'),
            content: t.querySelector('.bm-dropdown-content'),
        };
    });
    this.popupSections = [];
    this.popupLists = this.queryArray('.bm-nav', this.container);

    this.queryArray('.bm-nav li.bm-item', this.container).forEach(function(t, i) {
        t.closest('.bm-nav').setAttribute('data-bm-id', i);
    });

    this.queryArray('.bm-nav li.bm-item', this.container).forEach(function(t, i) {
        let link = t.querySelector('.bm-link'),
            dropDown = e.dropdownContainer.querySelector('[data-bm-dropdown="' + link.getAttribute('data-bm-dropdown') + '"]'),
            next = t.querySelector('.bm-nav') || (dropDown ? dropDown.querySelector('.bm-nav') : null) || null,
            current = t.closest('.bm-nav'),
            previous = current.parentNode ? current.parentNode.closest('.bm-nav') : null;

        // secondary nav
        if (null === previous && current.parentNode.classList.contains('bm-dropdown-content')) {
            previous = e.primaryNav;
        }

        e.popupSections.push({
            el: link,
            next: next,
            current: current,
            previous: previous,
        });
    });

    let compactModeOptions = ['off-canvas', 'default'];
    this.compactMode = compactModeOptions[compactModeOptions.indexOf(this.container.getAttribute('data-bm-compact-mode') || 'default')];
    let compactCanvasSelector = this.container.getAttribute('data-bm-compact-canvas');
    if (compactCanvasSelector) {
        this.compactCanvas = document.querySelector(compactCanvasSelector);
    }
    let backdrop = document.createElement('div');
    backdrop.classList.add('bm-compact-backdrop');
    backdrop.setAttribute('data-bm-compact-toggle', compactCanvasSelector);
    this.compactBackdrop = document.body.appendChild(backdrop);
    this.compactCanvasToggler = document.querySelectorAll('[data-bm-compact-toggle="' + compactCanvasSelector + '"]');
    this.activeCompactCanvasToggler = null;
    this.compactCanvasToggler.forEach(function(t, i) {
        t.addEventListener('click', function(n) {
            n.preventDefault();
            if (true === e.canvasOpen) {
                e.closeCompactCanvas(t);
            } else {
                e.activeCompactCanvasToggler = n.target;
                e.openCompactCanvas(t);
            }
        });

        // t.addEventListener('keydown', function(n) {
        //     if (n.keyCode === 13) {
        //         e.container.classList.add('bm-keyboardfocus-within');
        //         e.activeCompactCanvasToggler = n.target;
        //     }
        // });
    });
    this.compactPrev = this.container.querySelector('.bm-prev');
    this.compactPrevBtn = this.compactPrev.querySelector('.bm-prev-btn');
    this.compactPrevTitle = this.compactPrev.querySelector('.bm-prev-title');
    this.compactPreviousActiveLink = null;
    this.enhancedElements = [];
    this.keyDownHandler = null;
    window.addEventListener('load', this.registerEvents.bind(this));
    window.addEventListener('resize', this.registerEvents.bind(this));
}

ButterMenu.prototype.registerEvents = function() {
    let windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    // nothing changed
    if (this.windowWidth > 0 && windowWidth === this.windowWidth) {
        return;
    }

    this.windowWidth = windowWidth;

    this.clearEvents();
    this.reset();

    if (this.isMobileViewport() && 'off-canvas' === this.compactMode) {
        this.registerOffCanvasEvents();
        this.container.classList.add('bm-initialized');
        return;
    }

    this.registerDefaultEvents();
    this.container.classList.add('bm-initialized');
};

ButterMenu.prototype.addEvent = function(element, event, handler) {
    this.enhancedElements.push({
        element, event, handler,
    });

    element.addEventListener(event, handler);
};

ButterMenu.prototype.clearEvents = function() {
    this.enhancedElements.forEach(ee => {
        ee.element.removeEventListener(ee.eventType, ee.handler);
    });

    this.enhancedElements = [];
};

ButterMenu.prototype.getPopupSectionFromLink = function(link) {
    return this.popupSections.filter(section => {
        return link === section.el;
    })[0];
};

ButterMenu.prototype.getPreviousPopupSection = function(active) {
    if (null === active.previous) {
        return active;
    }

    return this.popupSections.filter(section => {
        return active.previous.getAttribute('data-bm-id') === section.current.getAttribute('data-bm-id');
    })[0];
};

ButterMenu.prototype.getNextPopupSection = function(active) {
    if (null === active.next) {
        return active;
    }

    return this.popupSections.filter(section => {
        return active.next === section.current;
    })[0];
};

ButterMenu.prototype.registerDefaultEvents = function() {
    let menu = this;
    let events = window.PointerEvent ? {
        end: 'pointerup',
        enter: 'pointerenter',
        leave: 'pointerleave',
    } : {
        end: 'touchend',
        enter: 'mouseenter',
        leave: 'mouseleave',
    };

    endRootNavHandler = function(event, element) {
        event.preventDefault();
        event.stopPropagation();
        menu.toggleDropdown(element);
    };

    enterRootNavHandler = function(event, element) {
        if ('touch' !== event.pointerType) {
            menu.stopCloseTimeout();
            menu.openDropdown(element);
        }
    };

    clickRootNavHandler = function(event, element) {
        if (!menu.parentsMuted && !window.PointerEvent) {
            return;
        }

        // prevent parent click
        if (('touch' === menu.parentsMuted && !window.PointerEvent) || 'both' === menu.parentsMuted || ('click' === menu.parentsMuted && window.PointerEvent)) {
            event.preventDefault();
        }

        event.keyboardNavigation = !0;
        menu.activeDropdown === element ? menu.closeDropdown() : menu.openDropdown(element, event);
    };

    leaveRootNavHandler = function(event, element) {
        if ('touch' !== event.pointerType) {
            menu.startCloseTimeout();
        }
    };

    containerEndHandler = function(event, element) {
        event.stopPropagation();
    };

    containerEnterHandler = function(event, element) {
        'touch' !== event.pointerType && menu.stopCloseTimeout();
    };

    containerLeaveHandler = function(event, element) {
        'touch' !== event.pointerType && menu.startCloseTimeout();
    };

    bodyEndHandler = function(event, element) {
        menu.touch.isDragging() || menu.closeDropdown();
    };

    keydownHandler = function(event) {
        if (null !== menu.keyDownHandler) {
            menu.keyDownHandler(event);
        }
    };

    let eventType;
    let element;

    this.dropdownRoots.forEach(element => {
        eventType = events.end;
        menu.enhancedElements.push({
            element, eventType, handler(event) {
                endRootNavHandler(event, element);
            },
        });

        eventType = events.enter;
        menu.enhancedElements.push({
            element, eventType, handler(event) {
                enterRootNavHandler(event, element);
            },
        });

        eventType = 'click';
        menu.enhancedElements.push({
            element, eventType, handler(event) {
                clickRootNavHandler(event, element);
            },
        });

        eventType = events.leave;
        menu.enhancedElements.push({
            element, eventType, handler(event) {
                leaveRootNavHandler(event, element);
            },
        });
    });

    element = this.dropdownContainer;
    eventType = events.end;
    menu.enhancedElements.push({
        element, eventType, handler(event) {
            containerEndHandler(event, element);
        },
    });

    eventType = events.enter;
    menu.enhancedElements.push({
        element, eventType, handler(event) {
            containerEnterHandler(event, element);
        },
    });

    eventType = events.leave;
    menu.enhancedElements.push({
        element, eventType, handler(event) {
            containerLeaveHandler(event, element);
        },
    });

    element = document.body;
    eventType = events.end;
    menu.enhancedElements.push({
        element, eventType, handler(event) {
            bodyEndHandler(event, element);
        },
    });

    eventType = 'keydown';
    element = this.container;
    menu.enhancedElements.push({
        element, eventType, handler(event) {
            keydownHandler(event);
        },
    });

    // add listeners
    menu.enhancedElements.forEach(ee => {
        ee.element.addEventListener(ee.eventType, ee.handler);
    });
};

ButterMenu.prototype.registerOffCanvasEvents = function() {
    let menu = this;

    clickHandler = function(event, element) {
        menu.compactNext(element, event);
    };

    prevClickHandler = function(element, event) {
        event.preventDefault();
        menu.compactPrevious(element, event);
    };

    keydownHandler = function(event) {
        if (null !== menu.keyDownHandler) {
            menu.keyDownHandler(event);
        }
    };

    globalKeydownHandler = function(event) {
        // escape
        if (27 === event.keyCode) {
            menu.container.classList.add('bm-keyboardfocus-within');
            menu.closeCompactCanvas();
        }
    };

    let eventType;

    this.popupSections.forEach(section => {
        eventType = 'click';
        element = section.el;
        menu.enhancedElements.push({
            element, eventType, handler(event) {
                clickHandler(event, section);
            },
        });
    });

    eventType = 'click';
    element = this.compactPrev;
    menu.enhancedElements.push({
        element, eventType, handler(event) {
            prevClickHandler(element, event);
        },
    });

    eventType = 'keydown';
    element = this.compactCanvas;
    menu.enhancedElements.push({
        element, eventType, handler(event) {
            keydownHandler(event);
        },
    });

    eventType = 'keydown';
    element = document.body;
    menu.enhancedElements.push({
        element, eventType, handler(event) {
            globalKeydownHandler(event);
        },
    });

    // add listeners
    menu.enhancedElements.forEach(ee => {
        ee.element.addEventListener(ee.eventType, ee.handler);
    });

    menu.initCompact();
};

ButterMenu.prototype.initCompact = function() {
    this.compactCanvas.setAttribute('aria-hidden', true);
    this.activeDropdown = false;

    this.dropdownSections.forEach(section => {
        section.el.removeAttribute('aria-hidden', 'false');

        let uls = section.el.querySelectorAll('ul');

        uls.forEach(ul => {
            ul.setAttribute('aria-hidden', true);
        });
    });

    this.primaryNav.setAttribute('aria-hidden', true);

    let showCurrent = this.container.getAttribute('data-bm-compact-show-current') === 'true' || false;

    this.popupSections.forEach(section => {
        section.el.removeAttribute('tabindex');

        if (section.next) {
            section.next.setAttribute('data-bm-prev-text', section.el.textContent);
        }

        // active dropDown
        if (showCurrent && section.el.classList.contains('active')) {
            this.activeDropdown = section;
            this.activeDropdown.visible = this.activeDropdown.current;

            if(null !== section.previous){
                section.previous.classList.add('active-child'); // trailing parents should not be active
                section.previous.setAttribute('aria-hidden', false);
            }

            this.activeDropdown.visible.classList.add('active');
            this.activeDropdown.visible.setAttribute('aria-hidden', 'false');

            this.compactPrevTitle.textContent = this.activeDropdown.visible.getAttribute('data-bm-prev-text');
            this.compactPrev.removeAttribute('tabindex');
        }

        if (!this.rootDropdown && section.current.classList.contains('bm-nav-root')) {
            this.rootDropdown = section;
        }
    });

    if (false === this.activeDropdown) {
        this.activeDropdown = this.rootDropdown;
        this.activeDropdown.visible = this.activeDropdown.current;
        this.rootDropdown.current.classList.add('active');
        this.rootDropdown.current.setAttribute('aria-hidden', false);
        this.compactPrev.classList.add('bm-root');
        this.compactPrev.classList.add('disabled');
        this.compactPrev.setAttribute('tabindex', '-1');
    }
};

ButterMenu.prototype.compactNext = function(element, event) {
    let menu = this;
    if (null !== element.next) {
        event.preventDefault();
        if (null === this.activeDropdown.previous) {
            this.activeDropdown.visible.setAttribute('aria-hidden', true);
        }
        this.activeDropdown.visible.classList.remove('active');
        this.compactPreviousActiveLink = element.el;
        element.next.classList.add('active');
        this.compactPrev.removeAttribute('tabindex');
        this.compactPrevTitle.textContent = element.next.getAttribute('data-bm-prev-text');

        element.current.classList.add('active-child'); // trailing parents should not be active

        this.activeDropdown = this.getNextPopupSection(element);
        this.activeDropdown.visible = this.activeDropdown.current;
        this.activeDropdown.visible.setAttribute('aria-hidden', false);

        clearTimeout(this.enableTransitionTimeout);

        this.enableTransitionTimeout = setTimeout(function() {
            menu.updateCompactCanvasArrowKeyNavigation();
        }, 250);

        this.compactPrev.classList.remove('bm-root');
        this.compactPrev.classList.remove('disabled');

    }
};

ButterMenu.prototype.compactPrevious = function(element, event) {
    let menu = this;

    if (this.activeDropdown.visible) {
        this.activeDropdown.visible.classList.remove('active');
        this.activeDropdown.visible.setAttribute('aria-hidden', true);
    }

    this.activeDropdown = this.getPreviousPopupSection(this.activeDropdown);

    this.activeDropdown.visible = this.activeDropdown.current;
    this.activeDropdown.visible.classList.remove('active-child');
    this.activeDropdown.visible.classList.add('active');

    this.compactPrevTitle.textContent = this.activeDropdown.visible.getAttribute('data-bm-prev-text');

    clearTimeout(this.enableTransitionTimeout);

    this.enableTransitionTimeout = setTimeout(function() {
        menu.updateCompactCanvasArrowKeyNavigation(menu.compactPreviousActiveLink);
    }, 250);

    if (null === this.activeDropdown.previous) {
        this.compactPrev.classList.add('bm-root');
        this.compactPrev.classList.add('disabled');
        this.compactPrev.setAttribute('tabindex', '-1');
    }
};

ButterMenu.prototype.queryArray = function(element, context) {
    return context || (context = document.body), Array.prototype.slice.call(context.querySelectorAll(element));
};

ButterMenu.prototype.closest = function(selector, context) {
    if (!selector || !context) return null;

    //polyfill .matches()
    if (Element && !Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;
    }

    if (context.matches(selector)) return context; //return self if it matches

    var parent = context.parentNode;
    var i = 0;

    while (!parent.matches(selector)) {
        parent = parent.parentNode;
        if (parent.tagName === 'undefined') return null; //reached the end of the DOM tree
        if (i >= 100) return null; //emergency break
        i += 1;
    }

    return parent;
};

ButterMenu.prototype.touch = {
    isSupported: 'ontouchstart' in window || navigator.maxTouchPoints,
    isDragging: function() {
        let isDragging = false;

        document.body.addEventListener('touchmove', function() {
            isDragging = true;
        });

        document.body.addEventListener('touchstart', function() {
            isDragging = false;
        });

        return isDragging;
    },
};

ButterMenu.prototype.openCompactCanvas = function(t) {
    let e = this;
    this.compactCanvasToggler.forEach(function(n, i) {
        n.classList.add('is-active');
    });

    this.compactCanvas.classList.add('bm-canvas-transition');

    clearTimeout(this.enableTransitionTimeout);
    this.enableTransitionTimeout = setTimeout(function() {
        e.compactCanvas.classList.remove('bm-canvas-transition');
    }, 250);

    this.compactCanvas.classList.add('active');
    this.compactCanvas.setAttribute('aria-hidden', false);
    this.compactBackdrop.classList.add('active');
    this.canvasOpen = true;

    this.compactCanvasToggler.forEach(function(n, i) {
        n.setAttribute('aria-expanded', 'true');
    });

    clearTimeout(this.disableTransitionTimeout);
    this.disableTransitionTimeout = setTimeout(function() {
        e.updateCompactCanvasArrowKeyNavigation();
        document.documentElement.classList.add('bm-canvas-open');
    }, 400);
};

ButterMenu.prototype.closeCompactCanvas = function() {
    let e = this;
    this.keyDownHandler = null;
    this.activeCompactCanvasToggler.focus();
    this.compactCanvasToggler.forEach(function(n, i) {
        n.classList.remove('is-active');
    });
    this.canvasOpen = false;
    this.compactCanvas.classList.add('bm-canvas-transition');
    clearTimeout(this.enableTransitionTimeout);
    this.disableTransitionTimeout = setTimeout(function() {
        e.compactCanvas.classList.remove('bm-canvas-transition');
    }, 250);

    this.compactCanvasToggler.forEach(function(n, i) {
        n.setAttribute('aria-expanded', 'false');
    });

    this.compactCanvas.classList.remove('active');
    this.compactCanvas.setAttribute('aria-hidden', true);
    this.compactBackdrop.classList.remove('active');
    this.container.classList.remove('bm-keyboardfocus-within');
    document.documentElement.classList.remove('bm-canvas-open');
};

ButterMenu.prototype.isMobileViewport = function() {
    return window.innerWidth < parseInt(this.container.getAttribute('data-bm-compact-breakpoint') || 768);
};

ButterMenu.prototype.checkCollision = function() {
    if (!this.isMobileViewport()) {
        if (true === this.compact) {
            let t = document.body.clientWidth,
                e = this.primaryNav.getBoundingClientRect();
            if (e.left + e.width / 2 > t / 2) {
                this.container.classList.remove('compact');
                this.compact = false;
            }
        } else {
            let n = this.primaryNavItem ? this.primaryNavItem.getBoundingClientRect() : {right: 0},
                i = this.secondaryNavItem ? this.secondaryNavItem.getBoundingClientRect() : {left: 0};

            if (n.right > i.left) {
                this.container.classList.add('compact');
                this.compact = true;
            }
        }
    }
};
ButterMenu.prototype.updateDropdownArrowKeyNavigation = function(t, e) {
    let n = this;
    let i = [].slice.call(e.querySelectorAll('a'));
    let p = n.dropdownRoots.indexOf(t);
    let o = 0;
    this.keyDownHandler = function(e) {
        if (9 === e.keyCode) {
            e.preventDefault();

            // focus first dropdown link if dropdown is already opened
            if (e.target === t) {
                i[o].focus();
                return;
            }

            if (event.shiftKey) {
                if (--o < 0) {
                    n.startCloseTimeout();
                    // focus dropdown root
                    n.dropdownRoots[p].focus();
                    return;
                }
            } else {
                if (++o >= i.length) {
                    n.startCloseTimeout();
                    // focus dropdown root
                    n.dropdownRoots[p].focus();
                    return;
                }
            }

            // focus dropdown links
            i[o].focus();
        }
        // close dropdown using escape and focus the dropdown root
        if (27 === e.keyCode) {
            n.startCloseTimeout();
            n.dropdownRoots[p].focus();
        }
    };
};

ButterMenu.prototype.updateCompactCanvasArrowKeyNavigation = function(focusElement) {
    let n = this;
    let i = [].slice.call(this.activeDropdown.visible.querySelectorAll('.bm-link'));
    let o = focusElement ? i.indexOf(focusElement) : 0;

    if ('undefined' !== typeof i[o]) {
        i[o].focus();
    }

    this.keyDownHandler = function(e) {
        // tab
        if (9 === e.keyCode) {
            n.container.classList.add('bm-keyboardfocus-within');
        }
        // arrow-up
        else if (38 === e.keyCode) {
            n.container.classList.add('bm-keyboardfocus-within');
            e.preventDefault();
            --o < 0 && (o += i.length);
            i[o].focus();
        }
        // arrow-down
        else if (40 === e.keyCode) {
            n.container.classList.add('bm-keyboardfocus-within');
            e.preventDefault();
            ++o >= i.length && (o -= i.length);
            i[o].focus();
        }
        // arrow-left
        else if (37 === e.keyCode) {
            n.container.classList.add('bm-keyboardfocus-within');
            e.preventDefault();
            n.compactPrevious();
        }
        // arrow-right
        else if (39 === e.keyCode) {
            n.container.classList.add('bm-keyboardfocus-within');
            let section = n.getPopupSectionFromLink(document.activeElement);
            if (null !== section && null !== section.next) {
                n.compactNext(section, e);
            }
        }
    };
};

ButterMenu.prototype.openDropdown = function(t, e) {
    let n = this;
    if (this.activeDropdown !== t) {
        this.container.classList.add('bm-overlay-active');
        this.container.classList.add('bm-dropdown-active');
        this.activeDropdown = t;
        this.activeDropdown.setAttribute('aria-expanded', 'true');
        this.dropdownRoots.forEach(function(t, e) {
            if (t !== n.activeDropdown) {
                t.classList.remove('bm-active');
                t.setAttribute('aria-expanded', 'false');
            }
        });
        t.classList.add('bm-active');

        let i, o, a, r = t.getAttribute('data-bm-dropdown'), s = 'left';
        this.dropdownSections.forEach(function(c) {
            c.el.classList.remove('bm-active');
            c.el.classList.remove('left');
            c.el.classList.remove('right');
            if (c.name === r) {
                c.el.setAttribute('aria-hidden', 'false');
                c.el.classList.add('bm-active');
                s = 'right';

                let list = c.content.querySelector('ul'),
                    listStyle = window.getComputedStyle(list);

                if ('flex' === listStyle.display && 'column' === listStyle.flexDirection && 'wrap' === listStyle.flexWrap) {
                    let listItems = c.content.querySelectorAll('ul > li'), listItemHeight = 0, breakAt = parseInt(n.container.getAttribute('data-bm-column-min') || 5);

                    if (listItems.length >= breakAt) {

                        for (let lit = 0; lit <= listItems.length; lit++) {
                            let listItem = listItems[lit];

                            listItemHeight += listItem.scrollHeight || listItem.offsetHeight;

                            if (lit + 1 === breakAt) {
                                list.style.maxHeight = listItemHeight + 'px';
                                break;
                            }
                        }
                    }
                }

                i = list.scrollWidth || list.offsetWidth || c.content.scrollWidth || c.content.offsetWidth; // prior scrollWith to support flexbox `colums`
                o = list.scrollHeight || list.offsetHeight || c.content.scrollHeight || c.content.offsetHeight;  // prior scrollHeight to support flexbox `colums`

                if (c.content.getAttribute('data-bm-fixed')) {
                    c.content.setAttribute('data-bm-fixed', true);
                } else {
                    c.content.style.width = i + 'px';
                    c.content.style.height = o + 'px';
                }

                a = c.content;
                e && e.keyboardNavigation && n.updateDropdownArrowKeyNavigation(t, c.el);
            } else {
                c.el.classList.add(s);
                c.el.setAttribute('aria-hidden', 'true');
            }
        });

        let c = i / 380,
            d = o / 400,
            activeNavTextRect = t.lastChild.getBoundingClientRect(),
            containerRect = this.container.getBoundingClientRect(),
            x = (activeNavTextRect.left - containerRect.left + activeNavTextRect.width / 2 - i / 2),
            containerGap = window.innerWidth - containerRect.width,
            minLeft = Math.max(parseInt(this.container.getAttribute('data-bm-min-left') || 15), 0),
            minRight = Math.max(parseInt(this.container.getAttribute('data-bm-bm-min-right') || 15), 0);

        // correct if too far left
        if (containerGap / -2 > x) {
            x = (containerGap / -2 + minLeft);
        } else if ((x + i + containerGap / 2) > document.body.clientWidth) {
            x = document.body.clientWidth - i - containerGap / 2 - minRight;
        }

        x = Math.round(x);

        clearTimeout(this.disableTransitionTimeout);
        this.enableTransitionTimeout = setTimeout(function() {
            n.container.classList.remove('bm-no-dropdown-transition');
        }, 50);
        this.dropdownBackground.style.transform = 'translateX(' + x + 'px) scaleX(' + c + ') scaleY(' + d + ')';
        this.dropdownContainer.style.transform = 'translateX(' + x + 'px)';
        this.dropdownContainer.style.width = i + 'px';
        this.dropdownContainer.style.height = o + 'px';

        let arrowAlignmentOptions = ['left', 'center', 'right'];
        let arrowAlignment = arrowAlignmentOptions[arrowAlignmentOptions.indexOf(this.container.getAttribute('data-bm-arrow-alignment') || 'center')];
        let w = Math.round((activeNavTextRect.left - containerRect.left));

        switch (arrowAlignment) {
            case 'left':
                break;
            case 'center':
                w += activeNavTextRect.width / 2;
                break;
            case 'right':
                w += activeNavTextRect.width;
                break;
        }
        this.dropdownArrow.style.transform = 'translateX(' + w + 'px) rotate(45deg)';
    }
};

ButterMenu.prototype.openOffCanvasDropdown = function(t, e) {
    if (this.activeDropdown !== t) {
        this.container.classList.add('bm-dropdown-active');
        this.activeDropdown = t;
        this.activeDropdown.setAttribute('aria-expanded', 'true');
        this.dropdownRoots.forEach(function(t, e) {
            t.classList.remove('active');
        });
        t.classList.add('active');

        let i, o, a, r = t.getAttribute('data-bm-dropdown');
        this.dropdownSections.forEach(function(c) {
            c.el.classList.remove('active');
            c.el.classList.remove('left');
            c.el.classList.remove('right');
            if (c.name === r) {
                c.el.setAttribute('aria-hidden', 'false');
                c.el.classList.add('active');
            }
        });
    }
};

ButterMenu.prototype.reset = function() {
    // default
    this.activeDropdown = false;
    this.keyDownHandler = null;
    this.closeDropdown();
    clearTimeout(this.disableTransitionTimeout);
    clearTimeout(this.enableTransitionTimeout);

    this.dropdownRoots.forEach(element => {
        element.classList.remove('style');
        element.removeAttribute('style');
        element.setAttribute('aria-expanded', 'false');
    });

    this.dropdownSections.forEach(section => {
        section.el.classList.remove('bm-active');
        section.el.classList.remove('right');
        section.el.setAttribute('aria-hidden', 'true');
    });

    this.container.classList.remove('bm-initialized');
    this.container.classList.remove('bm-overlay-active');
    this.container.classList.remove('bm-dropdown-active');
    this.dropdownBackground.removeAttribute('style');
    this.dropdownContainer.removeAttribute('style');
    this.dropdownArrow.removeAttribute('style');

    // off-canvas
    this.compactCanvasToggler.forEach(function(n, i) {
        n.classList.remove('is-active');
    });
    this.canvasOpen = false;
    this.compactPrevTitle.textContent = '';
    this.compactPrev.disabled = false;
    this.compactPrev.classList.remove('bm-root');
    if (null !== this.compactCanvas) {
        this.compactCanvas.classList.remove('active');
        this.compactCanvas.setAttribute('aria-hidden', false);
    }
    this.compactBackdrop.classList.remove('active');
    this.compactPreviousActiveLink = null;
    this.container.classList.remove('bm-keyboardfocus-within');
    this.activeCompactCanvasToggler = null;
    document.documentElement.classList.remove('bm-canvas-open');
};

ButterMenu.prototype.closeDropdown = function() {
    let t = this;
    if (this.activeDropdown) {
        this.dropdownRoots.forEach(function(t, e) {
            t.classList.remove('bm-active');
            t.setAttribute('aria-expanded', 'false');
        });
        let hiddenElement = this.dropdownContainer.querySelector('[aria-hidden="false"]');

        if (null !== hiddenElement) {
            hiddenElement.setAttribute('aria-hidden', 'true');
        }

        clearTimeout(this.enableTransitionTimeout);

        this.disableTransitionTimeout = setTimeout(function() {
            t.container.classList.add('bm-no-dropdown-transition');
        }, 50);

        this.container.classList.remove('bm-overlay-active');
        this.container.classList.remove('bm-dropdown-active');
        this.activeDropdown = void 0;
        this.keyDownHandler = null;
    }
};
ButterMenu.prototype.toggleDropdown = function(t) {
    this.activeDropdown === t ? this.closeDropdown() : this.openDropdown(t);
};

ButterMenu.prototype.startCloseTimeout = function() {
    let t = this;
    t.closeDropdownTimeout = setTimeout(function() {
        t.closeDropdown();
    }, 150);
};

ButterMenu.prototype.stopCloseTimeout = function() {
    clearTimeout(this.closeDropdownTimeout);
};

(function(ElementProto) {
    if (typeof ElementProto.matches !== 'function') {
        ElementProto.matches = ElementProto.msMatchesSelector || ElementProto.mozMatchesSelector || ElementProto.webkitMatchesSelector || function matches(selector) {
            var element = this;
            var elements = (element.document || element.ownerDocument).querySelectorAll(selector);
            var index = 0;

            while (elements[index] && elements[index] !== element) {
                ++index;
            }

            return Boolean(elements[index]);
        };
    }

    if (typeof ElementProto.closest !== 'function') {
        ElementProto.closest = function closest(selector) {
            var element = this;

            while (element && element.nodeType === 1) {
                if (element.matches(selector)) {
                    return element;
                }

                element = element.parentNode;
            }

            return null;
        };
    }
})(window.Element.prototype);

document.addEventListener('DOMContentLoaded', function() {
    new ButterMenu('.bm-menu');
});

module.exports = ButterMenu;