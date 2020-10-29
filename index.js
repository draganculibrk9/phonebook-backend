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
    Person.find({}).then(result => {
        response.send(
            `<p>Phonebook has info for ${result.length} people</p>
               <p>${new Date().toString()}</p>`
        )
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    }).catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.deleteOne({_id: request.params.id}).then(() => {
        response.sendStatus(204)
    }).catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    Person.findOneAndUpdate(request.params.id, request.body, {new: true, runValidators: true})
        .then((person) => {
        response.json(person)
    }).catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const person = new Person(request.body)
    person.save().then(savedPerson => {
        response.status(201)
            .json(savedPerson)
    }).catch((error) => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({error: error.message})
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})