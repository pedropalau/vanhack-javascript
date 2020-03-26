/**
 * This file contains the logic for the VanHack events-like page exercise.
 * 
 * Important: Do not use any of the functions inside this folder for
 * production or big programs because this was implemented only to solve
 * a small exercise for the VanHack recruiting program.
 */

// For this exercise, I implemented a small json-api deployed to ZEIT Now
const API_ENDPOINT = 'https://vanhack-events.now.sh'
const EVENTS_API_ENDPOINT = `${API_ENDPOINT}/events`
const EVENTS_TYPES_API_ENDPOINT = `${API_ENDPOINT}/types`

// Screen size for medium devices
const SCREEN_SIZE_MD = 768

// Constants to create social urls to share events
// Facebook and LinkedIn will not work as expected, because they
// some url properties are deprecated now. The way to do this is using external
// JavaScript and for this exercise I wanted to use only vanilla JavaScript
const SOCIAL_SHARE_LINKEDIN = 'https://www.linkedin.com/shareArticle?mini=true&url=https://vanhack.com&title=[title]&summary=[summary]&source=VanHack'
const SOCIAL_SHARE_FACEBOOK = 'https://www.facebook.com/sharer.php?u=https://vanhack.com&title=[title]&summary=[summary]'
const SOCIAL_SHARE_TWITTER = 'https://twitter.com/intent/tweet?url=https://vanhack.com&text=[summary]&hashtags=vanhack'

/**---------------------------------------------------------------
 * Utilities and functions to be used inside this program,
 * for example to work with XMLHttpRequest.
 * --------------------------------------------------------------- */

 /**
  * Convert the given object to an array of key/valyes
  * 
  * @param {object} o 
  */
const objToArray = o => Object.keys(o).map(k => ({key: k, value: o[k]}))

/**
 * Uppercase the first letter of the string
 * 
 * @param {string} str 
 */
const ucfirst = str => typeof str === 'string' ? (str.charAt(0).toUpperCase() + str.slice(1)) : ''

/**
 * Simple function to format dates for the given format
 * 
 * @param {Date} d 
 * @param {object} f 
 */
const formatDate = (d, f = {month: 'long', day: 'numeric', year: 'numeric'}) => d.toLocaleString('en-US', f)

/**
 * Makes a simple ajax XMLHttpRequest request
 * 
 * @group utilities
 * @param {string} endpoint 
 * @param {object} args 
 */
const ajaxRequest = async (endpoint, args = {}) => {
    const options = {
        headers: {
            // Set utf-8 as the standar encoding format to make
            // request, because I am using this encoding in the
            // json-server with dummy data
            'Content-Type': 'application/json; charset=utf-8',
        },
        ...args,
    }        

    const response = await fetch(endpoint, options)

    // I use JSON format and for now I do not expect another format.
    return await response.json()
}

/**
 * Simple XMLHttpRequest get request
 * @param {string} url 
 */
const get = (url) => {
    return ajaxRequest(url, {
        method: 'GET',
    })
}

/**
 * Adds the given class to the object
 * 
 * @param {object} el 
 * @param {array|string} className 
 */
const addClass = (el, className) => {
    if (typeof(className) === 'string') {
        className = [className]
    }

    className.forEach(c => {
        if (hasClass(el, c) === false) {
            el.className += ` ${c}`
        }
    })
}

/**
 * Removes the given class from the element
 * 
 * @param {object} el 
 * @param {string} className 
 */
const removeClass = (el, className) => {
    if (hasClass(el, className)) {
        el.className = Array.prototype.slice.call(el.classList)
            .filter(c => c !== className)
            .join(' ')
    }
}

/**
 * Check if the given element has the given class
 * 
 * @param {object} el 
 * @param {string} className 
 */
const hasClass = (el, className) => Array.prototype.slice.call(el.classList).includes(className)

/**
 * Adds a property=value to the given element
 * 
 * @param {object} el 
 * @param {string} prop 
 * @param {bool|string} value 
 */
const setProperty = (el, prop, value) => el.setAttribute(prop, value)

/**
 * Removes a property from the given element
 * @param {object} el 
 * @param {string} prop 
 */
const removeProperty = (el, prop) => el.removeAttribute(prop)

/**---------------------------------------------------------------
 * Simple template renderer class
 * --------------------------------------------------------------- */
class Renderer {

    constructor() {
        this.supported = 'content' in document.createElement('template')
    }

