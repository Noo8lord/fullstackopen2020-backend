const os = require('os')
const express = require('express')
const morgan = require('morgan')

morgan.token('json', (req) => req.headers['content-type'] == 'application/json' && JSON.stringify(req.body))

app = express()

let persons = [
    { id: 0, name: 'Arto Test 1', number: '43434-343-1'},
    { id: 1, name: 'Arto Test 2', number: '43434-343-2'},
    { id: 2, name: 'Arto Test 3', number: '43434-343-3'}
]
app.use(express.json())
app.use(morgan(':method :url :status :json :res[content-length] - :response-time ms'))
app.use(express.static('build'))

app.get('/', (_, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/info', (_, res) => {
    res.send(`Phonebook has entries for ${persons.length} people.<br />${new Date()}`)
})

app.get('/api/persons', (_, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)
    person && res.json(person) || res.status(404).end()
  })

app.post('/api/persons', (req, res) => {
    const { name, number } = req.body
    if (!name || !number) res.status(400).json({error: 'No name or number.'})
    else if (persons.some( p => p.name === name || p.number === number)) res.status(409).json({error: 'Person with same name or number exists.'})
    else {
        const person = {id: Math.max(...persons.map(p => p.id)) + 1, name, number }
        persons = [...persons, person]
        res.status(201).json(person)
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    if (persons.find(p => p.id === id)) persons = persons.filter(p => p.id !== id)
    res.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
console.log(`Server running on http://${os.hostname()}:${PORT}`)
require('child_process').spawn('open', [`http://${os.hostname()}:${PORT}`])
})