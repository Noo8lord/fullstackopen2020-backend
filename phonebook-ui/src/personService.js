import axios from "axios"

const baseUrl = '/api/persons'

const update = (id, person) => axios.put(`${baseUrl}/${id}`, person).then(response => response.data)

const remove = id => axios.delete(`${baseUrl}/${id}`).then(response => response.data)

const create = person => axios.post(baseUrl, person).then(response => response.data)

const getAll = () => axios.get(baseUrl).then(response => response.data)

export default { update, remove, create, getAll }