    /**
     * Return the element with the selector from the document
     * @param {string} selector 
     */
    getElement(selector, clone = true) {
        if (this.supported === false) {
            // TODO: implement another way to get html content from the document
            throw new Error('HTML template element is not supported in this browser.')
        }

        let el = document.querySelector(selector)
        if (el === null) {
            throw new Error(`The element '${selector}' do not exists in this document.`)
        }

        if (clone) {
            const c = el.cloneNode(true)
            if (c === null) {
                throw new Error(`An error ocurred while clonning the teplate ${id}`)
            }

            return c
        }

        return el
    }

    /**
     * Return an element by it's id
     * 
     * @param {string} id 
     */
    getElementById(id) {
        return this.getElement(`#${id}`)
    }

    /**
     * Return a html template
     * @param {string} id 
     */
    getTemplate(id) {
        const tmpl = this.getElementById(id)
        if (tmpl === null || tmpl.content === null) {
            throw new Error(`No template found for ${id}`)
        }

        return tmpl.content.children[0].cloneNode(true)
    }

    /**
     * Render the specified string
     * 
     * @param {string} tmpl The string template
     * @param {object} args The arguments for the template
     */
    render(tmpl, args = {}) {
        return new Function('return `' + tmpl + '`;').call(args)   
    }
}

const renderer = new Renderer()

/**---------------------------------------------------------------
 * Simple loader spinner representation
 * --------------------------------------------------------------- */
class Loader {

    /**
     * The spinner html id (template source)
     * 
     * @param {string} elementId 
     */
    constructor(elementId = 'spinner') {
        this.elementId = elementId;
        this.element = renderer.getTemplate(this.elementId)
    }

    /**
     * Show the spinner at the specified wrapper
     * 
     * @param {string} wrapperId
     */
    show(wrapperId) {
        let wrapper = document.getElementById(wrapperId)
        if (wrapper === null) {
            // If the element is not available using wrapperId as id, the try
            // selecting the element with query selector
            wrapper = document.querySelector(wrapperId)
        }

        if (wrapper === null) {
            throw new Error(`The wrapper with id=${wrapperId} do not exists in this document.`)
        }

        this.wrapper = wrapper

        this.wrapper.appendChild(this.element)
    }

    /**
     * Hide de spinner removing it from the parent (wrapper)
     */
    hide() {
        if (this.wrapper !== null) {
            this.wrapper.removeChild(this.element);
        }
    }
}

/**---------------------------------------------------------------
 * Modal widget representation
 * --------------------------------------------------------------- */
class Modal {
    constructor(content = null) {
        this.el = renderer.getTemplate('modal')
        this.body = this.el.querySelector('[data-role="modal-content"]')
        this.wrapper = document.body;
        this.isShown = false

        if (content !== null) {
            this.setContent(content)
        }

        // Ensure the modal is hidden
        this.hide()

        this.bindEvents()
    }

    show() {
        if (this.isShown === true) {
            throw new Error('The modal window is already visible')
        }

        removeClass(this.el, 'hidden')
        this.wrapper.appendChild(this.el)

        addClass(document.body, 'overflow-hidden')

        this.isShown = true
    }

    hide() {
        addClass(this.el, 'hidden')
    }

    setContent(content) {
        this.body.appendChild(content)
    }

    close() {
        if (this.isShown === false) {
            throw new Error('The modal window is not visible')
        }

        this.hide()
        this.destroy()

        this.isShown = false
    }

    destroy() {
        this.wrapper.removeChild(this.el)
        removeClass(document.body, 'overflow-hidden')
    }

    bindEvents() {
        const closeButton = this.el.querySelector('[data-dismiss="modal"]')
        closeButton.addEventListener('click', () => this.close())
    }
}

/**---------------------------------------------------------------
 * VanHack user representation
 * --------------------------------------------------------------- */
class User {
    constructor(id, name) {
        this.id = id
        this.name = name
        this.events = []
    }

    /**
     * Add the given event to the list of applied events
     * 
     * @param {int} id 
     */
    applyForEvent(id) {
        if (this.hasApplied(id) === true) {
            throw new Error(`The user has already applied to the given event with id ${id}`)
        }

        this.events.push(id)
    }

    /**
     * Check if the user has applied to the given event
     * 
     * @param {int} id 
     */
    hasApplied(id) {
        return this.events.includes(id)
    }
}

