/**
 * This file contains the logic for the VanHack events-like page exercise.
 * 
 * Important: Do not use any of the functions inside this folder for
 * production or big programs because this was implemented only to solve
 * a small exercise for the VanHack recruiting program.
 */

const API_ENDPOINT = 'https://vanhack-events.now.sh'
const EVENTS_API_ENDPOINT = `${API_ENDPOINT}/events`

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
        if (classExists(el, c) === false) {
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
    if (classExists(el, className)) {
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
const classExists = (el, className) => Array.prototype.slice.call(el.classList).includes(className)

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
    constructor() {
        this.el = renderer.getTemplate('modal')
        this.body = this.el.querySelector('[data-role="modal-content"]')
        this.wrapper = document.body;
        this.isShown = false

        // Ensure the modal is hidden
        this.hide()

        this.bindEvents()
    }

    hide() {
        addClass(this.el, 'hidden')
    }

    show() {
        if (this.isShown === true) {
            throw new Error('The modal window is already visible')
        }

        removeClass(this.el, 'hidden')
        this.wrapper.appendChild(this.el)
        this.isShown = true
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
        this.loader = new Loader()
        this.renderer = renderer
        this.selector = '[data-role="events"]'
        this.container = this.renderer.getElement(this.selector, false)
        this.user = user
    }

    showLoader() {
        this.loader.show(this.selector)
    }

    hideLoader() {
        this.loader.hide()
    }

    load() {
        this.showLoader()
        this.loadEvents()
    }

    loadEvents() {
        get(EVENTS_API_ENDPOINT)
            .then((events) => {
                this.showEvents(events)
                this.hideLoader()
            })
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
        if (events === null || events.length === 0) {
            throw new Error('Invalid events source')
        }

        this.events = {}
       
        events.forEach(e => {
            e.applied && this.user.applyForEvent(e.id)
            this.events[e.id] = new Event(...objToArray(e))
            this.renderEvent(e.id)
        })
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

        if (event.applied) {
            this.disableEventApplyButton(view)
        }

        this.bindEvents(event.id, view)

        modal.setContent(view)
        modal.show()
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
        const applyButton = v.querySelector('[data-action="apply"]')
        if (applyButton !== null) {
            addClass(applyButton, 'opacity-50 cursor-not-allowed pointer-events-none')
            setProperty(applyButton, 'disabled', true)
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
        
        this.renderEventProps(event, block)

        this.bindEvents(id, block)

        event.applied && this.disableEventApplyButton(block)

        this.container.appendChild(block)
    }

    renderEventProps(event, view) {
        const self = this

        Object.keys(event).forEach(k => {
            const e = view.querySelector(`[data-render-prop="${k}"]`)
            if (`render${ucfirst(k)}` in self) {
                const r = self[`render${ucfirst(k)}`](event, view, e)
                if (r && e !== null) {
                    e.innerHTML = r
                }
            } else if (e !== null) {
                e.innerHTML = event[k]
            }            
        })

        view.setAttribute('data-event-id', event.id)
    }

    renderId(e, v) {
        const startMonthHtml = v.querySelector('[data-prop="start-month"]')
        const startDayHtml = v.querySelector('[data-prop="start-day"]')

        if (startMonthHtml !== null) {
            startMonthHtml.innerHTML = formatDate(new Date(e.start), {month: 'long'})
        }

        if (startDayHtml !== null) {
            startDayHtml.innerHTML = formatDate(new Date(e.start), {day: '2-digit'})
        }        

        this.renderCategory(e, v)
        this.renderDateInfo(e, v)
    }

    renderTitle(e) {
        return e.title
    }

    renderThumbnail(e, v, el) {
        if (el !== null) {
            setProperty(el, 'src', e.thumbnail)
        }
    }

    renderContent(e) {
        return e.description
    }

    renderDateInfo(e, v) {
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

    renderCategory(e, v) {
        const categoryHtml = v.querySelector('[data-prop="category"]')
        if (categoryHtml !== null) {
            categoryHtml.innerHTML = 'Webinar'
        }
    }

    renderLocation(e) {
        return `${e.location.city}, ${e.location.country}`
    }

    renderDeadline(e) {
        return formatDate(new Date(e.deadline))
    }

    bindEvents(id, v) {
        const actionView = v.querySelector('[data-action="view"]')
        const actionApply = v.querySelector('[data-action="apply"]')

        if (actionView !== null) {
            actionView.addEventListener('click', () => this.onViewHandler(id))
        }

        if (actionApply !== null) {
            actionApply.addEventListener('click', () => this.onApplyHandler(id))
        }
    }

    onViewHandler(id) {
        const event = this.getEvent(id)
        this.showEvent(event)
    }

    onApplyHandler(id) {
        const event = this.getEvent(id)
        this.applyForEvent(event)
    }
}

const u = new User(1, "vanhack")
const v = new VanHack(u)

document.addEventListener('DOMContentLoaded', () => {    
    v.load()
})