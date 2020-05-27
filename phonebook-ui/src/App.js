import React, { useState, useEffect } from 'react'
import personService from './personService'
import './index.css'

const Filter = ({onChange, value}) => <p>Filter persons: <input value={value} onChange={onChange} /></p>

const Notification = ({ message, type}) => {
  if (message === null) {
    return null
  }

  return (
    <div className={(type === 'info') ? "info" : 'error'}>
      {message}
    </div>
  )
}

const PersonForm = ({nameValue, nameChangeHandler, numberValue, numberChangeHandler, submitHandler}) => {
    return (
        <form>
        <div>
          name: <input value={nameValue} onChange={nameChangeHandler} />
        </div>
        <div>
          number: <input type="tel" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" value={numberValue} onChange={numberChangeHandler} />
        </div>
        <div>
          <button type="submit" onClick={submitHandler}>add</button>
        </div>
      </form>
    )
}

const Persons = ({persons, personFilter, handleDelete}) => {
    return (
        <>
        {persons.filter(p=>p.name.toLowerCase().includes(personFilter.toLowerCase())).map(p => <p key={p.id}>{p.name} {p.number} <button onClick={handleDelete(p)}>delete</button></p>)}
        </>
    )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [ newName, setNewName ] = useState('')
  const [ newNumber, setNewNumber ] = useState('')
  const [ nameFilter, setNameFilter ] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [infoMessage, setInfoMessage] = useState(null)


  const handleAdd = (event) => {
    event.preventDefault()
    const person = persons.find(p=>(p.name === newName))
    if (!person) {
      personService.create({ name: newName, number: newNumber } )
      .then(person => {setPersons([...persons, person]); return person})
      .then(person => {setInfoMessage(`Added ${person.name}.`); setTimeout(() => setInfoMessage(null),5000)})
      .catch(error => {setErrorMessage(error.message); setTimeout(() => setErrorMessage(null),5000)})
    } else {
        if (window.confirm(`Person ${person.name} already exists, replace?`)) {
          personService.update(person.id, { name: newName, number: newNumber } )
          .then(person => setPersons([...persons.filter(p=>p.id != person.id), person].sort((a,b)=> a.id - b.id)))
          .catch(error => {setErrorMessage(error.message); setTimeout(() => setErrorMessage(null),5000)})
        }
    }
    setNewName('')
    setNewNumber('')
  }

  const handleNameChange = (event) => {
    const name = event.target.value
    setNewName(name)
  }

  const handleDelete = (person) => () => {
    if (window.confirm(`Really remove ${person.name} with id ${person.id} ?`)) {
      personService.remove(person.id)
      .then(() => setPersons(persons => persons.filter(p=> p.id !== person.id)))
      .then(() => {setInfoMessage(`Successfully deleted ${person.name}.`); setTimeout(() => setInfoMessage(null),5000)})
      .catch(({message, response: resp}) => {setErrorMessage((resp && resp.status === 404) ? `Person ${person.name} was already deleted.` : message); if (resp && resp.status === 404) setPersons(persons => persons.filter(p=> p.id !== person.id)); setTimeout(() => setErrorMessage(null),5000)})
    }
  }

  const handleNumberChange = (event) => {
    const number = event.target.value
    setNewNumber(number)
  }

  const handleNameFilter = (event) => {
    const name = event.target.value
    setNameFilter(name)
  }

  useEffect( () => {
    const getAll = async () => {
      let done = false
      while (!done) {
        try {
          const persons = await personService.getAll()
          setPersons(persons)
          done = true
        } catch(error) {
          setErrorMessage(error.message)
          setTimeout(() => setErrorMessage(null),5000)
          done = false
        }
      }
    }
    getAll()
  }, [])

  return (
    <div>
      <Notification message={errorMessage} />
      <Notification message={infoMessage} type="info" />
      <h2>Phonebook</h2>
      <Filter onChange={handleNameFilter} value={nameFilter} />
      <h3>Add new</h3>
      <PersonForm nameValue={newName} nameChangeHandler={handleNameChange} numberValue={newNumber} numberChangeHandler={handleNumberChange} submitHandler={handleAdd} />
      <h3>Numbers</h3>
      <Persons persons={persons} personFilter={nameFilter} handleDelete={handleDelete} />
    </div>
  )
}

export default App