/**---------------------------------------------------------------
 * Event object representation
 * --------------------------------------------------------------- */
class Event {
    constructor() {
        Array.prototype.slice.call(arguments).forEach(i => this[i.key] = i.value)
    }
}

/**---------------------------------------------------------------
 * VanHack events-like application
 * --------------------------------------------------------------- */
class VanHack {

    /**
     * The current user
     * 
     * @param {User} user 
     */
    constructor(user) {
        this.renderer = renderer
        this.selector = '[data-role="events"]'
        this.selectorHighlight = '[data-role="events-highlight"]'
        this.typeSelector = '[data-role="event-types"]'
        this.container = this.renderer.getElement(this.selector, false)
        this.containerHighlight = this.renderer.getElement(this.selectorHighlight, false)
        this.typesContainer = this.renderer.getElement(this.typeSelector, false)
        this.user = user
    }

    load() {
        this.loadEventsTypes()
    }

    loadEventsTypes() {
        get(EVENTS_TYPES_API_ENDPOINT)
            .then(types => {
                if (types === null || types.length === 0) {
                    throw new Error('Invalid events types source')
                }
                this.showTypes(types)
                this.loadEvents()
            })
    }

    loadEvents() {
        get(EVENTS_API_ENDPOINT)
            .then(events => {
                this.showEvents(events)
            })
    }

    /**
     * Return the event type if exists for the given slug
     * 
     * @param {string} slug 
     */
    getTypeBySlug(slug) {
        if ((slug in this.types) === false) {
            return null
        }
        return this.types[slug]
    }

    /**
     * Show (render) all the event types
     * 
     * @param {object} types 
     */
    showTypes(types) {
        this.types = types

        this.typesContainer.innerHTML = ''

        Object.keys(this.types).forEach(k => {
            const type = this.types[k]

            const typeHtml = this.renderType(k, type)

            this.typesContainer.appendChild(typeHtml)
        })
    }

    /**
     * Render the html for the custom type
     * 
     * @param {string} name The name (slug) of the category
     * @param {object} type The object information of the category
     */
    renderType(name, type) {
        const typeHtml = this.renderer.getTemplate('eventType')

        typeHtml.innerHTML = type.name

        addClass(typeHtml, `bg-${type.colors.primary}`)
        addClass(typeHtml, `border-${type.colors.secondary}`)
        addClass(typeHtml, `text-${type.colors.secondary}`)

        addClass(typeHtml, `hover:bg-${type.colors.secondary}`)
        addClass(typeHtml, `hover:text-${type.colors.primary}`)

        setProperty(typeHtml, 'data-type', name)

        typeHtml.addEventListener('click', () => this.filterByType(name))

        return typeHtml
    }

    /**
     * Handler to filter events by type
     * @param {string} name The category name (slug)
     */
    filterByType(name) {
        const type = this.types[name]
        const typeHtml = this.typesContainer.querySelector(`[data-type="${name}"]`)

        if (hasClass(typeHtml, 'active') === false) {
            removeClass(typeHtml, `text-${type.colors.secondary}`)
            removeClass(typeHtml, `bg-${type.colors.primary}`)

            addClass(typeHtml, `text-${type.colors.primary}`)
            addClass(typeHtml, `bg-${type.colors.secondary}`)

            addClass(typeHtml, 'active')
            setProperty(typeHtml, 'data-active', true)
        } else {
            addClass(typeHtml, `text-${type.colors.secondary}`)
            addClass(typeHtml, `bg-${type.colors.primary}`)

            removeClass(typeHtml, `text-${type.colors.primary}`)
            removeClass(typeHtml, `bg-${type.colors.secondary}`)

            removeClass(typeHtml, 'active')
            removeProperty(typeHtml, 'data-active', true)
        }

        this.filterEvents()
    }

    /**
     * Filter events by selected types
     */
    filterEvents() {
        const actives = this.typesContainer.querySelectorAll('[data-active="true"]')
        if (actives !== null && actives.length !== 0) {
            document.body.querySelectorAll('[data-event]').forEach(v => addClass(v, 'hidden'))
            actives.forEach(t => {
                const typeName = t.getAttribute('data-type')
                const events = document.body.querySelectorAll(`[data-event-type="${typeName}"]`)
                events.forEach(v => removeClass(v, 'hidden'))
            })
        } else {
            document.body.querySelectorAll('[data-event]').forEach(v => removeClass(v, 'hidden'))
        }
    }

