/**
 * This file contains the logic for the VanHack events-like page exercise.
 * 
 * Important: Do not use any of the functions inside this folder for
 * production or big programs because this was implemented only to solve
 * a small exercise for the VanHack recruiting program.
 */

const API_ENDPOINT = 'https://vanhack-events.now.sh'
const EVENTS_API_ENDPOINT = `${API_ENDPOINT}/events`

/**
 * Utilities and functions to be used inside this program,
 * for example to work with XMLHttpRequest.
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

const get = (url) => {
    return ajaxRequest(url, {
        method: 'GET',
    })
}

class User {
    constructor(id, name) {
        this.id = id
        this.name = name
    }
}

/**
 * VanHack events-like application
 */
class VanHack {
    constructor() {}

    load() {
        this.loadEvents()
    }

    loadEvents() {
        get(EVENTS_API_ENDPOINT).then((events) => console.log(events))
    }
}

const u = new User(1, "vanhack")
const v = new VanHack(u)

document.addEventListener('DOMContentLoaded', () => {    
    v.load()
})