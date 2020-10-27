require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan((tokens, req, res) => {
    const print = [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
    ]

    if (tokens.method(req, res) === 'POST') {
        print.push(JSON.stringify(req.body))
    }

    return print.join(' ')
}))
app.use(express.static('build'))

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        response.json(result)
    })
})

app.get('/info', (request, response) => {
    response.send(
        `<p>Phonebook has info for ${persons.length} people</p>
               <p>${new Date().toString()}</p>`
    )
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    }).catch(() => {
        response.status(404)
            .send(`Person with id '${request.params.id}' not found`)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    Person.deleteOne({_id: request.params.id}).then(() => {
        response.sendStatus(204)
    })
})

app.put('/api/persons/:id', (request, response) => {
    Person.findOneAndUpdate(request.params.id, request.body, {new: true}).then((person) => {
        return response.json(person)
    }).catch(() => {
        return response.status(404)
            .send(`Person with id '${request.params.id}' not found`)
    })
})

app.post('/api/persons', (request, response) => {
    let person = request.body

    if (!person.name) {
        return response.status(400)
            .json({error: 'name is missing'})
    } else if (!person.number) {
        return response.status(400)
            .json({error: 'phone is missing'})
    }

    person = new Person({...person})
    person.save().then(savedPerson => {
        response.status(201)
            .json(savedPerson)
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})