    /**
     * Return the event of the list for given id
     * @param {int} id 
     */
    getEvent(id) {
        if ((id in this.events) === false) {
            throw new Error(`The event with id ${id} doesn't exists`)
        }
        return this.events[id]
    }

    /**
     * Show the list of events
     * 
     * @param {array} events 
     */
    showEvents(events) {
        if (events === null) {
            throw new Error('Invalid events source')
        }

        this.events = {}

        this.container.innerHTML = ''
        this.containerHighlight.innerHTML = ''
       
        if (events.length) {
            events.forEach(e => {
                e.applied && this.user.applyForEvent(e.id)
                this.events[e.id] = new Event(...objToArray(e))
                this.renderEvent(e.id)
            })
        } else {
            // TODO: show an empty-state message
        }
    }

    /**
     * Show the given event
     * 
     * @param {object} event 
     */
    showEvent(event) {
        const modal = new Modal()
        const view = this.renderer.getTemplate('eventDetails')

        this.renderEventProps(event, view)

        if (event.premium === true) {
            const upgradeButton = view.querySelectorAll('[data-premium="true"]')
            upgradeButton.forEach(b => b.addEventListener('click', () => modal.close()))
            this.processPremiumEvent(event, view)
        } else if (event.applied === true) {
            this.disableEventApplyButton(view)
        }

        this.bindEventEvents(event, view)

        modal.setContent(view)
        modal.show()
    }

    /**
     * Callback to disable/enable apply buttons depending if
     * the event is for premium users or not
     * 
     * @param {Event} event 
     * @param {object} view 
     */
    processPremiumEvent(event, view) {
        const applyNoPremium = view.querySelectorAll('[data-premium="false"]')
        const applyPremiumOnly = view.querySelectorAll('[data-premium="true"]')

        if (event.premium === true) {
            applyNoPremium.forEach(b => addClass(b, 'hidden'))
            applyPremiumOnly.forEach(b => removeClass(b, 'hidden'))
        } else {
            applyPremiumOnly.forEach(b => addClass(b, 'hidden'))
            applyNoPremium.forEach(b => removeClass(b, 'hidden'))
        }
    }

    /**
     * Apply for the given event
     * 
     * @param {object} event 
     */
    applyForEvent(event) {
        if (this.user.hasApplied(event.id) === false) {
            event.applied = true
            this.disableEventApplying(event)
        }
    }
    
    /**
     * Disables the given event for applying
     * 
     * @param {object} event 
     */
    disableEventApplying(event) {
        const eventView = document.querySelectorAll(`[data-event-id="${event.id}"]`)
        if (eventView !== null && eventView.length !== 0) {
            eventView.forEach(v => this.disableEventApplyButton(v))
        }
    }

    /**
     * Disables the apply button for the given event
     * 
     * @param {object} v 
     */
    disableEventApplyButton(v) {
        const applyButton = v.querySelectorAll('[data-action="apply"]')
        if (applyButton !== null && applyButton.length !== 0) {
            applyButton.forEach(b => {
                addClass(b, 'opacity-50 cursor-not-allowed pointer-events-none')
                setProperty(b, 'disabled', true)
            })
        }
    }

    /**
     * Render a specific event
     * 
     * @param {string} id 
     */
    renderEvent(id) {
        const block = this.renderer.getTemplate('eventBlock')
        const event = this.getEvent(id)
        const type = this.getTypeBySlug(event.type)
        
        this.renderEventProps(event, block)

        this.bindEventEvents(event, block)

        event.applied && this.disableEventApplyButton(block)

        this.processPremiumEvent(event, block)

        if (type.highlight === true) {
            this.containerHighlight.appendChild(block)
        } else {
            this.container.appendChild(block)
        }
    }

    /**
     * Renders all the properties of the event that are
     * present in the html view of the event
     * 
     * @param {Event} event 
     * @param {object} view 
     */
    renderEventProps(event, view) {
        const self = this

        Object.keys(event).forEach(k => {
            const e = view.querySelector(`[data-render-prop="${k}"]`)
            if (`renderEvent${ucfirst(k)}` in self) {
                const r = self[`renderEvent${ucfirst(k)}`](event, view, e)
                if (r && e !== null) {
                    e.innerHTML = r
                }
            } else if (e !== null) {
                e.innerHTML = event[k]
            }            
        })

        setProperty(view, 'data-event-id', event.id)
        setProperty(view, 'data-event-type', event.type)
    }

