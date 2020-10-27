const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan((tokens, req, res) => {
    console.log(tokens.method(req, res))
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

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    response.send(
        `<p>Phonebook has info for ${persons.length} people</p>
               <p>${new Date().toString()}</p>`
    )
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)

    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404)
            .send(`Person with id '${id}' not found`)
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)

    persons = persons.filter(person => person.id !== id)

    response.status(204)
})

app.post('/api/persons', (request, response) => {
    const person = {...request.body, id: Math.floor(Math.random() * 1000)}

    if (!person.name) {
        return response.status(400)
            .json({error: 'name is missing'})
    } else if (!person.number) {
        return response.status(400)
            .json({error: 'phone is missing'})
    } else if (persons.find(p => p.name === person.name)) {
        return response.status(400)
            .json({error: 'name must be unique'})
    }
    persons = persons.concat(person)

    response.status(201)
        .json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})