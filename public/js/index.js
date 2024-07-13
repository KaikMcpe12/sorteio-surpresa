
//form
const form = document.getElementById('form')
const submitBtn = document.getElementById('btn-form')
//modal
const modal = document.getElementById('modal')
const btnCloseModal = document.getElementById('close-modal')
const btnModal = document.getElementById('btn-modal')

let name = ''
let type = ''
submitBtn.addEventListener('click', (e) => {
    e.preventDefault()
    name = form.nameUser.value
    type = form.typeUser.value

    modal.style.display = 'flex'
})

btnCloseModal.addEventListener('click', (e) => {
    modal.style.display = 'none'
})

btnModal.addEventListener('click', (e) => {
    const idRoom = document.getElementById('id-room').value
    fetch(`http://localhost:3000/${type}/${idRoom}/${name}`)
    // .then(response => response.json)
    // .then(() => {
    //     console.log('Entrando...')
    // })
})