    /**
     * Renders multiple properties of the event
     * 
     * @param {Event} e 
     * @param {object} v 
     */
    renderEventId(e, v) {
        const startMonthHtml = v.querySelector('[data-prop="start-month"]')
        const startDayHtml = v.querySelector('[data-prop="start-day"]')

        if (startMonthHtml !== null) {
            startMonthHtml.innerHTML = formatDate(new Date(e.start), {month: 'long'})
        }

        if (startDayHtml !== null) {
            startDayHtml.innerHTML = formatDate(new Date(e.start), {day: '2-digit'})
        }        

        this.renderEventCategory(e, v)
        this.renderEventDateInfo(e, v)
        this.renderEventSocial(e, v)
    }

    /**
     * Render the event title
     * 
     * @param {Event} e 
     */
    renderEventTitle(e) {
        return e.title
    }

    /**
     * Renders the event thumbnail
     * 
     * @param {Event} e 
     * @param {object} v 
     * @param {object} el 
     */
    renderEventThumbnail(e, v, el) {
        if (el !== null) {
            setProperty(el, 'src', e.thumbnail)
        }
    }

    /**
     * Renders the event content
     * 
     * @param {Event} e 
     */
    renderEventContent(e) {
        return e.description
    }

    /**
     * Renders date information of the event
     * 
     * @param {Event} e 
     * @param {object} v 
     */
    renderEventDateInfo(e, v) {
        const startDate = new Date(e.start)
        const endDate = new Date(e.end)
        const currentDate = new Date()

        const startFormat = {
            month: 'long',
            day: 'numeric',
        }

        if (startDate.getMonth() !== currentDate.getMonth()) {
            startFormat.month = 'long'
        }

        if (startDate.getFullYear() !== currentDate.getFullYear()) {
            startFormat.year = 'numeric'
        }

        const endFormat = { day: 'numeric'}

        if (startDate.getMonth() !== endDate.getMonth()) {
            endFormat.month = 'long'
        }

        if (startDate.getFullYear() !== endDate.getFullYear()) {
            endFormat.year = 'numeric'
        }

        const dateHtml = v.querySelector('[data-prop="date"]')
        if (dateHtml !== null) {
            dateHtml.innerHTML = `This event will take place between ${formatDate(startDate, startFormat)} and ${formatDate(endDate, endFormat)}`
        }
    }

    /**
     * Renders the event category
     * 
     * @param {Event} e 
     * @param {object} v 
     */
    renderEventCategory(e, v) {
        const categoryHtml = v.querySelector('[data-prop="category"]')
        if (categoryHtml !== null) {
            const type = this.getTypeBySlug(e.type)
            if (type) {
                categoryHtml.innerHTML = type.name

                setProperty(v, 'data-event-type', e.type)

                addClass(categoryHtml, `bg-${type.colors.primary}`)
                addClass(categoryHtml, `border-${type.colors.secondary}`)
                addClass(categoryHtml, `text-${type.colors.secondary}`)
            }
        }
    }

    /**
     * Renders the event location information
     * 
     * @param {Event} e 
     */
    renderEventLocation(e) {
        return `${e.location.city}, ${e.location.country}`
    }

    /**
     * Renders the event deadline date
     * 
     * @param {Event} e 
     */
    renderEventDeadline(e) {
        return formatDate(new Date(e.deadline))
    }

    /**
     * Renders the event social links for sharing
     * 
     * @param {Event} e 
     * @param {object} v 
     */
    renderEventSocial(e, v) {
        const facebookShareHtml = v.querySelector('[data-share="facebook"]')
        const linkedinShareHtml = v.querySelector('[data-share="linkedin"]')
        const twitterShareHtml = v.querySelector('[data-share="twitter"]')

        if (facebookShareHtml !== null) {
            setProperty(facebookShareHtml, 'href', this.prepareSocialUrl(e, SOCIAL_SHARE_FACEBOOK))
        }

        if (linkedinShareHtml !== null) {
            setProperty(linkedinShareHtml, 'href', this.prepareSocialUrl(e, SOCIAL_SHARE_LINKEDIN))
        }

        if (twitterShareHtml !== null) {
            setProperty(twitterShareHtml, 'href', this.prepareSocialUrl(e, SOCIAL_SHARE_TWITTER))
        }
    }

    /**
     * This function takes a social url and replace special tokens
     * depending of the properties of the given event
     * 
     * @param {Event} e 
     * @param {string} url 
     */
    prepareSocialUrl(e, url) {
        url = url.replace('[title]', e.title)
        url = url.replace('[summary]', e.summary)

        return url
    }

    /**
     * Binds events for interaction
     * 
     * @param {Event} e 
     * @param {object} v 
     */
    bindEventEvents(e, v) {
        const actionView = v.querySelectorAll('[data-action="view"]')
        const actionApply = v.querySelectorAll('[data-action="apply"]')

        if (actionView !== null && actionView.length !== 0) {
            actionView.forEach(a => a.addEventListener('click', () => this.onViewHandler(e.id)))
        }

        if (actionApply !== null && actionApply.length !== 0) {
            actionApply.forEach(a => a.addEventListener('click', () => this.onApplyHandler(e.id)))
        }
    }

    /**
     * Handler callback executed when the user clicks 'More details'
     * 
     * @param {int} id The event id
     */
    onViewHandler(id) {
        const event = this.getEvent(id)
        this.showEvent(event)
    }

    /**
     * Handler callback executed when the user clicks 'Apply'
     * 
     * @param {int} id The event id
     */
    onApplyHandler(id) {
        const event = this.getEvent(id)

        if (event.premium === true) {
            this.showPremiumNotice(event)
        } else {
            this.applyForEvent(event)
        }
    }

    /**
     * Shows the premium information to the user when wants
     * to apply to a premium event
     * 
     * @param {Event} event 
     */
    showPremiumNotice(event) {
        const premiumNoticeHtml = this.renderer.getTemplate('premiumNotice')
        const premiumButton = premiumNoticeHtml.querySelector('[data-action="go"]')
        const premiumModal = new Modal(premiumNoticeHtml)
        premiumButton.addEventListener('click', () => premiumModal.close())
        premiumModal.show()
    }
}

/**---------------------------------------------------------------
 * Dropdown utilities
 * --------------------------------------------------------------- */

const dropdownElements = []
const dropdownObjects = []

const hasDropdown = el => indexForDropdown(el) !== -1

const indexForDropdown = el => dropdownElements.findIndex(currentEl => currentEl === el)

const getDropdownFor = el => {
    if (hasDropdown(el)) {
        return dropdownElements[indexForDropdown(el)]
    }
}

const registerDropdown = (el, d) => {
    if (hasDropdown(el) === false) {
        dropdownElements.push(el)
        dropdownObjects.push(d)
    }
}

const removeDropdown = el => {
    if (hasDropdown(el) === true) {
        const i = indexForDropdown(el)
        dropdownElements.splice(i, 1)
        dropdownObjects.splice(i, 1)
    }
}

class Dropdown {
    constructor(el) {
        this.el = el
        this.toggle = this.el.querySelector('[data-role="dropdown-toggle"]')
        this.menu = this.el.querySelector('[data-role="dropdown-menu"]')
    }

    show() {
        setProperty(this.toggle, 'aria-expanded', 'true')
        removeClass(this.menu, 'md:hidden')
    }

    hide() {
        setProperty(this.toggle, 'aria-expanded', 'false')
        addClass(this.menu, 'md:hidden')
    }

    destroy() {
        console.log('destroy')
    }

    static initAll() {
        if (window.screen.width >= SCREEN_SIZE_MD) {
            document.querySelectorAll('[data-role="dropdown"]').forEach(el => Dropdown.init(el))   
        }
    }

    static init(el) {
        if (hasDropdown(el) === false) {
            const d = new Dropdown(el)

            el.addEventListener('mouseenter', () => d.show())
            el.addEventListener('mouseleave', () => d.hide())

            registerDropdown(el, d)
        }
    }

    static refresh() {
        document.querySelectorAll('[data-toggle="dropdown"]').forEach(el => {
            if (window.screen.width < SCREEN_SIZE_MD) {
                el.removeEventListener('mouseenter')
                el.removeEventListener('mouseleave')

                if (hasDropdown(el) === true) {
                    getDropdownFor(el).destroy()
                    removeDropdown(el)
                }
            }
        })
    }
}

const u = new User(1, "vanhack")
const v = new VanHack(u)

document.addEventListener('DOMContentLoaded', () => {
    Dropdown.initAll()

    v.load()
})

window.addEventListener('rezie', () => {
    Dropdown.refresh()
})